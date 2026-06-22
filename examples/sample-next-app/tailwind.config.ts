import type { Config } from "tailwindcss";
// design-brief writes design-brief.theme.json; merge it into theme.extend so the
// generated font/radius/color additions stay in sync with the locked Direction.
import dbTheme from "./design-brief.theme.json";

export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // shadcn color tokens resolve from the CSS variables in app/globals.css.
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
      },
      ...dbTheme.theme.extend,
    },
  },
} satisfies Config;
