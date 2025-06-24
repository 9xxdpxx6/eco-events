import { defineStore } from 'pinia';
import { eventsApi } from '../api/events';
import type { EventDTO } from '../types/api';
import { useParticipantsStore } from './participants';

interface EventsState {
  events: EventDTO[];
  currentEvent: EventDTO | null;
  isLoading: boolean;
  error: string | null;
}

export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    events: [],
    currentEvent: null,
    isLoading: false,
    error: null
  }),

  getters: {
    getEvents: (state) => state.events,
    getCurrentEvent: (state) => state.currentEvent,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    async fetchEvents() {
      this.isLoading = true;
      this.error = null;
      try {
        // Получаем userId из authStore
        const { useAuthStore } = await import('./auth');
        const authStore = useAuthStore();
        const userId = authStore.user?.id;
        if (!userId) throw new Error('Пользователь не авторизован');
        // Получаем участия пользователя
        const participantsStore = useParticipantsStore();
        await participantsStore.fetchUserParticipants(userId);
        const participantEvents = participantsStore.getUserParticipants;
        // Получаем мероприятия по eventId
        const eventIds = participantEvents.map(p => p.eventId);
        const uniqueEventIds = Array.from(new Set(eventIds));
        const events: EventDTO[] = [];
        for (const eventId of uniqueEventIds) {
          try {
            const event = await eventsApi.getById(eventId);
            events.push(event);
          } catch (e) {
            // Пропускаем ошибочные события
          }
        }
        this.events = events;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке событий';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchEventById(eventId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const event = await eventsApi.getById(eventId);
        this.currentEvent = event;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке события';
      } finally {
        this.isLoading = false;
      }
    },

    async createEvent(eventData: EventDTO) {
      this.isLoading = true;
      this.error = null;
      try {
        const newEvent = await eventsApi.create(eventData);
        this.events.push(newEvent);
        return newEvent;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при создании события';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateEvent(eventId: number, eventData: EventDTO) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedEvent = await eventsApi.update(eventId, eventData);
        const index = this.events.findIndex(event => event.id === eventId);
        if (index !== -1) {
          this.events[index] = updatedEvent;
        }
        if (this.currentEvent?.id === eventId) {
          this.currentEvent = updatedEvent;
        }
        return updatedEvent;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при обновлении события';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteEvent(eventId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await eventsApi.delete(eventId);
        this.events = this.events.filter(event => event.id !== eventId);
        if (this.currentEvent?.id === eventId) {
          this.currentEvent = null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при удалении события';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateEventConducted(eventId: number, conducted: boolean) {
      this.isLoading = true;
      this.error = null;
      try {
        await eventsApi.updateConducted(eventId, conducted);
        const event = this.events.find(event => event.id === eventId);
        if (event) {
          event.conducted = conducted;
        }
        if (this.currentEvent?.id === eventId) {
          this.currentEvent.conducted = conducted;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при обновлении статуса события';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchEventsSearch(keyword: string = '', page: number = 0, size: number = 50, eventTypeId?: number, startDateFrom?: string, startDateTo?: string, organizerId?: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const events = await eventsApi.search(keyword, page, size, eventTypeId, startDateFrom, startDateTo, organizerId);
        this.events = events;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при поиске событий';
      } finally {
        this.isLoading = false;
      }
    }
  }
}); 