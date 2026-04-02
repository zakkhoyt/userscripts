# Noob-friendly bundling guide (macOS + zsh + Firefox + Violentmonkey)
Goal: keep your library as normal JS files, then generate ONE `*.user.js` file that already contains the library. You install only the bundled file into Violentmonkey.

## 0) Check prerequisites
Run:
~~~zsh
node -v
npm -v
~~~
If either command fails, install Node.js, then rerun.

## 1) Create a project folder and install the bundler
~~~zsh
mkdir -p ~/dev/amz-yt-userscript/{lib,src,dist}
cd ~/dev/amz-yt-userscript
npm init -y
npm i -D esbuild
~~~

## 2) Create your library (Node-friendly module)
This stays reusable for Node later.
~~~zsh
cat > lib/index.js <<'EOF'
export function parseAmazonUrl(url) {
  const u = new URL(url);
  return { site: "amazon", host: u.host, path: u.pathname, query: Object.fromEntries(u.searchParams) };
}
export function parseYouTubeUrl(url) {
  const u = new URL(url);
  return { site: "youtube", host: u.host, path: u.pathname, v: u.searchParams.get("v") };
}
EOF
~~~

## 3) Create the userscript entry (imports library at build time)
This file is NOT installed into Violentmonkey. It is only used for bundling.
~~~zsh
cat > src/userscript.entry.js <<'EOF'
import { parseAmazonUrl, parseYouTubeUrl } from "../lib/index.js";

(function () {
  const href = location.href;
  const host = location.hostname;
  if (host.includes("amazon.")) console.log("Amazon:", parseAmazonUrl(href));
  if (host.includes("youtube.com") || host === "youtu.be") console.log("YouTube:", parseYouTubeUrl(href));
})();
EOF
~~~

## 4) Add build + watch commands to package.json (automatic)
This injects the required userscript header at the top of the bundled output.
~~~zsh
node -e '
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json","utf8"));
pkg.type = "module";
pkg.scripts ||= {};
pkg.scripts.build = "esbuild src/userscript.entry.js --bundle --format=iife --target=es2020 --outfile=dist/amazon-youtube-tools.user.js --banner:js=\\\"// ==UserScript==\\\\n// @name         Amazon+YouTube Tools (Bundled)\\\\n// @match        https://www.amazon.com/*\\\\n// @match        https://www.youtube.com/*\\\\n// @version      0.0.0-dev\\\\n// @grant        none\\\\n// ==/UserScript==\\\"";
pkg.scripts.watch = "npm run build -- --watch";
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\\n");
'
~~~

## 5) Build the single installable userscript
~~~zsh
npm run build
ls -la dist
~~~
You should see: `dist/amazon-youtube-tools.user.js`

## 6) Install into Violentmonkey (Firefox)
1) Open the Violentmonkey dashboard.  
2) Install from file (or drag-drop the file into the dashboard if supported).  
3) Select: `~/dev/amz-yt-userscript/dist/amazon-youtube-tools.user.js`  
4) Visit Amazon or YouTube and open DevTools Console to see logs.

## 7) Edit loop (day-to-day)
Edit:
- `lib/index.js`
- `src/userscript.entry.js`
Then rebuild:
~~~zsh
npm run build
~~~
Then reinstall/update the bundled file in Violentmonkey (most reliable).

Optional auto-rebuild while editing:
~~~zsh
npm run watch
~~~
This updates the file on disk when you save changes. You still usually reinstall/update in Violentmonkey to run the new version reliably.

## 8) Common tweaks
- Add more sites: edit the `@match` lines inside the `--banner:js="..."` string in `package.json`.
- If you start using GM APIs, change `@grant none` to the specific grants you use (example: `GM.getValue`, `GM.setValue`).