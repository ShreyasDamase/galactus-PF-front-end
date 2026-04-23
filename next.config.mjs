import mdx from "@next/mdx";
import { withSentryConfig } from "@sentry/nextjs";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

// ─── Security Headers ──────────────────────────────────────────────────────
// Tailored to YOUR actual external domains (fonts, mermaid CDN, analytics)
const securityHeaders = [
  // 1. Content Security Policy — prevents XSS
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",

      // Scripts: self + Google Analytics + Mermaid (loaded via CDN in ProjectDetailClient)
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net",

      // Styles: self + inline (Once UI uses CSS-in-JS) + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

      // Fonts
      "font-src 'self' https://fonts.gstatic.com",

      // Images: self + data URIs + all https (your portfolio shows remote images)
      "img-src 'self' data: blob: https:",

      // API calls: self + your backend + Sentry
      `connect-src 'self' https://*.sentry.io ${process.env.NEXT_PUBLIC_API_URL || "https://shreyasdamase.info"}`,

      // Frames: allow the resume PDF preview, Google Docs, and YouTube embedded videos
      "frame-src 'self' https://storage.googleapis.com https://docs.google.com https://www.youtube.com",

      // Media: self only
      "media-src 'self' blob: https:",

      // Workers: self only (Next.js service worker)
      "worker-src 'self' blob:",

      // Manifest
      "manifest-src 'self'",
    ].join("; "),
  },

  // 2. Clickjacking protection
  {
    key: "X-Frame-Options",
    value: "DENY",
  },

  // 3. Stop MIME-type sniffing attacks
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },

  // 4. Don't leak full URL as referrer to third parties
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },

  // 5. Disable browser features you don't use (camera, microphone, etc.)
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "bluetooth=()",
    ].join(", "),
  },

  // 6. Force HTTPS for 1 year (only active in production)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },

  // 7. XSS filter (legacy browsers)
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote"],

  // Hide Next.js fingerprint from response headers
  poweredByHeader: false,

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },

  // Apply security headers to ALL routes
  async headers() {
    return [
      {
        source: "/(.*)", // matches every page & API route
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(withMDX(nextConfig), {
  // Silent in development to avoid spam
  silent: !process.env.CI,
  // We widen file upload so stack traces map securely to original source code
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  // The SDK will look for SENTRY_AUTH_TOKEN on Vercel automatically.
});
