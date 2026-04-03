# Blueprint: Migrate Orlando Spine Studio from Static HTML to emdash CMS

**Classification**: migration
**Date**: 2026-04-02
**Stack**: Static HTML/CSS/JS → Astro + emdash CMS + SQLite (dev) / Cloudflare D1+R2+Workers (prod)

## Context

Orlando Spine Studio is a pitch site for Randall/RDM presenting a website redesign to Dr. James Bowles' chiropractic practice. Currently static HTML with three concept designs (A, B, C). The decision was made to use emdash CMS (Astro-based, MIT-licensed) instead of Next.js for the production site — emdash provides built-in WordPress migration, admin UI for client self-editing, MCP server for AI-automated content management, and Cloudflare deployment.

This blueprint covers scaffolding the emdash project, porting the existing design work into Astro components, defining the content schema, and preparing for WordPress content import. The static pitch site remains intact in this repo for continued pitch presentations.

Research: `~/Projects/hq/business/offerings/wordpress-migration-emdash.md`

## Related Code

**Existing design work (source material — to be ported, not modified):**
- `concept-a/index.html` — "The Studio" dark + teal design
- `concept-b/index.html` — "Warm Authority" navy + gold design
- `concept-c/index.html` — "Clean Signal" white + teal design
- `index.html` — Pitch presentation (stays as-is)
- `demo/booking-modal.js` — 5-step booking modal prototype
- `demo/chat-widget.js` — Chat widget prototype
- `assets/` — Logo (PNG/JPG/SVG), hero video, Dr. James photo

**emdash marketing template (pattern to follow):**
- `src/pages/index.astro` — Home page with marketing blocks
- `src/pages/contact.astro` — Contact page
- `src/pages/pricing.astro` — Pricing page (repurpose for services)
- `src/components/blocks/Hero.astro` — Hero block component
- `src/components/blocks/Features.astro` — Features grid
- `src/components/blocks/Testimonials.astro` — Testimonials
- `src/components/blocks/FAQ.astro` — FAQ accordion
- `src/components/MarketingBlocks.astro` — Block router
- `src/layouts/Base.astro` — Base layout with emdash wiring
- `seed/seed.json` — Content schema + demo data
- `astro.config.mjs` — emdash integration config

## Decisions

1. **Astro + emdash over Next.js** — This is a content/marketing site, not a SaaS product. Astro ships zero JS by default (faster SEO), emdash provides a full admin UI (client self-editing), built-in WordPress importers (migration), and MCP server (AI automation). Next.js is for software; emdash is for websites.

2. **Scaffold in this repo, archive pitch to branch** — The pitch site served its purpose. Move it to a `pitch` branch for reference. The main branch becomes the emdash production site. Avoids maintaining two repos.

3. **Start with marketing template** — emdash's marketing template has Hero, Features, Testimonials, FAQ, Contact — maps closely to the concept sections. Customize rather than build from scratch.

4. **SQLite for dev, Cloudflare D1 for prod** — Local development uses SQLite (zero setup). Production deploys to Cloudflare Workers + D1 + R2. The emdash abstraction layer handles the switch.

5. **All three concept designs become theme variants** — Port each concept's CSS/design tokens as a switchable theme. Client picks one, the rest are archived. Until then, all three are available.

6. **Custom Portable Text blocks for unique sections** — The marketing template has Hero, Features, Testimonials. Orlando Spine Studio also needs: TrustTicker, WhyUs, TeamSpotlight, ServiceGrid, InsuranceCTA. These become custom blocks in the seed schema and Astro components.

7. **WordPress import deferred to Phase 2** — First get the design and CMS structure right. WordPress content import (54 blog posts, 82 images, 101 pages) happens in Phase 2 after the schema is confirmed and the admin UI is tested.

## Impact Analysis

No existing code graph — this is a greenfield scaffold on an existing design repo. Impact is architectural:

- **Pitch site**: Preserved on `pitch` branch. Zero risk to existing work.
- **Design concepts**: Read-only source material. CSS/HTML extracted into Astro components. Originals remain on `pitch` branch.
- **Assets**: Logo, video, and photos carry over directly to `public/` or emdash media library.
- **Demo prototypes**: Booking modal and chat widget are standalone JS. Can be integrated later as emdash plugins or client-side islands.

## Files to Touch

