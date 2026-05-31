# About the `markdown_linker` Bundler

How the `markdown_linker` userscript is built from modular source + shared libraries into a
single installable `*.user.js`, and how to build and deploy it.

> [!IMPORTANT]
> **Source vs. output — the one thing to get right.** The file you **edit** is
> `markdown_linker/bundler/src/markdown_linker.source.js`. The file
> `markdown_linker/markdown_linker.user.js` is a **generated build artifact** (a copy of the
> `esbuild` output) — do **not** hand-edit it; your changes will be overwritten on the next
> build. It looks "compiled/dry" because it is.

---

## Which userscripts use the bundler?

**Only `markdown_linker` is bundled.** Everything else in this repo is a plain, single-file
userscript with **no build step**:

- **Bundled:** `markdown_linker/markdown_linker.user.js` — built from
  `markdown_linker/bundler/src/markdown_linker.source.js` (the rest of this doc explains how).
- **Plain (edit directly, no build):** `amazon_item_blocker/amazon_sponsor.user.js`, and any
  future single-file userscripts. These are installed and edited as-is — there is no `dist/`,
  `bundler/`, or symlinked-library step for them.

> [!NOTE]
> Reach for the bundler only when a userscript needs to pull in shared libraries from `common/`
> (as `markdown_linker` does with `amazon_toolkit` and `youtube_toolkit`). A self-contained
> userscript does not need it.

---

## TL;DR — file roles

**Hand-edited (source):**

- `markdown_linker/bundler/src/markdown_linker.source.js` — **the source**: hand-written,
  fully commented, follows the userscript conventions.
- `markdown_linker/bundler/src/userscript.entry.js` — the `esbuild` entry point; imports the
  toolkits + the source. (Edited rarely.)
- `markdown_linker/bundler/package.json` — the build/watch `esbuild` scripts. (Edited rarely.)

**Linked, not copied (symlinks):**

- `markdown_linker/bundler/lib` → `common/amazon_toolkit`
- `markdown_linker/bundler/lib-youtube` → `common/youtube_toolkit`

**Generated — never hand-edit:**

- `markdown_linker/bundler/dist/markdown_linker.user.js` — the direct `esbuild` build output.
- `markdown_linker/markdown_linker.user.js` — a copy of the build output; the committed,
  installable artifact.

---

## Why two `markdown_linker.user.js`-shaped things exist

Historically `markdown_linker/markdown_linker.user.js` *was* the hand-written script. When the
bundler was introduced, the hand-written code moved to
`markdown_linker/bundler/src/markdown_linker.source.js`, and the original path became the home
of the **bundled output** instead. That is why:

- the source (`bundler/src/...source.js`) is the well-commented one, and
- `markdown_linker/markdown_linker.user.js` now looks compiled/minified — it is `esbuild`
  output (inlined libraries + CommonJS interop shims like `__commonJS`/`__require`).

