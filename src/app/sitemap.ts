import type { MetadataRoute } from "next";
import { baseURL, routes as routesConfig } from "@/resources";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "";
const USER_ID = process.env.NEXT_PUBLIC_USER_TO_FETCH || "";

async function fetchAllBlogEntries() {
  const posts: Array<{ slug: string; publishedAt: string }> = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const res = await fetch(`${API_BASE}/blog/posts-pub/?page=${page}`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": USER_ID,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) break;

    const json = await res.json();
    const data = json.success ? json.data : json;
    posts.push(...(data.posts || []).map((post: { slug: string; publishedAt: string }) => ({
      slug: post.slug,
      publishedAt: post.publishedAt,
    })));

    hasNext = Boolean(data.pagination?.hasNext);
    page += 1;
  }

  return posts;
}

async function fetchAllProjectEntries() {
  const projects: Array<{ slug: string; updatedAt?: string; publishedAt: string }> = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const res = await fetch(
      `${API_BASE}/projects/projects-pub/?page=${page}&limit=50&sortBy=publishedAt&sortOrder=desc`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": USER_ID,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) break;

    const json = await res.json();
    const data = json.success ? json.data : json;
    projects.push(
      ...(data.projects || []).map(
        (project: { slug: string; updatedAt?: string; publishedAt: string }) => ({
          slug: project.slug,
          updatedAt: project.updatedAt,
          publishedAt: project.publishedAt,
        })
      )
    );

    hasNext = Boolean(data.pagination?.hasNext);
    page += 1;
  }

  return projects;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, works] = await Promise.all([
    fetchAllBlogEntries(),
    fetchAllProjectEntries(),
  ]);

  const activeRoutes = Object.keys(routesConfig).filter(
    (route) =>
      routesConfig[route as keyof typeof routesConfig] && route !== "/reading-list"
  );

  const routes = activeRoutes.map((route) => ({
    url: `${baseURL}${route !== "/" ? route : ""}`,
    lastModified: new Date(),
  }));

  return [
    ...routes,
    ...blogs.map((post) => ({
      url: `${baseURL}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
    })),
    ...works.map((project) => ({
      url: `${baseURL}/work/${project.slug}`,
      lastModified: new Date(project.updatedAt || project.publishedAt),
    })),
  ];
}
