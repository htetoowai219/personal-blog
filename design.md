# Design System & Technical Specifications: Personal Blog
**Theme:** Vintage Aesthetic (Typewriter & Warm Parchment)
**Document Version:** 2.0 (Implemented)
**Stack:** Next.js 16 App Router · Tailwind CSS v4 (`@theme inline`) · `next/font/google`

This document describes the design system **as actually implemented** in the codebase.
The original concept (v1.0) has been adapted to Next.js/Tailwind idioms — token names,
font loading, and component structure below reflect the real source of truth.

---

## 1. Visual & Aesthetic Concept

The interface evokes the tactile, quiet intimacy of an old personal journal: warm
parchment paper, serif typography, faint ink accents, and press-printed headers.

### Key Aesthetic Pillars
- **Warmth & Nostalgia:** Soft cream and sepia tones replace harsh digital whites and dark modes.
- **Tactile Typography:** High-contrast Playfair Display headlines, Lora body copy, Courier Prime typewriter accents.
- **Thoughtful Spacing:** Generous line heights (1.75–1.85), deliberate margins, single-column reading measures.
- **Subtle Craft:** Hairline/dashed borders in aged gold, paper cards with offset "print" shadows, understated lift-on-hover motion, ornamental motifs (`❦`, `✦ ✦ ✦`) used sparingly and always `aria-hidden`.

---

## 2. Color Palette & Tokens

Defined as CSS custom properties in `src/app/globals.css` and exposed to Tailwind via
the `@theme inline` block (utilities like `bg-card`, `text-accent`, `border-border`).

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--background` | `#f5efe6` | Page background (warm parchment) |
| `--foreground` | `#2c2523` | Body text (deep charcoal sepia) |
| `--card` | `#eae2d6` | Cards, code blocks, callouts, blockquotes |
| `--card-hover` | `#e2d7c7` | Card hover state |
| `--border` | `#d8cca6` | Structural dividers, card borders (aged gold) |
| `--muted` | `#6e6259` | Secondary text: meta info, taglines, excerpts |
| `--faint` | `#9e9185` | Captions, placeholders, disabled/tertiary text |
| `--ink` | `#1a1615` | High-impact titles (deep ink black) |
| `--gold` | `#a36b31` | Ornaments, list markers, quote accents |
| `--accent` | `#984b39` | Primary CTA, datelines, active states (terracotta) |
| `--accent-hover` | `#7d3d2e` | CTA hover |
| `--danger` / `--danger-hover` | `#a13c3c` / `#8c3030` | Destructive actions |
| `--input-bg` | `#faf6ee` | Inputs, tags chips (lighter cream) |
| `--input-border` | `#d8cca6` | Input/chip borders |
| `--success` | `#5a7247` | Success states (olive) |

**Mood colors** (used by mood chips; deepened for contrast on parchment):

| Token | Hex | Mood |
| :--- | :--- | :--- |
| `--mood-reflect` | `#4a6b8a` | Reflective 🪞 |
| `--mood-grateful` | `#b3822d` | Grateful 🙏 |
| `--mood-anxious` | `#a84e42` | Anxious 🌊 |
| `--mood-calm` | `#4e7d5b` | Calm 🧘 |
| `--mood-inspired` | `#7d5ba6` | Inspired ✨ |
| `--mood-sad` | `#64748b` | Sad 🌧 |

Selection color: terracotta background with parchment text. `color-scheme: light`;
browser theme color `#f5efe6` (set in `src/app/layout.tsx` viewport export).

---

## 3. Typography & Hierarchy

Fonts are self-hosted via `next/font/google` in `src/app/layout.tsx` and exposed as CSS
variables (zero layout shift, no external requests at runtime):

| Role | Font | Variable | Weights |
| :--- | :--- | :--- | :--- |
| Display / Headings | Playfair Display | `--font-heading` | 400–800 |
| Body / Content | Lora | `--font-body` | 400–700, normal + italic |
| Typewriter / Meta | Courier Prime | `--font-typewriter` | 400, 700 |

