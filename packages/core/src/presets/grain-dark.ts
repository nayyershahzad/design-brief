import { definePreset } from "./_define.js";

/**
 * Dark, premium, grain-textured — the 2026 AI-tool landing look (CommandCode,
 * Causal Dynamics): near-black base, one confident accent, subtle noise overlay,
 * expressive but restrained motion.
 */
export const grainDark = definePreset({
  id: "grain-dark",
  label: "Grain Dark",
  personality: ["premium", "technical", "bold"],
  appTypes: ["marketing", "brand", "app", "portfolio"],
  aesthetic: "grain-dark",
  colorScheme: "dark-first",
  color: {
    accent: {
      ramp: "lime",
      primary: "#B6F23D",
      primaryForeground: "#0A0A0B",
      hover: "#C8FF5C",
      muted: "#1A1F12",
    },
    surface: { base: "#0A0A0B", raised: "#141416", border: "#26262B", texture: "grain", elevation: "border" },
    text: { primary: "#F4F4F5", secondary: "#9A9AA5", accent: "#B6F23D" },
    semantic: { success: "#4ADE80", danger: "#F87171", warning: "#FBBF24" },
  },
  typography: {
    fontSans: "Geist",
    fontMono: "Geist Mono",
    monoUsage: "code, metrics, keyboard shortcuts",
    baseSize: "15px",
    scale: [13, 15, 19, 28, 48],
    weights: [400, 600],
  },
  shape: { radius: "10px", radiusLarge: "16px", borderWidth: "1px" },
  density: {
    level: "comfortable",
    rowHeight: "44px",
    cellPaddingX: "16px",
    cellPaddingY: "10px",
    sectionGap: "28px",
  },
  motion: {
    level: "expressive",
    durationFast: "120ms",
    durationBase: "260ms",
    easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
    easingEntrance: "cubic-bezier(0.16, 1, 0.3, 1)",
    hover: "glow",
    press: "scale-down",
    scrollReveal: "stagger",
    respectsReducedMotion: true,
  },
  provenance: { seededFrom: "grain-dark", remixed: false },
});
