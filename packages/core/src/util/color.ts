/**
 * Pure color/units helpers used by the exporters. Deterministic: same input
 * always yields byte-identical output.
 */

export function parseHex(hex: string): { r: number; g: number; b: number } {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/**
 * Convert a hex color to an HSL channel triple in shadcn's convention,
 * e.g. "#0E0E1A" -> "240 30% 8%".
 */
export function hexToHsl(hex: string): string {
  const { r, g, b } = parseHex(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) {
      h = (gn - bn) / d + (gn < bn ? 6 : 0);
    } else if (max === gn) {
      h = (bn - rn) / d + 2;
    } else {
      h = (rn - gn) / d + 4;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** WCAG relative luminance of a hex color (0–1). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  const lin = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two hex colors (1–21). Symmetric. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Coarse hue-family name for a hex color (red/orange/amber/lime/green/teal/
 * cyan/blue/indigo/violet/magenta, plus gray/near-black/near-white). Used so
 * generated prose names the ACTUAL accent hue instead of trusting a stale,
 * free-text `accent.ramp` label.
 */
export function hueName(hex: string): string {
  const { r, g, b } = parseHex(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  if (d < 0.06) return l < 0.2 ? "near-black" : l > 0.85 ? "near-white" : "gray";
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h = (h * 60 + 360) % 360;
  const bands: Array<[number, string]> = [
    [15, "red"],
    [40, "orange"],
    [68, "amber"],
    [82, "lime"],
    [155, "green"],
    [175, "teal"],
    [195, "cyan"],
    [255, "blue"],
    [280, "indigo"],
    [320, "violet"],
    [345, "magenta"],
    [360, "red"],
  ];
  for (const [ceil, name] of bands) if (h < ceil) return name;
  return "red";
}

/** Convert a px string to a rem string at a 16px base, e.g. "6px" -> "0.375rem". */
export function pxToRem(px: string, base = 16): string {
  const n = parseFloat(px);
  if (Number.isNaN(n)) {
    throw new Error(`Invalid px value: "${px}"`);
  }
  const rem = Math.round((n / base) * 100000) / 100000;
  return `${rem}rem`;
}