| # | File | Action | Why |
|---|------|--------|-----|
| | **Phase 1: Scaffold & Config** | | |
| 1 | `astro.config.mjs` | Create | emdash integration with SQLite + local storage |
| 2 | `package.json` | Create | Dependencies: astro, emdash, react, better-sqlite3 |
| 3 | `tsconfig.json` | Create | TypeScript config for Astro |
| 4 | `emdash-env.d.ts` | Create (auto) | Generated types from emdash schema |
| 5 | `src/live.config.ts` | Create | emdash loader registration (boilerplate) |
| 6 | `.gitignore` | Edit | Add data.db, uploads/, node_modules/, dist/ |
| | **Phase 2: Layout & Base Components** | | |
| 7 | `src/layouts/Base.astro` | Create | Base layout with nav, footer, emdash wiring, meta tags |
| 8 | `src/components/Nav.astro` | Create | Sticky nav with blur, mobile hamburger — ported from concepts |
| 9 | `src/components/Footer.astro` | Create | 4-column footer — ported from concepts |
| | **Phase 3: Custom Portable Text Blocks** | | |
| 10 | `src/components/blocks/Hero.astro` | Create | Split hero with video background — custom for OSS |
| 11 | `src/components/blocks/TrustTicker.astro` | Create | Animated trust bar (357 reviews, 40W, same-day, insurance) |
| 12 | `src/components/blocks/ServiceGrid.astro` | Create | 6-service card grid with hover effects |
| 13 | `src/components/blocks/WhyUs.astro` | Create | 3-column differentiators (40W, DC+, 357) |
| 14 | `src/components/blocks/TeamSpotlight.astro` | Create | Dr. James feature section with credentials |
| 15 | `src/components/blocks/Testimonials.astro` | Create | 3-card testimonial grid with star ratings |
| 16 | `src/components/blocks/InsuranceCTA.astro` | Create | Dark CTA block with insurance logos |
| 17 | `src/components/blocks/FAQ.astro` | Create | FAQ accordion (for services/conditions pages) |
| 18 | `src/components/blocks/index.ts` | Create | Block type registry + export map |
| 19 | `src/components/MarketingBlocks.astro` | Create | Block router — maps Portable Text types to components |
| | **Phase 4: Pages** | | |
| 20 | `src/pages/index.astro` | Create | Home page — queries content, renders blocks |
| 21 | `src/pages/contact.astro` | Create | Contact page with form |
| 22 | `src/pages/about.astro` | Create | About / Dr. James page |
| 23 | `src/pages/services/index.astro` | Create | Services listing page |
| 24 | `src/pages/services/[slug].astro` | Create | Individual service pages (dynamic) |
| 25 | `src/pages/blog/index.astro` | Create | Blog listing (for imported WordPress posts) |
| 26 | `src/pages/blog/[slug].astro` | Create | Individual blog post pages |
| 27 | `src/pages/404.astro` | Create | Custom 404 page |
| | **Phase 5: Seed Data & Theme** | | |
| 28 | `seed/seed.json` | Create | Content schema: collections, fields, taxonomies, custom blocks, sample content |
| 29 | `src/styles/theme-a.css` | Create | "The Studio" — dark + teal design tokens |
| 30 | `src/styles/theme-b.css` | Create | "Warm Authority" — navy + gold design tokens |
| 31 | `src/styles/theme-c.css` | Create | "Clean Signal" — white + teal design tokens |
| 32 | `src/styles/global.css` | Create | Shared styles: reset, typography scale, responsive breakpoints, animations |
| | **Phase 6: Static Assets** | | |
| 33 | `public/logo/` | Create | Copy logos from assets/ |
| 34 | `public/videos/` | Create | Copy hero video from assets/ |
| 35 | `public/images/team/` | Create | Copy Dr. James photo from assets/ |
| 36 | `public/favicon.png` | Create | Copy favicon |
| | **Phase 7: Config & Deploy Prep** | | |
| 37 | `CLAUDE.md` | Edit | Update for emdash project (Astro patterns, emdash CLI commands, content model) |
| 38 | `.claude/agents/skills/` | Create | Copy emdash agent skills for future AI content management |

**Total: 35 creates + 2 edits = 37 files (across 7 phases)**

## Preservation Boundaries

