import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { CAMPAIGN_PAGES_TAG } from "@/lib/campaigns/public-pages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cache invalidation hook for Campaign Studio publish/unpublish.
 *
 * POST /api/campaigns/revalidate
 * Authorization: Bearer <CAMPAIGN_REVALIDATE_SECRET | JOURNAL_REVALIDATE_SECRET>
 * Body: { "paths"?: string[], "all"?: boolean }
 */

function revalidateSecret(): string | undefined {
  return (
    process.env.CAMPAIGN_REVALIDATE_SECRET?.trim() ||
    process.env.JOURNAL_REVALIDATE_SECRET?.trim()
  );
}

function isAuthorized(request: NextRequest): boolean {
  const secret = revalidateSecret();
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!provided) return false;
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(secret, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { paths?: unknown; all?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    // Empty body → full refresh.
  }

  const paths = Array.isArray(body.paths)
    ? body.paths.filter((p): p is string => typeof p === "string").map((p) => p.trim())
    : [];
  const all = body.all === true || paths.length === 0;

  revalidateTag(CAMPAIGN_PAGES_TAG, "max");

  const revalidatedPaths = new Set<string>(["/sitemap.xml"]);
  for (const path of paths) {
    if (!path) continue;
    revalidatedPaths.add(path.startsWith("/") ? path : `/${path}`);
  }

  if (all) {
    revalidatePath("/find", "layout");
    revalidatePath("/ads", "layout");
  }

  for (const path of revalidatedPaths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    revalidated: true,
    tags: [CAMPAIGN_PAGES_TAG],
    paths: Array.from(revalidatedPaths),
    all,
    now: new Date().toISOString(),
  });
}
