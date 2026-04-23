// No "use client" — this is a Server Component ✅
import { Column, Heading, Schema, Text } from "@once-ui-system/core";
import { baseURL, about, person, work } from "@/resources";
import { Projects } from "@/components/work/Projects";
import { fetchProjects } from "@/lib/server/serverFetch";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbStructuredData,
  buildCollectionPageStructuredData,
} from "@/lib/seo";

export async function generateMetadata() {
  return {
    title: work.title,
    description: work.description,
    alternates: {
      canonical: `${baseURL}${work.path}`,
    },
    openGraph: {
      title: work.title,
      description: work.description,
      images: [`/api/og/generate?title=${encodeURIComponent(work.title)}`],
    },
  };
}

export default async function Work({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  // Runs on server — Google sees project cards fully rendered ✅
  const projectData = await fetchProjects(1, 10);
  const projects = projectData?.projects ?? [];

  return (
    <Column maxWidth="m" paddingTop="24">
      <JsonLd
        data={[
          buildCollectionPageStructuredData({
            title: work.title,
            description: work.description,
            path: work.path,
            items: projects.map((project) => ({
              name: project.title,
              path: `/work/${project.slug}`,
            })),
          }),
          buildBreadcrumbStructuredData([
            { name: "Home", path: "/" },
            { name: "Work", path: work.path },
          ]),
        ]}
      />
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

      {!hideHeader && (
        <Heading marginBottom="l" variant="heading-strong-xl" align="center">
          My work
        </Heading>
      )}

      {projects.length === 0 && (
        <Column fillWidth align="center" paddingY="xl">
          <Text variant="body-default-s" onBackground="neutral-weak">
            No projects published yet.
          </Text>
        </Column>
      )}

      {projects.length > 0 && (
        <>
          <Projects projects={projects} />
          {projectData?.pagination && (
            <Column fillWidth align="center" paddingY="m">
              <Text variant="body-default-s" onBackground="neutral-weak">
                Showing {projects.length} of {projectData.pagination.total}{" "}
                projects
              </Text>
            </Column>
          )}
        </>
      )}
    </Column>
  );
}
