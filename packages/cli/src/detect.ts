import { existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";

export interface ProjectContext {
  projectRoot: string;
  targets: { css: string; tailwind: string; spec: string };
  exists: { css: boolean; tailwind: boolean; spec: boolean };
}

/** Walk up from `start` to the nearest dir containing package.json; fall back to `start`. */
export function findProjectRoot(start: string): string {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, "package.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return start;
    dir = parent;
  }
}

// Common globals.css locations, most-specific first.
const CSS_CANDIDATES = [
  "app/globals.css",
  "src/app/globals.css",
  "src/globals.css",
  "styles/globals.css",
  "src/styles/globals.css",
  "src/index.css",
  "globals.css",
];

/**
 * Detect where exports should land for the project at `cwd`.
 * - css: an existing globals.css if found, else `<root>/globals.css`.
 * - tailwind: a safe sidecar `design-brief.theme.json` (never clobbers tailwind.config).
 * - spec: `DESIGN_SPEC.md` at the project root.
 */
export function detectContext(cwd: string): ProjectContext {
  const root = findProjectRoot(cwd);
  const css =
    CSS_CANDIDATES.map((c) => join(root, c)).find((p) => existsSync(p)) ?? join(root, "globals.css");
  const tailwind = join(root, "design-brief.theme.json");
  const spec = join(root, "DESIGN_SPEC.md");
  return {
    projectRoot: root,
    targets: { css, tailwind, spec },
    exists: { css: existsSync(css), tailwind: existsSync(tailwind), spec: existsSync(spec) },
  };
}

/** Project-relative display path for logs/config. */
export function rel(root: string, path: string): string {
  return relative(root, path) || path;
}
