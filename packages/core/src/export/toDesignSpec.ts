import type { Direction } from "../schema.js";
import { toShadcnCss } from "./toShadcnCss.js";

function cap(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Emit DESIGN_SPEC.md: the human-readable contract a coding agent builds
 * against. Everything is derived from the Direction so it can never drift
 * from the CSS/Tailwind exports. Deterministic — no timestamps, no randomness.
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
          "- ALWAYS wrap motion in `@media (prefers-reduced-motion: no-preference)` with a static fallback. `globals.css` ships ready-made `.db-transition` / `.db-hover` / `.db-pressable` / `.db-reveal` utilities.",
        ].join("\n");

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
    `Accessibility floor: text-on-surface contrast >= 4.5:1. Secondary text \`${d.color.text.secondary}\` is intended for use on \`${d.color.surface.base}\`.`,
  ];

  const changed =
    p.notes && p.notes.trim().length > 0
      ? p.notes.trim()
      : p.remixed
        ? `Remixed from the \`${p.seededFrom}\` preset.`
        : `Locked directly from the \`${p.seededFrom}\` preset with no remix.`;

  return `# Design Spec — Locked Direction

> Generated artifact. This block is the contract between the approved design and the coding agent.
> All outputs (this spec, the token files, the approved snapshot) derive from one locked Direction object and must not drift.

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

A ${personality} surface. ${dark ? "A calm dark interface" : "A clean light interface"} built around a single ${
    d.color.accent.ramp ?? "accent"
  } accent, ${cap(d.density.level)} density, and \`${d.shape.borderWidth}\` borders over drop shadows. Numerals use ${
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

## Hard constraints (agent must honor)

${constraints.map((c) => `- ${c}`).join("\n")}

## Component guidance

- Buttons: solid \`--primary\` for the single primary action per view; everything else is a \`${
    d.shape.borderWidth
  }\` bordered ghost button with transparent fill, hover fills to \`--muted\`.
- Tables: the primary surface. Header row \`--muted-foreground\` uppercase ${scaleSmall}px; body rows ${scaleBody}px; numeric columns mono + right-aligned.
- Metric cards: label ${scaleSmall}px \`--muted-foreground\` uppercase, value ${scaleLarge}px mono \`--foreground\`, delta in semantic color.
- Inputs: ${d.density.rowHeight} height, \`${d.shape.borderWidth}\` border, focus ring \`--primary\`, no glow.

## Motion

${motionSection}
${textureSection}
## What changed from the seed preset

${changed}
`;
}
