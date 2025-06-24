import { apiClient } from './client';
import type { EventTypeDTO } from '../types/api';

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
  }
}; 