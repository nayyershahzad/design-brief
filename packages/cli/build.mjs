// Bundle the CLI into a single self-contained dist/bin.js.
//
// Why bundle: the published/clone-run unit is the workspaces ROOT, but the bin's
// runtime deps (commander, sirv, open) and the workspace package @design-brief/core
// are not resolvable when the root is consumed via `npx github:...` / `npx
// design-brief` — npm only installs the root's own dependencies (none), and core
// isn't published to npm. Inlining them makes the bin runnable with zero external
// resolution. This is the "npx === clone" guarantee in CLAUDE.md.
//
// @design-brief/remix stays EXTERNAL: it's the optional, deletable AI layer the CLI
// loads via a runtime dynamic import. Keeping it external preserves the M4 isolation
// (the bundle has no build-time dependency on remix) and its graceful absence.
import { build } from "esbuild";
import { rmSync } from "node:fs";

// Clean stale output first: the bundle is a single self-contained file, so any
// leftover per-module tsc emit from an older build must not linger and ship.
rmSync("dist", { recursive: true, force: true });

await build({
  entryPoints: ["src/bin.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  outfile: "dist/bin.js",
  external: ["@design-brief/remix"],
  // The bundle inlines CJS deps (commander, sirv) whose internals call require()
  // for Node builtins. In an ESM bundle there's no ambient require, so esbuild's
  // shim throws "Dynamic require of …". Provide a real require via createRequire.
  banner: {
    js: [
      "#!/usr/bin/env node",
      "import { createRequire as __db_createRequire } from 'node:module';",
      "const require = __db_createRequire(import.meta.url);",
    ].join("\n"),
  },
  logLevel: "info",
});
