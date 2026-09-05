/**
 * Import the client's real catalogue from client-assets/mujeeb-import-READY.xlsx.
 *
 * That workbook is the merchant's own product list, already shaped to the admin
 * importer's column contract. It is the source of truth for this store's
 * catalogue — nothing here invents product data.
 *
 * Two deliberate overrides, both flagged at run time:
 *   - status: the file ships every row as "draft". Imported literally, the
 *     storefront stays empty. This script activates them so the store can be
 *     reviewed and checkout exercised.
 *   - stock: the file leaves stock blank, which reads as out-of-stock on every
 *     product. A nominal quantity is applied so add-to-bag works. The merchant
 *     sets real counts in /admin.
 *
 * Everything else is taken from the file verbatim: name, sku, slug, prices
 * (price = sale, compare_at_price = MRP), descriptions, SEO fields and category.
 *
 * Safe to re-run: rows are matched on slug and updated in place.
 *
 * Usage:
 *   node scripts/import-client-catalogue.mjs [--dry-run] [--purge-seeded]
 *
 *   --purge-seeded  also deletes the fabricated products created by the
 *                   now-removed seed-mujeeb-catalog.mjs, matched on their
 *                   exact slugs. Variants cascade.
 */
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { createClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--dry-run");
const PURGE = process.argv.includes("--purge-seeded");

const SOURCE = "client-assets/mujeeb-import-READY.xlsx";

/** Nominal stock so the storefront is browsable; the merchant sets real counts. */
const PLACEHOLDER_STOCK = 25;

/**
 * Slugs of the fabricated products seeded earlier in error. Listed explicitly
 * rather than pattern-matched so this can never delete a real product.
 */
const FABRICATED_SLUGS = [
  "qasr-noir", "amber-sahil", "iron-cedar", "majlis-tobacco", "blue-meridian",
  "leather-souk", "desert-sandal", "green-vetiver",
  "rose-attar", "vanilla-kahwa", "jasmine-hour", "peach-suede", "musk-al-layl",
  "fig-and-orris", "amber-silk", "citrus-neroli",
  "oud-mubakhar", "incense-road", "white-musk-01", "saffron-bloom",
  "citrus-oud", "cardamom-wood", "incense-musk", "bakhoor-nuit",
];

function loadEnv() {
  const file = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) throw new Error(".env.local not found");
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([^#\s=]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].trim().replace(/^['"](.*)['"]$/, "$1");
  }
}

/** Excel cells can carry formula objects; take the computed value. */
function cell(value) {
  if (value == null) return "";
  if (typeof value === "object" && value.result !== undefined) return value.result;
  if (typeof value === "object" && value.text !== undefined) return value.text;
  return value;
}

async function readWorkbook() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.resolve(process.cwd(), SOURCE));
  const ws = wb.getWorksheet("products");
  if (!ws) throw new Error(`sheet "products" not found in ${SOURCE}`);

  const header = ws.getRow(1).values.slice(1).map((h) => String(cell(h)).trim());
  const rows = [];
  ws.eachRow((row, i) => {
    if (i === 1) return;
    const values = row.values.slice(1);
    if (!values.some((v) => v != null && String(cell(v)).trim() !== "")) return;
    const record = {};
    header.forEach((h, j) => {
      record[h] = String(cell(values[j]) ?? "").trim();
    });
    rows.push(record);
  });
  return rows;
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  const db = createClient(url, key);

  const rows = await readWorkbook();
  console.log(`${SOURCE}: ${rows.length} rows`);

  // ---- 1. Resolve categories by name -------------------------------------
  const { data: cats, error: catErr } = await db.from("categories").select("id,slug,name");
  if (catErr) throw new Error(`categories unreadable: ${catErr.message}`);
  const byName = Object.fromEntries((cats ?? []).map((c) => [c.name.toLowerCase(), c.id]));

  const unmapped = [...new Set(rows.map((r) => r.category))].filter(
    (c) => !byName[c.toLowerCase()]
  );
  if (unmapped.length) {
    throw new Error(`no category row matches: ${unmapped.join(", ")}`);
  }

  // ---- 2. Purge the fabricated seed products -----------------------------
  if (PURGE) {
    const { data: doomed } = await db
      .from("products")
      .select("id,slug")
      .in("slug", FABRICATED_SLUGS);
    console.log(`\nFabricated products to delete: ${doomed?.length ?? 0}`);
    if (doomed?.length && !DRY_RUN) {
      const { error } = await db.from("products").delete().in("id", doomed.map((p) => p.id));
      if (error) throw new Error(`purge failed: ${error.message}`);
      console.log(`  deleted ${doomed.length} (variants cascade)`);
    }
  }

  // ---- 3. Upsert the real catalogue --------------------------------------
  const { data: existing } = await db.from("products").select("id,slug");
  const bySlug = new Map((existing ?? []).map((p) => [p.slug, p]));

  let created = 0;
  let updated = 0;
  const failures = [];

  for (const r of rows) {
    const row = {
      name: r.name,
      slug: r.slug,
      sku: r.sku,
      description: r.description,
      short_description: r.short_description,
      price: Number(r.price),
      compare_at_price: r.compare_at_price ? Number(r.compare_at_price) : null,
      currency: "AED",
      stock_quantity: r.stock === "" ? PLACEHOLDER_STOCK : Number(r.stock),
      low_stock_threshold: r.low_stock_threshold ? Number(r.low_stock_threshold) : 5,
      status: "active",
      featured: r.featured?.toLowerCase() === "yes",
      category_id: byName[r.category.toLowerCase()],
      brand: r.brand,
      seo_title: r.seo_title || null,
      seo_description: r.seo_description || null,
    };

    if (DRY_RUN) {
      const verb = bySlug.has(r.slug) ? "update" : "create";
      console.log(
        `  would ${verb}  ${r.category.padEnd(7)} ${r.slug.padEnd(22)} AED ${row.price}` +
          (row.compare_at_price ? ` (was ${row.compare_at_price})` : "")
      );
      continue;
    }

    const found = bySlug.get(r.slug);
    if (found) {
      const { error } = await db.from("products").update(row).eq("id", found.id);
      if (error) failures.push(`${r.slug}: ${error.message}`);
      else updated++;
    } else {
      const { error } = await db.from("products").insert([row]);
      if (error) failures.push(`${r.slug}: ${error.message}`);
      else created++;
    }
  }

  if (DRY_RUN) {
    console.log("\nDry run — nothing written.");
    return;
  }

  console.log(`\nCatalogue: ${created} created, ${updated} updated`);
  if (failures.length) {
    console.log(`\n${failures.length} FAILED:`);
    for (const f of failures) console.log("  " + f);
  }

  // ---- 4. Report ---------------------------------------------------------
  const { data: active } = await db
    .from("products")
    .select("id,category_id,status")
    .eq("status", "active");
  console.log(`\nActive products now: ${active?.length ?? 0}`);
  for (const c of cats ?? []) {
    const n = active?.filter((p) => p.category_id === c.id).length ?? 0;
    console.log(`  ${c.slug.padEnd(10)} ${n}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
