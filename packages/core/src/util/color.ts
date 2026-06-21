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

/** Convert a px string to a rem string at a 16px base, e.g. "6px" -> "0.375rem". */
export function pxToRem(px: string, base = 16): string {
  const n = parseFloat(px);
  if (Number.isNaN(n)) {
    throw new Error(`Invalid px value: "${px}"`);
  }
  const rem = Math.round((n / base) * 100000) / 100000;
  return `${rem}rem`;
}
