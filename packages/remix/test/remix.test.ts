import { describe, it, expect } from "vitest";
import { terminal } from "@design-brief/core";
import { DirectionSchema } from "@design-brief/core";
import { remixDirection } from "../src/remixDirection.js";
import { remixAvailability, detectProvider } from "../src/detect.js";
import type { Brief, RemixProvider } from "../src/adapter.js";

const brief: Brief = { appType: "billing dashboard", audience: "finance teams", personality: ["calm", "clean"] };

/** A provider that echoes a tweaked copy of the seed — exercises remixDirection without a network call. */
function stubProvider(transform: (seed: Record<string, unknown>) => unknown): RemixProvider {
  return {
    id: "anthropic",
    label: "stub",
    async complete(_system, user) {
      // The user prompt embeds the seed JSON; recover it and transform.
      const start = user.indexOf("{");
      const end = user.lastIndexOf("}");
      const seed = JSON.parse(user.slice(start, end + 1));
      return JSON.stringify(transform(seed));
    },
  };
}

describe("remixDirection", () => {
  it("returns a schema-valid Direction", async () => {
    const provider = stubProvider((seed) => ({ ...seed, id: "calm-billing", label: "Calm Billing" }));
    const out = await remixDirection(terminal, brief, provider);
    expect(() => DirectionSchema.parse(out)).not.toThrow();
    expect(out.id).toBe("calm-billing");
  });

  it("stamps provenance deterministically (never trusts the model)", async () => {
    const provider = stubProvider((seed) => ({
      ...seed,
      id: "x",
      provenance: { seededFrom: "LIES", remixed: false, notes: "I changed the accent to teal." },
    }));
    const out = await remixDirection(terminal, brief, provider);
    expect(out.provenance.seededFrom).toBe("terminal");
    expect(out.provenance.remixed).toBe(true);
    expect(out.provenance.notes).toBe("I changed the accent to teal."); // model note kept
  });

  it("never reuses the seed id in the picker", async () => {
    const provider = stubProvider((seed) => ({ ...seed })); // model keeps the seed id
    const out = await remixDirection(terminal, brief, provider);
    expect(out.id).toBe("terminal-remix");
  });

  it("tolerates markdown-fenced JSON", async () => {
    const provider: RemixProvider = {
      id: "ollama",
      label: "stub",
      async complete(_s, user) {
        const seed = JSON.parse(user.slice(user.indexOf("{"), user.lastIndexOf("}") + 1));
        return "Here you go:\n```json\n" + JSON.stringify({ ...seed, id: "fenced" }) + "\n```";
      },
    };
    const out = await remixDirection(terminal, brief, provider);
    expect(out.id).toBe("fenced");
  });

  it("stamps a contrast warning when the remix stays below WCAG AA", async () => {
    // Stub keeps returning a saturated-blue base with low-contrast text — exactly
    // the failure class that shipped unflagged before 0.5.0.
    const provider = stubProvider((seed) => {
      const s = seed as { color: { surface: Record<string, string>; text: Record<string, string> } };
      return {
        ...s,
        id: "low-contrast",
        color: {
          ...s.color,
          surface: { ...s.color.surface, base: "#002e7a" },
          text: { ...s.color.text, primary: "#aa7942", secondary: "#919191" },
        },
      };
    });
    const out = await remixDirection(terminal, brief, provider);
    expect(() => DirectionSchema.parse(out)).not.toThrow(); // still returns a usable Direction
    expect(out.provenance.notes).toMatch(/WCAG|contrast/i); // ...but loudly flagged
  });

  it("retries once then throws a clear error on invalid output", async () => {
    let calls = 0;
    const provider: RemixProvider = {
      id: "openai",
      label: "stub",
      async complete() {
        calls++;
        return "not json at all";
      },
    };
    await expect(remixDirection(terminal, brief, provider)).rejects.toThrow(/valid Direction/);
    expect(calls).toBe(2);
  });
});

describe("detectProvider / remixAvailability", () => {
  it("is a silent no-op with no env keys", () => {
    expect(detectProvider({})).toBeNull();
    expect(remixAvailability({})).toEqual({ available: false, provider: null, label: null });
  });

  it("prefers anthropic, then openai, then ollama", () => {
    expect(detectProvider({ ANTHROPIC_API_KEY: "k" })?.id).toBe("anthropic");
    expect(detectProvider({ OPENAI_API_KEY: "k" })?.id).toBe("openai");
    expect(detectProvider({ OLLAMA_HOST: "http://localhost:11434" })?.id).toBe("ollama");
    expect(detectProvider({ ANTHROPIC_API_KEY: "k", OPENAI_API_KEY: "k" })?.id).toBe("anthropic");
  });

  it("reports availability with a label", () => {
    const a = remixAvailability({ ANTHROPIC_API_KEY: "k" });
    expect(a.available).toBe(true);
    expect(a.provider).toBe("anthropic");
    expect(a.label).toContain("claude-opus-4-8");
  });
});
