// src/lib/hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 
 import { projectsApi } from '../api/project.api';
import { PublicProjectsQueryParams } from '../types/project.type';

/**
 * Query Keys Factory
 */
export const projectsKeys = {
  all: ['projects'] as const,
  lists: () => [...projectsKeys.all, 'list'] as const,
  list: (params?: PublicProjectsQueryParams) => [...projectsKeys.lists(), params] as const,
  details: () => [...projectsKeys.all, 'detail'] as const,
  detail: (slugOrId: string) => [...projectsKeys.details(), slugOrId] as const,
  category: (category: string, page: number) => [...projectsKeys.all, 'category', category, page] as const,
  tag: (tag: string, page: number) => [...projectsKeys.all, 'tag', tag, page] as const,
  tech: (tech: string, page: number) => [...projectsKeys.all, 'tech', tech, page] as const,
  search: (query: string, page: number) => [...projectsKeys.all, 'search', query, page] as const,
};

/**
 * Hook: Fetch all public projects with filters
 */
export function useProjects(params?: PublicProjectsQueryParams) {
  return useQuery({
    queryKey: projectsKeys.list(params),
    queryFn: async () => {
      const response = await projectsApi.getAllProjects(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook: Fetch single project by slug or ID
 */
export function useProject(slugOrId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: projectsKeys.detail(slugOrId),
    queryFn: async () => {
      const response = await projectsApi.getProject(slugOrId);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: enabled && !!slugOrId,
  });
}

/**
 * Hook: Fetch projects by category
 */
export function useProjectsByCategory(
  category: string, 
  page: number = 1, 
  limit: number = 10
) {
  return useQuery({
    queryKey: projectsKeys.category(category, page),
    queryFn: async () => {
      const response = await projectsApi.getProjectsByCategory(category, page, limit);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!category,
  });
}

/**
 * Hook: Fetch projects by tag
 */
export function useProjectsByTag(
  tag: string, 
  page: number = 1, 
  limit: number = 10
) {
  return useQuery({
    queryKey: projectsKeys.tag(tag, page),
    queryFn: async () => {
      const response = await projectsApi.getProjectsByTag(tag, page, limit);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!tag,
  });
}

/**
 * Hook: Fetch projects by technology
 */
export function useProjectsByTech(
  tech: string, 
  page: number = 1, 
  limit: number = 10
) {
  return useQuery({
    queryKey: projectsKeys.tech(tech, page),
    queryFn: async () => {
      const response = await projectsApi.getProjectsByTech(tech, page, limit);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!tech,
  });
}

/**
 * Hook: Search projects
 */
export function useSearchProjects(
  query: string, 
  page: number = 1, 
  limit: number = 10,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: projectsKeys.search(query, page),
    queryFn: async () => {
      const response = await projectsApi.searchProjects(query, page, limit);
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute for search results
    enabled: enabled && query.length >= 2, // Only search if query has at least 2 chars
  });
}

/**
 * Hook: Like a project
 */
export function useLikeProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => 
      projectsApi.likeProject(projectId),
    onSuccess: (_, projectId) => {
      // Invalidate specific project detail
      queryClient.invalidateQueries({ 
        queryKey: projectsKeys.detail(projectId) 
      });
      // Invalidate all project lists
      queryClient.invalidateQueries({ 
        queryKey: projectsKeys.lists() 
      });
    },
  });
}

/**
 * Hook: Unlike a project
 */
export function useUnlikeProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => 
      projectsApi.unlikeProject(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ 
        queryKey: projectsKeys.detail(projectId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: projectsKeys.lists() 
      });
    },
  });
}

/**
 * Hook: Download artifact (returns blob URL)
 */
export function useDownloadArtifact() {
  return useMutation({
    mutationFn: async ({ slug, artifactId }: { slug: string; artifactId: string }) => {
      const response = await projectsApi.downloadArtifact(slug, artifactId);
      // Create blob URL for download
      const blob = new Blob([response.data as ArrayBuffer]);
      const url = window.URL.createObjectURL(blob);
      return url;
    },
  });
}

/**
 * Hook: Download attached file (returns blob URL)
 */
export function useDownloadFile() {
  return useMutation({
    mutationFn: async ({ slug, fileId }: { slug: string; fileId: string }) => {
      const response = await projectsApi.downloadFile(slug, fileId);
      const blob = new Blob([response.data as BlobPart]);
      const url = window.URL.createObjectURL(blob);
      return url;
    },
  });
}