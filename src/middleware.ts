import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PORTAL_HOSTS = new Set(["portal.novalyte.io", "portal.localhost", "portal.local"]);
const ADS_HOSTS = new Set(["ads.novalyte.io", "ads.localhost", "ads.local"]);

function shouldBypass(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images")
  );
}

/**
 * portal.novalyte.io → /clinic/*
 * ads.novalyte.io → /ads/*
 *
 * IMPORTANT: use redirects (not rewrites) so the browser pathname matches a real
 * App Router page.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const { pathname } = request.nextUrl;

  if (ADS_HOSTS.has(host)) {
    if (shouldBypass(pathname) || pathname.startsWith("/ads")) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    if (pathname === "/" || pathname === "") {
      url.pathname = "/ads";
      return NextResponse.redirect(url);
    }

    url.pathname = `/ads${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    return NextResponse.redirect(url);
  }

  if (!PORTAL_HOSTS.has(host)) return NextResponse.next();

  if (shouldBypass(pathname) || pathname.startsWith("/clinic")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  if (pathname === "/" || pathname === "") {
    url.pathname = "/clinic";
    return NextResponse.redirect(url);
  }

  url.pathname = `/clinic${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
