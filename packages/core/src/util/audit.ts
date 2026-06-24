import type { Direction } from "../schema.js";
import { contrastRatio } from "./color.js";

/**
 * Deterministic accessibility audit of a Direction. Computes WCAG contrast for
 * the token pairs that legally co-occur, so the spec can print REAL numbers
 * instead of asserting conformance it never measured. AI-remixed and
 * hand-tweaked directions are the untrusted paths this protects.
 */
export interface ContrastCheck {
  /** Human label for the pair, e.g. "Body text on base". */
  label: string;
  fg: string;
  bg: string;
  /** Computed ratio, rounded to 2 decimals (1–21). */
  ratio: number;
  /** Required floor (4.5 for normal text, 3 for the informational border check). */
  floor: number;
  pass: boolean;
  /** "enforce" pairs gate the build/remix; "info" pairs are reported only. */
  severity: "enforce" | "info";
}

export interface DirectionAudit {
  checks: ContrastCheck[];
  /** Enforced checks that fall below their floor. */
  failures: ContrastCheck[];
  /** True when no enforced check fails. */
  pass: boolean;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Audit a Direction's color contrast. Pairs checked:
 * - body/secondary/accent text against the base + raised surfaces (enforce 4.5),
 * - the primary button label against the primary fill (enforce 4.5),
 * - the hairline border against the base surface (info, 3 — decorative borders
 *   are intentionally subtle, so this never fails the build).
 */
export function auditDirection(d: Direction): DirectionAudit {
  const c = d.color;
  const mk = (
    label: string,
    fg: string,
    bg: string,
    floor: number,
    severity: ContrastCheck["severity"],
  ): ContrastCheck => {
    const ratio = round2(contrastRatio(fg, bg));
    return { label, fg, bg, ratio, floor, pass: ratio >= floor, severity };
  };

  const checks: ContrastCheck[] = [
    mk("Body text on base", c.text.primary, c.surface.base, 4.5, "enforce"),
    mk("Body text on raised", c.text.primary, c.surface.raised, 4.5, "enforce"),
    mk("Secondary text on base", c.text.secondary, c.surface.base, 4.5, "enforce"),
    mk("Primary button label", c.accent.primaryForeground, c.accent.primary, 4.5, "enforce"),
    mk("Accent text / links on base", c.text.accent, c.surface.base, 4.5, "enforce"),
    mk("Border on base", c.surface.border, c.surface.base, 3, "info"),
  ];

  const failures = checks.filter((x) => x.severity === "enforce" && !x.pass);
  return { checks, failures, pass: failures.length === 0 };
}
