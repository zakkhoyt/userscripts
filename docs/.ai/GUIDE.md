# Agent Guide — Albuquerque Userscripts

This document is written for AI agents. Read it at the start of every session to build
a complete mental model of the repository without reading every source file from scratch.

> [!IMPORTANT]
> Before modifying any file, read the relevant instruction file in
> `.github/instructions/`. Those files are the **source of truth** for coding
> conventions. If code conflicts with instructions, the instructions win.

---

## What This Repository Is

A personal collection of `ViolentMonkey` / `GreaseMonkey` userscripts that run in
`Firefox` on macOS, plus a growing suite of reusable JavaScript toolkits that can be
consumed both from userscripts and from `Node.js` test harnesses.

The scripts enhance web pages by:

- Generating markdown-formatted links from any anchor or the current page URL
- Blocking sponsored product listings on Amazon
- (In progress) Modifying Amazon product display

Shared under `common/` are two modular toolkits:

- `common/amazon_toolkit/` — Amazon product/store data extraction and markdown generation
- `common/youtube_toolkit/` — YouTube video, channel, and playlist metadata extraction

---

## Environment & Platform

| Attribute        | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| OS               | macOS (tested on `26.1 Beta`)                                |
| Browser          | `Firefox` `144.0.2`                                          |
| Userscript host  | `ViolentMonkey` `2.31.0`                                     |
| Shell            | `zsh`                                                        |
| Bundler          | `esbuild` (in `markdown_linker/bundler/`)                    |
| Node.js (dev)    | Required for toolkit in `Node.js` context (`jsdom` dependency) |

---

## Repository Structure

```text
albuquerque/
├── .github/
│   ├── copilot-instructions.md        ← READ FIRST: architecture map + pitfalls
│   └── instructions/
│       ├── userscript-conventions.instructions.md  ← mandatory for *.user.js
│       ├── markdown-conventions.instructions.md    ← mandatory for *.md
│       └── zsh-conventions.instructions.md         ← mandatory for *.zsh
│
├── amazon_item_blocker/
│   └── amazon_sponsor.user.js         ← userscript: hides Amazon sponsored listings
│
├── amazon_modifier/
│   └── amazon_modifier.user.js.md     ← in-progress userscript (planning only)
│
├── common/                            ← reusable JS toolkits (browser + Node.js)
│   ├── amazon_toolkit/
│   │   ├── extractors/                ← JSON-LD/meta/HTML/regex fallback extractors
│   │   │   ├── product_extractor.js
│   │   │   ├── store_extractor.js
│   │   │   └── shared_extractor.js
│   │   ├── links/                     ← URL parsing, cleaning, image URL manipulation
│   │   │   ├── link_cleaner.js
│   │   │   ├── link_image.js
│   │   │   └── link_parser.js
│   │   ├── markdown/
│   │   │   ├── markdown_formatter.js
│   │   │   └── markdown_generator.js
│   │   ├── helpers/
│   │   │   └── validation_helpers.js
│   │   ├── index.js                   ← main exports for Node.js
│   │   ├── README.md                  ← API reference
│   │   └── IMPLEMENTATION_STATUS.md
│   ├── youtube_toolkit/
│   │   ├── extractors/
│   │   │   ├── video_extractor.js
│   │   │   ├── channel_extractor.js
│   │   │   ├── playlist_extractor.js
│   │   │   └── page_state_extractor.js
│   │   ├── helpers/
│   │   │   ├── dom_helpers.js
│   │   │   └── time_helpers.js
│   │   ├── index.js                   ← window.YouTubeToolkit (browser) / module.exports (Node.js)
│   │   └── README.md
│   └── docs/
│       ├── bunding_userscript_and_libraries.md   ← esbuild bundling guide
│       └── loading_libraries_from_violentmonkey.md
│
├── docs/
│   ├── ai/
│   │   └── GUIDE.md                   ← this file (AI agent bootstrapping)
│   ├── images/icons/
│   │   ├── amazon.png                 ← icon for inline prefixes in markdown
│   │   └── youtube.png                ← icon for inline prefixes in markdown
│   ├── notes/amazon_url/              ← Amazon URL anatomy, image URL reference
│   └── todo/
│       └── USERSCRIPT_REPO.md         ← open repo-level TODOs
│
├── images/                            ← screenshots used in README.md
│
├── markdown_linker/
│   ├── bundler/                       ← esbuild bundling pipeline
│   │   ├── dist/markdown_linker.user.js   ← bundled installable output
│   │   ├── src/
│   │   │   ├── markdown_linker.source.js  ← source (imports from common/)
│   │   │   └── userscript.entry.js        ← esbuild entry point
│   │   ├── lib/                       ← symlink → ../common
│   │   ├── package.json
│   │   └── node_modules/
│   ├── common/                        ← symlink → ../common
│   ├── docs/
│   │   └── INTEGRATE_AMAZON_TOOLKIT.md
│   ├── markdown_linker.user.js        ← PRIMARY SCRIPT (bundled, installable)
│   ├── markdown_linker.user.js.md     ← current feature work notes
│   └── markdown_linker.user.md        ← TODOs, ideas, historical context
│
├── scripts/
│   ├── userscript/
│   │   └── scaffold_userscript_project.zsh  ← scaffolds new userscript projects
│   └── violentmonkey/
│       └── violentmonkey.zsh          ← canonical location of dev tool
│
├── tests/                             ← HTML fixtures for manual validation
│
├── userscript_common/
│   ├── dom_helpers.js                 ← shared DOM utilities
│   └── logging_helpers.js             ← shared logging (log, logFunctionBegin, etc.)
│
├── .gitignore
├── README.md                          ← user-facing documentation
└── violentmonkey.zsh                  ← symlink → scripts/violentmonkey/violentmonkey.zsh
```

