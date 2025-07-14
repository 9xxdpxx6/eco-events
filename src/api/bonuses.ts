import { apiClient } from './client';
import type { BonusTypeDTO, UserBonusHistoryRequestDTO, UserBonusHistoryResponseShortDTO, BonusTypeFilterDTO, UserBonusHistoryFilterDTO, Page } from '../types/api';

const BONUS_TYPES_API_URL = '/api/bonus-types';

export const bonusTypesApi = {
  getAll: async (): Promise<BonusTypeDTO[]> => {
    const { data } = await apiClient.get<BonusTypeDTO[]>(`${BONUS_TYPES_API_URL}/`);
    return data;
  },

  getById: async (id: number): Promise<BonusTypeDTO> => {
    const { data } = await apiClient.get<BonusTypeDTO>(`${BONUS_TYPES_API_URL}/${id}`);
    return data;
  },

  create: async (bonusType: BonusTypeDTO): Promise<BonusTypeDTO> => {
    const { data } = await apiClient.post<BonusTypeDTO>(`${BONUS_TYPES_API_URL}/`, bonusType);
    return data;
  },

  update: async (id: number, bonusType: BonusTypeDTO): Promise<BonusTypeDTO> => {
    const { data } = await apiClient.post<BonusTypeDTO>(`${BONUS_TYPES_API_URL}/${id}`, bonusType);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BONUS_TYPES_API_URL}/${id}`);
  },

  search: async (filter: BonusTypeFilterDTO): Promise<BonusTypeDTO[]> => {
    const params: any = {};
    if (filter.name) params.name = filter.name;
    if (filter.description) params.description = filter.description;
    if (filter.page !== undefined) params.page = filter.page;
    if (filter.size !== undefined) params.size = filter.size;

    const { data } = await apiClient.get<Page<BonusTypeDTO> | BonusTypeDTO[]>(`${BONUS_TYPES_API_URL}/search`, { params });
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.content)) {
      return data.content;
    }
    return [];
  }
};

const USER_BONUS_HISTORY_API_URL = '/api/user-bonus-history';

export const bonusHistoryApi = {
  getByUserId: async (userId: number): Promise<UserBonusHistoryResponseShortDTO[]> => {
    const { data } = await apiClient.get<UserBonusHistoryResponseShortDTO[]>(`${USER_BONUS_HISTORY_API_URL}/user/${userId}`);
    return data;
  },

  getById: async (id: number): Promise<UserBonusHistoryResponseShortDTO> => {
    const { data } = await apiClient.get<UserBonusHistoryResponseShortDTO>(`${USER_BONUS_HISTORY_API_URL}/${id}`);
    return data;
  },

  create: async (bonusHistory: UserBonusHistoryRequestDTO): Promise<UserBonusHistoryResponseShortDTO> => {
    const { data } = await apiClient.post<UserBonusHistoryResponseShortDTO>(`${USER_BONUS_HISTORY_API_URL}/`, bonusHistory);
    return data;
  },

  update: async (id: number, bonusHistory: UserBonusHistoryRequestDTO): Promise<UserBonusHistoryResponseShortDTO> => {
    const { data } = await apiClient.post<UserBonusHistoryResponseShortDTO>(`${USER_BONUS_HISTORY_API_URL}/${id}`, bonusHistory);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${USER_BONUS_HISTORY_API_URL}/${id}`);
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.post(`${USER_BONUS_HISTORY_API_URL}/${id}/activate`);
  },

  deactivate: async (id: number): Promise<void> => {
    await apiClient.post(`${USER_BONUS_HISTORY_API_URL}/${id}/deactivate`);
  },

  search: async (filter: UserBonusHistoryFilterDTO): Promise<UserBonusHistoryResponseShortDTO[]> => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const url = `${USER_BONUS_HISTORY_API_URL}/search?${params.toString()}`;
    const { data } = await apiClient.get<Page<UserBonusHistoryResponseShortDTO> | UserBonusHistoryResponseShortDTO[]>(url);

    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.content)) {
      return data.content;
    }
    return [];
  }
}; 