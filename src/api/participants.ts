import { apiClient } from './client';
import type { EventParticipantDTO, RegisterOrUnregisterRequest } from '../types/api';

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
  }
}; 