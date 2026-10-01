# Claude AI Instructions — Albuquerque Userscripts

Project instructions for this `ViolentMonkey` userscript repository. Kept self-contained
in-repo (no dependency on `~/.ai`) so any agent picks them up automatically.

> [!TIP]
> New to this repo? Read `docs/ai/GUIDE.md` first — the agent bootstrapping guide
> (repository map, conventions, and workflows).

## Docs layout — `docs/ai/` vs. `docs/.ai/`

Two sibling directories, one letter apart, with different audiences:

- **`docs/ai/`** (no dot) — **agent-facing documentation; read this.** `GUIDE.md` is the
  bootstrapping guide; `USERSCRIPT_CONVENTIONS_SETUP.md` explains how the AI instruction
  files fit together.
- **`docs/.ai/`** (dot-prefixed) — the **author's** AI planning material: plans,
  sequencing, references, and assets under `docs/.ai/planning/`. Read on request, not by
  default. Treat it as working notes, not instructions — much of it is historical.

> [!IMPORTANT]
> Do not "correct" `docs/.ai/` to `docs/ai/`. The dot is a deliberate cross-project
> convention. Note `.gitignore` carries `*.ai` + `!.ai/`: a bare `.ai` pattern (Adobe
> Illustrator boilerplate) matches any *directory* named `.ai` and will silently hide the
> whole tree. `*.ai` alone does not fix it — gitignore's `*` matches zero characters.

Downloaded HTML and saved-page references must **never** be committed. They live under
`.gitignored/` dirs (covered by `**/.gitignored/`), which can sit anywhere in the tree.

## Conventions — path-scoped rules

Coding conventions load automatically via `.claude/rules/` when you touch matching files:

- `**/*.user.js` → `.claude/rules/userscript-conventions.md` — `ViolentMonkey` userscript conventions.

## Bundler vs. plain userscripts

- **Only `markdown_linker` uses the bundler.** Its installable
  `markdown_linker/markdown_linker.user.js` is a **generated artifact** — edit the source at
  `markdown_linker/bundler/src/markdown_linker.source.js`, never the artifact. Shared libraries
  live in `common/` and are linked into the bundle via symlinks.
- **All other userscripts are plain, single-file scripts** (e.g.,
  `amazon_item_blocker/amazon_sponsor.user.js`) — edit them directly; no build step.

See `docs/bundler/ABOUT_BUNDLER.md` for the full bundler explanation and build/deploy workflow.
