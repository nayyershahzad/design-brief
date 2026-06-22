import { describe, it, expect } from "vitest";
import {
  presets,
  presetsById,
  grainDark,
  voiceLight,
  brutalist,
  terminal,
  seedDirections,
} from "../src/presets/index.js";
import { toShadcnCss, toTailwindExtend, toDesignSpec } from "../src/export/index.js";

describe("M6 schema + cohort presets", () => {
  it("ships the two cohort presets", () => {
    expect(presetsById["grain-dark"]).toBeDefined();
    expect(presetsById["voice-light"]).toBeDefined();
  });

  it("every preset declares app types and motion (with reduced-motion honored)", () => {
    for (const p of presets) {
      expect(p.appTypes.length).toBeGreaterThan(0);
      expect(["none", "subtle", "expressive"]).toContain(p.motion.level);
      expect(p.motion.respectsReducedMotion).toBe(true);
    }
  });

  it("grain-dark carries a grain texture; voice-light does not", () => {
    expect(grainDark.color.surface.texture).toBe("grain");
    expect(voiceLight.color.surface.texture).toBe("none");
  });
});

describe("seedDirections — app-type aware", () => {
  it("ranks an app-type match to the top", () => {
    const seeded = seedDirections([], "docs");
    expect(seeded[0]?.appTypes).toContain("docs"); // editorial is the docs-fit preset
    expect(seeded[0]?.id).toBe("editorial");
  });

  it("app-type fit outranks a pure personality match", () => {
    // "premium" only matches grain-dark; with appType marketing it should lead.
    const seeded = seedDirections(["premium"], "marketing");
    expect(seeded[0]?.id).toBe("grain-dark");
  });

  it("still ranks by personality when no app type is given (back-compat)", () => {
    expect(seedDirections(["precise", "dense"])[0]?.id).toBe("terminal");
  });

  it("always returns 3–5 directions", () => {
    const n = seedDirections([], "docs").length;
    expect(n).toBeGreaterThanOrEqual(3);
    expect(n).toBeLessThanOrEqual(5);
  });
});

describe("motion + texture exports", () => {
  it("emits motion CSS vars and reduced-motion-guarded utilities", () => {
    const css = toShadcnCss(terminal);
    expect(css).toContain("--db-duration-fast: 100ms;");
    expect(css).toContain("--db-ease-standard:");
    expect(css).toContain("@media (prefers-reduced-motion: no-preference)");
    expect(css).toContain(".db-hover:hover"); // terminal hover = lift
  });

  it("emits motion vars but no utilities for a no-motion direction", () => {
    const css = toShadcnCss(brutalist);
    expect(css).toContain("--db-duration-fast: 0ms;");
    expect(css).not.toContain("@media (prefers-reduced-motion");
    expect(css).not.toContain(".db-transition");
  });

  it("emits a grain overlay only when the direction asks for texture", () => {
    const grain = toShadcnCss(grainDark);
    expect(grain).toContain(".db-grain::after");
    expect(grain).toContain("feTurbulence");
    expect(toShadcnCss(voiceLight)).not.toContain(".db-grain");
  });

  it("Tailwind extend carries transition tokens", () => {
    const e = (toTailwindExtend(terminal) as any).theme.extend;
    expect(e.transitionDuration.DEFAULT).toBe("180ms");
    expect(e.transitionDuration.fast).toBe("100ms");
    expect(e.transitionTimingFunction.standard).toContain("cubic-bezier");
  });

  it("DESIGN_SPEC has a Motion section and app-type provenance", () => {
    const spec = toDesignSpec(terminal);
    expect(spec).toContain("## Motion");
    expect(spec).toContain("prefers-reduced-motion");
    expect(spec).toContain("| App types |");
  });

  it("DESIGN_SPEC states no motion / texture sections appropriately", () => {
    expect(toDesignSpec(brutalist)).toContain("No motion.");
    expect(toDesignSpec(grainDark)).toContain("## Surface texture");
    expect(toDesignSpec(voiceLight)).not.toContain("## Surface texture");
  });
});
