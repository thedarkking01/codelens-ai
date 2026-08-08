import type { SearchResult } from "./search.service";

export class ContextBuilderService {
  buildContext(results: SearchResult[]): string {
    if (results.length === 0) {
      return "";
    }

    return results
      .map((result, index) => {
        return `
Context ${index + 1}

File: ${result.filePath}
Language: ${result.language}
Lines: ${result.startLine}-${result.endLine}

Code:
${result.content}
`;
      })
      .join("\n==============================\n");
  }
}

export const contextBuilderService =
  new ContextBuilderService();