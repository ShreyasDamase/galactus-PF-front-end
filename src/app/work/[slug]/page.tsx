// No "use client" — Server Component ✅
// Fetches project on server → passes to ProjectDetailClient for interactions
import { notFound } from "next/navigation";
import { fetchProject, fetchProjects } from "@/lib/server/serverFetch";
import ProjectDetailClient from "@/components/work/ProjectDetailClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbStructuredData,
  buildProjectStructuredData,
} from "@/lib/seo";
import { Column, Heading } from "@once-ui-system/core";
import { Projects } from "@/components/work/Projects";
import { baseURL, work } from "@/resources";

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
    alternates: {
      canonical: `${baseURL}/work/${project.slug}`,
    },
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
  const projectData = await fetchProjects(1, 6);

  if (!project) {
    notFound();
  }

  const relatedProjects = (projectData?.projects ?? [])
    .filter(
      (item) =>
        item.slug !== project.slug &&
        (item.category === project.category ||
          item.tags?.some((tag) => project.tags?.includes(tag)))
    )
    .slice(0, 3);

  return (
    <Column
      fillWidth
      horizontal="center"
      gap="0"
      style={{ width: "100%" }}
    >
      <JsonLd
        data={[
          buildProjectStructuredData(project),
          buildBreadcrumbStructuredData([
            { name: "Home", path: "/" },
            { name: "Work", path: work.path },
            { name: project.title, path: `/work/${project.slug}` },
          ]),
        ]}
      />
      <ProjectDetailClient initialProject={project} />
      {relatedProjects.length > 0 && (
        <Column
          maxWidth="m"
          fillWidth
          paddingTop="8"
          paddingBottom="32"
          gap="12"
          style={{ width: "100%" }}
        >
          <Heading as="h2" variant="heading-strong-l">
            Explore related projects
          </Heading>
          <Projects projects={relatedProjects.slice(0, 2)} compact />
        </Column>
      )}
    </Column>
  );
}
