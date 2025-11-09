import { apiClient } from "../api/apiClient";
import { BlogPost, PostsListResponse } from "../types";

const BASE_PATH = "/blog";

export const postsApi = {
  /**
   * Fetch paginated list of posts
   */
  getList: (page: number = 1) =>
    apiClient.get<PostsListResponse>(`${BASE_PATH}/posts-pub/?page=${page}`, {
      headers: {
        "x-user-id": process.env.NEXT_PUBLIC_USER_TO_FETCH,
      },
    }),

  /**
   * Fetch single post by slug
   */
  getBySlug: (slug: string) =>
    apiClient.get<BlogPost>(`${BASE_PATH}/posts/${slug}`),

  /**
   * Search posts by query
   */
  search: (query: string, page: number = 1) =>
    apiClient.get<PostsListResponse>(
      `${BASE_PATH}/search?q=${query}&page=${page}`
    ),

  /**
   * Get posts by category
   */
  getByCategory: (category: string, page: number = 1) =>
    apiClient.get<PostsListResponse>(
      `${BASE_PATH}/category/${category}?page=${page}`
    ),

  /**
   * Get posts by tag
   */
  getByTag: (tag: string, page: number = 1) =>
    apiClient.get<PostsListResponse>(`${BASE_PATH}/tag/${tag}?page=${page}`),
};
