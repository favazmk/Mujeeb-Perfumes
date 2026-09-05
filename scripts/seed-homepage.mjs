/**
 * Seed a starting homepage.
 *
 * The homepage is merchant configuration — it lives in `homepage_sections` and
 * is meant to be built in /admin, not in code. The migrations create the table
 * but seed no rows, so a freshly imported store renders header, footer and
 * nothing in between. This script writes a reviewable starting point that the
 * merchant can then edit or replace entirely.
 *
 * It also marks a spread of products `featured`. The "Best sellers" rail ranks
 * by units actually sold and falls back to featured picks when there are no
 * orders yet; with neither, the rail renders empty.
 *
 * No hero image is set on purpose: the hero falls back to a solid brand-ink
 * panel, which is correct for a monochrome identity and avoids shipping stock
 * photography the client did not choose.
 *
 * Safe to re-run: sections are matched on section_type and updated in place.
 *
 * Usage:
 *   node scripts/seed-homepage.mjs [--dry-run]
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--dry-run");

/** How many products to promote so the featured rail has something to show. */
const FEATURED_PER_CATEGORY = 3;
const FEATURED_CAP = 8;

const SECTIONS = [
  {
    section_type: "hero",
    title: "Extrait de Parfum",
    subtitle:
      "Original compositions at 35% concentration. Built to last the day, not the hour.",
    content: {
      badge: "Mujeeb Perfumes",
      ctaText: "Shop all fragrances",
      ctaLink: "/products",
      secondaryCtaText: "Browse unisex",
      secondaryCtaLink: "/products?category=unisex",
    },
    display_order: 1,
  },
  {
    section_type: "categories",
    title: "Shop by category",
    subtitle: "Men, women and shared compositions.",
    content: {},
    display_order: 2,
  },
  {
    section_type: "featured_products",
    title: "Featured",
    subtitle: "A cross-section of the range.",
    content: {},
    display_order: 3,
  },
];

function loadEnv() {
  const file = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) throw new Error(".env.local not found");
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([^#\s=]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].trim().replace(/^['"](.*)['"]$/, "$1");
  }
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  const db = createClient(url, key);

  // ---- 1. Homepage sections ---------------------------------------------
  const { data: existing, error: readErr } = await db
    .from("homepage_sections")
    .select("id,section_type");
  if (readErr) throw new Error(`homepage_sections unreadable: ${readErr.message}`);
  const byType = new Map((existing ?? []).map((s) => [s.section_type, s]));

  for (const section of SECTIONS) {
    const found = byType.get(section.section_type);
    if (DRY_RUN) {
      console.log(`section ${section.section_type}: would ${found ? "update" : "create"}`);
      continue;
    }
    const row = { ...section, is_enabled: true };
    if (found) {
      const { error } = await db.from("homepage_sections").update(row).eq("id", found.id);
      console.log(
        error
          ? `section ${section.section_type}: FAILED ${error.message}`
          : `section ${section.section_type}: updated`
      );
    } else {
      const { error } = await db.from("homepage_sections").insert([row]);
      console.log(
        error
          ? `section ${section.section_type}: FAILED ${error.message}`
          : `section ${section.section_type}: created`
      );
    }
  }

  // ---- 2. Promote a spread of products ----------------------------------
  const { data: cats } = await db.from("categories").select("id,slug").eq("is_active", true);
  const { data: products } = await db
    .from("products")
    .select("id,name,slug,category_id,price,compare_at_price")
    .eq("status", "active");

  // Prefer products carrying a visible saving — a rail of discounted cards
  // reads better than a rail of flat prices — then spread across categories so
  // the selection is not all menswear.
  const picks = [];
  for (const c of cats ?? []) {
    const inCat = (products ?? [])
      .filter((p) => p.category_id === c.id)
      .sort((a, b) => {
        const da = a.compare_at_price ? (a.compare_at_price - a.price) / a.compare_at_price : 0;
        const db_ = b.compare_at_price ? (b.compare_at_price - b.price) / b.compare_at_price : 0;
        return db_ - da;
      })
      .slice(0, FEATURED_PER_CATEGORY);
    picks.push(...inCat);
  }
  const chosen = picks.slice(0, FEATURED_CAP);

  if (DRY_RUN) {
    console.log(`\nwould feature ${chosen.length}:`);
    for (const p of chosen) console.log(`  ${p.name}`);
    console.log("\nDry run — nothing written.");
    return;
  }

  // Clear first, so re-running does not accumulate an ever-growing feature set.
  await db.from("products").update({ featured: false }).eq("featured", true);
  const { error: featErr } = await db
    .from("products")
    .update({ featured: true })
    .in("id", chosen.map((p) => p.id));
  console.log(
    featErr ? `\nfeaturing FAILED: ${featErr.message}` : `\nfeatured ${chosen.length} products`
  );

  const { data: check } = await db
    .from("products")
    .select("name")
    .eq("featured", true);
  for (const p of check ?? []) console.log(`  ${p.name}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
