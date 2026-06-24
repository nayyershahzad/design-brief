import { describe, it, expect } from "vitest";
import { presets, seedDirections, getPreset } from "../src/presets/index.js";
import { DirectionSchema } from "../src/schema.js";
import { auditDirection } from "../src/util/audit.js";

describe("presets", () => {
  it("ships at least 5 presets", () => {
    expect(presets.length).toBeGreaterThanOrEqual(5);
  });

  it("every preset validates against the schema", () => {
    for (const p of presets) {
      expect(() => DirectionSchema.parse(p)).not.toThrow();
    }
  });

  it("preset ids are unique", () => {
    const ids = presets.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every preset carries a primaryForeground token", () => {
    for (const p of presets) {
      expect(p.color.accent.primaryForeground).toMatch(/^#[0-9a-fA-F]{3,6}$/);
    }
  });

  it("getPreset resolves by id", () => {
    expect(getPreset("terminal")?.label).toBe("Terminal");
    expect(getPreset("does-not-exist")).toBeUndefined();
  });

  it("every shipped preset passes the enforced WCAG AA contrast gate", () => {
    for (const p of presets) {
      const audit = auditDirection(p);
      const detail = audit.failures.map((f) => `${f.label} ${f.ratio}:1`).join(", ");
      expect(audit.failures, `${p.id}: ${detail}`).toHaveLength(0);
    }
  });
});

describe("seedDirections", () => {
  it("ranks by personality overlap", () => {
    const seeded = seedDirections(["precise", "dense"]);
    expect(seeded[0]?.id).toBe("terminal");
  });

  it("always returns between 3 and 5 directions", () => {
    const none = seedDirections([]);
    expect(none.length).toBeGreaterThanOrEqual(3);
    expect(none.length).toBeLessThanOrEqual(5);
  });
});
