// Ordered build helper for the OPTIONAL remix package.
//
// remix is isolated and deletable (CLAUDE.md M4): the clean-clone build must
// still succeed when packages/remix is gone. A bare `npm run build -w
// @design-brief/remix` errors with "No workspaces found" once the package is
// deleted, which would break the root build / prepare. So we gate on presence:
// build it when it's here, silently skip it when it isn't.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

if (!existsSync(join(root, "packages/remix/package.json"))) {
  console.log("build-remix: packages/remix absent — skipping (optional package).");
  process.exit(0);
}

const result = spawnSync("npm", ["run", "build", "-w", "@design-brief/remix"], {
  stdio: "inherit",
  cwd: root,
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
