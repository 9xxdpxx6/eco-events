import { apiClient } from './client';
import type { EventParticipantDTO, RegisterOrUnregisterRequest, EventParticipantFilterDTO } from '../types/api';

export const participantsApi = {
  getAll: async (): Promise<EventParticipantDTO[]> => {
    const { data } = await apiClient.get<EventParticipantDTO[]>('/api/participants/');
    return data;
  },

  getByUser: async (userId: number) => {
    const url = `/api/participants/user/${userId}`;
    console.log('[participantsApi.getByUser] URL:', url);
    const { data } = await apiClient.get(url);
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

  search: async (filter: any) => {
    const url = '/api/participants/search';
    const { data } = await apiClient.get(url, { params: filter });
    return data;
  }
}; 