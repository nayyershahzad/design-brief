import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Key,
  type ReactNode,
  type RefObject,
} from "react";
import type { AppType, Direction } from "@design-brief/core";
import { renderButton, renderInput, renderMetricCard, renderTableRow } from "@design-brief/core";

// The render fns return camelCase string maps; cast to CSSProperties for React.
const s = (o: Record<string, string>): CSSProperties => o as CSSProperties;

/** A type-scale step in px, with a sensible fallback if the scale is short. */
function fs(d: Direction, i: number): string {
  const def = [11, 13, 16, 20, 28];
  return `${d.typography.scale[i] ?? def[i] ?? 14}px`;
}
function heaviest(d: Direction): number {
  return Number(d.typography.weights[d.typography.weights.length - 1] ?? 600);
}

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

function heroHeadlineStyle(d: Direction, big = false): CSSProperties {
  const top = d.typography.scale[d.typography.scale.length - 1] ?? 28;
  const size = big ? Math.round(top * 1.35) : top;
  return {
    fontFamily: d.typography.fontSans,
    fontSize: `${size}px`,
    fontWeight: heaviest(d),
    color: d.color.text.primary,
    lineHeight: 1.05,
    letterSpacing: big ? "-0.02em" : undefined,
    margin: 0,
  };
}

function kineticHeadline(d: Direction, style: CSSProperties, text: string): ReactNode {
  const k = d.motion.kineticText;
  if (!k || k === "none") return <div style={style}>{text}</div>;
  if (k === "shimmer")
    return (
      <div className="db-kinetic-shimmer" style={style}>
        {text}
      </div>
    );
  const parts = k === "rise-words" ? text.split(/(\s+)/) : text.split("");
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

// --- shared scene context + reusable primitives ---------------------------

interface SceneCtx {
  d: Direction;
  m: Direction["motion"];
  scrollRef: RefObject<HTMLDivElement | null>;
  revealEnabled: boolean;
  scrollTop: number;
  parallaxDepth: number;
}

function reveal(ctx: SceneCtx, key: Key, children: ReactNode, style?: CSSProperties): ReactNode {
  return (
    <Reveal
      key={key}
      rootRef={ctx.scrollRef}
      enabled={ctx.revealEnabled}
      duration={ctx.m.durationBase}
      easing={ctx.m.easingEntrance}
      style={style}
    >
      {children}
    </Reveal>
  );
}

function CTA({
  d,
  label,
  variant = "primary",
  press = true,
}: {
  d: Direction;
  label: string;
  variant?: "primary" | "ghost";
  press?: boolean;
}) {
  const b = renderButton(d, { variant, label });
  return (
    <button className={["m-transition", "m-hover", press ? "m-pressable" : ""].filter(Boolean).join(" ")} style={s(b.style)}>
      {b.label}
    </button>
  );
}

function Bar({ d, w = "100%", h = 9, dim = 0.4 }: { d: Direction; w?: string | number; h?: number; dim?: number }) {
  return <div style={{ width: w, height: h, borderRadius: 999, background: d.color.text.secondary, opacity: dim }} />;
}

function Media({ d, h = 96, label, radius }: { d: Direction; h?: number; label?: string; radius?: string }) {
  return (
    <div
      style={{
        height: h,
        borderRadius: radius ?? d.shape.radiusLarge,
        border: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
        background: `linear-gradient(135deg, ${d.color.accent.muted} 0%, ${d.color.surface.raised} 100%)`,
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
      }}
    >
      {label && (
        <span style={{ padding: "8px 10px", fontSize: fs(d, 0), color: d.color.text.secondary, fontFamily: d.typography.fontSans }}>
          {label}
        </span>
      )}
    </div>
  );
}

function Card({ d, children, style }: { d: Direction; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      className="m-transition m-hover"
      style={{
        background: d.color.surface.raised,
        border: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
        borderRadius: d.shape.radiusLarge,
        padding: d.density.cellPaddingX,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SearchInput({ d, placeholder, flex }: { d: Direction; placeholder?: string; flex?: boolean }) {
  const i = renderInput(d, { placeholder });
  return <input readOnly value="" placeholder={i.placeholder} style={s({ ...i.style, ...(flex ? { flex: "1" } : {}) })} />;
}

function Hero({
  ctx,
  headline,
  sub,
  ctas,
  big,
  compact,
}: {
  ctx: SceneCtx;
  headline: string;
  sub?: ReactNode;
  ctas?: ReactNode;
  big?: boolean;
  compact?: boolean;
}) {
  const { d, scrollTop, parallaxDepth } = ctx;
  const padY = compact ? "18px" : "30px";
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: d.density.cellPaddingX,
        paddingTop: padY,
        paddingBottom: padY,
        borderBottom: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
      }}
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
      <div style={{ position: "relative", display: "grid", gap: "10px" }}>
        {kineticHeadline(d, heroHeadlineStyle(d, big), headline)}
        {sub && (
          <div style={{ color: d.color.text.secondary, fontFamily: d.typography.fontSans, fontSize: fs(d, 1), maxWidth: "46ch" }}>
            {sub}
          </div>
        )}
        {ctas && <div style={{ display: "flex", gap: d.density.cellPaddingX, marginTop: "4px", flexWrap: "wrap", alignItems: "center" }}>{ctas}</div>}
      </div>
    </section>
  );
}

function NavBar({ d }: { d: Direction }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `10px ${d.density.cellPaddingX}`,
        borderBottom: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: 18, height: 18, borderRadius: d.shape.radius, background: d.color.accent.primary }} />
        <span style={{ fontFamily: d.typography.fontSans, fontWeight: heaviest(d), color: d.color.text.primary, fontSize: fs(d, 1) }}>Acme</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {["Features", "Pricing", "Docs"].map((t) => (
          <span key={t} style={{ fontSize: fs(d, 1), color: d.color.text.secondary, fontFamily: d.typography.fontSans }}>
            {t}
          </span>
        ))}
        <CTA d={d} label="Get started" />
      </div>
    </div>
  );
}

