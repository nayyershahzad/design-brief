import type { Direction } from "../schema.js";
import { hexToHsl, pxToRem } from "../util/color.js";

/**
 * shadcn CSS variables, derived (never authored) from the Direction.
 * Names follow shadcn's exact convention; values are HSL channel triples.
 * Order is fixed so output is byte-identical for identical input.
 */
function cssVars(d: Direction): Array<[string, string]> {
  return [
    ["--background", hexToHsl(d.color.surface.base)],
    ["--foreground", hexToHsl(d.color.text.primary)],
    ["--card", hexToHsl(d.color.surface.raised)],
    ["--card-foreground", hexToHsl(d.color.text.primary)],
    ["--primary", hexToHsl(d.color.accent.primary)],
    ["--primary-foreground", hexToHsl(d.color.accent.primaryForeground)],
    ["--muted", hexToHsl(d.color.accent.muted)],
    ["--muted-foreground", hexToHsl(d.color.text.secondary)],
    ["--border", hexToHsl(d.color.surface.border)],
    ["--input", hexToHsl(d.color.surface.border)],
    ["--ring", hexToHsl(d.color.accent.primary)],
    ["--radius", pxToRem(d.shape.radius)],
  ];
}

function block(selector: string, entries: Array<[string, string]>): string {
  const lines = entries.map(([k, v]) => `  ${k}: ${v};`).join("\n");
  return `${selector} {\n${lines}\n}`;
}

/** Motion design tokens as CSS custom properties (a second :root block). */
function motionVars(d: Direction): string {
  const m = d.motion;
  return block(":root", [
    ["--db-duration-fast", m.durationFast],
    ["--db-duration-base", m.durationBase],
    ["--db-ease-standard", m.easingStandard],
    ["--db-ease-entrance", m.easingEntrance],
  ]);
}

/**
 * Opt-in motion utility classes, derived from the Direction and wrapped in
 * `prefers-reduced-motion: no-preference` so motion is never forced. Animates
 * only `transform`/`opacity` (and a hover box-shadow for "glow") to stay smooth.
 */
function motionUtilities(d: Direction): string {
  const m = d.motion;
  if (m.level === "none") return "";
  const rules: string[] = [
    "  .db-transition {\n" +
      "    transition:\n" +
      "      transform var(--db-duration-base) var(--db-ease-standard),\n" +
      "      opacity var(--db-duration-base) var(--db-ease-standard);\n" +
      "  }",
  ];
  if (m.hover === "lift") rules.push("  .db-hover:hover { transform: translateY(-2px); }");
  if (m.hover === "scale") rules.push("  .db-hover:hover { transform: scale(1.02); }");
  if (m.hover === "glow")
    rules.push(
      "  .db-hover:hover { box-shadow: 0 0 0 1px hsl(var(--ring)), 0 8px 30px -8px hsl(var(--ring)); }",
    );
  if (m.press === "scale-down") rules.push("  .db-pressable:active { transform: scale(0.98); }");
  if (m.scrollReveal !== "none") {
    const from =
      m.scrollReveal === "fade" ? "opacity: 0;" : "opacity: 0; transform: translateY(10px);";
    rules.push(
      "  .db-reveal {\n" +
        "    opacity: 0;\n" +
        "    animation: db-reveal var(--db-duration-base) var(--db-ease-entrance) forwards;\n" +
        "  }\n" +
        "  @keyframes db-reveal {\n" +
        `    from { ${from} }\n` +
        "    to { opacity: 1; transform: none; }\n" +
        "  }",
    );
    if (m.scrollReveal === "stagger") {
      rules.push(
        "  .db-stagger > * {\n" +
          "    opacity: 0;\n" +
          "    animation: db-reveal var(--db-duration-base) var(--db-ease-entrance) forwards;\n" +
          "  }\n" +
          "  .db-stagger > *:nth-child(2) { animation-delay: 60ms; }\n" +
          "  .db-stagger > *:nth-child(3) { animation-delay: 120ms; }\n" +
          "  .db-stagger > *:nth-child(4) { animation-delay: 180ms; }",
      );
    }
  }
  return `@media (prefers-reduced-motion: no-preference) {\n${rules.join("\n")}\n}`;
}

// Deterministic SVG fractal-noise overlay (the 2026 "grain" look).
const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** A subtle noise/grain overlay utility, only when the direction asks for texture. */
function textureCss(d: Direction): string {
  const t = d.color.surface.texture;
  if (!t || t === "none") return "";
  const opacity = t === "noise" ? "0.07" : "0.035";
  return (
    ".db-grain { position: relative; isolation: isolate; }\n" +
    ".db-grain::after {\n" +
    '  content: "";\n' +
    "  position: absolute;\n" +
    "  inset: 0;\n" +
    "  z-index: -1;\n" +
    "  pointer-events: none;\n" +
    `  opacity: ${opacity};\n` +
    `  background-image: ${NOISE_SVG};\n` +
    "}"
  );
}

/**
 * Emit the shadcn `:root` (+ `.dark` for dark-first) color block, then motion
 * tokens, opt-in motion utilities, and an optional grain overlay. Everything is
 * derived from the Direction so it can't drift; deterministic.
 */
export function toShadcnCss(d: Direction): string {
  const entries = cssVars(d);
  const parts: string[] = [block(":root", entries)];
  if (d.colorScheme === "dark-first") parts.push(block(".dark", entries));
  parts.push(motionVars(d));
  const util = motionUtilities(d);
  if (util) parts.push(util);
  const tex = textureCss(d);
  if (tex) parts.push(tex);
  return parts.join("\n\n") + "\n";
}
