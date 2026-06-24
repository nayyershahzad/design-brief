import { definePreset } from "./_define.js";

/** Clean, calm, modern. Teal accent, balanced density, light. */
export const cleanTeal = definePreset({
  id: "clean-teal",
  label: "Clean Teal",
  personality: ["clean", "calm", "modern"],
  appTypes: ["app", "dashboard", "marketing"],
  aesthetic: "minimal",
  colorScheme: "light-first",
  color: {
    accent: {
      ramp: "teal",
      // Darkened from #0CA678 → #0A8762 so white button labels and accent links
      // clear WCAG AA (>= 4.5:1) on white; verified by the preset contrast gate.
      primary: "#0A8762",
      primaryForeground: "#FFFFFF",
      hover: "#0C9D72",
      muted: "#E6FCF5",
    },
    surface: { base: "#FFFFFF", raised: "#F6F9F8", border: "#DDE6E3", elevation: "shadow" },
    text: { primary: "#1A2421", secondary: "#5C6B66", accent: "#0A8762" },
    semantic: { success: "#0CA678", danger: "#E03131", warning: "#F59F00" },
  },
  typography: {
    fontSans: "Inter",
    fontMono: "IBM Plex Mono",
    monoUsage: "numerals and code",
    baseSize: "14px",
    scale: [12, 14, 17, 22, 30],
    weights: [400, 500],
  },
  shape: { radius: "8px", radiusLarge: "12px", borderWidth: "1px" },
  density: {
    level: "balanced",
    rowHeight: "40px",
    cellPaddingX: "12px",
    cellPaddingY: "8px",
    sectionGap: "16px",
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
  },
  provenance: { seededFrom: "clean-teal", remixed: false },
});
