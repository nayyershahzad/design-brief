import { definePreset } from "./_define.js";

/** Refined, spacious, typographic. Serif sans, slate accent, generous spacing. */
export const editorial = definePreset({
  id: "editorial",
  label: "Editorial",
  personality: ["refined", "spacious", "typographic"],
  colorScheme: "light-first",
  color: {
    accent: {
      ramp: "slate",
      primary: "#1F2933",
      primaryForeground: "#FFFFFF",
      hover: "#323F4B",
      muted: "#F0F2F4",
    },
    surface: { base: "#FBFBF9", raised: "#FFFFFF", border: "#E4E4DE" },
    text: { primary: "#1A1A17", secondary: "#6B6B63", accent: "#8C5A2B" },
    semantic: { success: "#2B7A4B", danger: "#B3261E", warning: "#9A6700" },
  },
  typography: {
    fontSans: "Newsreader",
    fontMono: "JetBrains Mono",
    monoUsage: "code only",
    baseSize: "17px",
    scale: [14, 17, 21, 28, 40],
    weights: [400, 600],
  },
  shape: { radius: "4px", radiusLarge: "6px", borderWidth: "1px" },
  density: {
    level: "comfortable",
    rowHeight: "52px",
    cellPaddingX: "20px",
    cellPaddingY: "14px",
    sectionGap: "32px",
  },
  provenance: { seededFrom: "editorial", remixed: false },
});
