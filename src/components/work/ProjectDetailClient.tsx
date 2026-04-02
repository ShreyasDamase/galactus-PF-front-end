"use client";

/**
 * ProjectDetailClient — wraps the full project detail UI
 * Receives server-fetched project as a prop instead of fetching client-side.
 * All interactive features (like/unlike, code blocks, scroll, share) stay intact.
 */
import {
  Column,
  Heading,
  Text,
  Row,
  SmartLink,
  Carousel,
} from "@once-ui-system/core";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Heart,
  Bookmark,
  Share2,
  MessageCircle,
  Download,
  Eye,
  Calendar,
  ChevronUp,
  ExternalLink,
  Github,
  Globe,
  Package,
  Zap,
  Award,
  FileText,
  BookOpen,
  HelpCircle,
  Cpu,
  Clock,
  Tag,
  Layers,
  TrendingUp,
} from "lucide-react";
import hljs from "highlight.js";
import { useTheme } from "@once-ui-system/core";
import { motion, AnimatePresence } from "framer-motion";

import "@/styles/blog-preview.css";
import "@/styles/syntax-theme.css";
import "@/styles/enhanced-tables.css";
import "@/styles/enhanced-image.css";
import { useLikeProject, useUnlikeProject } from "@/lib/hooks/useProject";
import { useComments } from "@/lib/hooks/useComments";
import CommentsSheet from "@/components/blog/CommentsSheet";
import { sanitizeHTML } from "@/lib/sanitize";
import type { ProjectResponse } from "@/lib/types/project.type";

declare global {
  interface Window {
    mermaid?: any;
    mermaidLoaded?: boolean;
  }
}

interface ProjectDetailClientProps {
  initialProject: ProjectResponse;
}

