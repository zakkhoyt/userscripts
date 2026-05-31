# Claude AI Instructions — Albuquerque Userscripts

Project instructions for this `ViolentMonkey` userscript repository. Kept self-contained
in-repo (no dependency on `~/.ai`) so any agent picks them up automatically.

> [!TIP]
> New to this repo? Read `docs/ai/GUIDE.md` first — the agent bootstrapping guide
> (repository map, conventions, and workflows).

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
