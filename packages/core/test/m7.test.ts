import { describe, it, expect } from "vitest";
import { toDesignSpec } from "../src/export/index.js";
import { terminal, voiceLight, presetsById } from "../src/presets/index.js";

describe("M7 — agent-grade DESIGN_SPEC", () => {
  it("has the agent-facing sections", () => {
    const spec = toDesignSpec(terminal);
    for (const heading of [
      "## How to use this file",
      "## Install & wiring",
      "## Hard constraints",
      "## Do / Don't",
      "## Component scope",
      "## Accessibility",
    ]) {
      expect(spec).toContain(heading);
    }
  });

  it("names the companion files and target stack", () => {
    const spec = toDesignSpec(terminal);
    expect(spec).toContain("globals.css");
    expect(spec).toContain("design-brief.theme.json");
    expect(spec).toContain("shadcn/ui + Tailwind");
  });

  it("derives component scope from the direction's appTypes", () => {
    // terminal → app + dashboard
    const t = toDesignSpec(terminal);
    expect(t).toContain("Dashboard / admin");
    expect(t).toContain("Metric cards:");
    expect(t).not.toContain("Landing / marketing site"); // terminal isn't a marketing fit

    // voice-light → marketing + app + commerce
    const v = toDesignSpec(voiceLight);
    expect(v).toContain("Landing / marketing site");
    expect(v).toContain("Hero:");
    expect(v).toContain("E-commerce storefront");
  });

  it("covers every app-type family in the scope map", () => {
    // grain-dark spans marketing/brand/app/portfolio — all must render a block
    const g = toDesignSpec(presetsById["grain-dark"]!);
    for (const summary of [
      "Landing / marketing site",
      "Agency / brand site",
      "General web app",
      "Portfolio / showcase",
    ]) {
      expect(g).toContain(summary);
    }
  });

  it("is still deterministic", () => {
    expect(toDesignSpec(terminal)).toBe(toDesignSpec(terminal));
  });
});
