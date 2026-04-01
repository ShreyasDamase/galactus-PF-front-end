// No "use client" — Server Component ✅
// Fetches project on server → passes to ProjectDetailClient for interactions
import { notFound } from "next/navigation";
import { fetchProject } from "@/lib/server/serverFetch";
import ProjectDetailClient from "@/components/work/ProjectDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate SEO metadata per project
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const project = await fetchProject(slug);

  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.title} | Portfolio`,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: project.coverImage
        ? [{ url: project.coverImage, alt: project.title }]
        : [`/api/og/generate?title=${encodeURIComponent(project.title)}`],
      type: "article",
      publishedTime: project.publishedAt,
      tags: project.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images: project.coverImage ? [project.coverImage] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch on server — project content is in HTML before browser gets it ✅
  const project = await fetchProject(slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient initialProject={project} />;
}
