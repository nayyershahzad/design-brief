import type { CSSProperties } from "react";
import type { Direction } from "@design-brief/core";
import { renderButton, renderInput, renderTableRow, renderMetricCard } from "@design-brief/core";

// The render fns return camelCase string maps; cast to CSSProperties for React.
const s = (o: Record<string, string>): CSSProperties => o as CSSProperties;

const HEADER = ["Asset", "Owner", "Status", "Value"];
const ROWS: string[][] = [
  ["PV-1001", "ops", "live", "42,118"],
  ["LV-0001", "grid", "flushing", "9,204"],
  ["PV-1008", "noise", "review", "1,002"],
];

export function PreviewRenderer({ direction: d }: { direction: Direction }) {
  const primary = renderButton(d, { variant: "primary", label: "Deploy" });
  const ghost = renderButton(d, { variant: "ghost", label: "Cancel" });
  const input = renderInput(d, { placeholder: "Filter assets…" });
  const metrics = [
    renderMetricCard(d, { label: "Revenue", value: "1,204,338", delta: "+3.2%", trend: "up" }),
    renderMetricCard(d, { label: "Active users", value: "8,932", delta: "+1.1%", trend: "up" }),
    renderMetricCard(d, { label: "Error rate", value: "0.42%", delta: "-0.1%", trend: "down" }),
  ];

  return (
    <div
      className="rounded-lg overflow-hidden border"
      style={s({
        borderColor: d.color.surface.border,
        background: d.color.surface.base,
        fontFamily: d.typography.fontSans,
      })}
    >
      <div style={s({ padding: d.density.cellPaddingX, display: "grid", gap: d.density.sectionGap })}>
        {/* toolbar */}
        <div style={s({ display: "flex", gap: d.density.cellPaddingX, alignItems: "center" })}>
          <input readOnly value="" placeholder={input.placeholder} style={s({ ...input.style, flex: "1" })} />
          <button style={s(ghost.style)}>{ghost.label}</button>
          <button style={s(primary.style)}>{primary.label}</button>
        </div>

        {/* metric cards */}
        <div style={s({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: d.density.cellPaddingX })}>
          {metrics.map((m, i) => (
            <div key={i} style={s(m.container)}>
              <div style={s(m.label)}>{m.data.label}</div>
              <div style={s({ ...m.value, marginTop: "4px", marginBottom: "2px" })}>{m.data.value}</div>
              <div style={s(m.delta)}>{m.data.delta}</div>
            </div>
          ))}
        </div>

        {/* table */}
        <div
          style={s({
            border: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
            borderRadius: d.shape.radius,
            overflow: "hidden",
          })}
        >
          <div style={s({ display: "flex", background: d.color.surface.raised })}>
            {HEADER.map((h, i) => (
              <div
                key={h}
                style={s({
                  flex: "1",
                  padding: `${d.density.cellPaddingY} ${d.density.cellPaddingX}`,
                  color: d.color.text.secondary,
                  textTransform: "uppercase",
                  fontSize: `${d.typography.scale[0] ?? 11}px`,
                  textAlign: i === HEADER.length - 1 ? "right" : "left",
                })}
              >
                {h}
              </div>
            ))}
          </div>
          {ROWS.map((cells, ri) => {
            const row = renderTableRow(
              d,
              cells.map((value, ci) => ({ value, numeric: ci === cells.length - 1 })),
            );
            return (
              <div key={ri} style={s({ ...row.style, display: "flex" })}>
                {row.cells.map((c, ci) => (
                  <div key={ci} style={s({ ...c.style, flex: "1" })}>
                    {c.value}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
