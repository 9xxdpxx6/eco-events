import type { EventRequestDTO, EventResponseMediumDTO, EventFilterDTO, EventFilterForUserDTO } from '../types/api';
import client from './client';

export const eventsApi = {
  getAll: async (): Promise<EventResponseMediumDTO[]> => {
    const { data } = await client.get('/api/events/');
    const d: any = data;
    if (Array.isArray(d)) return d;
    if (d.content && Array.isArray(d.content)) return d.content;
    return [];
  },

  getById: async (eventId: number): Promise<EventResponseMediumDTO> => {
    const { data } = await client.get<EventResponseMediumDTO>(`/api/events/${eventId}`);
    return data;
  },

  create: async (eventData: EventRequestDTO, previewFile?: File): Promise<EventResponseMediumDTO> => {
    const formData = new FormData();
    
    // Добавляем данные события как JSON с указанием типа контента
    const eventBlob = new Blob([JSON.stringify(eventData)], { type: 'application/json' });
    formData.append('event', eventBlob);
    
    // Добавляем файл превью если есть
    if (previewFile) {
      formData.append('preview', previewFile);
    }
    
    console.log('Sending event data:', eventData);
    console.log('FormData has preview file:', !!previewFile);
    
    const { data } = await client.post<EventResponseMediumDTO>('/api/events/', formData);
    return data;
  },

  update: async (eventId: number, eventData: EventRequestDTO): Promise<EventResponseMediumDTO> => {
    const { data } = await client.post<EventResponseMediumDTO>(`/api/events/${eventId}`, eventData);
    return data;
  },

  delete: async (eventId: number): Promise<EventResponseMediumDTO> => {
    const { data } = await client.delete<EventResponseMediumDTO>(`/api/events/${eventId}`);
    return data;
  },

  updateConducted: async (eventId: number, conducted: boolean): Promise<void> => {
    await client.post(`/api/events/${eventId}/conduct?conducted=${conducted}`);
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

    const { data } = await client.get('/api/events/search', { params });
    const d: any = data;
    if (Array.isArray(d)) return d;
    if (d.content && Array.isArray(d.content)) return d.content;
    if (d.list && Array.isArray(d.list)) return d.list;
    // @ts-ignore
    if (d.items && Array.isArray(d.items)) return d.items;
    return [];
  },
  
  searchWithUser: async (filter: EventFilterForUserDTO): Promise<EventResponseMediumDTO[]> => {
    const params: any = {};
    if (filter.userIdForEventFilter) params.userIdForEventFilter = filter.userIdForEventFilter;
    if (filter.page !== undefined) params.page = filter.page;
    if (filter.size !== undefined) params.size = filter.size;

    const { data } = await client.get('/api/events/user/search', { params });
    
    const d: any = data;
    if (Array.isArray(d)) return d;
    if (d.content && Array.isArray(d.content)) return d.content;
    return [];
  },

  getForUser: async (filter: EventFilterForUserDTO): Promise<{ content: EventResponseMediumDTO[], totalElements: number }> => {
    const response = await client.get<{ content: EventResponseMediumDTO[], totalElements: number }>('/api/events/user/search', {
      params: filter
    });
    return response.data;
  }
};