---

## Key Files — Priority Reading Order

Read these in order when onboarding to a new session:

1. **`.github/copilot-instructions.md`** — architecture overview, component map,
   common pitfalls, development commands. The single most informative file.
2. **`.github/instructions/userscript-conventions.instructions.md`** — mandatory before
   touching any `*.user.js` file.
3. **`markdown_linker/markdown_linker.user.js`** — the primary installed script; reveals
   all userscript patterns used throughout the repo.
4. **`common/amazon_toolkit/README.md`** and **`common/youtube_toolkit/README.md`** —
   API references before touching any toolkit file.
5. **`markdown_linker/markdown_linker.user.js.md`** — current feature work in progress.
6. **`markdown_linker/markdown_linker.user.md`** — open TODOs and design notes.

---

## Coding Conventions

### By File Type

| File Pattern    | Instruction File                                              | Key Rules                                                  |
| --------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| `**/*.user.js`  | `.github/instructions/userscript-conventions.instructions.md` | Strict mode, IIFE, `log()`, JSDoc + MDN refs, `===`        |
| `**/*.md`       | `.github/instructions/markdown-conventions.instructions.md`   | Icon prefix, backticks for versions, `<kbd>` for hotkeys   |
| `**/*.zsh`      | `.github/instructions/zsh-conventions.instructions.md`        | `.zsh_boilerplate`, `zparseopts`, step-pattern logging      |

### Userscript Quick Rules (`*.user.js`)

- Every script is an IIFE: `(function() { 'use strict'; ... })();`
- Logging is controlled by `const isDebug = true/false`
- All logging goes through wrapper functions — never raw `console.log`:
  - `log(message)` — general trace
  - `logWarn(message)` — warnings
  - `logError(message)` — errors
  - `logFunctionBegin(name)` — first line of every function
  - `logFunctionEnd(name)` — last line of every function
- JSDoc required on every function, with `@param`, `@returns`, and MDN reference links
- Always use `===` (strict equality), never `==`
- `GM_*` API calls require matching `@grant` entries in the metadata block

### Markdown Quick Rules (`*.md`)

- Use `<img>` tags for all images — never `![]()`
- Prefix inline app/tool names that have an icon in `docs/images/icons/` with
  `<img src="docs/images/icons/name.png" height="16"> \`Name\``
- Prefix app/tool names in backticks: `Firefox`, `ViolentMonkey`, `http-server`
- Use `<kbd>` for keyboard shortcuts: <kbd>Alt</kbd>+<kbd>Click</kbd>
- Use `[text](url)` — no bare URLs
- Tables must be rectangular: pad all cells to column max width
- GFM admonitions: `> [!NOTE]`, `> [!WARNING]`, `> [!IMPORTANT]`, `> [!TIP]`

### Zsh Quick Rules (`*.zsh`)

- Source `.zsh_boilerplate` near the top (handles common flags, logging, utilities)
- Parse script-specific args with `zparseopts` only after boilerplate
- Use Zsh path expansion (`${var:h}`, `${var:t}`, `${var:A}`) — never `dirname`/`basename`
- Use `(f)` to split multiline strings into arrays, `(F)` to join
- Step pattern for every fallible operation:

  ```zsh
  slog_step_se --context will "description"
  command || {
    typeset -i exit_code=$?
    slog_step_se --context fatal --exit-code "$exit_code" "description"
    exit $exit_code
  }
  slog_step_se --context success "description"
  ```

