# Design Spec — Locked Direction

> Generated artifact. This block is the contract between the approved design and the coding agent.
> All outputs (this spec, the token files, the approved snapshot) derive from one locked Direction object and must not drift.

## How to use this file

You are building a UI for the product below. **This file is the design contract — follow it exactly.** Do not introduce colors, fonts, radii, spacing, or motion that aren't specified here; if something isn't covered, pick the option most consistent with the Hard constraints.

Two companion files ship beside this one:

- `globals.css` — paste its `:root` and `.dark` variables (and the `--db-*` motion vars + `.db-*` utilities) into your app's global stylesheet. Components read these shadcn CSS variables.
- `design-brief.theme.json` — merge its `theme.extend` into your `tailwind.config`.

Target stack: **shadcn/ui + Tailwind**. When a token here conflicts with a library default, the token wins.

## Provenance

| Field | Value |
|---|---|
| Locked direction | `Grain Dark` (`grain-dark`) |
| Personality | premium · technical · bold |
| App types | marketing, brand, app, portfolio |
| Aesthetic | grain-dark |
| Color scheme | dark-first |
| Seeded from | `grain-dark` |
| Remixed | no |
| Target component library | shadcn/ui + Tailwind |

## Design intent (human-readable)

A premium · technical · bold surface. A calm dark interface built around a single lime accent, Comfortable density, and `1px` borders over drop shadows. Numerals use Geist Mono for aligned, tabular reading. If a choice is between "looks impressive" and "reads fast," choose reads fast.

## Design tokens (machine-readable)

```json
{
  "direction": "grain-dark",
  "appTypes": [
    "marketing",
    "brand",
    "app",
    "portfolio"
  ],
  "aesthetic": "grain-dark",
  "colorScheme": "dark-first",
  "color": {
    "accent": {
      "ramp": "lime",
      "primary": "#B6F23D",
      "primaryForeground": "#0A0A0B",
      "hover": "#C8FF5C",
      "muted": "#1A1F12"
    },
    "surface": {
      "base": "#0A0A0B",
      "raised": "#141416",
      "border": "#26262B",
      "texture": "grain",
      "elevation": "border"
    },
    "text": {
      "primary": "#F4F4F5",
      "secondary": "#9A9AA5",
      "accent": "#B6F23D"
    },
    "semantic": {
      "success": "#4ADE80",
      "danger": "#F87171",
      "warning": "#FBBF24"
    }
  },
  "typography": {
    "fontSans": "Geist",
    "fontMono": "Geist Mono",
    "monoUsage": "code, metrics, keyboard shortcuts",
    "baseSize": "15px",
    "scale": [
      13,
      15,
      19,
      28,
      48
    ],
    "weights": [
      400,
      600
    ]
  },
  "shape": {
    "radius": "10px",
    "radiusLarge": "16px",
    "borderWidth": "1px"
  },
  "density": {
    "level": "comfortable",
    "rowHeight": "44px",
    "cellPaddingX": "16px",
    "cellPaddingY": "10px",
    "sectionGap": "28px"
  },
  "motion": {
    "level": "expressive",
    "durationFast": "120ms",
    "durationBase": "260ms",
    "easingStandard": "cubic-bezier(0.2, 0, 0, 1)",
    "easingEntrance": "cubic-bezier(0.16, 1, 0.3, 1)",
    "hover": "glow",
    "press": "scale-down",
    "scrollReveal": "stagger",
    "respectsReducedMotion": true,
    "scroll": {
      "progress": true,
      "parallax": "subtle"
    },
    "kineticText": "rise-words"
  }
}
```

## Tailwind / CSS variable mapping

