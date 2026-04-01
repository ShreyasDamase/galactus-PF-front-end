"use client";

import { useEffect, useState } from "react";
import { Column, Heading, Text, Row } from "@once-ui-system/core";
import { useTheme } from "@once-ui-system/core";
import Link from "next/link";
import { Bookmark, BookOpen, Folder, Trash2, Clock, ArrowLeft } from "lucide-react";

interface BookmarkedPost {
  id: string;
  slug: string;
  title: string;
  coverImage?: string;
  publishedAt: string;
}

interface BookmarkedProject {
  id: string;
  slug: string;
  title: string;
  coverImage?: string;
}

export default function ReadingListPage() {
  const [posts, setPosts] = useState<BookmarkedPost[]>([]);
  const [projects, setProjects] = useState<BookmarkedProject[]>([]);
  const [loaded, setLoaded] = useState(false);
  const theme = useTheme();
  const isDark = theme.resolvedTheme === "dark";

  useEffect(() => {
    const savedPosts = localStorage.getItem("bookmarked_posts");
    const savedProjects = localStorage.getItem("bookmarked_projects");
    if (savedPosts) setPosts(JSON.parse(savedPosts));
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    setLoaded(true);
  }, []);

  const removePost = (id: string) => {
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    localStorage.setItem("bookmarked_posts", JSON.stringify(updated));
  };

  const removeProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem("bookmarked_projects", JSON.stringify(updated));
  };

  const clearAll = () => {
    setPosts([]);
    setProjects([]);
    localStorage.removeItem("bookmarked_posts");
    localStorage.removeItem("bookmarked_projects");
  };

  const total = posts.length + projects.length;

  // Theme-aware color tokens
  const card = isDark
    ? "rgba(255,255,255,0.04)"
    : "rgba(255,255,255,0.85)";
  const cardBorder = isDark
    ? "1px solid rgba(255,255,255,0.08)"
    : "1px solid rgba(0,0,0,0.07)";
  const cardHoverBorder = isDark
    ? "rgba(255,255,255,0.15)"
    : "rgba(99,102,241,0.3)";
  const textPrimary = isDark ? "#f3f4f6" : "#111827";
  const textMuted = isDark ? "#9ca3af" : "#6b7280";
  const sectionPill = isDark
    ? { bg: "rgba(59,130,246,0.15)", text: "#93c5fd" }
    : { bg: "rgba(59,130,246,0.1)", text: "#2563eb" };
  const projectPill = isDark
    ? { bg: "rgba(168,85,247,0.15)", text: "#c4b5fd" }
    : { bg: "rgba(168,85,247,0.1)", text: "#7c3aed" };
  const clearBtn = isDark
    ? { bg: "rgba(239,68,68,0.1)", text: "#f87171", border: "rgba(239,68,68,0.2)" }
    : { bg: "rgba(239,68,68,0.06)", text: "#dc2626", border: "rgba(239,68,68,0.2)" };

  if (!loaded) {
    return (
      <Column maxWidth="m" paddingTop="80" gap="24" horizontal="center">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)", borderTopColor: "transparent" }}
        />
      </Column>
    );
  }

  return (
    <Column maxWidth="m" paddingTop="32" paddingBottom="80" gap="0">

      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 mb-8 text-sm transition-all"
        style={{ color: textMuted }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Link>

      {/* Page Header */}
      <Row fillWidth horizontal="between" vertical="center" marginBottom="40" wrap gap="16">
        <Row gap="16" vertical="center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.05))"
                : "linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.05))",
              border: "1px solid rgba(234,179,8,0.25)",
            }}
          >
            <Bookmark className="w-5 h-5" style={{ color: "#f59e0b", fill: "#f59e0b" }} />
          </div>
          <Column gap="4">
            <Heading variant="display-strong-l">Reading List</Heading>
            <Text variant="body-default-s" style={{ color: textMuted }}>
              {total === 0
                ? "Nothing saved yet"
                : `${total} item${total !== 1 ? "s" : ""} saved on this device`}
            </Text>
          </Column>
        </Row>

        {total > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: clearBtn.bg,
              color: clearBtn.text,
              border: `1px solid ${clearBtn.border}`,
            }}
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </button>
        )}
      </Row>

      {/* Empty State */}
      {total === 0 && (
        <Column horizontal="center" vertical="center" gap="24" paddingY="80" fillWidth>
          <div
            className="w-20 h-20 rounded-[20px] flex items-center justify-center"
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.05))"
                : "linear-gradient(135deg, rgba(234,179,8,0.12), rgba(234,179,8,0.04))",
              border: "1px solid rgba(234,179,8,0.2)",
            }}
          >
            <Bookmark className="w-9 h-9" style={{ color: "#f59e0b" }} />
          </div>

          <Column horizontal="center" gap="8" style={{ maxWidth: "360px" }}>
            <Heading as="h2" variant="heading-strong-l" align="center">
              No bookmarks yet
            </Heading>
            <Text variant="body-default-m" style={{ color: textMuted, textAlign: "center" }}>
              Tap the bookmark icon on any blog post or project to save it here for later.
            </Text>
          </Column>

          <Row gap="12" wrap>
            <Link
              href="/blog"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "#fff",
              }}
            >
              Browse Blog
            </Link>
            <Link
              href="/work"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: card,
                border: cardBorder,
                color: textPrimary,
              }}
            >
              Browse Projects
            </Link>
          </Row>
        </Column>
      )}

      {/* ── Blog Posts Section ── */}
      {posts.length > 0 && (
        <Column fillWidth gap="12" marginBottom="48">
          {/* Section header */}
          <Row gap="10" vertical="center" marginBottom="4">
            <BookOpen className="w-4 h-4" style={{ color: "#60a5fa" }} />
            <Text variant="label-default-m" style={{ color: textPrimary, fontWeight: 600 }}>
              Blog Posts
            </Text>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: sectionPill.bg, color: sectionPill.text }}
            >
              {posts.length}
            </span>
          </Row>

          {/* Post Cards */}
          {posts.map((post) => (
            <div
              key={post.id}
              className="group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200"
              style={{
                background: card,
                border: cardBorder,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.border = `1px solid ${cardHoverBorder}`;
                (e.currentTarget as HTMLElement).style.background = isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.95)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.border = cardBorder;
                (e.currentTarget as HTMLElement).style.background = card;
              }}
            >
              {/* Thumbnail */}
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  style={{ border: cardBorder }}
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isDark
                      ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.1))"
                      : "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.05))",
                    border: "1px solid rgba(59,130,246,0.2)",
                  }}
                >
                  <BookOpen className="w-6 h-6" style={{ color: "#60a5fa" }} />
                </div>
              )}

              {/* Text content */}
              <Column gap="4" style={{ flex: 1, minWidth: 0 }}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold leading-snug line-clamp-2 transition-colors"
                  style={{ color: textPrimary }}
                >
                  {post.title}
                </Link>
                {post.publishedAt && (
                  <Row gap="4" vertical="center">
                    <Clock className="w-3 h-3" style={{ color: textMuted }} />
                    <Text variant="body-default-xs" style={{ color: textMuted }}>
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </Row>
                )}
              </Column>

              {/* Remove */}
              <button
                onClick={() => removePost(post.id)}
                title="Remove bookmark"
                aria-label="Remove from reading list"
                className="opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all"
                style={{
                  color: textMuted,
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#f87171";
                  (e.currentTarget as HTMLElement).style.background = isDark
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(239,68,68,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = textMuted;
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </Column>
      )}

      {/* ── Projects Section ── */}
      {projects.length > 0 && (
        <Column fillWidth gap="12" marginBottom="48">
          <Row gap="10" vertical="center" marginBottom="4">
            <Folder className="w-4 h-4" style={{ color: "#c4b5fd" }} />
            <Text variant="label-default-m" style={{ color: textPrimary, fontWeight: 600 }}>
              Projects
            </Text>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: projectPill.bg, color: projectPill.text }}
            >
              {projects.length}
            </span>
          </Row>

          {projects.map((project) => (
            <div
              key={project.id}
              className="group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200"
              style={{
                background: card,
                border: cardBorder,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.border = `1px solid ${isDark ? "rgba(168,85,247,0.3)" : "rgba(168,85,247,0.25)"}`;
                (e.currentTarget as HTMLElement).style.background = isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.95)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.border = cardBorder;
                (e.currentTarget as HTMLElement).style.background = card;
              }}
            >
              {project.coverImage ? (
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  style={{ border: cardBorder }}
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isDark
                      ? "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(139,92,246,0.1))"
                      : "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(139,92,246,0.05))",
                    border: "1px solid rgba(168,85,247,0.2)",
                  }}
                >
                  <Folder className="w-6 h-6" style={{ color: "#c4b5fd" }} />
                </div>
              )}

              <Column gap="4" style={{ flex: 1, minWidth: 0 }}>
                <Link
                  href={`/work/${project.slug}`}
                  className="text-sm font-semibold leading-snug line-clamp-2 transition-colors"
                  style={{ color: textPrimary }}
                >
                  {project.title}
                </Link>
                <span
                  className="w-fit px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: projectPill.bg, color: projectPill.text }}
                >
                  Project
                </span>
              </Column>

              <button
                onClick={() => removeProject(project.id)}
                title="Remove bookmark"
                aria-label="Remove from saved projects"
                className="opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all"
                style={{ color: textMuted, background: "transparent" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#f87171";
                  (e.currentTarget as HTMLElement).style.background = isDark
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(239,68,68,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = textMuted;
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </Column>
      )}

      {/* Footer note */}
      {total > 0 && (
        <Text
          variant="body-default-xs"
          align="center"
          style={{ color: textMuted, marginTop: "8px" }}
        >
          📍 Saved on this device only — clears if browser storage is cleared.
        </Text>
      )}
    </Column>
  );
}
