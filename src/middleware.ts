/**
 * middleware.ts — Edge-level security (runs before any page renders)
 *
 * Belt-and-suspenders alongside next.config.mjs headers.
 * Middleware runs at the Vercel/Netlify edge — headers here
 * are set even if next.config.mjs headers are misconfigured.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ── Clickjacking ───────────────────────────────────────
  response.headers.set("X-Frame-Options", "DENY");

  // ── MIME sniffing ──────────────────────────────────────
  response.headers.set("X-Content-Type-Options", "nosniff");

  // ── Referrer leakage ──────────────────────────────────
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // ── Remove tech fingerprint ────────────────────────────
  response.headers.delete("X-Powered-By");
  response.headers.delete("Server");

  // ── Block suspicious query parameters ─────────────────
  // Open redirect protection: reject if `redirect` param points off-site
  const redirectParam = request.nextUrl.searchParams.get("redirect");
  if (redirectParam) {
    try {
      const url = new URL(redirectParam, request.nextUrl.origin);
      // Only allow same-origin redirects
      if (url.origin !== request.nextUrl.origin) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    } catch {
      // Invalid URL in redirect param — block it
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return response;
}

// Run middleware on all routes EXCEPT static files and API internals
export const config = {
  matcher: [
    /*
     * Match everything EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - Public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)).*)",
  ],
};
