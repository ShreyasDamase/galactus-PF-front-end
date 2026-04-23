// Server Component — composes all sections ✅
// Child pages (About, Work, Blog) are also server components that fetch their own data
import { Heading, Column, Row, RevealFx, Line } from "@once-ui-system/core";
import { routes } from "@/resources";
import About from "@/app/about/page";
import Videos from "@/app/videos/page";
import Work from "@/app/work/page";
import Blog from "@/app/blog/page";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbStructuredData,
  buildPersonStructuredData,
  buildWebSiteStructuredData,
} from "@/lib/seo";

export default async function Home() {
  return (
    <Column maxWidth="m" gap="xl" paddingY="12" horizontal="center">
      <JsonLd
        data={[
          buildWebSiteStructuredData(),
          buildPersonStructuredData(),
          buildBreadcrumbStructuredData([{ name: "Home", path: "/" }]),
        ]}
      />

      {/* About Section */}
      <Column fillWidth gap="24" marginTop="1" id="about-section">
        <RevealFx translateY="16" delay={0.3}>
          <About showTableOfContents={false} />
        </RevealFx>

        <RevealFx translateY="12" delay={0.4}>
          <Row fillWidth horizontal="end">
            <Line fillWidth />
          </Row>
        </RevealFx>
      </Column>

      {/* Videos Section */}
      {routes["/videos"] && (
        <div className="hidden md:block w-full">
          <Column fillWidth gap="24" marginTop="xl" id="videos-section">
            <RevealFx translateY="8" delay={0.4}>
              <Row fillWidth horizontal="center" marginY="l">
                <Heading as="h2" variant="display-strong-l">
                  Featured Videos
                </Heading>
              </Row>
            </RevealFx>

            <RevealFx translateY="16" delay={0.5}>
              <Videos hideHeader={true} />
            </RevealFx>

            <RevealFx translateY="12" delay={0.6}>
              <Row fillWidth horizontal="end">
                <Line fillWidth />
              </Row>
            </RevealFx>
          </Column>
        </div>
      )}

      {/* Work/Projects Section */}
      {routes["/work"] && (
        <div className="hidden md:block w-full">
          <Column fillWidth gap="24" marginTop="xl" id="work-section">
            <RevealFx translateY="8" delay={0.7}>
              <Row fillWidth horizontal="center" marginY="l">
                <Heading as="h2" variant="display-strong-l">
                  My Work
                </Heading>
              </Row>
            </RevealFx>

            <RevealFx translateY="16" delay={0.8}>
              <Work hideHeader={true} />
            </RevealFx>

            <RevealFx translateY="12" delay={0.9}>
              <Row fillWidth horizontal="end">
                <Line fillWidth />
              </Row>
            </RevealFx>
          </Column>
        </div>
      )}

      {/* Blog Section */}
      {routes["/blog"] && (
        <div className="hidden md:block w-full">
          <Column fillWidth gap="24" marginTop="xl" id="blog-section">
            <RevealFx translateY="8" delay={1.0}>
              <Row fillWidth horizontal="center" marginY="l">
                <Heading as="h2" variant="display-strong-l">
                  Latest from the Blog
                </Heading>
              </Row>
            </RevealFx>

            <RevealFx translateY="16" delay={1.1}>
              <Blog hideHeader={true} />
            </RevealFx>

            <RevealFx translateY="12" delay={1.2}>
              <Row fillWidth horizontal="end">
                <Line fillWidth />
              </Row>
            </RevealFx>
          </Column>
        </div>
      )}
    </Column>
  );
}
