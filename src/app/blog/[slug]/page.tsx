 "use client";

import { useParams } from "next/navigation";
import { usePostDetail } from "@/lib/hooks/usePosts";
import { Column, Heading, Text, Avatar, Row, SmartLink } from "@once-ui-system/core";
import { useEffect, useRef, useState, useCallback } from "react";
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  ChevronUp,
} from "lucide-react";
import hljs from "highlight.js";

// Import styles
import "@/styles/blog-preview.css";
import "@/styles/syntax-theme.css";
import "@/styles/enhanced-tables.css";
import "@/styles/enhanced-image.css";

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug as string;
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { data: post, isLoading, error } = usePostDetail(slug);

  // State management
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [renderedContent, setRenderedContent] = useState<string>("");

  // Initialize like count from post data
  useEffect(() => {
    if (post?.likes) {
      setLikeCount(post.likes);
    }
  }, [post]);

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

  // ✅ THE WORKING SOLUTION: Enhance in memory, then set to state
  useEffect(() => {
    if (!post?.content) return;

    console.log("🚀 Enhancing code blocks for:", slug);

    // Configure highlight.js
    hljs.configure({
      ignoreUnescapedHTML: true,
      languages: [
        "javascript", "typescript", "python", "java", "cpp", "c",
        "html", "css", "json", "xml", "sql", "bash", "shell",
        "go", "rust", "php", "ruby", "swift", "kotlin", "dart",
        "yaml", "dockerfile", "markdown", "graphql"
      ],
    });

    // Create temporary container (NOT in real DOM)
    const temp = document.createElement('div');
    temp.innerHTML = post.content;

    // Enhance code blocks in memory
    const preBlocks = temp.querySelectorAll("pre");
    
    preBlocks.forEach((block, index) => {
      const code = block.querySelector("code");
      if (!code) return;

      // Apply syntax highlighting
      hljs.highlightElement(code as HTMLElement);

      const codeText = code.textContent || "";
      const lines = codeText.split("\n").filter(line => line.trim() !== "");
      const shouldScroll = lines.length > 70;

      // Language detection
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

      // Language colors
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
        sql: { bg: "#cffafe", text: "#0891b2", border: "#22d3ee" },
        go: { bg: "#cffafe", text: "#0891b2", border: "#22d3ee" },
        rust: { bg: "#fed7aa", text: "#ea580c", border: "#fb923c" },
        php: { bg: "#e0e7ff", text: "#4f46e5", border: "#818cf8" },
        ruby: { bg: "#fee2e2", text: "#dc2626", border: "#f87171" },
        swift: { bg: "#fed7aa", text: "#ea580c", border: "#fb923c" },
        kotlin: { bg: "#f3e8ff", text: "#9333ea", border: "#c084fc" },
        dart: { bg: "#dbeafe", text: "#2563eb", border: "#60a5fa" },
        yaml: { bg: "#f3f4f6", text: "#4b5563", border: "#d1d5db" },
        plaintext: { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" }
      };

      const colors = languageColors[languageClass] || languageColors.plaintext;

      // Create wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "code-block-enhanced";
      wrapper.style.cssText = `
        position: relative;
        margin: 1.5rem 0;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        background: white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      `;

      // Header
      const header = document.createElement("div");
      header.className = "code-block-header";
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
      `;

      // Left side
      const leftSide = document.createElement("div");
      leftSide.style.cssText = "display: flex; align-items: center; gap: 0.75rem;";

      // Language badge
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

      // Meta info
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

      // Right side
      const rightSide = document.createElement("div");
      rightSide.style.cssText = "display: flex; align-items: center; gap: 0.5rem;";

      // Copy button
      const copyBtn = document.createElement("button");
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

      copyBtn.onmouseover = () => copyBtn.style.background = "#f3f4f6";
      copyBtn.onmouseout = () => copyBtn.style.background = "transparent";
      
      copyBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(codeText);
          copyBtn.innerHTML = `
            <svg width="16" height="16" fill="none" stroke="#10b981" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span style="color: #10b981">Copied!</span>
          `;
          copyBtn.style.background = "#d1fae5";
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <span>Copy</span>
            `;
            copyBtn.style.background = "transparent";
          }, 2000);
        } catch (err) {
          console.error("Copy failed:", err);
        }
      };

      rightSide.appendChild(copyBtn);

      // Expand button for long code
      if (shouldScroll) {
        const expandBtn = document.createElement("button");
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
        expandBtn.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg><span>Expand</span>';
        
        expandBtn.onmouseover = () => expandBtn.style.background = "#f3f4f6";
        expandBtn.onmouseout = () => expandBtn.style.background = "transparent";
        
        // Note: Expand functionality will work after render
        expandBtn.onclick = function() {
          const container = this.closest('.code-block-enhanced')?.querySelector('.code-container') as HTMLElement;
          if (container) {
            const isExpanded = container.style.maxHeight === "none";
            container.style.maxHeight = isExpanded ? "500px" : "none";
            container.style.overflowY = isExpanded ? "auto" : "visible";
            this.innerHTML = isExpanded 
              ? '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg><span>Expand</span>'
              : '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg><span>Collapse</span>';
          }
        };
        
        rightSide.appendChild(expandBtn);
      }

      header.appendChild(leftSide);
      header.appendChild(rightSide);

      // Code container
      const codeContainer = document.createElement("div");
      codeContainer.className = "code-container";
      codeContainer.style.cssText = shouldScroll 
        ? "max-height: 500px; overflow-y: auto; position: relative;"
        : "position: relative;";

      const styledBlock = block.cloneNode(true) as HTMLElement;
      styledBlock.style.cssText = "margin: 0; border-radius: 0; border: none;";
      
      codeContainer.appendChild(styledBlock);
      wrapper.appendChild(header);
      wrapper.appendChild(codeContainer);

      block.replaceWith(wrapper);
      
      console.log(`✅ Enhanced block ${index + 1}: ${languageDisplay}`);
    });

    // Save enhanced HTML to state
    setRenderedContent(temp.innerHTML);
  }, [post?.content, slug]);

  // Rest of your handlers...
  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  }, [isLiked]);

  const handleBookmark = useCallback(() => {
    setIsBookmarked(!isBookmarked);
  }, [isBookmarked]);

  const handleShare = useCallback(async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
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
  }, [post]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToComments = useCallback(() => {
    const commentSection = document.querySelector(".tiptap-preview-content");
    if (commentSection) {
      const offset = commentSection.getBoundingClientRect().top + window.scrollY + 500;
      window.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    }
  }, []);

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

  if (error || !post) {
    return (
      <Column maxWidth="m" paddingTop="24">
        <div className="text-center py-20">
          <Heading variant="heading-strong-xl" marginBottom="16">
            Post Not Found
          </Heading>
          <Text marginBottom="24">The post you&apos;re looking for doesn&apos;t exist.</Text>
          <SmartLink href="/blog" className="text-blue-600 hover:underline transition-colors">
            ← Back to Blog
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
        <div className="fixed left-4 md:left-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
          <div className="flex flex-col gap-3 p-3 rounded-2xl shadow-xl backdrop-blur-md bg-white border border-gray-200 hover:shadow-2xl transition-all duration-300">
            <button
              onClick={handleLike}
              className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                isLiked 
                  ? "text-red-500 bg-red-500/10 shadow-sm" 
                  : "text-gray-500 hover:text-red-500 hover:bg-red-500/5"
              }`}
              title="Like this post"
              aria-label={isLiked ? "Unlike post" : "Like post"}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            </button>

            <div className="w-full h-px bg-gray-200" />

            <button
              onClick={scrollToComments}
              className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 text-gray-500 hover:text-blue-500 hover:bg-blue-500/5"
              title="Go to comments"
              aria-label="Scroll to comments"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            <button
              onClick={handleBookmark}
              className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                isBookmarked 
                  ? "text-yellow-500 bg-yellow-500/10 shadow-sm" 
                  : "text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/5"
              }`}
              title={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 text-gray-500 hover:text-green-500 hover:bg-green-500/5"
              title="Share this post"
              aria-label="Share post"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
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

      <Column maxWidth="m" paddingTop="24" paddingBottom="40"  >
        {/* Back Link */}
        <SmartLink 
          href="/blog" 
          className="inline-flex items-center gap-2 mb-8 transition-all duration-200 text-gray-500 hover:text-gray-700 hover:gap-3 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Blog</span>
        </SmartLink>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-8 overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-48 md:h-64 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              loading="eager"
            />
          </div>
        )}

        {/* Post Header */}
        <header className="mb-8">
          <Heading variant="display-strong-l" marginBottom="16">
            {post.title}
          </Heading>

          {post.description && (
            <Text variant="body-default-l" className="text-gray-600" marginBottom="24">
              {post.description}
            </Text>
          )}

          {/* Post Meta */}
          <Row gap="16" wrap vertical="center" marginBottom="24">
            {post.author && (
              <Row gap="12" vertical="center">
                {post.author.profileImage && (
                  <Avatar 
                    src={post.author.profileImage}
                    size="m"
                  />
                )}
                <Text variant="label-default-s" className="text-gray-600">
                  {post.author.firstName} {post.author.lastName}
                </Text>
              </Row>
            )}

            {post.publishedAt && (
              <Text variant="body-default-xs" className="text-gray-500">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            )}

            {post.readingTime && (
              <Text variant="body-default-xs" className="text-gray-500">
                {post.readingTime} min read
              </Text>
            )}

            {post.category && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {post.category}
              </span>
            )}
          </Row>

          {/* Social Actions Bar */}
          <Row 
            gap="24" 
            paddingY="16" 
            horizontal="space-between" 
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
                aria-label={isLiked ? `Unlike (${likeCount} likes)` : `Like (${likeCount} likes)`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <Text variant="label-default-s" className="font-medium">{likeCount}</Text>
              </button>

              <button 
                onClick={scrollToComments}
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 text-gray-500 hover:text-blue-500"
              >
                <MessageCircle className="w-5 h-5" />
                <Text variant="label-default-s" className="hidden sm:inline">Comment</Text>
              </button>
            </Row>

            <Row gap="16" vertical="center">
              <button
                onClick={handleBookmark}
                className={`transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isBookmarked ? "text-yellow-500" : "text-gray-500 hover:text-yellow-500"
                }`}
                title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
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

        {/* Post Content with TipTap styling */}
      <article
        ref={contentRef}
        className="tiptap-preview-content prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <Column gap="16" marginTop="48" paddingTop="24" style={{ borderTop: '1px solid #e5e7eb' }}>
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
    </>
  );
}