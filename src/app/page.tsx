"use client";

import {
  Heading,
  Text,
  Button,
  Avatar,
  RevealFx,
  Column,
  Badge,
  Row,
  Schema,
  Line,
} from "@once-ui-system/core";
import { home, about, person, baseURL, routes, work, blog } from "@/resources";
import { Posts } from "@/components/blog/Posts";
import { Projects } from "@/components/work/Projects";
import About from "@/app/about/page";
import Work from "@/app/work/page";
import Blog from "@/app/blog/page";
import { useProjects } from "@/lib/hooks/useProject";
import { usePostsList } from "@/lib/hooks/usePosts";
import { ContactForm } from "@/components/Mailchimp";

export default function Home() {
  // Fetch projects data for conditional rendering
  const { data: projectData } = useProjects({
    page: 1,
    limit: 6,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });

  // Fetch blog posts for conditional rendering
  const { data: postsData } = usePostsList(1);

  const posts = postsData?.posts || [];

  return (
    <Column maxWidth="m" gap="xl" paddingY="12" horizontal="center">
      {/* Hero Section - Preserved Animation */}
      {/* About Section */}
      <Column fillWidth gap="24" marginTop="1" id="about-section">
        {/* <RevealFx translateY="8" delay={0.2}>
          <Row fillWidth horizontal="center" marginY="1">
            <Heading as="h2" variant="display-strong-l">
              About Me
            </Heading>
          </Row>
        </RevealFx> */}

        <RevealFx translateY="16" delay={0.3}>
          <About isContactFormVisible={false} />
        </RevealFx>

        <RevealFx translateY="12" delay={0.4}>
          <Row fillWidth paddingLeft="64" horizontal="end">
            <Line maxWidth={48} />
          </Row>
        </RevealFx>
      </Column>
      {/* Work/Projects Section */}
      {routes["/work"] && (
        <Column fillWidth gap="24" marginTop="xl" id="work-section">
          <RevealFx translateY="8" delay={0.6}>
            <Row fillWidth horizontal="center" marginY="l">
              <Heading as="h2" variant="display-strong-l">
                My Work
              </Heading>
            </Row>
          </RevealFx>

          <RevealFx translateY="16" delay={0.7}>
            <Work />
          </RevealFx>

          <RevealFx translateY="12" delay={0.8}>
            <Row fillWidth paddingLeft="64" horizontal="end">
              <Line maxWidth={48} />
            </Row>
          </RevealFx>
        </Column>
      )}
      {/* Blog Section */}
      {routes["/blog"] && (
        <Column fillWidth gap="24" marginTop="xl" id="blog-section">
          <RevealFx translateY="8" delay={1.0}>
            <Row fillWidth horizontal="center" marginY="l">
              <Heading as="h2" variant="display-strong-l">
                Latest from the Blog
              </Heading>
            </Row>
          </RevealFx>

          <RevealFx translateY="16" delay={1.1}>
            <Blog />
          </RevealFx>

          <RevealFx translateY="12" delay={1.2}>
            <Row fillWidth paddingLeft="64" horizontal="end">
              <Line maxWidth={48} />
            </Row>
          </RevealFx>
        </Column>
      )}
      <RevealFx translateY="16" delay={1.3}>
        <ContactForm />
      </RevealFx>
    </Column>
  );
}
