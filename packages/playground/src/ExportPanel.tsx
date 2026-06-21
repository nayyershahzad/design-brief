import { useMemo, useState } from "react";
import type { Direction } from "@design-brief/core";
import { exportBundle } from "@design-brief/core";

type Tab = "css" | "tailwind" | "spec";

const TAB_LABEL: Record<Tab, string> = {
  css: "globals.css",
  tailwind: "tailwind",
  spec: "DESIGN_SPEC.md",
};

export function ExportPanel({ direction }: { direction: Direction }) {
  const [locked, setLocked] = useState(false);
  const [tab, setTab] = useState<Tab>("css");

  // Everything derives from the one Direction — they cannot drift.
  const bundle = useMemo(() => exportBundle(direction), [direction]);
  const text = tab === "css" ? bundle.css : tab === "tailwind" ? bundle.tailwind : bundle.spec;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable; ignore */
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
    <div className="border-t border-neutral-200 pt-4 space-y-2">
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

      <pre className="text-[10px] leading-relaxed bg-neutral-950 text-neutral-100 rounded p-3 overflow-auto max-h-72 whitespace-pre-wrap">
        {text}
      </pre>

      <button
        onClick={() => setLocked(false)}
        className="text-xs text-neutral-500 hover:text-neutral-900 underline"
      >
        unlock / keep editing
      </button>
      <p className="text-[11px] text-neutral-400">
        Writing these into your project happens via the CLI (<code>npx design-brief play</code>) —
        coming in M3.
      </p>
    </div>
  );
}
