// components/work/Projects.tsx
'use client';

import { Column } from "@once-ui-system/core";
import { ProjectCard } from "@/components";
import { ProjectResponse } from "@/lib/types/project.type";
 
interface ProjectsProps {
  projects: ProjectResponse[];
  range?: [number, number?];
  exclude?: string[];
  compact?: boolean;
}

export function Projects({ projects, range, exclude, compact = false }: ProjectsProps) {
  let filteredProjects = projects;

  // Exclude projects by slug
  if (exclude && exclude.length > 0) {
    filteredProjects = filteredProjects.filter(
      (project) => !exclude.includes(project.slug)
    );
  }

  // Apply range if provided
  const displayedProjects = range
    ? filteredProjects.slice(range[0] - 1, range[1] ?? filteredProjects.length)
    : filteredProjects;

  return (
    <Column
      fillWidth
      gap={compact ? "16" : "xl"}
      marginBottom={compact ? "0" : "40"}
      paddingX={compact ? "0" : "l"}
    >
      {displayedProjects.map((project, index) => (
        <ProjectCard
          key={project.id}
          priority={index < 2}
          compact={compact}
          href={`/work/${project.slug}`}
          images={project.screenshots.map(s => s.url)}
          coverImage={project.coverImage}
          title={project.title}
          summary={project.summary}
          description={project.documentDescription}
          tags={project.tags}
          technologyStack={project.technologyStack}
          views={project.views}
          likes={project.likes}
          publishedAt={project.publishedAt}
          avatars={project.contributors?.map((c) => ({ src: c.avatar || '' })) || []}
          hasReleases={project.releases.length > 0}
          releaseCount={project.releases.length}
        />
      ))}
    </Column>
  );
}
