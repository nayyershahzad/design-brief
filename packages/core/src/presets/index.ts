import type { Direction, AppType } from "../schema.js";
import { terminal } from "./terminal.js";
import { warmSaas } from "./warm-saas.js";
import { cleanTeal } from "./clean-teal.js";
import { editorial } from "./editorial.js";
import { brutalist } from "./brutalist.js";
import { grainDark } from "./grain-dark.js";
import { voiceLight } from "./voice-light.js";

export { terminal, warmSaas, cleanTeal, editorial, brutalist, grainDark, voiceLight };

/** The full preset library — the offline floor. */
export const presets: Direction[] = [
  terminal,
  warmSaas,
  cleanTeal,
  editorial,
  brutalist,
  grainDark,
  voiceLight,
];

export const presetsById: Record<string, Direction> = Object.fromEntries(
  presets.map((p) => [p.id, p]),
);

export function getPreset(id: string): Direction | undefined {
  return presetsById[id];
}

/**
 * Seed 3–5 directions for a brief. Ranks by app-type fit first (a direction
 * built for the chosen app type is weighted heavily), then personality-word
 * overlap. Pure ranking; ties keep library order. Always returns at least
 * `min` directions so the playground is never empty. `appType` is optional so
 * older callers (personality-only) keep working.
 */
export function seedDirections(
  personality: string[],
  appType?: AppType,
  min = 3,
  max = 5,
): Direction[] {
  const wanted = new Set(personality.map((w) => w.trim().toLowerCase()).filter(Boolean));
  const scored = presets.map((p, index) => {
    const overlap = p.personality.filter((w) => wanted.has(w.toLowerCase())).length;
    // App-type match dominates: a fitting direction outranks a mere word match.
    const appFit = appType && p.appTypes.includes(appType) ? 1 : 0;
    const score = appFit * 10 + overlap;
    return { p, index, score, hit: score > 0 };
  });
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  const ranked = scored.map((s) => s.p);
  const matched = scored.filter((s) => s.hit).length;
  const count = Math.min(max, Math.max(min, matched));
  return ranked.slice(0, count);
}
