import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
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
const HEADLINE = "Ship it faster.";

// Same fractal-noise overlay the CSS exporter ships, so the preview matches output.
const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Live OS reduced-motion preference. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

/** Scoped hover/press/kinetic CSS derived from the tokens (reveal + scroll are JS-driven below). */
function previewCss(d: Direction, scope: string): string {
  const m = d.motion;
  const out: string[] = [];
  const texture = d.color.surface.texture;
  if (texture && texture !== "none") {
    const op = texture === "noise" ? 0.07 : 0.035;
    out.push(
      `.${scope}.db-grain::after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:${op};background-image:${NOISE_SVG};}`,
    );
  }
  if (m.level !== "none") {
    const rules: string[] = [
      `.${scope} .m-transition{transition:transform ${m.durationBase} ${m.easingStandard},box-shadow ${m.durationBase} ${m.easingStandard};}`,
    ];
    if (m.hover === "lift") rules.push(`.${scope} .m-hover:hover{transform:translateY(-2px);}`);
    if (m.hover === "scale") rules.push(`.${scope} .m-hover:hover{transform:scale(1.02);}`);
    if (m.hover === "glow")
      rules.push(`.${scope} .m-hover:hover{box-shadow:0 8px 30px -8px ${d.color.accent.primary};}`);
    if (m.press === "scale-down") rules.push(`.${scope} .m-pressable:active{transform:scale(0.98);}`);
    const k = m.kineticText;
    if (k && k !== "none") {
      if (k === "shimmer") {
        rules.push(
          `.${scope} .db-kinetic-shimmer{background:linear-gradient(90deg,currentColor 40%,${d.color.accent.primary} 50%,currentColor 60%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:dbKin 2.4s linear infinite;}` +
            `@keyframes dbKin{from{background-position:200% 0}to{background-position:-200% 0}}`,
        );
      } else {
        const frame =
          k === "rise-words"
            ? "from{opacity:0;transform:translateY(0.4em)}to{opacity:1;transform:none}"
            : "from{opacity:0}to{opacity:1}";
        const step = k === "rise-words" ? 80 : 40;
        rules.push(
          `.${scope} .db-kinetic>*{display:inline-block;white-space:pre;opacity:0;animation:dbKin ${m.durationBase} ${m.easingEntrance} forwards;}` +
            `@keyframes dbKin{${frame}}` +
            [2, 3, 4, 5, 6, 7, 8].map((n) => `.${scope} .db-kinetic>*:nth-child(${n}){animation-delay:${(n - 1) * step}ms}`).join(""),
        );
      }
    }
    out.push(`@media (prefers-reduced-motion: no-preference){${rules.join("")}}`);
  }
  return out.join("");
}

function kineticHeadline(d: Direction, style: CSSProperties): ReactNode {
  const k = d.motion.kineticText;
  if (!k || k === "none") return <div style={style}>{HEADLINE}</div>;
  if (k === "shimmer")
    return (
      <div className="db-kinetic-shimmer" style={style}>
        {HEADLINE}
      </div>
    );
  const parts = k === "rise-words" ? HEADLINE.split(/(\s+)/) : HEADLINE.split("");
  return (
    <div className="db-kinetic" style={style}>
      {parts.map((c, i) => (
        <span key={i}>{c}</span>
      ))}
    </div>
  );
}

