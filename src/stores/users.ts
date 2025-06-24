import { defineStore } from 'pinia';
import { usersApi } from '../api/users';
import type { UserRegistrationRequestDto, UserRegistrationResponseDto } from '../types/api';

interface UsersState {
  users: UserRegistrationResponseDto[];
  currentUser: UserRegistrationResponseDto | null;
  isLoading: boolean;
  error: string | null;
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    currentUser: null,
    isLoading: false,
    error: null
  }),

  getters: {
    getAllUsers: (state) => state.users,
    getCurrentUser: (state) => state.currentUser,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },

  actions: {
    async fetchUsers() {
      this.isLoading = true;
      this.error = null;
      try {
        const users = await usersApi.getAll();
        this.users = users;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке пользователей';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUserById(userId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const user = await usersApi.getById(userId);
        this.currentUser = user;
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          this.users[index] = user;
        } else {
          this.users.push(user);
        }
        return user;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке пользователя';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async registerUser(userData: UserRegistrationRequestDto) {
      this.isLoading = true;
      this.error = null;
      try {
        const newUser = await usersApi.register(userData);
        this.users.push(newUser);
        return newUser;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при регистрации пользователя';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateUser(userId: number, userData: UserRegistrationRequestDto) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedUser = await usersApi.update(userId, userData);
        const index = this.users.findIndex(user => user.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        if (this.currentUser?.id === userId) {
          this.currentUser = updatedUser;
        }
        return updatedUser;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при обновлении пользователя';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteUser(userId: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await usersApi.delete(userId);
        this.users = this.users.filter(user => user.id !== userId);
        if (this.currentUser?.id === userId) {
          this.currentUser = null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при удалении пользователя';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCurrentUser() {
      this.isLoading = true;
      this.error = null;
      try {
        const user = await usersApi.getMe();
        this.currentUser = user;
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = user;
        } else {
          this.users.push(user);
        }
        return user;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке текущего пользователя';
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
}); 