---

## Architecture Notes

### `markdown_linker` — Event Model and Triggers

Listeners are registered in **capture phase** (`true` as third arg to `addEventListener`)
so handlers intercept events before page elements receive them.

**Trigger combinations:**

| Trigger                            | Behavior                                                         |
| ---------------------------------- | ---------------------------------------------------------------- |
| <kbd>Alt</kbd>+Click               | Shows popup menu with title source options                       |
| <kbd>Alt</kbd>+<kbd>Z</kbd>+Click  | Auto-infers title; buffers multiple clicks into a markdown list  |
| <kbd>Alt</kbd>+Right-Click         | Same as <kbd>Alt</kbd>+Click via `contextmenu` event             |
| <kbd>Alt</kbd>+<kbd>M</kbd>        | Keyboard trigger; uses mouse position to find hovered element    |

**Menu title sources:**
- Link text (anchor `textContent`)
- Selected text (from `window.getSelection()`, cached 15 s)
- Page title (`document.title`)
- URL component forward (domain + first 2 path segments)
- URL component reverse (domain + last 2 path segments, reversed)
- Meta description (`<meta name="description">`)
- Custom (browser `prompt()` dialog)
- All links flat / All links tree (every anchor on page)

**Alt+Z preference** — the title source for auto-infer mode is persisted via
`GM_getValue` / `GM_setValue` and cycles via the `ViolentMonkey` popup menu command.

**Multi-link buffering** — hold <kbd>Alt</kbd>+<kbd>Z</kbd>, click multiple links,
release → all collected links are joined into a markdown list and copied at once.

**URL cleaning** — strips tracking params (`utm_*`, `fbclid`, `pd_rd_*`, etc.) and
extracts bare Amazon ASIN URLs (`/dp/{ASIN}`).

### `markdown_linker` — Bundler

Source lives in `markdown_linker/bundler/src/markdown_linker.source.js` and imports
from `common/` via the `lib/` symlink. `esbuild` bundles it into the single installable
file at `markdown_linker/bundler/dist/markdown_linker.user.js`, which is also checked
in at `markdown_linker/markdown_linker.user.js` for direct installation.

Build command (from `markdown_linker/bundler/`):
```zsh
npm run build
```

> [!IMPORTANT]
> Only `markdown_linker` is bundled. Other userscripts (e.g.,
> `amazon_item_blocker/amazon_sponsor.user.js`) are plain, single-file scripts — no build step.

See [`docs/bundler/ABOUT_BUNDLER.md`](../bundler/ABOUT_BUNDLER.md) for the full bundler
explanation (source vs. output, symlinks, the entry point, build/deploy). The older
`common/docs/bunding_userscript_and_libraries.md` is a generic bundling primer.

### `common/amazon_toolkit` — Extraction Strategy

All extractors use a **cascading fallback chain**:

1. **JSON-LD** (`<script type="application/ld+json">`) — most reliable
2. **Meta tags** (`og:*`, `<meta name="*">`) — broadly available
3. **HTML element selectors** (ID/class queries) — page-specific DOM
4. **Regex** — last resort for URL or text parsing

When debugging extraction failures, check each stage in the chain. JSON-LD works on
most product pages; meta tags on most store pages; HTML selectors vary by page type.

**URL formats:**
- `short` — `https://www.amazon.com/dp/{ASIN}`
- `medium` — ASIN + variant params (`th`, `psc`) preserved
- `long` — original URL with all parameters

Variant parameters (`th`, `psc`, `smid`) must be preserved; tracking parameters
(`pd_rd_*`, `ref_*`, `utm_*`) must be removed.

### `common/youtube_toolkit` — Page Classification First

Always call `Extractors.PageState.determinePageState(url, document)` first to identify
the page type (watch, playlist, shorts, channel, other) before selecting an extractor.

Key entry points:
- `Extractors.Video.extractVideoMetadata(document, url)` — title, channel, duration, canonical URL
- `Extractors.Video.extractPlaybackState(document)` — `currentTime` from live `<video>`
- `Extractors.Channel.extractChannelMetadata(document, url)`
- `Extractors.Playlist.extractPlaylistMetadata(document, url)`

In browser context the toolkit attaches to `window.YouTubeToolkit`; in `Node.js` it
exports via `module.exports`, mirroring the amazon toolkit pattern.

