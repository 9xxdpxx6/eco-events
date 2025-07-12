import { defineStore } from 'pinia';
import { eventsApi } from '../api/events';
import type { EventRequestDTO, EventResponseMediumDTO, EventFilterDTO, EventFilterForUserDTO } from '../types/api';
import { useParticipantsStore } from './participants';

interface EventsState {
  events: EventResponseMediumDTO[];
  currentEvent: EventResponseMediumDTO | null;
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
        // Получаем мероприятия по eventId из event объектов
        const eventIds = participantEvents.map(p => p.event.id);
        const uniqueEventIds = Array.from(new Set(eventIds));
        const events: EventResponseMediumDTO[] = [];
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

    async createEvent(eventData: EventRequestDTO) {
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

    async updateEvent(eventId: number, eventData: EventRequestDTO) {
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

    async fetchEventsSearch(filter: EventFilterDTO) {
      this.isLoading = true;
      this.error = null;
      try {
        const events = await eventsApi.search(filter);
        this.events = events;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при поиске событий';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchEventsSearchByUser(filter: EventFilterForUserDTO) {
      this.isLoading = true;
      this.error = null;
      try {
        const events = await eventsApi.searchByUser(filter);
        this.events = events;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при поиске событий пользователя';
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
}); 