import { Flex, Meta, Schema } from "@once-ui-system/core";
import GalleryView, {
  type GalleryImage,
} from "@/components/gallery/GalleryView";
import { baseURL, gallery, person } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: gallery.title,
    description: gallery.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(gallery.title)}`,
    path: gallery.path,
  });
}

async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/gallery`,
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
