import { describe, it, expect } from "vitest";
import {
  exportBundle,
  toShadcnCss,
  toTailwind,
  toTailwindExtend,
  toDesignSpec,
} from "../src/export/index.js";
import { terminal, presets } from "../src/presets/index.js";

const REQUIRED_VARS = [
  "--background",
  "--foreground",
  "--card",
  "--primary",
  "--primary-foreground",
  "--muted",
  "--muted-foreground",
  "--border",
  "--radius",
];

describe("exporters", () => {
  it("are deterministic (byte-identical for the same input)", () => {
    for (const p of presets) {
      expect(toShadcnCss(p)).toBe(toShadcnCss(p));
      expect(toTailwind(p)).toBe(toTailwind(p));
      expect(toDesignSpec(p)).toBe(toDesignSpec(p));
    }
  });

  it("emit every required shadcn variable name", () => {
    const css = toShadcnCss(terminal);
    for (const v of REQUIRED_VARS) {
      expect(css).toContain(v);
    }
  });

  it("emit HSL channel triples, not hex", () => {
    const css = toShadcnCss(terminal);
    expect(css).toContain("--primary: 245 89% 63%;");
    expect(css).not.toContain("#5B4DF5");
  });

  it("emit a .dark block for dark-first directions only", () => {
    expect(toShadcnCss(terminal)).toContain(".dark {");
    const light = presets.find((p) => p.colorScheme === "light-first");
    expect(light).toBeDefined();
    expect(toShadcnCss(light!)).not.toContain(".dark {");
  });

  it("convert radius px to rem", () => {
    expect(toShadcnCss(terminal)).toContain("--radius: 0.375rem;");
  });

  it("toTailwind exposes fontFamily, borderRadius and custom colors", () => {
    const extend = toTailwindExtend(terminal) as any;
    const e = extend.theme.extend;
    expect(e.fontFamily.sans[0]).toBe("Inter");
    expect(e.fontFamily.mono[0]).toBe("JetBrains Mono");
    expect(e.borderRadius.DEFAULT).toBe("6px");
    expect(e.colors.accent.DEFAULT).toBe("#5B4DF5");
    expect(e.colors.success).toBe("#3DDC97");
  });

  it("toDesignSpec includes provenance, tokens, and hard constraints", () => {
    const spec = toDesignSpec(terminal);
    expect(spec).toContain("# Design Spec");
    expect(spec).toContain("Hard constraints");
    expect(spec).toContain('"direction": "terminal"');
    expect(spec).toContain("One accent only");
    expect(spec).toContain("Dark-first");
  });

  it("exportBundle returns css, tailwind, and spec and validates its input", () => {
    const b = exportBundle(terminal);
    expect(b.css.length).toBeGreaterThan(0);
    expect(b.tailwind.length).toBeGreaterThan(0);
    expect(b.spec).toContain("# Design Spec");
    // boundary validation: a malformed Direction is rejected
    expect(() => exportBundle({ ...terminal, color: undefined } as any)).toThrow();
  });
});
