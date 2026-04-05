"use client";

import { Card, Column, Media, Row, Avatar, Text } from "@once-ui-system/core";

interface PostProps {
  post: {
    _id: string;
    slug: string;
    title: string;
    description?: string;
    coverImage?: string;
    author: {
      firstName: string;
      lastName: string;
      profileImage: string;
    };
    publishedAt: string;
    category?: string;
    tags: string[];
  };
  thumbnail: boolean;
  direction?: "row" | "column";
  compact?: boolean;
}

export default function Post({
  post,
  thumbnail,
  direction,
  compact = false,
}: PostProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card
      fillWidth
      key={post?._id}
      href={`/blog/${post?.slug}`}
      transition="micro-medium"
      direction={direction}
      border="transparent"
      background="transparent"
      padding={compact ? "0" : "4"}
      radius="l-4"
      gap={compact ? "12" : direction === "column" ? undefined : "24"}
      s={{ direction: "column" }}
      style={
        compact
          ? {
              minWidth: 0,
              border: "1px solid rgba(128,128,128,0.16)",
              borderRadius: "18px",
              padding: "12px",
              backdropFilter: "blur(10px)",
            }
          : undefined
      }
    >
      {post.coverImage && thumbnail && (
        <Media
          priority
          sizes={compact ? "(max-width: 768px) 100vw, 420px" : "(max-width: 768px) 100vw, 640px"}
          border="neutral-alpha-weak"
          cursor="interactive"
          radius="l"
          src={post?.coverImage}
          alt={"Thumbnail of " + post?.title}
          aspectRatio="16 / 9"
        />
      )}
      <Row fillWidth style={{ minWidth: 0 }}>
        <Column
          maxWidth={compact ? undefined : 28}
          paddingY={compact ? "4" : "24"}
          paddingX={compact ? "4" : "l"}
          gap={compact ? "12" : "20"}
          vertical={compact ? "start" : "center"}
          style={{ minWidth: 0 }}
        >
          <Row gap={compact ? "12" : "24"} vertical="center" wrap style={{ minWidth: 0 }}>
            <Row vertical="center" gap={compact ? "8" : "16"} style={{ minWidth: 0 }}>
              {post?.author?.profileImage && (
                <Avatar src={post?.author?.profileImage} size="s" />
              )}
              <Text
                variant="label-default-s"
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {post?.author?.firstName} {post?.author?.lastName}
              </Text>
            </Row>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {formatDate(post?.publishedAt)}
            </Text>
          </Row>
          <Text
            variant={compact ? "heading-strong-m" : "heading-strong-l"}
            wrap="balance"
            style={{
              minWidth: 0,
              display: "-webkit-box",
              WebkitLineClamp: compact ? 3 : 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post?.title}
          </Text>
          {post?.description && (
            <Text
              variant="body-default-s"
              onBackground="neutral-weak"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: compact ? 2 : 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.description}
            </Text>
          )}
          {post?.category && (
            <Text variant="label-strong-s" onBackground="neutral-weak">
              {post?.category}
            </Text>
          )}
        </Column>
      </Row>
    </Card>
  );
}
