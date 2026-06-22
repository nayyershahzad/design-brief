import { definePreset } from "./_define.js";

/**
 * Light, premium-minimal productivity look (Wispr Flow, Superwhisper): clean
 * white base, one confident accent, soft shadows, big confident type, subtle
 * purposeful motion. Power-user friendly (shortcuts in mono).
 */
export const voiceLight = definePreset({
  id: "voice-light",
  label: "Voice Light",
  personality: ["clean", "friendly", "modern"],
  appTypes: ["marketing", "app", "commerce"],
  aesthetic: "minimal",
  colorScheme: "light-first",
  color: {
    accent: {
      ramp: "blue",
      primary: "#2563EB",
      primaryForeground: "#FFFFFF",
      hover: "#1D4ED8",
      muted: "#EAF1FE",
    },
    surface: { base: "#FFFFFF", raised: "#F7F8FA", border: "#E6E8EC", texture: "none", elevation: "shadow" },
    text: { primary: "#0F172A", secondary: "#5B6472", accent: "#2563EB" },
    semantic: { success: "#16A34A", danger: "#DC2626", warning: "#D97706" },
  },
  typography: {
    fontSans: "Inter",
    fontMono: "JetBrains Mono",
    monoUsage: "keyboard shortcuts and code",
    baseSize: "16px",
    scale: [13, 16, 20, 30, 52],
    weights: [400, 600],
  },
  shape: { radius: "12px", radiusLarge: "20px", borderWidth: "1px" },
  density: {
    level: "comfortable",
    rowHeight: "48px",
    cellPaddingX: "18px",
    cellPaddingY: "12px",
    sectionGap: "28px",
  },
  motion: {
    level: "subtle",
    durationFast: "120ms",
    durationBase: "220ms",
    easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
    easingEntrance: "cubic-bezier(0.16, 1, 0.3, 1)",
    hover: "lift",
    press: "scale-down",
    scrollReveal: "fade-up",
    respectsReducedMotion: true,
    scroll: { progress: true, parallax: "none" },
    kineticText: "fade-chars",
  },
  provenance: { seededFrom: "voice-light", remixed: false },
});
