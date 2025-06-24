import { defineStore } from 'pinia';
import { participantsApi } from '../api/participants';
import type { EventParticipantDTO } from '../types/api';

interface ParticipantsState {
  participants: EventParticipantDTO[];
  userParticipants: EventParticipantDTO[];
  eventParticipants: EventParticipantDTO[];
  isLoading: boolean;
  error: string | null;
}

export const useParticipantsStore = defineStore('participants', {
  state: (): ParticipantsState => ({
    participants: [],
    userParticipants: [],
    eventParticipants: [],
    isLoading: false,
    error: null
  }),

  getters: {
    getAllParticipants: (state) => state.participants,
    getUserParticipants: (state) => state.userParticipants,
    getEventParticipants: (state) => state.eventParticipants,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    async fetchAllParticipants() {
      this.isLoading = true;
      this.error = null;
      try {
        const participants = await participantsApi.getAll();
        this.participants = participants;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке участников';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUserParticipants(userId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const participants = await participantsApi.getByUser(userId);
        this.userParticipants = participants;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке участников пользователя';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchEventParticipants(eventId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const participants = await participantsApi.getByEvent(eventId);
        this.eventParticipants = participants;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке участников события';
      } finally {
        this.isLoading = false;
      }
    },

    async registerForEvent(userId: number, eventId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const participant = await participantsApi.register(userId, eventId);
        this.participants.push(participant);
        this.userParticipants.push(participant);
        this.eventParticipants.push(participant);
        return participant;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при регистрации на событие';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateParticipantStatus(userId: number, eventId: number, status: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedParticipant = await participantsApi.updateStatus(userId, eventId, status);
        this._updateParticipantInLists(updatedParticipant);
        return updatedParticipant;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при обновлении статуса участника';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteParticipant(userId: number, eventId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await participantsApi.delete(userId, eventId);
        this._removeParticipantFromLists(userId, eventId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при удалении участника';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    _updateParticipantInLists(participant: EventParticipantDTO) {
      const updateInList = (list: EventParticipantDTO[]) => {
        const index = list.findIndex(p => p.userId === participant.userId && p.eventId === participant.eventId);
        if (index !== -1) {
          list[index] = participant;
        }
      };

      updateInList(this.participants);
      updateInList(this.userParticipants);
      updateInList(this.eventParticipants);
    },

    _removeParticipantFromLists(userId: number, eventId: number) {
      const removeFromList = (list: EventParticipantDTO[]) => {
        return list.filter(p => !(p.userId === userId && p.eventId === eventId));
      };

      this.participants = removeFromList(this.participants);
      this.userParticipants = removeFromList(this.userParticipants);
      this.eventParticipants = removeFromList(this.eventParticipants);
    }
  }
}); 