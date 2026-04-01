// src/lib/server/serverFetch.ts
// Shared server-side fetch utility — runs ONLY on the server (no "use client")
// Used by all server components to fetch data with ISR caching

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;
const USER_ID = process.env.NEXT_PUBLIC_USER_TO_FETCH!;

interface FetchOptions {
  revalidate?: number; // seconds for ISR — default 60s
  tags?: string[]; // cache tags for on-demand revalidation
}

/**
 * Core server fetch — wraps native fetch with base URL, auth headers, ISR config
 * Never use axios here — this only runs on the server
 */
async function serverGet<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T | null> {
  const { revalidate = 60, tags } = options;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": USER_ID,
      },
      next: {
        revalidate,
        ...(tags ? { tags } : {}),
      },
    });

    if (!res.ok) {
      console.error(`[serverFetch] ${path} returned ${res.status}`);
      return null;
    }

    const json = await res.json();
    // Handle both { success, data } wrapper and direct arrays
    return (json.success !== undefined ? json.data : json) as T;
  } catch (err) {
    console.error(`[serverFetch] Failed to fetch ${path}:`, err);
    return null;
  }
}

/**
 * Special POST for endpoints that require POST method (like /public-profile)
 */
async function serverPost<T>(
  path: string,
  body: Record<string, unknown> = {},
  options: FetchOptions = {}
): Promise<T | null> {
  const { revalidate = 300 } = options;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": USER_ID,
      },
      body: JSON.stringify(body),
      next: { revalidate },
    });

    if (!res.ok) {
      console.error(`[serverFetch POST] ${path} returned ${res.status}`);
      return null;
    }

    const json = await res.json();
    return (json.success !== undefined ? json.data : json) as T;
  } catch (err) {
    console.error(`[serverFetch POST] Failed to fetch ${path}:`, err);
    return null;
  }
}

// ─── Typed fetch helpers ────────────────────────────────────────────────────

import type { BlogPost, PostsListResponse, UserProfile } from "@/lib/types";
import type { PaginatedProjectsResponse, ProjectResponse } from "@/lib/types/project.type";

/** Fetch paginated blog posts list */
export async function fetchPosts(page = 1): Promise<PostsListResponse> {
  const data = await serverGet<PostsListResponse>(
    `/blog/posts-pub/?page=${page}`,
    { revalidate: 60, tags: ["posts"] }
  );
  return data ?? { posts: [], pagination: { current: 1, total: 0, count: 0, hasNext: false, hasPrev: false } };
}

/** Fetch single blog post by slug */
export async function fetchPost(slug: string): Promise<BlogPost | null> {
  return serverGet<BlogPost>(`/blog/posts/${slug}`, {
    revalidate: 120,
    tags: [`post-${slug}`],
  });
}

/** Fetch paginated projects list */
export async function fetchProjects(page = 1, limit = 10): Promise<PaginatedProjectsResponse | null> {
  return serverGet<PaginatedProjectsResponse>(
    `/projects/projects-pub/?page=${page}&limit=${limit}&sortBy=publishedAt&sortOrder=desc`,
    { revalidate: 60, tags: ["projects"] }
  );
}

/** Fetch single project by slug */
export async function fetchProject(slug: string): Promise<ProjectResponse | null> {
  return serverGet<ProjectResponse>(`/projects/projects-pub/${slug}`, {
    revalidate: 120,
    tags: [`project-${slug}`],
  });
}

/** Fetch public user profile */
export async function fetchProfile(): Promise<UserProfile | null> {
  return serverPost<UserProfile>(`/user-auth/public-profile`, {}, {
    revalidate: 300, // 5 mins — profile changes rarely
  });
}
