import { apiRequest } from './api'
import type {
  AuthResponse,
  LoginInput,
  MeResponse,
  RegisterInput,
} from '../types/auth'

export async function registerUser(
  input: RegisterInput,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function loginUser(
  input: LoginInput,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getCurrentUser(
  token: string,
): Promise<MeResponse> {
  return apiRequest<MeResponse>('/api/auth/me', {
    method: 'GET',
    token,
  })
}