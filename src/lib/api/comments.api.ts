// src/lib/api/comments.api.ts
import { apiClient } from './apiClient';
import { 
  Comment, 
  CommentsResponse, 
  CreateCommentRequest,
  CommentStatsResponse 
} from '../types/comment.types';

const BASE_PATH = '/comments';

export const commentsApi = {
  /**
   * Get all comments for a blog post (with nested replies)
   * PUBLIC - No auth required
   */
  getComments: (blogId: string, includeUnapproved: boolean = false) =>
    apiClient.get<CommentsResponse>(
      `${BASE_PATH}/posts/${blogId}/comments?includeUnapproved=${includeUnapproved}`
    ),

  /**
   * Create a new comment (guest or authenticated)
   * PUBLIC - No auth required
   */
  createComment: (blogId: string, data: CreateCommentRequest) =>
    apiClient.post<Comment>(`${BASE_PATH}/posts/${blogId}/comments`, data),

  /**
   * Like a comment
   * PUBLIC - No auth required
   */
  likeComment: (commentId: string) =>
    apiClient.patch<{ likes: number }>(`${BASE_PATH}/comments/${commentId}/like`),

  /**
   * Unlike a comment
   * PUBLIC - No auth required
   */
  unlikeComment: (commentId: string) =>
    apiClient.patch<{ likes: number }>(`${BASE_PATH}/comments/${commentId}/unlike`),

  // ============================================
  // PROTECTED ROUTES (Admin/Author only)
  // ============================================

  /**
   * Get pending comments for moderation
   * PROTECTED - Auth required
   */
  getPendingComments: (page: number = 1, limit: number = 20) =>
    apiClient.get<CommentsResponse>(
      `${BASE_PATH}/comments/pending?page=${page}&limit=${limit}`
    ),

  /**
   * Get flagged comments
   * PROTECTED - Auth required
   */
  getFlaggedComments: (page: number = 1, limit: number = 20) =>
    apiClient.get<CommentsResponse>(
      `${BASE_PATH}/comments/flagged?page=${page}&limit=${limit}`
    ),

  /**
   * Get comment statistics
   * PROTECTED - Auth required
   */
  getCommentStats: () =>
    apiClient.get<CommentStatsResponse>(`${BASE_PATH}/comments/stats`),

  /**
   * Approve a comment
   * PROTECTED - Auth required
   */
  approveComment: (commentId: string) =>
    apiClient.patch<Comment>(`${BASE_PATH}/comments/${commentId}/approve`),

  /**
   * Flag a comment as spam/abuse
   * PROTECTED - Auth required
   */
  flagComment: (commentId: string, reason?: string) =>
    apiClient.patch<Comment>(`${BASE_PATH}/comments/${commentId}/flag`, { reason }),

  /**
   * Unflag a comment
   * PROTECTED - Auth required
   */
  unflagComment: (commentId: string) =>
    apiClient.patch<Comment>(`${BASE_PATH}/comments/${commentId}/unflag`),

  /**
   * Update comment content
   * PROTECTED - Auth required
   */
  updateComment: (commentId: string, content: string) =>
    apiClient.put<Comment>(`${BASE_PATH}/comments/${commentId}`, { content }),

  /**
   * Delete a comment
   * PROTECTED - Auth required
   */
  deleteComment: (commentId: string) =>
    apiClient.delete(`${BASE_PATH}/comments/${commentId}`),

  /**
   * Bulk approve comments
   * PROTECTED - Auth required
   */
  bulkApprove: (commentIds: string[]) =>
    apiClient.post(`${BASE_PATH}/comments/bulk/approve`, { commentIds }),

  /**
   * Bulk delete comments
   * PROTECTED - Auth required
   */
  bulkDelete: (commentIds: string[]) =>
    apiClient.post(`${BASE_PATH}/comments/bulk/delete`, { commentIds }),
};