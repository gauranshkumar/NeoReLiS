import Papa, { type ParseResult as PapaParseResult } from 'papaparse';
import type { ParsedPaper, ParsedAuthor, ParseResult, ParseError, CSVColumnMapping } from './types';

/**
 * Parse CSV content with configurable column mapping
 * Matches legacy ReLiS behavior from import_papers_save_csv
 */
export function parseCSVContent(
  content: string,
  mapping: CSVColumnMapping,
  startRow: number = 1
): ParseResult {
  const papers: ParsedPaper[] = [];
  const errors: ParseError[] = [];

  const parseResult: PapaParseResult<string[]> = Papa.parse(content, {
    header: false,
    skipEmptyLines: true,
  });

  if (parseResult.errors && parseResult.errors.length > 0) {
    for (const error of parseResult.errors) {
      errors.push({
        row: error.row,
        message: error.message,
      });
    }
  }

  const rows = parseResult.data || [];
  let parsedCount = 0;

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    parsedCount++;

    try {
      const paper = convertCSVRow(row, mapping, i + 1);
      if (paper) {
        papers.push(paper);
      } else {
        errors.push({
          row: i + 1,
          message: 'Missing required title field',
        });
      }
    } catch (err) {
      errors.push({
        row: i + 1,
        message: err instanceof Error ? err.message : 'Failed to parse row',
      });
    }
  }

  return {
    papers,
    errors,
    totalParsed: parsedCount,
  };
}

/**
 * Preview CSV content - returns first N rows for column mapping UI
 */
export function previewCSV(
  content: string,
  maxRows: number = 10
): { headers: string[]; rows: string[][] } {
  const parseResult: PapaParseResult<string[]> = Papa.parse(content, {
    header: false,
    skipEmptyLines: true,
    preview: maxRows + 1,
  });

  const allRows = parseResult.data || [];
  const firstRow = allRows[0];
  const headers = firstRow ? firstRow.map((_, i) => `Field ${i + 1}`) : [];

  return {
    headers,
    rows: allRows.slice(0, maxRows + 1),
  };
}

/**
 * Generate CSV template with expected headers
 */
export function generateCSVTemplate(): string {
  const headers = [
    'title',
    'authors',
    'year',
    'doi',
    'abstract',
    'bibtex_key',
    'url',
    'keywords',
    'venue',
  ];
  return headers.join(',');
}

function convertCSVRow(row: string[], mapping: CSVColumnMapping, rowNum: number): ParsedPaper | null {
  const getValue = (colIndex: number | undefined): string | undefined => {
    if (colIndex === undefined || colIndex < 0 || colIndex >= row.length) {
      return undefined;
    }
    const value = row[colIndex]?.trim();
    return value || undefined;
  };

  const title = getValue(mapping.title);
  if (!title) {
    return null;
  }

  const authorsStr = getValue(mapping.authors);
  const authors = authorsStr ? parseCSVAuthors(authorsStr) : [];

  const yearStr = getValue(mapping.year);
  const year = yearStr ? parseInt(yearStr, 10) : undefined;

  return {
    bibtexKey: getValue(mapping.bibtexKey),
    title: cleanCSVValue(title),
    authors,
    abstract: getValue(mapping.abstract) ? cleanCSVValue(getValue(mapping.abstract)!) : undefined,
    year: year && !isNaN(year) ? year : undefined,
    doi: getValue(mapping.doi) ? cleanCSVValue(getValue(mapping.doi)!) : undefined,
    url: getValue(mapping.url) ? cleanCSVValue(getValue(mapping.url)!) : undefined,
    venue: getValue(mapping.venue) ? cleanCSVValue(getValue(mapping.venue)!) : undefined,
    keywords: getValue(mapping.keywords) ? cleanCSVValue(getValue(mapping.keywords)!) : undefined,
    preview: generateCSVPreview(title, authors, year),
  };
}

/**
 * Parse authors from various CSV formats:
 * - "John Doe, Jane Smith" (comma-separated)
 * - "John Doe; Jane Smith" (semicolon-separated)
 * - "Doe, John and Smith, Jane" (BibTeX-style)
 */
function parseCSVAuthors(authorsStr: string): ParsedAuthor[] {
  const authors: ParsedAuthor[] = [];
  let order = 1;

  // Detect separator
  let separator = ',';
  if (authorsStr.includes(' and ')) {
    separator = ' and ';
  } else if (authorsStr.includes(';')) {
    separator = ';';
  }

  const parts = authorsStr.split(separator).map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    const author = parseAuthorName(part);
    if (author) {
      authors.push({ ...author, order: order++ });
    }
  }

  return authors;
}

/**
 * Parse a single author name
 * Handles: "John Doe", "Doe, John", "J. Doe"
 */
function parseAuthorName(name: string): { firstName: string; lastName: string } | null {
  const cleaned = name.trim();
  if (!cleaned) return null;

  if (cleaned.includes(',')) {
    // "Doe, John" format
    const [lastName, firstName] = cleaned.split(',', 2).map((s) => s.trim());
    return { firstName: firstName || '', lastName: lastName || '' };
  }

  // "John Doe" format - last word is last name
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: '', lastName: parts[0] || '' };
  }

  const lastName = parts.pop() ?? '';
  const firstName = parts.join(' ');
  return { firstName, lastName };
}

function generateCSVPreview(
  title: string,
  authors: ParsedAuthor[],
  year: number | undefined
): string {
  const parts: string[] = [];

  if (authors.length > 0) {
    const authorStr = authors.map((a) => `${a.lastName}, ${a.firstName}`).join('; ');
    parts.push(authorStr);
  }

  if (year) {
    parts.push(`(${year})`);
  }

  parts.push(title);

  return parts.join('. ');
}

function cleanCSVValue(value: string): string {
  return value.replace(/\\n/g, '\n').replace(/\\r/g, '\r').trim();
}
