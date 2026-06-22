import { z } from "zod";

/**
 * The Direction schema is THE contract. Every preset is an instance of it,
 * every preview renders from it, and every export serializes from it.
 * Validate with DirectionSchema.parse() at every boundary (preset load,
 * remix output, file import).
 */
/** The app-type families a direction is suited to (drives brief-based seeding). */
export const AppTypeEnum = z.enum([
  "marketing", // landing pages, marketing sites
  "commerce", // storefronts, pricing, checkout
  "content", // blogs, editorial, news
  "docs", // documentation, knowledge bases
  "app", // general web apps
  "dashboard", // admin/analytics dashboards
  "mobile", // mobile apps
  "portfolio", // personal/creative showcases
  "brand", // agency/brand sites
]);
export type AppType = z.infer<typeof AppTypeEnum>;

export const DirectionSchema = z.object({
  id: z.string(),
  label: z.string(),
  personality: z.array(z.string()),
  /** App-type families this direction fits; used to rank directions for a brief. */
  appTypes: z.array(AppTypeEnum),
  /** Descriptive aesthetic family, e.g. "minimal", "editorial", "grain-dark". */
  aesthetic: z.string().optional(),
  colorScheme: z.enum(["light-first", "dark-first"]),
  color: z.object({
    accent: z.object({
      ramp: z.string().optional(), // "indigo" — descriptive ramp name, optional
      primary: z.string(),
      primaryForeground: z.string(), // text/icon color on primary fills, e.g. "#FFFFFF"
      hover: z.string(),
      muted: z.string(),
    }),
    surface: z.object({
      base: z.string(),
      raised: z.string(),
      border: z.string(),
      // Optional surface texture overlay (the 2026 "grain" look). Default: none.
      texture: z.enum(["none", "grain", "noise"]).optional(),
      // How surfaces separate: hairline border, soft shadow, or flat. Default: border.
      elevation: z.enum(["flat", "shadow", "border"]).optional(),
    }),
    text: z.object({ primary: z.string(), secondary: z.string(), accent: z.string() }),
    semantic: z.object({ success: z.string(), danger: z.string(), warning: z.string() }),
  }),
  typography: z.object({
    fontSans: z.string(),
    fontMono: z.string(),
    monoUsage: z.string(),
    baseSize: z.string(), // "13px"
    scale: z.array(z.number()), // [11,13,16,20,28]
    weights: z.array(z.number()), // [400,500]
  }),
  shape: z.object({
    radius: z.string(), // "6px"
    radiusLarge: z.string(),
    borderWidth: z.string(), // "0.5px"
  }),
  density: z.object({
    level: z.enum(["compact", "balanced", "comfortable"]),
    rowHeight: z.string(),
    cellPaddingX: z.string(),
    cellPaddingY: z.string(),
    sectionGap: z.string(),
  }),
  /**
   * Motion tokens. Still deterministic — these are values an agent (or the
   * preview) animates from; AI never renders the motion itself. Animate only
   * transform/opacity, and always honor prefers-reduced-motion.
   */
  motion: z.object({
    level: z.enum(["none", "subtle", "expressive"]),
    durationFast: z.string(), // "120ms" — hover/press
    durationBase: z.string(), // "220ms" — entrances/transitions
    easingStandard: z.string(), // state changes, e.g. "cubic-bezier(0.2, 0, 0, 1)"
    easingEntrance: z.string(), // reveals, e.g. "cubic-bezier(0.16, 1, 0.3, 1)"
    hover: z.enum(["none", "lift", "glow", "scale"]),
    press: z.enum(["none", "scale-down"]),
    scrollReveal: z.enum(["none", "fade", "fade-up", "stagger"]),
    respectsReducedMotion: z.literal(true), // non-negotiable
    // Optional page-level effects (the "jaw-dropping" layer). Absent = off.
    // Implemented with CSS scroll-driven animations (animation-timeline), with a
    // reduced-motion fallback. See the Advanced motion section of DESIGN_SPEC.md.
    scroll: z
      .object({
        progress: z.boolean(), // a top scroll-progress bar
        parallax: z.enum(["none", "subtle", "bold"]), // hero/media parallax depth
      })
      .optional(),
    kineticText: z.enum(["none", "rise-words", "fade-chars", "shimmer"]).optional(),
  }),
  provenance: z.object({
    seededFrom: z.string(), // preset id
    remixed: z.boolean(),
    notes: z.string().optional(),
  }),
});

export type Direction = z.infer<typeof DirectionSchema>;

/** Parse + validate an unknown value into a Direction. Throws on invalid input. */
export function parseDirection(input: unknown): Direction {
  return DirectionSchema.parse(input);
}
