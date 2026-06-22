import { definePreset } from "./_define.js";

/** Friendly, rounded, light. Warm amber accent, comfortable spacing. */
export const warmSaas = definePreset({
  id: "warm-saas",
  label: "Warm SaaS",
  personality: ["friendly", "approachable", "rounded"],
  appTypes: ["marketing", "app", "commerce"],
  aesthetic: "playful",
  colorScheme: "light-first",
  color: {
    accent: {
      ramp: "amber",
      primary: "#E8590C",
      primaryForeground: "#FFFFFF",
      hover: "#F76707",
      muted: "#FFF3E6",
    },
    surface: { base: "#FFFFFF", raised: "#FBF7F2", border: "#ECE2D6", elevation: "shadow" },
    text: { primary: "#2B2620", secondary: "#7A6F60", accent: "#E8590C" },
    semantic: { success: "#2F9E44", danger: "#E03131", warning: "#F08C00" },
  },
  typography: {
    fontSans: "Inter",
    fontMono: "JetBrains Mono",
    monoUsage: "code and IDs only",
    baseSize: "15px",
    scale: [13, 15, 18, 24, 34],
    weights: [400, 600],
  },
  shape: { radius: "12px", radiusLarge: "16px", borderWidth: "1px" },
  density: {
    level: "comfortable",
    rowHeight: "48px",
    cellPaddingX: "16px",
    cellPaddingY: "12px",
    sectionGap: "24px",
  },
  motion: {
    level: "expressive",
    durationFast: "140ms",
    durationBase: "260ms",
    easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
    easingEntrance: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    hover: "lift",
    press: "scale-down",
    scrollReveal: "fade-up",
    respectsReducedMotion: true,
  },
  provenance: { seededFrom: "warm-saas", remixed: false },
});
