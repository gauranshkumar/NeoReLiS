import { prisma } from '@neorelis/db';
import { ScreeningStatus, ClassificationStatus } from '@prisma/client';
import {
  parseBibtexContent,
  parseCSVContent,
  parseEndnoteContent,
  type ParsedPaper,
  type ParsedAuthor,
  type CSVColumnMapping,
} from './parsers';

// Database column length limits (from Prisma schema)
const DB_LIMITS = {
  authorLastName: 50,
  authorFirstName: 50,
  bibtexKey: 100,
  doi: 100,
  source: 100,
  searchStrategy: 100,
  venueName: 200,
  operationCode: 100,
  additionMode: 50,
} as const;

const BATCH_SIZE = 50;

/**
 * Truncate a string to fit within a database varchar limit
 */
function truncate(value: string | undefined | null, maxLength: number): string | undefined {
  if (!value) return undefined;
  return value.length > maxLength ? value.substring(0, maxLength) : value;
}

/**
 * Truncate and ensure a non-empty string
 */
function truncateRequired(value: string | undefined | null, maxLength: number): string {
  if (!value) return '';
  return value.length > maxLength ? value.substring(0, maxLength) : value;
}

export interface ImportOptions {
  format: 'bibtex' | 'csv' | 'endnote';
  content: string;
  projectId: string;
  userId: string;
  columnMapping?: CSVColumnMapping;
  startRow?: number;
  source?: string;
  searchStrategy?: string;
}

export interface ImportResult {
  imported: number;
  duplicates: number;
  errors: { row?: number; entry?: string; message: string }[];
  importJobId: string;
}

/**
 * Import papers from various formats (BibTeX, CSV, EndNote)
 * Uses batch processing for performance
 */
export async function importPapers(options: ImportOptions): Promise<ImportResult> {
  const { format, content, projectId, userId, columnMapping, startRow, source, searchStrategy } = options;

  // Phase 1: Parse content
  const parseResult = parseContent(format, content, columnMapping, startRow);
  const errors = [...parseResult.errors];

  // Create import job record
  const importJob = await prisma.importJob.create({
    data: {
      projectId,
      filename: `import_${format}_${Date.now()}`,
      fileType: format,
      status: 'PARSING',
      totalRows: parseResult.totalParsed,
      createdBy: userId,
    },
  });

  try {
    // Phase 2: Bulk duplicate detection
    let { nonDuplicates, duplicateCount } = await filterDuplicates(projectId, parseResult.papers);

    if (nonDuplicates.length === 0) {
      await prisma.importJob.update({
        where: { id: importJob.id },
        data: {
          status: 'COMPLETED',
          processedRows: parseResult.papers.length,
          successRows: 0,
          duplicateRows: duplicateCount,
          errorRows: errors.length,
          completedAt: new Date(),
        },
      });

      return {
        imported: 0,
        duplicates: duplicateCount,
        errors,
        importJobId: importJob.id,
      };
    }

    // Phase 3: Batch upsert venues and authors
    const venueMap = await batchUpsertVenues(projectId, nonDuplicates);
    const authorMap = await batchUpsertAuthors(nonDuplicates);

    // Phase 4: Batch insert papers
    const operationCode = truncateRequired(`${userId}_${Date.now()}`, DB_LIMITS.operationCode);
    const { insertedCount, duplicateCount: insertDuplicates, paperAuthorLinks, insertErrors } = await batchInsertPapers(
      projectId,
      userId,
      nonDuplicates,
      venueMap,
      authorMap,
      operationCode,
      source,
      searchStrategy
    );

    errors.push(...insertErrors);
    duplicateCount += insertDuplicates;

    // Phase 5: Batch insert paper-author links
    if (paperAuthorLinks.length > 0) {
      await batchCreatePaperAuthors(paperAuthorLinks);
    }

    // Update import job
    await prisma.importJob.update({
      where: { id: importJob.id },
      data: {
        status: 'COMPLETED',
        processedRows: parseResult.papers.length,
        successRows: insertedCount,
        duplicateRows: duplicateCount,
        errorRows: errors.length,
        errors: errors.length > 0 ? JSON.stringify(errors) : undefined,
        completedAt: new Date(),
      },
    });

    return {
      imported: insertedCount,
      duplicates: duplicateCount,
      errors,
      importJobId: importJob.id,
    };
  } catch (err) {
    await prisma.importJob.update({
      where: { id: importJob.id },
      data: {
        status: 'VALIDATED',
        errors: JSON.stringify([{ message: err instanceof Error ? err.message : 'Import failed' }]),
      },
    });
    throw err;
  }
}