- `pitch` branch (entire current repo state) — Archived reference. Never modify after branching.
- `demo/booking-modal.js` and `demo/chat-widget.js` — Standalone prototypes. Will be integrated as emdash plugins or Astro islands in a future phase, not this blueprint.
- WordPress content — Import is Phase 2 (separate blueprint). This blueprint sets up the schema and structure, not the data migration.
- Client's choice of concept — All three theme CSS files are created. None is applied as default until client decides. Global styles + component structure work with any theme.

## Implementation Spec

### Phase 1: Scaffold & Config

#### 1. `astro.config.mjs` (Create)
- Import: `defineConfig` from astro, `emdash` + `local` from emdash/astro, `sqlite` from emdash/db
- Configure emdash integration:
  - `database: sqlite({ url: "file:./data.db" })`
  - `storage: local({ directory: "./uploads", baseUrl: "/_emdash/api/media/file" })`
  - `plugins: []` (empty for now)
- Set `output: "server"` (required — all emdash content pages are server-rendered)
- Add `@astrojs/node` adapter for local dev

#### 2. `package.json` (Create)
- Scaffold via `npm create emdash@latest` with `--template marketing` flag
- Dependencies: astro, emdash, @astrojs/node, @astrojs/react, react, react-dom, better-sqlite3
- Scripts: `dev`, `build`, `preview`, `start`, `bootstrap` (emdash init + seed), `seed`, `typecheck`

#### 3-6. Standard scaffold files
- `tsconfig.json`: Astro strict mode
- `emdash-env.d.ts`: Auto-generated on `emdash dev`
- `src/live.config.ts`: Boilerplate loader registration (do not modify)
- `.gitignore`: Add `data.db`, `uploads/`, `node_modules/`, `dist/`, `.astro/`

### Phase 2: Layout & Base Components

#### 7. `src/layouts/Base.astro` (Create)
- Import emdash utilities: menus, search, page contributions, SEO head
- HTML skeleton: `<html>`, `<head>` with meta + emdash SEO, `<body>`
- Slot for page content between Nav and Footer
- Include global CSS + conditional theme CSS (based on env var or setting)
- Call `Astro.cache.set(cacheHint)` for content pages

#### 8. `src/components/Nav.astro` (Create)
- Port from concept HTML: sticky nav, backdrop-filter blur on scroll, mobile hamburger
- Logo from `public/logo/`
- Menu items from emdash menu system: `getMenu("main")`
- CTA button: "Book Appointment" linking to contact or external booking
- Mobile overlay with slide-in animation
- Client-side JS for scroll detection + hamburger toggle (Astro `<script>` tag)

#### 9. `src/components/Footer.astro` (Create)
- 4-column grid: logo + social, services links, conditions links, hours + contact
- Pull links from emdash menus where possible
- Phone number, address, social media icons
- Copyright line

### Phase 3: Custom Portable Text Blocks

Each block component receives props from the Portable Text content array. The `_type` field routes to the correct component via `MarketingBlocks.astro`.

#### 10. `src/components/blocks/Hero.astro` (Create)
- Props: `headline`, `subheadline`, `primaryCta` (label + url), `secondaryCta`, `videoSrc`, `services[]` (for glassmorphic card), `stats[]` (reviews, metric)
- Layout: CSS Grid 2-column split. Left: text + CTAs. Right: video bg + glass card.
- Animations: staggered fadeUp keyframes on text elements (ported from concepts)
- Responsive: stack to single column at 768px

#### 11. `src/components/blocks/TrustTicker.astro` (Create)
- Props: `items[]` (text + optional icon)
- Infinite CSS animation horizontal scroll
- Duplicate items for seamless loop
- Pause on hover (desktop)

#### 12. `src/components/blocks/ServiceGrid.astro` (Create)
- Props: `headline`, `services[]` (icon, title, description, link)
- CSS Grid: 3x2 on desktop, 2x3 on tablet, 1x6 on mobile
- Card hover: lift + accent shadow
- "Learn more" link per card

#### 13. `src/components/blocks/WhyUs.astro` (Create)
- Props: `items[]` (metric, label, description)
- 3-column grid with large numeric headers (40W, DC+, 357)
- Responsive: stack on mobile