---

## Development Workflow

### Live Reload Setup

The canonical `violentmonkey.zsh` is at `scripts/violentmonkey/violentmonkey.zsh`.
A symlink at the repo root (`./violentmonkey.zsh`) makes it directly callable:

```zsh
./violentmonkey.zsh \
  --script markdown_linker/markdown_linker.user.js \
  --preferred-ip "127.0.0.1" \
  --debug
```

How it works:
1. `violentmonkey.zsh` starts `http-server` on port `8080`
2. `ViolentMonkey` tracks the script at the local URL
3. Save the file → `ViolentMonkey` auto-reloads → refresh the browser tab

### Browser Console Log Export (Critical for AI Debugging)

AI agents cannot access browser console output. To provide logs for debugging:

1. Open browser DevTools (<kbd>F12</kbd>)
2. Set `isDebug = true` in the userscript and reload the page
3. Reproduce the issue to populate the console
4. Right-click in the console → **Save all Messages to File**
5. Save to `.gitignored/logs/<scriptname>.log`
6. Reference the file path when asking for diagnosis

Log lines are prefixed `markdown_linker:` (or the relevant script name). `begin`/`end`
markers trace function entry and exit; `Will ...` / `Did ...` pairs show step intent
and completion.

### Bundler Workflow

1. Edit `markdown_linker/bundler/src/markdown_linker.source.js`
2. From `markdown_linker/bundler/`, run: `npm run build`
3. Output: `markdown_linker/bundler/dist/markdown_linker.user.js`
4. Reinstall in `ViolentMonkey` from the built file

For live watch mode: `npm run watch` (rebuilds on save; still requires reinstall in
`ViolentMonkey` to pick up changes reliably).

### Scaffolding a New Userscript

```zsh
scripts/userscript/scaffold_userscript_project.zsh --help
```

---

## Open TODOs

### Repo Level (`docs/todo/USERSCRIPT_REPO.md`)

- `[ ]` Move `common/youtube_toolkit` under `common/` ✅ done in latest main

### `markdown_linker` (`markdown_linker/markdown_linker.user.md` + `.user.js.md`)

- `[ ]` p1 — Additional modifier key to control leading `* ` in markdown list output
- `[ ]` Success banner should preview the output (1 line, truncated)
- `[ ]` `ViolentMonkey` preferences for user-defined keyboard shortcuts
- `[ ]` `ViolentMonkey` preferences for popup menu scaling (slider, 0.5–3.0 factor)
- `[ ]` YouTube watch page: `Youtube: <channel_name> - <video_title>` format
- `[ ]` YouTube timestamped URL option in popup menu (reads `<video>.currentTime`)
- `[ ]` GitHub-specific link titles: `GitHub: owner/repo`
- `[ ]` Jira card link titles from board card HTML
- `[ ]` Image links: `[![alt](img)](url)`
- `[ ]` "From Clipboard" as additional title source

---

## AI Agent Quick Start

### If You Don't Know Where to Start

1. Read `.github/copilot-instructions.md` — complete architecture map.
2. Check `markdown_linker/markdown_linker.user.js.md` for the current feature in progress.
3. Ask the user which script or feature they want to work on.

### Before Modifying Any File

- **`*.user.js`**: Read `.github/instructions/userscript-conventions.instructions.md` first.
- **`*.zsh`**: Read `.github/instructions/zsh-conventions.instructions.md` first.
- **`*.md`**: Read `.github/instructions/markdown-conventions.instructions.md` first.

### Common Mistakes to Avoid

- Using `console.log()` directly — always use `log()`, `logWarn()`, etc.
- Using `==` instead of `===`
- Writing `![](image.png)` in markdown — use `<img>` tags
- Referencing `amazon_toolkit/` — it moved to `common/amazon_toolkit/`
- Editing the bundled `markdown_linker.user.js` directly — edit the source in `bundler/src/`
  and rebuild instead
- Using `dirname` / `basename` in Zsh — use `${var:h}` / `${var:t}` instead
- Using reserved Zsh variable names: `path`, `command`, `status`

---

## References

- [ViolentMonkey API Documentation](https://violentmonkey.github.io/api/)
- [ViolentMonkey Metadata Block Reference](https://violentmonkey.github.io/api/metadata-block/)
- [MDN Web APIs — JavaScript](https://developer.mozilla.org/en-US/docs/Web/API)
- [MDN Web APIs — DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
- [esbuild Documentation](https://esbuild.github.io/)
