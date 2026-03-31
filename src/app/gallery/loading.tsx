import { Flex, MasonryGrid } from "@once-ui-system/core";

const shimmerStyle: React.CSSProperties = {
  borderRadius: "var(--radius-m)",
  background:
    "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)",
  backgroundSize: "800px 100%",
  animation: "gallery-shimmer 1.5s infinite",
};

// 6 skeleton items: 4 horizontal (16/9), 2 vertical (3/4)
const skeletons = [
  { aspectRatio: "16 / 9" },
  { aspectRatio: "3 / 4" },
  { aspectRatio: "16 / 9" },
  { aspectRatio: "16 / 9" },
  { aspectRatio: "3 / 4" },
  { aspectRatio: "16 / 9" },
];

export default function GalleryLoading() {
  return (
    <Flex maxWidth="l" fillWidth>
      <style>{`
        @keyframes gallery-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
      `}</style>
      <MasonryGrid columns={2} s={{ columns: 1 }}>
        {skeletons.map((skeleton, index) => (
          <div
            key={index}
            style={{
              ...shimmerStyle,
              aspectRatio: skeleton.aspectRatio,
              width: "100%",
            }}
          />
        ))}
      </MasonryGrid>
    </Flex>
  );
}
