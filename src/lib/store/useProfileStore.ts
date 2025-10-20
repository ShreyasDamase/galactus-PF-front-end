// src/lib/store/useProfileStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UserProfile } from '../types';
 
interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateProfileField: <K extends keyof UserProfile>(
    field: K,
    value: UserProfile[K]
  ) => void;
  clearProfile: () => void;
  
  // Computed values
  isProfileComplete: () => boolean;
  getFullName: () => string;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set, get) => ({
        profile: null,
        isLoading: false,
        error: null,

        setProfile: (profile) =>
          set({ profile, error: null }, false, 'setProfile'),

        setLoading: (isLoading) =>
          set({ isLoading }, false, 'setLoading'),

        setError: (error) =>
          set({ error, isLoading: false }, false, 'setError'),

        updateProfileField: (field, value) =>
          set(
            (state) => ({
              profile: state.profile
                ? { ...state.profile, [field]: value }
                : null,
            }),
            false,
            'updateProfileField'
          ),

        clearProfile: () =>
          set({ profile: null, error: null, isLoading: false }, false, 'clearProfile'),

        // Computed values
        isProfileComplete: () => {
          const { profile } = get();
          return profile ? profile.profileCompleteness >= 80 : false;
        },

        getFullName: () => {
          const { profile } = get();
          return profile?.fullName || 'Anonymous User';
        },
      }),
      {
        name: 'profile-storage',
        partialize: (state) => ({ profile: state.profile }),
      }
    )
  )
);