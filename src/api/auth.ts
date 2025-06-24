import { apiClient } from './client';
import type { AuthRequestDTO, AuthResponseDTO } from '../types/api';

export const authApi = {
  login: async (credentials: AuthRequestDTO): Promise<AuthResponseDTO> => {
    const { data } = await apiClient.post<AuthResponseDTO>('/api/auth/login', credentials);
    localStorage.setItem('token', data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
}; 