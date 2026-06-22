import type { RemixProvider, RemixAvailability } from "./adapter.js";
import { anthropicProvider } from "./providers/anthropic.js";
import { openaiProvider } from "./providers/openai.js";
import { ollamaProvider } from "./providers/ollama.js";

/**
 * Pick a provider from the environment, or return null. Absence of every
 * key/host is a silent no-op — the playground simply hides the remix button
 * and presets keep working. First match wins, in preference order.
 */
export function detectProvider(env: NodeJS.ProcessEnv = process.env): RemixProvider | null {
  if (env.ANTHROPIC_API_KEY) return anthropicProvider({ apiKey: env.ANTHROPIC_API_KEY });
  if (env.OPENAI_API_KEY) return openaiProvider({ apiKey: env.OPENAI_API_KEY });
  if (env.OLLAMA_HOST) return ollamaProvider({ host: env.OLLAMA_HOST });
  return null;
}

/** Availability summary for callers (e.g. the CLI's /api/context) that only need a yes/no + label. */
export function remixAvailability(env: NodeJS.ProcessEnv = process.env): RemixAvailability {
  const provider = detectProvider(env);
  return provider
    ? { available: true, provider: provider.id, label: provider.label }
    : { available: false, provider: null, label: null };
}
