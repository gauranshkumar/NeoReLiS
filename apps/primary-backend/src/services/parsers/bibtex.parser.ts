import { parse as parseBibtex } from '@retorquere/bibtex-parser';
import type { ParsedPaper, ParsedAuthor, ParseResult, ParseError } from './types';

/**
 * Parse BibTeX content into normalized paper objects.
 * Splits the file into individual entries and parses each independently,
 * so corrupted entries produce errors while valid ones are still imported.
 */
export function parseBibtexContent(content: string): ParseResult {
  const papers: ParsedPaper[] = [];
  const errors: ParseError[] = [];

  const startIdx = content.indexOf('@');
  if (startIdx === -1) {
    return {
      papers: [],
      errors: [{ message: 'File is corrupted — no valid BibTeX entries detected' }],
      totalParsed: 0,
    };
  }

  const cleanedContent = content.substring(startIdx);

  // Split into individual entries at each @type{ boundary
  const rawEntries = cleanedContent
    .split(/(?=@\w+\s*\{)/)
    .filter(s => s.trim().length > 0);

  if (rawEntries.length === 0) {
    return {
      papers: [],
      errors: [{ message: 'File is corrupted — no valid BibTeX entries detected' }],
      totalParsed: 0,
    };
  }

  for (let i = 0; i < rawEntries.length; i++) {
    const raw = rawEntries[i]!;

    // Extract key from raw text for error reporting
    const keyMatch = raw.match(/@\w+\s*\{\s*([^,\s]*)/);
    const entryKey = keyMatch?.[1] || `entry_${i + 1}`;

    // Skip @comment, @preamble, @string entries
    if (/^@(comment|preamble|string)\s*\{/i.test(raw)) {
      continue;
    }

    try {
      const result = parseBibtex(raw, { verbatimFields: ['abstract', 'keywords'] });

      for (const entry of result.entries) {
        try {
          const paper = convertBibtexEntry(entry);
          if (paper) {
            papers.push(paper);
          }
        } catch (err) {
          errors.push({
            entry: entry.key || entryKey,
            message: err instanceof Error ? err.message : 'Failed to convert entry',
          });
        }
      }
    } catch {
      errors.push({
        entry: entryKey,
        message: `Invalid BibTeX syntax (entry: ${entryKey})`,
      });
    }
  }

  // If nothing could be parsed at all, report the file as fully corrupted
  if (papers.length === 0 && errors.length > 0) {
    return {
      papers: [],
      errors: [{ message: 'File is corrupted — all entries have invalid BibTeX syntax' }],
      totalParsed: rawEntries.length,
    };
  }

  return { papers, errors, totalParsed: rawEntries.length };
}

function convertBibtexEntry(entry: any): ParsedPaper | null {
  const title = extractField(entry, 'title');
  if (!title) {
    return null;
  }

  const authors = parseAuthors(entry.creators || []);
  const year = extractYear(entry);
  const abstract = extractField(entry, 'abstract');
  const doi = extractDoi(entry);
  const url = extractField(entry, 'url') || extractField(entry, 'paper');
  const venue = extractVenue(entry);
  const keywords = extractField(entry, 'keywords');

  // Generate preview text (formatted citation)
  const preview = generatePreview(entry, authors, year, venue);

  // Reconstruct bibtex string for storage
  const bibtex = reconstructBibtex(entry);

  return {
    bibtexKey: cleanString(entry.key),
    title: cleanString(title),
    authors,
    abstract: abstract ? cleanString(abstract) : undefined,
    year,
    doi: doi ? cleanString(doi) : undefined,
    url: url ? cleanString(url) : undefined,
    venue: venue ? cleanString(venue) : undefined,
    keywords: keywords ? cleanString(keywords) : undefined,
    bibtex,
    preview,
  };
}

function extractField(entry: any, field: string): string | undefined {
  const value = entry.fields?.[field];
  if (!value) return undefined;
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function extractYear(entry: any): number | undefined {
  const yearField = entry.fields?.year;
  if (!yearField) return undefined;
  const year = parseInt(String(yearField), 10);
  return isNaN(year) ? undefined : year;
}

function extractDoi(entry: any): string | undefined {
  return extractField(entry, 'doi') || extractField(entry, 'DOI');
}

function extractVenue(entry: any): string | undefined {
  return (
    extractField(entry, 'journal') ||
    extractField(entry, 'booktitle') ||
    extractField(entry, 'publisher')
  );
}

function parseAuthors(creators: any[]): ParsedAuthor[] {
  const authors: ParsedAuthor[] = [];
  let order = 1;

  for (const creator of creators) {
    if (creator.creatorType === 'author' || !creator.creatorType) {
      const firstName = cleanString(creator.firstName || creator.given || '');
      const lastName = cleanString(creator.lastName || creator.family || creator.literal || '');

      if (lastName || firstName) {
        authors.push({
          firstName,
          lastName,
          order: order++,
        });
      }
    }
  }

  return authors;
}

function generatePreview(
  entry: any,
  authors: ParsedAuthor[],
  year: number | undefined,
  venue: string | undefined
): string {
  const parts: string[] = [];

  // Authors
  if (authors.length > 0) {
    const authorStr = authors.map((a) => `${a.lastName}, ${a.firstName}`).join('; ');
    parts.push(authorStr);
  }

  // Year
  if (year) {
    parts.push(`(${year})`);
  }

  // Title
  const title = extractField(entry, 'title');
  if (title) {
    parts.push(cleanString(title));
  }

  // Venue
  if (venue) {
    parts.push(`In: ${venue}`);
  }

  // Volume/Pages
  const volume = extractField(entry, 'volume');
  const pages = extractField(entry, 'pages');
  if (volume || pages) {
    const volPages = [volume, pages].filter(Boolean).join(':');
    parts.push(volPages);
  }

  return parts.join('. ');
}

function reconstructBibtex(entry: any): string {
  const type = entry.type || 'misc';
  const key = entry.key || 'unknown';
  const fields: string[] = [];

  for (const [fieldName, fieldValue] of Object.entries(entry.fields || {})) {
    if (fieldValue !== undefined && fieldValue !== null) {
      const value = Array.isArray(fieldValue) ? fieldValue.join(' and ') : String(fieldValue);
      fields.push(`  ${fieldName} = {${value}}`);
    }
  }

  // Add authors if present
  if (entry.creators && entry.creators.length > 0) {
    const authorStr = entry.creators
      .filter((c: any) => c.creatorType === 'author' || !c.creatorType)
      .map((c: any) => {
        if (c.literal) return c.literal;
        return `${c.lastName || ''}, ${c.firstName || ''}`.trim();
      })
      .join(' and ');
    if (authorStr) {
      fields.push(`  author = {${authorStr}}`);
    }
  }

  return `@${type}{${key},\n${fields.join(',\n')}\n}`;
}

function cleanString(str: string): string {
  if (!str) return '';
  return str
    .replace(/\{/g, '')
    .replace(/\}/g, '')
    .replace(/\\/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
