import type { Direction } from "../schema.js";
import { terminal } from "./terminal.js";
import { warmSaas } from "./warm-saas.js";
import { cleanTeal } from "./clean-teal.js";
import { editorial } from "./editorial.js";
import { brutalist } from "./brutalist.js";

export { terminal, warmSaas, cleanTeal, editorial, brutalist };

/** The full preset library — the offline floor. */
export const presets: Direction[] = [terminal, warmSaas, cleanTeal, editorial, brutalist];

export const presetsById: Record<string, Direction> = Object.fromEntries(
  presets.map((p) => [p.id, p]),
);

export function getPreset(id: string): Direction | undefined {
  return presetsById[id];
}

/**
 * Seed 3–5 directions whose personality best overlaps the requested words.
 * Pure ranking by tag overlap; ties keep library order. Always returns at
 * least `min` directions so the playground is never empty.
 */
export function seedDirections(personality: string[], min = 3, max = 5): Direction[] {
  const wanted = new Set(personality.map((w) => w.trim().toLowerCase()).filter(Boolean));
  const scored = presets.map((p, index) => {
    const overlap = p.personality.filter((w) => wanted.has(w.toLowerCase())).length;
    return { p, index, overlap };
  });
  scored.sort((a, b) => b.overlap - a.overlap || a.index - b.index);
  const ranked = scored.map((s) => s.p);
  const matched = scored.filter((s) => s.overlap > 0).length;
  const count = Math.min(max, Math.max(min, matched));
  return ranked.slice(0, count);
}
