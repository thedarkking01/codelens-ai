import { apiRequest } from './api'

export interface DependencyFile {
  id: string
  path: string
  name: string
  language?: string | null
}

export interface RepositoryDependency {
  id: string
  sourceFileId: string
  targetFileId: string
  type: string
  sourceFile: DependencyFile
  targetFile: DependencyFile
}

export interface DependenciesResponse {
  success: boolean
  data: RepositoryDependency[]
}

export async function getRepositoryDependencies(
  token: string,
  repositoryId: string,
): Promise<DependenciesResponse> {
  return apiRequest<DependenciesResponse>(
    `/api/v1/repositories/${repositoryId}/dependencies`,
    { method: 'GET', token },
  )
}
