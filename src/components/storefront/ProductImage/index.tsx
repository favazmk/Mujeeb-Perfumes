"use client";

import React, { useState } from "react";
import Image from "next/image";

/**
 * Product imagery with a designed fallback.
 *
 * A catalog is rarely fully photographed — new products arrive without images,
 * and remote URLs rot. Both cases previously rendered a broken image icon or an
 * empty grey box, which makes an otherwise finished storefront look unfinished.
 *
 * This component renders the real photo when there is one and it loads, and
 * otherwise draws a deterministic monogram tile derived from the product name.
 * The tile is stable per product (same product always gets the same colour), so
 * a grid of them reads as an intentional design rather than an error state, and
 * it needs no network request at all.
 *
 * To replace a placeholder with a real photo, give the product an image —
 * Admin → Products → Edit → Product Images, or drop a file into
 * `public/products/<slug>.jpg` and run `npm run images:sync`.
 */

export interface ProductImageProps {
  /** Image URL. Missing, empty, or failing values fall back to the monogram. */
  src?: string | null;
  /** Accessible description. Pass "" for decorative imagery next to a text label. */
  alt: string;
  /** Stable string the placeholder colour and monogram derive from (name or slug). */
  seed: string;
  /** Matches next/image `sizes`; required whenever the box is not a fixed pixel size. */
  sizes: string;
  /** Extra classes applied to the rendered image. */
  className?: string;
  /** Set on the LCP image only. */
  priority?: boolean;
  /** Renders the monogram at a smaller scale, for thumbnails under ~96px. */
  compact?: boolean;
}

/** Stable non-cryptographic hash so a product keeps the same placeholder colour. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Placeholder tiles, drawn from the brandbook palette: Paper White through to
 * Studio Grey, with the monogram in Vinyl Black. The identity is monochrome,
 * so the tiles are too - the whole catalogue is placeholders until the
 * photography exists, and any colour here would read as a different brand.
 */
const PLACEHOLDER_TONES = [
  { from: "#ffffff", to: "#f4f4f4", ink: "#0d0d0d" },
  { from: "#fafafa", to: "#ededed", ink: "#0d0d0d" },
  { from: "#f4f4f4", to: "#e3e3e3", ink: "#0d0d0d" },
  { from: "#efefef", to: "#dcdcdc", ink: "#0d0d0d" },
  { from: "#e9e9e9", to: "#cecece", ink: "#0d0d0d" },
] as const;

/** Up to two initials from the product name, e.g. "Merino Overcoat" -> "MO". */
function initials(value: string): string {
  const words = value
    .replace(/[^A-Za-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function ProductImage({
  src,
  alt,
  seed,
  sizes,
  className = "",
  priority = false,
  compact = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  const hasSource = Boolean(src && src.trim());
  const showPlaceholder = !hasSource || failed;

  if (showPlaceholder) {
    // The stock template varies the placeholder hue across the full wheel,
    // which reads as deliberate on a broad marketplace catalogue. A fragrance
    // house is the opposite case: the whole grid is placeholders until the
    // photography exists, and a rainbow of tiles would pull against the gold
    // and cream palette. So variation is confined to warm tone within the
    // brand family - the tiles differ enough to be distinguishable, and the
    // grid still reads as one collection.
    const step = hashString(seed) % PLACEHOLDER_TONES.length;
    const tone = PLACEHOLDER_TONES[step];
    const background = `linear-gradient(135deg, ${tone.from} 0%, ${tone.to} 100%)`;

    return (
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{ background }}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        data-placeholder="product-image"
      >
        <span
          className={`font-heading font-semibold tracking-[0.18em] select-none ${
            compact ? "text-sm" : "text-2xl sm:text-3xl"
          }`}
          style={{ color: tone.ink, opacity: 0.8 }}
        >
          {initials(seed)}
        </span>
      </div>
    );
  }

  return (
    <Image
      fill
      priority={priority}
      sizes={sizes}
      src={src as string}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Decorative background imagery (hero, banner, category tile).
 *
 * These sit on top of a gradient or solid colour that already reads correctly
 * on its own, so the right failure behaviour is simply to disappear rather than
 * to draw a monogram or a broken-image icon over the design.
 */
export interface SafeImageProps {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

export function SafeImage({ src, alt, sizes, className = "", priority = false }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || !src.trim() || failed) return null;

  return (
    <Image
      fill
      priority={priority}
      sizes={sizes}
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
