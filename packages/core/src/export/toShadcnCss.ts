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

/**
 * Emit a `:root { … }` block and, for dark-first directions, a mirroring
 * `.dark { … }` block so the shadcn dark toggle still resolves to the
 * approved palette.
 */
export function toShadcnCss(d: Direction): string {
  const entries = cssVars(d);
  const root = block(":root", entries);
  if (d.colorScheme === "dark-first") {
    return `${root}\n\n${block(".dark", entries)}\n`;
  }
  return `${root}\n`;
}
