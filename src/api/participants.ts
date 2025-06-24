import { apiClient } from './client';
import type { EventParticipantDTO } from '../types/api';

export const participantsApi = {
  getAll: async (): Promise<EventParticipantDTO[]> => {
    const { data } = await apiClient.get<EventParticipantDTO[]>('/api/participants');
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

  register: async (userId: number, eventId: number): Promise<EventParticipantDTO> => {
    const { data } = await apiClient.post<EventParticipantDTO>(`/api/participants/user/${userId}/event/${eventId}`);
    return data;
  },

  updateStatus: async (userId: number, eventId: number, status: string): Promise<EventParticipantDTO> => {
    const { data } = await apiClient.post<EventParticipantDTO>(`/api/participants/${userId}/${eventId}?status=${status}`);
    return data;
  },

  delete: async (userId: number, eventId: number): Promise<void> => {
    await apiClient.delete(`/api/participants/${userId}/${eventId}`);
  }
}; 