import type { Direction } from "../schema.js";
import { DirectionSchema } from "../schema.js";
import { toShadcnCss } from "./toShadcnCss.js";
import { toTailwind } from "./toTailwind.js";
import { toDesignSpec } from "./toDesignSpec.js";

export { toShadcnCss } from "./toShadcnCss.js";
export { toTailwind, toTailwindExtend } from "./toTailwind.js";
export { toDesignSpec } from "./toDesignSpec.js";

export interface ExportBundle {
  /** shadcn `:root` (+ `.dark`) CSS variable block. */
  css: string;
  /** `theme.extend` object as pretty JSON. */
  tailwind: string;
  /** DESIGN_SPEC.md markdown. */
  spec: string;
}

/**
 * The single entry point: validate the Direction at the boundary, then derive
 * all three artifacts from it. Because they all come from one parsed object,
 * they cannot drift apart.
 */
export function exportBundle(direction: Direction): ExportBundle {
  const d = DirectionSchema.parse(direction);
  return {
    css: toShadcnCss(d),
    tailwind: toTailwind(d),
    spec: toDesignSpec(d),
  };
}
