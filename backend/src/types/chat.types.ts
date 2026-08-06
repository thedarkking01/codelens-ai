export interface RetrievedChunk {
  chunkId: string;
  fileId: string;
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  score?: number;
}

export interface ChatResponse {
  answer: string;
  sources: {
    filePath: string;
    startLine: number;
    endLine: number;
  }[];
}