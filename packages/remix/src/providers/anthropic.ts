import Anthropic from "@anthropic-ai/sdk";
import type { RemixProvider } from "../adapter.js";

/** Default model. The latest Opus tier — capable enough to author coherent token sets. */
export const ANTHROPIC_MODEL = "claude-opus-4-8";

/**
 * Anthropic provider, built on the official SDK. Reads ANTHROPIC_API_KEY from
 * the environment (the SDK does this by default). Returns the model's text.
 */
export function anthropicProvider(opts: { apiKey?: string; model?: string } = {}): RemixProvider {
  const model = opts.model ?? ANTHROPIC_MODEL;
  // The SDK resolves ANTHROPIC_API_KEY from the env when apiKey is undefined.
  const client = new Anthropic(opts.apiKey ? { apiKey: opts.apiKey } : {});

  return {
    id: "anthropic",
    label: `Anthropic (${model})`,
    async complete(system, user) {
      const response = await client.messages.create({
        model,
        max_tokens: 4096,
        system,
        messages: [{ role: "user", content: user }],
      });
      return response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("");
    },
  };
}
