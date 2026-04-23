import { Flex, MasonryGrid, Skeleton, Text } from "@once-ui-system/core";
import { videos } from "@/resources";

export default function Loading() {
  return (
    <Flex maxWidth="l" direction="column" gap="l" fillWidth paddingY="l">
      <Flex direction="column" gap="xs">
        <Text variant="heading-strong-xl">{videos.label}</Text>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {videos.description}
        </Text>
      </Flex>

      <MasonryGrid columns={2} s={{ columns: 1 }}>
        {[1, 2, 3, 4].map((i) => (
          <Flex
            key={i}
            fillWidth
            direction="column"
            radius="m"
            border="neutral-medium"
            style={{ overflow: "hidden" }}
          >
            <Skeleton shape="block" style={{ aspectRatio: "16 / 9", width: "100%" }} />
            <Flex direction="column" padding="m" gap="s" background="surface">
              <Skeleton shape="line" width="l" height="m" />
              <Skeleton shape="line" width="xl" height="s" />
              <Skeleton shape="line" width="l" height="s" />
            </Flex>
          </Flex>
        ))}
      </MasonryGrid>
    </Flex>
  );
}
