import { describe, it, expect } from "vitest";
import { toShadcnCss, toDesignSpec } from "../src/export/index.js";
import { grainDark, voiceLight, warmSaas, terminal } from "../src/presets/index.js";

describe("M8 — advanced motion (scroll / parallax / kinetic)", () => {
  it("grain-dark emits scroll progress, parallax, and a kinetic headline", () => {
    const css = toShadcnCss(grainDark);
    expect(css).toContain(".db-scroll-progress");
    expect(css).toContain("animation-timeline: scroll(root block)");
    expect(css).toContain(".db-parallax");
    expect(css).toContain(".db-kinetic >"); // rise-words
  });

  it("voice-light: progress + kinetic, but no parallax (parallax: none)", () => {
    const css = toShadcnCss(voiceLight);
    expect(css).toContain(".db-scroll-progress");
    expect(css).toContain(".db-kinetic >"); // fade-chars
    expect(css).not.toContain(".db-parallax");
  });

  it("warm-saas: shimmer + parallax, but no progress bar (progress: false)", () => {
    const css = toShadcnCss(warmSaas);
    expect(css).toContain(".db-kinetic-shimmer");
    expect(css).toContain(".db-parallax");
    expect(css).not.toContain(".db-scroll-progress");
  });

  it("directions without advanced motion emit none of it", () => {
    const css = toShadcnCss(terminal);
    expect(css).not.toContain(".db-scroll-progress");
    expect(css).not.toContain(".db-parallax");
    expect(css).not.toContain(".db-kinetic");
  });

  it("all advanced motion is wrapped in prefers-reduced-motion", () => {
    // The advanced block is its own reduced-motion media query.
    const css = toShadcnCss(grainDark);
    const idx = css.indexOf(".db-scroll-progress");
    const guardBefore = css.lastIndexOf("@media (prefers-reduced-motion: no-preference)", idx);
    expect(guardBefore).toBeGreaterThan(-1);
  });

  it("DESIGN_SPEC documents advanced motion only when present", () => {
    const g = toDesignSpec(grainDark);
    expect(g).toContain("### Advanced motion");
    expect(g).toContain("Scroll progress");
    expect(g).toContain("Parallax");
    expect(g).toContain("Kinetic headline");
    expect(toDesignSpec(terminal)).not.toContain("### Advanced motion");
  });

  it("the tokens carry the advanced-motion settings", () => {
    expect(grainDark.motion.scroll?.progress).toBe(true);
    expect(grainDark.motion.scroll?.parallax).toBe("subtle");
    expect(grainDark.motion.kineticText).toBe("rise-words");
    expect(voiceLight.motion.kineticText).toBe("fade-chars");
    expect(warmSaas.motion.kineticText).toBe("shimmer");
  });
});
