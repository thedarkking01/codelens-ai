import { apiRequest } from './api'
import type {
  CreateRepositoryInput,
  RepositoriesResponse,
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