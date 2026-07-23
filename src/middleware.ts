import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

/**
 * portal.novalyte.io → /clinic/* (redirect)
 * ads.novalyte.io → rewrite to /ads/* so public URLs stay clean:
 *   ads.novalyte.io/trt/phoenix-az  →  /ads/trt/phoenix-az
 * investor.novalyte.io → rewrite to /investor/*
 */
export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const { pathname } = request.nextUrl;

  // Keep Supabase auth cookies fresh on investor routes.
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (supabaseUrl && anonKey && (INVESTOR_HOSTS.has(host) || pathname.startsWith("/investor"))) {
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
    await supabase.auth.getUser();
  }

  if (ADS_HOSTS.has(host)) {
    if (shouldBypass(pathname)) {
      return response;
    }

    // Already under /ads — continue (legacy + App Router paths)
    if (pathname === "/ads" || pathname.startsWith("/ads/")) {
      return response;
    }

    const url = request.nextUrl.clone();
    if (pathname === "/" || pathname === "") {
      url.pathname = "/ads";
    } else {
      url.pathname = `/ads${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    }
    // Rewrite (not redirect) so the browser keeps ads.novalyte.io/trt/phoenix-az
    return NextResponse.rewrite(url);
  }

  if (INVESTOR_HOSTS.has(host)) {
    if (shouldBypass(pathname)) return response;

    // Already under /investor — continue
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

  // Canonicalize marketing-host /investor paths to investor host in production.
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