function CardTitle({ d, children }: { d: Direction; children: ReactNode }) {
  return (
    <div style={{ color: d.color.text.primary, fontFamily: d.typography.fontSans, fontSize: fs(d, 2), fontWeight: heaviest(d) }}>{children}</div>
  );
}

const sectionStyle = (d: Direction): CSSProperties => ({
  padding: d.density.cellPaddingX,
  display: "grid",
  gap: d.density.cellPaddingX,
});

// --- per-app-type scenes --------------------------------------------------

function MarketingScene(ctx: SceneCtx, brand = false): ReactNode {
  const { d } = ctx;
  const features = brand
    ? [
        { t: "Strategy", b: "Positioning that picks a fight worth having." },
        { t: "Identity", b: "A system, not a logo. Built to scale." },
        { t: "Motion", b: "Interfaces that move with intent." },
      ]
    : [
        { t: "Deterministic", b: "Previews render from tokens — no AI, instant." },
        { t: "Agent-ready", b: "Hand DESIGN_SPEC.md to your coding agent." },
        { t: "Offline", b: "No account, no cloud, no telemetry." },
      ];
  return (
    <>
      {!brand && <NavBar d={d} />}
      <Hero
        ctx={ctx}
        big={brand}
        headline={brand ? "We build brands that move." : "Ship it faster."}
        sub={
          brand
            ? "Strategy, identity, and motion for companies that refuse to blend in."
            : "Hover the buttons, scroll the panel — every motion here is exactly what the exported tokens specify."
        }
        ctas={
          <>
            <CTA d={d} label={brand ? "See our work" : "Deploy"} />
            <CTA d={d} label={brand ? "Get in touch" : "Docs"} variant="ghost" press={false} />
          </>
        }
      />
      {reveal(
        ctx,
        "features",
        <section style={sectionStyle(d)}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: d.density.cellPaddingX }}>
            {features.map((c, i) => (
              <Card key={i} d={d}>
                <CardTitle d={d}>{c.t}</CardTitle>
                <div style={{ color: d.color.text.secondary, fontFamily: d.typography.fontSans, fontSize: fs(d, 1), marginTop: "4px" }}>{c.b}</div>
              </Card>
            ))}
          </div>
        </section>,
      )}
      {reveal(
        ctx,
        "logos",
        <section style={{ ...sectionStyle(d), borderTop: `${d.shape.borderWidth} solid ${d.color.surface.border}` }}>
          <div style={{ fontSize: fs(d, 0), color: d.color.text.secondary, textTransform: "uppercase", fontFamily: d.typography.fontSans, letterSpacing: "0.08em" }}>
            Trusted by teams everywhere
          </div>
          <div style={{ display: "flex", gap: d.density.cellPaddingX, alignItems: "center" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: 14, flex: "1", borderRadius: 999, background: d.color.text.secondary, opacity: 0.22 }} />
            ))}
          </div>
        </section>,
      )}
      {reveal(
        ctx,
        "cta",
        <section style={sectionStyle(d)}>
          <div
            style={{
              background: d.color.accent.primary,
              borderRadius: d.shape.radiusLarge,
              padding: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ color: d.color.accent.primaryForeground, fontFamily: d.typography.fontSans, fontWeight: heaviest(d), fontSize: fs(d, 2) }}>
              {brand ? "Let's build something." : "Start shipping today."}
            </div>
            <button
              className="m-transition m-hover m-pressable"
              style={{
                background: d.color.accent.primaryForeground,
                color: d.color.accent.primary,
                border: "none",
                borderRadius: d.shape.radius,
                padding: `0 ${d.density.cellPaddingX}`,
                height: d.density.rowHeight,
                fontFamily: d.typography.fontSans,
                fontWeight: heaviest(d),
                fontSize: fs(d, 1),
              }}
            >
              Get started
            </button>
          </div>
        </section>,
      )}
    </>
  );
}

