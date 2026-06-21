import http from "node:http";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sirv from "sirv";
import open from "open";
import { detectContext } from "../detect.js";
import { safeWrite, type WriteResult } from "../writeFiles.js";

export interface PlayOptions {
  port: string;
  force: boolean;
  open: boolean;
}

/** Locate the built playground bundle relative to this compiled file. */
function findPlaygroundDist(): string | null {
  const here = dirname(fileURLToPath(import.meta.url)); // .../packages/cli/dist/commands
  const candidates = [
    join(here, "../../../playground/dist"),
    join(here, "../../playground/dist"),
  ];
  for (const c of candidates) {
    if (existsSync(join(c, "index.html"))) return c;
  }
  return null;
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

export async function playCommand(opts: PlayOptions): Promise<void> {
  const dist = findPlaygroundDist();
  if (!dist) {
    console.error(
      "design-brief: playground bundle not found.\n" +
        "Run `npm run build` in the repo first (the npx/clone path builds it via `prepare`).",
    );
    process.exitCode = 1;
    return;
  }

  const ctx = detectContext(process.cwd());
  const assets = sirv(dist, { dev: false, single: true });
  const port = Number(opts.port) || 4321;

  const server = http.createServer((req, res) => {
    const url = req.url ?? "/";

    if (url === "/api/context") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(detectContext(process.cwd())));
      return;
    }

    if (url === "/api/write" && req.method === "POST") {
      void readBody(req).then((body) => {
        try {
          const { css, tailwind, spec, force } = JSON.parse(body) as {
            css: string;
            tailwind: string;
            spec: string;
            force?: boolean;
          };
          const f = Boolean(force) || opts.force;
          const c = detectContext(process.cwd());
          const results: WriteResult[] = [
            safeWrite(c.targets.css, css, f),
            safeWrite(c.targets.tailwind, tailwind, f),
            safeWrite(c.targets.spec, spec, f),
          ];
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ results }));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
      return;
    }

    assets(req, res, () => {
      res.statusCode = 404;
      res.end("Not found");
    });
  });

  server.listen(port, () => {
    const at = `http://localhost:${port}/`;
    console.log(
      `\n  design-brief playground\n` +
        `  ➜  ${at}\n` +
        `  project: ${ctx.projectRoot}\n` +
        `  exports will land in: ${ctx.targets.css}, ${ctx.targets.tailwind}, ${ctx.targets.spec}\n` +
        `  (existing files are never overwritten without --force)\n`,
    );
    if (opts.open) {
      open(at).catch(() => console.log("  (could not open a browser automatically)"));
    }
  });
}
