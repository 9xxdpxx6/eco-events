import { apiClient } from './client';
import type { EventParticipantDTO, EventParticipantFilterDTO, RegisterOrUnregisterRequest, Page } from '../types/api';

export const participantsApi = {
  registerForEvent: async (userId: number, eventId: number): Promise<EventParticipantDTO> => {
    const request: RegisterOrUnregisterRequest = { userId, eventId };
    const { data } = await apiClient.post<EventParticipantDTO>('/api/participants/register', request);
    return data;
  },
  search: async (filter: EventParticipantFilterDTO): Promise<Page<EventParticipantDTO>> => {
    const { data } = await apiClient.get<Page<EventParticipantDTO>>('/api/participants/search', { params: filter });
    return data;
  },
  
  unregisterFromEvent: async (userId: number, eventId: number): Promise<void> => {
    const request: RegisterOrUnregisterRequest = { userId, eventId };
    await apiClient.post('/api/participants/unregister', request);
  },
  
  getByEvent: async (eventId: number): Promise<EventParticipantDTO[]> => {
    const { data } = await apiClient.get<EventParticipantDTO[]>(`/api/participants/event/${eventId}`);
    return data;
  },
  
  getAll: async (): Promise<EventParticipantDTO[]> => {
    const { data } = await apiClient.get<EventParticipantDTO[]>('/api/participants/');
    return data;
  },

  updateStatus: async (userId: number, eventId: number, status: string): Promise<EventParticipantDTO> => {
    const { data } = await apiClient.post<EventParticipantDTO>(`/api/participants/${userId}/${eventId}`, null, { params: { status } });
    return data;
  }
}; 