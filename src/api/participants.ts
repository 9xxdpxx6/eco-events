import { apiClient } from './client';
import type { EventParticipantDTO, RegisterOrUnregisterRequest, EventParticipantFilterDTO } from '../types/api';

export const participantsApi = {
  getAll: async (): Promise<EventParticipantDTO[]> => {
    const { data } = await apiClient.get<EventParticipantDTO[]>('/api/participants/');
    return data;
  },

  getByUser: async (userId: number): Promise<EventParticipantDTO[]> => {
    const { data } = await apiClient.get<EventParticipantDTO[]>(`/api/participants/user/${userId}`);
    return data;
  },

  getByEvent: async (eventId: number): Promise<EventParticipantDTO[]> => {
    const { data } = await apiClient.get<EventParticipantDTO[]>(`/api/participants/event/${eventId}`);
    return data;
  },

  register: async (request: RegisterOrUnregisterRequest): Promise<EventParticipantDTO> => {
    const { data } = await apiClient.post<EventParticipantDTO>('/api/participants/register', request);
    return data;
  },

  unregister: async (request: RegisterOrUnregisterRequest): Promise<void> => {
    await apiClient.post('/api/participants/unregister', request);
  },

  updateStatus: async (userId: number, eventId: number, status: string): Promise<EventParticipantDTO> => {
    const { data } = await apiClient.post<EventParticipantDTO>(`/api/participants/${userId}/${eventId}?status=${status}`);
    return data;
  },

  search: async (filter: EventParticipantFilterDTO): Promise<EventParticipantDTO[]> => {
    const params: any = {};
    if (filter.userId) params.userId = filter.userId;
    if (filter.eventId) params.eventId = filter.eventId;
    if (filter.status) params.status = filter.status;
    if (filter.membershipStatus) params.membershipStatus = filter.membershipStatus;
    if (filter.createdAtFrom) params.createdAtFrom = filter.createdAtFrom;
    if (filter.createdAtTo) params.createdAtTo = filter.createdAtTo;
    if (filter.page !== undefined) params.page = filter.page;
    if (filter.size !== undefined) params.size = filter.size;

    const { data } = await apiClient.get('/api/participants/search', { params });
    const d: any = data;
    if (Array.isArray(d)) return d;
    if (d.content && Array.isArray(d.content)) return d.content;
    if (d.list && Array.isArray(d.list)) return d.list;
    if (d.items && Array.isArray(d.items)) return d.items;
    return [];
  }
}; 