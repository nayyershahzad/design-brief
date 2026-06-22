import type { RemixProvider } from "../adapter.js";

/** Default model for the OpenAI-compatible provider. */
export const OPENAI_MODEL = "gpt-4o-mini";

/**
 * OpenAI (or any OpenAI-compatible) provider over plain fetch — no SDK, so this
 * optional package stays light and uniform across vendors. Honors OPENAI_BASE_URL
 * for compatible endpoints. Reads OPENAI_API_KEY from the environment.
 */
export function openaiProvider(opts: { apiKey?: string; model?: string; baseUrl?: string } = {}): RemixProvider {
  const apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY;
  const model = opts.model ?? process.env.OPENAI_MODEL ?? OPENAI_MODEL;
  const baseUrl = (opts.baseUrl ?? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");

  return {
    id: "openai",
    label: `OpenAI (${model})`,
    async complete(system, user) {
      if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) {
        throw new Error(`OpenAI request failed: ${res.status} ${await res.text()}`);
      }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content ?? "";
    },
  };
}
