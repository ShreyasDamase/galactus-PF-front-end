// No "use client" — Server Component ✅
// Fetches post on server → passes to BlogPostClient for interactions
import { notFound } from "next/navigation";
import { baseURL, blog, person } from "@/resources";
import { fetchPost } from "@/lib/server/serverFetch";
import BlogPostClient from "@/components/blog/BlogPostClient";

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

  if (!post) {
    notFound();
  }

  // Pass fetched post to client component for all interactions
  return <BlogPostClient initialPost={post} />;
}
