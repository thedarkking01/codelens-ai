export interface RetrievedChunk {
  chunkId: string;
  filePath: string;
  language: string;
  startLine: number;
  endLine: number;
  content: string;
  score?: number;
}

export interface SourceReference {
  chunkId: string;
  filePath: string;
  language: string;
  startLine: number;
  endLine: number;
  score: number;
}

export interface ChatResponse {
  answer: string;
  sources: SourceReference[];
}