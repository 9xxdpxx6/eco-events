import { apiClient } from './client';
import type {
  EventParticipantDTO,
  RegisterOrUnregisterRequest,
  Page,
  EventParticipantFilterDTO,
  EventParticipantWithEventDetailsDTO
} from '../types/api';

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

  registerForEvent: async (userId: number, eventId: number): Promise<EventParticipantDTO> => {
    const request: RegisterOrUnregisterRequest = { userId, eventId };
    const { data } = await apiClient.post<EventParticipantDTO>('/api/participants/register', request);
    return data;
  },

  unregisterFromEvent: async (userId: number, eventId: number): Promise<void> => {
    const request: RegisterOrUnregisterRequest = { userId, eventId };
    await apiClient.post('/api/participants/unregister', request);
  },

  updateStatus: async (userId: number, eventId: number, status: string): Promise<EventParticipantDTO> => {
    const { data } = await apiClient.post<EventParticipantDTO>(
      `/api/participants/${userId}/${eventId}`,
      null,
      { params: { status } }
    );
    return data;
  },

  search: async (filter: EventParticipantFilterDTO): Promise<Page<EventParticipantWithEventDetailsDTO>> => {
    const { data } = await apiClient.get<Page<EventParticipantWithEventDetailsDTO>>('/api/participants/search', {
      params: filter
    });
    return data;
  },

  getUserConfirmedEventsCount: async (userId: number): Promise<number> => {
    const { data } = await apiClient.get<number>(`/api/participants/users/${userId}/events/count`);
    return data;
  },

  // As per user request, this endpoint is for attended events, despite the name
  getAttendedEventsCount: async (userId: number): Promise<number> => {
    const { data } = await apiClient.get<number>(
      `/api/participants/users/${userId}/cancelled-events/count`
    );
    return data;
  }
}; 