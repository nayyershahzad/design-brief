import { definePreset } from "./_define.js";

/** Dense, dark, technical. Mono numerals, single indigo accent. */
export const terminal = definePreset({
  id: "terminal",
  label: "Terminal",
  personality: ["precise", "dense", "technical"],
  appTypes: ["app", "dashboard"],
  aesthetic: "minimal",
  colorScheme: "dark-first",
  color: {
    accent: {
      ramp: "indigo",
      primary: "#5B4DF5",
      primaryForeground: "#FFFFFF",
      hover: "#7B6FFF",
      muted: "#1C1C30",
    },
    surface: { base: "#0E0E1A", raised: "#15152A", border: "#2A2A40" },
    text: { primary: "#EDEDFF", secondary: "#7A7AB0", accent: "#7B6FFF" },
    semantic: { success: "#3DDC97", danger: "#FF6B6B", warning: "#EF9F27" },
  },
  typography: {
    fontSans: "Inter",
    fontMono: "JetBrains Mono",
    monoUsage: "all numerals, metrics, tabular data, code",
    baseSize: "13px",
    scale: [11, 13, 16, 20, 28],
    weights: [400, 500],
  },
  shape: { radius: "6px", radiusLarge: "8px", borderWidth: "0.5px" },
  density: {
    level: "compact",
    rowHeight: "32px",
    cellPaddingX: "10px",
    cellPaddingY: "6px",
    sectionGap: "12px",
  },
  motion: {
    level: "subtle",
    durationFast: "100ms",
    durationBase: "180ms",
    easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
    easingEntrance: "cubic-bezier(0.16, 1, 0.3, 1)",
    hover: "lift",
    press: "scale-down",
    scrollReveal: "fade",
    respectsReducedMotion: true,
  },
  provenance: { seededFrom: "terminal", remixed: false },
});
