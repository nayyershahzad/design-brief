import { describe, it, expect } from "vitest";
import { toDesignSpec } from "../src/export/index.js";
import { terminal, voiceLight } from "../src/presets/index.js";

describe("M9 — generator handoff in DESIGN_SPEC", () => {
  it("every spec carries a generator-handoff section with a prompt and tool notes", () => {
    const spec = toDesignSpec(terminal);
    expect(spec).toContain("## Build it with an AI generator");
    expect(spec).toContain("binding design contract");
    expect(spec).toContain("v0 (Vercel)");
    expect(spec).toContain("Framer");
    expect(spec).toContain("Claude Code / Cursor");
  });

  it("the prompt is parameterised by the direction's primary app type", () => {
    // voice-light's first appType is "marketing"
    expect(toDesignSpec(voiceLight)).toContain("as a **marketing**");
    // terminal's first appType is "app"
    expect(toDesignSpec(terminal)).toContain("as a **app**");
  });

  it("is still deterministic", () => {
    expect(toDesignSpec(voiceLight)).toBe(toDesignSpec(voiceLight));
  });
});
