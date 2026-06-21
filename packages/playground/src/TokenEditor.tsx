import type { Direction } from "@design-brief/core";
import { DirectionSchema } from "@design-brief/core";

const ROW_HEIGHT: Record<Direction["density"]["level"], string> = {
  compact: "32px",
  balanced: "40px",
  comfortable: "48px",
};

export function TokenEditor({
  direction: d,
  onChange,
}: {
  direction: Direction;
  onChange: (d: Direction) => void;
}) {
  // Apply a mutation to a clone, mark it hand-tweaked, validate, then emit.
  // Invalid intermediate states are dropped rather than crashing the preview.
  function patch(mut: (draft: Direction) => void) {
    const next = structuredClone(d);
    mut(next);
    next.provenance.remixed = true;
    const parsed = DirectionSchema.safeParse(next);
    if (parsed.success) onChange(parsed.data);
  }

  function colorField(label: string, value: string, set: (v: string) => void) {
    return (
      <label className="flex items-center justify-between gap-2 text-xs">
        <span className="text-neutral-600">{label}</span>
        <span className="flex items-center gap-2">
          <code className="text-[10px] text-neutral-400">{value}</code>
          <input
            type="color"
            value={value}
            onChange={(e) => set(e.target.value)}
            className="h-6 w-8 rounded border border-neutral-300 bg-transparent p-0"
          />
        </span>
      </label>
    );
  }

  const radiusPx = parseInt(d.shape.radius, 10) || 0;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-neutral-600">Tweak tokens</h3>

      <fieldset className="space-y-2">
        <legend className="text-[11px] uppercase tracking-wide text-neutral-400">Color</legend>
        {colorField("Surface base", d.color.surface.base, (v) => patch((x) => { x.color.surface.base = v; }))}
        {colorField("Surface raised", d.color.surface.raised, (v) => patch((x) => { x.color.surface.raised = v; }))}
        {colorField("Border", d.color.surface.border, (v) => patch((x) => { x.color.surface.border = v; }))}
        {colorField("Text primary", d.color.text.primary, (v) => patch((x) => { x.color.text.primary = v; }))}
        {colorField("Text secondary", d.color.text.secondary, (v) => patch((x) => { x.color.text.secondary = v; }))}
        {colorField("Accent", d.color.accent.primary, (v) => patch((x) => { x.color.accent.primary = v; }))}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-[11px] uppercase tracking-wide text-neutral-400">Shape</legend>
        <label className="flex items-center justify-between gap-3 text-xs">
          <span className="text-neutral-600 whitespace-nowrap">Radius {radiusPx}px</span>
          <input
            type="range"
            min={0}
            max={24}
            value={radiusPx}
            onChange={(e) => patch((x) => { x.shape.radius = `${e.target.value}px`; })}
            className="w-full"
          />
        </label>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-[11px] uppercase tracking-wide text-neutral-400">Density</legend>
        <select
          value={d.density.level}
          onChange={(e) =>
            patch((x) => {
              const lvl = e.target.value as Direction["density"]["level"];
              x.density.level = lvl;
              x.density.rowHeight = ROW_HEIGHT[lvl];
            })
          }
          className="w-full text-xs border border-neutral-300 rounded px-2 py-1"
        >
          <option value="compact">compact</option>
          <option value="balanced">balanced</option>
          <option value="comfortable">comfortable</option>
        </select>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-[11px] uppercase tracking-wide text-neutral-400">Type</legend>
        <label className="flex items-center justify-between gap-2 text-xs">
          <span className="text-neutral-600">Sans</span>
          <input
            value={d.typography.fontSans}
            onChange={(e) => patch((x) => { x.typography.fontSans = e.target.value; })}
            className="border border-neutral-300 rounded px-2 py-1 w-40"
          />
        </label>
        <label className="flex items-center justify-between gap-2 text-xs">
          <span className="text-neutral-600">Mono</span>
          <input
            value={d.typography.fontMono}
            onChange={(e) => patch((x) => { x.typography.fontMono = e.target.value; })}
            className="border border-neutral-300 rounded px-2 py-1 w-40"
          />
        </label>
      </fieldset>
    </div>
  );
}