export default function ProjectDetailClient({ initialProject }: ProjectDetailClientProps) {
  const project = initialProject;

  const contentRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const likeProjectMutation = useLikeProject();
  const unlikeProjectMutation = useUnlikeProject();

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [renderedContent, setRenderedContent] = useState<string>("");
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [mermaidReady, setMermaidReady] = useState<boolean>(false);
  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const { data: commentsData } = useComments(project.id);
  const totalComments = commentsData?.total || 0;

  const openComments = useCallback(() => setIsCommentsOpen(true), []);
  const closeComments = useCallback(() => setIsCommentsOpen(false), []);

  useEffect(() => {
    if (project) {
      setLikeCount(project.likes || 0);
      if (project.id) {
        const savedLikedProjects = localStorage.getItem("liked_projects");
        if (savedLikedProjects) {
          const parsed = JSON.parse(savedLikedProjects);
          if (parsed.includes(project.id)) setIsLiked(true);
        }
        // Restore bookmarked state
        const savedBookmarks = localStorage.getItem("bookmarked_projects");
        if (savedBookmarks) {
          const parsed: Array<{ id: string }> = JSON.parse(savedBookmarks);
          if (parsed.some((b) => b.id === project.id)) setIsBookmarked(true);
        }
      }
    }
  }, [project]);

  // Load Mermaid
  useEffect(() => {
    const loadMermaid = () => {
      if (window.mermaid && window.mermaidLoaded) {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: theme.resolvedTheme === "dark" ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "inherit",
        });
        setMermaidReady(true);
        return;
      }
      const script = document.createElement("script");
      script.type = "module";
      script.innerHTML = `
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: false, theme: '${theme.resolvedTheme === "dark" ? "dark" : "default"}', securityLevel: 'loose', fontFamily: 'inherit' });
        window.mermaid = mermaid; window.mermaidLoaded = true;
        window.dispatchEvent(new CustomEvent('mermaidLoaded'));
      `;
      document.head.appendChild(script);
      const handleMermaidLoaded = () => { setMermaidReady(true); window.removeEventListener("mermaidLoaded", handleMermaidLoaded); };
      window.addEventListener("mermaidLoaded", handleMermaidLoaded);
      return () => window.removeEventListener("mermaidLoaded", handleMermaidLoaded);
    };
    loadMermaid();
  }, [theme.resolvedTheme]);

  // Reading progress
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
          const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
          setReadingProgress(Math.min(100, Math.max(0, progress)));
          setShowFloatingActions(scrollTop > 300);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhanced code blocks
  useEffect(() => {
    if (!project?.description) return;
    hljs.configure({ ignoreUnescapedHTML: true });
    const temp = document.createElement("div");
    temp.innerHTML = project.description;
    const preBlocks = temp.querySelectorAll("pre");

    preBlocks.forEach((block, index) => {
      const code = block.querySelector("code");
      if (!code) return;
      hljs.highlightElement(code as HTMLElement);
      const codeText = code.textContent || "";
      const lines = codeText.split("\n").filter((l) => l.trim() !== "");
      const shouldScroll = lines.length > 70;
      const detectLanguage = (el: Element): string => {
        for (const p of [/language-(\w+)/i, /lang-(\w+)/i, /hljs\s+(\w+)/i]) {
          const m = el.className.match(p); if (m) return m[1].toLowerCase();
        }
        return "plaintext";
      };
      const languageClass = detectLanguage(code);
      const languageDisplay = languageClass.charAt(0).toUpperCase() + languageClass.slice(1);
      const languageColors: Record<string, { bg: string; text: string; border: string }> = {
        javascript: { bg: "#fef3c7", text: "#d97706", border: "#fbbf24" },
        typescript: { bg: "#dbeafe", text: "#2563eb", border: "#60a5fa" },
        python: { bg: "#dcfce7", text: "#16a34a", border: "#4ade80" },
        java: { bg: "#fee2e2", text: "#dc2626", border: "#f87171" },
        plaintext: { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
      };
      const colors = languageColors[languageClass] || languageColors.plaintext;
      const wrapper = document.createElement("div");
      wrapper.className = `code-block-enhanced ${theme.resolvedTheme}`;
      wrapper.style.cssText = `background: ${theme.resolvedTheme === "dark" ? "#1f2937" : "white"}; border-radius: 12px; overflow: hidden; margin: 1.5rem 0; border: 1px solid ${theme.resolvedTheme === "dark" ? "#374151" : "#e5e7eb"};`;
      const header = document.createElement("div");
      header.style.cssText = `display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; background:${theme.resolvedTheme === "dark" ? "#1f2937" : "#f9fafb"}; border-bottom:1px solid ${theme.resolvedTheme === "dark" ? "#374151" : "#e5e7eb"};`;
      const langBadge = document.createElement("div");
      langBadge.style.cssText = `display:inline-flex; align-items:center; gap:0.5rem; padding:0.25rem 0.75rem; border-radius:6px; font-size:0.75rem; font-weight:600; background:${colors.bg}; color:${colors.text}; border:1px solid ${colors.border};`;
      langBadge.innerHTML = `<span>${languageDisplay}</span>`;
      const rightSide = document.createElement("div");
      rightSide.style.cssText = "display:flex; align-items:center; gap:0.5rem;";
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-code-btn";
      copyBtn.style.cssText = `display:flex; align-items:center; gap:0.5rem; padding:0.375rem 0.75rem; border-radius:6px; font-size:0.75rem; background:transparent; color:${theme.resolvedTheme === "dark" ? "#9ca3af" : "#4b5563"}; border:none; cursor:pointer;`;
      copyBtn.innerHTML = `<span>Copy</span>`;
      rightSide.appendChild(copyBtn);
      if (shouldScroll) {
        const expandBtn = document.createElement("button");
        expandBtn.className = "expand-code-btn";
        expandBtn.setAttribute("data-index", index.toString());
        expandBtn.style.cssText = copyBtn.style.cssText;
        expandBtn.innerHTML = `<span>${expandedBlocks.has(index) ? "Collapse" : "Expand"}</span>`;
        rightSide.appendChild(expandBtn);
      }
      header.appendChild(langBadge); header.appendChild(rightSide);
      const codeContainer = document.createElement("div");
      codeContainer.className = "code-container";
      const isExpanded = expandedBlocks.has(index);
      codeContainer.style.cssText = shouldScroll ? (isExpanded ? "max-height:none; overflow-y:visible;" : "max-height:500px; overflow-y:auto;") : "";
      const styledBlock = block.cloneNode(true) as HTMLElement;
      styledBlock.style.cssText = "margin:0; border-radius:0; border:none;";
      codeContainer.appendChild(styledBlock);
      wrapper.appendChild(header); wrapper.appendChild(codeContainer);
      block.replaceWith(wrapper);
    });
    // Sanitize before setting — strips any XSS injected via CMS
    setRenderedContent(sanitizeHTML(temp.innerHTML));
  }, [project?.description, expandedBlocks, theme.resolvedTheme]);

  // Event listeners
  useEffect(() => {
    const container = contentRef.current;
    if (!container || !renderedContent) return;
    const handleClick = async (e: Event) => {
      const target = e.target as HTMLElement;
      const copyBtn = target.closest(".copy-code-btn") as HTMLButtonElement;
      if (copyBtn) {
        e.preventDefault(); e.stopPropagation();
        const codeText = copyBtn.closest(".code-block-enhanced")?.querySelector("code")?.textContent || "";
        if (!codeText) return;
        try {
          await navigator.clipboard.writeText(codeText);
          copyBtn.style.background = "#d1fae5"; copyBtn.style.color = "#10b981";
          const span = copyBtn.querySelector("span"); if (span) span.textContent = "Copied!";
          setTimeout(() => { copyBtn.style.background = "transparent"; copyBtn.style.color = ""; if (span) span.textContent = "Copy"; }, 2000);
        } catch {}
        return;
      }
      const expandBtn = target.closest(".expand-code-btn") as HTMLButtonElement;
      if (expandBtn) {
        e.preventDefault(); e.stopPropagation();
        const idx = parseInt(expandBtn.getAttribute("data-index") || "0", 10);
        setExpandedBlocks((prev) => { const s = new Set(prev); s.has(idx) ? s.delete(idx) : s.add(idx); return s; });
      }
    };
    container.addEventListener("click", handleClick as EventListener);
    return () => container.removeEventListener("click", handleClick as EventListener);
  }, [renderedContent, theme.resolvedTheme]);

  // Render Mermaid
  useEffect(() => {
    if (!mermaidReady || !project?.diagrams?.length) return;
    (async () => {
      for (const diagram of project.diagrams) {
        if (diagram.type !== "mermaid") continue;
        const el = document.getElementById(`mermaid-${diagram.name.replace(/\s+/g, "-")}`);
        if (!el) continue;
        try {
          const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          el.innerHTML = "";
          const result = await window.mermaid.render(id, diagram.content);
          if (result?.svg) { el.innerHTML = result.svg; result.bindFunctions?.(el); }
        } catch (err) { console.error("Mermaid error:", err); }
      }
    })();
  }, [mermaidReady, project?.diagrams]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme.resolvedTheme === "dark");
  }, [theme.resolvedTheme]);

  const handleLike = useCallback(async () => {
    if (!project?.id) return;
    try {
      if (isLiked) {
        setIsLiked(false); setLikeCount((p) => Math.max(0, p - 1));
        await unlikeProjectMutation.mutateAsync(project.id);
        const saved = localStorage.getItem("liked_projects");
        const parsed = saved ? JSON.parse(saved) : [];
        localStorage.setItem("liked_projects", JSON.stringify(parsed.filter((id: string) => id !== project.id)));
      } else {
        setIsLiked(true); setLikeCount((p) => p + 1);
        await likeProjectMutation.mutateAsync(project.id);
        const saved = localStorage.getItem("liked_projects");
        const parsed = saved ? JSON.parse(saved) : [];
        if (!parsed.includes(project.id)) { parsed.push(project.id); localStorage.setItem("liked_projects", JSON.stringify(parsed)); }
      }
    } catch { setIsLiked(!isLiked); setLikeCount((p) => (isLiked ? p + 1 : Math.max(0, p - 1))); }
  }, [isLiked, project, likeProjectMutation, unlikeProjectMutation]);

  const handleBookmark = useCallback(async () => {
    if (!project?.id) return;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      // On mobile — open native share sheet (iOS has "Add to Reading List")
      try {
        await navigator.share({
          title: project.title,
          text: project.summary || `Check out: ${project.title}`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error("Share failed", err);
      }
      return;
    }

    // Desktop — save to localStorage reading list
    const saved = localStorage.getItem("bookmarked_projects");
    const bookmarks: Array<{ id: string; slug: string; title: string; coverImage?: string }> =
      saved ? JSON.parse(saved) : [];

    if (isBookmarked) {
      const updated = bookmarks.filter((b) => b.id !== project.id);
      localStorage.setItem("bookmarked_projects", JSON.stringify(updated));
      setIsBookmarked(false);
      setBookmarkToast("Removed from saved projects");
    } else {
      if (!bookmarks.some((b) => b.id === project.id)) {
        bookmarks.push({ id: project.id, slug: project.slug, title: project.title, coverImage: project.coverImage });
        localStorage.setItem("bookmarked_projects", JSON.stringify(bookmarks));
      }
      setIsBookmarked(true);
      setBookmarkToast("Project saved ✓");
    }

    setTimeout(() => setBookmarkToast(null), 2500);
  }, [isBookmarked, project]);

  const handleShare = useCallback(async () => {
    if (navigator.share && project) {
      try { await navigator.share({ title: project.title, text: project.summary, url: window.location.href }); }
      catch (err) { if ((err as Error).name !== "AbortError") console.log("Share cancelled"); }
    } else {
      try { await navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }
      catch {}
    }
  }, [project]);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024; const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-150 ease-out" style={{ width: `${readingProgress}%` }} role="progressbar" aria-valuenow={readingProgress} aria-valuemin={0} aria-valuemax={100} />
      </div>

      {/* Bookmark Toast */}
      {bookmarkToast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-medium shadow-lg pointer-events-none"
          style={{
            background: "rgba(30,30,30,0.92)",
            color: "#fff",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {bookmarkToast}
        </div>
      )}


      {/* Floating Actions */}
      {showFloatingActions && (
        <AnimatePresence>
          <motion.div className="fixed left-4 md:left-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="flex flex-col gap-3 p-3 rounded-2xl shadow-xl" style={{ background: theme.resolvedTheme === "dark" ? "#1f2937" : "white", border: `1px solid ${theme.resolvedTheme === "dark" ? "#374151" : "#e5e7eb"}` }}>
              <motion.button onClick={handleLike} className={`p-2.5 rounded-xl ${isLiked ? "text-red-500" : theme.resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </motion.button>
              <div className={`w-full h-px ${theme.resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-200"}`} />
              
              <motion.button onClick={openComments} className={`p-2.5 rounded-xl relative flex items-center justify-center ${theme.resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <MessageCircle className="w-5 h-5 relative z-10" />
                {totalComments > 0 && (
                  <span className="absolute bg-blue-500 text-white text-[9px] font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center z-20 pointer-events-none -top-0 -right-0 translate-y-1/4 -translate-x-1/4">
                    {totalComments > 99 ? '99+' : totalComments}
                  </span>
                )}
              </motion.button>
              <div className={`w-full h-px ${theme.resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-200"}`} />

              <motion.button onClick={handleBookmark} className={`p-2.5 rounded-xl ${isBookmarked ? "text-yellow-500" : theme.resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
              </motion.button>
              <motion.button onClick={handleShare} className={`p-2.5 rounded-xl ${theme.resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Scroll to Top */}
      {showFloatingActions && (
        <button onClick={scrollToTop} className="fixed bottom-6 right-4 md:right-6 p-3 rounded-2xl shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 z-40" style={{ background: theme.resolvedTheme === "dark" ? "#1f2937" : "white", color: theme.resolvedTheme === "dark" ? "#e5e7eb" : "#374151", border: `1px solid ${theme.resolvedTheme === "dark" ? "#374151" : "#e5e7eb"}` }}>
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      <Column maxWidth="xl" paddingTop="24" paddingBottom="40">
        {/* Back Link */}
        <SmartLink href="/work" className={`inline-flex items-center gap-2 mb-8 transition-all ${theme.resolvedTheme === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Projects</span>
        </SmartLink>

        {/* Hero */}
        <div className="rounded-2xl overflow-hidden mb-8 shadow-lg border border-white/10">
          {project.coverImage && (
            <img src={project.coverImage} alt={project.title} className="w-full h-64 md:h-80 lg:h-96 object-cover" />
          )}
          <div className="p-6 md:p-8">
            <Heading variant="display-strong-l" marginBottom="16">{project.title}</Heading>
            {project.summary && (
              <Text variant="body-default-l" className={theme.resolvedTheme === "dark" ? "text-gray-300" : "text-gray-600"} marginBottom="24">
                {project.summary}
              </Text>
            )}

            {/* Meta Bar */}
            <Row gap="16" wrap vertical="center" marginBottom="24">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${project.status === "active" ? "bg-green-100 text-green-800" : project.status === "work-in-progress" ? "bg-yellow-100 text-yellow-800" : project.status === "archived" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"}`}>
                {project.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
              {project.category && <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{project.category}</span>}
              <Row gap="4" vertical="center">
                <Eye className={`w-4 h-4 ${theme.resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                <Text variant="body-default-xs" className={theme.resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}>{project.views.toLocaleString()} views</Text>
              </Row>
              <Row gap="4" vertical="center">
                <Heart className={`w-4 h-4 ${theme.resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                <Text variant="body-default-xs" className={theme.resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}>{likeCount.toLocaleString()} likes</Text>
              </Row>
              {project.publishedAt && (
                <Row gap="4" vertical="center">
                  <Calendar className={`w-4 h-4 ${theme.resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                  <Text variant="body-default-xs" className={theme.resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}>{formatDate(project.publishedAt)}</Text>
                </Row>
              )}
            </Row>

            {/* Action Bar */}
            <Row gap="12" wrap className={`pt-6 border-t ${theme.resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
              <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isLiked ? "bg-red-100 text-red-600" : theme.resolvedTheme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <Text variant="label-default-s">{likeCount}</Text>
              </button>
              <button onClick={openComments} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${theme.resolvedTheme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                <MessageCircle className="w-5 h-5" />
                <Text variant="label-default-s">{totalComments > 0 ? totalComments : 'Comment'}</Text>
              </button>
              <button onClick={handleBookmark} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isBookmarked ? "bg-yellow-100 text-yellow-600" : theme.resolvedTheme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
                <Text variant="label-default-s">Save</Text>
              </button>
              <button onClick={handleShare} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${theme.resolvedTheme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                <Share2 className="w-5 h-5" />
                <Text variant="label-default-s">Share</Text>
              </button>
              {project.releases?.find((r) => r.isLatest) && (
                <a href={project.releases.find((r) => r.isLatest)?.artifacts[0]?.downloadUrl} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white transition-all hover:from-green-600 hover:to-emerald-600">
                  <Download className="w-5 h-5" />
                  <Text variant="label-default-s">Download Latest</Text>
                </a>
              )}
              {project.releases?.find((r) => r.isLatest) && (
                <span className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm ${theme.resolvedTheme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                  v{project.releases.find((r) => r.isLatest)?.version}
                </span>
              )}
            </Row>
          </div>
        </div>

        {/* Tech Stack */}
        {project.technologyStack?.length > 0 && (
          <div className="rounded-2xl p-6 mb-8 shadow-lg">
            <Row gap="8" vertical="center" marginBottom="16">
              <Layers className={`w-5 h-5 ${theme.resolvedTheme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
              <Heading as="h2" variant="heading-strong-m">Technology Stack</Heading>
            </Row>
            <Row gap="8" wrap>
              {project.technologyStack.map((tech) => (
                <span key={tech} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme.resolvedTheme === "dark" ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{tech}</span>
              ))}
            </Row>
          </div>
        )}

        {/* Screenshots */}
        {project.screenshots?.length > 0 && (
          <div className="rounded-2xl p-6 mb-8 shadow-lg">
            <Row gap="8" vertical="center" marginBottom="16">
              <Package className={`w-5 h-5 ${theme.resolvedTheme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
              <Heading as="h2" variant="heading-strong-m">Screenshots</Heading>
            </Row>
            <Carousel items={project.screenshots.map((s) => ({ slide: s.url, alt: s.alt || s.caption || project.title }))} aspectRatio="16/9" indicator="thumbnail" />
          </div>
        )}

        {/* Key Features */}
        {project.pinnedFeatures?.length > 0 && (
          <div className="rounded-2xl p-6 mb-8 shadow-lg">
            <Row gap="8" vertical="center" marginBottom="16">
              <Zap className={`w-5 h-5 ${theme.resolvedTheme === "dark" ? "text-yellow-400" : "text-yellow-600"}`} />
              <Heading as="h2" variant="heading-strong-m">Key Features</Heading>
            </Row>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.pinnedFeatures.map((feature, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl ${theme.resolvedTheme === "dark" ? "bg-gray-700" : "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"}`}>
                  <Zap className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme.resolvedTheme === "dark" ? "text-yellow-400" : "text-yellow-600"}`} />
                  <Text variant="body-default-m" className={theme.resolvedTheme === "dark" ? "text-gray-200" : "text-gray-800"}>{feature}</Text>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About */}
        {project.documentDescription && (
          <div className="rounded-2xl p-6 mb-8 shadow-lg">
            <Row gap="8" vertical="center" marginBottom="16">
              <FileText className={`w-5 h-5 ${theme.resolvedTheme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
              <Heading as="h2" variant="heading-strong-m">About This Project</Heading>
            </Row>
            <Text variant="body-default-m" className={`whitespace-pre-wrap leading-relaxed ${theme.resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{project.documentDescription}</Text>
          </div>
        )}

        {/* Detailed Description */}
        {project.description && (
          <div className="rounded-2xl p-6 mb-8 shadow-lg">
            <Row gap="8" vertical="center" marginBottom="16">
              <BookOpen className={`w-5 h-5 ${theme.resolvedTheme === "dark" ? "text-green-400" : "text-green-600"}`} />
              <Heading as="h2" variant="heading-strong-m">Detailed Overview</Heading>
            </Row>
            <article ref={contentRef} className="tiptap-preview-content prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: renderedContent }} />
          </div>
        )}

        {/* FAQs */}
        {project.faqs?.length > 0 && (
          <div className="rounded-2xl p-6 mb-8 shadow-lg">
            <Row gap="8" vertical="center" marginBottom="16">
              <HelpCircle className={`w-5 h-5 ${theme.resolvedTheme === "dark" ? "text-orange-400" : "text-orange-600"}`} />
              <Heading as="h2" variant="heading-strong-m">FAQ</Heading>
            </Row>
            <Column gap="16">
              {project.faqs.sort((a, b) => a.order - b.order).map((faq, i) => (
                <div key={i} className={`p-5 rounded-xl ${theme.resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-50 border border-gray-200"}`}>
                  <Text variant="heading-strong-s" marginBottom="8">{faq.question}</Text>
                  <Text variant="body-default-m" className={theme.resolvedTheme === "dark" ? "text-gray-300" : "text-gray-600"}>{faq.answer}</Text>
                </div>
              ))}
            </Column>
          </div>
        )}

        {/* Mermaid Diagrams */}
        {project.diagrams?.length > 0 && (
          <div className="rounded-2xl p-6 mb-8 shadow-lg">
            <Heading as="h2" variant="heading-strong-m" marginBottom="16">Diagrams</Heading>
            {project.diagrams.map((diagram) => (
              <div key={diagram.name} className="mb-6">
                <Text variant="heading-strong-s" marginBottom="8">{diagram.name}</Text>
                {diagram.description && <Text variant="body-default-s" onBackground="neutral-weak" marginBottom="12">{diagram.description}</Text>}
                <div id={`mermaid-${diagram.name.replace(/\s+/g, "-")}`} className="rounded-xl overflow-hidden" style={{ minHeight: "200px", background: theme.resolvedTheme === "dark" ? "#1f2937" : "#f9fafb" }}>
                  {!mermaidReady && <div className="flex items-center justify-center h-40"><Text variant="body-default-s" onBackground="neutral-weak">Loading diagram...</Text></div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* References */}
        {project.references?.length > 0 && (
          <div className="rounded-2xl p-6 mb-8 shadow-lg">
            <Heading as="h2" variant="heading-strong-m" marginBottom="16">References</Heading>
            <Column gap="12">
              {project.references.map((ref, i) => (
                <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-4 rounded-xl transition-all ${theme.resolvedTheme === "dark" ? "bg-gray-700 hover:bg-gray-600 text-blue-400" : "bg-gray-50 hover:bg-gray-100 text-blue-600 border border-gray-200"}`}>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <Text variant="label-default-s">{ref.title}</Text>
                    {ref.description && <Text variant="body-default-xs" onBackground="neutral-weak">{ref.description}</Text>}
                  </div>
                </a>
              ))}
            </Column>
          </div>
        )}

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="rounded-2xl p-6 mb-8 shadow-lg">
            <Row gap="8" vertical="center" marginBottom="16">
              <Tag className={`w-5 h-5 ${theme.resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              <Heading as="h2" variant="heading-strong-m">Tags</Heading>
            </Row>
            <Row gap="8" wrap>
              {project.tags.map((tag) => (
                <span key={tag} className={`px-3 py-1.5 rounded-full text-sm ${theme.resolvedTheme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700 border border-gray-200"}`}>#{tag}</span>
              ))}
            </Row>
          </div>
        )}

        {/* Links */}
        <div className="rounded-2xl p-6 mb-8 shadow-lg">
          <Row gap="12" wrap>
            {project.releases?.find((r) => r.isLatest)?.artifacts.map((artifact, i) => (
              <a key={i} href={artifact.downloadUrl} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">{artifact.name}</span>
                <span className="text-xs opacity-75">{formatBytes(artifact.size)}</span>
              </a>
            ))}
          </Row>
        </div>
      </Column>
      <CommentsSheet show={isCommentsOpen} onClose={closeComments} blogId={project.id} />
    </>
  );
}
