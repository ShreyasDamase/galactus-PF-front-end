'use client';

import { useParams } from "next/navigation";
 import { Column, Heading, Text, Row, SmartLink, Tag, Carousel, Button, Avatar } from "@once-ui-system/core";
import { useEffect, useRef, useState, useCallback } from "react";
import { 
  Heart, 
  Bookmark, 
  Share2, 
  Download,
  Eye,
  Calendar,
  ChevronUp,
  ChevronDown,
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
} from "lucide-react";
import hljs from "highlight.js";
import { useTheme } from '@once-ui-system/core';
import { motion, AnimatePresence } from 'framer-motion';

// Import styles
import "@/styles/blog-preview.css";
import "@/styles/syntax-theme.css";
import "@/styles/enhanced-tables.css";
import "@/styles/enhanced-image.css";
import { useProject } from "@/lib/hooks/useProject";

// Mermaid types
declare global {
  interface Window {
    mermaid?: any;
    mermaidLoaded?: boolean;
  }
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const { data: response, isLoading, error } = useProject(slug);
  const project = response ;
  console.log("Project data **",project,response)
  
  const contentRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // State management
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [renderedContent, setRenderedContent] = useState<string>("");
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [mermaidReady, setMermaidReady] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState({
    faqs: true,
    references: true,
    glossary: true,
    hardware: true,
    benchmarks: true,
    milestones: true,
    features: true,
  });

  // Initialize like count
  useEffect(() => {
    if (project?.likes !== undefined) {
      setLikeCount(project.likes);
    }
  }, [project]);

  // Load Mermaid library
  useEffect(() => {
    const loadMermaid = () => {
      if (window.mermaid && window.mermaidLoaded) {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          fontFamily: "inherit",
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
          },
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
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
          },
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

      return () => {
        window.removeEventListener("mermaidLoaded", handleMermaidLoaded);
      };
    };

    loadMermaid();
  }, []);

  // Reading progress and floating actions
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

  // Enhance code blocks in description
  useEffect(() => {
    if (!project?.description) return;

    console.log("🚀 Enhancing code blocks");

    hljs.configure({
      ignoreUnescapedHTML: true,
      languages: [
        "javascript", "typescript", "python", "java", "cpp", "c",
        "html", "css", "json", "xml", "sql", "bash", "shell",
        "go", "rust", "php", "ruby", "swift", "kotlin", "dart",
        "yaml", "dockerfile", "markdown", "graphql"
      ],
    });

    const temp = document.createElement('div');
    temp.innerHTML = project.description;

    const preBlocks = temp.querySelectorAll("pre");
    
    preBlocks.forEach((block, index) => {
      const code = block.querySelector("code");
      if (!code) return;

      hljs.highlightElement(code as HTMLElement);

      const codeText = code.textContent || "";
      const lines = codeText.split("\n").filter(line => line.trim() !== "");
      const shouldScroll = lines.length > 70;

      const detectLanguage = (codeElement: Element): string => {
        const classNames = codeElement.className;
        const patterns = [
          /language-(\w+)/i,
          /lang-(\w+)/i,
          /hljs\s+(\w+)/i,
        ];
        
        for (const pattern of patterns) {
          const match = classNames.match(pattern);
          if (match) return match[1].toLowerCase();
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
        cpp: { bg: "#f3e8ff", text: "#9333ea", border: "#c084fc" },
        c: { bg: "#f3e8ff", text: "#9333ea", border: "#c084fc" },
        html: { bg: "#fed7aa", text: "#ea580c", border: "#fb923c" },
        css: { bg: "#fce7f3", text: "#db2777", border: "#f472b6" },
        json: { bg: "#d1fae5", text: "#059669", border: "#34d399" },
        bash: { bg: "#f3f4f6", text: "#4b5563", border: "#d1d5db" },
        shell: { bg: "#f3f4f6", text: "#4b5563", border: "#d1d5db" },
        plaintext: { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" }
      };

      const colors = languageColors[languageClass] || languageColors.plaintext;

      const wrapper = document.createElement("div");
      wrapper.className = `code-block-enhanced ${theme.resolvedTheme}`;
      wrapper.style.cssText = `
        background: ${theme.resolvedTheme === 'dark' ? '#1f2937' : 'white'};
      `;

      const header = document.createElement("div");
      header.className = "code-block-header";
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.7rem 1rem;
        background: ${theme.resolvedTheme === 'dark' ? '#232323ff' : '#f3f4f6'};
        border-bottom: 1px solid ${theme.resolvedTheme === 'dark' ? '#374151' : '#e5e7eb'};
        ${theme.resolvedTheme === 'light' ? `
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        ` : ''}
        overflow: hidden;
      `;

      const leftSide = document.createElement("div");
      leftSide.style.cssText = "display: flex; align-items: center; gap: 0.75rem;";

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
      rightSide.style.cssText = "display: flex; align-items: center; gap: 0.5rem;";

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
        const buttonText = isExpanded ? 'Collapse' : 'Expand';
        expandBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg><span>${buttonText}</span>`;
        
        rightSide.appendChild(expandBtn);
      }

      header.appendChild(leftSide);
      header.appendChild(rightSide);

      const codeContainer = document.createElement("div");
      codeContainer.className = "code-container";
      
      const isExpanded = expandedBlocks.has(index);
      
      codeContainer.style.cssText = shouldScroll 
        ? (isExpanded 
            ? "max-height: none; overflow-y: visible; position: relative;"
            : "max-height: 500px; overflow-y: auto; position: relative;")
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

  // Attach event listeners for code blocks
  useEffect(() => {
    const container = contentRef.current;
    
    if (!container || !renderedContent) return;

    const handleContainerClick = async (e: Event) => {
      const target = e.target as HTMLElement;
      
      const copyBtn = target.closest('.copy-code-btn') as HTMLButtonElement;
      if (copyBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        const codeBlock = copyBtn.closest('.code-block-enhanced');
        const codeElement = codeBlock?.querySelector('code');
        const codeText = codeElement?.textContent || "";
        
        if (!codeText) return;
        
        try {
          await navigator.clipboard.writeText(codeText);
          
          const originalBg = copyBtn.style.background;
          
          copyBtn.style.background = "#d1fae5";
          copyBtn.style.color = "#10b981";
          const span = copyBtn.querySelector('span');
          if (span) span.textContent = 'Copied!';
          
          setTimeout(() => {
            copyBtn.style.background = originalBg;
            copyBtn.style.color = "";
            if (span) span.textContent = 'Copy';
          }, 2000);
        } catch (err) {
          console.error("Copy failed:", err);
        }
        return;
      }
      
      const expandBtn = target.closest('.expand-code-btn') as HTMLButtonElement;
      if (expandBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        const blockIndexStr = expandBtn.getAttribute('data-index');
        if (!blockIndexStr) return;
        
        const blockIndex = parseInt(blockIndexStr, 10);
        
        setExpandedBlocks(prev => {
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
      const btn = target.closest('.copy-code-btn, .expand-code-btn') as HTMLButtonElement;
      if (btn && !btn.textContent?.includes('Copied!')) {
        btn.style.background = "#f3f4f6";
      }
    };
    
    const handleContainerMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('.copy-code-btn, .expand-code-btn') as HTMLButtonElement;
      if (btn && !btn.textContent?.includes('Copied!')) {
        btn.style.background = "transparent";
      }
    };

    container.addEventListener("click", handleContainerClick as EventListener);
    container.addEventListener("mouseover", handleContainerMouseOver as EventListener);
    container.addEventListener("mouseout", handleContainerMouseOut as EventListener);

    return () => {
      container.removeEventListener("click", handleContainerClick as EventListener);
      container.removeEventListener("mouseover", handleContainerMouseOver as EventListener);
      container.removeEventListener("mouseout", handleContainerMouseOut as EventListener);
    };
  }, [renderedContent]);

  // Render Mermaid diagrams
  useEffect(() => {
    if (!mermaidReady || !project?.diagrams || project.diagrams.length === 0) return;

    const renderDiagrams = async () => {
      for (const diagram of project.diagrams) {
        if (diagram.type !== 'mermaid') continue;

        const diagramElement = document.getElementById(`mermaid-${diagram.name.replace(/\s+/g, '-')}`);
        if (!diagramElement) continue;

        try {
          const diagramId = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          diagramElement.innerHTML = "";

          const result = await window.mermaid.render(diagramId, diagram.content);
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
              <div class="text-red-500">Failed to render diagram</div>
            </div>
          `;
        }
      }
    };

    renderDiagrams();
  }, [mermaidReady, project?.diagrams]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.resolvedTheme === 'dark');
  }, [theme.resolvedTheme]);

  // Handlers
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
        if ((err as Error).name !== 'AbortError') {
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

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
            <div className="h-4 bg-gray-200 rounded w-4/6" />
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
          <Text marginBottom="24">The project you're looking for doesn't exist.</Text>
          <SmartLink href="/work" className="text-blue-600 hover:underline transition-colors">
            ← Back to Projects
          </SmartLink>
        </div>
      </Column>
    );
  }

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
                background: theme.resolvedTheme === 'dark' 
                  ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.4), rgba(20, 20, 20, 0.3))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                backdropFilter: 'blur(40px) saturate(200%)',
                WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                border: theme.resolvedTheme === 'dark'
                  ? '1.5px solid rgba(255, 255, 255, 0.1)'
                  : '1.5px solid rgba(255, 255, 255, 0.18)',
                boxShadow: theme.resolvedTheme === 'dark'
                  ? '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
                  : '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
              }}
            >
              <motion.button
                onClick={handleLike}
                className={`p-2.5 rounded-[14px] relative overflow-hidden ${
                  isLiked 
                    ? "text-red-500" 
                    : theme.resolvedTheme === 'dark' ? "text-red-600" : "text-red-600"
                }`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className={`w-5 h-5 relative z-10 ${isLiked ? "fill-current" : ""}`} />
              </motion.button>

              <div className="w-full h-px bg-gray-200" />

              <motion.button
                onClick={handleBookmark}
                className={`p-2.5 rounded-[14px] ${isBookmarked ? "text-yellow-500" : "text-gray-600"}`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
              </motion.button>

              <motion.button
                onClick={handleShare}
                className="p-2.5 rounded-[14px] text-gray-600"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
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
        >
          <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

      <Column maxWidth="m" paddingTop="24" paddingBottom="40">
        {/* Back Link */}
        <SmartLink 
          href="/work" 
          className="inline-flex items-center gap-2 mb-8 transition-all duration-200 text-gray-500 hover:text-gray-700 hover:gap-3 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Projects</span>
        </SmartLink>

        {/* Cover Image */}
        {project.coverImage && (
          <div className="mb-8 overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            <img
              src={project.coverImage}
              alt={project.title}
              className="w-full h-48 md:h-64 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              loading="eager"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <Heading variant="display-strong-l" marginBottom="16">
            {project.title}
          </Heading>

          {project.summary && (
            <Text variant="body-default-l" className="text-gray-600" marginBottom="24">
              {project.summary}
            </Text>
          )}

          {/* Meta Info */}
          <Row gap="16" wrap vertical="center" marginBottom="24">
            {project.publishedAt && (
              <Row gap="4" vertical="center">
                <Calendar className="w-4 h-4 text-gray-500" />
                <Text variant="body-default-xs" className="text-gray-500">
                  {formatDate(project.publishedAt)}
                </Text>
              </Row>
            )}

            <Row gap="4" vertical="center">
              <Eye className="w-4 h-4 text-gray-500" />
              <Text variant="body-default-xs" className="text-gray-500">
                {project.views.toLocaleString()} views
              </Text>
            </Row>

            <Row gap="4" vertical="center">
              <Heart className="w-4 h-4 text-gray-500" />
              <Text variant="body-default-xs" className="text-gray-500">
                {likeCount.toLocaleString()} likes
              </Text>
            </Row>

            {project.downloads > 0 && (
              <Row gap="4" vertical="center">
                <Download className="w-4 h-4 text-gray-500" />
                <Text variant="body-default-xs" className="text-gray-500">
                  {project.downloads.toLocaleString()} downloads
                </Text>
              </Row>
            )}

            {project.category && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {project.category}
              </span>
            )}

            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              project.status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' :
              project.status === 'work-in-progress' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              project.status === 'archived' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
              'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </Row>

          {/* Tech Stack */}
          {project.technologyStack && project.technologyStack.length > 0 && (
            <Row gap="8" wrap marginBottom="24">
              {project.technologyStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-full text-sm transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 border border-gray-200"
                >
                  {tech}
                </span>
              ))}
            </Row>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <Row gap="8" wrap marginBottom="24">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-sm transition-all duration-200 cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 hover:scale-105 border border-blue-200"
                >
                  #{tag}
                </span>
              ))}
            </Row>
          )}

          {/* Social Actions Bar */}
          <Row 
            gap="24" 
            paddingY="16" 
            horizontal="stretch" 
            vertical="center"
            style={{ 
              borderTop: '1px solid #e5e7eb', 
              borderBottom: '1px solid #e5e7eb' 
            }}
          >
            <Row gap="24" vertical="center">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                  isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <Text variant="label-default-s" className="font-medium">{likeCount}</Text>
              </button>
            </Row>

            <Row gap="16" vertical="center">
              <button
                onClick={handleBookmark}
                className={`transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isBookmarked ? "text-yellow-500" : "text-gray-500 hover:text-yellow-500"
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
              </button>

              <button
                onClick={handleShare}
                className="transition-all duration-200 hover:scale-110 active:scale-95 text-gray-500 hover:text-green-500"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </Row>
          </Row>
        </header>

        {/* Screenshots Carousel */}
        {project.screenshots && project.screenshots.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row gap="8" vertical="center">
              <Package className="w-5 h-5 text-blue-600" />
              <Heading as="h2" variant="heading-strong-l">
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
          </Column>
        )}

        {/* Document Description */}
        {project.documentDescription && (
          <Column gap="m" marginBottom="xl">
            <Row gap="8" vertical="center">
              <FileText className="w-5 h-5 text-purple-600" />
              <Heading as="h2" variant="heading-strong-l">
                About This Project
              </Heading>
            </Row>
            <div className="prose prose-lg max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
              {project.documentDescription}
            </div>
          </Column>
        )}

        {/* Main Description (TipTap Content) */}
        {project.description && (
          <Column gap="m" marginBottom="xl">
            <Row gap="8" vertical="center">
              <BookOpen className="w-5 h-5 text-green-600" />
              <Heading as="h2" variant="heading-strong-l">
                Project Details
              </Heading>
            </Row>
            <article
              ref={contentRef}
              className="tiptap-preview-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          </Column>
        )}

        {/* Pinned Features */}
        {project.pinnedFeatures && project.pinnedFeatures.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row gap="8" vertical="center">
              <Award className="w-5 h-5 text-yellow-600" />
              <Heading as="h2" variant="heading-strong-l">
                Key Features
              </Heading>
            </Row>
            <Row gap="12" wrap>
              {project.pinnedFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                >
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <Text variant="body-default-s">{feature}</Text>
                </div>
              ))}
            </Row>
          </Column>
        )}

        {/* Feature List */}
        {project.featureList && project.featureList.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row 
              horizontal="between" 
              vertical="center" 
              className="cursor-pointer"
              onClick={() => toggleSection('features')}
            >
              <Row gap="8" vertical="center">
                <Zap className="w-5 h-5 text-indigo-600" />
                <Heading as="h2" variant="heading-strong-l">
                  All Features
                </Heading>
              </Row>
              {expandedSections.features ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Row>
            {expandedSections.features && (
              <Column gap="8" paddingTop="8">
                {project.featureList.map((feature, index) => (
                  <Row key={index} gap="8" vertical="start">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                    <Text variant="body-default-m">{feature}</Text>
                  </Row>
                ))}
              </Column>
            )}
          </Column>
        )}

        {/* Mermaid Diagrams */}
        {project.diagrams && project.diagrams.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row gap="8" vertical="center">
              <Globe className="w-5 h-5 text-cyan-600" />
              <Heading as="h2" variant="heading-strong-l">
                Architecture & Diagrams
              </Heading>
            </Row>
            {project.diagrams.map((diagram, index) => (
              <Column key={index} gap="s" className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <Heading as="h3" variant="heading-strong-m">
                  {diagram.name}
                </Heading>
                {diagram.description && (
                  <Text variant="body-default-s" onBackground="neutral-weak" marginBottom="m">
                    {diagram.description}
                  </Text>
                )}
                {diagram.type === 'mermaid' ? (
                  <div 
                    id={`mermaid-${diagram.name.replace(/\s+/g, '-')}`}
                    className="w-full flex items-center justify-center p-4 min-h-[300px] bg-gray-50 rounded-lg"
                  />
                ) : diagram.type === 'image' ? (
                  <img src={diagram.content} alt={diagram.name} className="w-full rounded-lg" />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: diagram.content }} />
                )}
              </Column>
            ))}
          </Column>
        )}

        {/* Releases */}
        {project.releases && project.releases.length > 0 && (
          <Column gap="m" marginBottom="xl" id="releases">
            <Row gap="8" vertical="center">
              <Package className="w-5 h-5 text-blue-600" />
              <Heading as="h2" variant="heading-strong-l">
                Releases ({project.releases.length})
              </Heading>
            </Row>
            {project.releases.map((release) => (
              <Column 
                key={release.version} 
                gap="s" 
                padding="m" 
                className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <Row horizontal="between" vertical="center" marginBottom="s">
                  <Row gap="8" vertical="center">
                    <Heading as="h3" variant="heading-strong-m">
                      v{release.version}
                    </Heading>
                    {release.isLatest && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full border border-green-200">
                        Latest
                      </span>
                    )}
                    {release.isPrerelease && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
                        Pre-release
                      </span>
                    )}
                  </Row>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {formatDate(release.releaseDate)}
                  </Text>
                </Row>

                {release.name && (
                  <Text variant="body-default-m" marginBottom="s">
                    {release.name}
                  </Text>
                )}

                <Text variant="body-default-s" onBackground="neutral-weak" marginBottom="m">
                  {release.changelog}
                </Text>

                {release.downloadCount > 0 && (
                  <Row gap="4" vertical="center" marginBottom="m">
                    <Download className="w-4 h-4 text-gray-500" />
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {release.downloadCount.toLocaleString()} downloads
                    </Text>
                  </Row>
                )}
                
                {release.artifacts && release.artifacts.length > 0 && (
                  <Column gap="s">
                    <Text variant="label-strong-s">Download Files:</Text>
                    {release.artifacts.map((artifact, idx) => (
                      <Row 
                        key={idx}
                        gap="12"
                        paddingY="8"
                        paddingX="12"
                        className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        horizontal="between"
                        vertical="center"
                      >
                        <Column gap="4" flex={1}>
                          <Text variant="body-default-m">{artifact.name}</Text>
                          <Row gap="8">
                            <Text variant="body-default-xs" onBackground="neutral-weak">
                              {artifact.format.toUpperCase()}
                            </Text>
                            <Text variant="body-default-xs" onBackground="neutral-weak">
                              {formatBytes(artifact.size)}
                            </Text>
                            {artifact.category && (
                              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200">
                                {artifact.category}
                              </span>
                            )}
                          </Row>
                          {artifact.description && (
                            <Text variant="body-default-xs" onBackground="neutral-weak">
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
              </Column>
            ))}
          </Column>
        )}

        {/* Download Buttons */}
        {project.downloadButtons && project.downloadButtons.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row gap="8" vertical="center">
              <Download className="w-5 h-5 text-green-600" />
              <Heading as="h2" variant="heading-strong-l">
                Quick Downloads
              </Heading>
            </Row>
            <Row gap="m" wrap>
              {project.downloadButtons.map((button, index) => (
                <a
                  key={index}
                  href={button.downloadUrl}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {button.icon && <span>{button.icon}</span>}
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{button.label}</span>
                    {(button.version || button.platform) && (
                      <span className="text-xs opacity-90">
                        {button.version} {button.platform && `• ${button.platform}`}
                      </span>
                    )}
                  </div>
                  <Download className="w-5 h-5" />
                </a>
              ))}
            </Row>
          </Column>
        )}

        {/* Milestones */}
        {project.milestones && project.milestones.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row 
              horizontal="between" 
              vertical="center" 
              className="cursor-pointer"
              onClick={() => toggleSection('milestones')}
            >
              <Row gap="8" vertical="center">
                <Award className="w-5 h-5 text-purple-600" />
                <Heading as="h2" variant="heading-strong-l">
                  Milestones
                </Heading>
              </Row>
              {expandedSections.milestones ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Row>
            {expandedSections.milestones && (
              <Column gap="s" paddingTop="8">
                {project.milestones.map((milestone, index) => (
                  <Row 
                    key={index}
                    gap="12"
                    paddingY="12"
                    paddingX="16"
                    className={`border rounded-lg ${
                      milestone.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    vertical="start"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                      milestone.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {milestone.completed ? '✓' : index + 1}
                    </div>
                    <Column gap="4" flex={1}>
                      <Text variant="heading-strong-s">{milestone.title}</Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {milestone.description}
                      </Text>
                      <Row gap="8" vertical="center">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          Target: {formatDate(milestone.targetDate)}
                        </Text>
                        {milestone.completed && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Completed
                          </span>
                        )}
                      </Row>
                    </Column>
                  </Row>
                ))}
              </Column>
            )}
          </Column>
        )}

        {/* Hardware Compatibility */}
        {project.hardwareCompatibility && project.hardwareCompatibility.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row 
              horizontal="between" 
              vertical="center" 
              className="cursor-pointer"
              onClick={() => toggleSection('hardware')}
            >
              <Row gap="8" vertical="center">
                <Cpu className="w-5 h-5 text-red-600" />
                <Heading as="h2" variant="heading-strong-l">
                  Hardware Compatibility
                </Heading>
              </Row>
              {expandedSections.hardware ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Row>
            {expandedSections.hardware && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {project.hardwareCompatibility.map((hw, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      hw.compatible 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <Row gap="8" vertical="center" marginBottom="4">
                      <div className={`w-3 h-3 rounded-full ${
                        hw.compatible ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <Text variant="heading-strong-s">{hw.device}</Text>
                    </Row>
                    {hw.version && (
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        Version: {hw.version}
                      </Text>
                    )}
                    {hw.notes && (
                      <Text variant="body-default-xs" onBackground="neutral-weak" marginTop="4">
                        {hw.notes}
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Column>
        )}

        {/* Performance Benchmarks */}
        {project.performanceBenchmarks && project.performanceBenchmarks.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row 
              horizontal="between" 
              vertical="center" 
              className="cursor-pointer"
              onClick={() => toggleSection('benchmarks')}
            >
              <Row gap="8" vertical="center">
                <Zap className="w-5 h-5 text-orange-600" />
                <Heading as="h2" variant="heading-strong-l">
                  Performance Benchmarks
                </Heading>
              </Row>
              {expandedSections.benchmarks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Row>
            {expandedSections.benchmarks && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {project.performanceBenchmarks.map((benchmark, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200"
                  >
                    <Text variant="label-strong-s" marginBottom="8">{benchmark.name}</Text>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-orange-600">{benchmark.value}</span>
                      <span className="text-sm text-gray-600">{benchmark.unit}</span>
                    </div>
                    {benchmark.conditions && (
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        Conditions: {benchmark.conditions}
                      </Text>
                    )}
                    <Text variant="body-default-xs" onBackground="neutral-weak" marginTop="4">
                      Version: {benchmark.version}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </Column>
        )}

        {/* FAQs */}
        {project.faqs && project.faqs.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row 
              horizontal="between" 
              vertical="center" 
              className="cursor-pointer"
              onClick={() => toggleSection('faqs')}
            >
              <Row gap="8" vertical="center">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <Heading as="h2" variant="heading-strong-l">
                  Frequently Asked Questions
                </Heading>
              </Row>
              {expandedSections.faqs ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Row>
            {expandedSections.faqs && (
              <Column gap="m" paddingTop="8">
                {project.faqs
                  .sort((a, b) => a.order - b.order)
                  .map((faq, index) => (
                    <div key={index} className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <Heading as="h3" variant="heading-strong-s" marginBottom="8">
                        {faq.question}
                      </Heading>
                      <Text variant="body-default-m" onBackground="neutral-weak">
                        {faq.answer}
                      </Text>
                    </div>
                  ))}
              </Column>
            )}
          </Column>
        )}

        {/* Glossary */}
        {project.glossary && project.glossary.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row 
              horizontal="between" 
              vertical="center" 
              className="cursor-pointer"
              onClick={() => toggleSection('glossary')}
            >
              <Row gap="8" vertical="center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <Heading as="h2" variant="heading-strong-l">
                  Glossary
                </Heading>
              </Row>
              {expandedSections.glossary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Row>
            {expandedSections.glossary && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {project.glossary.map((entry, index) => (
                  <div key={index} className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <Text variant="label-strong-m" marginBottom="4">{entry.term}</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {entry.definition}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </Column>
        )}

        {/* References */}
        {project.references && project.references.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row 
              horizontal="between" 
              vertical="center" 
              className="cursor-pointer"
              onClick={() => toggleSection('references')}
            >
              <Row gap="8" vertical="center">
                <ExternalLink className="w-5 h-5 text-teal-600" />
                <Heading as="h2" variant="heading-strong-l">
                  References & Links
                </Heading>
              </Row>
              {expandedSections.references ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Row>
            {expandedSections.references && (
              <Column gap="s" paddingTop="8">
                {project.references.map((ref, index) => (
                  <a
                    key={index}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-teal-50 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      ref.type === 'repository' ? 'bg-gray-800' :
                      ref.type === 'documentation' ? 'bg-blue-500' :
                      ref.type === 'tutorial' ? 'bg-green-500' :
                      ref.type === 'article' ? 'bg-orange-500' :
                      'bg-purple-500'
                    } text-white`}>
                      {ref.type === 'repository' ? <Github className="w-5 h-5" /> :
                       ref.type === 'documentation' ? <BookOpen className="w-5 h-5" /> :
                       ref.type === 'tutorial' ? <FileText className="w-5 h-5" /> :
                       <ExternalLink className="w-5 h-5" />}
                    </div>
                    <Column gap="4" flex={1}>
                      <Text variant="heading-strong-s">{ref.title}</Text>
                      {ref.description && (
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          {ref.description}
                        </Text>
                      )}
                      <Text variant="body-default-xs" className="text-teal-600">
                        {ref.url}
                      </Text>
                    </Column>
                    <ExternalLink className="w-5 h-5 text-teal-600 group-hover:translate-x-1 transition-transform" />
                  </a>
                ))}
              </Column>
            )}
          </Column>
        )}

        {/* Contributors */}
        {project.contributors && project.contributors.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row gap="8" vertical="center">
              <Award className="w-5 h-5 text-pink-600" />
              <Heading as="h2" variant="heading-strong-l">
                Contributors
              </Heading>
            </Row>
            <Row gap="m" wrap>
              {project.contributors.map((contributor, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl border border-pink-200"
                >
                  {contributor.avatar ? (
                    <img
                      src={contributor.avatar}
                      alt={contributor.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-semibold">
                      {contributor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <Column gap="4">
                    <Text variant="heading-strong-s">{contributor.name}</Text>
                    <Row gap="8">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        contributor.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                        contributor.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contributor.role.charAt(0).toUpperCase() + contributor.role.slice(1)}
                      </span>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        Joined {formatDate(contributor.joinedAt)}
                      </Text>
                    </Row>
                  </Column>
                </div>
              ))}
            </Row>
          </Column>
        )}

        {/* Embedded Videos */}
        {project.embeddedVideos && project.embeddedVideos.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row gap="8" vertical="center">
              <Package className="w-5 h-5 text-red-600" />
              <Heading as="h2" variant="heading-strong-l">
                Videos
              </Heading>
            </Row>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.embeddedVideos.map((video, index) => (
                <div
                  key={index}
                  className="aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-sm"
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
          </Column>
        )}

        {/* Attached Files */}
        {project.attachedFiles && project.attachedFiles.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row gap="8" vertical="center">
              <FileText className="w-5 h-5 text-gray-600" />
              <Heading as="h2" variant="heading-strong-l">
                Additional Files
              </Heading>
            </Row>
            <Column gap="s">
              {project.attachedFiles.map((file, index) => (
                <Row
                  key={index}
                  gap="12"
                  paddingY="12"
                  paddingX="16"
                  className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  horizontal="between"
                  vertical="center"
                >
                  <Column gap="4" flex={1}>
                    <Text variant="heading-strong-s">{file.name}</Text>
                    <Row gap="8">
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {file.format.toUpperCase()}
                      </Text>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {formatBytes(file.size)}
                      </Text>
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200">
                        {file.category}
                      </span>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {formatDate(file.uploadedAt)}
                      </Text>
                    </Row>
                    {file.description && (
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {file.description}
                      </Text>
                    )}
                  </Column>
                  <a
                    href={file.downloadUrl}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </Row>
              ))}
            </Column>
          </Column>
        )}

        {/* Table of Contents */}
        {project.tableOfContents && project.tableOfContents.length > 0 && (
          <Column gap="m" marginBottom="xl">
            <Row gap="8" vertical="center">
              <BookOpen className="w-5 h-5 text-slate-600" />
              <Heading as="h2" variant="heading-strong-l">
                Table of Contents
              </Heading>
            </Row>
            <Column gap="4" paddingLeft="16">
              {project.tableOfContents.map((item, index) => (
                <a
                  key={index}
                  href={`#${item.anchor}`}
                  className="flex items-start gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
                >
                  <span className="text-gray-400">•</span>
                  <Text variant="body-default-s">{item.title}</Text>
                </a>
              ))}
            </Column>
          </Column>
        )}

        {/* Project Theme Preview */}
        {project.theme && (
          <Column gap="m" marginBottom="xl">
            <Row gap="8" vertical="center">
              <Zap className="w-5 h-5 text-violet-600" />
              <Heading as="h2" variant="heading-strong-l">
                Theme Configuration
              </Heading>
            </Row>
            <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
              <Row gap="16" wrap>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg shadow-md"
                    style={{ backgroundColor: project.theme.primaryColor }}
                  />
                  <Column gap="2">
                    <Text variant="label-strong-xs">Primary Color</Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {project.theme.primaryColor}
                    </Text>
                  </Column>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg shadow-md"
                    style={{ backgroundColor: project.theme.accentColor }}
                  />
                  <Column gap="2">
                    <Text variant="label-strong-xs">Accent Color</Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {project.theme.accentColor}
                    </Text>
                  </Column>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg shadow-md ${
                    project.theme.darkMode ? 'bg-gray-900' : 'bg-white border border-gray-200'
                  }`} />
                  <Column gap="2">
                    <Text variant="label-strong-xs">Mode</Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {project.theme.darkMode ? 'Dark' : 'Light'}
                    </Text>
                  </Column>
                </div>
              </Row>
            </div>
          </Column>
        )}

        {/* Project Meta Footer */}
        <Column 
          gap="m" 
          paddingY="24" 
          style={{ borderTop: '2px solid #e5e7eb', marginTop: '48px' }}
        >
          <Row horizontal="between" wrap gap="16" vertical="center">
            <Column gap="8">
              <Text variant="label-strong-s" onBackground="neutral-weak">
                Project Information
              </Text>
              <Row gap="16" wrap>
                <Row gap="4" vertical="center">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    Created: {formatDate(project.createdAt)}
                  </Text>
                </Row>
                <Row gap="4" vertical="center">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    Updated: {formatDate(project.updatedAt)}
                  </Text>
                </Row>
                {project.visibility && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.visibility === 'public' ? 'bg-green-100 text-green-800' :
                    project.visibility === 'unlisted' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.visibility.charAt(0).toUpperCase() + project.visibility.slice(1)}
                  </span>
                )}
              </Row>
            </Column>

            <Column gap="8" horizontal="end">
              <Text variant="label-strong-s" onBackground="neutral-weak">
                Share this project
              </Text>
              <Row gap="8">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  title="Bookmark"
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-lg transition-colors ${
                    isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  title="Like"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                </button>
              </Row>
            </Column>
          </Row>
        </Column>

        {/* Back to Projects Link */}
        <div className="text-center py-12">
          <SmartLink 
            href="/work" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            View All Projects
          </SmartLink>
        </div>
      </Column>
    </>
  );
}