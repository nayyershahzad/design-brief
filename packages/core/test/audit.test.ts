import { describe, it, expect } from "vitest";
import { grainDark } from "../src/presets/index.js";
import { auditDirection } from "../src/util/audit.js";
import { toDesignSpec } from "../src/export/toDesignSpec.js";

describe("auditDirection", () => {
  it("passes a clean preset", () => {
    const audit = auditDirection(grainDark);
    expect(audit.pass).toBe(true);
    expect(audit.failures).toHaveLength(0);
  });

  it("flags the exact low-contrast remix the user hit", () => {
    // The real failing remix: saturated-blue base + brown/gray text.
    const bad = structuredClone(grainDark);
    bad.color.surface.base = "#002e7a";
    bad.color.text.primary = "#aa7942";
    bad.color.text.secondary = "#919191";
    const audit = auditDirection(bad);
    expect(audit.pass).toBe(false);
    expect(audit.failures.length).toBeGreaterThanOrEqual(2);
    // ratios are computed, not asserted
    const body = audit.checks.find((c) => c.label === "Body text on base");
    expect(body?.ratio).toBeCloseTo(3.3, 1);
  });

  it("is reflected in the DESIGN_SPEC accessibility section (computed, not asserted)", () => {
    const bad = structuredClone(grainDark);
    bad.id = "bad-remix";
    bad.color.surface.base = "#002e7a";
    bad.color.text.primary = "#aa7942";
    const spec = toDesignSpec(bad);
    expect(spec).toContain("fail WCAG AA");
    expect(spec).not.toContain("are intended to meet >= 4.5:1");
    expect(spec).toMatch(/= \*\*\d+\.\d+:1\*\*/); // a computed ratio is printed
  });
});