function PortfolioScene(ctx: SceneCtx): ReactNode {
  const { d } = ctx;
  const projects = [
    { t: "Northwind", tag: "Brand" },
    { t: "Atlas", tag: "Product" },
    { t: "Cohere", tag: "Web" },
    { t: "Field Notes", tag: "Editorial" },
  ];
  return (
    <>
      <Hero ctx={ctx} big headline="Selected work." sub="A small studio. A few very good projects." ctas={<CTA d={d} label="About" variant="ghost" press={false} />} />
      {reveal(
        ctx,
        "grid",
        <section style={sectionStyle(d)}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: d.density.cellPaddingX }}>
            {projects.map((p, i) => (
              <div key={i} className="m-transition m-hover" style={{ display: "grid", gap: "8px" }}>
                <Media d={d} h={92} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <CardTitle d={d}>{p.t}</CardTitle>
                  <span style={{ fontSize: fs(d, 0), color: d.color.text.secondary, fontFamily: d.typography.fontSans }}>{p.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </section>,
      )}
      {reveal(
        ctx,
        "contact",
        <section style={{ ...sectionStyle(d), borderTop: `${d.shape.borderWidth} solid ${d.color.surface.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: d.typography.fontSans, color: d.color.text.primary, fontSize: fs(d, 2), fontWeight: heaviest(d) }}>Available for work</span>
            <CTA d={d} label="Say hello" />
          </div>
        </section>,
      )}
    </>
  );
}

function CommerceScene(ctx: SceneCtx): ReactNode {
  const { d } = ctx;
  const products = [
    { t: "Trail Jacket", p: "$128" },
    { t: "Wool Beanie", p: "$34" },
    { t: "Field Pack", p: "$210" },
    { t: "Down Vest", p: "$96" },
    { t: "Merino Tee", p: "$48" },
    { t: "Rain Shell", p: "$160" },
  ];
  return (
    <>
      <Hero ctx={ctx} compact headline="New season." sub="Fresh gear, built to last." ctas={<CTA d={d} label="Shop all" />} />
      {reveal(
        ctx,
        "toolbar",
        <section style={{ ...sectionStyle(d), gridAutoFlow: "row" }}>
          <div style={{ display: "flex", gap: d.density.cellPaddingX, alignItems: "center", flexWrap: "wrap" }}>
            <SearchInput d={d} placeholder="Search products…" flex />
            {["All", "Outerwear", "Accessories"].map((t, i) => (
              <span
                key={t}
                style={{
                  fontSize: fs(d, 0),
                  fontFamily: d.typography.fontSans,
                  padding: "4px 10px",
                  borderRadius: 999,
                  color: i === 0 ? d.color.accent.primaryForeground : d.color.text.secondary,
                  background: i === 0 ? d.color.accent.primary : "transparent",
                  border: `${d.shape.borderWidth} solid ${i === 0 ? d.color.accent.primary : d.color.surface.border}`,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </section>,
      )}
      {reveal(
        ctx,
        "products",
        <section style={sectionStyle(d)}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: d.density.cellPaddingX }}>
            {products.map((p, i) => (
              <Card key={i} d={d} style={{ display: "grid", gap: "8px" }}>
                <Media d={d} h={64} radius={d.shape.radius} />
                <div style={{ fontFamily: d.typography.fontSans, color: d.color.text.primary, fontSize: fs(d, 1) }}>{p.t}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: d.typography.fontMono, fontVariantNumeric: "tabular-nums", color: d.color.text.primary, fontSize: fs(d, 1) }}>{p.p}</span>
                  <CTA d={d} label="Add" />
                </div>
              </Card>
            ))}
          </div>
        </section>,
      )}
    </>
  );
}

function ContentScene(ctx: SceneCtx): ReactNode {
  const { d } = ctx;
  return (
    <>
      <Hero ctx={ctx} headline="The long road to good design." sub="By Sam Rivera · 8 min read · Design systems" />
      {reveal(
        ctx,
        "body",
        <section style={{ ...sectionStyle(d), maxWidth: "70ch" }}>
          <Media d={d} h={120} />
          <CardTitle d={d}>Why tokens beat opinions</CardTitle>
          {[1, 0.96, 0.99, 0.7].map((w, i) => (
            <Bar key={i} d={d} w={`${w * 100}%`} h={8} dim={0.35} />
          ))}
          <div style={{ borderLeft: `3px solid ${d.color.accent.primary}`, paddingLeft: "12px", color: d.color.text.primary, fontFamily: d.typography.fontSans, fontSize: fs(d, 2) }}>
            “Design is the contract between intent and implementation.”
          </div>
          {[0.98, 0.92, 0.75].map((w, i) => (
            <Bar key={`b${i}`} d={d} w={`${w * 100}%`} h={8} dim={0.35} />
          ))}
          <div>
            <code
              style={{
                fontFamily: d.typography.fontMono,
                fontSize: fs(d, 1),
                background: d.color.surface.raised,
                border: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
                borderRadius: d.shape.radius,
                padding: "2px 6px",
                color: d.color.text.primary,
              }}
            >
              npx design-brief play
            </code>
          </div>
        </section>,
      )}
      {reveal(
        ctx,
        "related",
        <section style={{ ...sectionStyle(d), borderTop: `${d.shape.borderWidth} solid ${d.color.surface.border}` }}>
          <div style={{ fontSize: fs(d, 0), color: d.color.text.secondary, textTransform: "uppercase", fontFamily: d.typography.fontSans, letterSpacing: "0.08em" }}>Related</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: d.density.cellPaddingX }}>
            {["Tokens in practice", "Motion that earns its place"].map((t, i) => (
              <Card key={i} d={d}>
                <CardTitle d={d}>{t}</CardTitle>
                <Bar d={d} w="60%" h={7} dim={0.3} />
              </Card>
            ))}
          </div>
        </section>,
      )}
    </>
  );
}

function DocsScene(ctx: SceneCtx): ReactNode {
  const { d } = ctx;
  const nav = ["Getting started", "Install", "CLI", "Schema", "Exports"];
  return (
    <>
      <Hero ctx={ctx} compact headline="Documentation" sub="Everything you need to ship with design-brief." ctas={<SearchInput d={d} placeholder="Search docs…" flex />} />
      {reveal(
        ctx,
        "doc",
        <section style={sectionStyle(d)}>
          <div style={{ display: "grid", gridTemplateColumns: "118px 1fr", gap: d.density.cellPaddingX }}>
            <nav style={{ display: "grid", gap: "8px", alignContent: "start" }}>
              {nav.map((t, i) => (
                <span
                  key={t}
                  style={{
                    fontSize: fs(d, 1),
                    fontFamily: d.typography.fontSans,
                    color: i === 1 ? d.color.accent.primary : d.color.text.secondary,
                    fontWeight: i === 1 ? heaviest(d) : 400,
                  }}
                >
                  {t}
                </span>
              ))}
            </nav>
            <div style={{ display: "grid", gap: d.density.cellPaddingX }}>
              <CardTitle d={d}>Install</CardTitle>
              {[0.95, 0.8].map((w, i) => (
                <Bar key={i} d={d} w={`${w * 100}%`} h={8} dim={0.35} />
              ))}
              <div
                style={{
                  background: d.color.surface.raised,
                  border: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
                  borderRadius: d.shape.radius,
                  padding: d.density.cellPaddingX,
                  fontFamily: d.typography.fontMono,
                  fontSize: fs(d, 1),
                  color: d.color.text.primary,
                  display: "grid",
                  gap: "2px",
                }}
              >
                <div>$ npx design-brief play</div>
                <div style={{ color: d.color.text.secondary }}># boots the local playground</div>
              </div>
              <div
                style={{
                  borderRadius: d.shape.radius,
                  border: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
                  borderLeft: `3px solid ${d.color.semantic.warning}`,
                  background: d.color.surface.raised,
                  padding: d.density.cellPaddingX,
                  fontSize: fs(d, 1),
                  color: d.color.text.primary,
                  fontFamily: d.typography.fontSans,
                }}
              >
                Note: tokens are the single source of truth.
              </div>
            </div>
          </div>
        </section>,
      )}
    </>
  );
}

function AppScene(ctx: SceneCtx): ReactNode {
  const { d } = ctx;
  const nav = ["Home", "Projects", "Team", "Settings"];
  return (
    <>
      <Hero ctx={ctx} compact headline="Good morning, Sam" sub="Here's what needs your attention." ctas={<CTA d={d} label="New project" />} />
      {reveal(
        ctx,
        "shell",
        <section style={sectionStyle(d)}>
          <div style={{ display: "grid", gridTemplateColumns: "108px 1fr", gap: d.density.cellPaddingX }}>
            <nav style={{ display: "grid", gap: "8px", alignContent: "start" }}>
              {nav.map((t, i) => (
                <span
                  key={t}
                  style={{
                    fontSize: fs(d, 1),
                    fontFamily: d.typography.fontSans,
                    color: i === 0 ? d.color.accent.primary : d.color.text.secondary,
                    fontWeight: i === 0 ? heaviest(d) : 400,
                  }}
                >
                  {t}
                </span>
              ))}
            </nav>
            <Card d={d} style={{ display: "grid", gap: d.density.cellPaddingY }}>
              <CardTitle d={d}>Create project</CardTitle>
              {["Project name", "Owner"].map((label) => {
                const inp = renderInput(d, { placeholder: "" });
                return (
                  <label key={label} style={{ display: "grid", gap: "4px" }}>
                    <span style={{ fontSize: fs(d, 0), color: d.color.text.secondary, fontFamily: d.typography.fontSans }}>{label}</span>
                    <input readOnly value="" placeholder="" style={s({ ...inp.style })} />
                  </label>
                );
              })}
              <div style={{ display: "flex", gap: d.density.cellPaddingX, marginTop: "4px" }}>
                <CTA d={d} label="Save" />
                <CTA d={d} label="Cancel" variant="ghost" press={false} />
              </div>
            </Card>
          </div>
        </section>,
      )}
    </>
  );
}

function DashboardScene(ctx: SceneCtx): ReactNode {
  const { d } = ctx;
  const metrics = [
    renderMetricCard(d, { label: "Revenue", value: "1,204,338", delta: "+3.2%", trend: "up" }),
    renderMetricCard(d, { label: "Active users", value: "8,932", delta: "+1.1%", trend: "up" }),
    renderMetricCard(d, { label: "Error rate", value: "0.42%", delta: "-0.1%", trend: "down" }),
  ];
  const HEADER = ["Asset", "Owner", "Status", "Value"];
  const ROWS: string[][] = [
    ["PV-1001", "ops", "live", "42,118"],
    ["LV-0001", "grid", "flushing", "9,204"],
    ["PV-1008", "noise", "review", "1,002"],
  ];
  return (
    <>
      <Hero
        ctx={ctx}
        compact
        headline="Overview"
        sub="Last 30 days"
        ctas={
          <>
            <SearchInput d={d} placeholder="Filter assets…" flex />
            <CTA d={d} label="Export" />
          </>
        }
      />
      {reveal(
        ctx,
        "metrics",
        <section style={sectionStyle(d)}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: d.density.cellPaddingX }}>
            {metrics.map((mc, i) => (
              <div key={i} className="m-transition m-hover" style={s(mc.container)}>
                <div style={s(mc.label)}>{mc.data.label}</div>
                <div style={s({ ...mc.value, marginTop: "4px", marginBottom: "2px" })}>{mc.data.value}</div>
                <div style={s(mc.delta)}>{mc.data.delta}</div>
              </div>
            ))}
          </div>
        </section>,
      )}
      {reveal(
        ctx,
        "table",
        <section style={sectionStyle(d)}>
          <div style={{ border: `${d.shape.borderWidth} solid ${d.color.surface.border}`, borderRadius: d.shape.radius, overflow: "hidden" }}>
            <div style={{ display: "flex", background: d.color.surface.raised }}>
              {HEADER.map((h, i) => (
                <div
                  key={h}
                  style={{
                    flex: "1",
                    padding: `${d.density.cellPaddingY} ${d.density.cellPaddingX}`,
                    color: d.color.text.secondary,
                    textTransform: "uppercase",
                    fontSize: fs(d, 0),
                    textAlign: i === HEADER.length - 1 ? "right" : "left",
                  }}
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
        </section>,
      )}
    </>
  );
}

function MobileScene(ctx: SceneCtx): ReactNode {
  const { d } = ctx;
  const items = [
    { t: "Stand-up notes", s: "9:00 AM" },
    { t: "Review PR #482", s: "11:30 AM" },
    { t: "Ship release", s: "4:00 PM" },
  ];
  return (
    <section style={{ padding: d.density.cellPaddingX, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: 300,
          border: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
          borderRadius: 26,
          overflow: "hidden",
          background: d.color.surface.base,
        }}
      >
        <div style={{ padding: `16px ${d.density.cellPaddingX} 10px`, borderBottom: `${d.shape.borderWidth} solid ${d.color.surface.border}` }}>
          {kineticHeadline(d, { ...heroHeadlineStyle(d), fontSize: fs(d, 3) }, "Today")}
          <div style={{ color: d.color.text.secondary, fontFamily: d.typography.fontSans, fontSize: fs(d, 0), marginTop: "2px" }}>3 tasks</div>
        </div>
        <div style={{ display: "grid", gap: d.density.cellPaddingY, padding: d.density.cellPaddingX }}>
          {items.map((it, i) =>
            reveal(
              ctx,
              `m${i}`,
              <Card d={d} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: d.typography.fontSans, color: d.color.text.primary, fontSize: fs(d, 1) }}>{it.t}</div>
                  <div style={{ fontFamily: d.typography.fontMono, color: d.color.text.secondary, fontSize: fs(d, 0) }}>{it.s}</div>
                </div>
                <div style={{ width: 16, height: 16, borderRadius: 999, border: `2px solid ${d.color.accent.primary}` }} />
              </Card>,
            ),
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0", borderTop: `${d.shape.borderWidth} solid ${d.color.surface.border}` }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: 999, background: i === 0 ? d.color.accent.primary : d.color.text.secondary, opacity: i === 0 ? 1 : 0.3 }} />
          ))}
        </div>
      </div>
    </section>
  );
}

function sceneSections(scene: AppType, ctx: SceneCtx): ReactNode {
  switch (scene) {
    case "commerce":
      return CommerceScene(ctx);
    case "content":
      return ContentScene(ctx);
    case "docs":
      return DocsScene(ctx);
    case "app":
      return AppScene(ctx);
    case "dashboard":
      return DashboardScene(ctx);
    case "mobile":
      return MobileScene(ctx);
    case "portfolio":
      return PortfolioScene(ctx);
    case "brand":
      return MarketingScene(ctx, true);
    case "marketing":
    default:
      return MarketingScene(ctx);
  }
}

export function PreviewRenderer({ direction: d, appType }: { direction: Direction; appType?: AppType }) {
  const m = d.motion;
  const reduced = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const scene: AppType = appType ?? d.appTypes[0] ?? "marketing";

  // Reset scroll + progress when the direction OR the rendered scene changes.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setProgress(0);
    setScrollTop(0);
  }, [d.id, scene]);

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
  const parallaxDepth = !reduced && m.scroll && m.scroll.parallax !== "none" ? (m.scroll.parallax === "bold" ? 0.28 : 0.12) : 0;
  const revealEnabled = m.scrollReveal !== "none" && !reduced;

  const ctx: SceneCtx = { d, m, scrollRef, revealEnabled, scrollTop, parallaxDepth };

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
        key={`${d.id}:${scene}`}
        ref={scrollRef}
        onScroll={onScroll}
        style={{ maxHeight: "460px", overflowY: "auto", position: "relative", zIndex: 1 }}
      >
        {sceneSections(scene, ctx)}
      </div>
    </div>
  );
}
