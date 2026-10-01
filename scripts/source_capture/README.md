# `source_capture` — save page HTML + logs to disk (dev tool)

A small, userscript-agnostic dev tool for capturing the **live page source**
(`document.documentElement.outerHTML`) and a userscript's **runtime logs** to files in the repo,
to build an archive for debugging and extending extraction.

> [!NOTE]
> A browser userscript cannot write to disk (sandbox). The client POSTs bytes to a local server
> (`127.0.0.1`) that writes them. `GM_xmlhttpRequest` is used because — unlike `fetch` — it is
> allowed from an `https://` page to a local `http://127.0.0.1` endpoint.

## Pieces

The browser **client** is a shared JS library under `common/`; the **server** (a tool, not a library)
lives here under `scripts/`.

| File | Role |
|------------------------------------------------------|----------------------------------------------------------------|
| `common/source_capture/source_capture.js`            | Browser client (`window.SourceCapture`); transport + log buffer |
| `scripts/source_capture/source_capture_server.py`    | Python 3 stdlib receiver; validates + writes files              |
| `scripts/source_capture/source_capture_server.zsh`   | Conventions-compliant launcher that spawns the receiver         |

## Consuming userscript requirements

Add these to the userscript metadata block:

```javascript
// @grant   GM_xmlhttpRequest
// @connect 127.0.0.1
```

Then call the client after writing to the clipboard (the caller computes the paths):

```javascript
window.SourceCapture.capture({
    userscript: 'markdown_linker',
    files: [
        { path: 'sources/products/B0DF7MW3SG_20260602134501.html', content: pageHtml },
        { path: 'logs/B0DF7MW3SG_20260602134501.log', content: window.SourceCapture.logBuffer.getText() }
    ],
    onResult: (result) => { /* result.ok -> update notification; else log */ }
});
```

> [!NOTE]
> Filenames, the timestamp suffix, and any metadata header in the content are **caller conventions**,
> not requirements of this module — it writes exactly the `path`/`content` it is given. For example,
> `markdown_linker` timestamps each capture (so they archive rather than overwrite) and prepends an
> HTML comment recording the raw clicked URL, the format used, and the clipboard output.

## Running the server

```zsh
# From anywhere inside the repo (defaults: git root, port 8787):
scripts/source_capture/source_capture_server.zsh

# Custom port / token:
scripts/source_capture/source_capture_server.zsh --port 9000 --token "$(uuidgen)"
```

Files land under `<git-root>/.gitignored/<userscript>/<path>`, e.g.
`.gitignored/markdown_linker/sources/products/B0DF7MW3SG_20260602134501.html`. Stop with
<kbd>Ctrl</kbd>+<kbd>C</kbd>.

## Protocol

`POST /save` — raw body is the file content; metadata travels in headers:

| Header | Meaning |
|------------------------|------------------------------------------------------------------|
| `X-Capture-Token`      | Shared token; must match the server's `--token`                  |
| `X-Capture-Userscript` | Names the `.gitignored/<userscript>/` root (single safe segment) |
| `X-Capture-Path`       | Repo-relative path under that root (no `..`, no absolute paths)   |

## Security

Dev tool, not a public service: bound to `127.0.0.1`, token-checked, and path-sandboxed (the resolved
target must stay within `.gitignored/<userscript>/`; `..` and absolute paths are rejected). The
default token only deters stray cross-origin posts while the server runs; pass `--token "$(uuidgen)"`
(and set the same in the client) for a per-run secret.
