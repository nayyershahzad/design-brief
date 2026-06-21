import { useEffect, useMemo, useState } from "react";
import type { Direction } from "@design-brief/core";
import { exportBundle } from "@design-brief/core";

type Tab = "css" | "tailwind" | "spec";

const TAB_LABEL: Record<Tab, string> = {
  css: "globals.css",
  tailwind: "tailwind",
  spec: "DESIGN_SPEC.md",
};

interface ProjectContext {
  projectRoot: string;
  targets: { css: string; tailwind: string; spec: string };
  exists: { css: boolean; tailwind: boolean; spec: boolean };
}

interface WriteResult {
  path: string;
  status: "created" | "overwritten" | "unchanged" | "skipped-exists";
}

export function ExportPanel({ direction }: { direction: Direction }) {
  const [locked, setLocked] = useState(false);
  const [tab, setTab] = useState<Tab>("css");
  const [ctx, setCtx] = useState<ProjectContext | null>(null);
  const [force, setForce] = useState(false);
  const [results, setResults] = useState<WriteResult[] | null>(null);
  const [writing, setWriting] = useState(false);

  // Detect whether we're served by the CLI (which exposes a write endpoint).
  // Under plain `vite dev` this fails and we fall back to copy-only.
  useEffect(() => {
    let alive = true;
    fetch("/api/context")
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => alive && setCtx(c))
      .catch(() => alive && setCtx(null));
    return () => {
      alive = false;
    };
  }, []);

  // Everything derives from the one Direction — the three artifacts cannot drift.
  const bundle = useMemo(() => exportBundle(direction), [direction]);
  const text = tab === "css" ? bundle.css : tab === "tailwind" ? bundle.tailwind : bundle.spec;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable; ignore */
    }
  }

  async function writeToProject() {
    setWriting(true);
    setResults(null);
    try {
      const res = await fetch("/api/write", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ css: bundle.css, tailwind: bundle.tailwind, spec: bundle.spec, force }),
      });
      const data = await res.json();
      setResults(data.results ?? null);
    } catch {
      setResults(null);
    } finally {
      setWriting(false);
    }
  }

  if (!locked) {
    return (
      <div className="border-t border-neutral-200 pt-4">
        <button
          onClick={() => setLocked(true)}
          className="w-full bg-neutral-900 text-white rounded px-4 py-2 font-medium hover:bg-neutral-800"
        >
          Lock this direction →
        </button>
        <p className="text-[11px] text-neutral-400 mt-2">
          Locking derives globals.css, the tailwind config, and DESIGN_SPEC.md from this one
          Direction.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-neutral-200 pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-2 py-1 rounded ${
                tab === t ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {TAB_LABEL[t]}
            </button>
          ))}
        </div>
        <button onClick={copy} className="text-xs text-neutral-500 hover:text-neutral-900 underline">
          copy
        </button>
      </div>

      <pre className="text-[10px] leading-relaxed bg-neutral-950 text-neutral-100 rounded p-3 overflow-auto max-h-60 whitespace-pre-wrap">
        {text}
      </pre>

      {ctx ? (
        <div className="space-y-2 rounded border border-neutral-200 p-3">
          <div className="text-xs text-neutral-600">
            Write into <code className="text-neutral-900">{ctx.projectRoot}</code>
          </div>
          <label className="flex items-center gap-2 text-[11px] text-neutral-500">
            <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
            overwrite existing files (--force)
          </label>
          <button
            onClick={writeToProject}
            disabled={writing}
            className="w-full bg-neutral-900 text-white rounded px-3 py-1.5 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            {writing ? "Writing…" : "Write to my project →"}
          </button>
          {results && (
            <ul className="text-[11px] space-y-0.5">
              {results.map((r) => (
                <li key={r.path} className="flex justify-between gap-2">
                  <span
                    className={
                      r.status === "skipped-exists" ? "text-amber-600" : "text-emerald-600"
                    }
                  >
                    {r.status}
                  </span>
                  <span className="text-neutral-400 truncate" title={r.path}>
                    {r.path}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-neutral-400">
          Run via <code>npx design-brief play</code> to write these straight into your project.
        </p>
      )}

      <button
        onClick={() => setLocked(false)}
        className="text-xs text-neutral-500 hover:text-neutral-900 underline"
      >
        unlock / keep editing
      </button>
    </div>
  );
}
