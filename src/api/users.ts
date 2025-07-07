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