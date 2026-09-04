# Mujeeb Perfumes — agent guidance

## What this repository is

A **client instance** of the agency e-commerce engine
(`template` remote → `favazmk/e-commerce-template`). The Commerce Core is
inherited, not owned here.

## Where client work belongs

| Change | Location |
|---|---|
| Brand colours, fonts, radius, navigation, announcement bar | `src/theme/theme.config.ts` + `src/app/globals.css` |
| Store identity, currency, contact, keys | `.env.local` (gitignored) |
| Logo, favicon, marketing imagery | `public/` |
| Catalogue, categories, coupons, homepage sections | merchant admin at `/admin` — not code |

## Where it does not belong

Do not edit `src/services/`, `src/repositories/`, `src/lib/payments/`,
`src/lib/email/` or `middleware.ts` to solve a client problem. A change needed
there is an engine change: make it in the template repository and merge it down.
Client identity must never be hard-coded in those layers — see [agents.md](agents.md).

## Theming has two files, not one

`ThemeProvider` injects CSS variables after hydration, so `globals.css`
`:root` must carry the same palette or the page flashes the previous brand on
first paint. Change both together.

## Conventions

- Package manager: npm. Node scripts live in `scripts/`.
- Before pushing: `npm run type-check && npm run lint && npm test`.
- `APP_MODE=demo` uses the mock payment gateway. It must never reach a store
  taking real money — both `APP_MODE` and `NEXT_PUBLIC_APP_MODE` flip together.
- `NEXT_PUBLIC_ALLOW_INDEXING` stays `false` until the production domain is live.
