import { apiRequest } from './api'

export interface ChatSession {
  id: string
  repositoryId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: 'USER' | 'ASSISTANT'
  content: string
  createdAt: string
}

export interface SourceReference {
  chunkId: string
  filePath: string
  language: string
  startLine: number
  endLine: number
  score: number
}

export interface SendMessageResponse {
  answer: string
  sources: SourceReference[]
}

export async function createChatSession(
  token: string,
  repositoryId: string,
): Promise<{ success: boolean; data: ChatSession }> {
  return apiRequest('/api/v1/chat/sessions', {
    method: 'POST',
    token,
    body: JSON.stringify({ repositoryId }),
  })
}

export async function getChatMessages(
  token: string,
  sessionId: string,
): Promise<{ success: boolean; data: ChatMessage[] }> {
  return apiRequest(`/api/v1/chat/sessions/${sessionId}/messages`, {
    method: 'GET',
    token,
  })
}

export async function sendChatMessage(
  token: string,
  sessionId: string,
  message: string,
): Promise<{ success: boolean; data: SendMessageResponse }> {
  return apiRequest(`/api/v1/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    token,
    body: JSON.stringify({ message }),
  })
}

export async function getSessions(
  token: string,
): Promise<{ success: boolean; data: (ChatSession & { repository: { id: string; name: string } })[] }> {
  return apiRequest('/api/v1/chat/sessions', {
    method: 'GET',
    token,
  })
}

export async function deleteChatSession(
  token: string,
  sessionId: string,
): Promise<void> {
  await apiRequest(`/api/v1/chat/sessions/${sessionId}`, {
    method: 'DELETE',
    token,
  })
}

export async function searchRepository(
  token: string,
  repositoryId: string,
  query: string,
  limit = 5,
): Promise<{ success: boolean; data: { chunkId: string; filePath: string; language: string; startLine: number; endLine: number; content: string; score: number }[] }> {
  return apiRequest('/api/v1/search', {
    method: 'POST',
    token,
    body: JSON.stringify({ repositoryId, query, limit }),
  })
}
