import { Flex, Meta, Schema, Text } from "@once-ui-system/core";
import { baseURL, videos, person } from "@/resources";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbStructuredData,
  buildCollectionPageStructuredData,
} from "@/lib/seo";

export async function generateMetadata() {
  const meta = Meta.generate({
    title: videos.title,
    description: videos.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(videos.title)}`,
    path: videos.path,
  });

  return {
    ...meta,
    alternates: {
      canonical: `${baseURL}${videos.path}`,
    },
  };
}

interface VideoData {
  id: string;
  url: string;
  youtubeId: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
}

async function getVideos(): Promise<VideoData[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export default async function Videos({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const fetchedVideos = await getVideos();

  return (
    <Flex maxWidth="l" direction="column" gap="l" fillWidth paddingY="l">
      <JsonLd
        data={[
          buildCollectionPageStructuredData({
            title: videos.title,
            description: videos.description,
            path: videos.path,
            items: fetchedVideos.map((vid) => ({
              name: vid.title || `Video ${vid.youtubeId}`,
              path: videos.path,
            })),
          }),
          buildBreadcrumbStructuredData([
            { name: "Home", path: "/" },
            { name: "Videos", path: videos.path },
          ]),
        ]}
      />
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={videos.title}
        description={videos.description}
        path={videos.path}
        image={`/api/og/generate?title=${encodeURIComponent(videos.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${videos.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      
      {!hideHeader && (
        <Flex direction="column" gap="xs">
          <Text variant="heading-strong-xl">{videos.label}</Text>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {videos.description}
          </Text>
        </Flex>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {fetchedVideos.map((vid) => (
          <Flex
            key={vid.id}
            fillWidth
            direction="column"
            radius="m"
            border="neutral-medium"
            style={{ overflow: "hidden" }}
          >
            <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
              <iframe
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "var(--radius-m) var(--radius-m) 0 0"
                }}
                src={`https://www.youtube.com/embed/${vid.youtubeId}`}
                title={vid.title || "YouTube video player"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            {(vid.title || vid.description) && (
              <Flex direction="column" padding="m" gap="xs" background="surface">
                {vid.title && <Text variant="heading-strong-m">{vid.title}</Text>}
                {vid.description && (
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {vid.description}
                  </Text>
                )}
              </Flex>
            )}
          </Flex>
        ))}
        {fetchedVideos.length === 0 && (
          <Flex fillWidth paddingY="xl" horizontal="center">
            <Text variant="body-default-m" onBackground="neutral-weak">
              No videos available.
            </Text>
          </Flex>
        )}
      </div>
    </Flex>
  );
}