> [!NOTE]
> Build output currently lands in **two** places: `bundler/dist/markdown_linker.user.js` (the
> direct `esbuild` output) and `markdown_linker/markdown_linker.user.js` (a manual copy kept in
> the repo as the canonical installable, referenced by the script's `@downloadURL`/`@updateURL`).
> Keeping the root copy in sync is currently a **manual `cp`** step (see Deploy below).

---

## The build flow

```text
                        bundler/lib  ──►  common/amazon_toolkit     (symlink)
                        bundler/lib-youtube ──► common/youtube_toolkit (symlink)
                                   │
src/markdown_linker.source.js ─────┤
                                   ▼
                    src/userscript.entry.js   (imports toolkits + source)
                                   │
                                   ▼  esbuild --bundle --format=iife
                    bundler/dist/markdown_linker.user.js   (+ injected // ==UserScript== banner)
                                   │  cp (manual)
                                   ▼
                    markdown_linker/markdown_linker.user.js   (installable artifact)
```

### The entry point

`markdown_linker/bundler/src/userscript.entry.js` is what `esbuild` bundles. It does nothing but
import the libraries (for their side effects / exports) and then the userscript source:

```javascript
// Amazon Toolkit modules (ensure window.__AmazonToolkitModules is populated)
import '../lib/helpers/validation_helpers.js';
import '../lib/extractors/shared_extractor.js';
// ...the rest of the amazon modules...
import '../lib/index.js';

// YouTube Toolkit (populates window.YouTubeToolkit via its require() graph)
import '../lib-youtube/index.js';

// Main Markdown Linker userscript source
import './markdown_linker.source.js';
```

### Why Amazon imports many files but YouTube imports only `index.js`

This difference is **intentional given how each library is wired**, and reflects that the two
toolkits follow *different* internal conventions:

- **`amazon_toolkit`** — `index.js` reads its submodules from a `window.__AmazonToolkitModules`
  registry. Each submodule self-registers into that global as a side effect when it executes.
  So every Amazon file must be imported individually in the entry point to run its registration
  before `index.js` reads the registry.
- **`youtube_toolkit`** — `index.js` uses plain CommonJS `require('./…')`. `esbuild` resolves
  that entire dependency graph starting from `index.js` alone, so a single import pulls in (and
  executes) every submodule. `window.YouTubeToolkit` ends up populated either way.

> [!TIP]
> The single-line YouTube import is **correct for the bundle**. The inconsistency between the two
> toolkits is a known item — the plan is to converge both on the simpler, more modern convention
> once it is verified in the browser.

### The build command

From `markdown_linker/bundler/package.json`:[^esbuild]

```zsh
esbuild src/userscript.entry.js \
  --bundle \
  --format=iife \
  --target=es2020 \
  --outfile=dist/markdown_linker.user.js \
  --banner:js="// ==UserScript== … // ==/UserScript==\n'use strict';"
```

- `--bundle` inlines every `import`/`require` into one file.
- `--format=iife` wraps it in an immediately-invoked function expression (a single self-contained
  script, the shape a userscript needs).
- `--banner:js=…` prepends the `// ==UserScript==` metadata block (name, `@match`, `@grant`,
  `@downloadURL`, etc.) so the output is a valid, installable userscript.

There is **no separate build wrapper script** — building is just `npm run build` (or
`npm run watch`). (`scripts/userscript/scaffold_userscript_project.zsh` scaffolds a *new* bundler
workspace; it does not build.)

---

## Build

```zsh
cd markdown_linker/bundler
npm install        # first time only (installs esbuild)
npm run build      # writes dist/markdown_linker.user.js
```

Watch mode rebuilds `dist/` on every save:

```zsh
cd markdown_linker/bundler
npm run watch
```

---

## Deploy / load into ViolentMonkey

After building, sync the installable artifact and load it. Two workflows:

### Quick: serve the file with `violentmonkey.zsh`

`./violentmonkey.zsh` serves a userscript over a local `http-server` so `ViolentMonkey` can track
it as an external URL and live-reload on change:

```zsh
# from repo root
cd markdown_linker/bundler && npm run build && cd -

# sync the committed installable artifact (manual copy step)
cp markdown_linker/bundler/dist/markdown_linker.user.js markdown_linker/markdown_linker.user.js

# serve it for live reload
./violentmonkey.zsh \
  --script markdown_linker/markdown_linker.user.js \
  --preferred-ip "127.0.0.1" \
  --debug
```

You can also point `--script` directly at `markdown_linker/bundler/dist/markdown_linker.user.js`
to skip the copy while iterating.

### Manual install

Open the `ViolentMonkey` dashboard, create/replace the script, and paste the contents of
`markdown_linker/markdown_linker.user.js`.

---

## Rules for agents

1. **Edit the source**, never the artifact: change
   `markdown_linker/bundler/src/markdown_linker.source.js`, then rebuild.
2. **Rebuild after editing** and **sync** `markdown_linker/markdown_linker.user.js` from
   `dist/` before committing, so the committed installable matches the source.
3. **Libraries live in `common/`** and are linked via the `lib`/`lib-youtube` symlinks — edit
   them there, not inside `bundler/`.
4. Follow the userscript conventions in
   [`.claude/rules/userscript-conventions.md`](../../.claude/rules/userscript-conventions.md)
   (auto-loads as a path-scoped rule when editing `**/*.user.js`).

---

## References

[^esbuild]: [esbuild — Bundling, formats, and the CLI API](https://esbuild.github.io/api/) — `--bundle`, `--format=iife`, `--target`, `--outfile`, `--banner`.
