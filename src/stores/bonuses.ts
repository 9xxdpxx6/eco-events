import { defineStore } from 'pinia';
import { bonusTypesApi, bonusHistoryApi } from '../api/bonuses';
import type { BonusTypeDTO, UserBonusHistoryDTO } from '../types/api';

interface BonusesState {
  bonusTypes: BonusTypeDTO[];
  userBonusHistory: UserBonusHistoryDTO[];
  isLoading: boolean;
  error: string | null;
}

export const useBonusesStore = defineStore('bonuses', {
  state: (): BonusesState => ({
    bonusTypes: [],
    userBonusHistory: [],
    isLoading: false,
    error: null
  }),

  getters: {
    getBonusTypes: (state) => state.bonusTypes,
    getUserBonusHistory: (state) => state.userBonusHistory,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    async fetchBonusTypes() {
      this.isLoading = true;
      this.error = null;
      try {
        const types = await bonusTypesApi.getAll();
        this.bonusTypes = types;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке типов бонусов';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUserBonusHistory(userId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const history = await bonusHistoryApi.getByUserId(userId);
        this.userBonusHistory = history;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке истории бонусов';
      } finally {
        this.isLoading = false;
      }
    },

    async createBonusType(bonusType: BonusTypeDTO) {
      this.isLoading = true;
      this.error = null;
      try {
        const newType = await bonusTypesApi.create(bonusType);
        this.bonusTypes.push(newType);
        return newType;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при создании типа бонуса';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateBonusType(id: number, bonusType: BonusTypeDTO) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedType = await bonusTypesApi.update(id, bonusType);
        const index = this.bonusTypes.findIndex(type => type.id === id);
        if (index !== -1) {
          this.bonusTypes[index] = updatedType;
        }
        return updatedType;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при обновлении типа бонуса';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteBonusType(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await bonusTypesApi.delete(id);
        this.bonusTypes = this.bonusTypes.filter(type => type.id !== id);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при удалении типа бонуса';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createBonusHistory(bonusHistory: UserBonusHistoryDTO) {
      this.isLoading = true;
      this.error = null;
      try {
        const newHistory = await bonusHistoryApi.create(bonusHistory);
        this.userBonusHistory.push(newHistory);
        return newHistory;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при создании записи бонуса';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateBonusHistory(id: number, bonusHistory: UserBonusHistoryDTO) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedHistory = await bonusHistoryApi.update(id, bonusHistory);
        const index = this.userBonusHistory.findIndex(history => history.id === id);
        if (index !== -1) {
          this.userBonusHistory[index] = updatedHistory;
        }
        return updatedHistory;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при обновлении записи бонуса';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteBonusHistory(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await bonusHistoryApi.delete(id);
        this.userBonusHistory = this.userBonusHistory.filter(history => history.id !== id);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при удалении записи бонуса';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async activateBonus(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await bonusHistoryApi.activate(id);
        const history = this.userBonusHistory.find(h => h.id === id);
        if (history) {
          history.active = true;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при активации бонуса';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deactivateBonus(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await bonusHistoryApi.deactivate(id);
        const history = this.userBonusHistory.find(h => h.id === id);
        if (history) {
          history.active = false;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при деактивации бонуса';
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
}); 