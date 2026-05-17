declare module '@retorquere/bibtex-parser' {
  interface Creator {
    creatorType?: string;
    firstName?: string;
    lastName?: string;
    given?: string;
    family?: string;
    literal?: string;
  }

  interface Entry {
    key?: string;
    type?: string;
    fields?: Record<string, string | string[]>;
    creators?: Creator[];
  }

  interface ParseResult {
    entries: Entry[];
    errors?: Array<{ message: string }>;
  }

  interface ParseOptions {
    verbatimFields?: string[];
  }

  export function parse(input: string, options?: ParseOptions): ParseResult;
}
