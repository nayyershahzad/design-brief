import type { Direction } from "../schema.js";
import { DirectionSchema } from "../schema.js";

/** Validate a preset against the contract at module-load time. */
export function definePreset(raw: Direction): Direction {
  return DirectionSchema.parse(raw);
}