Tailwind mappings (`@theme inline`): `font-heading`, `font-sans` (→ Lora), and
`font-mono` (→ Courier Prime). Headings are additionally wired to `--font-heading`
globally in CSS.

### Type Scale
- Entry titles (cards): `text-2xl` · Reader H1: `text-3xl → 2.5rem` · Masthead: `text-4xl/5xl`
- Section headings in prose: 1.25–1.875rem
- Body: `1.0625rem` (17px), line-height `1.75` (prose: `1.85`)
- Meta/datelines/tags: `font-mono text-xs uppercase tracking-[0.15–0.25em]`

---

## 4. Design Components & UI Patterns (as built)

### 4.1 Masthead & Navigation — `src/app/home/page.tsx`
- Centered site title set in `font-heading` (`--ink`), typewriter tagline below:
  `QUIET REFLECTIONS & UNHURRIED THOUGHTS`.
- Ruled nav row beneath with a **dashed bottom border**: italic "Kept by {name}" on
  the left; on the right the primary CTA `+ NEW ENTRY` — a solid terracotta paper button
  (offset print shadow, lifts 1px on hover, the only filled element in the row) — and
  `SIGN OUT` as a faint typewriter link.
- Below the header, the page body uses an **asymmetric two-column grid**
  (`md:grid-cols-[230px_1fr]`, gap 10): a profile sidebar on the left and the entries
  column offset to the right of center (container widened to `max-w-4xl`). Stacks
  vertically on mobile; sidebar is sticky on desktop.

### 4.2 Entry Card (Blog List View) — `src/app/home/page.tsx`
- Paper card: `bg-card`, 1px `--border`, `rounded-[3px]`,
  offset shadow `3px 3px 0 rgba(44,37,35,.05)`.
- Hover: lifts `-2px` with a deeper offset shadow; title transitions to terracotta.
- **Dateline:** pinned indicator + date in typewriter, uppercase, tracked, terracotta.
- Excerpt: 2-line clamp of stripped Markdown in `--muted`.
- Meta row: mood chip (emoji + label in mood color) · tag chips (`bg-input-bg`,
  hairline border, lowercase typewriter).
- Row actions (pin/edit/delete) fade in on hover, top-right.

### 4.3 Reflections & Pull Quotes — `.prose blockquote` in `globals.css`
- Oversized sepia quotation mark (`“`) rendered via `::before` in `--gold` at ~55% opacity.
- Italic text on `--card` background with a 3px `--gold` left rule.

### 4.4 Journal Entry Reader View — `src/app/home/[id]/page.tsx`
- Single centered column, `max-w-[680px]`.
- Typewriter dateline (date · time · mood) above a large ink title.
- **Drop cap** on the opening paragraph via `.article-body > p:first-of-type::first-letter`
  (Playfair Display, terracotta, floated).
- End-of-article decorative motif `✦ ✦ ✦` in `--gold`, followed by a dashed rule and a
  typewriter "← Return to entries" link.

### 4.5 Editors (New / Edit) — `home/new/page.tsx`, `home/[id]/edit/page.tsx`
- Slim header over a dashed rule: back link, Preview toggle (outlined; active = tinted),
  Publish/Update solid terracotta button — all typewriter uppercase.
- Title input: serif, transparent, dashed bottom rule that turns terracotta on focus.
- Mood picker: emoji chips at 50% opacity, full opacity + ring when selected.
- Tags input: lowercase typewriter with dashed underline.
- Writing surface: Lora, `leading-loose`; Preview renders through `.prose`.

### 4.6 Auth Screen — `src/app/auth/auth-client.tsx`
- Centered masthead + paper card with offset shadow.
- Sign In / Create Account as **underline tabs** (typewriter uppercase; terracotta rule).
- Labels: typewriter uppercase micro-caps; inputs on lighter cream with terracotta focus.
- Ornamental `❦` beneath the card (`aria-hidden`).

