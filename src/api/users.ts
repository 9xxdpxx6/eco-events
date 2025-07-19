import { apiClient } from './client';
import type { 
  UserRegistrationRequestDto, 
  UserRegistrationResponseDto,
  UserFilterDTO,
  Page
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

  getMe: async (): Promise<UserRegistrationResponseDto> => {
    const { data } = await apiClient.get<UserRegistrationResponseDto>('/api/users/me');
    return data;
  },

  register: async (userData: UserRegistrationRequestDto): Promise<UserRegistrationResponseDto> => {
    const { data } = await apiClient.post<UserRegistrationResponseDto>('/api/users/registration', userData);
    return data;
  },

  create: async (userData: UserRegistrationRequestDto): Promise<UserRegistrationResponseDto> => {
    const { data } = await apiClient.post<UserRegistrationResponseDto>('/api/users/', userData);
    return data;
  },

  update: async (userId: number, userData: UserRegistrationRequestDto): Promise<UserRegistrationResponseDto> => {
    const { data } = await apiClient.post<UserRegistrationResponseDto>(`/api/users/${userId}`, userData);
    return data;
  },

  updateMe: async (userData: UserRegistrationRequestDto): Promise<UserRegistrationResponseDto> => {
    console.log('🔵 API Request - updateMe');
    console.log('📍 URL:', '/api/users/updateMe');
    console.log('📦 Request Data:', JSON.stringify(userData, null, 2));
    try {
      const { data } = await apiClient.post<UserRegistrationResponseDto>('/api/users/updateMe', userData);
      console.log('✅ API Response - updateMe:', data);
      return data;
    } catch (error: any) {
      console.error('❌ API Error - updateMe');
      console.error('Status:', error.response?.status);
      console.error('Response Data:', error.response?.data);
      console.error('Error Message:', error.message);
      throw error;
    }
  },

  delete: async (userId: number): Promise<UserRegistrationResponseDto> => {
    const { data } = await apiClient.delete<UserRegistrationResponseDto>(`/api/users/${userId}`);
    return data;
  },

  search: async (filter: UserFilterDTO): Promise<Page> => {
    const params: any = {};
    if (filter.fullName) params.fullName = filter.fullName;
    if (filter.login) params.login = filter.login;
    if (filter.registeredEventsCount !== undefined) params.registeredEventsCount = filter.registeredEventsCount;
    if (filter.totalBonusPoints !== undefined) params.totalBonusPoints = filter.totalBonusPoints;
    if (filter.role) params.role = filter.role;
    if (filter.page !== undefined) params.page = filter.page;
    if (filter.size !== undefined) params.size = filter.size;

    const { data } = await apiClient.get<Page>('/api/users/search', { params });
    return data;
  }
}; 