# Orlando Spine Studio — emdash CMS

**Stack:** Astro 6 + emdash CMS + SQLite (dev) / Cloudflare D1 (prod)
**Admin UI:** `http://localhost:4321/_emdash/admin`

## Commands

```bash
pnpm run dev          # Start dev server (runs migrations, seeds, generates types)
pnpm run seed         # Re-seed content from seed/seed.json
pnpm run build        # Production build
pnpm run typecheck    # Astro type checking
```

## Key Files

| File | Purpose |
|------|---------|
| `astro.config.mjs` | emdash integration, database config, storage |
| `seed/seed.json` | Content schema + sample data (collections, blocks, menus) |
| `src/layouts/Base.astro` | Base layout — Nav, Footer, theme CSS, emdash head |
| `src/components/MarketingBlocks.astro` | Portable Text block router (oss.* → components) |
| `src/components/blocks/` | Custom block components (Hero, TrustTicker, etc.) |
| `src/styles/theme-*.css` | Design tokens per concept (A=dark/teal, B=navy/gold, C=white/teal) |
| `src/styles/global.css` | Shared styles, reset, typography, animations |
| `emdash-env.d.ts` | Auto-generated types — don't edit manually |

## Hard Rules

- All content pages are **server-rendered** (`output: "server"`) — no `getStaticPaths()` for CMS content
- Image fields are objects `{ src, alt }`, not strings
- `entry.id` = slug (for URLs), `entry.data.id` = database ULID (for API calls)
- Always call `Astro.cache.set(cacheHint)` on pages that query content
- Custom blocks use `oss.*` namespace (e.g., `oss.hero`, `oss.service-grid`)
- Use **pnpm** for all package management — never npm

## Theme System

Three themes as CSS custom properties in `src/styles/`:
- `theme-a.css` — "The Studio" (dark + teal)
- `theme-b.css` — "Warm Authority" (navy + gold)
- `theme-c.css` — "Clean Signal" (white + teal) ← currently active

Switch by changing the import in `Base.astro`. Components consume `var(--accent)`, `var(--bg)`, etc.

## Agent Skills

emdash agent skills are in `.agents/skills/`:
- `building-emdash-site` — Querying content, rendering Portable Text, schema design
- `creating-plugins` — Building emdash plugins with hooks, storage, admin UI
- `emdash-cli` — CLI commands for content management and visual editing
