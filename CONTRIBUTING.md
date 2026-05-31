

# ViolentMonkey

Violentmonkey is a brower plugin that manaages and runs Userscripts. It also allows for live editing and debugging. 


## `scripts/violentmonkey/violentmonkey.zsh`

A zsh script to help with live userscript development:
* Edit code using `Visual Studio Code.app` instead of a browser
* Assists with spinning up http servers, etc...

> [!NOTE]
> from `violentmonkey.zsh --help`
>
> Serves a ViolentMonkey/GreaseMonkey userscript via HTTP server for live development with automatic reload. The script starts an http-server instance, opens the script URL in a browser, and monitors for file changes. This enables rapid development workflow: edit the userscript in your editor, save, and if "${open_cmd[@]}"; then
>
> The script automatically detects all available network interfaces and allows you to select which URL to use, or automatically selects based on a preferred IP.

**Example Usage**
```zsh
# violentmonkey.zsh --help
# violentmonkey.zsh --script <path_to_user.js>
# violentmonkey.zsh --script <path_to_user.js> [--preferred-ip <a.b.c.d>] [--debug]

./violentmonkey.zsh \
  --script markdown_linker/markdown_linker.user.js \
  --preferred-ip "127.0.0.1" \
  --debug
```


# Bundler — building & deploying `markdown_linker`

`markdown_linker` is assembled from modular source plus the shared libraries
(`common/amazon_toolkit`, `common/youtube_toolkit`) into one installable `*.user.js` using
[`esbuild`](https://esbuild.github.io/).

> [!IMPORTANT]
> Edit the **source** at `markdown_linker/bundler/src/markdown_linker.source.js`. Do **not**
> hand-edit `markdown_linker/markdown_linker.user.js` — it is generated build output and your
> changes will be overwritten on the next build.

## Build

There is no wrapper script; building is an `npm` script that runs `esbuild`:

```zsh
cd markdown_linker/bundler
npm install     # first time only (installs esbuild)
npm run build   # -> markdown_linker/bundler/dist/markdown_linker.user.js
```

Auto-rebuild while editing:

```zsh
cd markdown_linker/bundler
npm run watch
```

## Where the output goes

* `markdown_linker/bundler/dist/markdown_linker.user.js` — direct `esbuild` output.
* `markdown_linker/markdown_linker.user.js` — the committed installable artifact (a copy of
  `dist/`, currently kept in sync with a manual `cp`).

## Deploy / load into ViolentMonkey

Build, sync the artifact, then serve it for live reload with `./violentmonkey.zsh`:

```zsh
# build + sync the installable artifact
cd markdown_linker/bundler && npm run build && cd -
cp markdown_linker/bundler/dist/markdown_linker.user.js markdown_linker/markdown_linker.user.js

# serve over a local http-server so ViolentMonkey live-reloads on change
./violentmonkey.zsh \
  --script markdown_linker/markdown_linker.user.js \
  --preferred-ip "127.0.0.1" \
  --debug
```

While iterating you can point `--script` straight at
`markdown_linker/bundler/dist/markdown_linker.user.js` to skip the copy step.

> [!NOTE]
> Only `markdown_linker` uses the bundler. Other userscripts (e.g.,
> `amazon_item_blocker/amazon_sponsor.user.js`) are plain, single-file scripts with no build step.

For the full architecture — symlinks, the entry point, and why Amazon imports many files while
YouTube imports only `index.js` — see
[`docs/bundler/ABOUT_BUNDLER.md`](docs/bundler/ABOUT_BUNDLER.md).


# Debugging

* To use breakpoints, insert the line `debugger;` which is like a programmatic breakpoint.
* Open your browser debugger then reload the page. You should hit the breakpoint. 
* Inspect elements and properties using breakpoint


![firefox_debugger_breakpoint](images/firefox_debugger_breakpoint.png)