```css
:root {
  --background: 240 5% 4%;
  --foreground: 240 5% 96%;
  --card: 240 5% 8%;
  --card-foreground: 240 5% 96%;
  --primary: 80 87% 59%;
  --primary-foreground: 240 5% 4%;
  --muted: 83 27% 10%;
  --muted-foreground: 240 6% 63%;
  --border: 240 6% 16%;
  --input: 240 6% 16%;
  --ring: 80 87% 59%;
  --radius: 0.625rem;
}

.dark {
  --background: 240 5% 4%;
  --foreground: 240 5% 96%;
  --card: 240 5% 8%;
  --card-foreground: 240 5% 96%;
  --primary: 80 87% 59%;
  --primary-foreground: 240 5% 4%;
  --muted: 83 27% 10%;
  --muted-foreground: 240 6% 63%;
  --border: 240 6% 16%;
  --input: 240 6% 16%;
  --ring: 80 87% 59%;
  --radius: 0.625rem;
}

:root {
  --db-duration-fast: 120ms;
  --db-duration-base: 260ms;
  --db-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --db-ease-entrance: cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: no-preference) {
  .db-transition {
    transition:
      transform var(--db-duration-base) var(--db-ease-standard),
      opacity var(--db-duration-base) var(--db-ease-standard);
  }
  .db-hover:hover { box-shadow: 0 0 0 1px hsl(var(--ring)), 0 8px 30px -8px hsl(var(--ring)); }
  .db-pressable:active { transform: scale(0.98); }
  .db-reveal {
    opacity: 0;
    animation: db-reveal var(--db-duration-base) var(--db-ease-entrance) forwards;
  }
  @keyframes db-reveal {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: none; }
  }
  .db-stagger > * {
    opacity: 0;
    animation: db-reveal var(--db-duration-base) var(--db-ease-entrance) forwards;
  }
  .db-stagger > *:nth-child(2) { animation-delay: 60ms; }
  .db-stagger > *:nth-child(3) { animation-delay: 120ms; }
  .db-stagger > *:nth-child(4) { animation-delay: 180ms; }
}

.db-grain { position: relative; isolation: isolate; }
.db-grain::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@media (prefers-reduced-motion: no-preference) {
  .db-scroll-progress {
    position: fixed; inset: 0 0 auto 0; height: 3px; z-index: 50;
    transform-origin: 0 50%; background: hsl(var(--primary));
    animation: db-progress auto linear; animation-timeline: scroll(root block);
  }
  @keyframes db-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  .db-parallax {
    animation: db-parallax auto linear; animation-timeline: view(); animation-range: cover;
    will-change: transform;
  }
  @keyframes db-parallax { from { transform: translateY(12px); } to { transform: translateY(-12px); } }
  .db-kinetic > * {
    display: inline-block; opacity: 0;
    animation: db-kinetic var(--db-duration-base) var(--db-ease-entrance) forwards;
  }
  @keyframes db-kinetic { from { opacity: 0; transform: translateY(0.4em); } to { opacity: 1; transform: none; } }
  .db-kinetic > *:nth-child(2) { animation-delay: 80ms; }
  .db-kinetic > *:nth-child(3) { animation-delay: 160ms; }
  .db-kinetic > *:nth-child(4) { animation-delay: 240ms; }
  .db-kinetic > *:nth-child(5) { animation-delay: 320ms; }
}
```

## Install & wiring

1. Copy the `:root` and `.dark` variable block from `globals.css` into your global stylesheet (e.g. `app/globals.css`), keeping your `@tailwind` directives. Keep the design-brief block in its own region so it can be regenerated.
2. Merge `design-brief.theme.json`'s `theme.extend` into your `tailwind.config` (font families, radii, transition tokens, accent/semantic colors).
3. Map shadcn component variables to these CSS variables (`--background`, `--foreground`, `--primary`, `--border`, `--ring`, `--radius`, …) — they are already named to shadcn's convention.
4. Copy the `--db-*` motion vars and `.db-*` utilities for hover/press/reveal; apply the utility classes to interactive elements.

## Hard constraints (agent must honor)

- Dark-first. Do not invert to a light default; a light mode may be added later, but the approved design is dark.
- One accent only. `#B6F23D` is reserved for primary actions and live/changing data. Do not introduce a second accent hue.
- Numerals and tabular data render in `Geist Mono` with `font-variant-numeric: tabular-nums` (code, metrics, keyboard shortcuts).
- Radius never exceeds `16px`. No pill buttons; no rounding beyond the token.
- Borders are `1px`, color `#26262B`. Use borders, not drop shadows, for separation.
- Comfortable density: table rows `44px`. Do not pad out to looser spacing.
- Accessibility floor: text-on-surface contrast >= 4.5:1. Secondary text `#9A9AA5` is intended for use on `#0A0A0B`.

## Do / Don't

**Do**
- Use `--primary` (`#B6F23D`) for the single primary action per view; everything else is a ghost.
- Read every color/space/radius from the CSS variables and Tailwind tokens — never hard-code a hex or px that isn't in the tokens.
- Put numerals, metrics, and code in `Geist Mono`.
- Use the shipped `.db-*` motion utilities; gate motion on `prefers-reduced-motion`.

**Don't**
- Don't add a second accent color, gradient, or shadow style not specified here.
- Don't exceed the radius ceiling (`16px`) or loosen the comfortable density.
- Don't introduce new fonts; use the two specified families.
- Don't animate layout properties (width/height/top/left) or ignore reduced-motion.

## Component scope (build these for this product)

- **Landing / marketing site** (`marketing`):
  - Sticky top nav: logo, a few links, one primary CTA button.
  - Hero: the largest type for a one-line headline, a one-sentence subhead, a primary + a ghost CTA. Reveal on entrance.
  - Feature sections as a bento/asymmetric grid of cards on the raised surface.
  - Social proof band (logos or short testimonials).
  - Footer: secondary nav + a final CTA. One accent throughout.
