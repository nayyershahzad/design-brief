import { useMemo, useState } from "react";
import type { Direction } from "@design-brief/core";
import { seedDirections } from "@design-brief/core";
import { BriefForm, type Brief } from "./BriefForm";
import { DirectionGrid } from "./DirectionGrid";
import { PreviewRenderer } from "./PreviewRenderer";
import { TokenEditor } from "./TokenEditor";
import { ExportPanel } from "./ExportPanel";

export default function App() {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => directions.find((d) => d.id === selectedId) ?? null,
    [directions, selectedId],
  );

  function handleBrief(b: Brief) {
    const seeded = seedDirections(b.personality);
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
