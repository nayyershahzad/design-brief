import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportBundle } from "../src/export/index.js";
import { terminal } from "../src/presets/index.js";

describe("M1 gate", () => {
  it("exportBundle(terminal) writes three coherent artifacts to a scratch dir", () => {
    const dir = mkdtempSync(join(tmpdir(), "design-brief-"));
    try {
      const { css, tailwind, spec } = exportBundle(terminal);
      const files = {
        css: join(dir, "globals.css"),
        tw: join(dir, "tailwind.extend.json"),
        spec: join(dir, "DESIGN_SPEC.md"),
      };
      writeFileSync(files.css, css);
      writeFileSync(files.tw, tailwind);
      writeFileSync(files.spec, spec);

      for (const f of Object.values(files)) {
        expect(existsSync(f)).toBe(true);
        expect(readFileSync(f, "utf8").length).toBeGreaterThan(0);
      }
      // tailwind artifact is valid JSON
      expect(() => JSON.parse(readFileSync(files.tw, "utf8"))).not.toThrow();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
