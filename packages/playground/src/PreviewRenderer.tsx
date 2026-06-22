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

// Same fractal-noise overlay the CSS exporter ships, so the preview matches output.
const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Scoped motion + grain CSS derived from the Direction's tokens. Motion is
 * wrapped in prefers-reduced-motion so the preview honors the same rule the
 * export ships. Deterministic; no AI.
 */
function previewCss(d: Direction, scope: string): string {
  const m = d.motion;
  const out: string[] = [];

  const texture = d.color.surface.texture;
  if (texture && texture !== "none") {
    const op = texture === "noise" ? 0.07 : 0.035;
    out.push(
      `.${scope}.db-grain{position:relative;isolation:isolate;}` +
        `.${scope}.db-grain::after{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:${op};background-image:${NOISE_SVG};}`,
    );
  }

  if (m.level !== "none") {
    const rules: string[] = [
      `.${scope} .m-transition{transition:transform ${m.durationBase} ${m.easingStandard},opacity ${m.durationBase} ${m.easingStandard},box-shadow ${m.durationBase} ${m.easingStandard};}`,
    ];
    if (m.hover === "lift") rules.push(`.${scope} .m-hover:hover{transform:translateY(-2px);}`);
    if (m.hover === "scale") rules.push(`.${scope} .m-hover:hover{transform:scale(1.02);}`);
    if (m.hover === "glow")
      rules.push(`.${scope} .m-hover:hover{box-shadow:0 8px 30px -8px ${d.color.accent.primary};}`);
    if (m.press === "scale-down") rules.push(`.${scope} .m-pressable:active{transform:scale(0.98);}`);
    if (m.scrollReveal !== "none") {
      const from = m.scrollReveal === "fade" ? "opacity:0;" : "opacity:0;transform:translateY(10px);";
      rules.push(
        `.${scope} .m-reveal{animation:dbPvReveal ${m.durationBase} ${m.easingEntrance} both;}` +
          `@keyframes dbPvReveal{from{${from}}to{opacity:1;transform:none;}}`,
      );
    }
    out.push(`@media (prefers-reduced-motion: no-preference){${rules.join("")}}`);
  }
  return out.join("");
}

export function PreviewRenderer({ direction: d }: { direction: Direction }) {
  const primary = renderButton(d, { variant: "primary", label: "Deploy" });
  const ghost = renderButton(d, { variant: "ghost", label: "Cancel" });
  const input = renderInput(d, { placeholder: "Filter assets…" });
  const metrics = [
    renderMetricCard(d, { label: "Revenue", value: "1,204,338", delta: "+3.2%", trend: "up" }),
    renderMetricCard(d, { label: "Active users", value: "8,932", delta: "+1.1%", trend: "up" }),
    renderMetricCard(d, { label: "Error rate", value: "0.42%", delta: "-0.1%", trend: "down" }),
  ];

  const scope = `dbpv-${d.id}`;
  const hasGrain = !!d.color.surface.texture && d.color.surface.texture !== "none";
  const wrapperClass = ["rounded-lg overflow-hidden border", scope, hasGrain ? "db-grain" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={wrapperClass}
      style={s({
        borderColor: d.color.surface.border,
        background: d.color.surface.base,
        fontFamily: d.typography.fontSans,
      })}
    >
      <style>{previewCss(d, scope)}</style>
      {/* key=d.id remounts on direction switch so the scroll-reveal replays */}
      <div
        key={d.id}
        className="m-reveal"
        style={s({ padding: d.density.cellPaddingX, display: "grid", gap: d.density.sectionGap })}
      >
        {/* toolbar */}
        <div style={s({ display: "flex", gap: d.density.cellPaddingX, alignItems: "center" })}>
          <input readOnly value="" placeholder={input.placeholder} style={s({ ...input.style, flex: "1" })} />
          <button className="m-transition m-hover" style={s(ghost.style)}>
            {ghost.label}
          </button>
          <button className="m-transition m-hover m-pressable" style={s(primary.style)}>
            {primary.label}
          </button>
        </div>

        {/* metric cards */}
        <div style={s({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: d.density.cellPaddingX })}>
          {metrics.map((m, i) => (
            <div key={i} className="m-transition m-hover" style={s(m.container)}>
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