### 4.7 Brand Assets
- **Favicon** `src/app/icon.svg`: parchment square, aged-gold frame, terracotta pen-nib mark.
- **OG image** `src/app/opengraph-image.tsx`: generated at build time via `next/og`;
  parchment ground, double hairline frame, ink title, italic tagline, gold ornaments.
  (Only glyphs available to satori's bundled font are used — no rare dingbats.)

### 4.8 Empty, Loading & Confirm States
- Loading: pulsing typewriter `LOADING...`.
- Empty list: gold `❦`, serif-italic message, faint hint line.
- Delete confirmation: inline row under a dashed rule — italic question, solid danger
  button ("Yes, remove"), quiet "Keep" dismiss.

### 4.9 Profile Sidebar ("The Keeper") — `src/app/home/page.tsx`
Paper card in the left grid column (see 4.1), sticky on desktop:
- Eyebrow label `THE KEEPER` in terracotta typewriter micro-caps.
- Name in Playfair Display (`--ink`) — `displayName` if set, else username.
- Optional italic bio paragraph in `--muted`.
- Detail rows under a dashed rule, typewriter labels + values: `LOCATION`,
  `JOURNALING SINCE` (derived from account creation date); empty values render `—`.
- `✎ EDIT PROFILE` toggles an inline edit form inside the same card: Name / Location /
  About inputs (cream fields, terracotta focus) with Save (solid terracotta) and Cancel.
- Backed by `GET/PATCH /api/auth/me`; profile fields are optional and length-capped
  server-side (name 60, location 60, bio 280 chars).

---

## 5. Core CSS Reference (`globals.css` excerpts)

```css
/* Drop cap on the opening paragraph of an entry */
.article-body > p:first-of-type::first-letter {
  font-family: var(--font-heading), Georgia, serif;
  font-size: 3.4em;
  float: left;
  line-height: 0.82;
  padding: 0.06em 0.14em 0 0;
  font-weight: 600;
  color: var(--accent);
}

/* Pull quotes */
.prose blockquote {
  position: relative;
  font-style: italic;
  background: var(--card);
  border-left: 3px solid var(--gold);
  margin: 2rem 0;
  padding: 1rem 1.25rem 1rem 3.25rem;
  color: var(--muted);
}
.prose blockquote::before {
  content: "\201C";
  position: absolute;
  left: 0.7rem;
  top: 0.3rem;
  font-family: var(--font-heading), Georgia, serif;
  font-size: 3.25rem;
  line-height: 1;
  color: var(--gold);
  opacity: 0.55;
}
```

Other prose conventions: links terracotta with hairline underline (`text-underline-offset: 3px`);
inline code in Courier Prime on cream with a hairline border; `pre` blocks get paper cards
with offset shadows; `<hr>` renders as a short dashed rule; ordered/unordered markers in gold;
table headers on `--card`; strong text in `--ink`.

---

## 6. Motion & Interaction Rules

- Transitions limited to `color`, `opacity`, `transform`, `box-shadow`, `border-color` (~150–200ms ease).
- Cards lift with increased offset shadow; nothing scales or bounces.
- Focus indication = border-color shift to terracotta (no default outlines).
- Hover-revealed controls (row actions) always remain keyboard-accessible via tab order.

## 7. Accessibility Notes

- Ornaments/motifs (`❦`, `✦ ✦ ✦`, decorative dots) carry `aria-hidden`.
- All icon-only buttons have `title` attributes; pinned state announced via `aria-label`.
- Text contrast: body `#2c2523` on `#f5efe6` ≈ 12.9:1; muted `#6e6259` on parchment ≈ 5.6:1; both pass WCAG AA.

---

## 8. File Map

| Concern | File |
| :--- | :--- |
| Tokens + prose/component CSS | `src/app/globals.css` |
| Font loading, theme color, metadata | `src/app/layout.tsx` |
| Masthead, entry cards, empty/loading states | `src/app/home/page.tsx` |
| Reader view (drop cap, motif, dateline) | `src/app/home/[id]/page.tsx` |
| Editor chrome | `src/app/home/new/page.tsx`, `src/app/home/[id]/edit/page.tsx` |
| Auth screen | `src/app/auth/auth-client.tsx` |
| Favicon | `src/app/icon.svg` |
| Social card | `src/app/opengraph-image.tsx` |
| Mood token references | `src/lib/utils.ts` (`MOODS`) |
