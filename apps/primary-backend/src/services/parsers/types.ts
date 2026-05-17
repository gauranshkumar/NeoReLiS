/**
 * Normalized paper data structure from any import format (BibTeX, CSV, EndNote)
 */
export interface ParsedAuthor {
  firstName: string;
  lastName: string;
  order: number;
}

export interface ParsedPaper {
  bibtexKey?: string;
  title: string;
  authors: ParsedAuthor[];
  abstract?: string;
  year?: number;
  doi?: string;
  url?: string;
  venue?: string;
  keywords?: string;
  bibtex?: string;
  preview?: string;
}

export interface ParseResult {
  papers: ParsedPaper[];
  errors: ParseError[];
  totalParsed: number;
}

export interface ParseError {
  row?: number;
  entry?: string;
  message: string;
}

export interface CSVColumnMapping {
  title: number;
  authors?: number;
  year?: number;
  doi?: number;
  abstract?: number;
  bibtexKey?: number;
  url?: number;
  keywords?: number;
  venue?: number;
}
