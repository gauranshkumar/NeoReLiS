import type { ParsedPaper, ParsedAuthor, ParseResult, ParseError } from './types';

/**
 * RIS/EndNote format field tags
 * Reference: https://en.wikipedia.org/wiki/RIS_(file_format)
 */
const RIS_TAGS = {
  TYPE: 'TY',
  END: 'ER',
  TITLE: 'TI',
  TITLE_ALT: 'T1',
  AUTHOR: 'AU',
  AUTHOR_ALT: 'A1',
  YEAR: 'PY',
  YEAR_ALT: 'Y1',
  ABSTRACT: 'AB',
  ABSTRACT_ALT: 'N2',
  DOI: 'DO',
  URL: 'UR',
  JOURNAL: 'JO',
  JOURNAL_ALT: 'JF',
  JOURNAL_T2: 'T2',
  VOLUME: 'VL',
  ISSUE: 'IS',
  PAGES_START: 'SP',
  PAGES_END: 'EP',
  KEYWORDS: 'KW',
  ID: 'ID',
  LABEL: 'LB',
} as const;

interface RISEntry {
  [key: string]: string[];
}

/**
 * Parse EndNote/RIS content into normalized paper objects
 * Matches legacy ReLiS behavior from importendnotestringforrelis
 */
export function parseEndnoteContent(content: string): ParseResult {
  const papers: ParsedPaper[] = [];
  const errors: ParseError[] = [];

  const entries = parseRISEntries(content);

  let entryIndex = 0;
  for (const entry of entries) {
    entryIndex++;
    try {
      const paper = convertRISEntry(entry, entryIndex);
      if (paper) {
        papers.push(paper);
      } else {
        errors.push({
          entry: `Entry ${entryIndex}`,
          message: 'Missing required title field',
        });
      }
    } catch (err) {
      errors.push({
        entry: `Entry ${entryIndex}`,
        message: err instanceof Error ? err.message : 'Failed to parse entry',
      });
    }
  }

  return {
    papers,
    errors,
    totalParsed: entries.length,
  };
}

/**
 * Parse RIS format into structured entries
 * Each entry starts with TY and ends with ER
 */
function parseRISEntries(content: string): RISEntry[] {
  const entries: RISEntry[] = [];
  let currentEntry: RISEntry | null = null;

  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // RIS format: "TAG  - VALUE" or "TAG - VALUE"
    const match = trimmed.match(/^([A-Z][A-Z0-9])\s*-\s*(.*)$/);
    if (!match) continue;

    const tag = match[1];
    const value = match[2] ?? '';

    if (!tag) continue;

    if (tag === RIS_TAGS.TYPE) {
      // Start new entry
      currentEntry = { [tag]: [value] };
    } else if (tag === RIS_TAGS.END && currentEntry) {
      // End current entry
      entries.push(currentEntry);
      currentEntry = null;
    } else if (currentEntry) {
      // Add field to current entry
      if (!currentEntry[tag]) {
        currentEntry[tag] = [];
      }
      currentEntry[tag].push(value);
    }
  }

  // Handle entry without closing ER tag
  if (currentEntry && Object.keys(currentEntry).length > 1) {
    entries.push(currentEntry);
  }

  return entries;
}

function convertRISEntry(entry: RISEntry, index: number): ParsedPaper | null {
  const title = getFirstValue(entry, [RIS_TAGS.TITLE, RIS_TAGS.TITLE_ALT]);
  if (!title) {
    return null;
  }

  const authors = parseRISAuthors(entry);
  const year = parseRISYear(entry);
  const abstract = getFirstValue(entry, [RIS_TAGS.ABSTRACT, RIS_TAGS.ABSTRACT_ALT]);
  const doi = getFirstValue(entry, [RIS_TAGS.DOI]);
  const url = getFirstValue(entry, [RIS_TAGS.URL]);
  const venue = getVenue(entry);
  const keywords = getAllValues(entry, [RIS_TAGS.KEYWORDS]).join('; ');
  const bibtexKey = getFirstValue(entry, [RIS_TAGS.ID, RIS_TAGS.LABEL]) || `entry_${index}`;

  const preview = generateRISPreview(title, authors, year, venue);

  return {
    bibtexKey: cleanString(bibtexKey),
    title: cleanString(title),
    authors,
    abstract: abstract ? cleanString(abstract) : undefined,
    year,
    doi: doi ? cleanString(doi) : undefined,
    url: url ? cleanString(url) : undefined,
    venue: venue ? cleanString(venue) : undefined,
    keywords: keywords ? cleanString(keywords) : undefined,
    preview,
  };
}

function getFirstValue(entry: RISEntry, tags: string[]): string | undefined {
  for (const tag of tags) {
    if (entry[tag] && entry[tag].length > 0) {
      return entry[tag][0];
    }
  }
  return undefined;
}

function getAllValues(entry: RISEntry, tags: string[]): string[] {
  const values: string[] = [];
  for (const tag of tags) {
    if (entry[tag]) {
      values.push(...entry[tag]);
    }
  }
  return values;
}

function parseRISAuthors(entry: RISEntry): ParsedAuthor[] {
  const authors: ParsedAuthor[] = [];
  const authorValues = getAllValues(entry, [RIS_TAGS.AUTHOR, RIS_TAGS.AUTHOR_ALT]);

  let order = 1;
  for (const authorStr of authorValues) {
    const author = parseRISAuthorName(authorStr);
    if (author) {
      authors.push({ ...author, order: order++ });
    }
  }

  return authors;
}

/**
 * Parse RIS author format: "LastName, FirstName" or "FirstName LastName"
 */
function parseRISAuthorName(name: string): { firstName: string; lastName: string } | null {
  const cleaned = name.trim();
  if (!cleaned) return null;

  if (cleaned.includes(',')) {
    // "LastName, FirstName" format
    const [lastName, firstName] = cleaned.split(',', 2).map((s) => s.trim());
    return { firstName: firstName || '', lastName: lastName || '' };
  }

  // "FirstName LastName" format
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: '', lastName: parts[0] || '' };
  }

  const lastName = parts.pop() ?? '';
  const firstName = parts.join(' ');
  return { firstName, lastName };
}

function parseRISYear(entry: RISEntry): number | undefined {
  const yearStr = getFirstValue(entry, [RIS_TAGS.YEAR, RIS_TAGS.YEAR_ALT]);
  if (!yearStr) return undefined;

  // RIS year format can be "YYYY" or "YYYY/MM/DD" or "YYYY/MM"
  const match = yearStr.match(/^(\d{4})/);
  if (!match || !match[1]) return undefined;

  const year = parseInt(match[1], 10);
  return isNaN(year) ? undefined : year;
}

function getVenue(entry: RISEntry): string | undefined {
  return getFirstValue(entry, [
    RIS_TAGS.JOURNAL,
    RIS_TAGS.JOURNAL_ALT,
    RIS_TAGS.JOURNAL_T2,
  ]);
}

function generateRISPreview(
  title: string,
  authors: ParsedAuthor[],
  year: number | undefined,
  venue: string | undefined
): string {
  const parts: string[] = [];

  if (authors.length > 0) {
    const authorStr = authors.map((a) => `${a.lastName}, ${a.firstName}`).join('; ');
    parts.push(authorStr);
  }

  if (year) {
    parts.push(`(${year})`);
  }

  parts.push(cleanString(title));

  if (venue) {
    parts.push(`In: ${venue}`);
  }

  return parts.join('. ');
}

function cleanString(str: string): string {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}
