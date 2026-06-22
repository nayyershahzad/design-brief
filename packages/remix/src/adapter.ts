/**
 * The provider-neutral seam. The whole point of this package is that
 * `remixDirection` depends only on this interface — never on a concrete
 * AI vendor. Each provider knows how to turn a (system, user) pair into a
 * single text completion; everything vendor-specific stays behind it.
 */
export interface RemixProvider {
  /** Stable id used for env gating and UI labels. */
  readonly id: "anthropic" | "openai" | "ollama";
  /** Human-readable label, e.g. "Anthropic (claude-opus-4-8)". */
  readonly label: string;
  /**
   * Produce a single completion. Implementations MUST return the model's raw
   * text (expected to be a JSON object); parsing/validation is the caller's job.
   */
  complete(system: string, user: string): Promise<string>;
}

/**
 * The design brief the user is exploring. Mirrors the playground's BriefForm
 * shape, but lives here so this package has zero dependency on the UI.
 */
export interface Brief {
  appType: string;
  audience: string;
  personality: string[];
}

/** What `detectProvider` reports to callers that only need availability. */
export interface RemixAvailability {
  available: boolean;
  /** The provider id that would be used, when available. */
  provider: RemixProvider["id"] | null;
  label: string | null;
}
