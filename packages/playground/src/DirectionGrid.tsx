import type { Direction } from "@design-brief/core";

export function DirectionGrid({
  directions,
  selectedId,
  onSelect,
}: {
  directions: Direction[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {directions.map((d) => {
        const active = d.id === selectedId;
        const swatches = [
          d.color.surface.base,
          d.color.surface.raised,
          d.color.accent.primary,
          d.color.text.primary,
        ];
        return (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
            className={`text-left rounded-lg border p-3 transition ${
              active
                ? "border-neutral-900 ring-1 ring-neutral-900"
                : "border-neutral-200 hover:border-neutral-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{d.label}</span>
              <span className="text-[10px] uppercase tracking-wide text-neutral-400">
                {d.colorScheme}
              </span>
            </div>
            <div className="flex gap-1 mt-2">
              {swatches.map((c, i) => (
                <span
                  key={i}
                  className="h-5 w-5 rounded border border-black/10"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="text-xs text-neutral-500 mt-2">{d.personality.join(" · ")}</div>
          </button>
        );
      })}
    </div>
  );
}
