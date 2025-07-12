import { apiClient } from './client';
import type { EventTypeDTO, EventTypeFilterDTO } from '../types/api';

export const eventTypesApi = {
  getAll: async (): Promise<EventTypeDTO[]> => {
    const { data } = await apiClient.get<EventTypeDTO[]>('/api/event-types/');
    return data;
  },

  getById: async (eventTypeId: number): Promise<EventTypeDTO> => {
    const { data } = await apiClient.get<EventTypeDTO>(`/api/event-types/${eventTypeId}`);
    return data;
  },

  create: async (eventType: EventTypeDTO): Promise<EventTypeDTO> => {
    const { data } = await apiClient.post<EventTypeDTO>('/api/event-types/', eventType);
    return data;
  },

  update: async (eventTypeId: number, eventType: EventTypeDTO): Promise<EventTypeDTO> => {
    const { data } = await apiClient.post<EventTypeDTO>(`/api/event-types/${eventTypeId}`, eventType);
    return data;
  },

  delete: async (eventTypeId: number): Promise<void> => {
    await apiClient.delete(`/api/event-types/${eventTypeId}`);
  },

  search: async (filter: EventTypeFilterDTO): Promise<EventTypeDTO[]> => {
    const params: any = {};
    if (filter.name) params.name = filter.name;
    if (filter.description) params.description = filter.description;
    if (filter.page !== undefined) params.page = filter.page;
    if (filter.size !== undefined) params.size = filter.size;

    const { data } = await apiClient.get('/api/event-types/search', { params });
    const d: any = data;
    if (Array.isArray(d)) return d;
    if (d.content && Array.isArray(d.content)) return d.content;
    if (d.list && Array.isArray(d.list)) return d.list;
    if (d.items && Array.isArray(d.items)) return d.items;
    return [];
  }
}; 