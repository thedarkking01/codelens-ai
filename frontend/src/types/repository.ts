export type RepositoryStatus =
  | 'PENDING'
  | 'CLONING'
  | 'INDEXING'
  | 'READY'
  | 'FAILED'

export interface Repository {
  id: string
  name: string
  githubUrl: string
  branch?: string | null
  status: RepositoryStatus | string
  localPath?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface RepositoryFile {
  id: string
  repositoryId: string
  path: string
  name: string
  extension?: string | null
  language?: string | null
  size?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface RepositoryFilesResponse {
  success: boolean
  data: RepositoryFile[]
}

export interface FileResponse {
  success: boolean
  data: RepositoryFile
}

export interface RepositoryResponse {
  success: boolean
  data: Repository
}

export interface RepositoriesResponse {
  success: boolean
  data: Repository[]
}

export interface CreateRepositoryInput {
  githubUrl: string
}