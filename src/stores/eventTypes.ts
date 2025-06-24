import { defineStore } from 'pinia';
import { eventTypesApi } from '../api/eventTypes';
import type { EventTypeDTO } from '../types/api';

interface EventTypesState {
  eventTypes: EventTypeDTO[];
  isLoading: boolean;
  error: string | null;
}

export const useEventTypesStore = defineStore('eventTypes', {
  state: (): EventTypesState => ({
    eventTypes: [],
    isLoading: false,
    error: null
  }),

  getters: {
    getEventTypes: (state) => state.eventTypes,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    async fetchEventTypes() {
      this.isLoading = true;
      this.error = null;
      try {
        const types = await eventTypesApi.getAll();
        this.eventTypes = types;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке типов событий';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchEventTypeById(eventTypeId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const type = await eventTypesApi.getById(eventTypeId);
        const index = this.eventTypes.findIndex(t => t.id === eventTypeId);
        if (index !== -1) {
          this.eventTypes[index] = type;
        } else {
          this.eventTypes.push(type);
        }
        return type;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке типа события';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createEventType(eventType: EventTypeDTO) {
      this.isLoading = true;
      this.error = null;
      try {
        const newType = await eventTypesApi.create(eventType);
        this.eventTypes.push(newType);
        return newType;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при создании типа события';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateEventType(eventTypeId: number, eventType: EventTypeDTO) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedType = await eventTypesApi.update(eventTypeId, eventType);
        const index = this.eventTypes.findIndex(type => type.id === eventTypeId);
        if (index !== -1) {
          this.eventTypes[index] = updatedType;
        }
        return updatedType;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при обновлении типа события';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteEventType(eventTypeId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await eventTypesApi.delete(eventTypeId);
        this.eventTypes = this.eventTypes.filter(type => type.id !== eventTypeId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при удалении типа события';
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
}); 