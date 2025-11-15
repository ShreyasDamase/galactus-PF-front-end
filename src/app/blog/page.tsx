"use client";
import { Column, Heading, Meta, Schema } from "@once-ui-system/core";

import { Posts } from "@/components/blog/Posts";
import { baseURL, blog, person, newsletter } from "@/resources";
import { usePostsList, usePrefetchNextPage } from "@/lib/hooks/usePosts";
import { useState } from "react";
import { usePostsStore } from "@/lib/store/usePostsStore";

export default function Blog() {
  const [currentPage, setCurrentPage] = useState(1);

  // 🔥 THIS IS THE MAGIC - One hook does everything
  const {
    data, // { posts: [], pagination: {} }
    isLoading, // true/false
    error, // Error object or null
    refetch, // Function to manually refetch
    isFetching, // true when refetching in background
  } = usePostsList(currentPage);

  // Get pagination state from Zustand (synced by hook)
  const pagination = usePostsStore((state) => state.pagination);

  // Prefetch next page for instant navigation
  const { prefetchNext } = usePrefetchNextPage(currentPage);

  if (isLoading) {
    return (
      <Column maxWidth="m" paddingTop="24">
        <Heading marginBottom="l" variant="heading-strong-xl" marginLeft="24">
          {blog.title}
        </Heading>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
            <p>Loading posts...</p>
          </div>
        </div>
      </Column>
    );
  }

  if (error) {
    return (
      <Column maxWidth="m" paddingTop="24">
        <Heading marginBottom="l" variant="heading-strong-xl" marginLeft="24">
          {blog.title}
        </Heading>
        <div className="text-center py-20">
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      </Column>
    );
  }

  const posts = data?.posts || [];
  return (
    <>
      <Column maxWidth="m" paddingTop="24">
        <Heading marginBottom="l" variant="heading-strong-xl" marginLeft="24">
          {blog.title}
        </Heading>
        <Column fillWidth flex={1} gap="40">
          {/* Featured post */}
          {posts.length > 0 && <Posts posts={[posts[0]]} thumbnail />}

          {/* Two column posts */}
          {posts.length > 2 && (
            <Posts
              posts={posts.slice(1, 3)}
              columns="2"
              thumbnail
              direction="column"
            />
          )}

          <Heading as="h2" variant="heading-strong-xl" marginLeft="l">
            Earlier posts
          </Heading>

          {/* Rest of posts */}
          {posts.length > 3 && <Posts posts={posts.slice(3)} columns="2" />}
        </Column>
      </Column>
    </>
  );
}
