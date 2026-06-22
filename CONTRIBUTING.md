# Contributing to design-brief

Thanks for your interest. design-brief is a small, local-first, agent-agnostic tool. The bar for changes is: **keep it clone-and-run clean, keep it offline-first, keep it vendor-neutral.**

## Setup

```bash
git clone https://github.com/nayyershahzad/design-brief
cd design-brief
npm install          # builds core → remix → cli → playground via the root `prepare`
npm run dev          # the playground against source, on http://localhost:4321
```

Requires **Node 22+** (`.nvmrc` pins it). The repo builds and tests fine on Node 20 with an `EBADENGINE` warning, but 22 is what CI runs.

## Repo layout

```
packages/
  core/        zod schema + presets + deterministic render + exporters — no AI, no UI
  playground/  local browser UI (Vite + React + Tailwind)
  cli/         npx entry: project detection, local server, file writes
  remix/       OPTIONAL, isolated AI layer (anthropic | openai | ollama)
```

## The rules that matter

These aren't style preferences — they're the invariants that keep the tool trustworthy. A PR that breaks one of them won't land.

1. **`core/` and `playground/` import nothing from `remix/`.** The entire `remix/` package must be deletable: with it gone, `core`, `cli`, and `playground` still build, test, run, and export. The CLI is the only thing that touches remix, and only through a guarded dynamic import — never a static dependency. CI enforces this (the `remix-deletable` job).
2. **Offline floor.** With no network and no API key, `npx design-brief play` must fully work via presets. AI is an optional enhancement, never a requirement.
3. **Deterministic previews and exports.** Previews and exports are pure functions of the Direction JSON. Never call an AI to render a preview or to produce CSS/spec output. Same input → byte-identical output (there are tests for this).
4. **Single source of truth.** Every export (CSS, tailwind theme, `DESIGN_SPEC.md`) derives from one locked `Direction`. They must not be able to drift apart. Validate unknown input with `DirectionSchema.parse()` / `parseDirection()` at every boundary (preset load, remix output, file import).
5. **shadcn-native exports.** CSS variables use shadcn's exact names; the tailwind output is `theme.extend`-compatible.
6. **No telemetry, ever. No framework bloat.** Don't add a dependency unless it clearly earns its place; prefer the platform.

## Working on the code

- **TypeScript, strict mode.** Match the surrounding code's style and comment density.
- **Write tests alongside the change**, in the package's `test/` dir (vitest). Run them with `npm test` (all workspaces) or `npm test -w @design-brief/core`.
- **Build order is owned by the root `package.json`** (`core → remix → cli → playground`). Don't add a per-workspace `prepare` — it races ahead of `core` on a clean install and breaks the clone build.

### Adding a preset

Presets live in `packages/core/src/presets/`. Each is one instance of the `Direction` schema, wrapped in `definePreset()` (which validates it at module load). To add one:

1. Create `packages/core/src/presets/<id>.ts` exporting a `definePreset({ ... })`.
2. Register it in `packages/core/src/presets/index.ts` (import + add to the `presets` array).
3. Give it distinct `personality` tags so `seedDirections` can rank it.

The preset tests assert every preset validates, ids are unique, and each carries a `primaryForeground` — keep those green.

## Before you open a PR

```bash
npm test          # all workspaces green
npm run build     # ordered build clean
```

CI runs `npm ci && npm test && npm run build` on Node 22, plus a job that deletes `packages/remix` and confirms the rest still builds and tests. Make sure both would pass.

Keep commits focused and the message explaining the *why*. Thanks for contributing.
