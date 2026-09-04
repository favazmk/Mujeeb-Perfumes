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
 * Mujeeb Perfumes theme.
 *
 * A fragrance house reads as luxury through restraint: warm near-black ink,
 * a single antique-gold action colour, cream section backgrounds and a
 * near-square radius. The three semantic colours (rating, discount, scarcity)
 * are kept — shoppers parse them pre-attentively — but tuned to the warm
 * palette instead of the marketplace neon defaults.
 *
 * Every value stays overridable by environment variable so the merchant can
 * rebrand from /admin/settings without a code change.
 */
export const defaultThemeConfig: ThemeConfig = {
  brand: {
    name: process.env.NEXT_PUBLIC_STORE_NAME || "Mujeeb Perfumes",
    tagline:
      process.env.NEXT_PUBLIC_STORE_TAGLINE || "Oud, Attar & Fine Fragrance",
    logoUrl: process.env.NEXT_PUBLIC_STORE_LOGO_URL || "/logo.svg",
    faviconUrl: process.env.NEXT_PUBLIC_STORE_ICON_URL || "/logo.svg",
  },
  colors: {
    primary: process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR || "#8a6a2f",
    secondary: "#1c1917",
    accent: "#c9a227",
    ink: "#1c1917",
    mutedInk: "#6f675e",
    surface: "#ffffff",
    subtle: "#f6f2ec",
    muted: "#fbf8f4",
    border: "#e7dfd3",
    rating: "#2f6f5e",
    discount: "#a8571e",
    urgent: "#b03a2e",
  },
  typography: {
    fontHeading: "'Cormorant Garamond', Georgia, serif",
    fontBody: "Figtree, Inter, sans-serif",
  },
  navigation: [
    { label: "Men", href: "/products?category=men" },
    { label: "Women", href: "/products?category=women" },
    { label: "Unisex", href: "/products?category=unisex" },
    { label: "Attar & Oud", href: "/products?category=attar-oud" },
    { label: "Gift Sets", href: "/products?category=gift-sets" },
    { label: "New Arrivals", href: "/products?sort=newest" },
  ],
  styling: {
    borderRadius: "2px",
    productCardVariant: "luxury",
    headerSticky: true,
    announcementBar: {
      enabled: true,
      text: "Free delivery on orders over AED 200 · Authentic fragrances only",
      link: "/products",
    },
  },
};
