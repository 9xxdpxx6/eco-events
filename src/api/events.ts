import { apiClient } from './client';
import type { EventRequestDTO, EventResponseMediumDTO, EventFilterDTO, EventFilterForUserDTO } from '../types/api';

export const eventsApi = {
  getAll: async (): Promise<EventResponseMediumDTO[]> => {
    const { data } = await apiClient.get('/api/events/');
    const d: any = data;
    if (Array.isArray(d)) return d;
    if (d.content && Array.isArray(d.content)) return d.content;
    if (d.list && Array.isArray(d.list)) return d.list;
    if (d.items && Array.isArray(d.items)) return d.items;
    return [];
  },

  getById: async (eventId: number): Promise<EventResponseMediumDTO> => {
    const { data } = await apiClient.get<EventResponseMediumDTO>(`/api/events/${eventId}`);
    return data;
  },

  create: async (eventData: EventRequestDTO): Promise<EventResponseMediumDTO> => {
    const { data } = await apiClient.post<EventResponseMediumDTO>('/api/events/', eventData);
    return data;
  },

  update: async (eventId: number, eventData: EventRequestDTO): Promise<EventResponseMediumDTO> => {
    const { data } = await apiClient.post<EventResponseMediumDTO>(`/api/events/${eventId}`, eventData);
    return data;
  },

  delete: async (eventId: number): Promise<EventResponseMediumDTO> => {
    const { data } = await apiClient.delete<EventResponseMediumDTO>(`/api/events/${eventId}`);
    return data;
  },

  updateConducted: async (eventId: number, conducted: boolean): Promise<void> => {
    await apiClient.post(`/api/events/${eventId}/conduct?conducted=${conducted}`);
  },

  search: async (filter: EventFilterDTO): Promise<EventResponseMediumDTO[]> => {
    const params: any = {};
    if (filter.keyword) params.keyword = filter.keyword;
    if (filter.eventTypeId) params.eventTypeId = filter.eventTypeId;
    if (filter.startDateFrom) params.startDateFrom = filter.startDateFrom;
    if (filter.startDateTo) params.startDateTo = filter.startDateTo;
    if (filter.userId) params.userId = filter.userId;
    if (filter.page !== undefined) params.page = filter.page;
    if (filter.size !== undefined) params.size = filter.size;
    if (filter.sortBy) params.sortBy = filter.sortBy;
    if (filter.sortOrder) params.sortOrder = filter.sortOrder;

    const queryString = new URLSearchParams(params).toString();
    console.log(`Выполняется запрос: ${apiClient.defaults.baseURL}/api/events/search?${queryString}`);

    const { data } = await apiClient.get('/api/events/search', { params });
    const d: any = data;
    if (Array.isArray(d)) return d;
    if (d.content && Array.isArray(d.content)) return d.content;
    if (d.list && Array.isArray(d.list)) return d.list;
    if (d.items && Array.isArray(d.items)) return d.items;
    return [];
  },

  searchByUser: async (filter: EventFilterForUserDTO): Promise<EventResponseMediumDTO[]> => {
    const params: any = {
      filter: filter // Передаем весь объект filter как обязательный параметр
    };
    
    // Дублируем основные параметры на верхнем уровне для совместимости
    if (filter.userIdForEventFilter) params.userIdForEventFilter = filter.userIdForEventFilter;
    if (filter.page !== undefined) params.page = filter.page;
    if (filter.size !== undefined) params.size = filter.size;

    const { data } = await apiClient.get('/api/events/user/search', { params });
    
    const d: any = data;
    if (Array.isArray(d)) return d;
    if (d.content && Array.isArray(d.content)) return d.content;
    if (d.list && Array.isArray(d.list)) return d.list;
    if (d.items && Array.isArray(d.items)) return d.items;
    return [];
  }
}; 