# Design Spec — Locked Direction

> Generated artifact. This block is the contract between the approved design and the coding agent.
> All outputs (this spec, the token files, the approved snapshot) derive from one locked Direction object and must not drift.

## How to use this file

You are building a UI for the product below. **This file is the design contract — follow it exactly.** Do not introduce colors, fonts, radii, spacing, or motion that aren't specified here; if something isn't covered, pick the option most consistent with the Hard constraints.

Two companion files ship beside this one:

- `globals.css` — paste its `:root` variables (and the `--db-*` motion vars + `.db-*` utilities) into your app's global stylesheet. Components read these shadcn CSS variables.
- `design-brief.theme.json` — merge its `theme.extend` into your `tailwind.config`.

Target stack: **shadcn/ui + Tailwind**. When a token here conflicts with a library default, the token wins.

## Provenance

| Field | Value |
|---|---|
| Locked direction | `Clean Teal` (`clean-teal`) |
| Personality | clean · calm · modern |
| App types | app, dashboard, marketing |
| Aesthetic | minimal |
| Color scheme | light-first |
| Seeded from | `clean-teal` |
| Remixed | no |
| Target component library | shadcn/ui + Tailwind |

## Design intent (human-readable)

A clean · calm · modern surface. A clean light interface built around a single teal accent, Balanced density, and `1px` borders over drop shadows. Numerals use IBM Plex Mono for aligned, tabular reading. If a choice is between "looks impressive" and "reads fast," choose reads fast.

## Design tokens (machine-readable)

```json
{
  "direction": "clean-teal",
  "appTypes": [
    "app",
    "dashboard",
    "marketing"
  ],
  "aesthetic": "minimal",
  "colorScheme": "light-first",
  "color": {
    "accent": {
      "ramp": "teal",
      "primary": "#0CA678",
      "primaryForeground": "#FFFFFF",
      "hover": "#12B886",
      "muted": "#E6FCF5"
    },
    "surface": {
      "base": "#FFFFFF",
      "raised": "#F6F9F8",
      "border": "#DDE6E3",
      "elevation": "shadow"
    },
    "text": {
      "primary": "#1A2421",
      "secondary": "#5C6B66",
      "accent": "#0CA678"
    },
    "semantic": {
      "success": "#0CA678",
      "danger": "#E03131",
      "warning": "#F59F00"
    }
  },
  "typography": {
    "fontSans": "Inter",
    "fontMono": "IBM Plex Mono",
    "monoUsage": "numerals and code",
    "baseSize": "14px",
    "scale": [
      12,
      14,
      17,
      22,
      30
    ],
    "weights": [
      400,
      500
    ]
  },
  "shape": {
    "radius": "8px",
    "radiusLarge": "12px",
    "borderWidth": "1px"
  },
  "density": {
    "level": "balanced",
    "rowHeight": "40px",
    "cellPaddingX": "12px",
    "cellPaddingY": "8px",
    "sectionGap": "16px"
  },
  "motion": {
    "level": "subtle",
    "durationFast": "120ms",
    "durationBase": "220ms",
    "easingStandard": "cubic-bezier(0.2, 0, 0, 1)",
    "easingEntrance": "cubic-bezier(0.16, 1, 0.3, 1)",
    "hover": "lift",
    "press": "scale-down",
    "scrollReveal": "fade-up",
    "respectsReducedMotion": true
  }
}
```

## Tailwind / CSS variable mapping

```css
:root {
  --background: 0 0% 100%;
  --foreground: 162 16% 12%;
  --card: 160 20% 97%;
  --card-foreground: 162 16% 12%;
  --primary: 162 87% 35%;
  --primary-foreground: 0 0% 100%;
  --muted: 161 79% 95%;
  --muted-foreground: 160 8% 39%;
  --border: 160 15% 88%;
  --input: 160 15% 88%;
  --ring: 162 87% 35%;
  --radius: 0.5rem;
}

:root {
  --db-duration-fast: 120ms;
  --db-duration-base: 220ms;
  --db-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --db-ease-entrance: cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: no-preference) {
  .db-transition {
    transition:
      transform var(--db-duration-base) var(--db-ease-standard),
      opacity var(--db-duration-base) var(--db-ease-standard);
  }
  .db-hover:hover { transform: translateY(-2px); }
  .db-pressable:active { transform: scale(0.98); }
  .db-reveal {
    opacity: 0;
    animation: db-reveal var(--db-duration-base) var(--db-ease-entrance) forwards;
  }
  @keyframes db-reveal {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: none; }
  }
}
```

## Install & wiring

