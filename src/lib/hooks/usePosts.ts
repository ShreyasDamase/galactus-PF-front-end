import { useQuery, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/posts.api';
import { usePostsStore } from '../store/usePostsStore';
 

/**
 * Query Keys Factory
 * Organize all query keys in one place
 */
export const postsKeys = {
  all: ['posts'] as const,
  lists: () => [...postsKeys.all, 'list'] as const,
  list: (page: number) => [...postsKeys.lists(), page] as const,
  details: () => [...postsKeys.all, 'detail'] as const,
  detail: (slug: string) => [...postsKeys.details(), slug] as const,
  search: (query: string, page: number) => [...postsKeys.all, 'search', query, page] as const,
  category: (category: string, page: number) => [...postsKeys.all, 'category', category, page] as const,
  tag: (tag: string, page: number) => [...postsKeys.all, 'tag', tag, page] as const,
};

/**
 * Hook: Fetch paginated posts list
 */
export function usePostsList(page: number = 1) {
  const setPagination = usePostsStore((state) => state.setPagination);

  return useQuery({
    queryKey: postsKeys.list(page),
    queryFn: async () => {
      const response = await postsApi.getList(page);
      // Sync pagination to Zustand for UI state
      setPagination(response.data.pagination);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - posts list changes frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

/**
 * Hook: Fetch single post by slug
 */
export function usePostDetail(slug: string) {
  return useQuery({
    queryKey: postsKeys.detail(slug),
    queryFn: async () => {
      const response = await postsApi.getBySlug(slug);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - individual posts change less
    gcTime: 30 * 60 * 1000, // 30 minutes - keep longer
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch on focus for detail views
    enabled: !!slug, // Only run if slug exists
  });
}

/**
 * Hook: Search posts
 */
export function usePostsSearch(query: string, page: number = 1) {
  return useQuery({
    queryKey: postsKeys.search(query, page),
    queryFn: async () => {
      const response = await postsApi.search(query, page);
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: query.length > 0, // Only search if query exists
  });
}

/**
 * Hook: Get posts by category
 */
export function usePostsByCategory(category: string, page: number = 1) {
  return useQuery({
    queryKey: postsKeys.category(category, page),
    queryFn: async () => {
      const response = await postsApi.getByCategory(category, page);
      return response.data;
    },
    staleTime: 3 * 60 * 1000,
    enabled: !!category,
  });
}

/**
 * Hook: Prefetch next page for better UX
 */
export function usePrefetchNextPage(currentPage: number) {
  const queryClient = useQueryClient();

  const prefetchNext = () => {
    queryClient.prefetchQuery({
      queryKey: postsKeys.list(currentPage + 1),
      queryFn: async () => {
        const response = await postsApi.getList(currentPage + 1);
        return response.data;
      },
    });
  };

  return { prefetchNext };
}
