import { join } from "node:path";
import { detectContext, rel } from "../detect.js";
import { safeWrite } from "../writeFiles.js";

/** Scaffold a .design-brief/config.json recording where exports should land. */
export async function initCommand(): Promise<void> {
  const ctx = detectContext(process.cwd());
  const config = {
    targets: {
      css: rel(ctx.projectRoot, ctx.targets.css),
      tailwind: rel(ctx.projectRoot, ctx.targets.tailwind),
      spec: rel(ctx.projectRoot, ctx.targets.spec),
    },
  };
  const path = join(ctx.projectRoot, ".design-brief", "config.json");
  const r = safeWrite(path, JSON.stringify(config, null, 2) + "\n", false);
  console.log(`  ${r.status} ${r.path}`);
  if (r.status === "skipped-exists") {
    console.log("  (config already exists; left untouched)");
  }
}
