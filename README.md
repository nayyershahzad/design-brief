# design-brief

> Explore UI design directions locally, pick one, and export shadcn-native tokens + a `DESIGN_SPEC.md` your coding agent can build against.

Open source. Runs on your laptop. No account, no cloud, agent-agnostic. Works fully offline with presets; optionally remixes new directions with your own API key.

For developers who are strong on backend and weak on UI: stop guessing at a design in prose and stop hand-tuning CSS variables one by one. Experiment visually, lock a direction, ship the contract to whatever agent (Claude Code, Cursor, Copilot) or hand-coding you prefer.

## Quick start

Requires **Node 22+** and **git**. From inside any project folder:

```bash
npx github:nayyershahzad/design-brief play
```

The first run clones and builds once (~30–60s), then it's cached. (A shorter npm-registry command is planned.)

This boots a local playground at `http://localhost:4321`, detects your project, and lets you compare design directions side by side. Lock one and it writes:

- `globals.css` — shadcn `:root` + `.dark` variable blocks
- `design-brief.theme.json` — `theme.extend` additions to merge into your `tailwind.config`
- `DESIGN_SPEC.md` — the human-readable design contract (intent + hard constraints + provenance)

The first two are machine-owned (regenerate freely) — so keep your hand-authored Tailwind directives in a separate file (see `examples/sample-next-app`). The spec is the human contract — it changes only when you re-lock a direction.

## Contributor setup

```bash
git clone https://github.com/nayyershahzad/design-brief
cd design-brief
npm install
npm run dev        # same playground, against the source
```

`npx` and `git clone` run the identical codebase — npx just wraps the published package.

## How it works

1. Brief — a few words: app type, audience, personality (e.g. "admin dashboard, power users, precise + dense").
2. Directions — the tool seeds 3–5 coherent directions from its preset library. Each is a complete token set (color, type pairing, radius, density, shape).
3. Experiment — tweak any direction visually; previews re-render deterministically from tokens (no AI, instant, free).
4. Lock — pick the winner. All exports derive from this one Direction object, so they can never drift apart.
5. Export — files land in your project. Feed `DESIGN_SPEC.md` to your agent, or build by hand.

## Optional: AI remix (bring your own key)

Presets are the floor. If you want novel directions beyond the library, set any one of:

```bash
export ANTHROPIC_API_KEY=...   # or
export OPENAI_API_KEY=...      # or
export OLLAMA_HOST=...          # fully local, no cloud, no key
```

Remix is isolated in its own package and provider-neutral. Delete the `remix/` folder and everything else still works — design-brief is not tied to any model or vendor.

## Why shadcn-native tokens

shadcn/ui is the dominant ecosystem, so exports drop into the largest set of existing projects with no translation. Pluggable adapters for MUI, Mantine, and plain CSS are on the roadmap.

## Design tokens schema

Every direction is one JSON object:

```json
{
  "id": "terminal",
  "label": "Terminal",
  "personality": ["precise", "dense", "technical"],
  "colorScheme": "dark-first",
  "color": { "accent": {}, "surface": {}, "text": {}, "semantic": {} },
  "typography": { "fontSans": "", "fontMono": "", "scale": [], "weights": [] },
  "shape": { "radius": "", "radiusLarge": "", "borderWidth": "" },
  "density": { "level": "", "rowHeight": "" },
  "provenance": { "seededFrom": "terminal", "remixed": false }
}
```

The schema is the contract. Previews render from it, exports serialize from it, presets are instances of it.

## Project layout

```
packages/
  cli/         npx entry, project detection, file writes
  playground/  local browser UI (Vite + React)
  core/        schema, presets, deterministic render, exporters — no AI, no UI
  remix/       optional, isolated AI layer (anthropic | openai | ollama)
```

`core/` and `playground/` have zero dependency on `remix/`. That is what keeps the tool agent-independent.

## License

MIT.
