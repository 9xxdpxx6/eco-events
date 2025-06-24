import { apiClient } from './client';
import type { BonusTypeDTO, UserBonusHistoryDTO } from '../types/api';

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
  }
};

export const bonusHistoryApi = {
  getByUserId: async (userId: number): Promise<UserBonusHistoryDTO[]> => {
    const { data } = await apiClient.get<UserBonusHistoryDTO[]>(`/api/user-bonus-history/user/${userId}`);
    return data;
  },

  getById: async (id: number): Promise<UserBonusHistoryDTO> => {
    const { data } = await apiClient.get<UserBonusHistoryDTO>(`/api/user-bonus-history/${id}`);
    return data;
  },

  create: async (bonusHistory: UserBonusHistoryDTO): Promise<UserBonusHistoryDTO> => {
    const { data } = await apiClient.post<UserBonusHistoryDTO>('/api/user-bonus-history/', bonusHistory);
    return data;
  },

  update: async (id: number, bonusHistory: UserBonusHistoryDTO): Promise<UserBonusHistoryDTO> => {
    const { data } = await apiClient.post<UserBonusHistoryDTO>(`/api/user-bonus-history/${id}`, bonusHistory);
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
  }
}; 