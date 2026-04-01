// No "use client" — this is a Server Component ✅
import { Column, Heading, Meta, Schema } from "@once-ui-system/core";
import { Posts } from "@/components/blog/Posts";
import { baseURL, blog, person } from "@/resources";
import { fetchPosts } from "@/lib/server/serverFetch";

export async function generateMetadata() {
  return Meta.generate({
    title: blog.title,
    description: blog.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(blog.title)}`,
    path: blog.path,
  });
}

export default async function Blog() {
  // Runs on server — Google sees fully rendered HTML ✅
  const { posts } = await fetchPosts(1);

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={blog.title}
        description={blog.description}
        path={blog.path}
        image={`/api/og/generate?title=${encodeURIComponent(blog.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${blog.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Column maxWidth="m" paddingTop="24">
        <Heading marginBottom="l" variant="heading-strong-xl" marginLeft="24">
          {blog.title}
        </Heading>

        <Column fillWidth flex={1} gap="40">
          {posts.length === 0 && (
            <p style={{ textAlign: "center", padding: "3rem", opacity: 0.5 }}>
              No posts published yet.
            </p>
          )}

          {/* Featured post — always show if at least 1 post */}
          {posts.length > 0 && <Posts posts={[posts[0]]} thumbnail />}

          {/* Remaining posts in 2-column grid */}
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
    </>
  );
}
