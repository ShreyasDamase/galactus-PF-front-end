import { Flex, Meta, Schema } from "@once-ui-system/core";
import GalleryView, {
  type GalleryImage,
} from "@/components/gallery/GalleryView";
import { baseURL, gallery, person } from "@/resources";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbStructuredData,
  buildCollectionPageStructuredData,
} from "@/lib/seo";

export async function generateMetadata() {
  const meta = Meta.generate({
    title: gallery.title,
    description: gallery.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(gallery.title)}`,
    path: gallery.path,
  });

  return {
    ...meta,
    alternates: {
      canonical: `${baseURL}${gallery.path}`,
    },
  };
}

async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/gallery`,
      {
        next: { revalidate: 60 }, // ISR — revalidate every 60 seconds
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export default async function Gallery() {
  const images = await getGalleryImages();

  return (
    <Flex maxWidth="l">
      <JsonLd
        data={[
          buildCollectionPageStructuredData({
            title: gallery.title,
            description: gallery.description,
            path: gallery.path,
            items: images.slice(0, 12).map((image) => ({
              name: image.alt || image.title || "Gallery image",
              path: gallery.path,
            })),
          }),
          buildBreadcrumbStructuredData([
            { name: "Home", path: "/" },
            { name: "Gallery", path: gallery.path },
          ]),
        ]}
      />
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={gallery.title}
        description={gallery.description}
        path={gallery.path}
        image={`/api/og/generate?title=${encodeURIComponent(gallery.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${gallery.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <GalleryView images={images} />
    </Flex>
  );
}
