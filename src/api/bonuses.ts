import { apiClient } from './client';
import type { BonusTypeDTO, UserBonusHistoryRequestDTO, UserBonusHistoryResponseShortDTO, BonusTypeFilterDTO, UserBonusHistoryFilterDTO } from '../types/api';

export const bonusTypesApi = {
  getAll: async (): Promise<BonusTypeDTO[]> => {
    const { data } = await apiClient.get<BonusTypeDTO[]>('/api/bonus-types/');
    return data;
  },

  getById: async (id: number): Promise<BonusTypeDTO> => {
    const { data } = await apiClient.get<BonusTypeDTO>(`/api/bonus-types/${id}`);
    return data;
  },

  create: async (bonusType: BonusTypeDTO): Promise<BonusTypeDTO> => {
    const { data } = await apiClient.post<BonusTypeDTO>('/api/bonus-types/', bonusType);
    return data;
  },

  update: async (id: number, bonusType: BonusTypeDTO): Promise<BonusTypeDTO> => {
    const { data } = await apiClient.post<BonusTypeDTO>(`/api/bonus-types/${id}`, bonusType);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/bonus-types/${id}`);
  },

  search: async (filter: BonusTypeFilterDTO): Promise<BonusTypeDTO[]> => {
    const params: any = {};
    if (filter.name) params.name = filter.name;
    if (filter.description) params.description = filter.description;
    if (filter.page !== undefined) params.page = filter.page;
    if (filter.size !== undefined) params.size = filter.size;

    const { data } = await apiClient.get('/api/bonus-types/search', { params });
    const d: any = data;
    if (Array.isArray(d)) return d;
    if (d.content && Array.isArray(d.content)) return d.content;
    if (d.list && Array.isArray(d.list)) return d.list;
    if (d.items && Array.isArray(d.items)) return d.items;
    return [];
  }
};

export const bonusHistoryApi = {
  getByUserId: async (userId: number): Promise<UserBonusHistoryResponseShortDTO[]> => {
    const { data } = await apiClient.get<UserBonusHistoryResponseShortDTO[]>(`/api/user-bonus-history/user/${userId}`);
    return data;
  },

  getById: async (id: number): Promise<UserBonusHistoryResponseShortDTO> => {
    const { data } = await apiClient.get<UserBonusHistoryResponseShortDTO>(`/api/user-bonus-history/${id}`);
    return data;
  },

  create: async (bonusHistory: UserBonusHistoryRequestDTO): Promise<UserBonusHistoryResponseShortDTO> => {
    const { data } = await apiClient.post<UserBonusHistoryResponseShortDTO>('/api/user-bonus-history/', bonusHistory);
    return data;
  },

  update: async (id: number, bonusHistory: UserBonusHistoryRequestDTO): Promise<UserBonusHistoryResponseShortDTO> => {
    const { data } = await apiClient.post<UserBonusHistoryResponseShortDTO>(`/api/user-bonus-history/${id}`, bonusHistory);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/user-bonus-history/${id}`);
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.post(`/api/user-bonus-history/${id}/activate`);
  },

  deactivate: async (id: number): Promise<void> => {
    await apiClient.post(`/api/user-bonus-history/${id}/deactivate`);
  },

  search: async (filter: UserBonusHistoryFilterDTO): Promise<UserBonusHistoryResponseShortDTO[]> => {
    const params: any = {};
    if (filter.userId) params.userId = filter.userId;
    if (filter.bonusTypeId) params.bonusTypeId = filter.bonusTypeId;
    if (filter.createdAtFrom) params.createdAtFrom = filter.createdAtFrom;
    if (filter.createdAtTo) params.createdAtTo = filter.createdAtTo;
    if (filter.isActive !== undefined) params.isActive = filter.isActive;
    if (filter.page !== undefined) params.page = filter.page;
    if (filter.size !== undefined) params.size = filter.size;

    const { data } = await apiClient.get('/api/user-bonus-history/search', { params });
    const d: any = data;
    if (Array.isArray(d)) return d;
    if (d.content && Array.isArray(d.content)) return d.content;
    if (d.list && Array.isArray(d.list)) return d.list;
    if (d.items && Array.isArray(d.items)) return d.items;
    return [];
  }
}; 