# Legacy Planning — Roadmap (Not Yet Implemented)

Items from the legacy planning notes that are **not yet in the current code**, grouped by theme for
efficient implementation. Each item lists what it is, any implementation hint already in the notes,
and the likely code touch-point in `markdown_linker/bundler/src/markdown_linker.source.js`.

> [!NOTE]
> "Ideas" (rough thoughts) are separated from concrete tasks at the end. Confirm exact formats with
> the repo owner before implementing the formatting items.

---

## 1. Domain-specific link formats (headline)

Add a new **"domain specific"** title source to the popup menu (alongside "Page Title",
"URL (forward)", etc.) that applies per-domain formatting. Touch-point: **`getDomainSpecificTitle`**
(~src 1304) — today it only handles YouTube; refactor into a per-domain dispatcher that falls
through to the generic `getUrlComponentTitle`.

- **GitHub** repo/owner titles:
  - `github.com/<owner>` → `GitHub: <owner>`
  - `github.com/<owner>/<repo>` (and deeper) → `GitHub: <owner>/<repo>`
  - Notes also sketch `settings/*`, `docs.github.com`, `cli.github.com` variants (formats are
    inconsistent in the notes — confirm before building).
- **Jira** card/issue titles: extract the issue summary from the board/issue DOM. The notes capture
  a sample card; the summary lives in a `…yse7za_summary` span and the key in `a[href^="/browse/"]`.
  Likely format `Jira: <KEY> <summary>`.
- **Richer domain titles**: `docs.google.com` → `Google Docs`, `console.cloud.google.com` →
  `Google: Cloud Console`, etc. Extend `DOMAIN_TITLE_OVERRIDES` + subdomain handling in
  `getDomainTitleFromHostname`.

## 2. Amazon (next focus — owner will feed specifics)

- Further **title shortening** for products (drop trailing "… at Amazon <category> store", reduce
  long descriptive titles). Touch-point: Amazon title path / `common/amazon_toolkit/markdown`.
- Any remaining **URL / variant-param** refinements beyond the bare `/dp/{ASIN}` + variant handling
  already done.

## 3. Preferences (ViolentMonkey GM storage)

- **User-defined custom hotkeys** for both actions (menu trigger + auto-infer), defaulting to the
  current combos. Extend the existing `GM_getValue`/`GM_setValue` preference pattern.
- **Popup-menu scaling** preference (factor `0.5`–`3.0`, default `1.0` = current CSS), ideally a
  slider. Apply the factor to the menu's inline CSS in `createMenu`.

## 4. Menu / UX

- **Hotkey glyphs** shown in menu items.
- **"From Clipboard"** as an additional title source when the clipboard holds suitable text.
- **Normalize list indenting** in the tree/all-links output.
- **p1 — modifier key to control the leading `* `** in markdown list output (toggle bullet vs. plain).
- **Multi-copy banner second line**: when "Copied N links" shows, add a line indicating which
  title-source preference mode was used.

## 5. Links / output

- **Image links** (click-only) → `[![alt](img)](url)`; for Amazon, build image URLs from the image
  ID via `common/amazon_toolkit/links/link_image.js`.
- **Broader junk-URL filtering** (beyond the all-links `#`/`javascript:` skip).

## 6. Architecture

- **Toolkit convention convergence** — make `amazon_toolkit` and `youtube_toolkit` use the same
  module convention. YouTube's plain-`require()` graph is simpler than Amazon's
  `window.__AmazonToolkitModules` registry; likely migrate Amazon to the YouTube style (updates
  `common/amazon_toolkit/**` + the bundler entry imports + callers). See `docs/bundler/ABOUT_BUNDLER.md`.
- **`@downloadURL` / `@updateURL`** in the bundle banner still point at the old
  `zakk/markdown_linker_domains` branch — update to the canonical branch (affects auto-update only).

## 7. Portability

- Support other userscript managers (`GreaseMonkey`) and browsers once the feature set stabilizes.

---

## Ideas / open questions (rough — need refinement before becoming tasks)

- **Log prefix / verbosity**: every line is prefixed `markdown_linker: ` — the owner wants to revisit
  log formatting/levels.
- **"Is this a false flag?"** investigation note about whether the script reaches certain paths
  without the toolkit (left over from the YouTube-integration debugging; the menu bug is now fixed).
- **Opt+click on an Amazon product background** — the owner noted some output that "should be changed
  by now"; needs a concrete repro + desired-output spec.
- **Output format** polish (single vs. list) beyond the current automatic behavior.
