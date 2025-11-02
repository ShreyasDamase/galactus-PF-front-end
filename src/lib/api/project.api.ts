// src/lib/api/projects.api.ts
import { apiClient } from './apiClient';
import type { 
  ProjectResponse,
  MultipleProjectsResponse,
  SingleProjectResponse,
  PublicProjectsQueryParams,
  PaginatedProjectsResponse
} from   "../types/project.type"

const BASE_PATH = '/public/projects';

export const projectsApi = {
  /**
   * Get all public projects (paginated with filters)
   * PUBLIC - No auth required
   */
  getAllProjects: (params?: PublicProjectsQueryParams) => {
    const queryString = params ? new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString() : '';
    
    return apiClient.get<MultipleProjectsResponse>(
      `${BASE_PATH}${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Get single public project by slug or ID
   * PUBLIC - No auth required
   */
  getProject: (slugOrId: string) =>
    apiClient.get<SingleProjectResponse>(`${BASE_PATH}/${slugOrId}`),

  /**
   * Get projects by category
   * PUBLIC - No auth required
   */
  getProjectsByCategory: (category: string, page: number = 1, limit: number = 10) =>
    apiClient.get<MultipleProjectsResponse>(
      `${BASE_PATH}?category=${category}&page=${page}&limit=${limit}`
    ),

  /**
   * Get projects by tag
   * PUBLIC - No auth required
   */
  getProjectsByTag: (tag: string, page: number = 1, limit: number = 10) =>
    apiClient.get<MultipleProjectsResponse>(
      `${BASE_PATH}?tags=${tag}&page=${page}&limit=${limit}`
    ),

  /**
   * Get projects by technology stack
   * PUBLIC - No auth required
   */
  getProjectsByTech: (tech: string, page: number = 1, limit: number = 10) =>
    apiClient.get<MultipleProjectsResponse>(
      `${BASE_PATH}?technologyStack=${tech}&page=${page}&limit=${limit}`
    ),

  /**
   * Search projects
   * PUBLIC - No auth required
   */
  searchProjects: (query: string, page: number = 1, limit: number = 10) =>
    apiClient.get<MultipleProjectsResponse>(
      `${BASE_PATH}?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    ),

  /**
   * Like a project
   * PUBLIC - No auth required
   */
  likeProject: (projectId: string) =>
    apiClient.patch<{ likes: number }>(`/projects/${projectId}/like`),

  /**
   * Unlike a project
   * PUBLIC - No auth required
   */
  unlikeProject: (projectId: string) =>
    apiClient.patch<{ likes: number }>(`/projects/${projectId}/unlike`),

  // ============================================
  // DOWNLOAD ENDPOINTS (to be implemented later)
  // ============================================

  /**
   * Download release artifact
   * PUBLIC - No auth required
   */
  downloadArtifact: (slug: string, artifactId: string) =>
    apiClient.get(`${BASE_PATH}/download/${slug}/artifact/${artifactId}`, {
      responseType: 'blob'
    }),

  /**
   * Download attached file
   * PUBLIC - No auth required
   */
  downloadFile: (slug: string, fileId: string) =>
    apiClient.get(`${BASE_PATH}/download/${slug}/file/${fileId}`, {
      responseType: 'blob'
    }),

  /**
   * Download via download button
   * PUBLIC - No auth required
   */
  downloadButton: (slug: string, buttonId: string) =>
    apiClient.get(`${BASE_PATH}/download/${slug}/button/${buttonId}`, {
      responseType: 'blob'
    }),
};