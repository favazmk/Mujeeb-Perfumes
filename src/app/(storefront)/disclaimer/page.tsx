import React from "react";
import type { Metadata } from "next";
import { getStoreDisplayName } from "@/lib/config/store.config";
import { canonicalUrl } from "@/lib/seo/site";
import { LegalPage, LegalSection } from "@/components/storefront/LegalPage";
import { DISCLAIMER_PARAGRAPHS } from "@/lib/config/disclaimer";

/**
 * Fragrance comparison disclaimer.
 *
 * Wording and the reasoning behind it live in lib/config/disclaimer.ts so the
 * footer, the product page and this page can never drift apart. See that file
 * for the UAE consumer-protection and trademark considerations, and for the
 * standing note that this is not legal advice.
 */

const LAST_UPDATED = "2026-09-04";

export const metadata: Metadata = {
  title: "Fragrance Disclaimer",
  description: `How ${getStoreDisplayName()} describes its fragrances, and our position on the designer names referred to on this site.`,
  alternates: { canonical: canonicalUrl("/disclaimer") },
};

export default function DisclaimerPage() {
  const storeName = getStoreDisplayName();

  return (
    <LegalPage
      title="Fragrance Disclaimer"
      lastUpdated={LAST_UPDATED}
      intro={`${storeName} sells its own original fragrance compositions. This page explains what the designer names on this site mean, and what they do not.`}
    >
      <LegalSection id="independent" title="1. Independent compositions">
        <p>{DISCLAIMER_PARAGRAPHS[0]}</p>
      </LegalSection>

      <LegalSection id="descriptive-use" title="2. Why designer names appear">
        <p>{DISCLAIMER_PARAGRAPHS[1]}</p>
      </LegalSection>

      <LegalSection id="trademarks" title="3. Trademarks">
        <p>{DISCLAIMER_PARAGRAPHS[2]}</p>
      </LegalSection>

      <LegalSection id="what-you-buy" title="4. What you are buying">
        <p>{DISCLAIMER_PARAGRAPHS[3]}</p>
      </LegalSection>

      <LegalSection id="notice" title="5. Notice of infringement">
        <p>{DISCLAIMER_PARAGRAPHS[4]}</p>
      </LegalSection>
    </LegalPage>
  );
}
