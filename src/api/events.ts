import { apiClient } from './client';
import type { EventDTO } from '../types/api';

export const eventsApi = {
  getAll: async (): Promise<EventDTO[]> => {
    const { data } = await apiClient.get('/api/events/');
    const d: any = data;
    if (Array.isArray(d)) return d;
    if (d.content && Array.isArray(d.content)) return d.content;
    if (d.list && Array.isArray(d.list)) return d.list;
    if (d.items && Array.isArray(d.items)) return d.items;
    return [];
  },

  getById: async (eventId: number): Promise<EventDTO> => {
    const { data } = await apiClient.get<EventDTO>(`/api/events/${eventId}`);
    return data;
  },

  create: async (eventData: EventDTO): Promise<EventDTO> => {
    const { data } = await apiClient.post<EventDTO>('/api/events/', eventData);
    return data;
  },

  update: async (eventId: number, eventData: EventDTO): Promise<EventDTO> => {
    const { data } = await apiClient.post<EventDTO>(`/api/events/${eventId}`, eventData);
    return data;
  },

  delete: async (eventId: number): Promise<void> => {
    await apiClient.delete(`/api/events/${eventId}`);
  },

  updateConducted: async (eventId: number, conducted: boolean): Promise<void> => {
    await apiClient.post(`/api/events/${eventId}/conducted?conducted=${conducted}`);
  },

  search: async (
    keyword: string = '',
    page: number = 0,
    size: number = 50,
    eventTypeId?: number,
    startDateFrom?: string,
    startDateTo?: string,
    organizerId?: number
  ): Promise<EventDTO[]> => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (eventTypeId) params.append('eventTypeId', String(eventTypeId));
    if (startDateFrom) params.append('startDateFrom', startDateFrom);
    if (startDateTo) params.append('startDateTo', startDateTo);
    if (organizerId) params.append('organizerId', String(organizerId));
    params.append('page', String(page));
    params.append('size', String(size));
    const { data } = await apiClient.get(`/api/events/search?${params.toString()}`);
    const d: any = data;
    if (Array.isArray(d)) return d;
    if (d.content && Array.isArray(d.content)) return d.content;
    if (d.list && Array.isArray(d.list)) return d.list;
    if (d.items && Array.isArray(d.items)) return d.items;
    return [];
  }
}; 