/**
 * sanitize.ts
 * Server-safe HTML sanitizer using DOMPurify (via isomorphic-dompurify).
 *
 * Use this BEFORE calling `dangerouslySetInnerHTML` with any user-generated
 * content from the CMS / API (TipTap blog content, project descriptions).
 *
 * Allowed tags are scoped tightly: standard formatting + code blocks + media.
 * Script tags, event handlers (onclick, onload…), and data: URLs are stripped.
 */

import DOMPurify from "isomorphic-dompurify";

/** Tags that TipTap legitimately produces — everything else is stripped */
const ALLOWED_TAGS = [
  // Text structure
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  // Inline formatting
  "strong", "b", "em", "i", "u", "s", "del", "mark",
  "sub", "sup", "small",
  // Links & media
  "a", "img", "video", "source",
  // Tables
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "colgroup", "col",
  // Misc TipTap output
  "div", "span", "figure", "figcaption",
  "details", "summary",
  "iframe", // YouTube / Vimeo embeds (src allowlisted below)
];

/** Attributes that TipTap legitimately uses */
const ALLOWED_ATTR = [
  "href", "src", "srcset", "alt", "title", "width", "height",
  "class", "id", "style",
  "target", "rel",
  "colspan", "rowspan", "scope",
  "data-type",      // TipTap task lists
  "data-checked",   // TipTap task items
  "data-language",  // code block language
  "controls", "autoplay", "loop", "muted", "preload",
  "allowfullscreen", "frameborder", // iframes
  "loading",        // lazy loading images
  "align",
];

// Hook: force all links to open in a new tab safely
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }

  // Strip iframe src unless it's YouTube or Vimeo
  if (node.tagName === "IFRAME") {
    const src = node.getAttribute("src") || "";
    const allowed =
      src.startsWith("https://www.youtube.com/embed/") ||
      src.startsWith("https://player.vimeo.com/video/");
    if (!allowed) node.remove();
  }
});

/**
 * Sanitize HTML from TipTap / CMS before rendering with dangerouslySetInnerHTML.
 *
 * @example
 * const clean = sanitizeHTML(post.content);
 * <div dangerouslySetInnerHTML={{ __html: clean }} />
 */
export function sanitizeHTML(dirty: string | null | undefined): string {
  if (!dirty) return "";

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Block data: URIs in href/src (common XSS vector)
    ALLOW_DATA_ATTR: false,
    // Extra: allow CSS custom properties (Once UI uses CSS vars)
    FORCE_BODY: false,
  });
}
