# Mujeeb Perfumes — Online Store

The Mujeeb Perfumes storefront and merchant admin. Built on the agency
**[e-commerce-template](https://github.com/favazmk/e-commerce-template)** engine
(Next.js 15 App Router, TypeScript, Tailwind, Supabase/PostgreSQL).

This repository is a **client instance**. The Commerce Core is inherited from the
template and should not be edited here — client work belongs in configuration,
the theme layer, and the merchant admin. Rules: [agents.md](agents.md).

---

## Brand configuration

| Aspect | Value |
|---|---|
| Store name | Mujeeb Perfumes |
| Tagline | Oud, Attar & Fine Fragrance |
| Action colour | `#8a6a2f` (antique gold) |
| Ink / secondary | `#1c1917` (warm near-black) |
| Accent | `#c9a227` (gold) |
| Surfaces | `#ffffff` on `#f6f2ec` cream |
| Headings | Cormorant Garamond |
| Body | Figtree |
| Radius | `2px` |
| Product card | `luxury` |
| Currency / locale | AED · `en-AE` |
| Order prefix | `MP` |

Defined in [`src/theme/theme.config.ts`](src/theme/theme.config.ts) and
[`src/app/globals.css`](src/app/globals.css); every value is overridable by
environment variable or from `/admin/settings`.

---

## Local development

```bash
npm install
cp .env.example .env.local   # already present — fill the TODO values
npm run dev
```

The store runs at `http://localhost:3000`, the merchant admin at `/admin`.

`.env.local` currently runs in **demo mode** with the mock payment gateway, so
checkout approves without charging. Both `APP_MODE` and `NEXT_PUBLIC_APP_MODE`
must be flipped to `production` before go-live.

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run type-check` | TypeScript, no emit |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) |
| `npm run db:migrate` | Apply the SQL migration to the client database |
| `npm run demo:seed` | Seed a demo catalogue for design review |

---

## Launch checklist

Full SOP: [`docs/CLIENT-ONBOARDING.md`](docs/CLIENT-ONBOARDING.md).

- [x] 1. Repository created from the template
- [ ] 2. Supabase project provisioned (`mujeeb-perfumes-prod`)
- [ ] 3. Schema migration applied
- [ ] 4. `.env.local` credentials filled (Supabase, Razorpay)
- [x] 5. Brand identity configured
- [x] 6. Logo placeholder in `/public/logo.svg` — replace with the client's artwork
- [ ] 7. Category hierarchy created in `/admin/categories`
- [ ] 8. Catalogue and variants uploaded
- [ ] 9. Delivery zones and free-shipping threshold
- [ ] 10. VAT configured (UAE 5%)
- [ ] 11. Launch coupons
- [ ] 12. Homepage sections
- [ ] 13. Razorpay live keys, `DEFAULT_PAYMENT_PROVIDER=razorpay`, `APP_MODE=production`
- [ ] 14. End-to-end checkout tested
- [ ] 15. Deployed to Vercel
- [ ] 16. Custom domain + SSL, `NEXT_PUBLIC_ALLOW_INDEXING=true`
- [ ] 17. Merchant admin credentials handed over

---

## Pulling engine updates from the template

The upstream engine is wired as the `template` remote:

```bash
git fetch template
git merge template/master --allow-unrelated-histories
```

Resolve conflicts in favour of this repository for `theme.config.ts`,
`globals.css`, `public/`, `README.md` and `.env.local`; take the template's
version for everything under `src/services/`, `src/repositories/` and
`src/lib/`.

---

## Documentation

Engine documentation is inherited and lives in [`docs/`](docs/) —
architecture, database, payments, theming, SEO, security, deployment and the
go-live checklist.
