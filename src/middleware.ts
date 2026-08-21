import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { CLINIC_PUBLIC_AUTH_PATHS } from "@/lib/clinic-portal";

const PORTAL_HOSTS = new Set(["portal.novalyte.io", "portal.localhost", "portal.local"]);
const ADS_HOSTS = new Set(["ads.novalyte.io", "ads.localhost", "ads.local"]);
const INVESTOR_HOSTS = new Set(["investor.novalyte.io", "investor.localhost", "investor.local"]);

function shouldBypass(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/sitemap" ||
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/icon")
  );
}

function isClinicProtectedPath(pathname: string): boolean {
  if (!pathname.startsWith("/clinic")) return false;
  if (CLINIC_PUBLIC_AUTH_PATHS.has(pathname)) return false;
  return true;
}

/**
 * portal.novalyte.io → /clinic/* (redirect)
 * ads.novalyte.io → rewrite to /ads/*
 * investor.novalyte.io → rewrite to /investor/*
 * /clinic/* (except auth pages) requires a Supabase session at the edge.
 */
export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const needsAuthRefresh =
    INVESTOR_HOSTS.has(host) ||
    pathname.startsWith("/investor") ||
    PORTAL_HOSTS.has(host) ||
    pathname.startsWith("/clinic");

  let user: { id: string } | null = null;

  if (supabaseUrl && anonKey && needsAuthRefresh) {
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  // Server-side protect clinic portal pages (client gate remains as UX fallback).
  if (isClinicProtectedPath(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/clinic/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (ADS_HOSTS.has(host)) {
    if (shouldBypass(pathname)) {
      return response;
    }

    if (pathname === "/ads" || pathname.startsWith("/ads/")) {
      return response;
    }

    const url = request.nextUrl.clone();
    if (pathname === "/" || pathname === "") {
      url.pathname = "/ads";
    } else {
      url.pathname = `/ads${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    }
    return NextResponse.rewrite(url);
  }

  if (INVESTOR_HOSTS.has(host)) {
    if (shouldBypass(pathname)) return response;

    if (pathname === "/investor" || pathname.startsWith("/investor/")) {
      return response;
    }

    const url = request.nextUrl.clone();
    if (pathname === "/" || pathname === "") {
      url.pathname = "/investor";
    } else {
      url.pathname = `/investor${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    }
    return NextResponse.rewrite(url);
  }

  if (
    (host === "novalyte.io" || host === "www.novalyte.io") &&
    (pathname === "/investor" || pathname.startsWith("/investor/"))
  ) {
    const target = new URL(pathname.replace(/^\/investor/, "") || "/", "https://investor.novalyte.io");
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, 308);
  }

  if (!PORTAL_HOSTS.has(host)) return response;

  if (shouldBypass(pathname) || pathname.startsWith("/clinic")) {
    return response;
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
