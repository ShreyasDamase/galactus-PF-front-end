// components/ProjectCard.tsx
"use client";

import { formatDistanceToNow } from "@/utils/dateUtils";
import {
  AvatarGroup,
  Carousel,
  Column,
  Flex,
  Heading,
  SmartLink,
  Text,
  Tag,
  Icon,
} from "@once-ui-system/core";
 

interface ProjectCardProps {
  href: string;
  priority?: boolean;
  images: string[];
  coverImage?: string;
  title: string;
  summary: string;
  description: string;
  tags?: string[];
  technologyStack?: string[];
  avatars?: { src: string }[];
  views?: number;
  likes?: number;
  publishedAt?: string;
  hasReleases?: boolean;
  releaseCount?: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  href,
  priority = false,
  images = [],
  coverImage,
  title,
  summary,
  description,
  tags = [],
  technologyStack = [],
  avatars = [],
  views = 0,
  likes = 0,
  publishedAt,
  hasReleases = false,
  releaseCount = 0,
}) => {
  // Prepare carousel images
  const carouselImages = images.length > 0 
    ? images 
    : coverImage 
      ? [coverImage] 
      : [];

  return (
    <Column fillWidth gap="m">
      {/* Image Carousel */}
      {carouselImages.length > 0 && (
        <Carousel
          priority={priority}
          sizes="(max-width: 960px) 100vw, 960px"
          aspectRatio="16/9"
          items={carouselImages.map((image, idx) => ({
            slide: image,
            alt: `${title} - Image ${idx + 1}`,
          }))}
          indicator="line"
        />
      )}

      {/* Content */}
      <Flex
        s={{ direction: "column" }}
        fillWidth
        paddingX="s"
        paddingTop="12"
        paddingBottom="24"
        gap="l"
      >
        {/* Title */}
        <Flex flex={5} direction="column" gap="8">
          <Heading as="h2" wrap="balance" variant="heading-strong-xl">
            {title}
          </Heading>
          
          {/* Meta Info */}
          <Flex gap="12" wrap align="center">
            {publishedAt && (
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {formatDistanceToNow(new Date(publishedAt))} ago
              </Text>
            )}
            {views > 0 && (
              <Flex gap="4" align="center">
                <Icon name="eye" size="xs" />
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {views.toLocaleString()}
                </Text>
              </Flex>
            )}
            {likes > 0 && (
              <Flex gap="4" align="center">
                <Icon name="heart" size="xs" />
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {likes.toLocaleString()}
                </Text>
              </Flex>
            )}
            {hasReleases && (
              <Flex gap="4" align="center">
                <Icon name="package" size="xs" />
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {releaseCount} {releaseCount === 1 ? 'release' : 'releases'}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Description & Details */}
        <Column flex={7} gap="16">
          {/* Team/Contributors */}
          {avatars.length > 0 && (
            <AvatarGroup avatars={avatars} size="m" reverse />
          )}

          {/* Summary */}
          {summary && (
            <Text 
              wrap="balance" 
              variant="body-default-s" 
              onBackground="neutral-weak"
            >
              {summary}
            </Text>
          )}

          {/* Technology Stack */}
          {technologyStack.length > 0 && (
            <Flex gap="8" wrap>
              {technologyStack.slice(0, 5).map((tech) => (
                <Tag 
                  key={tech}
                  size="s"
                  label={tech}
                  variant="neutral"
                />
              ))}
              {technologyStack.length > 5 && (
                <Tag 
                  size="s"
                  label={`+${technologyStack.length - 5}`}
                  variant="neutral"
                />
              )}
            </Flex>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <Flex gap="8" wrap>
              {tags.slice(0, 3).map((tag) => (
                <Tag 
                  key={tag}
                  size="s"
                  label={tag}
                  variant="accent"
                />
              ))}
            </Flex>
          )}

          {/* Action Links */}
          <Flex gap="24" wrap>
            {description && (
              <SmartLink
                suffixIcon="arrowRight"
                style={{ margin: "0", width: "fit-content" }}
                href={href}
              >
                <Text variant="body-default-s">Read case study</Text>
              </SmartLink>
            )}
            
            {hasReleases && (
              <SmartLink
                suffixIcon="download"
                style={{ margin: "0", width: "fit-content" }}
                href={`${href}#releases`}
              >
                <Text variant="body-default-s">View releases</Text>
              </SmartLink>
            )}
          </Flex>
        </Column>
      </Flex>
    </Column>
  );
};