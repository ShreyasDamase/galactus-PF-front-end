// src/lib/types/comment.types.ts

export interface Comment {
  _id: string;
  blogId: string;
  parentId: string | null;
  guestName: string;
  guestEmail: string;
  content: string;
  ipAddress?: string;
  userAgent?: string;
  isApproved: boolean;
  isEdited: boolean;
  editedAt?: string;
  likes: number;
  isFlagged: boolean;
  flagReason?: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
  replyCount?: number;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  blogId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateCommentRequest {
  guestName: string;
  guestEmail: string;
  content: string;
  parentId?: string | null;
}

export interface CommentStatsResponse {
  overview: {
    total: number;
    pending: number;
    approved: number;
    flagged: number;
  };
  recentComments: Comment[];
  mostCommentedPosts: Array<{
    _id: string;
    count: number;
  }>;
}