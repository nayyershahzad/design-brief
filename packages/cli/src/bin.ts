// The shebang is added by the esbuild bundle step (build.mjs), not here, to
// avoid a duplicate when bundling.
import { Command } from "commander";
import { playCommand } from "./commands/play.js";
import { initCommand } from "./commands/init.js";
import { exportCommand } from "./commands/export.js";

const program = new Command();

program
  .name("design-brief")
  .description(
    "Explore UI design directions locally, lock one, and export shadcn-native tokens + DESIGN_SPEC.md.",
  )
  .version("0.0.0");

program
  .command("play", { isDefault: true })
  .description("Boot the local playground and serve a write endpoint")
  .option("-p, --port <port>", "port to serve on", "4321")
  .option("--force", "overwrite existing files when locking", false)
  .option("--no-open", "do not open the browser automatically")
  .action(playCommand);

program
  .command("init")
  .description("Scaffold .design-brief/config.json in this project")
  .action(initCommand);

program
  .command("export")
  .argument("<file>", "path to a saved Direction JSON")
  .description("Headless export from a saved Direction JSON")
  .option("-o, --out <dir>", "output directory", ".")
  .option("--force", "overwrite existing files", false)
  .action(exportCommand);

await program.parseAsync();
