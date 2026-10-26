import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants/storage';
import { queryClient } from '@/services/queryClient';
import { secureStorage } from '@/services/secureStorage';
import { storage } from '@/services/storage';
import type { AuthSession, AuthUser } from '@/types/auth';

export type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  initialize: () => Promise<void>;
  setSession: (session: AuthSession) => Promise<void>;
  clearSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  initialize: async () => {
    set({ isInitializing: true });

    try {
      const [accessToken, user] = await Promise.all([
        secureStorage.get(STORAGE_KEYS.ACCESS_TOKEN),
        storage.get<AuthUser>(STORAGE_KEYS.AUTH_USER),
      ]);

      set({
        user: accessToken ? user : null,
        isAuthenticated: Boolean(accessToken),
      });
    } catch (error) {
      console.error('Failed to initialize the session.', error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isInitializing: false });
    }
  },

  setSession: async (session) => {
    if (session.refreshToken) {
      await secureStorage.set(STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken);
    } else {
      await secureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    }

    await secureStorage.set(STORAGE_KEYS.ACCESS_TOKEN, session.accessToken);

    if (session.user) {
      await storage.set(STORAGE_KEYS.AUTH_USER, session.user);
    } else {
      await storage.remove(STORAGE_KEYS.AUTH_USER);
    }

    set({
      user: session.user ?? null,
      isAuthenticated: true,
      isInitializing: false,
    });
  },

  clearSession: async () => {
    try {
      await Promise.all([
        secureStorage.remove(STORAGE_KEYS.ACCESS_TOKEN),
        secureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN),
        storage.remove(STORAGE_KEYS.AUTH_USER),
      ]);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isInitializing: false,
      });
      queryClient.clear();
    }
  },
}));
