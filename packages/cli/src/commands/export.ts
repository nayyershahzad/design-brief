import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { exportBundle, parseDirection } from "@design-brief/core";
import { safeWrite } from "../writeFiles.js";

export interface ExportOptions {
  out: string;
  force: boolean;
}

/** Headless export: read a saved Direction JSON, validate, and write the bundle. */
export async function exportCommand(file: string, opts: ExportOptions): Promise<void> {
  const raw = JSON.parse(readFileSync(resolve(file), "utf8"));
  const direction = parseDirection(raw); // boundary validation
  const bundle = exportBundle(direction);
  const out = resolve(opts.out);

  const results = [
    safeWrite(join(out, "globals.css"), bundle.css, opts.force),
    safeWrite(join(out, "design-brief.theme.json"), bundle.tailwind, opts.force),
    safeWrite(join(out, "DESIGN_SPEC.md"), bundle.spec, opts.force),
  ];

  for (const r of results) {
    console.log(`  ${r.status.padEnd(14)} ${r.path}`);
  }
  if (results.some((r) => r.status === "skipped-exists")) {
    console.log("\n  Some files already exist. Re-run with --force to overwrite.");
  }
}
