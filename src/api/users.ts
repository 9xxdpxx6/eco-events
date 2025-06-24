import { apiClient } from './client';
import type { 
  UserRegistrationRequestDto, 
  UserRegistrationResponseDto 
} from '../types/api';

export const usersApi = {
  getAll: async (): Promise<UserRegistrationResponseDto[]> => {
    const { data } = await apiClient.get<UserRegistrationResponseDto[]>('/api/users/');
    return data;
  },

  getById: async (userId: number): Promise<UserRegistrationResponseDto> => {
    const { data } = await apiClient.get<UserRegistrationResponseDto>(`/api/users/${userId}`);
    return data;
  },

  register: async (userData: UserRegistrationRequestDto): Promise<UserRegistrationResponseDto> => {
    const { data } = await apiClient.post<UserRegistrationResponseDto>('/api/users/registration', userData);
    return data;
  },

  update: async (userId: number, userData: UserRegistrationRequestDto): Promise<UserRegistrationResponseDto> => {
    const { data } = await apiClient.post<UserRegistrationResponseDto>(`/api/users/${userId}`, userData);
    return data;
  },

  delete: async (userId: number): Promise<void> => {
    await apiClient.delete(`/api/users/${userId}`);
  },

  getMe: async (): Promise<UserRegistrationResponseDto> => {
    const { data } = await apiClient.get<UserRegistrationResponseDto>(`/api/users/me`);
    return data;
  }
}; 