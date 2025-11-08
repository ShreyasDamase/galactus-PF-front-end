'use client';

import { Column, Heading, Schema, Spinner, Text } from "@once-ui-system/core";
import { baseURL, about, person, work } from "@/resources";
import { Projects } from "@/components/work/Projects";
import { useProjects } from "@/lib/hooks/useProject";

export default function Work() {
  const { data:projectData, isLoading, error } = useProjects({
    page: 1,
    limit: 10,
    sortBy: 'publishedAt',
    sortOrder: 'desc'
  });
console.log("first",projectData)
  return (
    <Column maxWidth="m" paddingTop="24">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={work.path}
        title={work.title}
        description={work.description}
        image={`/api/og/generate?title=${encodeURIComponent(work.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      
      <Heading marginBottom="l" variant="heading-strong-xl" align="center">
        {work.title}
      </Heading>

      {/* Loading State */}
      {isLoading && (
        <Column fillWidth align="center" paddingY="xl">
          <Spinner size="l" />
          <Text variant="body-default-s" onBackground="neutral-weak" marginTop="m">
            Loading projects...
          </Text>
        </Column>
      )}

      {/* Error State */}
      {error && (
        <Column fillWidth align="center" paddingY="xl">
          <Text variant="body-default-l" onBackground="danger-strong">
            Failed to load projects. Please try again later.
          </Text>
        </Column>
      )}

      {/* Projects List */}
      {projectData && !isLoading && !error && (
        <>
          <Projects projects={projectData?.projects} />
          
          {/* Pagination Info */}
          {projectData?.pagination && (
            <Column fillWidth align="center" paddingY="m">
              <Text variant="body-default-s" onBackground="neutral-weak">
                Showing {projectData.projects.length} of {projectData.pagination.total} projects
              </Text>
            </Column>
          )}
        </>
      )}
    </Column>
  );
}