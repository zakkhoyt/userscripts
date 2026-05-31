# Legacy Planning — Completed

Items from the legacy planning notes (`markdown_linker.user.js.md`, `markdown_linker.user.md`)
that are **implemented in the current code**. Verified against
`markdown_linker/bundler/src/markdown_linker.source.js` and `common/**` (the source of truth — the
old `markdown_linker.user.js` monolith was retired). Evidence is the implementing function /
location; line numbers are approximate (they shift as the source evolves).

> [!NOTE]
> Method: each legacy item was classified done **only** when confirmed in the current source, not
> merely because it was checked/commented-out in the notes (the notes warn that some uncommented
> items are also done).

---

## Core link/menu behavior

- **Markdown link from anchor or page URL** with a popup menu of title sources (link text,
  selection, page title, URL forward/reverse, meta description, custom) — `createMenu`,
  `getTitleFromSource`.
- **URL cleaning** (strip tracking params; canonicalize) — `cleanUrl`.
- **"All links" extraction**, flat and tree — `extractAllLinksFlat`, `extractAllLinksHierarchical`
  (menu items "all (flat)" / "all (tree)").
- **Junk-href filtering** in all-links (skips `#`, `javascript:`) — in the extract-all functions (~src 2515).
- **Alt+Z+Click auto-infer** (no menu): infer title in order selection → anchor → page/URL —
  `getAutoInferredTitle`; this is also the **dedicated infer hotkey** the notes asked for.
- **Multi-link buffering** → markdown list on key release — `compileAndCopyBufferedLinks`,
  `formatBufferItem` (which also toggles **single vs. list** output, `* [..]` vs `[..]`).
- **Click feedback animation** on Alt+Z+Click — `showClickFeedback`.
- **Success banner previews the output** (truncated 1-liner) — `showNotification` + preview at ~src 2312.
- **Trace-style logging** + the **manual log-export workflow** (console → `.gitignored/logs/`).

## YouTube formatting

- **`watch?v=` title cleanup** (strip leading `(N)` counter + ` - YouTube` suffix) — `stripYouTubeTitleSuffix`.
- **`Youtube: <channel> - <title>` format** — `buildYouTubeVideoTitle`.
- **Timestamped URL menu entries** from live `<video>.currentTime` — `buildYouTubeTimestampMenuOptions`,
  `buildYouTubeTimestampUrl`.
- **Playlist → markdown list** — `buildYouTubePlaylistMarkdown`.
- **`youtube_toolkit`** created (video/channel/playlist/page-state extractors + helpers) and **wired
  into the bundle** — `common/youtube_toolkit/**`, consumed via `getYouTubeContext` /
  `getYouTubeToolkit`.

## Amazon (most recent, 2026-01 dated in notes)

- **Product URL transform/shortening** to bare `/dp/{ASIN}` (+ variant params preserved) —
  `cleanUrl` Amazon branch + `common/amazon_toolkit/links/link_cleaner.js`.
- **Classify Amazon links** (clear in logs) — `getAmazonMetadataForUrl`, `getAmazonUrlFromAnchor`,
  `isAmazonHostname`.
- **Omit leading `Amazon:` / `Amazon.com:`** from composed titles — Amazon branch in
  `getUrlComponentTitle` / `normalizeTitleForUrl`.
- **Amazon products use `URL (forward)`** for Alt+Z+Click (was reverse) — Amazon handling in the
  title-source path.
- **`amazon_toolkit`** created (extractors / links / markdown / helpers) — `common/amazon_toolkit/**`.

## Generic domain titles & preferences

- **`domain_name` → `domain_title`** (drop `www.`, brand overrides) — `getDomainTitleFromHostname`
  + `DOMAIN_TITLE_OVERRIDES`.
- **Path-component link titles** (`Brand: seg1 - seg2`), forward and reverse — `getUrlComponentTitle`
  (`{ direction: 'reverse' }`); surfaced as the "URL (forward)" / "URL (reverse)" menu sources.
- **Persisted Alt+Z title-source preference** + menu-command cycle — `loadAltZTitlePreference`,
  `persistAltZTitlePreference`, `cycleAltZTitlePreference` (`GM_getValue` / `GM_setValue` /
  `GM_registerMenuCommand`).

## Toolkits & supporting docs

- **`common/amazon_toolkit`** and **`common/youtube_toolkit`** libraries (browser + `Node.js`).
- **Amazon URL reference docs** under `docs/notes/amazon_url/` (URL anatomy, image URLs, scraping guide).
- **Bundler** pipeline (`esbuild`) + docs (`docs/bundler/ABOUT_BUNDLER.md`).
