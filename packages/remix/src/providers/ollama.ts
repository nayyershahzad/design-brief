import type { RemixProvider } from "../adapter.js";

/** Default local model for Ollama. */
export const OLLAMA_MODEL = "llama3.1";

/**
 * Ollama provider over plain fetch — fully local, no key. Activated when
 * OLLAMA_HOST is set (so it's an explicit opt-in, not a silent localhost probe).
 */
export function ollamaProvider(opts: { host?: string; model?: string } = {}): RemixProvider {
  const host = (opts.host ?? process.env.OLLAMA_HOST ?? "http://localhost:11434").replace(/\/$/, "");
  const model = opts.model ?? process.env.OLLAMA_MODEL ?? OLLAMA_MODEL;

  return {
    id: "ollama",
    label: `Ollama (${model})`,
    async complete(system, user) {
      const res = await fetch(`${host}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model,
          stream: false,
          format: "json",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) {
        throw new Error(`Ollama request failed: ${res.status} ${await res.text()}`);
      }
      const data = (await res.json()) as { message?: { content?: string } };
      return data.message?.content ?? "";
    },
  };
}
