# `source_capture` (browser client)

`source_capture.js` is the browser-side client for the **source_capture** dev tool — it serializes
in-page bytes (page source, logs) and POSTs them (via `GM_xmlhttpRequest`) to a local server that
writes them into the repo. It registers `window.SourceCapture` (and `module.exports`).

This directory holds only the shared JS library. The **server** (zsh launcher + Python receiver) and
the full docs (how to run it, protocol, security) live under
[`scripts/source_capture/`](../../scripts/source_capture/README.md).