/** Fades/rises its children in when scrolled into the preview viewport. */
function Reveal({
  rootRef,
  enabled,
  duration,
  easing,
  children,
  style,
}: {
  rootRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  duration: string;
  easing: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(!enabled);
  useEffect(() => {
    if (!enabled) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
      },
      { root: rootRef.current ?? null, threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, rootRef]);
  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(16px)",
        transition: enabled ? `opacity ${duration} ${easing}, transform ${duration} ${easing}` : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function PreviewRenderer({ direction: d }: { direction: Direction }) {
  const m = d.motion;
  const reduced = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Reset scroll + progress when the direction changes.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setProgress(0);
    setScrollTop(0);
  }, [d.id]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setScrollTop(el.scrollTop);
    setProgress(max > 0 ? el.scrollTop / max : 0);
  }

  const scope = `dbpv-${d.id}`;
  const hasGrain = !!d.color.surface.texture && d.color.surface.texture !== "none";

  const showProgress = !!m.scroll?.progress;
  const parallaxDepth =
    !reduced && m.scroll && m.scroll.parallax !== "none" ? (m.scroll.parallax === "bold" ? 0.28 : 0.12) : 0;
  const revealEnabled = m.scrollReveal !== "none" && !reduced;

  const primary = renderButton(d, { variant: "primary", label: "Deploy" });
  const ghost = renderButton(d, { variant: "ghost", label: "Docs" });
  const input = renderInput(d, { placeholder: "Filter assets…" });
  const metrics = [
    renderMetricCard(d, { label: "Revenue", value: "1,204,338", delta: "+3.2%", trend: "up" }),
    renderMetricCard(d, { label: "Active users", value: "8,932", delta: "+1.1%", trend: "up" }),
    renderMetricCard(d, { label: "Error rate", value: "0.42%", delta: "-0.1%", trend: "down" }),
  ];

  const headlineStyle: CSSProperties = {
    fontFamily: d.typography.fontSans,
    fontSize: `${d.typography.scale[d.typography.scale.length - 1] ?? 28}px`,
    fontWeight: d.typography.weights[d.typography.weights.length - 1] ?? 600,
    color: d.color.text.primary,
    lineHeight: 1.1,
    margin: 0,
  };

  return (
    <div
      className={["rounded-lg border relative overflow-hidden", scope, hasGrain ? "db-grain" : ""].filter(Boolean).join(" ")}
      style={s({ borderColor: d.color.surface.border, background: d.color.surface.base })}
    >
      <style>{previewCss(d, scope)}</style>

      {/* scroll-progress bar (only when the direction specifies one) */}
      {showProgress && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "3px",
            width: `${progress * 100}%`,
            background: d.color.accent.primary,
            zIndex: 10,
            transition: "width 80ms linear",
          }}
        />
      )}

      <div
        key={d.id}
        ref={scrollRef}
        onScroll={onScroll}
        style={{ maxHeight: "440px", overflowY: "auto", position: "relative", zIndex: 1 }}
      >
        {/* HERO — parallax media + kinetic headline + CTAs */}
        <section
          style={s({
            position: "relative",
            overflow: "hidden",
            padding: d.density.cellPaddingX,
            paddingTop: "28px",
            paddingBottom: "28px",
            borderBottom: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
          })}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "-40px 0 0 0",
              height: "180px",
              background: `radial-gradient(120% 80% at 70% 0%, ${d.color.accent.muted} 0%, transparent 70%)`,
              transform: `translateY(${scrollTop * parallaxDepth}px)`,
              willChange: "transform",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", display: "grid", gap: "12px" }}>
            {kineticHeadline(d, headlineStyle)}
            <div style={s({ color: d.color.text.secondary, fontFamily: d.typography.fontSans, fontSize: `${d.typography.scale[1] ?? 14}px`, maxWidth: "42ch" })}>
              Hover the buttons, scroll the panel — every motion here is exactly what the exported tokens specify.
            </div>
            <div style={{ display: "flex", gap: d.density.cellPaddingX }}>
              <button className="m-transition m-hover m-pressable" style={s(primary.style)}>
                {primary.label}
              </button>
              <button className="m-transition m-hover" style={s(ghost.style)}>
                {ghost.label}
              </button>
            </div>
          </div>
        </section>

        {/* FEATURE CARDS — reveal on scroll, hover */}
        <section style={s({ padding: d.density.cellPaddingX, display: "grid", gap: d.density.cellPaddingX })}>
          {[
            { t: "Deterministic", b: "Previews render from tokens — no AI, instant." },
            { t: "Agent-ready", b: "Lock a direction; hand DESIGN_SPEC.md to your agent." },
          ].map((c, i) => (
            <Reveal key={i} rootRef={scrollRef} enabled={revealEnabled} duration={m.durationBase} easing={m.easingEntrance}>
              <div
                className="m-transition m-hover"
                style={s({
                  background: d.color.surface.raised,
                  border: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
                  borderRadius: d.shape.radiusLarge,
                  padding: d.density.cellPaddingX,
                })}
              >
                <div style={s({ color: d.color.text.primary, fontFamily: d.typography.fontSans, fontSize: `${d.typography.scale[2] ?? 16}px`, fontWeight: String(d.typography.weights[d.typography.weights.length - 1] ?? 600) })}>
                  {c.t}
                </div>
                <div style={s({ color: d.color.text.secondary, fontFamily: d.typography.fontSans, fontSize: `${d.typography.scale[1] ?? 14}px`, marginTop: "4px" })}>
                  {c.b}
                </div>
              </div>
            </Reveal>
          ))}
        </section>

        {/* DASHBOARD SAMPLE — reveal on scroll */}
        <Reveal rootRef={scrollRef} enabled={revealEnabled} duration={m.durationBase} easing={m.easingEntrance}>
          <section style={s({ padding: d.density.cellPaddingX, display: "grid", gap: d.density.sectionGap })}>
            <div style={s({ display: "flex", gap: d.density.cellPaddingX, alignItems: "center" })}>
              <input readOnly value="" placeholder={input.placeholder} style={s({ ...input.style, flex: "1" })} />
              <button className="m-transition m-hover m-pressable" style={s(primary.style)}>
                {primary.label}
              </button>
            </div>

            <div style={s({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: d.density.cellPaddingX })}>
              {metrics.map((mc, i) => (
                <div key={i} className="m-transition m-hover" style={s(mc.container)}>
                  <div style={s(mc.label)}>{mc.data.label}</div>
                  <div style={s({ ...mc.value, marginTop: "4px", marginBottom: "2px" })}>{mc.data.value}</div>
                  <div style={s(mc.delta)}>{mc.data.delta}</div>
                </div>
              ))}
            </div>

            <div style={s({ border: `${d.shape.borderWidth} solid ${d.color.surface.border}`, borderRadius: d.shape.radius, overflow: "hidden" })}>
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
          </section>
        </Reveal>
      </div>
    </div>
  );
}
