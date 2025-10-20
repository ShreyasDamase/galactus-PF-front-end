// src/lib/hooks/useProfile.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/endpoints';
import { useProfileStore } from '../store/useProfileStore';

// Query Keys
export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
  analytics: () => [...profileKeys.all, 'analytics'] as const,
  stats: () => [...profileKeys.all, 'stats'] as const,
};

/**
 * Hook to fetch user profile data
 * Automatically syncs with Zustand store
 */
export function useProfile() {
  const setProfile = useProfileStore((state) => state.setProfile);
  const setLoading = useProfileStore((state) => state.setLoading);
  const setError = useProfileStore((state) => state.setError);
const userId = "68e909b4019fb5fa1c2cb292";

  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: async () => {
      try {
        setLoading(true);
        
        const response = await profileApi.getProfile(userId);
        
        // Sync with Zustand store
        setProfile(response.data);
        setError(null);
        
        return response.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
}