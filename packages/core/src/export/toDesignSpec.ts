import type { Direction, AppType } from "../schema.js";
import { auditDirection } from "../util/audit.js";
import { hueName } from "../util/color.js";
import { toShadcnCss } from "./toShadcnCss.js";

function cap(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Per-app-type component scope. Tells the agent WHICH screens/components to
 * build for this kind of product, so the spec isn't dashboard-flavored for
 * everything. Keyed by AppType; only the direction's own appTypes are emitted.
 */
const APP_TYPE_SCOPE: Record<AppType, { summary: string; components: string[] }> = {
  marketing: {
    summary: "Landing / marketing site",
    components: [
      "Sticky top nav: logo, a few links, one primary CTA button.",
      "Hero: the largest type for a one-line headline, a one-sentence subhead, a primary + a ghost CTA. Reveal on entrance.",
      "Feature sections as a bento/asymmetric grid of cards on the raised surface.",
      "Social proof band (logos or short testimonials).",
      "Footer: secondary nav + a final CTA. One accent throughout.",
    ],
  },
  commerce: {
    summary: "E-commerce storefront",
    components: [
      "Product grid of cards: image, title, price in the mono font, add-to-cart as the primary action.",
      "Filters/facets in a sidebar or toolbar using ghost controls.",
      "Product detail: gallery, price (mono), quantity, primary buy button, secondary actions as ghosts.",
      "Cart drawer/sheet; checkout steps with clear primary progression.",
    ],
  },
  content: {
    summary: "Content / blog / editorial",
    components: [
      "Article header: title at the largest scale, byline/meta in secondary text.",
      "Prose body at a readable measure (~66–75ch), generous line-height; headings step down the type scale.",
      "Inline code and pull-quotes in the mono font; links in the accent.",
      "Related-posts cards and a footer.",
    ],
  },
  docs: {
    summary: "Documentation / knowledge base",
    components: [
      "Left sidebar nav (sectioned, current item in the accent), optional right-hand on-page TOC.",
      "Content column: prose + headings, code blocks in the mono font on the raised surface.",
      "Callouts (note/warning/danger) using the semantic colors.",
      "A search input at the top using the standard input token.",
    ],
  },
  app: {
    summary: "General web app",
    components: [
      "App shell: sidebar or top bar + main content area.",
      "Forms: labeled inputs at the input token height, primary submit + ghost cancel.",
      "Modals/sheets, toasts (semantic colors), empty states.",
      "Tables/lists where data is shown; numerals in the mono font.",
    ],
  },
  dashboard: {
    summary: "Dashboard / admin",
    components: [
      "Metric cards: label (uppercase, secondary), value (mono, largest), delta in a semantic color.",
      "Data tables: header row in muted-foreground, body rows at row-height, numeric columns mono + right-aligned.",
      "Filter/toolbar row with ghost controls and one primary action.",
      "Charts use the accent for the primary series and semantic colors for status.",
    ],
  },
  mobile: {
    summary: "Mobile app",
    components: [
      "Single-column layout; bottom tab bar or top app bar for navigation.",
      "Tap targets at least 44px tall (raise the row-height token if needed).",
      "Bottom sheets instead of modals; large primary actions.",
      "Lists and cards stack vertically with comfortable spacing.",
    ],
  },
  portfolio: {
    summary: "Portfolio / showcase",
    components: [
      "Hero with oversized type and generous whitespace; one accent.",
      "Project grid (image-forward cards) leading to case-study pages.",
      "Case study: large media, prose, next/prev navigation.",
      "Minimal footer with contact links.",
    ],
  },
  brand: {
    summary: "Agency / brand site",
    components: [
      "Hero with a strong statement and expressive entrance motion.",
      "Story/values sections alternating layout; large type.",
      "Team and work showcases as cards.",
      "Contact section with a primary CTA; footer.",
    ],
  },
};

/**
 * Emit DESIGN_SPEC.md: the human- AND agent-readable contract a coding agent
 * builds against. Everything is derived from the Direction so it can never
 * drift from the CSS/Tailwind exports. Deterministic — no timestamps.
 */
export function toDesignSpec(d: Direction): string {
  const p = d.provenance;
  const personality = d.personality.join(" · ");
  const dark = d.colorScheme === "dark-first";
  const m = d.motion;
  const elevation = d.color.surface.elevation ?? "border";
  const texture = d.color.surface.texture ?? "none";

  const hoverDesc: Record<typeof m.hover, string> = {
    none: "no hover transform",
    lift: "lift 2px (translateY(-2px))",
    scale: "scale to 1.02",
    glow: "accent glow ring",
  };
  const revealDesc: Record<typeof m.scrollReveal, string> = {
    none: "no scroll reveal",
    fade: "fade in on enter",
    "fade-up": "fade + 10px rise on enter",
    stagger: "staggered fade-up for child lists",
  };
  const pressDesc = m.press === "scale-down" ? "scale to 0.98 on press" : "no press transform";

  const motionSection =
    m.level === "none"
      ? "No motion. Render everything static — no transitions, hovers, or scroll reveals."
      : [
          `- Level: **${m.level}**. Animate ONLY \`transform\` and \`opacity\` (never width/height/top/left) to stay 60fps.`,
          `- Durations: fast \`${m.durationFast}\` (hover/press), base \`${m.durationBase}\` (entrances/transitions).`,
          `- Easing: \`${m.easingStandard}\` for state changes, \`${m.easingEntrance}\` for entrances/reveals.`,
          `- Hover: ${hoverDesc[m.hover]}. Press: ${pressDesc}. Scroll reveal: ${revealDesc[m.scrollReveal]}.`,
          ...(m.scrollReveal !== "none"
            ? [
                "- Reveal timing: `.db-reveal` / `.db-stagger` animate when the element ENTERS the viewport — so above-the-fold content animates on mount, which is intended. For strictly-on-scroll behavior, trigger via an IntersectionObserver threshold instead of on load.",
              ]
            : []),
          "- ALWAYS wrap motion in `@media (prefers-reduced-motion: no-preference)` with a static fallback. `globals.css` ships ready-made `.db-transition` / `.db-hover` / `.db-pressable` / `.db-reveal` utilities.",
        ].join("\n");

  const advLines: string[] = [];
  if (m.scroll?.progress)
    advLines.push(
      "- Scroll progress: a 3px `--primary` bar fixed at the top, scaled 0→1 with page scroll. Use the shipped `.db-scroll-progress` (CSS `animation-timeline: scroll(root block)`); JS fallback: `scaleX = scrollY / (scrollHeight - innerHeight)`.",
    );
  if (m.scroll && m.scroll.parallax !== "none") {
    const depth = m.scroll.parallax === "bold" ? "40px" : "12px";
    advLines.push(
      `- Parallax (**${m.scroll.parallax}**, ±${depth}): hero/media drifts slower than scroll via \`.db-parallax\` (\`animation-timeline: view()\`). Keep it subtle; never parallax body text.`,
    );
  }
  if (m.kineticText && m.kineticText !== "none") {
    const k = m.kineticText;
    const how =
      k === "shimmer"
        ? "apply `.db-kinetic-shimmer` to the headline — an accent highlight sweeps across the text."
        : k === "rise-words"
          ? "wrap each word of the headline in a `<span>` under `.db-kinetic`; words fade + rise with an 80ms stagger."
          : "wrap each character of the headline in a `<span>` under `.db-kinetic`; characters fade in with a 40ms stagger.";
    advLines.push(`- Kinetic headline (**${k}**): ${how}`);
  }
  const advancedMotionSection =
    advLines.length === 0
      ? ""
      : `\n### Advanced motion\n\n${advLines.join("\n")}\n- All scroll-driven effects must no-op under \`prefers-reduced-motion\`; the static page must remain fully usable.\n`;

  const textureSection =
    texture === "none"
      ? ""
      : `\n## Surface texture\n\n- Texture: **${texture}**. Apply the exported \`.db-grain\` overlay for depth on large surfaces; keep it off text and never let it drop contrast below 4.5:1.\n`;

  const tokenJson = JSON.stringify(
    {
      direction: d.id,
      appTypes: d.appTypes,
      aesthetic: d.aesthetic,
      colorScheme: d.colorScheme,
      color: d.color,
      typography: d.typography,
      shape: d.shape,
      density: d.density,
      motion: d.motion,
    },
    null,
    2,
  );

  const scaleSmall = d.typography.scale[0] ?? 11;
  const scaleBody = d.typography.scale[1] ?? 13;
  const scaleLarge = d.typography.scale[d.typography.scale.length - 1] ?? 28;

  const constraints: string[] = [
    dark
      ? "Dark-first. Do not invert to a light default; a light mode may be added later, but the approved design is dark."
      : "Light-first. The approved design is light; a dark mode may be added later via the `.dark` block.",
    `One accent only. \`${d.color.accent.primary}\` is reserved for primary actions and live/changing data. Do not introduce a second accent hue.`,
    `Numerals and tabular data render in \`${d.typography.fontMono}\` with \`font-variant-numeric: tabular-nums\` (${d.typography.monoUsage}).`,
    `Radius never exceeds \`${d.shape.radiusLarge}\`. No pill buttons; no rounding beyond the token.`,
    elevation === "shadow"
      ? `Separation via soft shadows is intended (\`elevation: shadow\`); keep the \`${d.shape.borderWidth}\` \`${d.color.surface.border}\` border subtle.`
      : elevation === "flat"
        ? `Flat surfaces (\`elevation: flat\`) — separate with spacing and the \`${d.color.surface.border}\` border, not shadows.`
        : `Borders are \`${d.shape.borderWidth}\`, color \`${d.color.surface.border}\`. Use borders, not drop shadows, for separation.`,
    `${cap(d.density.level)} density: table rows \`${d.density.rowHeight}\`. Do not pad out to looser spacing.`,
    `Accessibility floor: every text/surface pair must meet WCAG AA (>= 4.5:1 normal, >= 3:1 large). See the Accessibility section for the computed per-pair ratios for THIS design — do not ship a pair marked below floor.`,
  ];

  const componentScope = Array.from(new Set(d.appTypes))
    .map((t) => {
      const scope = APP_TYPE_SCOPE[t];
      const items = scope.components.map((c) => `  - ${c}`).join("\n");
      return `- **${scope.summary}** (\`${t}\`):\n${items}`;
    })
    .join("\n");

  const dos = [
    `Use \`--primary\` (\`${d.color.accent.primary}\`) for the single primary action per view; everything else is a ghost.`,
    `Read every color/space/radius from the CSS variables and Tailwind tokens — never hard-code a hex or px that isn't in the tokens.`,
    `Put numerals, metrics, and code in \`${d.typography.fontMono}\`.`,
    m.level === "none"
      ? "Keep the UI static — this direction specifies no motion."
      : "Use the shipped `.db-*` motion utilities; gate motion on `prefers-reduced-motion`.",
  ];
  const donts = [
    "Don't add a second accent color, gradient, or shadow style not specified here.",
    `Don't exceed the radius ceiling (\`${d.shape.radiusLarge}\`) or loosen the ${d.density.level} density.`,
    "Don't introduce new fonts; use the two specified families.",
    "Don't animate layout properties (width/height/top/left) or ignore reduced-motion.",
  ];

  const changed =
    p.notes && p.notes.trim().length > 0
      ? p.notes.trim()
      : p.remixed
        ? `Remixed from the \`${p.seededFrom}\` preset.`
        : `Locked directly from the \`${p.seededFrom}\` preset with no remix.`;

  // Computed contrast — REAL numbers measured from the emitted tokens, never an
  // asserted claim. AI-remixed / hand-tweaked directions can fail here.
  const audit = auditDirection(d);
  const contrastRows = audit.checks
    .map(
      (c) =>
        `- ${c.pass ? "✅" : "❌"} ${c.label}: \`${c.fg}\` on \`${c.bg}\` = **${c.ratio.toFixed(2)}:1** (needs >= ${c.floor}:1${c.severity === "info" ? ", informational — decorative borders are intentionally subtle" : ""})`,
    )
    .join("\n");
  const contrastVerdict =
    audit.failures.length === 0
      ? "All enforced text pairs meet WCAG AA. Ratios below were computed from the final tokens, not asserted."
      : `⚠️ **${audit.failures.length} pair(s) fail WCAG AA — fix the tokens before shipping.** This design is NOT accessible as-is; darken/lighten the offending colors (or override them) until every enforced pair is >= 4.5:1:`;

  const primaryAppType = d.appTypes[0] ?? "app";
  const otherAppTypes = Array.from(new Set(d.appTypes)).filter((t) => t !== primaryAppType);
  const handoffSection = `## Build it with an AI generator

Hand all three files — this spec, \`globals.css\`, and \`design-brief.theme.json\` — to a code generator, with a prompt like:

> Build [what you're building] as a **${primaryAppType}**${otherAppTypes.length ? ` (this direction also fits ${otherAppTypes.join(", ")} — swap in the one you're actually building; see Component scope)` : ""} using shadcn/ui + Tailwind. Treat \`DESIGN_SPEC.md\` as the binding design contract: use only its tokens, follow its Hard constraints, Do/Don't, and Component scope, wire \`globals.css\` and \`design-brief.theme.json\` exactly as the Install section says, and implement the Motion section while honoring \`prefers-reduced-motion\`. Do not introduce colors, fonts, radii, spacing, or motion that aren't in this spec.

Tool notes:

- **v0 (Vercel):** speaks shadcn/ui + Tailwind natively — paste the CSS-variable block, the theme JSON, and this spec; generated components inherit the tokens directly.
- **Framer:** map the CSS variables to Framer color/text styles and the radius/spacing tokens to Framer tokens; recreate the Motion section with Framer Motion (use the easing tokens as the spring/bezier values).
- **Claude Code / Cursor / coding agents:** drop the three files into the repo and point the agent at \`DESIGN_SPEC.md\` — it carries the wiring steps, component scope, and constraints to build from.`;

  return `# Design Spec — Locked Direction

> Generated artifact. This block is the contract between the approved design and the coding agent.
> All outputs (this spec, the token files, the approved snapshot) derive from one locked Direction object and must not drift.

## How to use this file

You are building a UI for the product below. **This file is the design contract — follow it exactly.** Do not introduce colors, fonts, radii, spacing, or motion that aren't specified here; if something isn't covered, pick the option most consistent with the Hard constraints.

Two companion files ship beside this one:

- \`globals.css\` — paste its \`:root\`${dark ? " and `.dark`" : ""} variables (and the \`--db-*\` motion vars + \`.db-*\` utilities) into your app's global stylesheet. Components read these shadcn CSS variables.
- \`design-brief.theme.json\` — merge its \`theme.extend\` into your \`tailwind.config\`.

Target stack: **shadcn/ui + Tailwind**. When a token here conflicts with a library default, the token wins.

## Provenance

| Field | Value |
|---|---|
| Locked direction | \`${d.label}\` (\`${d.id}\`) |
| Personality | ${personality} |
| App types | ${d.appTypes.join(", ")} |
| Aesthetic | ${d.aesthetic ?? "—"} |
| Color scheme | ${d.colorScheme} |
| Seeded from | \`${p.seededFrom}\` |
| Remixed | ${p.remixed ? "yes" : "no"} |
| Target component library | shadcn/ui + Tailwind |

## Design intent (human-readable)

A ${personality} surface. ${dark ? "A calm dark interface" : "A clean light interface"} built around a single ${hueName(
    d.color.accent.primary,
  )} accent (\`${d.color.accent.primary}\`), ${cap(d.density.level)} density, and \`${d.shape.borderWidth}\` borders over drop shadows. Numerals use ${
    d.typography.fontMono
  } for aligned, tabular reading. If a choice is between "looks impressive" and "reads fast," choose reads fast.

## Design tokens (machine-readable)

\`\`\`json
${tokenJson}
\`\`\`

## Tailwind / CSS variable mapping

\`\`\`css
${toShadcnCss(d).trimEnd()}
\`\`\`

## Install & wiring

1. Copy the \`:root\`${dark ? " and `.dark`" : ""} variable block from \`globals.css\` into your global stylesheet (e.g. \`app/globals.css\`), keeping your \`@tailwind\` directives. Keep the design-brief block in its own region so it can be regenerated.
2. Merge \`design-brief.theme.json\`'s \`theme.extend\` into your \`tailwind.config\` (font families, radii, transition tokens, accent/semantic colors).
3. Map shadcn component variables to these CSS variables (\`--background\`, \`--foreground\`, \`--primary\`, \`--border\`, \`--ring\`, \`--radius\`, …) — they are already named to shadcn's convention.
4. Copy the \`--db-*\` motion vars and \`.db-*\` utilities for hover/press/reveal; apply the utility classes to interactive elements.

## Hard constraints (agent must honor)

${constraints.map((c) => `- ${c}`).join("\n")}

## Do / Don't

**Do**
${dos.map((c) => `- ${c}`).join("\n")}

**Don't**
${donts.map((c) => `- ${c}`).join("\n")}

## Component scope (build these for this product)

${componentScope}

## Component guidance (token-level)

- Buttons: solid \`--primary\` for the single primary action per view; everything else is a \`${
    d.shape.borderWidth
  }\` bordered ghost button with transparent fill, hover fills to \`--muted\`.
- Tables: the primary surface. Header row \`--muted-foreground\` uppercase ${scaleSmall}px; body rows ${scaleBody}px; numeric columns mono + right-aligned.
- Metric cards: label ${scaleSmall}px \`--muted-foreground\` uppercase, value ${scaleLarge}px mono \`--foreground\`, delta in semantic color.
- Inputs: ${d.density.rowHeight} height, \`${d.shape.borderWidth}\` border, focus ring \`--primary\`, no glow.

## Motion

${motionSection}
${advancedMotionSection}
${textureSection}
## Accessibility

### Contrast (computed from the emitted tokens)

${contrastVerdict}

${contrastRows}

- Use secondary text \`${d.color.text.secondary}\` only at >= ${scaleBody}px.
- Focus: every interactive element shows a visible focus ring in \`--ring\`; never remove outlines without an equivalent replacement.
- Motion: honor \`prefers-reduced-motion\` (see Motion). Provide a static, fully-usable fallback.
- Targets: interactive targets are at least the row height (\`${d.density.rowHeight}\`); on mobile, at least 44px.

${handoffSection}

## What changed from the seed preset

${changed}
`;
}
