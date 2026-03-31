"use client";

import { Media, MasonryGrid } from "@once-ui-system/core";

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  orientation: "horizontal" | "vertical";
  title?: string;
  order: number;
  createdAt: string;
}

interface GalleryViewProps {
  images: GalleryImage[];
}

export default function GalleryView({ images }: GalleryViewProps) {
  if (images.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", opacity: 0.5 }}>
        <p>No photos yet.</p>
      </div>
    );
  }

  return (
    <MasonryGrid columns={2} s={{ columns: 1 }}>
      {images.map((image, index) => (
        <Media
          enlarge
          priority={index < 10}
          sizes="(max-width: 560px) 100vw, 50vw"
          key={image.id}
          radius="m"
          aspectRatio={image.orientation === "horizontal" ? "16 / 9" : "3 / 4"}
          src={image.src}
          alt={image.alt}
        />
      ))}
    </MasonryGrid>
  );
}
