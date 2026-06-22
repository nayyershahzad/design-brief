import { type Direction, parseDirection } from "@design-brief/core";
import type { Brief, RemixProvider } from "./adapter.js";

const SYSTEM = `You are a senior product designer who authors design tokens for shadcn/ui-based apps.
You will be given a starting "Direction" (a JSON design-token object) and a brief.
Your job: produce a NEW Direction that keeps the same JSON shape but is retuned to the brief.

Hard rules:
- Output ONLY a single JSON object. No markdown, no prose, no code fences.
- Keep EVERY key present in the starting Direction. Do not add or remove keys.
- All colors are hex strings (e.g. "#1A2B3C"). Keep contrast legible (text vs surface).
- "colorScheme" is exactly "light-first" or "dark-first".
- "density.level" is exactly "compact", "balanced", or "comfortable".
- Choose a fresh, kebab-case "id" and a short human "label" that reflect the brief.
- Set "provenance.notes" to one sentence describing what you changed from the seed.
- Sizes stay as CSS strings with units (e.g. "13px", "6px"); scale/weights stay numeric arrays.`;

function buildUserPrompt(preset: Direction, brief: Brief): string {
  const words = brief.personality.length ? brief.personality.join(", ") : "(none given)";
  return [
    `Brief:`,
    `- App type: ${brief.appType}`,
    `- Audience: ${brief.audience}`,
    `- Personality: ${words}`,
    ``,
    `Starting Direction to remix:`,
    JSON.stringify(preset, null, 2),
    ``,
    `Return the new Direction JSON object now.`,
  ].join("\n");
}

/** Pull the first balanced JSON object out of a model response (tolerates fences/prose). */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("remix: provider returned no JSON object");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

/**
 * Author a new, schema-valid Direction from a preset + brief using the given
 * provider. Provenance is stamped deterministically (we never trust the model
 * for it), and the result is validated with `parseDirection` — the single
 * boundary check that guarantees downstream exports can't drift. Retries once
 * if the first completion fails to validate.
 */
export async function remixDirection(
  preset: Direction,
  brief: Brief,
  provider: RemixProvider,
): Promise<Direction> {
  const system = SYSTEM;
  const user = buildUserPrompt(preset, brief);

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await provider.complete(system, user);
      const parsed = extractJson(raw) as Record<string, unknown>;

      // Stamp provenance ourselves; keep a model-supplied note if present.
      const modelProvenance = (parsed.provenance ?? {}) as { notes?: unknown };
      parsed.provenance = {
        seededFrom: preset.id,
        remixed: true,
        notes:
          typeof modelProvenance.notes === "string" && modelProvenance.notes.trim()
            ? modelProvenance.notes
            : `Remixed from "${preset.label}" for a ${brief.appType}.`,
      };

      // Never collide with the seed's id in the picker.
      if (typeof parsed.id !== "string" || !parsed.id.trim() || parsed.id === preset.id) {
        parsed.id = `${preset.id}-remix`;
      }

      return parseDirection(parsed);
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(
    `remix: could not produce a valid Direction (${lastError instanceof Error ? lastError.message : String(lastError)})`,
  );
}
