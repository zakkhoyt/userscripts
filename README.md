# Albuquerque Userscripts

A personal collection of `ViolentMonkey` userscripts for `Firefox` on macOS, plus
reusable JavaScript toolkits for <img src="docs/images/icons/amazon.png" height="16"> `Amazon`
and <img src="docs/images/icons/youtube.png" height="16"> `YouTube` data extraction.

> [!NOTE]
> `docs/ai/GUIDE.md` is a bootstrapping document written for AI agents. 
> If you are an AI agent, read that file first.

---

## Overview

| Component                    | What It Does                                                      | Location                     |
| ---------------------------- | ----------------------------------------------------------------- | ---------------------------- |
| Markdown Linker              | Formats html links as markdown links, copies to the clipboard             | `markdown_linker/`           |
| Amazon Item Blocker          | Hides sponsored listings on Amazon                                | `amazon_item_blocker/`       |
| Amazon Toolkit               | Reusable JS library for Amazon data extraction (browser + Node.js) | `common/amazon_toolkit/`    |
| YouTube Toolkit              | Reusable JS library for YouTube data extraction (browser + Node.js) | `common/youtube_toolkit/`  |
| Dev Tooling                  | `zsh` script for live-reload development                            | `scripts/violentmonkey/`     |
| Bundler                      | `esbuild` pipeline for packaging userscripts                      | `markdown_linker/bundler/`   |

---

## Userscripts

### Markdown Linker

**File:** `markdown_linker/markdown_linker.user.js`

Creates a markdown-formatted link (`[title](url)`) from any anchor on the page or from
the current page URL, then copies it to the clipboard. Works on any website.

#### Triggers

| Trigger                               | Mode        | Description                                           |
| ------------------------------------- | ----------- | ----------------------------------------------------- |
| <kbd>Alt</kbd>+Click                  | Menu        | Shows a popup menu to choose a title source           |
| <kbd>Alt</kbd>+Right-Click            | Menu        | Same as above, via right-click                        |
| <kbd>Alt</kbd>+<kbd>M</kbd>           | Menu        | Keyboard trigger at the current mouse cursor position |
| <kbd>Alt</kbd>+<kbd>Z</kbd>+Click     | Auto-infer  | Infers the title automatically and copies immediately |

**<kbd>Alt</kbd>+<kbd>Z</kbd>+Click (auto-infer mode)** — hold <kbd>Alt</kbd>+<kbd>Z</kbd>
and click multiple links in sequence. When you release the keys, all collected links are
combined into a markdown list and copied at once:

```markdown
* [Link One Title](https://example.com/one)
* [Link Two Title](https://example.com/two)
* [Link Three Title](https://example.com/three)
```

#### Title Sources (Popup Menu)

When the popup menu appears, you can pick the title from any of these sources:

- **Link** — the visible anchor text
- **Selection** — text you highlighted before triggering (cached for 15 seconds)
- **Page** — the page `<title>` element
- **URL** — domain + first two path segments (e.g., `GitHub: hatch-baby - mobile`)
- **LRU** — domain + last two path segments, reversed
- **Meta** — the page `<meta name="description">` (page-level only)
- **Custom** — prompts you to type a title
- **all (flat)** — every anchor on the page as a flat markdown list
- **all (tree)** — every anchor on the page, indented to reflect DOM depth

#### URL Cleaning

URLs are automatically cleaned before being included in any markdown output:

- Removes common tracking parameters (`utm_*`, `fbclid`, `gclid`, `pd_rd_*`, etc.)
- Shortens <img src="docs/images/icons/amazon.png" height="16"> Amazon product URLs to their bare `/dp/{ASIN}` form

#### Preferences

The title source used by <kbd>Alt</kbd>+<kbd>Z</kbd>+Click is persisted across browser
sessions using `ViolentMonkey`'s storage API. To change it, click the `ViolentMonkey`
icon in the toolbar — the menu shows the current source and lets you cycle through options.

#### Installation

