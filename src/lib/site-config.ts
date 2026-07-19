export const SITE_NAME = "Novalyte AI";
export const SITE_URL = "https://novalyte.io";
export const SITE_DESCRIPTION =
  "Novalyte AI helps people discover men's-health care while giving verified clinics, healthcare professionals, and partners one connected platform for access and operations.";
export const DEFAULT_SOCIAL_IMAGE = "/opengraph-image";

export function absoluteSiteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

export function canonicalPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/" ? SITE_URL : `${SITE_URL}${normalized.replace(/\/+$/, "")}`;
}
