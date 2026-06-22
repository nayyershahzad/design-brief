# grain-dark-landing — what an agent builds from the tokens

This is a full, hand-built landing page composed **entirely from the design-brief `grain-dark` export**. It exists to answer one question: *"why doesn't the playground preview look like a real site (e.g. causaldynamics.com)?"*

**Because the preview is a token validator, not a website.** The "wow" comes from this next step — a developer or coding agent composing a real page **from the locked Direction**. This folder is that step, done by hand.

## The split (this is the whole point)

- **`globals.css`** — *machine-owned.* The verbatim design-brief export: shadcn CSS variables, `--db-*` motion tokens, `.db-*` utilities, the grain overlay. Regenerate it freely; never hand-edit.
- **`DESIGN_SPEC.md`** / **`design-brief.theme.json`** — the contract + theme, also exported.
- **`page.css`**, **`index.html`**, **`main.js`** — *agent-authored.* The layout, composition, copy, and scroll interactions a human/agent adds **on top of** the tokens. This CSS reads only `var(--…)` tokens and the `.db-*` utilities — it introduces no new colors, fonts, radii, or motion values.

That's the design-brief thesis in one folder: locked tokens (can't drift) + agent composition = a real, on-brand page.

## Run it

It's static — no build:

```bash
# from this folder
python3 -m http.server 8080      # then open http://localhost:8080
# or: npx serve .
```

Scroll the page: the progress bar fills, the hero mesh + card parallax, sections reveal on entry, buttons lift/press, the headline animates in — all driven by the grain-dark tokens, and all disabled under `prefers-reduced-motion`.

## Regenerate the tokens

```bash
# from the repo root, after npm run build
node -e "import('./packages/core/dist/index.js').then(m=>{const fs=require('fs');const b=m.exportBundle(m.presetsById['grain-dark']);fs.writeFileSync('examples/grain-dark-landing/globals.css',b.css)})"
```

Lock a *different* direction in the playground and drop its `globals.css` in here — the same page restyles itself, because every value comes from the tokens.
