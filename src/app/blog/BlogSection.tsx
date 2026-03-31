"use client";
import { Column, Heading } from "@once-ui-system/core";
import { Posts } from "@/components/blog/Posts";
import { blog } from "@/resources";
import { usePostsList, usePrefetchNextPage } from "@/lib/hooks/usePosts";
import { useState } from "react";
import { usePostsStore } from "@/lib/store/usePostsStore";

export const BlogSection = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = usePostsList(currentPage);
  const pagination = usePostsStore((s) => s.pagination);
  usePrefetchNextPage(currentPage);

  if (isLoading)
    return (
      <Column maxWidth="m" paddingTop="24">
        <Heading variant="heading-strong-xl" marginLeft="24">
          {blog.title}
        </Heading>
        <p style={{ textAlign: "center", padding: "3rem" }}>Loading posts...</p>
      </Column>
    );

  if (error)
    return (
      <Column maxWidth="m" paddingTop="24">
        <Heading variant="heading-strong-xl" marginLeft="24">
          {blog.title}
        </Heading>
        <p style={{ color: "red", textAlign: "center", padding: "3rem" }}>
          Error: {error.message}
        </p>
      </Column>
    );

  const posts = data?.posts || [];

  return (
    <Column maxWidth="m" paddingTop="24">
      <Heading variant="heading-strong-xl" marginLeft="24">
        {blog.title}
      </Heading>

      <Column fillWidth flex={1} gap="40">
        {posts.length === 0 && (
          <p style={{ textAlign: "center", padding: "3rem", opacity: 0.5 }}>
            No posts published yet.
          </p>
        )}

        {/* Featured post — always show first */}
        {posts.length > 0 && <Posts posts={[posts[0]]} thumbnail />}

        {/* All remaining posts in 2-column grid */}
        {posts.length > 1 && (
          <Posts
            posts={posts.slice(1)}
            columns="2"
            thumbnail
            direction="column"
          />
        )}
      </Column>
    </Column>
  );
};
