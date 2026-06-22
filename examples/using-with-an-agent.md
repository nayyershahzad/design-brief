# Using a design-brief export with an AI agent

design-brief produces a **design contract**, not a finished app. The point is to hand that contract to a code generator (or a human) and have them build a UI that matches it exactly — without you hand-tuning CSS.

## The flow

1. `npx github:nayyershahzad/design-brief play` (or `npx design-directions@latest play`).
2. Pick a direction, tweak tokens live, **lock** it.
3. Three files land in your project:
   - `globals.css` — shadcn CSS variables (+ `--db-*` motion vars and `.db-*` utilities)
   - `design-brief.theme.json` — `theme.extend` for your `tailwind.config`
   - `DESIGN_SPEC.md` — the contract (intent, hard constraints, component scope, motion, accessibility, and a generator-handoff section)
4. Hand all three to your tool of choice.

## v0 (Vercel)

v0 already speaks shadcn/ui + Tailwind. Paste the CSS-variable block, the theme JSON, and `DESIGN_SPEC.md`, then prompt:

> Build a pricing page as a **marketing** site using shadcn/ui + Tailwind. Treat DESIGN_SPEC.md as the binding contract — use only its tokens, follow its Hard constraints and Component scope, wire globals.css and design-brief.theme.json per its Install section, and implement the Motion section honoring prefers-reduced-motion.

Generated components inherit the tokens directly.

## Framer

Map the CSS variables to Framer color/text styles and the radius/spacing tokens to Framer tokens. Recreate the Motion section with Framer Motion, using the easing tokens (`--db-ease-standard`, `--db-ease-entrance`) as your bezier/spring values, and the `motion.scroll` / `motion.kineticText` guidance for scroll and headline effects.

## Claude Code / Cursor / coding agents

Drop the three files into the repo and point the agent at `DESIGN_SPEC.md`:

> Read DESIGN_SPEC.md and build the UI it describes. It contains the wiring steps, the component scope for this app type, the hard constraints, and the motion spec. Use only the tokens defined there.

Because every export derives from one locked `Direction`, the spec, the CSS, and the Tailwind theme can't drift — whatever the agent builds against the spec will match the tokens you locked.
