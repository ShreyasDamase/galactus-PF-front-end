"use client";

import { useParams } from "next/navigation";
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
import { useProject } from "@/lib/hooks/useProject";

declare global {
  interface Window {
    mermaid?: any;
    mermaidLoaded?: boolean;
  }
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: project, isLoading, error } = useProject(slug);

  const contentRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [renderedContent, setRenderedContent] = useState<string>("");
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [mermaidReady, setMermaidReady] = useState<boolean>(false);

  useEffect(() => {
    if (project?.likes !== undefined) {
      setLikeCount(project.likes);
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
        mermaid.initialize({
          startOnLoad: false,
          theme: '${theme.resolvedTheme === "dark" ? "dark" : "default"}',
          securityLevel: 'loose',
          fontFamily: 'inherit',
        });
        window.mermaid = mermaid;
        window.mermaidLoaded = true;
        window.dispatchEvent(new CustomEvent('mermaidLoaded'));
      `;
      document.head.appendChild(script);

      const handleMermaidLoaded = () => {
        setMermaidReady(true);
        window.removeEventListener("mermaidLoaded", handleMermaidLoaded);
      };
      window.addEventListener("mermaidLoaded", handleMermaidLoaded);

      return () =>
        window.removeEventListener("mermaidLoaded", handleMermaidLoaded);
    };

    loadMermaid();
  }, [theme.resolvedTheme]);

  // Reading progress
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

  // Enhanced code blocks with theme support
  useEffect(() => {
    if (!project?.description) return;

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
    temp.innerHTML = project.description;
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
        html: { bg: "#fed7aa", text: "#ea580c", border: "#fb923c" },
        css: { bg: "#fce7f3", text: "#db2777", border: "#f472b6" },
        json: { bg: "#d1fae5", text: "#059669", border: "#34d399" },
        bash: { bg: "#f3f4f6", text: "#4b5563", border: "#d1d5db" },
        plaintext: { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
      };

      const colors = languageColors[languageClass] || languageColors.plaintext;
      const wrapper = document.createElement("div");
      wrapper.className = `code-block-enhanced ${theme.resolvedTheme}`;
      wrapper.style.cssText = `
        background: ${theme.resolvedTheme === "dark" ? "#1f2937" : "white"};
        border-radius: 12px;
        overflow: hidden;
        margin: 1.5rem 0;
        border: 1px solid ${
          theme.resolvedTheme === "dark" ? "#374151" : "#e5e7eb"
        };
      `;

      const header = document.createElement("div");
      header.className = "code-block-header";
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background: ${theme.resolvedTheme === "dark" ? "#1f2937" : "#f9fafb"};
        border-bottom: 1px solid ${
          theme.resolvedTheme === "dark" ? "#374151" : "#e5e7eb"
        };
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
        font-family: 'Monaco', 'Menlo', monospace;
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
        color: ${theme.resolvedTheme === "dark" ? "#9ca3af" : "#6b7280"};
        font-family: 'Monaco', 'Menlo', monospace;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      `;
      const sizeKB = (codeText.length / 1024).toFixed(1);
      metaInfo.innerHTML = `
        <span>${lines.length} lines</span>
        <span style="color: ${
          theme.resolvedTheme === "dark" ? "#4b5563" : "#d1d5db"
        };">•</span>
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
        color: ${theme.resolvedTheme === "dark" ? "#9ca3af" : "#4b5563"};
        border: none;
        cursor: pointer;
        transition: all 0.2s;
      `;
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
          color: ${theme.resolvedTheme === "dark" ? "#9ca3af" : "#4b5563"};
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        `;
        expandBtn.setAttribute("data-index", index.toString());
        const isExpanded = expandedBlocks.has(index);
        expandBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg><span>${
          isExpanded ? "Collapse" : "Expand"
        }</span>`;
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

    setRenderedContent(temp.innerHTML);
  }, [project?.description, expandedBlocks, theme.resolvedTheme]);

  // Event listeners for code blocks
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
          console.error("Copy failed:", err);
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
        btn.style.background =
          theme.resolvedTheme === "dark" ? "#374151" : "#f3f4f6";
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
  }, [renderedContent, theme.resolvedTheme]);

  // Render Mermaid
  useEffect(() => {
    if (!mermaidReady || !project?.diagrams || project.diagrams.length === 0)
      return;

    const renderDiagrams = async () => {
      for (const diagram of project.diagrams) {
        if (diagram.type !== "mermaid") continue;
        const diagramElement = document.getElementById(
          `mermaid-${diagram.name.replace(/\s+/g, "-")}`
        );
        if (!diagramElement) continue;

        try {
          const diagramId = `mermaid-diagram-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          diagramElement.innerHTML = "";
          const result = await window.mermaid.render(
            diagramId,
            diagram.content
          );
          if (result && result.svg) {
            diagramElement.innerHTML = result.svg;
            if (result.bindFunctions) {
              result.bindFunctions(diagramElement);
            }
          }
        } catch (err) {
          console.error("Mermaid rendering error:", err);
          diagramElement.innerHTML = `
            <div class="flex items-center justify-center h-full min-h-[200px] p-8 text-center">
              <div style="color: #ef4444;">Failed to render diagram</div>
            </div>
          `;
        }
      }
    };

    renderDiagrams();
  }, [mermaidReady, project?.diagrams]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme.resolvedTheme === "dark"
    );
  }, [theme.resolvedTheme]);

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  }, [isLiked]);

  const handleBookmark = useCallback(() => {
    setIsBookmarked(!isBookmarked);
  }, [isBookmarked]);

  const handleShare = useCallback(async () => {
    if (navigator.share && project) {
      try {
        await navigator.share({
          title: project.title,
          text: project.summary,
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
  }, [project]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Column maxWidth="m" paddingTop="24">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </Column>
    );
  }

  if (error || !project) {
    return (
      <Column maxWidth="m" paddingTop="24">
        <div className="text-center py-20">
          <Heading variant="heading-strong-xl" marginBottom="16">
            Project Not Found
          </Heading>
          <Text marginBottom="24">
            The project you're looking for doesn't exist.
          </Text>
          <SmartLink
            href="/work"
            className="text-blue-600 hover:underline transition-colors"
          >
            ← Back to Projects
          </SmartLink>
        </div>
      </Column>
    );
  }

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
          role="progressbar"
          aria-valuenow={readingProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Floating Actions */}
      {showFloatingActions && (
        <AnimatePresence>
          <motion.div
            className="fixed left-4 md:left-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <div
              className="flex flex-col gap-3 p-3 rounded-2xl shadow-xl"
              style={{
                background:
                  theme.resolvedTheme === "dark" ? "#1f2937" : "white",
                border: `1px solid ${
                  theme.resolvedTheme === "dark" ? "#374151" : "#e5e7eb"
                }`,
              }}
            >
              <motion.button
                onClick={handleLike}
                className={`p-2.5 rounded-xl ${
                  isLiked
                    ? "text-red-500"
                    : theme.resolvedTheme === "dark"
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </motion.button>

              <div
                className={`w-full h-px ${
                  theme.resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
              />

              <motion.button
                onClick={handleBookmark}
                className={`p-2.5 rounded-xl ${
                  isBookmarked
                    ? "text-yellow-500"
                    : theme.resolvedTheme === "dark"
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bookmark
                  className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
                />
              </motion.button>

              <motion.button
                onClick={handleShare}
                className={`p-2.5 rounded-xl ${
                  theme.resolvedTheme === "dark"
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Scroll to Top */}
      {showFloatingActions && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-4 md:right-6 p-3 rounded-2xl shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 z-40"
          style={{
            background: theme.resolvedTheme === "dark" ? "#1f2937" : "white",
            color: theme.resolvedTheme === "dark" ? "#e5e7eb" : "#374151",
            border: `1px solid ${
              theme.resolvedTheme === "dark" ? "#374151" : "#e5e7eb"
            }`,
          }}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      <Column maxWidth="xl" paddingTop="24" paddingBottom="40">
        {/* Back Link */}
        <SmartLink
          href="/work"
          className={`inline-flex items-center gap-2 mb-8 transition-all ${
            theme.resolvedTheme === "dark"
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg
            className="w-4 h-4"
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
          <span>Back to Projects</span>
        </SmartLink>

        {/* Hero Section */}
        <div
          className={`rounded-2xl overflow-hidden mb-8 backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 shadow-lg border border-white/10`}
        >
          {project.coverImage && (
            <img
              src={project.coverImage}
              alt={project.title}
              className="w-full h-64 md:h-80 lg:h-96 object-cover"
            />
          )}

          <div className="p-6 md:p-8">
            <Heading variant="display-strong-l" marginBottom="16">
              {project.title}
            </Heading>

            {project.summary && (
              <Text
                variant="body-default-l"
                className={
                  theme.resolvedTheme === "dark"
                    ? "text-gray-300"
                    : "text-gray-600"
                }
                marginBottom="24"
              >
                {project.summary}
              </Text>
            )}

            {/* Meta Bar */}
            <Row gap="16" wrap vertical="center" marginBottom="24">
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  project.status === "active"
                    ? "bg-green-100 text-green-800"
                    : project.status === "work-in-progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : project.status === "archived"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {project.status
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>

              {project.category && (
                <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {project.category}
                </span>
              )}

              <Row gap="4" vertical="center">
                <Eye
                  className={`w-4 h-4 ${
                    theme.resolvedTheme === "dark"
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                />
                <Text
                  variant="body-default-xs"
                  className={
                    theme.resolvedTheme === "dark"
                      ? "text-gray-400"
                      : "text-gray-500"
                  }
                >
                  {project.views.toLocaleString()} views
                </Text>
              </Row>

              <Row gap="4" vertical="center">
                <Heart
                  className={`w-4 h-4 ${
                    theme.resolvedTheme === "dark"
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                />
                <Text
                  variant="body-default-xs"
                  className={
                    theme.resolvedTheme === "dark"
                      ? "text-gray-400"
                      : "text-gray-500"
                  }
                >
                  {likeCount.toLocaleString()} likes
                </Text>
              </Row>

              {project.downloads > 0 && (
                <Row gap="4" vertical="center">
                  <Download
                    className={`w-4 h-4 ${
                      theme.resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <Text
                    variant="body-default-xs"
                    className={
                      theme.resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }
                  >
                    {project.downloads.toLocaleString()} downloads
                  </Text>
                </Row>
              )}

              {project.publishedAt && (
                <Row gap="4" vertical="center">
                  <Calendar
                    className={`w-4 h-4 ${
                      theme.resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <Text
                    variant="body-default-xs"
                    className={
                      theme.resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }
                  >
                    {formatDate(project.publishedAt)}
                  </Text>
                </Row>
              )}
            </Row>

            {/* Action Bar */}
            <Row
              gap="12"
              wrap
              className={`pt-6 border-t ${
                theme.resolvedTheme === "dark"
                  ? "border-gray-700"
                  : "border-gray-200"
              }`}
            >
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isLiked
                    ? "bg-red-100 text-red-600"
                    : theme.resolvedTheme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <Text variant="label-default-s">{likeCount}</Text>
              </button>

              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isBookmarked
                    ? "bg-yellow-100 text-yellow-600"
                    : theme.resolvedTheme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Bookmark
                  className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
                />
                <Text variant="label-default-s">Save</Text>
              </button>

              <button
                onClick={handleShare}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  theme.resolvedTheme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Share2 className="w-5 h-5" />
                <Text variant="label-default-s">Share</Text>
              </button>
            </Row>
          </div>
        </div>

        {/* Tech Stack */}
        {project.technologyStack && project.technologyStack.length > 0 && (
          <div className={`rounded-2xl p-6 mb-8   shadow-lg`}>
            <Row gap="8" vertical="center" marginBottom="16">
              <Layers
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-blue-400"
                    : "text-blue-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                Technology Stack
              </Heading>
            </Row>
            <Row gap="8" wrap>
              {project.technologyStack.map((tech) => (
                <span
                  key={tech}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    theme.resolvedTheme === "dark"
                      ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tech}
                </span>
              ))}
            </Row>
          </div>
        )}

        {/* Quick Downloads */}
        {project.downloadButtons && project.downloadButtons.length > 0 && (
          <div className={`rounded-2xl p-6 mb-8   shadow-lg`}>
            <Row gap="8" vertical="center" marginBottom="16">
              <Download
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-green-400"
                    : "text-green-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                Quick Downloads
              </Heading>
            </Row>
            <Row gap="12" wrap>
              {project.downloadButtons.map((button, index) => (
                <a
                  key={index}
                  href={button.downloadUrl}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                    theme.resolvedTheme === "dark"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                  }`}
                >
                  {button.icon && <span>{button.icon}</span>}
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{button.label}</span>
                    {(button.version || button.platform) && (
                      <span className="text-xs opacity-90">
                        {button.version}{" "}
                        {button.platform && `• ${button.platform}`}
                      </span>
                    )}
                  </div>
                  <Download className="w-5 h-5" />
                </a>
              ))}
            </Row>
          </div>
        )}

        {/* Screenshots */}
        {project.screenshots && project.screenshots.length > 0 && (
          <div className={`rounded-2xl p-6 mb-8  shadow-lg`}>
            <Row gap="8" vertical="center" marginBottom="16">
              <Package
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-purple-400"
                    : "text-purple-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                Screenshots
              </Heading>
            </Row>
            <Carousel
              items={project.screenshots.map((screenshot) => ({
                slide: screenshot.url,
                alt: screenshot.alt || screenshot.caption || project.title,
              }))}
              aspectRatio="16/9"
              indicator="thumbnail"
            />
          </div>
        )}

        {/* Key Features */}
        {project.pinnedFeatures && project.pinnedFeatures.length > 0 && (
          <div className={`rounded-2xl p-6 mb-8  shadow-lg`}>
            <Row gap="8" vertical="center" marginBottom="16">
              <Zap
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-yellow-400"
                    : "text-yellow-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                Key Features
              </Heading>
            </Row>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.pinnedFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-4 rounded-xl ${
                    theme.resolvedTheme === "dark"
                      ? "bg-gray-700"
                      : "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
                  }`}
                >
                  <Zap
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      theme.resolvedTheme === "dark"
                        ? "text-yellow-400"
                        : "text-yellow-600"
                    }`}
                  />
                  <Text
                    variant="body-default-m"
                    className={
                      theme.resolvedTheme === "dark"
                        ? "text-gray-200"
                        : "text-gray-800"
                    }
                  >
                    {feature}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Section */}
        {project.documentDescription && (
          <div className={`rounded-2xl p-6 mb-8   shadow-lg`}>
            <Row gap="8" vertical="center" marginBottom="16">
              <FileText
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-indigo-400"
                    : "text-indigo-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                About This Project
              </Heading>
            </Row>
            <Text
              variant="body-default-m"
              className={`whitespace-pre-wrap leading-relaxed ${
                theme.resolvedTheme === "dark"
                  ? "text-gray-300"
                  : "text-gray-700"
              }`}
            >
              {project.documentDescription}
            </Text>
          </div>
        )}

        {/* Detailed Description */}
        {project.description && (
          <div className={`rounded-2xl p-6 mb-8   shadow-lg`}>
            <Row gap="8" vertical="center" marginBottom="16">
              <BookOpen
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-green-400"
                    : "text-green-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                Detailed Overview
              </Heading>
            </Row>
            <article
              ref={contentRef}
              className="tiptap-preview-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          </div>
        )}

        {/* All Features */}
        {project.featureList && project.featureList.length > 0 && (
          <div className={`rounded-2xl p-6 mb-8  shadow-lg`}>
            <Row gap="8" vertical="center" marginBottom="16">
              <Award
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-indigo-400"
                    : "text-indigo-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                Complete Feature List
              </Heading>
            </Row>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {project.featureList.map((feature, index) => (
                <Row key={index} gap="8" vertical="start">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      theme.resolvedTheme === "dark"
                        ? "bg-indigo-400"
                        : "bg-indigo-500"
                    }`}
                  />
                  <Text
                    variant="body-default-m"
                    className={
                      theme.resolvedTheme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }
                  >
                    {feature}
                  </Text>
                </Row>
              ))}
            </div>
          </div>
        )}

        {/* Diagrams */}
        {project.diagrams && project.diagrams.length > 0 && (
          <div className={`rounded-2xl p-6 mb-8  shadow-lg`}>
            <Row gap="8" vertical="center" marginBottom="16">
              <Globe
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-cyan-400"
                    : "text-cyan-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                Architecture & Diagrams
              </Heading>
            </Row>
            {project.diagrams.map((diagram, index) => (
              <div
                key={index}
                className={`mb-6 last:mb-0 rounded-xl p-6 ${
                  theme.resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <Heading as="h3" variant="heading-strong-s" marginBottom="8">
                  {diagram.name}
                </Heading>
                {diagram.description && (
                  <Text
                    variant="body-default-s"
                    className={`mb-4 ${
                      theme.resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    {diagram.description}
                  </Text>
                )}
                {diagram.type === "mermaid" ? (
                  <div
                    id={`mermaid-${diagram.name.replace(/\s+/g, "-")}`}
                    className={`w-full flex items-center justify-center p-4 min-h-[300px] rounded-lg ${
                      theme.resolvedTheme === "dark"
                        ? "bg-gray-800"
                        : "bg-white"
                    }`}
                  />
                ) : diagram.type === "image" ? (
                  <img
                    src={diagram.content}
                    alt={diagram.name}
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: diagram.content }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Releases */}
        {project.releases && project.releases.length > 0 && (
          <div className={`rounded-2xl p-6 mb-8  shadow-lg`}>
            <Row gap="8" vertical="center" marginBottom="16">
              <Package
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-blue-400"
                    : "text-blue-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                Releases ({project.releases.length})
              </Heading>
            </Row>
            <Column gap="12">
              {project.releases.map((release) => (
                <div
                  key={release.version}
                  className={`p-6 rounded-xl ${
                    theme.resolvedTheme === "dark"
                      ? "bg-gray-700"
                      : "bg-gray-50"
                  }`}
                >
                  <Row horizontal="between" vertical="center" marginBottom="12">
                    <Row gap="8" vertical="center">
                      <Heading as="h3" variant="heading-strong-s">
                        v{release.version}
                      </Heading>
                      {release.isLatest && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Latest
                        </span>
                      )}
                      {release.isPrerelease && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Pre-release
                        </span>
                      )}
                    </Row>
                    <Text
                      variant="body-default-xs"
                      className={
                        theme.resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-500"
                      }
                    >
                      {formatDate(release.releaseDate)}
                    </Text>
                  </Row>

                  {release.name && (
                    <Text
                      variant="body-default-m"
                      className={
                        theme.resolvedTheme === "dark"
                          ? "text-gray-200"
                          : "text-gray-800"
                      }
                      marginBottom="8"
                    >
                      {release.name}
                    </Text>
                  )}

                  <Text
                    variant="body-default-s"
                    className={
                      theme.resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }
                    marginBottom="12"
                  >
                    {release.changelog}
                  </Text>

                  {release.downloadCount > 0 && (
                    <Row gap="4" vertical="center" marginBottom="12">
                      <Download
                        className={`w-4 h-4 ${
                          theme.resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      />
                      <Text
                        variant="body-default-xs"
                        className={
                          theme.resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }
                      >
                        {release.downloadCount.toLocaleString()} downloads
                      </Text>
                    </Row>
                  )}

                  {release.artifacts && release.artifacts.length > 0 && (
                    <Column gap="8">
                      <Text
                        variant="label-strong-s"
                        className={
                          theme.resolvedTheme === "dark"
                            ? "text-gray-300"
                            : "text-gray-700"
                        }
                      >
                        Download Files:
                      </Text>
                      {release.artifacts.map((artifact, idx) => (
                        <Row
                          key={idx}
                          gap="12"
                          paddingY="12"
                          paddingX="12"
                          className={`rounded-lg ${
                            theme.resolvedTheme === "dark"
                              ? "bg-gray-600 hover:bg-gray-500"
                              : "border border-gray-200 hover:bg-gray-50"
                          } transition-colors`}
                          horizontal="between"
                          vertical="center"
                        >
                          <Column gap="4" flex={1}>
                            <Text
                              variant="body-default-m"
                              className={
                                theme.resolvedTheme === "dark"
                                  ? "text-gray-200"
                                  : "text-gray-800"
                              }
                            >
                              {artifact.name}
                            </Text>
                            <Row gap="8">
                              <Text
                                variant="body-default-xs"
                                className={
                                  theme.resolvedTheme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }
                              >
                                {artifact.format.toUpperCase()}
                              </Text>
                              <Text
                                variant="body-default-xs"
                                className={
                                  theme.resolvedTheme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }
                              >
                                {formatBytes(artifact.size)}
                              </Text>
                              {artifact.category && (
                                <span
                                  className={`px-2 py-0.5 text-xs rounded ${
                                    theme.resolvedTheme === "dark"
                                      ? "bg-gray-700 text-gray-300"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {artifact.category}
                                </span>
                              )}
                            </Row>
                            {artifact.description && (
                              <Text
                                variant="body-default-xs"
                                className={
                                  theme.resolvedTheme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }
                              >
                                {artifact.description}
                              </Text>
                            )}
                          </Column>
                          <a
                            href={artifact.downloadUrl}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </Row>
                      ))}
                    </Column>
                  )}
                </div>
              ))}
            </Column>
          </div>
        )}

        {/* Milestones */}
        {project.milestones && project.milestones.length > 0 && (
          <div className={`rounded-2xl p-6 mb-8   shadow-lg`}>
            <Row gap="8" vertical="center" marginBottom="16">
              <TrendingUp
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-purple-400"
                    : "text-purple-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                Project Milestones
              </Heading>
            </Row>
            <Column gap="12">
              {project.milestones.map((milestone, index) => (
                <Row
                  key={index}
                  gap="12"
                  paddingY="16"
                  paddingX="16"
                  className={`rounded-xl ${
                    milestone.completed
                      ? theme.resolvedTheme === "dark"
                        ? "bg-green-900/30 border border-green-700"
                        : "bg-green-50 border border-green-200"
                      : theme.resolvedTheme === "dark"
                      ? "bg-gray-700"
                      : "bg-gray-50"
                  }`}
                  vertical="start"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      milestone.completed
                        ? "bg-green-500 text-white"
                        : theme.resolvedTheme === "dark"
                        ? "bg-gray-600 text-gray-300"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {milestone.completed ? "✓" : index + 1}
                  </div>
                  <Column gap="4" flex={1}>
                    <Text
                      variant="heading-strong-s"
                      className={
                        theme.resolvedTheme === "dark"
                          ? "text-gray-200"
                          : "text-gray-800"
                      }
                    >
                      {milestone.title}
                    </Text>
                    <Text
                      variant="body-default-s"
                      className={
                        theme.resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }
                    >
                      {milestone.description}
                    </Text>
                    <Row gap="8" vertical="center">
                      <Clock
                        className={`w-4 h-4 ${
                          theme.resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      />
                      <Text
                        variant="body-default-xs"
                        className={
                          theme.resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }
                      >
                        Target: {formatDate(milestone.targetDate)}
                      </Text>
                      {milestone.completed && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full ml-2">
                          Completed
                        </span>
                      )}
                    </Row>
                  </Column>
                </Row>
              ))}
            </Column>
          </div>
        )}

        {/* Hardware & Performance in a grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Hardware Compatibility */}
          {project.hardwareCompatibility &&
            project.hardwareCompatibility.length > 0 && (
              <div className={`rounded-2xl p-6   shadow-lg`}>
                <Row gap="8" vertical="center" marginBottom="16">
                  <Cpu
                    className={`w-5 h-5 ${
                      theme.resolvedTheme === "dark"
                        ? "text-red-400"
                        : "text-red-600"
                    }`}
                  />
                  <Heading as="h2" variant="heading-strong-m">
                    Hardware
                  </Heading>
                </Row>
                <Column>
                  {project.hardwareCompatibility.map((hw, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        hw.compatible
                          ? theme.resolvedTheme === "dark"
                            ? "bg-green-900/30 border border-green-700"
                            : "bg-green-50 border border-green-200"
                          : theme.resolvedTheme === "dark"
                          ? "bg-red-900/30 border border-red-700"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <Row vertical="center" marginBottom="2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            hw.compatible ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <Text
                          variant="label-strong-s"
                          className={
                            theme.resolvedTheme === "dark"
                              ? "text-gray-200"
                              : "text-gray-800"
                          }
                        >
                          {hw.device}
                        </Text>
                      </Row>
                      {(hw.version || hw.notes) && (
                        <Text
                          variant="body-default-xs"
                          className={
                            theme.resolvedTheme === "dark"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }
                        >
                          {hw.version && `Version: ${hw.version}`}
                          {hw.version && hw.notes && " • "}
                          {hw.notes}
                        </Text>
                      )}
                    </div>
                  ))}
                </Column>
              </div>
            )}

          {/* Performance Benchmarks */}
          {project.performanceBenchmarks &&
            project.performanceBenchmarks.length > 0 && (
              <div className={`rounded-2xl p-6  shadow-lg`}>
                <Row gap="8" vertical="center" marginBottom="16">
                  <Zap
                    className={`w-5 h-5 ${
                      theme.resolvedTheme === "dark"
                        ? "text-orange-400"
                        : "text-orange-600"
                    }`}
                  />
                  <Heading as="h2" variant="heading-strong-m">
                    Performance
                  </Heading>
                </Row>
                <Column>
                  {project.performanceBenchmarks.map((benchmark, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        theme.resolvedTheme === "dark"
                          ? "bg-orange-900/20 border border-orange-700"
                          : "bg-orange-50 border border-orange-200"
                      }`}
                    >
                      <Text
                        variant="label-strong-s"
                        className={
                          theme.resolvedTheme === "dark"
                            ? "text-gray-200"
                            : "text-gray-800"
                        }
                        marginBottom="4"
                      >
                        {benchmark.name}
                      </Text>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-2xl font-bold ${
                            theme.resolvedTheme === "dark"
                              ? "text-orange-400"
                              : "text-orange-600"
                          }`}
                        >
                          {benchmark.value}
                        </span>
                        <span
                          className={`text-sm ${
                            theme.resolvedTheme === "dark"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {benchmark.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </Column>
              </div>
            )}
        </div>

        {/* FAQs */}
        {project.faqs && project.faqs.length > 0 && (
          <div className={`rounded-2xl p-6 mb-8  shadow-lg`}>
            <Row gap="8" vertical="center" marginBottom="16">
              <HelpCircle
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-blue-400"
                    : "text-blue-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                FAQs
              </Heading>
            </Row>
            <Column gap="12">
              {project.faqs
                .sort((a, b) => a.order - b.order)
                .map((faq, index) => (
                  <div
                    key={index}
                    className={`p-5 rounded-xl ${
                      theme.resolvedTheme === "dark"
                        ? "bg-blue-900/20 border border-blue-700"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <Heading
                      as="h3"
                      variant="heading-strong-s"
                      className={
                        theme.resolvedTheme === "dark"
                          ? "text-gray-200"
                          : "text-gray-800"
                      }
                    >
                      {faq.question}
                    </Heading>
                    <Text
                      variant="body-default-m"
                      className={
                        theme.resolvedTheme === "dark"
                          ? "text-gray-300"
                          : "text-gray-700"
                      }
                    >
                      {faq.answer}
                    </Text>
                  </div>
                ))}
            </Column>
          </div>
        )}

        {/* Glossary & References Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Glossary */}
          {project.glossary && project.glossary.length > 0 && (
            <div className={`rounded-2xl p-6 shadow-lg`}>
              <Row gap="8" vertical="center" marginBottom="16">
                <BookOpen
                  className={`w-5 h-5 ${
                    theme.resolvedTheme === "dark"
                      ? "text-indigo-400"
                      : "text-indigo-600"
                  }`}
                />
                <Heading as="h2" variant="heading-strong-m">
                  Glossary
                </Heading>
              </Row>
              <Column>
                {project.glossary.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      theme.resolvedTheme === "dark"
                        ? "bg-indigo-900/20 border border-indigo-700"
                        : "bg-indigo-50 border border-indigo-200"
                    }`}
                  >
                    <Text
                      variant="label-strong-s"
                      className={
                        theme.resolvedTheme === "dark"
                          ? "text-gray-200"
                          : "text-gray-800"
                      }
                      marginBottom="2"
                    >
                      {entry.term}
                    </Text>
                    <Text
                      variant="body-default-xs"
                      className={
                        theme.resolvedTheme === "dark"
                          ? "text-gray-300"
                          : "text-gray-700"
                      }
                    >
                      {entry.definition}
                    </Text>
                  </div>
                ))}
              </Column>
            </div>
          )}
        </div>

        {/* References */}
        {project.references && project.references.length > 0 && (
          <div className={`rounded-2xl p-6 mb-8   shadow-lg`}>
            <Row gap="8" vertical="center" marginBottom="16">
              <ExternalLink
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-teal-400"
                    : "text-teal-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                References & Links
              </Heading>
            </Row>
            <Column gap="12">
              {project.references.map((ref, index) => (
                <a
                  key={index}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors group ${
                    theme.resolvedTheme === "dark"
                      ? "bg-teal-900/20 border border-teal-700 hover:bg-teal-900/30"
                      : "bg-teal-50 border border-teal-200 hover:bg-teal-100"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      ref.type === "repository"
                        ? "bg-gray-800"
                        : ref.type === "documentation"
                        ? "bg-blue-500"
                        : ref.type === "tutorial"
                        ? "bg-green-500"
                        : ref.type === "article"
                        ? "bg-orange-500"
                        : "bg-purple-500"
                    } text-white`}
                  >
                    {ref.type === "repository" ? (
                      <Github className="w-5 h-5" />
                    ) : ref.type === "documentation" ? (
                      <BookOpen className="w-5 h-5" />
                    ) : ref.type === "tutorial" ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <ExternalLink className="w-5 h-5" />
                    )}
                  </div>
                  <Column gap="4" flex={1}>
                    <Text
                      variant="heading-strong-s"
                      className={
                        theme.resolvedTheme === "dark"
                          ? "text-gray-200"
                          : "text-gray-800"
                      }
                    >
                      {ref.title}
                    </Text>
                    {ref.description && (
                      <Text
                        variant="body-default-xs"
                        className={
                          theme.resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-600"
                        }
                      >
                        {ref.description}
                      </Text>
                    )}
                    <Text
                      variant="body-default-xs"
                      className={
                        theme.resolvedTheme === "dark"
                          ? "text-teal-400"
                          : "text-teal-600"
                      }
                      style={{ wordBreak: "break-all" }}
                    >
                      {ref.url}
                    </Text>
                  </Column>
                  <ExternalLink
                    className={`w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform ${
                      theme.resolvedTheme === "dark"
                        ? "text-teal-400"
                        : "text-teal-600"
                    }`}
                  />
                </a>
              ))}
            </Column>
          </div>
        )}

        {/* Contributors */}
        {project.contributors && project.contributors.length > 0 && (
          <div
            className={`rounded-2xl p-6 mb-8 ${
              theme.resolvedTheme === "dark" ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <Row gap="8" vertical="center" marginBottom="16">
              <Award
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-pink-400"
                    : "text-pink-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                Contributors
              </Heading>
            </Row>
            <Row gap="12" wrap>
              {project.contributors.map((contributor, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    theme.resolvedTheme === "dark"
                      ? "bg-pink-900/20 border border-pink-700"
                      : "bg-pink-50 border border-pink-200"
                  }`}
                >
                  {contributor.avatar ? (
                    <img
                      src={contributor.avatar}
                      alt={contributor.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                        theme.resolvedTheme === "dark"
                          ? "bg-pink-700 text-pink-100"
                          : "bg-pink-200 text-pink-700"
                      }`}
                    >
                      {contributor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <Column gap="4">
                    <Text
                      variant="heading-strong-s"
                      className={
                        theme.resolvedTheme === "dark"
                          ? "text-gray-200"
                          : "text-gray-800"
                      }
                    >
                      {contributor.name}
                    </Text>
                    <Row gap="8">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          contributor.role === "owner"
                            ? "bg-purple-100 text-purple-800"
                            : contributor.role === "editor"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {contributor.role.charAt(0).toUpperCase() +
                          contributor.role.slice(1)}
                      </span>
                      <Text
                        variant="body-default-xs"
                        className={
                          theme.resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-600"
                        }
                      >
                        Joined {formatDate(contributor.joinedAt)}
                      </Text>
                    </Row>
                  </Column>
                </div>
              ))}
            </Row>
          </div>
        )}

        {/* Embedded Videos */}
        {project.embeddedVideos && project.embeddedVideos.length > 0 && (
          <div
            className={`rounded-2xl p-6 mb-8 ${
              theme.resolvedTheme === "dark" ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <Row gap="8" vertical="center" marginBottom="16">
              <Package
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-red-400"
                    : "text-red-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                Video Demonstrations
              </Heading>
            </Row>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.embeddedVideos.map((video, index) => (
                <div
                  key={index}
                  className={`aspect-video rounded-xl overflow-hidden shadow-lg ${
                    theme.resolvedTheme === "dark"
                      ? "border border-gray-700"
                      : "border border-gray-200"
                  }`}
                >
                  <iframe
                    src={video}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attached Files */}
        {project.attachedFiles && project.attachedFiles.length > 0 && (
          <div
            className={`rounded-2xl p-6 mb-8 ${
              theme.resolvedTheme === "dark" ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <Row gap="8" vertical="center" marginBottom="16">
              <FileText
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                Additional Resources
              </Heading>
            </Row>
            <Column gap="12">
              {project.attachedFiles.map((file, index) => (
                <Row
                  key={index}
                  gap="12"
                  paddingY="12"
                  paddingX="16"
                  className={`rounded-lg transition-colors ${
                    theme.resolvedTheme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "border border-gray-200 hover:bg-gray-50"
                  }`}
                  horizontal="between"
                  vertical="center"
                >
                  <Column gap="4" flex={1}>
                    <Text
                      variant="heading-strong-s"
                      className={
                        theme.resolvedTheme === "dark"
                          ? "text-gray-200"
                          : "text-gray-800"
                      }
                    >
                      {file.name}
                    </Text>
                    <Row gap="8" wrap>
                      <Text
                        variant="body-default-xs"
                        className={
                          theme.resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }
                      >
                        {file.format.toUpperCase()}
                      </Text>
                      <Text
                        variant="body-default-xs"
                        className={
                          theme.resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }
                      >
                        {formatBytes(file.size)}
                      </Text>
                      <span
                        className={`px-2 py-0.5 text-xs rounded ${
                          theme.resolvedTheme === "dark"
                            ? "bg-gray-600 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {file.category}
                      </span>
                      <Text
                        variant="body-default-xs"
                        className={
                          theme.resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }
                      >
                        {formatDate(file.uploadedAt)}
                      </Text>
                    </Row>
                    {file.description && (
                      <Text
                        variant="body-default-xs"
                        className={
                          theme.resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }
                      >
                        {file.description}
                      </Text>
                    )}
                  </Column>
                  <a
                    href={file.downloadUrl}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex-shrink-0 ${
                      theme.resolvedTheme === "dark"
                        ? "bg-gray-600 text-white hover:bg-gray-500"
                        : "bg-gray-600 text-white hover:bg-gray-700"
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </Row>
              ))}
            </Column>
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div
            className={`rounded-2xl p-6 mb-8 ${
              theme.resolvedTheme === "dark" ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <Row gap="8" vertical="center" marginBottom="16">
              <Tag
                className={`w-5 h-5 ${
                  theme.resolvedTheme === "dark"
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              />
              <Heading as="h2" variant="heading-strong-m">
                Tags
              </Heading>
            </Row>
            <Row gap="8" wrap>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                    theme.resolvedTheme === "dark"
                      ? "bg-blue-900/30 text-blue-300 hover:bg-blue-900/50 border border-blue-700"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </Row>
          </div>
        )}

        {/* Project Meta Footer */}
        <div
          className={`rounded-2xl p-6 ${
            theme.resolvedTheme === "dark" ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
        >
          <Row horizontal="between" wrap gap="16" vertical="center">
            <Column gap="8">
              <Text
                variant="label-strong-s"
                className={
                  theme.resolvedTheme === "dark"
                    ? "text-gray-400"
                    : "text-gray-600"
                }
              >
                Project Information
              </Text>
              <Row gap="16" wrap>
                <Row gap="4" vertical="center">
                  <Calendar
                    className={`w-4 h-4 ${
                      theme.resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <Text
                    variant="body-default-xs"
                    className={
                      theme.resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }
                  >
                    Created: {formatDate(project.createdAt)}
                  </Text>
                </Row>
                <Row gap="4" vertical="center">
                  <Calendar
                    className={`w-4 h-4 ${
                      theme.resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <Text
                    variant="body-default-xs"
                    className={
                      theme.resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }
                  >
                    Updated: {formatDate(project.updatedAt)}
                  </Text>
                </Row>
                {project.visibility && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.visibility === "public"
                        ? "bg-green-100 text-green-800"
                        : project.visibility === "unlisted"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {project.visibility.charAt(0).toUpperCase() +
                      project.visibility.slice(1)}
                  </span>
                )}
              </Row>
            </Column>

            <Column gap="8" horizontal="end">
              <Text
                variant="label-strong-s"
                className={
                  theme.resolvedTheme === "dark"
                    ? "text-gray-400"
                    : "text-gray-600"
                }
              >
                Share this project
              </Text>
              <Row gap="8">
                <button
                  onClick={handleShare}
                  className={`p-2 rounded-lg transition-colors ${
                    theme.resolvedTheme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked
                      ? "bg-yellow-100 text-yellow-600"
                      : theme.resolvedTheme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                  title="Bookmark"
                >
                  <Bookmark
                    className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-lg transition-colors ${
                    isLiked
                      ? "bg-red-100 text-red-600"
                      : theme.resolvedTheme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                  title="Like"
                >
                  <Heart
                    className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                  />
                </button>
              </Row>
            </Column>
          </Row>
        </div>

        {/* Back to Projects Link */}
        <div className="text-center py-12">
          <SmartLink
            href="/work"
            className={`inline-flex items-center gap-2 font-medium transition-colors ${
              theme.resolvedTheme === "dark"
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-800"
            }`}
          >
            <svg
              className="w-4 h-4"
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
            View All Projects
          </SmartLink>
        </div>
      </Column>
    </>
  );
}
