import { apiRequest } from './api'
import type {
  CreateRepositoryInput,
  FileResponse,
  RepositoriesResponse,
  RepositoryFilesResponse,
  RepositoryResponse,
} from '../types/repository'

export async function getRepositories(
  token: string,
): Promise<RepositoriesResponse> {
  return apiRequest<RepositoriesResponse>(
    '/api/v1/repositories',
    {
      method: 'GET',
      token,
    },
  )
}

export async function createRepository(
  token: string,
  input: CreateRepositoryInput,
): Promise<RepositoryResponse> {
  return apiRequest<RepositoryResponse>(
    '/api/v1/repositories',
    {
      method: 'POST',
      token,
      body: JSON.stringify(input),
    },
  )
}

export async function getRepository(
  token: string,
  repositoryId: string,
): Promise<RepositoryResponse> {
  return apiRequest<RepositoryResponse>(
    `/api/v1/repositories/${repositoryId}`,
    {
      method: 'GET',
      token,
    },
  )
}

export async function getRepositoryStatus(
  token: string,
  repositoryId: string,
): Promise<RepositoryResponse> {
  return apiRequest<RepositoryResponse>(
    `/api/v1/repositories/${repositoryId}/status`,
    {
      method: 'GET',
      token,
    },
  )
}

export async function getRepositoryFiles(
  token: string,
  repositoryId: string,
): Promise<RepositoryFilesResponse> {
  return apiRequest<RepositoryFilesResponse>(
    `/api/v1/repositories/${repositoryId}/files`,
    { method: 'GET', token },
  )
}

export async function getRepositoryFile(
  token: string,
  repositoryId: string,
  fileId: string,
): Promise<FileResponse> {
  return apiRequest<FileResponse>(
    `/api/v1/repositories/${repositoryId}/files/${fileId}`,
    { method: 'GET', token },
  )
}

export async function deleteRepository(
  token: string,
  repositoryId: string,
): Promise<void> {
  await apiRequest(
    `/api/v1/repositories/${repositoryId}`,
    {
      method: 'DELETE',
      token,
    },
  )
}