function parseContent(
  format: 'bibtex' | 'csv' | 'endnote',
  content: string,
  columnMapping?: CSVColumnMapping,
  startRow?: number
) {
  switch (format) {
    case 'bibtex':
      return parseBibtexContent(content);
    case 'csv':
      if (!columnMapping) {
        throw new Error('Column mapping is required for CSV import');
      }
      return parseCSVContent(content, columnMapping, startRow ?? 1);
    case 'endnote':
      return parseEndnoteContent(content);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Phase 2: Bulk duplicate detection
 * Fetches existing papers by DOI and title in bulk, then filters in-memory
 */
async function filterDuplicates(
  projectId: string,
  papers: ParsedPaper[]
): Promise<{ nonDuplicates: ParsedPaper[]; duplicateCount: number }> {
  // Collect all DOIs and titles from incoming papers
  const incomingDOIs = new Set<string>();
  const incomingTitles = new Set<string>();

  for (const paper of papers) {
    if (paper.doi) incomingDOIs.add(paper.doi.toLowerCase());
    if (paper.title) incomingTitles.add(paper.title.toLowerCase());
  }

  // Bulk fetch existing papers with matching DOIs
  const existingByDOI = incomingDOIs.size > 0
    ? await prisma.paper.findMany({
        where: {
          projectId,
          active: 1,
          doi: { in: Array.from(incomingDOIs), mode: 'insensitive' },
        },
        select: { doi: true },
      })
    : [];

  const existingDOIs = new Set(existingByDOI.map(p => p.doi?.toLowerCase()).filter(Boolean));

  // Bulk fetch existing papers with matching titles (for author comparison)
  const existingByTitle = incomingTitles.size > 0
    ? await prisma.paper.findMany({
        where: {
          projectId,
          active: 1,
          title: { in: Array.from(incomingTitles), mode: 'insensitive' },
        },
        select: {
          title: true,
          doi: true,
          authors: {
            select: { author: { select: { lastName: true } } },
          },
        },
      })
    : [];

  // Build a map of title -> existing paper data for author comparison
  const existingTitleMap = new Map<string, { doi: string | null; authorLastNames: Set<string> }[]>();
  for (const ep of existingByTitle) {
    const titleKey = ep.title.toLowerCase();
    const authorLastNames = new Set(ep.authors.map(a => a.author.lastName.toLowerCase()));
    if (!existingTitleMap.has(titleKey)) {
      existingTitleMap.set(titleKey, []);
    }
    existingTitleMap.get(titleKey)!.push({ doi: ep.doi, authorLastNames });
  }

  // Filter against DB duplicates
  const dbFiltered: ParsedPaper[] = [];
  let duplicateCount = 0;

  for (const paper of papers) {
    // Check DOI match against DB
    if (paper.doi && existingDOIs.has(paper.doi.toLowerCase())) {
      duplicateCount++;
      continue;
    }

    // Check title + author match against DB
    const titleKey = paper.title.toLowerCase();
    const existingWithTitle = existingTitleMap.get(titleKey);

    if (existingWithTitle) {
      const newAuthorLastNames = new Set(paper.authors.map(a => a.lastName.toLowerCase()));
      let isDuplicate = false;

      for (const existing of existingWithTitle) {
        if (paper.doi && existing.doi && paper.doi.toLowerCase() !== existing.doi.toLowerCase()) {
          continue;
        }

        if (existing.authorLastNames.size === newAuthorLastNames.size) {
          let matchCount = 0;
          for (const name of newAuthorLastNames) {
            if (existing.authorLastNames.has(name)) matchCount++;
          }
          if (matchCount === newAuthorLastNames.size) {
            isDuplicate = true;
            break;
          }
        }
      }

      if (isDuplicate) {
        duplicateCount++;
        continue;
      }
    }

    dbFiltered.push(paper);
  }

  // Intra-file dedup: detect duplicates within the incoming file itself
  const seenDOIs = new Set<string>();
  const seenTitleAuthors = new Set<string>();
  const nonDuplicates: ParsedPaper[] = [];

  for (const paper of dbFiltered) {
    if (paper.doi) {
      const doiKey = paper.doi.toLowerCase();
      if (seenDOIs.has(doiKey)) {
        duplicateCount++;
        continue;
      }
      seenDOIs.add(doiKey);
    }

    const titleAuthorKey = buildTitleAuthorKey(paper);
    if (seenTitleAuthors.has(titleAuthorKey)) {
      duplicateCount++;
      continue;
    }
    seenTitleAuthors.add(titleAuthorKey);

    nonDuplicates.push(paper);
  }

  return { nonDuplicates, duplicateCount };
}

/**
 * Build a normalized key from title + sorted author last names for dedup comparison
 */
function buildTitleAuthorKey(paper: ParsedPaper): string {
  const title = paper.title.toLowerCase().trim();
  const authors = paper.authors
    .map(a => a.lastName.toLowerCase().trim())
    .sort()
    .join(",");
  return `${title}|${authors}`;
}

/**
 * Phase 3A: Batch upsert venues
 * Returns a map of venue name -> venue ID
 */
async function batchUpsertVenues(
  projectId: string,
  papers: ParsedPaper[]
): Promise<Map<string, string>> {
  // Collect unique venue names, normalized (trimmed, deduped case-insensitively)
  const venueNameMap = new Map<string, string>(); // lowercased -> original (first seen form)
  for (const paper of papers) {
    if (paper.venue) {
      const venueName = truncateRequired(paper.venue.trim(), DB_LIMITS.venueName);
      if (venueName) {
        const key = venueName.toLowerCase();
        if (!venueNameMap.has(key)) {
          venueNameMap.set(key, venueName);
        }
      }
    }
  }

  if (venueNameMap.size === 0) {
    return new Map();
  }

  const venueNames = Array.from(venueNameMap.values());

  // Fetch existing venues with case-insensitive match
  const existingVenues = await prisma.venue.findMany({
    where: {
      projectId,
      name: { in: venueNames, mode: 'insensitive' },
    },
    select: { id: true, name: true },
  });

  // Map: lowercased name -> venue ID (so lookups from papers are case-insensitive)
  const venueMap = new Map<string, string>();
  const existingLowerNames = new Set<string>();

  for (const v of existingVenues) {
    venueMap.set(v.name.toLowerCase(), v.id);
    existingLowerNames.add(v.name.toLowerCase());
  }

  // Create missing venues in a single transaction
  const missingVenues = venueNames.filter(name => !existingLowerNames.has(name.toLowerCase()));

  if (missingVenues.length > 0) {
    const created = await prisma.$transaction(
      missingVenues.map(name =>
        prisma.venue.create({
          data: { projectId, name },
          select: { id: true, name: true },
        })
      )
    );

    for (const v of created) {
      venueMap.set(v.name.toLowerCase(), v.id);
    }
  }

  return venueMap;
}

/**
 * Phase 3B: Batch upsert authors
 * Returns a map of "lastName|firstName" -> author ID
 */
async function batchUpsertAuthors(papers: ParsedPaper[]): Promise<Map<string, string>> {
  // Collect unique authors
  const uniqueAuthors = new Map<string, { lastName: string; firstName: string | null }>();

  for (const paper of papers) {
    for (const author of paper.authors) {
      const lastName = truncateRequired(author.lastName, DB_LIMITS.authorLastName);
      const firstName = truncate(author.firstName, DB_LIMITS.authorFirstName) || null;
      if (!lastName) continue;

      const key = `${lastName}|${firstName || ''}`;
      if (!uniqueAuthors.has(key)) {
        uniqueAuthors.set(key, { lastName, firstName });
      }
    }
  }

  if (uniqueAuthors.size === 0) {
    return new Map();
  }

  const authorMap = new Map<string, string>();

  // Process in batches to avoid query size limits
  const authorEntries = Array.from(uniqueAuthors.entries());

  for (let i = 0; i < authorEntries.length; i += BATCH_SIZE) {
    const batch = authorEntries.slice(i, i + BATCH_SIZE);

    // Build OR conditions for this batch
    const conditions = batch.map(([, author]) => ({
      lastName: author.lastName,
      firstName: author.firstName,
    }));

    // Fetch existing authors
    const existing = await prisma.author.findMany({
      where: { OR: conditions },
      select: { id: true, lastName: true, firstName: true },
    });

    const existingKeys = new Set<string>();
    for (const a of existing) {
      const key = `${a.lastName}|${a.firstName || ''}`;
      authorMap.set(key, a.id);
      existingKeys.add(key);
    }

    // Create missing authors
    const toCreate = batch.filter(([key]) => !existingKeys.has(key));

    if (toCreate.length > 0) {
      const created = await prisma.$transaction(
        toCreate.map(([, author]) =>
          prisma.author.create({
            data: { lastName: author.lastName, firstName: author.firstName },
            select: { id: true, lastName: true, firstName: true },
          })
        )
      );

      for (const a of created) {
        const key = `${a.lastName}|${a.firstName || ''}`;
        authorMap.set(key, a.id);
      }
    }
  }

  return authorMap;
}

/**
 * Phase 4: Batch insert papers
 * Returns inserted count and paper-author links to create
 */
async function batchInsertPapers(
  projectId: string,
  userId: string,
  papers: ParsedPaper[],
  venueMap: Map<string, string>,
  authorMap: Map<string, string>,
  operationCode: string,
  source?: string,
  searchStrategy?: string
): Promise<{
  insertedCount: number;
  duplicateCount: number;
  paperAuthorLinks: { paperId: string; authorId: string; order: number }[];
  insertErrors: { row?: number; entry?: string; message: string }[];
}> {
  // Generate unique bibtex keys
  const usedKeys = new Set<string>();
  let duplicateCount = 0;

  // Fetch existing keys for this project
  const existingKeys = await prisma.paper.findMany({
    where: { projectId },
    select: { bibtexKey: true },
  });
  for (const p of existingKeys) {
    if (p.bibtexKey) usedKeys.add(p.bibtexKey.toLowerCase());
  }

  // Prepare paper data
  interface PaperToInsert {
    data: {
      projectId: string;
      bibtexKey: string;
      title: string;
      abstract?: string;
      preview?: string;
      bibtex?: string;
      year?: number;
      doi?: string;
      venueId?: string;
      source: string;
      searchStrategy?: string;
      addedBy: string;
      additionMode: string;
      operationCode: string;
      screeningStatus: ScreeningStatus;
      classificationStatus: ClassificationStatus;
    };
    authors: { lastName: string; firstName: string | null }[];
    originalIndex: number;
    bibtexEntry?: string;
  }

  const papersToInsert: PaperToInsert[] = [];
  const insertErrors: { row?: number; entry?: string; message: string }[] = [];

  for (let i = 0; i < papers.length; i++) {
    const paper = papers[i];
    if (!paper) continue;

    try {
      // Generate unique bibtex key (case-insensitive comparison)
      let bibtexKey = truncateRequired(paper.bibtexKey || generateBibtexKey(paper), DB_LIMITS.bibtexKey);

      // Ensure uniqueness using lowercased comparison
      let keyAttempt = 0;
      const originalKey = bibtexKey;
      while (usedKeys.has(bibtexKey.toLowerCase())) {
        keyAttempt++;
        const suffix = `_${keyAttempt}`;
        const maxBaseLength = DB_LIMITS.bibtexKey - suffix.length;
        bibtexKey = originalKey.substring(0, maxBaseLength) + suffix;
      }
      usedKeys.add(bibtexKey.toLowerCase());

      // Get venue ID
      let venueId: string | undefined;
      if (paper.venue) {
        const venueName = truncateRequired(paper.venue.trim(), DB_LIMITS.venueName);
        venueId = venueMap.get(venueName.toLowerCase());
      }

      papersToInsert.push({
        data: {
          projectId,
          bibtexKey,
          title: paper.title,
          abstract: paper.abstract,
          preview: paper.preview,
          bibtex: paper.bibtex,
          year: paper.year,
          doi: truncate(paper.doi, DB_LIMITS.doi),
          venueId,
          source: truncate(source, DB_LIMITS.source) || 'import',
          searchStrategy: truncate(searchStrategy, DB_LIMITS.searchStrategy),
          addedBy: userId,
          additionMode: 'import',
          operationCode,
          screeningStatus: ScreeningStatus.PENDING,
          classificationStatus: ClassificationStatus.WAITING,
        },
        authors: paper.authors.map(a => ({
          lastName: truncateRequired(a.lastName, DB_LIMITS.authorLastName),
          firstName: truncate(a.firstName, DB_LIMITS.authorFirstName) || null,
        })),
        originalIndex: i,
        bibtexEntry: paper.bibtexKey,
      });
    } catch (err) {
      insertErrors.push({
        row: i + 1,
        entry: paper.bibtexKey,
        message: err instanceof Error ? err.message : 'Failed to prepare paper',
      });
    }
  }

  // Insert papers in batches
  const paperAuthorLinks: { paperId: string; authorId: string; order: number }[] = [];
  let insertedCount = 0;

  for (let i = 0; i < papersToInsert.length; i += BATCH_SIZE) {
    const batch = papersToInsert.slice(i, i + BATCH_SIZE);

    try {
      // Use transaction to insert batch
      const created = await prisma.$transaction(
        batch.map(p => prisma.paper.create({ data: p.data, select: { id: true } }))
      );

      // Build paper-author links
      for (let j = 0; j < created.length; j++) {
        const createdPaper = created[j];
        const paperData = batch[j];
        if (!createdPaper || !paperData) continue;

        const paperId = createdPaper.id;
        insertedCount++;

        for (let order = 0; order < paperData.authors.length; order++) {
          const author = paperData.authors[order];
          if (!author || !author.lastName) continue;

          const authorKey = `${author.lastName}|${author.firstName || ''}`;
          const authorId = authorMap.get(authorKey);

          if (authorId) {
            paperAuthorLinks.push({ paperId, authorId, order: order + 1 });
          }
        }
      }
    } catch (err) {
      // If batch fails, try individual inserts to identify problematic papers
      for (const paper of batch) {
        try {
          const created = await prisma.paper.create({
            data: paper.data,
            select: { id: true },
          });
          insertedCount++;

          for (let order = 0; order < paper.authors.length; order++) {
            const author = paper.authors[order];
            if (!author || !author.lastName) continue;

            const authorKey = `${author.lastName}|${author.firstName || ''}`;
            const authorId = authorMap.get(authorKey);

            if (authorId) {
              paperAuthorLinks.push({ paperId: created.id, authorId, order: order + 1 });
            }
          }
        } catch (individualErr) {
          const errMsg = individualErr instanceof Error ? individualErr.message : '';
          // Treat unique constraint violations on bibtexKey as duplicates, not errors
          if (errMsg.includes('Unique constraint') && errMsg.includes('bibtexKey')) {
            duplicateCount++;
          } else {
            insertErrors.push({
              row: paper.originalIndex + 1,
              entry: paper.bibtexEntry,
              message: errMsg || 'Failed to insert paper',
            });
          }
        }
      }
    }
  }

  return { insertedCount, duplicateCount, paperAuthorLinks, insertErrors };
}

/**
 * Phase 5: Batch create paper-author links
 */
async function batchCreatePaperAuthors(
  links: { paperId: string; authorId: string; order: number }[]
): Promise<void> {
  // Insert in batches
  for (let i = 0; i < links.length; i += BATCH_SIZE * 2) {
    const batch = links.slice(i, i + BATCH_SIZE * 2);
    await prisma.paperAuthor.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }
}

/**
 * Generate a bibtex key from paper metadata
 */
function generateBibtexKey(paper: ParsedPaper): string {
  const yearPart = paper.year ? String(paper.year) : 'unknown';
  const firstAuthor = paper.authors[0];

  if (firstAuthor) {
    const lastName = firstAuthor.lastName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    return `${lastName}_${yearPart}`;
  }

  const titlePart = paper.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 20);
  return `${titlePart}_${yearPart}`;
}

/**
 * Get import job details
 */
export async function getImportJob(jobId: string) {
  return prisma.importJob.findUnique({
    where: { id: jobId },
  });
}

/**
 * List import jobs for a project
 */
export async function listImportJobs(projectId: string) {
  return prisma.importJob.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}
