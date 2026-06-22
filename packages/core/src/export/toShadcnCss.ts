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
 * Page-level "advanced" motion (scroll progress, parallax, kinetic headlines)
 * using CSS scroll-driven animations (`animation-timeline`), reduced-motion
 * guarded. Only emitted when the direction opts in via `motion.scroll` /
 * `motion.kineticText`.
 */
function advancedMotionCss(d: Direction): string {
  const m = d.motion;
  const scroll = m.scroll;
  const kinetic = m.kineticText;
  const wantsScrollBar = !!scroll?.progress;
  const wantsParallax = !!scroll && scroll.parallax !== "none";
  const wantsKinetic = !!kinetic && kinetic !== "none";
  if (!wantsScrollBar && !wantsParallax && !wantsKinetic) return "";

  const rules: string[] = [];

  if (wantsScrollBar) {
    rules.push(
      "  .db-scroll-progress {\n" +
        "    position: fixed; inset: 0 0 auto 0; height: 3px; z-index: 50;\n" +
        "    transform-origin: 0 50%; background: hsl(var(--primary));\n" +
        "    animation: db-progress auto linear; animation-timeline: scroll(root block);\n" +
        "  }\n" +
        "  @keyframes db-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }",
    );
  }
  if (wantsParallax) {
    const depth = scroll!.parallax === "bold" ? "40px" : "12px";
    rules.push(
      "  .db-parallax {\n" +
        "    animation: db-parallax auto linear; animation-timeline: view(); animation-range: cover;\n" +
        "    will-change: transform;\n" +
        "  }\n" +
        `  @keyframes db-parallax { from { transform: translateY(${depth}); } to { transform: translateY(-${depth}); } }`,
    );
  }
  if (wantsKinetic) {
    if (kinetic === "shimmer") {
      rules.push(
        "  .db-kinetic-shimmer {\n" +
          "    background: linear-gradient(90deg, currentColor 40%, hsl(var(--primary)) 50%, currentColor 60%);\n" +
          "    background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;\n" +
          "    animation: db-shimmer 2.4s linear infinite;\n" +
          "  }\n" +
          "  @keyframes db-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }",
      );
    } else {
      // rise-words / fade-chars: wrap each word/char in a span under .db-kinetic.
      const frame =
        kinetic === "rise-words"
          ? "from { opacity: 0; transform: translateY(0.4em); } to { opacity: 1; transform: none; }"
          : "from { opacity: 0; } to { opacity: 1; }";
      const step = kinetic === "rise-words" ? 80 : 40;
      const delays = [2, 3, 4, 5]
        .map((n) => `  .db-kinetic > *:nth-child(${n}) { animation-delay: ${(n - 1) * step}ms; }`)
        .join("\n");
      rules.push(
        "  .db-kinetic > * {\n" +
          "    display: inline-block; opacity: 0;\n" +
          "    animation: db-kinetic var(--db-duration-base) var(--db-ease-entrance) forwards;\n" +
          "  }\n" +
          `  @keyframes db-kinetic { ${frame} }\n` +
          delays,
      );
    }
  }
  return `@media (prefers-reduced-motion: no-preference) {\n${rules.join("\n")}\n}`;
}

/**
 * Emit the shadcn `:root` (+ `.dark` for dark-first) color block, then motion
 * tokens, opt-in motion utilities, an optional grain overlay, and optional
 * advanced (scroll/parallax/kinetic) motion. Everything is derived from the
 * Direction so it can't drift; deterministic.
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
  const adv = advancedMotionCss(d);
  if (adv) parts.push(adv);
  return parts.join("\n\n") + "\n";
}
