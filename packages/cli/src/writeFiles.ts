import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export type WriteStatus = "created" | "overwritten" | "unchanged" | "skipped-exists";

export interface WriteResult {
  path: string;
  status: WriteStatus;
}

/**
 * Write `content` to `path`, never clobbering an existing, differing file
 * unless `force` is set. Returns what happened so callers can show a diff /
 * report skips.
 */
export function safeWrite(path: string, content: string, force: boolean): WriteResult {
  if (existsSync(path)) {
    const current = readFileSync(path, "utf8");
    if (current === content) return { path, status: "unchanged" };
    if (!force) return { path, status: "skipped-exists" };
    writeFileSync(path, content);
    return { path, status: "overwritten" };
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return { path, status: "created" };
}