- **Agency / brand site** (`brand`):
  - Hero with a strong statement and expressive entrance motion.
  - Story/values sections alternating layout; large type.
  - Team and work showcases as cards.
  - Contact section with a primary CTA; footer.
- **General web app** (`app`):
  - App shell: sidebar or top bar + main content area.
  - Forms: labeled inputs at the input token height, primary submit + ghost cancel.
  - Modals/sheets, toasts (semantic colors), empty states.
  - Tables/lists where data is shown; numerals in the mono font.
- **Portfolio / showcase** (`portfolio`):
  - Hero with oversized type and generous whitespace; one accent.
  - Project grid (image-forward cards) leading to case-study pages.
  - Case study: large media, prose, next/prev navigation.
  - Minimal footer with contact links.

## Component guidance (token-level)

- Buttons: solid `--primary` for the single primary action per view; everything else is a `1px` bordered ghost button with transparent fill, hover fills to `--muted`.
- Tables: the primary surface. Header row `--muted-foreground` uppercase 13px; body rows 15px; numeric columns mono + right-aligned.
- Metric cards: label 13px `--muted-foreground` uppercase, value 48px mono `--foreground`, delta in semantic color.
- Inputs: 44px height, `1px` border, focus ring `--primary`, no glow.

## Motion

- Level: **expressive**. Animate ONLY `transform` and `opacity` (never width/height/top/left) to stay 60fps.
- Durations: fast `120ms` (hover/press), base `260ms` (entrances/transitions).
- Easing: `cubic-bezier(0.2, 0, 0, 1)` for state changes, `cubic-bezier(0.16, 1, 0.3, 1)` for entrances/reveals.
- Hover: accent glow ring. Press: scale to 0.98 on press. Scroll reveal: staggered fade-up for child lists.
- ALWAYS wrap motion in `@media (prefers-reduced-motion: no-preference)` with a static fallback. `globals.css` ships ready-made `.db-transition` / `.db-hover` / `.db-pressable` / `.db-reveal` utilities.

### Advanced motion

- Scroll progress: a 3px `--primary` bar fixed at the top, scaled 0→1 with page scroll. Use the shipped `.db-scroll-progress` (CSS `animation-timeline: scroll(root block)`); JS fallback: `scaleX = scrollY / (scrollHeight - innerHeight)`.
- Parallax (**subtle**, ±12px): hero/media drifts slower than scroll via `.db-parallax` (`animation-timeline: view()`). Keep it subtle; never parallax body text.
- Kinetic headline (**rise-words**): wrap each word of the headline in a `<span>` under `.db-kinetic`; words fade + rise with an 80ms stagger.
- All scroll-driven effects must no-op under `prefers-reduced-motion`; the static page must remain fully usable.


## Surface texture

- Texture: **grain**. Apply the exported `.db-grain` overlay for depth on large surfaces; keep it off text and never let it drop contrast below 4.5:1.

## Accessibility

- Contrast: `#F4F4F5` on `#0A0A0B`, and `#0A0A0B` on `#B6F23D`, are intended to meet >= 4.5:1 (>= 3:1 for large text). Use secondary text `#9A9AA5` only at >= 15px.
- Focus: every interactive element shows a visible focus ring in `--ring`; never remove outlines without an equivalent replacement.
- Motion: honor `prefers-reduced-motion` (see Motion). Provide a static, fully-usable fallback.
- Targets: interactive targets are at least the row height (`44px`); on mobile, at least 44px.

## Build it with an AI generator

Hand all three files — this spec, `globals.css`, and `design-brief.theme.json` — to a code generator, with a prompt like:

> Build [what you're building] as a **marketing** using shadcn/ui + Tailwind. Treat `DESIGN_SPEC.md` as the binding design contract: use only its tokens, follow its Hard constraints, Do/Don't, and Component scope, wire `globals.css` and `design-brief.theme.json` exactly as the Install section says, and implement the Motion section while honoring `prefers-reduced-motion`. Do not introduce colors, fonts, radii, spacing, or motion that aren't in this spec.

Tool notes:

- **v0 (Vercel):** speaks shadcn/ui + Tailwind natively — paste the CSS-variable block, the theme JSON, and this spec; generated components inherit the tokens directly.
- **Framer:** map the CSS variables to Framer color/text styles and the radius/spacing tokens to Framer tokens; recreate the Motion section with Framer Motion (use the easing tokens as the spring/bezier values).
- **Claude Code / Cursor / coding agents:** drop the three files into the repo and point the agent at `DESIGN_SPEC.md` — it carries the wiring steps, component scope, and constraints to build from.

## What changed from the seed preset

Locked directly from the `grain-dark` preset with no remix.
