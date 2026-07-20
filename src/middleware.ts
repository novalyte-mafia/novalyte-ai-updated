import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PORTAL_HOSTS = new Set(["portal.novalyte.io", "portal.localhost", "portal.local"]);

/**
 * portal.novalyte.io is the clinic workspace host.
 *
 * IMPORTANT: use redirects (not rewrites) so the browser pathname matches a real
 * /clinic/* App Router page. Rewriting / → /clinic while leaving the URL as /
 * caused the client to hydrate the public marketing homepage.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  if (!PORTAL_HOSTS.has(host)) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Shared assets / APIs / auth / already-clinic paths stay as-is.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/clinic")
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  if (pathname === "/" || pathname === "") {
    // Send portal root to the gateway (then sign-in or dashboard).
    url.pathname = "/clinic";
    return NextResponse.redirect(url);
  }

  url.pathname = `/clinic${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
