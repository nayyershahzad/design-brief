# Design Spec — Locked Direction

> Generated artifact. This block is the contract between the client-approved design and the coding agent.
> All three outputs (this spec, the token files, the approved snapshot) derive from one locked Direction object and must not drift.

## Provenance

| Field | Value |
|---|---|
| Project | RehnumaRent · admin dashboard |
| Locked direction | `Terminal` |
| Personality | precise · dense · technical |
| Client status | Approved (snapshot link on file) |
| Target component library | shadcn/ui + Tailwind |
| Generated | from brief + seed preset, AI-remixed |

## Design intent (human-readable)

Build a power-user admin surface. Information density is a feature, not a flaw — operators live in this screen all day and value seeing more at once over breathing room. The aesthetic is a calm dark terminal: monospace numerals, a single electric-indigo accent reserved for primary actions and live data, restrained chrome. Nothing decorative. If a choice is between "looks impressive" and "reads fast," choose reads fast.

Do not soften this into a generic friendly SaaS look — no large radii, no pastel fills, no oversized hero spacing. The client signed off specifically on the dense terminal direction.

## Design tokens (machine-readable)

```json
{
  "direction": "terminal",
  "colorScheme": "dark-first",
  "color": {
    "accent": { "ramp": "indigo", "primary": "#5B4DF5", "primaryForeground": "#FFFFFF", "hover": "#7B6FFF", "muted": "#1C1C30" },
    "surface": { "base": "#0E0E1A", "raised": "#15152A", "border": "#2A2A40" },
    "text": { "primary": "#EDEDFF", "secondary": "#7A7AB0", "accent": "#7B6FFF" },
    "semantic": { "success": "#3DDC97", "danger": "#FF6B6B", "warning": "#EF9F27" }
  },
  "typography": {
    "fontSans": "Inter",
    "fontMono": "JetBrains Mono",
    "monoUsage": "all numerals, metrics, tabular data, code",
    "baseSize": "13px",
    "scale": [11, 13, 16, 20, 28],
    "weights": [400, 500]
  },
  "shape": {
    "radius": "6px",
    "radiusLarge": "8px",
    "borderWidth": "0.5px"
  },
  "density": {
    "level": "compact",
    "rowHeight": "32px",
    "cellPaddingX": "10px",
    "cellPaddingY": "6px",
    "sectionGap": "12px"
  }
}
```

## Tailwind / CSS variable mapping

```css
:root {
  --background: 240 33% 8%;        /* #0E0E1A */
  --foreground: 240 100% 96%;      /* #EDEDFF */
  --card: 240 31% 12%;             /* #15152A */
  --border: 240 22% 21%;           /* #2A2A40 */
  --primary: 245 89% 63%;          /* #5B4DF5 */
  --primary-foreground: 0 0% 100%;
  --muted: 240 28% 14%;            /* #1C1C30 */
  --muted-foreground: 240 24% 59%; /* #7A7AB0 */
  --radius: 0.375rem;              /* 6px */
}
```

## Hard constraints (agent must honor)

- Dark-first. Do not invert to a light default; a light mode may be added later but the design was approved in dark.
- One accent only. `#5B4DF5` is reserved for primary actions and live/changing data. Do not introduce a second accent hue.
- All numbers render in `JetBrains Mono` with tabular figures (`font-variant-numeric: tabular-nums`) so columns align.
- Radius never exceeds `8px`. No pill buttons, no rounded cards beyond the token.
- Borders are `0.5px`, color `#2A2A40`. No drop shadows for separation — use borders.
- Compact density: table rows `32px`, do not pad out to comfortable spacing.
- Accessibility floor: text-on-surface contrast ≥ 4.5:1 (verified for `#EDEDFF` on `#0E0E1A`); `#7A7AB0` secondary text only on `#0E0E1A`, never on `#15152A`.

## Component guidance

- Buttons: solid `--primary` for the single primary action per view; everything else is a `0.5px` bordered ghost button with transparent fill, hover fills to `--muted`.
- Tables: the primary surface. Header row `--muted-foreground` uppercase 11px; body rows 13px; numeric columns mono + right-aligned.
- Metric cards: label 11px `--muted-foreground` uppercase, value 28px mono `--foreground`, delta in semantic color.
- Inputs: 32px height, `0.5px` border, focus ring `--primary` at 2px, no glow.

## What changed from the seed preset

The seed was a generic dark dashboard preset. AI remix narrowed it to: single indigo accent (preset had two), mono numerals everywhere (preset used mono only for code), and compact 32px rows (preset was 40px comfortable). These three deltas are what the client reacted to and approved.
