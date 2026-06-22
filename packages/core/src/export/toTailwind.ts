import type { Direction } from "../schema.js";

/**
 * The `theme.extend` object for a direction: font families, border radii, and
 * the custom colors (accent ramp + semantic) that aren't covered by the
 * shadcn CSS variables. Returned as a plain object so callers can merge it.
 */
export function toTailwindExtend(d: Direction): Record<string, unknown> {
  return {
    theme: {
      extend: {
        fontFamily: {
          sans: [d.typography.fontSans, "ui-sans-serif", "system-ui", "sans-serif"],
          mono: [d.typography.fontMono, "ui-monospace", "monospace"],
        },
        borderRadius: {
          DEFAULT: d.shape.radius,
          lg: d.shape.radiusLarge,
        },
        borderWidth: {
          hairline: d.shape.borderWidth,
        },
        transitionDuration: {
          fast: d.motion.durationFast,
          DEFAULT: d.motion.durationBase,
        },
        transitionTimingFunction: {
          standard: d.motion.easingStandard,
          entrance: d.motion.easingEntrance,
        },
        colors: {
          accent: {
            DEFAULT: d.color.accent.primary,
            foreground: d.color.accent.primaryForeground,
            hover: d.color.accent.hover,
            muted: d.color.accent.muted,
          },
          success: d.color.semantic.success,
          danger: d.color.semantic.danger,
          warning: d.color.semantic.warning,
        },
      },
    },
  };
}

/** Serialize the `theme.extend` object as deterministic, pretty-printed JSON. */
export function toTailwind(d: Direction): string {
  return JSON.stringify(toTailwindExtend(d), null, 2) + "\n";
}
