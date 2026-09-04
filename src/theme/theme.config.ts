export type ProductCardVariant =
  | "classic"
  | "minimal"
  | "luxury"
  | "modern"
  | "compact"
  | "image-focused";

export interface NavigationLink {
  label: string;
  href: string;
}

export interface ThemeConfig {
  brand: {
    name: string;
    logoUrl?: string;
    faviconUrl?: string;
    tagline?: string;
    /**
     * Optional two-line wordmark lockup for the header, when the brand's
     * logotype is set differently from its plain name. `name` stays the
     * canonical identity used for SEO, schema.org and page titles; this only
     * changes how the header draws it. Omitted, the header falls back to
     * name over tagline.
     */
    wordmark?: {
      primary: string;
      secondary?: string;
      /** Letter-spacing for the secondary line, e.g. "0.5em". */
      secondaryTracking?: string;
    };
  };
  colors: {
    /** Primary action colour. One hot accent, reserved for CTAs. */
    primary: string;
    /** Deep neutral for secondary buttons, the footer and the header wordmark. */
    secondary: string;
    accent: string;
    /** Primary text. A dense blue-charcoal, not pure black. */
    ink: string;
    /** Secondary text: product names, helper copy. */
    mutedInk: string;
    surface: string;
    /** Section backgrounds and inactive chips. */
    subtle: string;
    muted: string;
    border: string;
    /** Ratings and in-stock states. */
    rating: string;
    /** Discount percentages and offer copy. */
    discount: string;
    /** Scarcity messaging. Deliberately distinct from `discount`. */
    urgent: string;
  };
  typography: {
    fontHeading: string;
    fontBody: string;
  };
  /**
   * Storefront navigation. Category slugs differ per client, so this belongs
   * in per-client theme configuration and never hard-coded into components.
   */
  navigation: NavigationLink[];
  styling: {
    borderRadius: string; // e.g. '4px', '8px', '0px'
    productCardVariant: ProductCardVariant;
    headerSticky: boolean;
    announcementBar: {
      enabled: boolean;
      text: string;
      link?: string;
    };
  };
}

/**
 * Mujeeb Perfumes theme — per the brandbook, Edition 01.
 *
 * The identity is deliberately monochrome: Vinyl Black #0D0D0D, Paper White,
 * and Brushed Silver #B8B8B8 as an accent only. Black carries the brand, so
 * the primary action colour is black rather than a hot accent, and the radius
 * is zero — "nothing decorative left unexplained".
 *
 * Two documented deviations, both for legibility rather than taste:
 *  - Secondary text uses #5a5a5a, not Brushed Silver. #B8B8B8 on white is
 *    about 1.9:1, far below the 4.5:1 needed for small text. Silver is kept
 *    for dividers, borders and fine print on dark, as the brandbook intends.
 *  - Scarcity and error states use a restrained red. A storefront with no
 *    error colour cannot tell a customer their card was declined.
 */
export const defaultThemeConfig: ThemeConfig = {
  brand: {
    name: process.env.NEXT_PUBLIC_STORE_NAME || "Mujeeb Perfumes",
    tagline:
      process.env.NEXT_PUBLIC_STORE_TAGLINE || "Extrait de Parfum",
    logoUrl: process.env.NEXT_PUBLIC_STORE_LOGO_URL || "/logo.svg",
    faviconUrl: process.env.NEXT_PUBLIC_STORE_ICON_URL || "/icon.svg",
    // Brandbook section 02: "MUJEEB" set solid, "P e r f u m e s" spaced beneath.
    wordmark: { primary: "MUJEEB", secondary: "Perfumes", secondaryTracking: "0.5em" },
  },
  colors: {
    // Vinyl Black. Black carries the brand, so it is also the action colour.
    primary: process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR || "#0d0d0d",
    secondary: "#0d0d0d",
    // Brushed Silver — accent only: dividers, fine print, never a large surface.
    accent: "#b8b8b8",
    ink: "#0d0d0d",
    mutedInk: "#5a5a5a",
    surface: "#ffffff",
    subtle: "#f4f4f4",
    muted: "#fafafa",
    border: "#e3e3e3",
    rating: "#0d0d0d",
    discount: "#0d0d0d",
    urgent: "#a33529",
  },
  typography: {
    fontHeading: "'Alexandria', 'Space Grotesk', sans-serif",
    fontBody: "'Space Grotesk', sans-serif",
  },
  navigation: [
    { label: "Men", href: "/products?category=men" },
    { label: "Women", href: "/products?category=women" },
    { label: "Unisex", href: "/products?category=unisex" },
    { label: "All Fragrances", href: "/products" },
  ],
  styling: {
    // Zero radius. The brand is built on a fixed grid and square packaging.
    borderRadius: "0px",
    productCardVariant: "luxury",
    headerSticky: true,
    announcementBar: {
      enabled: true,
      text: "Extrait de Parfum · 50ml · Free delivery on orders over AED 200",
      link: "/products",
    },
  },
};
