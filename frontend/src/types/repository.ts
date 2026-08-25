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