#### 14. `src/components/blocks/TeamSpotlight.astro` (Create)
- Props: `name`, `title`, `image` ({src, alt}), `credentials[]`, `bio`, `facts[]`
- Full-width section with image and text
- Credential tags as pills
- Fact tags (bilingual, private pilot, etc.)

#### 15. `src/components/blocks/Testimonials.astro` (Create)
- Props: `headline`, `reviews[]` (name, text, rating, source)
- 3-card grid (or 1 featured + 2 regular)
- Star rating display
- Source attribution (Google, etc.)

#### 16. `src/components/blocks/InsuranceCTA.astro` (Create)
- Props: `headline`, `subtext`, `ctaLabel`, `ctaUrl`, `insuranceLogos[]`
- Dark background section
- Insurance logo strip
- Large CTA button

#### 17. `src/components/blocks/FAQ.astro` (Create)
- Props: `headline`, `items[]` (question, answer)
- Accordion pattern with expand/collapse
- Client-side JS for toggle (Astro `<script>`)

#### 18. `src/components/blocks/index.ts` (Create)
- Export map: `{ "oss.hero": Hero, "oss.trust-ticker": TrustTicker, ... }`
- Namespaced with `oss.` prefix per emdash convention

#### 19. `src/components/MarketingBlocks.astro` (Create)
- Import block registry from `blocks/index.ts`
- Iterate over Portable Text content array
- Match `_type` → render corresponding component with spread props
- Fallback for unknown block types (render nothing or warning in dev)

### Phase 4: Pages

#### 20. `src/pages/index.astro` (Create)
- Query home page content via emdash Live Collections
- Pass content blocks to `MarketingBlocks.astro`
- Wrap in `Base.astro` layout
- Cache hint for content freshness

#### 21-27. Additional pages
- Standard Astro page pattern: query collection → render with layout
- `services/[slug].astro`: Dynamic route from services collection
- `blog/[slug].astro`: Dynamic route from posts collection (ready for WordPress import)
- All use `Base.astro` layout + `Astro.cache.set()`

### Phase 5: Seed Data & Theme

#### 28. `seed/seed.json` (Create)
- **Collections**: pages, posts, services, conditions
- **Fields per collection**:
  - pages: title, content (Portable Text with custom blocks), excerpt, featured_image
  - posts: title, content, excerpt, featured_image, author
  - services: title, content, icon, short_description
  - conditions: title, content, short_description
- **Taxonomies**: category (for posts), service_type (for services)
- **Menus**: main (nav), footer-services, footer-conditions
- **Custom block definitions**: oss.hero, oss.trust-ticker, oss.service-grid, oss.why-us, oss.team-spotlight, oss.testimonials, oss.insurance-cta, oss.faq
- **Sample content**: Home page with all custom blocks populated with Orlando Spine Studio content from concepts

#### 29-31. Theme CSS files (Create)
- Extract design tokens from each concept:
  - **theme-a.css**: `--accent: #2dd4bf`, `--bg-hero: #0c0f12`, `--font-display: Outfit`, `--font-body: DM Sans`
  - **theme-b.css**: `--accent: #c9a84c`, `--bg-hero: #0f1c2e`, `--font-display: Cormorant Garamond`, `--font-body: DM Sans`
  - **theme-c.css**: `--accent: #2dd4bf`, `--bg-hero: #ffffff`, `--font-display: Outfit`, `--font-body: Inter`
- Each file only defines CSS custom properties — components consume them

#### 32. `src/styles/global.css` (Create)
- CSS reset (minimal)
- Typography scale using `clamp()` (ported from concepts)
- Responsive breakpoints: 768px, 480px
- Shared animations: fadeUp, reveal (Intersection Observer)
- Utility classes: .container (max-width 1440px), .glass (backdrop-filter blur)
- References theme variables (works with any theme file loaded)

### Phase 6: Static Assets

#### 33-36. Asset migration
- Copy `assets/logo/` → `public/logo/`
- Copy `assets/videos/man-outline-spine.mp4` → `public/videos/`
- Copy `assets/images/team/dr-james.webp` → `public/images/team/`
- Copy `favicon.png` → `public/favicon.png`

### Phase 7: Config & Deploy Prep

#### 37. `CLAUDE.md` (Edit)
- Update project description: emdash CMS site for Orlando Spine Studio
- Add emdash CLI commands: `emdash dev`, `emdash types`, `emdash seed`
- Document content model: collections, custom blocks, theme system
- Add admin URL: `http://localhost:4321/_emdash/admin`
- Keep existing hard rules that still apply

