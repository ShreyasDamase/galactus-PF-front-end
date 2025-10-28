// src/lib/hooks/useComments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../api/comments.api';
import { CreateCommentRequest } from '../types/comment.types';

/**
 * Query Keys Factory
 */
export const commentsKeys = {
  all: ['comments'] as const,
  lists: () => [...commentsKeys.all, 'list'] as const,
  list: (blogId: string) => [...commentsKeys.lists(), blogId] as const,
  pending: (page: number) => [...commentsKeys.all, 'pending', page] as const,
  flagged: (page: number) => [...commentsKeys.all, 'flagged', page] as const,
  stats: () => [...commentsKeys.all, 'stats'] as const,
};

/**
 * Hook: Fetch comments for a blog post
 */
export function useComments(blogId: string, includeUnapproved: boolean = false) {
  return useQuery({
    queryKey: commentsKeys.list(blogId),
    queryFn: async () => {
      const response = await commentsApi.getComments(blogId, includeUnapproved);
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: !!blogId,
  });
}

/**
 * Hook: Create a new comment
 */
export function useCreateComment(blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => 
      commentsApi.createComment(blogId, data),
    onSuccess: () => {
      // Invalidate comments list to refetch
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.list(blogId) 
      });
    },
  });
}

/**
 * Hook: Like a comment
 */
export function useLikeComment(blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => 
      commentsApi.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.list(blogId) 
      });
    },
  });
}

/**
 * Hook: Unlike a comment
 */
export function useUnlikeComment(blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => 
      commentsApi.unlikeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.list(blogId) 
      });
    },
  });
}

/**
 * Hook: Get pending comments (Admin)
 */
export function usePendingComments(page: number = 1) {
  return useQuery({
    queryKey: commentsKeys.pending(page),
    queryFn: async () => {
      const response = await commentsApi.getPendingComments(page);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook: Get flagged comments (Admin)
 */
export function useFlaggedComments(page: number = 1) {
  return useQuery({
    queryKey: commentsKeys.flagged(page),
    queryFn: async () => {
      const response = await commentsApi.getFlaggedComments(page);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Hook: Get comment stats (Admin)
 */
export function useCommentStats() {
  return useQuery({
    queryKey: commentsKeys.stats(),
    queryFn: async () => {
      const response = await commentsApi.getCommentStats();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook: Approve comment (Admin)
 */
export function useApproveComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => 
      commentsApi.approveComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.pending(1) 
      });
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.stats() 
      });
    },
  });
}

/**
 * Hook: Flag comment (Admin)
 */
export function useFlagComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, reason }: { commentId: string; reason?: string }) => 
      commentsApi.flagComment(commentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.flagged(1) 
      });
    },
  });
}

/**
 * Hook: Delete comment (Admin)
 */
export function useDeleteComment(blogId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => 
      commentsApi.deleteComment(commentId),
    onSuccess: () => {
      if (blogId) {
        queryClient.invalidateQueries({ 
          queryKey: commentsKeys.list(blogId) 
        });
      }
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.pending(1) 
      });
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.stats() 
      });
    },
  });
}

/**
 * Hook: Update comment (Admin)
 */
export function useUpdateComment(blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) => 
      commentsApi.updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.list(blogId) 
      });
    },
  });
}

/**
 * Hook: Bulk approve comments (Admin)
 */
export function useBulkApproveComments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentIds: string[]) => 
      commentsApi.bulkApprove(commentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.pending(1) 
      });
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.stats() 
      });
    },
  });
}

/**
 * Hook: Bulk delete comments (Admin)
 */
export function useBulkDeleteComments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentIds: string[]) => 
      commentsApi.bulkDelete(commentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.all 
      });
    },
  });
}