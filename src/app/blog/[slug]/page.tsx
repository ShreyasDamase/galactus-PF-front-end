// No "use client" — Server Component ✅
// Fetches post on server → passes to BlogPostClient for interactions
import { notFound } from "next/navigation";
import { baseURL, blog, person } from "@/resources";
import { fetchPost, fetchPosts } from "@/lib/server/serverFetch";
import BlogPostClient from "@/components/blog/BlogPostClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBlogPostingStructuredData,
  buildBreadcrumbStructuredData,
} from "@/lib/seo";
import { Column, Heading } from "@once-ui-system/core";
import { Posts } from "@/components/blog/Posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate SEO metadata per post — Google uses this for title, description, og:image
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | ${blog.title}`,
    description: post.description,
    alternates: {
      canonical: `${baseURL}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.coverImage
        ? [{ url: post.coverImage, alt: post.title }]
        : [`/api/og/generate?title=${encodeURIComponent(post.title)}`],
      type: "article",
      publishedTime: post.publishedAt,
      authors: [`${post.author?.firstName} ${post.author?.lastName}`],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch on server — content is in HTML before browser gets it ✅
  const post = await fetchPost(slug);
  const { posts } = await fetchPosts(1);

  if (!post) {
    notFound();
  }

  const relatedPosts = posts
    .filter(
      (item) =>
        item.slug !== post.slug &&
        (item.category === post.category ||
          item.tags?.some((tag) => post.tags?.includes(tag)))
    )
    .slice(0, 3);

  // Pass fetched post to client component for all interactions
  return (
    <Column
      fillWidth
      horizontal="center"
      gap="0"
      style={{ width: "100%" }}
    >
      <JsonLd
        data={[
          buildBlogPostingStructuredData(post),
          buildBreadcrumbStructuredData([
            { name: "Home", path: "/" },
            { name: "Blog", path: blog.path },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <BlogPostClient initialPost={post} />
      {relatedPosts.length > 0 && (
        <Column
          maxWidth="m"
          fillWidth
          paddingTop="8"
          paddingBottom="32"
          gap="12"
          style={{ width: "100%" }}
        >
          <Heading as="h2" variant="heading-strong-l">
            Continue reading
          </Heading>
          <Posts
            posts={relatedPosts.slice(0, 2)}
            columns="2"
            thumbnail
            direction="column"
            compact
          />
        </Column>
      )}
    </Column>
  );
}