1. Copy the `:root` variable block from `globals.css` into your global stylesheet (e.g. `app/globals.css`), keeping your `@tailwind` directives. Keep the design-brief block in its own region so it can be regenerated.
2. Merge `design-brief.theme.json`'s `theme.extend` into your `tailwind.config` (font families, radii, transition tokens, accent/semantic colors).
3. Map shadcn component variables to these CSS variables (`--background`, `--foreground`, `--primary`, `--border`, `--ring`, `--radius`, …) — they are already named to shadcn's convention.
4. Copy the `--db-*` motion vars and `.db-*` utilities for hover/press/reveal; apply the utility classes to interactive elements.

## Hard constraints (agent must honor)

- Light-first. The approved design is light; a dark mode may be added later via the `.dark` block.
- One accent only. `#0CA678` is reserved for primary actions and live/changing data. Do not introduce a second accent hue.
- Numerals and tabular data render in `IBM Plex Mono` with `font-variant-numeric: tabular-nums` (numerals and code).
- Radius never exceeds `12px`. No pill buttons; no rounding beyond the token.
- Separation via soft shadows is intended (`elevation: shadow`); keep the `1px` `#DDE6E3` border subtle.
- Balanced density: table rows `40px`. Do not pad out to looser spacing.
- Accessibility floor: text-on-surface contrast >= 4.5:1. Secondary text `#5C6B66` is intended for use on `#FFFFFF`.

## Do / Don't

**Do**
- Use `--primary` (`#0CA678`) for the single primary action per view; everything else is a ghost.
- Read every color/space/radius from the CSS variables and Tailwind tokens — never hard-code a hex or px that isn't in the tokens.
- Put numerals, metrics, and code in `IBM Plex Mono`.
- Use the shipped `.db-*` motion utilities; gate motion on `prefers-reduced-motion`.

**Don't**
- Don't add a second accent color, gradient, or shadow style not specified here.
- Don't exceed the radius ceiling (`12px`) or loosen the balanced density.
- Don't introduce new fonts; use the two specified families.
- Don't animate layout properties (width/height/top/left) or ignore reduced-motion.

## Component scope (build these for this product)

- **General web app** (`app`):
  - App shell: sidebar or top bar + main content area.
  - Forms: labeled inputs at the input token height, primary submit + ghost cancel.
  - Modals/sheets, toasts (semantic colors), empty states.
  - Tables/lists where data is shown; numerals in the mono font.
- **Dashboard / admin** (`dashboard`):
  - Metric cards: label (uppercase, secondary), value (mono, largest), delta in a semantic color.
  - Data tables: header row in muted-foreground, body rows at row-height, numeric columns mono + right-aligned.
  - Filter/toolbar row with ghost controls and one primary action.
  - Charts use the accent for the primary series and semantic colors for status.
- **Landing / marketing site** (`marketing`):
  - Sticky top nav: logo, a few links, one primary CTA button.
  - Hero: the largest type for a one-line headline, a one-sentence subhead, a primary + a ghost CTA. Reveal on entrance.
  - Feature sections as a bento/asymmetric grid of cards on the raised surface.
  - Social proof band (logos or short testimonials).
  - Footer: secondary nav + a final CTA. One accent throughout.

## Component guidance (token-level)

- Buttons: solid `--primary` for the single primary action per view; everything else is a `1px` bordered ghost button with transparent fill, hover fills to `--muted`.
- Tables: the primary surface. Header row `--muted-foreground` uppercase 12px; body rows 14px; numeric columns mono + right-aligned.
- Metric cards: label 12px `--muted-foreground` uppercase, value 30px mono `--foreground`, delta in semantic color.
- Inputs: 40px height, `1px` border, focus ring `--primary`, no glow.

## Motion

- Level: **subtle**. Animate ONLY `transform` and `opacity` (never width/height/top/left) to stay 60fps.
- Durations: fast `120ms` (hover/press), base `220ms` (entrances/transitions).
- Easing: `cubic-bezier(0.2, 0, 0, 1)` for state changes, `cubic-bezier(0.16, 1, 0.3, 1)` for entrances/reveals.
- Hover: lift 2px (translateY(-2px)). Press: scale to 0.98 on press. Scroll reveal: fade + 10px rise on enter.
- ALWAYS wrap motion in `@media (prefers-reduced-motion: no-preference)` with a static fallback. `globals.css` ships ready-made `.db-transition` / `.db-hover` / `.db-pressable` / `.db-reveal` utilities.

## Accessibility

- Contrast: `#1A2421` on `#FFFFFF`, and `#FFFFFF` on `#0CA678`, are intended to meet >= 4.5:1 (>= 3:1 for large text). Use secondary text `#5C6B66` only at >= 14px.
- Focus: every interactive element shows a visible focus ring in `--ring`; never remove outlines without an equivalent replacement.
- Motion: honor `prefers-reduced-motion` (see Motion). Provide a static, fully-usable fallback.
- Targets: interactive targets are at least the row height (`40px`); on mobile, at least 44px.

## What changed from the seed preset

Locked directly from the `clean-teal` preset with no remix.
