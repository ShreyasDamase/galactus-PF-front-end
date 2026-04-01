// Server Component — composes all sections ✅
// Child pages (About, Work, Blog) are also server components that fetch their own data
import {
  Heading,
  Column,
  Row,
  RevealFx,
  Line,
} from "@once-ui-system/core";
import { routes } from "@/resources";
import About from "@/app/about/page";
import Work from "@/app/work/page";
import Blog from "@/app/blog/page";

export default async function Home() {
  return (
    <Column maxWidth="m" gap="xl" paddingY="12" horizontal="center">
      {/* About Section */}
      <Column fillWidth gap="24" marginTop="1" id="about-section">
        <RevealFx translateY="16" delay={0.3}>
          <About />
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
    </Column>
  );
}
