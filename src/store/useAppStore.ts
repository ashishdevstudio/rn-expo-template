import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';

export type AppState = {
  hasCompletedOnboarding: boolean;
  hasHydrated: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
  reset: () => void;
};

const initialState = {
  hasCompletedOnboarding: false,
} as const;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      hasHydrated: false,
      setHasCompletedOnboarding: (value) => {
        set({ hasCompletedOnboarding: value });
      },
      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: STORAGE_KEYS.APP_STATE,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
      onRehydrateStorage: (state) => (rehydratedState, error) => {
        if (error) {
          console.error('Failed to hydrate app state.', error);
        }

        (rehydratedState ?? state).setHasHydrated(true);
      },
    },
  ),
);
