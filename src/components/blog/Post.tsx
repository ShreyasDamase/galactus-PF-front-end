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
}

export default function Post({ post, thumbnail, direction }: PostProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card
      fillWidth
      key={post._id}
      href={`/blog/${post.slug}`}
      transition="micro-medium"
      direction={direction}
      border="transparent"
      background="transparent"
      padding="4"
      radius="l-4"
      gap={direction === "column" ? undefined : "24"}
      s={{ direction: "column" }}
    >
      {post.coverImage && thumbnail && (
        <Media
          priority
          sizes="(max-width: 768px) 100vw, 640px"
          border="neutral-alpha-weak"
          cursor="interactive"
          radius="l"
          src={post.coverImage}
          alt={"Thumbnail of " + post.title}
          aspectRatio="16 / 9"
        />
      )}
      <Row fillWidth>
        <Column maxWidth={28} paddingY="24" paddingX="l" gap="20" vertical="center">
          <Row gap="24" vertical="center">
            <Row vertical="center" gap="16">
              <Avatar 
                src={post.author.profileImage} 
                size="s" 
              />
              <Text variant="label-default-s">
                {post.author.firstName} {post.author.lastName}
              </Text>
            </Row>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {formatDate(post.publishedAt)}
            </Text>
          </Row>
          <Text variant="heading-strong-l" wrap="balance">
            {post.title}
          </Text>
          {post.category && (
            <Text variant="label-strong-s" onBackground="neutral-weak">
              {post.category}
            </Text>
          )}
        </Column>
      </Row>
    </Card>
  );
}
