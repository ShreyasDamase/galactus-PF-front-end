import { baseURL, person, social } from "@/resources";
import type { BlogPost, UserProfile } from "@/lib/types";
import type { ProjectResponse } from "@/lib/types/project.type";

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${baseURL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text = "", maxLength = 160) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

export function buildWebSiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${person.name} Portfolio`,
    url: baseURL,
    description: "Portfolio, projects, writing, and professional profile of Shreyas Damase.",
    inLanguage: "en",
  };
}

export function buildPersonStructuredData(profile?: UserProfile | null) {
  const profileName = profile?.fullName || `${profile?.firstName || person.firstName} ${profile?.lastName || person.lastName}`;
  const sameAs = (profile?.social || social)
    .map((item) => item.link)
    .filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profileName.trim(),
    url: absoluteUrl("/about"),
    image: absoluteUrl(profile?.profileImage || person.avatar),
    email: profile?.email || person.email,
    jobTitle: profile?.role || person.role,
    description: profile?.bio || `${person.name} is a software developer focused on React Native, frontend engineering, and modern web experiences.`,
    knowsAbout: profile?.skills || ["React Native", "TypeScript", "Frontend Development", "Node.js", "Mobile App Development"],
    sameAs,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Navi Mumbai",
      addressCountry: "IN",
    },
  };
}

export function buildBreadcrumbStructuredData(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildCollectionPageStructuredData({
  title,
  description,
  path,
  items,
}: {
  title: string;
  description: string;
  path: string;
  items: Array<{ name: string; path: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(item.path),
        name: item.name,
      })),
    },
  };
}

export function buildBlogPostingStructuredData(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: truncate(post.description || stripHtml(post.content), 180),
    image: post.coverImage ? [absoluteUrl(post.coverImage)] : undefined,
    url: absoluteUrl(`/blog/${post.slug}`),
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    wordCount: post.wordCount,
    keywords: post.tags?.join(", "),
    articleSection: post.category,
    author: {
      "@type": "Person",
      name: `${post.author?.firstName || person.firstName} ${post.author?.lastName || person.lastName}`.trim(),
      image: post.author?.profileImage ? absoluteUrl(post.author.profileImage) : absoluteUrl(person.avatar),
      url: absoluteUrl("/about"),
    },
    publisher: {
      "@type": "Person",
      name: person.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(person.avatar),
      },
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };
}

export function buildProjectStructuredData(project: ProjectResponse) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: truncate(project.summary || stripHtml(project.description), 180),
    applicationCategory: project.category || "DeveloperApplication",
    operatingSystem: "Web, Android, iOS",
    url: absoluteUrl(`/work/${project.slug}`),
    image: project.coverImage ? absoluteUrl(project.coverImage) : undefined,
    datePublished: project.publishedAt,
    dateModified: project.updatedAt,
    keywords: [...(project.tags || []), ...(project.technologyStack || [])].join(", "),
    creator: {
      "@type": "Person",
      name: person.name,
      url: absoluteUrl("/about"),
    },
    author: {
      "@type": "Person",
      name: person.name,
      url: absoluteUrl("/about"),
    },
  };
}
