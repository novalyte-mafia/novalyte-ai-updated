"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Optimized image component wrapping next/image with:
 * - Blur placeholder (shimmer) while loading
 * - Graceful fallback on error
 * - Responsive sizing
 * - Lazy loading by default (priority opt-in for hero images)
 */
export function SmartImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className,
  imgClassName,
  sizes,
  fallback,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  fallback?: React.ReactNode;
}) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (errored) {
    return (
      <div className={cn("flex items-center justify-center bg-muted", className)}>
        {fallback ?? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", !fill && "inline-block", className)}>
      {!loaded && (
        <div className="novalyte-shimmer absolute inset-0" aria-hidden />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />
    </div>
  );
}

/**
 * Image gallery with lightbox support.
 */
export function ImageLightbox({
  images,
  initialIndex = 0,
  open,
  onClose,
  captions,
}: {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  captions?: string[];
}) {
  const [index, setIndex] = useState(initialIndex);

  if (!open) return null;

  function nav(dir: number) {
    setIndex((i) => (i + dir + images.length) % images.length);
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/90 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Close gallery"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" /></svg>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); nav(-1); }}
        className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Previous image"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); nav(1); }}
        className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Next image"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div className="relative max-h-[85vh] max-w-4xl px-16" onClick={(e) => e.stopPropagation()}>
        <Image
          src={images[index]}
          alt={captions?.[index] ?? "Clinic gallery image"}
          width={1200}
          height={800}
          className="max-h-[75vh] w-auto rounded-xl object-contain"
        />
        {captions?.[index] && (
          <p className="mt-3 text-center text-sm text-white/70">{captions[index]}</p>
        )}
        <p className="mt-2 text-center text-xs text-white/50">{index + 1} of {images.length}</p>
      </div>
    </div>
  );
}