#### 38. Agent skills (Create)
- Copy emdash's `.agents/skills/` directory structure
- Skills for: building-emdash-site, emdash-cli, creating-plugins
- These enable AI agents to manage content in future sessions

## Risks

- **emdash is brand new (released 2026-04-01)** — Limited community, potential breaking changes. Mitigation: Pin dependency versions. The MIT license means we can fork if needed. The core (Astro + SQLite) is battle-tested; only the CMS layer is new.

- **Three theme variants add complexity** — Maintaining three CSS files before the client decides. Mitigation: Themes are just CSS custom properties (< 30 lines each). Components consume variables, not hardcoded colors. Dropping two themes later is a one-line change in the layout.

- **Custom Portable Text blocks need admin UI support** — Custom blocks may not have visual editing out of the box. Mitigation: emdash supports custom block definitions in seed schema. Admin renders them as structured forms. Visual inline editing for custom blocks may need the plugin API — defer to Phase 2 if needed.

- **WordPress import data shape mismatch** — 54 blog posts and 101 pages may not map cleanly to emdash's Portable Text format. Mitigation: emdash has `gutenberg-to-portable-text` converter built in. Test with a small export first. The import is deferred to Phase 2 with its own blueprint.

- **Cloudflare deployment requires paid plan ($5/mo)** — Dynamic Workers for plugins need paid Cloudflare account. Mitigation: Development and staging use Node.js + SQLite (free). Cloudflare deployment is a later step. Client pays hosting directly.

## Verification

1. **Scaffold boots**: `npm run dev` starts without errors, admin UI accessible at `localhost:4321/_emdash/admin`
2. **Seed data loads**: `npm run seed` populates collections, home page renders with all custom blocks
3. **Theme switching**: Changing the theme CSS import in Base.astro switches the visual design across all components
4. **Admin editing**: Create/edit a page in the admin UI → changes appear on the frontend
5. **Responsive**: All custom blocks render correctly at desktop (1440px), tablet (768px), and mobile (375px)
6. **Assets load**: Logo, video, and team photo render correctly from public/
7. **Build succeeds**: `npm run build` completes without errors
8. **Typecheck**: `npx astro check` passes

## Checklist

### Phase 1: Scaffold & Config
- [ ] Scaffold emdash project with marketing template
- [ ] Configure astro.config.mjs with SQLite + local storage
- [ ] Verify `npm run dev` boots and admin UI loads

### Phase 2: Layout & Base Components
- [ ] Create Base.astro layout with emdash wiring
- [ ] Create Nav.astro (sticky, blur, mobile hamburger)
- [ ] Create Footer.astro (4-column grid)

### Phase 3: Custom Portable Text Blocks
- [ ] Create Hero.astro (split layout, video, glass card)
- [ ] Create TrustTicker.astro (infinite scroll)
- [ ] Create ServiceGrid.astro (6-card grid)
- [ ] Create WhyUs.astro (3-column metrics)
- [ ] Create TeamSpotlight.astro (Dr. James feature)
- [ ] Create Testimonials.astro (3-card grid)
- [ ] Create InsuranceCTA.astro (dark CTA block)
- [ ] Create FAQ.astro (accordion)
- [ ] Create block index.ts + MarketingBlocks.astro router

### Phase 4: Pages
- [ ] Create index.astro (home page with all blocks)
- [ ] Create contact.astro
- [ ] Create about.astro
- [ ] Create services/index.astro + services/[slug].astro
- [ ] Create blog/index.astro + blog/[slug].astro
- [ ] Create 404.astro

### Phase 5: Seed Data & Theme
- [ ] Write seed.json with full schema + sample content
- [ ] Create theme-a.css, theme-b.css, theme-c.css
- [ ] Create global.css with shared styles + animations

### Phase 6: Static Assets
- [ ] Copy logos, video, team photo, favicon to public/

### Phase 7: Config & Deploy Prep
- [ ] Update CLAUDE.md for emdash project
- [ ] Set up agent skills directory

### Verification
- [ ] All 8 verification scenarios pass
- [ ] Run `npx astro check` after changes
- [ ] Admin UI creates/edits content correctly
- [ ] All three themes render correctly
