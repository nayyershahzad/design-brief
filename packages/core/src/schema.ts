import { z } from "zod";

/**
 * The Direction schema is THE contract. Every preset is an instance of it,
 * every preview renders from it, and every export serializes from it.
 * Validate with DirectionSchema.parse() at every boundary (preset load,
 * remix output, file import).
 */
export const DirectionSchema = z.object({
  id: z.string(),
  label: z.string(),
  personality: z.array(z.string()),
  colorScheme: z.enum(["light-first", "dark-first"]),
  color: z.object({
    accent: z.object({
      ramp: z.string().optional(), // "indigo" — descriptive ramp name, optional
      primary: z.string(),
      primaryForeground: z.string(), // text/icon color on primary fills, e.g. "#FFFFFF"
      hover: z.string(),
      muted: z.string(),
    }),
    surface: z.object({ base: z.string(), raised: z.string(), border: z.string() }),
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
