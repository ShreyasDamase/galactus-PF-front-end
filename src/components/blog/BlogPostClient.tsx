"use client";

import { useParams } from "next/navigation";
import { useLikePost, useUnlikePost } from "@/lib/hooks/usePosts";
import {
  Column,
  Heading,
  Text,
  Avatar,
  Row,
  SmartLink,
  HoverCard,
  Tag,
} from "@once-ui-system/core";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ChevronUp,
} from "lucide-react";
import hljs from "highlight.js";
import { useTheme } from "@once-ui-system/core";
import { motion, AnimatePresence } from "framer-motion";

// Import styles
import "@/styles/blog-preview.css";
import "@/styles/syntax-theme.css";
import "@/styles/enhanced-tables.css";
import "@/styles/enhanced-image.css";
import CommentsSheet from "@/components/blog/CommentsSheet";
import { useProfile } from "@/lib/hooks/useProfile";
import { sanitizeHTML } from "@/lib/sanitize";
import type { BlogPost } from "@/lib/types";

interface BlogPostClientProps {
  initialPost: BlogPost;
}

export default function BlogPostClient({ initialPost }: BlogPostClientProps) {
  const post = initialPost;
  const slug = post.slug;
  const contentRef = useRef<HTMLDivElement>(null);
  const { data: profiledata } = useProfile();

  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();

  // State management
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [renderedContent, setRenderedContent] = useState<string>("");
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);

  const openComments = useCallback(() => {
    setIsCommentsOpen(true);
  }, []);

  const closeComments = useCallback(() => {
    setIsCommentsOpen(false);
  }, []);

  const theme = useTheme();

  // Initialize like count, liked state, and bookmark state from localStorage
  useEffect(() => {
    if (post) {
      setLikeCount(post.likes || 0);

      if (post._id) {
        // Restore liked state
        const savedLikedPosts = localStorage.getItem("liked_posts");
        if (savedLikedPosts) {
          const parsed = JSON.parse(savedLikedPosts);
          if (parsed.includes(post._id)) setIsLiked(true);
        }
        // Restore bookmarked state
        const savedBookmarks = localStorage.getItem("bookmarked_posts");
        if (savedBookmarks) {
          const parsed: Array<{ id: string }> = JSON.parse(savedBookmarks);
          if (parsed.some((b) => b.id === post._id)) setIsBookmarked(true);
        }
      }
    }
  }, [post]);

  // Reading progress and floating actions
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } =
            document.documentElement;
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

  // ✅ Enhance code blocks in memory
  useEffect(() => {
    if (!post?.content) return;

    hljs.configure({
      ignoreUnescapedHTML: true,
      languages: [
        "javascript",
        "typescript",
        "python",
        "java",
        "cpp",
        "c",
        "html",
        "css",
        "json",
        "xml",
        "sql",
        "bash",
        "shell",
        "go",
        "rust",
        "php",
        "ruby",
        "swift",
        "kotlin",
        "dart",
        "yaml",
        "dockerfile",
        "markdown",
        "graphql",
      ],
    });

    const temp = document.createElement("div");
    temp.innerHTML = post?.content;

    const preBlocks = temp.querySelectorAll("pre");

    preBlocks.forEach((block, index) => {
      const code = block.querySelector("code");
      if (!code) return;

      hljs.highlightElement(code as HTMLElement);

      const codeText = code.textContent || "";
      const lines = codeText.split("\n").filter((line) => line.trim() !== "");
      const shouldScroll = lines.length > 70;

      const detectLanguage = (codeElement: Element): string => {
        const classNames = codeElement.className;
        const patterns = [/language-(\w+)/i, /lang-(\w+)/i, /hljs\s+(\w+)/i];

        for (const pattern of patterns) {
          const match = classNames.match(pattern);
          if (match) return match[1].toLowerCase();
        }
        return "plaintext";
      };

      const languageClass = detectLanguage(code);
      const languageDisplay =
        languageClass.charAt(0).toUpperCase() + languageClass.slice(1);

      const languageColors: Record<
        string,
        { bg: string; text: string; border: string }
      > = {
        javascript: { bg: "#fef3c7", text: "#d97706", border: "#fbbf24" },
        typescript: { bg: "#dbeafe", text: "#2563eb", border: "#60a5fa" },
        python: { bg: "#dcfce7", text: "#16a34a", border: "#4ade80" },
        java: { bg: "#fee2e2", text: "#dc2626", border: "#f87171" },
        cpp: { bg: "#f3e8ff", text: "#9333ea", border: "#c084fc" },
        c: { bg: "#f3e8ff", text: "#9333ea", border: "#c084fc" },
        html: { bg: "#fed7aa", text: "#ea580c", border: "#fb923c" },
        css: { bg: "#fce7f3", text: "#db2777", border: "#f472b6" },
        json: { bg: "#d1fae5", text: "#059669", border: "#34d399" },
        bash: { bg: "#f3f4f6", text: "#4b5563", border: "#d1d5db" },
        shell: { bg: "#f3f4f6", text: "#4b5563", border: "#d1d5db" },
        sql: { bg: "#cffafe", text: "#0891b2", border: "#22d3ee" },
        go: { bg: "#cffafe", text: "#0891b2", border: "#22d3ee" },
        rust: { bg: "#fed7aa", text: "#ea580c", border: "#fb923c" },
        php: { bg: "#e0e7ff", text: "#4f46e5", border: "#818cf8" },
        ruby: { bg: "#fee2e2", text: "#dc2626", border: "#f87171" },
        swift: { bg: "#fed7aa", text: "#ea580c", border: "#fb923c" },
        kotlin: { bg: "#f3e8ff", text: "#9333ea", border: "#c084fc" },
        dart: { bg: "#dbeafe", text: "#2563eb", border: "#60a5fa" },
        yaml: { bg: "#f3f4f6", text: "#4b5563", border: "#d1d5db" },
        plaintext: { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
      };

      const colors = languageColors[languageClass] || languageColors.plaintext;

      const wrapper = document.createElement("div");
      wrapper.className = `code-block-enhanced ${theme.resolvedTheme}`;
      wrapper.style.cssText = `
  background: ${theme.resolvedTheme === "dark" ? "#1f2937" : "white"};
`;

      const header = document.createElement("div");
      header.className = "code-block-header";
      header.style.cssText = `
      display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1rem;
  background: ${theme.resolvedTheme === "dark" ? "#232323ff" : "#f3f4f6"};
  border-bottom: 1px solid ${
    theme.resolvedTheme === "dark" ? "#374151" : "#e5e7eb"
  };
   ${
     theme.resolvedTheme === "light"
       ? `
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  `
       : ""
   }
  overflow: hidden; 
  
        `;

      const leftSide = document.createElement("div");
      leftSide.style.cssText =
        "display: flex; align-items: center; gap: 0.75rem;";

      const langBadge = document.createElement("div");
      langBadge.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        font-family: Monaco, Menlo, 'Ubuntu Mono', monospace;
        background: ${colors.bg};
        color: ${colors.text};
        border: 1px solid ${colors.border};
      `;
      langBadge.innerHTML = `
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
        <span>${languageDisplay}</span>
      `;

      const metaInfo = document.createElement("div");
      metaInfo.style.cssText = `
        font-size: 0.75rem;
        color: #6b7280;
        font-family: Monaco, Menlo, 'Ubuntu Mono', monospace;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      `;
      const sizeKB = (codeText.length / 1024).toFixed(1);
      metaInfo.innerHTML = `
        <span>${lines.length} lines</span>
        <span style="color: #d1d5db;">•</span>
        <span>${sizeKB} KB</span>
      `;

      leftSide.appendChild(langBadge);
      leftSide.appendChild(metaInfo);

      const rightSide = document.createElement("div");
      rightSide.style.cssText =
        "display: flex; align-items: center; gap: 0.5rem;";

      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-code-btn";
      copyBtn.setAttribute("data-block-index", index.toString());
      copyBtn.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.75rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 500;
        background: transparent;
        color: #4b5563;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
      `;
      copyBtn.setAttribute("aria-label", "Copy code");
      copyBtn.innerHTML = `
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        <span>Copy</span>
      `;

      rightSide.appendChild(copyBtn);

      if (shouldScroll) {
        const expandBtn = document.createElement("button");
        expandBtn.className = "expand-code-btn";
        expandBtn.style.cssText = `
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          background: transparent;
          color: #4b5563;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        `;

        expandBtn.setAttribute("data-index", index.toString());

        const isExpanded = expandedBlocks.has(index);
        const buttonText = isExpanded ? "Collapse" : "Expand";
        expandBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg><span>${buttonText}</span>`;

        rightSide.appendChild(expandBtn);
      }

      header.appendChild(leftSide);
      header.appendChild(rightSide);

      const codeContainer = document.createElement("div");
      codeContainer.className = "code-container";

      const isExpanded = expandedBlocks.has(index);

      codeContainer.style.cssText = shouldScroll
        ? isExpanded
          ? "max-height: none; overflow-y: visible; position: relative;"
          : "max-height: 500px; overflow-y: auto; position: relative;"
        : "position: relative;";

      const styledBlock = block.cloneNode(true) as HTMLElement;
      styledBlock.style.cssText = "margin: 0; border-radius: 0; border: none;";

      codeContainer.appendChild(styledBlock);
      wrapper.appendChild(header);
      wrapper.appendChild(codeContainer);

      block.replaceWith(wrapper);
    });

    // Sanitize before setting — strips any XSS injected via CMS
    setRenderedContent(sanitizeHTML(temp.innerHTML));
  }, [post?.content, slug, expandedBlocks]);

  // ✅ Attach event listeners using EVENT DELEGATION
  useEffect(() => {
    const container = contentRef.current;

    if (!container || !renderedContent) return;

    const handleContainerClick = async (e: Event) => {
      const target = e.target as HTMLElement;

      const copyBtn = target.closest(".copy-code-btn") as HTMLButtonElement;
      if (copyBtn) {
        e.preventDefault();
        e.stopPropagation();

        const codeBlock = copyBtn.closest(".code-block-enhanced");
        const codeElement = codeBlock?.querySelector("code");
        const codeText = codeElement?.textContent || "";

        if (!codeText) return;

        try {
          await navigator.clipboard.writeText(codeText);

          const originalBg = copyBtn.style.background;

          copyBtn.style.background = "#d1fae5";
          copyBtn.style.color = "#10b981";
          const span = copyBtn.querySelector("span");
          if (span) span.textContent = "Copied!";

          setTimeout(() => {
            copyBtn.style.background = originalBg;
            copyBtn.style.color = "";
            if (span) span.textContent = "Copy";
          }, 2000);
        } catch (err) {
          console.error("❌ Copy failed:", err);
        }
        return;
      }

      const expandBtn = target.closest(".expand-code-btn") as HTMLButtonElement;
      if (expandBtn) {
        e.preventDefault();
        e.stopPropagation();

        const blockIndexStr = expandBtn.getAttribute("data-index");
        if (!blockIndexStr) return;

        const blockIndex = parseInt(blockIndexStr, 10);

        setExpandedBlocks((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(blockIndex)) {
            newSet.delete(blockIndex);
          } else {
            newSet.add(blockIndex);
          }
          return newSet;
        });
      }
    };

    const handleContainerMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest(
        ".copy-code-btn, .expand-code-btn"
      ) as HTMLButtonElement;
      if (btn && !btn.textContent?.includes("Copied!")) {
        btn.style.background = "#f3f4f6";
      }
    };

    const handleContainerMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest(
        ".copy-code-btn, .expand-code-btn"
      ) as HTMLButtonElement;
      if (btn && !btn.textContent?.includes("Copied!")) {
        btn.style.background = "transparent";
      }
    };

    container.addEventListener("click", handleContainerClick as EventListener);
    container.addEventListener(
      "mouseover",
      handleContainerMouseOver as EventListener
    );
    container.addEventListener(
      "mouseout",
      handleContainerMouseOut as EventListener
    );

    return () => {
      container.removeEventListener(
        "click",
        handleContainerClick as EventListener
      );
      container.removeEventListener(
        "mouseover",
        handleContainerMouseOver as EventListener
      );
      container.removeEventListener(
        "mouseout",
        handleContainerMouseOut as EventListener
      );
    };
  }, [renderedContent]);

  const handleLike = useCallback(async () => {
    if (!post?._id) return;

    try {
      if (isLiked) {
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));

        await unlikePostMutation.mutateAsync(post._id);

        const saved = localStorage.getItem("liked_posts");
        const parsed = saved ? JSON.parse(saved) : [];
        localStorage.setItem(
          "liked_posts",
          JSON.stringify(parsed.filter((id: string) => id !== post._id))
        );
      } else {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);

        await likePostMutation.mutateAsync(post._id);

        const saved = localStorage.getItem("liked_posts");
        const parsed = saved ? JSON.parse(saved) : [];
        if (!parsed.includes(post._id)) {
          parsed.push(post._id);
          localStorage.setItem("liked_posts", JSON.stringify(parsed));
        }
      }
    } catch (error) {
      console.error("Failed to like/unlike post", error);
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : Math.max(0, prev - 1)));
    }
  }, [isLiked, post, likePostMutation, unlikePostMutation]);

  const handleBookmark = useCallback(async () => {
    if (!post?._id) return;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      // On mobile — open native share sheet (iOS has "Add to Reading List")
      try {
        await navigator.share({
          title: post.title,
          text: post.description || `Read: ${post.title}`,
          url: window.location.href,
        });
        // No state change — native share handles it
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed", err);
        }
      }
      return;
    }

    // Desktop — save to localStorage reading list
    const saved = localStorage.getItem("bookmarked_posts");
    const bookmarks: Array<{ id: string; slug: string; title: string; coverImage?: string; publishedAt: string }> =
      saved ? JSON.parse(saved) : [];

    if (isBookmarked) {
      // Remove bookmark
      const updated = bookmarks.filter((b) => b.id !== post._id);
      localStorage.setItem("bookmarked_posts", JSON.stringify(updated));
      setIsBookmarked(false);
      setBookmarkToast("Removed from reading list");
    } else {
      // Add bookmark
      if (!bookmarks.some((b) => b.id === post._id)) {
        bookmarks.push({
          id: post._id,
          slug: post.slug,
          title: post.title,
          coverImage: post.coverImage,
          publishedAt: post.publishedAt,
        });
        localStorage.setItem("bookmarked_posts", JSON.stringify(bookmarks));
      }
      setIsBookmarked(true);
      setBookmarkToast("Saved to reading list ✓");
    }

    // Auto-hide toast after 2.5s
    setTimeout(() => setBookmarkToast(null), 2500);
  }, [isBookmarked, post]);

  const handleShare = useCallback(async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.description,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.log("Share cancelled");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  }, [post]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme.resolvedTheme === "dark"
    );
  }, [theme.resolvedTheme]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-150 ease-out shadow-sm"
          style={{ width: `${readingProgress}%` }}
          role="progressbar"
          aria-valuenow={readingProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
        />
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
            animation: "fadeInUp 0.2s ease",
          }}
        >
          {bookmarkToast}
        </div>
      )}

      {/* Floating Action Buttons */}
      {showFloatingActions && (
        <AnimatePresence>
          <motion.div
            className="fixed left-4 md:left-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              className="flex flex-col gap-3 p-3 rounded-[20px] relative overflow-hidden"
              style={{
                background:
                  theme.resolvedTheme === "dark"
                    ? "linear-gradient(135deg, rgba(30, 30, 30, 0.4), rgba(20, 20, 20, 0.3))"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
                backdropFilter: "blur(40px) saturate(200%)",
                WebkitBackdropFilter: "blur(40px) saturate(200%)",
                border:
                  theme.resolvedTheme === "dark"
                    ? "1.5px solid rgba(255, 255, 255, 0.1)"
                    : "1.5px solid rgba(255, 255, 255, 0.18)",
                boxShadow:
                  theme.resolvedTheme === "dark"
                    ? `0 8px 32px 0 rgba(0, 0, 0, 0.4),
               inset 0 1px 1px 0 rgba(255, 255, 255, 0.1),
               inset 0 -1px 1px 0 rgba(255, 255, 255, 0.05)`
                    : `0 8px 32px 0 rgba(0, 0, 0, 0.08),
               inset 0 1px 1px 0 rgba(255, 255, 255, 0.9),
               inset 0 -1px 1px 0 rgba(255, 255, 255, 0.1)`,
              }}
            >
              {/* Like Button */}
              <motion.button
                onClick={handleLike}
                className={`p-2.5 rounded-[14px] relative overflow-hidden ${
                  isLiked ? "text-red-500" : "text-red-600"
                }`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                title="Like this post"
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                <Heart
                  className={`w-5 h-5 relative z-10 ${
                    isLiked ? "fill-current" : ""
                  }`}
                />
              </motion.button>

              {/* Comment Button */}
              <motion.button
                onClick={openComments}
                className={`p-2.5 rounded-[14px] relative overflow-hidden ${
                  theme.resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                title="Go to comments"
                aria-label="Scroll to comments"
              >
                <MessageCircle className="w-5 h-5 relative z-10" />
              </motion.button>

              {/* Bookmark Button */}
              <motion.button
                onClick={handleBookmark}
                className={`p-2.5 rounded-[14px] relative overflow-hidden ${
                  isBookmarked ? "text-yellow-500" : "text-amber-600"
                }`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                title={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
              >
                <Bookmark
                  className={`w-5 h-5 relative z-10 ${
                    isBookmarked ? "fill-current" : ""
                  }`}
                />
              </motion.button>

              {/* Share Button */}
              <motion.button
                onClick={handleShare}
                className={`p-2.5 rounded-[14px] relative overflow-hidden ${
                  theme.resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                title="Share this post"
                aria-label="Share post"
              >
                <Share2 className="w-5 h-5 relative z-10" />
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Scroll to Top Button */}
      {showFloatingActions && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-4 md:right-6 p-3 rounded-2xl shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 z-40 bg-white text-gray-700 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 group"
          title="Scroll to top"
          aria-label="Scroll to top of page"
        >
          <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

      <Column maxWidth="m" paddingTop="24" paddingBottom="40">
        {/* Back Link */}
        <SmartLink
          href="/blog"
          className="inline-flex items-center gap-2 mb-8 transition-all duration-200 text-gray-500 hover:text-gray-700 hover:gap-3 group"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back to Blog</span>
        </SmartLink>

        {/* Cover Image */}
        {post?.coverImage && (
          <div className="mb-8 overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            <img
              src={post?.coverImage}
              alt={post?.title}
              className="w-full h-48 md:h-64 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              loading="eager"
            />
          </div>
        )}

        {/* Post Header */}
        <header className="mb-8">
          <Heading variant="display-strong-l" marginBottom="16">
            {post?.title}
          </Heading>

          {post?.description && (
            <Text
              variant="body-default-l"
              className="text-gray-600"
              marginBottom="24"
            >
              {post?.description}
            </Text>
          )}

          {/* Post Meta */}
          <Row gap="16" wrap vertical="center" marginBottom="24">
            {post?.author && (
              <Row gap="12" vertical="center">
                {post?.author?.profileImage && (
                  <HoverCard
                    placement="top"
                    trigger={
                      <Avatar
                        size="l"
                        src={post?.author?.profileImage}
                        tabIndex={0}
                      />
                    }
                  >
                    <Column
                      padding="20"
                      gap="20"
                      radius="l"
                      maxWidth={24}
                      background="page"
                      border="neutral-alpha-weak"
                    >
                      <Row gap="20" fillWidth vertical="center">
                        <Avatar size={3} src={post?.author?.profileImage} />
                        <Column gap="4">
                          <Text variant="heading-strong-m">
                            {post?.author.firstName} {post?.author?.lastName}
                          </Text>
                          <Text
                            variant="body-default-s"
                            onBackground="neutral-weak"
                          >
                            {profiledata?.role}
                          </Text>
                        </Column>
                      </Row>
                      <Text
                        variant="body-default-s"
                        onBackground="neutral-weak"
                      >
                        {profiledata?.bio}
                      </Text>
                      <Row gap="8" wrap>
                        {profiledata?.skills.slice(0, 4).map((item) => (
                          <Tag key={item}>{item}</Tag>
                        ))}
                        <Text>...</Text>
                      </Row>
                    </Column>
                  </HoverCard>
                )}
                <Text variant="label-default-s" className="text-gray-600">
                  {post?.author.firstName} {post?.author?.lastName}
                </Text>
              </Row>
            )}

            {post?.publishedAt && (
              <Text variant="body-default-xs" className="text-gray-500">
                {new Date(post?.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            )}

            {post?.readingTime && (
              <Text variant="body-default-xs" className="text-gray-500">
                {post?.readingTime} min read
              </Text>
            )}

            {post?.category && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {post?.category}
              </span>
            )}
          </Row>

          {/* Social Actions Bar */}
          <Row
            gap="24"
            paddingY="16"
            horizontal="stretch"
            vertical="center"
            style={{
              borderTop: "1px solid #e5e7eb",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <Row gap="24" vertical="center">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                  isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                }`}
                aria-label={
                  isLiked
                    ? `Unlike (${likeCount} likes)`
                    : `Like (${likeCount} likes)`
                }
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <Text variant="label-default-s" className="font-medium">
                  {likeCount}
                </Text>
              </button>

              <button
                onClick={openComments}
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 text-gray-500 hover:text-blue-500"
              >
                <MessageCircle className="w-5 h-5" />
                <Text variant="label-default-s" className="hidden sm:inline">
                  Comment
                </Text>
              </button>
            </Row>

            <Row gap="16" vertical="center">
              <button
                onClick={handleBookmark}
                className={`transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isBookmarked
                    ? "text-yellow-500"
                    : "text-gray-500 hover:text-yellow-500"
                }`}
                title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
              >
                <Bookmark
                  className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
                />
              </button>

              <button
                onClick={handleShare}
                className="transition-all duration-200 hover:scale-110 active:scale-95 text-gray-500 hover:text-green-500"
                title="Share"
                aria-label="Share post"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </Row>
          </Row>
        </header>

        {/* Post Content */}
        <article
          ref={contentRef}
          className="tiptap-preview-content prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <Column
            gap="16"
            marginTop="48"
            paddingTop="24"
            style={{ borderTop: "1px solid #e5e7eb" }}
          >
            <Text variant="label-default-s" className="text-gray-600">
              Tags
            </Text>
            <Row gap="8" wrap>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-sm transition-all duration-200 cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 active:scale-95 border border-gray-200"
                >
                  #{tag}
                </span>
              ))}
            </Row>
          </Column>
        )}
      </Column>

      <div className="absolute">
        <CommentsSheet
          show={isCommentsOpen}
          onClose={closeComments}
          blogId={post.id}
        />
      </div>
    </>
  );
}
