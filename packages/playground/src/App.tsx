import { useEffect, useMemo, useState } from "react";
import type { Direction } from "@design-brief/core";
import { seedDirections } from "@design-brief/core";
import { BriefForm, type Brief } from "./BriefForm";
import { DirectionGrid } from "./DirectionGrid";
import { PreviewRenderer } from "./PreviewRenderer";
import { TokenEditor } from "./TokenEditor";
import { ExportPanel } from "./ExportPanel";

// Remix availability is reported by the CLI's /api/context. The playground only
// ever talks to remix over HTTP — it never imports the (optional) remix package.
interface RemixStatus {
  available: boolean;
  provider: string | null;
  label: string | null;
}

export default function App() {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [remix, setRemix] = useState<RemixStatus>({ available: false, provider: null, label: null });
  const [remixing, setRemixing] = useState(false);
  const [remixError, setRemixError] = useState<string | null>(null);

  // Detect whether the CLI host offers AI remix. Under plain `vite dev` (no CLI)
  // this fails and remix stays off — presets still work.
  useEffect(() => {
    let alive = true;
    fetch("/api/context")
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => alive && c?.remix && setRemix(c.remix))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const selected = useMemo(
    () => directions.find((d) => d.id === selectedId) ?? null,
    [directions, selectedId],
  );

  function handleBrief(b: Brief) {
    const seeded = seedDirections(b.personality, b.appFamily);
    setBrief(b);
    setDirections(seeded);
    setSelectedId(seeded[0]?.id ?? null);
  }

  function updateSelected(next: Direction) {
    setDirections((prev) => prev.map((d) => (d.id === next.id ? next : d)));
  }

  function reset() {
    setBrief(null);
    setDirections([]);
    setSelectedId(null);
    setRemixError(null);
  }

  // Seed a fresh direction from the AI, using the current selection as the base.
  async function handleRemix() {
    if (!brief || remixing) return;
    const seed = selected ?? directions[0];
    if (!seed) return;
    setRemixing(true);
    setRemixError(null);
    try {
      const res = await fetch("/api/remix", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ direction: seed, brief }),
      });
      const data = await res.json();
      if (!res.ok || !data.direction) {
        setRemixError(data.error ?? "Remix failed.");
        return;
      }
      const next = data.direction as Direction;
      // Avoid id collisions if the same remix lands twice.
      const id = directions.some((d) => d.id === next.id) ? `${next.id}-${directions.length}` : next.id;
      const tagged = { ...next, id };
      setDirections((prev) => [...prev, tagged]);
      setSelectedId(id);
    } catch (err) {
      setRemixError(err instanceof Error ? err.message : "Remix failed.");
    } finally {
      setRemixing(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 px-6 py-3 flex items-center justify-between">
        <div className="font-semibold">
          design-brief <span className="text-neutral-400 font-normal">· playground</span>
        </div>
        <div className="text-xs text-neutral-500">offline · no account · agent-agnostic</div>
      </header>

      {!brief ? (
        <BriefForm onSubmit={handleBrief} />
      ) : (
        <main className="grid grid-cols-[1fr_360px]">
          <section className="p-6 space-y-6 overflow-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-600">
                Directions for “{brief.appType}” · {brief.audience}
              </h2>
              <button
                onClick={reset}
                className="text-xs text-neutral-500 hover:text-neutral-900 underline"
              >
                start over
              </button>
            </div>

            <DirectionGrid directions={directions} selectedId={selectedId} onSelect={setSelectedId} />

            {remix.available && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRemix}
                  disabled={remixing}
                  className="text-sm border border-neutral-300 rounded px-3 py-1.5 font-medium text-neutral-700 hover:border-neutral-400 disabled:opacity-50"
                  title={remix.label ?? undefined}
                >
                  {remixing ? "Remixing…" : "✨ Remix a new direction with AI"}
                </button>
                <span className="text-[11px] text-neutral-400">
                  optional · uses {remix.label} · based on the selected direction
                </span>
              </div>
            )}
            {remixError && <p className="text-xs text-red-600">{remixError}</p>}

            {selected && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-neutral-600">Preview · {selected.label}</h3>
                <PreviewRenderer direction={selected} />
              </div>
            )}
          </section>

          <aside className="border-l border-neutral-200 p-4 space-y-6 overflow-auto h-[calc(100vh-49px)]">
            {selected && <TokenEditor direction={selected} onChange={updateSelected} />}
            {selected && <ExportPanel direction={selected} />}
          </aside>
        </main>
      )}
    </div>
  );
}
