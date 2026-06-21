import { definePreset } from "./_define.js";

/** Bold, raw, high-contrast. Black on white, hard corners, thick borders. */
export const brutalist = definePreset({
  id: "brutalist",
  label: "Brutalist",
  personality: ["bold", "raw", "high-contrast"],
  colorScheme: "light-first",
  color: {
    accent: {
      ramp: "yellow",
      primary: "#000000",
      primaryForeground: "#FFE600",
      hover: "#1A1A1A",
      muted: "#FFF8B0",
    },
    surface: { base: "#FFFFFF", raised: "#FFFFFF", border: "#000000" },
    text: { primary: "#000000", secondary: "#3D3D3D", accent: "#000000" },
    semantic: { success: "#008A22", danger: "#D60000", warning: "#C77B00" },
  },
  typography: {
    fontSans: "Helvetica Neue",
    fontMono: "Space Mono",
    monoUsage: "numerals and code",
    baseSize: "14px",
    scale: [12, 14, 18, 26, 40],
    weights: [400, 700],
  },
  shape: { radius: "0px", radiusLarge: "0px", borderWidth: "2px" },
  density: {
    level: "compact",
    rowHeight: "36px",
    cellPaddingX: "12px",
    cellPaddingY: "8px",
    sectionGap: "16px",
  },
  provenance: { seededFrom: "brutalist", remixed: false },
});
