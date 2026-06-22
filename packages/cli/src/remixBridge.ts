import type { Direction } from "@design-brief/core";

/**
 * Optional bridge to `@design-brief/remix`. The remix package is isolated and
 * deletable (see CLAUDE.md M4): the CLI never statically imports it. We load it
 * lazily through a `string`-typed specifier so `tsc` emits a runtime dynamic
 * import without trying to resolve the module at build time — the CLI compiles
 * whether or not `packages/remix` exists. At runtime npm workspaces symlink the
 * package into node_modules when present; when absent, the import simply throws
 * and we degrade to "no remix".
 */

export interface RemixBrief {
  appType: string;
  audience: string;
  personality: string[];
}

export interface RemixStatus {
  available: boolean;
  provider: string | null;
  label: string | null;
}

// Locally-declared shape of the optional module — never an `import type` from
// the package (that would make tsc resolve it and break the deletable build).
interface RemixModule {
  remixAvailability(env?: NodeJS.ProcessEnv): RemixStatus;
  detectProvider(env?: NodeJS.ProcessEnv): unknown;
  remixDirection(preset: Direction, brief: RemixBrief, provider: unknown): Promise<Direction>;
}

const UNAVAILABLE: RemixStatus = { available: false, provider: null, label: null };

async function loadRemix(): Promise<RemixModule | null> {
  // `string` (not a string literal) → tsc types this `Promise<any>` and does
  // not statically resolve the specifier.
  const specifier: string = "@design-brief/remix";
  try {
    return (await import(specifier)) as RemixModule;
  } catch {
    return null;
  }
}

/** Whether remix is installed AND a provider is configured via env. Safe to call always. */
export async function getRemixStatus(): Promise<RemixStatus> {
  const mod = await loadRemix();
  if (!mod) return UNAVAILABLE;
  try {
    return mod.remixAvailability();
  } catch {
    return UNAVAILABLE;
  }
}

/** Author a new Direction. Throws if remix isn't installed or no provider is configured. */
export async function runRemix(preset: Direction, brief: RemixBrief): Promise<Direction> {
  const mod = await loadRemix();
  if (!mod) throw new Error("AI remix is not installed (the @design-brief/remix package is absent).");
  const provider = mod.detectProvider();
  if (!provider) throw new Error("No AI provider configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or OLLAMA_HOST.");
  return mod.remixDirection(preset, brief, provider);
}