1. Install `ViolentMonkey` for `Firefox` from [violentmonkey.github.io](https://violentmonkey.github.io/)
2. In `ViolentMonkey`, click **New Script** and paste the contents of
   `markdown_linker/markdown_linker.user.js`
3. Save — the script activates immediately on all pages

---

### Amazon Item Blocker

**File:** `amazon_item_blocker/amazon_sponsor.user.js`

Hides sponsored product listings on <img src="docs/images/icons/amazon.png" height="16"> Amazon
pages, leaving only organic results visible.

#### Installation

Same process as above — create a new `ViolentMonkey` script and paste the file contents.

---

## Development Setup

### Requirements

- `Firefox` with `ViolentMonkey` installed
- `http-server` for live-reload development

```zsh
brew install http-server
```

### Live Reload with `violentmonkey.zsh`

`violentmonkey.zsh` (symlink to `scripts/violentmonkey/violentmonkey.zsh`) starts a
local HTTP server and configures `ViolentMonkey` to track the script as an external URL.
Any time you save the file in your editor, `ViolentMonkey` picks up the changes.

```zsh
# Serve the script locally with debug output
./violentmonkey.zsh \
  --script markdown_linker/markdown_linker.user.js \
  --preferred-ip "127.0.0.1" \
  --debug
```

Then in `ViolentMonkey`, open the script editor and point it at the local URL:

<img src="images/external_editor_reload.png" alt="external_editor_reload" width="600">

Once configured, the workflow is:

1. Edit the script in `VSCode` (or any editor)
2. Save the file
3. `ViolentMonkey` auto-reloads the script
4. Refresh the browser tab to test your changes

You can also start `http-server` directly:

```zsh
# Launch HTTP server with 5-second cache
http-server -c5

# Same, but open the browser to a specific file
http-server -c5 -o amazon_item_blocker/amazon_sponsor.user.js
```

### Bundler

The `markdown_linker` script is built with `esbuild`. The source lives in
`markdown_linker/bundler/src/` and imports shared code from `common/` via a symlink.
The bundled, installable output is at `markdown_linker/markdown_linker.user.js`.

To rebuild after editing the source:

```zsh
cd markdown_linker/bundler
npm run build
```

For live watch mode (rebuilds on every save):

```zsh
npm run watch
```

See [`common/docs/bunding_userscript_and_libraries.md`](common/docs/bunding_userscript_and_libraries.md)
for the full bundling guide.

### Debug Logging

Set `isDebug = true` at the top of any script to enable trace-level output. All log
lines are prefixed with the script name (e.g., `markdown_linker: begin handleClick`),
making them easy to filter in the browser console.

### Breakpoints

Insert `debugger;` anywhere in the script to set a programmatic breakpoint. Open browser
DevTools before reloading the page — execution pauses at the `debugger` line, exposing
full DOM state and variable values for inspection.

<img src="images/firefox_debugger_breakpoint.png" alt="firefox_debugger_breakpoint" width="600">

### ViolentMonkey's Built-In Editor

`ViolentMonkey` includes a built-in editor accessible from the extension popup:

<img src="images/edit_violent_monkey.png" alt="edit_violent_monkey" width="600">

Useful for quick fixes but secondary to the live-reload workflow for sustained development.

---

## Common Toolkits

Both toolkits work in **browser** (via `ViolentMonkey` `@require`) and **`Node.js`**
(via `require()`).

### <img src="docs/images/icons/amazon.png" height="16"> Amazon Toolkit

**Location:** `common/amazon_toolkit/`

Modular library for extracting Amazon product and store data and generating markdown links.

Key capabilities:

- Extract ASIN, title, brand, price, images, and variants from product pages
- Extract store name, logo, and seller ID from store pages
- Parse and clean Amazon URLs (remove tracking params, preserve variant params)
- Build Amazon image URLs at custom sizes
- Generate markdown text links, image links, and combined image-link markdown

See [`common/amazon_toolkit/README.md`](common/amazon_toolkit/README.md) for the full
API reference and usage examples.

### <img src="docs/images/icons/youtube.png" height="16"> YouTube Toolkit

**Location:** `common/youtube_toolkit/`

Modular library for extracting YouTube metadata and generating markdown links.

Key capabilities:

- Extract video title, channel name, channel handle, canonical URL, and duration
- Read playback state (`currentTime`) from live `<video>` elements for timestamped links
- Extract channel metadata (title, description, avatar, subscriber count)
- Extract playlist title and ordered video entries
- Classify page type (watch page, playlist, shorts, channel landing)

See [`common/youtube_toolkit/README.md`](common/youtube_toolkit/README.md) for the full
API reference.

---

# Development & Contributing

* See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Roadmap

Items tracked for future development:

- `[ ]` <img src="docs/images/icons/youtube.png" height="16"> YouTube watch page: `Youtube: <channel> - <video title>` link format
- `[ ]` <img src="docs/images/icons/youtube.png" height="16"> YouTube timestamped URL option in popup menu
- `[ ]` GitHub-specific link titles: `GitHub: owner/repo`
- `[ ]` Keyboard shortcut customization via `ViolentMonkey` preferences
- `[ ]` Popup menu scale preference (slider, 0.5–3.0 factor)
- `[ ]` Jira card link titles from Jira board HTML
- `[ ]` Image link output: `[![alt](img)](url)`
- `[ ]` Additional modifier to control leading `* ` in list output

---

## References

- [ViolentMonkey](https://violentmonkey.github.io/) — userscript manager
- [ViolentMonkey API — GM functions](https://violentmonkey.github.io/api/gm/)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) — browser API reference
- [esbuild](https://esbuild.github.io/) — JavaScript bundler
- [http-server — npm](https://www.npmjs.com/package/http-server) — simple HTTP server for development
