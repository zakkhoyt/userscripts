# Amazon Toolkit Integration Plan

## Goals
- Align ![amazon](docs/images/icons/amazon.png) `Amazon` link handling between `markdown_linker/markdown_linker.user.js` and `common/amazon_toolkit/**` without regressing existing features.
- Capture a phased plan (with validation checkpoints) before migrating runtime logic so we can discuss scope and testing expectations up front.

## Status (2026-01-16)
- Introduced a lightweight module registry so every toolkit file now registers itself under `window.__AmazonToolkitModules[...]` when loaded in the browser while still exporting via CommonJS for Node. This lets ![amazon](docs/images/icons/amazon.png) `Amazon` userscripts pull shared modules without bundling yet.
- Rebuilt `common/amazon_toolkit/index.js` to auto-load helpers/extractors/link utilities/markdown generators from real modules (or registry fallbacks) and expose the same API surface as before, so ViolentMonkey can `@require` the entrypoint or the individual modules interchangeably.
- Documented this bootstrap step here so the remaining integration phases (URL parser adoption, toolkit markdown in Alt+Z, etc.) can assume a single source of truth for toolkit exports.
- `markdown_linker/markdown_linker.user.js` now delegates ![amazon](docs/images/icons/amazon.png) `Amazon` anchor parsing and URL cleaning to the shared toolkit (`parseAmazonAnchor()`, `cleanAmazonURL()`) with legacy heuristics kept as fallback, so <kbd>Alt</kbd> + <kbd>Z</kbd> clipboard flows preserve variant parameters without duplicating logic.

## Current State Review

### ![amazon](docs/images/icons/amazon.png) `Amazon` Toolkit highlights
- `common/amazon_toolkit/extractors/product_extractor.js` already assembles rich product data (ASIN, title, price, variant, images) with fallback chains (JSON-LD → meta → DOM) suitable for both browser and Node contexts.
- `common/amazon_toolkit/links/link_parser.js` classifies URLs into product/store/search/deals, extracts ASIN + seller IDs, and retains variant vs tracking params so downstream callers know what to preserve.
- `common/amazon_toolkit/links/link_cleaner.js` normalizes `/dp/` links, keeps variant params (`th`, `psc`, `smid`) when requested, and strips tracking suffixes.
- Tests/fixtures (`tests/fixtures/amazon/**`) provide saved HTML that can be fed into the extractors for regression checks without live scraping.

### Toolkit gaps to address first
- `common/amazon_toolkit/index.js` exposes empty stub functions; before consumption we need to wire actual module exports (or provide a bundler build) so `AmazonToolkit.extractProductData()` etc. are real.
- Helper imports (`safeQuery`, logging functions, validators) are referenced but not required anywhere, so the intended shared helpers must either be implemented or explicitly pulled from `userscript_common/**`.
- Distribution story is undefined: no `@require` bundle, npm package, or build artifact that `markdown_linker.user.js` can load today.

### `markdown_linker/markdown_linker.user.js` ![amazon](docs/images/icons/amazon.png) `Amazon` logic
- `cleanUrl()` manually rebuilds `/dp/{ASIN}` links, strips trackers, and removes variant params that we often want to keep; logic diverges from toolkit behavior.
- `extractUrlFromAnchor()` contains an ![amazon](docs/images/icons/amazon.png) `Amazon`-specific fallback that walks `data-asin` containers when no `<a>` exists, duplicating toolkit parsing.
- Helpers such as `isAmazonHostname()`, `isAmazonProductUrl()`, `normalizeTitleForUrl()`, and the ![amazon](docs/images/icons/amazon.png) `Amazon` branch inside `getUrlComponentTitle()` add domain knowledge that belongs in the toolkit namespace.
- Domain-specific formatting currently focuses on ![youtube](docs/images/icons/youtube.png) `YouTube`; ![amazon](docs/images/icons/amazon.png) `Amazon` products still rely on generic `URL (forward/reverse)` heuristics, producing noisy titles.

### Latest Findings (2026-01-16)
- **Sponsored `sspa/click` wrappers remain opaque**: Amazon search ads wrap product cards in tracking URLs like `https://www.amazon.com/sspa/click?...&url=%2F...%2Fdp%2FASIN...`, and we currently pass the wrapper straight into `getUrlComponentTitle()`, which yields "Sspa - Click" titles. We need the toolkit to detect these wrappers, parse the encoded `url` parameter, and classify the result via `AmazonToolkit.Links.parseAmazonURL()` before any title/URL work so logs clearly show the promoted type.
- **Legacy short-link logic still lives in the userscript**: The pre-toolkit `cleanUrl()` implementation is still embedded at [markdown_linker/markdown_linker.user.js](markdown_linker/markdown_linker.user.js#L1318-L1394). It already converts slug paths into `/dp/{ASIN}` and strips sponsored query params, so we should hoist that behavior into `common/amazon_toolkit/links/link_cleaner.js` (and keep the userscript as a thin caller) instead of letting bespoke fallbacks drift.
- **Title normalization only strips `Amazon.com:` prefixes**: `normalizeTitleForUrl()` at [markdown_linker/markdown_linker.user.js](markdown_linker/markdown_linker.user.js#L1797-L1838) never removes suffixes like ` at Amazon Women’s Clothing store`, `: Clothing, Shoes & Jewelry`, `Amazon Grocery,`, or ` - Dp`, which is why the menu still shows those blurbs. We need a shared formatter (or a toolkit hook) that runs for every ![amazon](docs/images/icons/amazon.png) `Amazon` product title regardless of trigger path.
- **URL-component titles still mirror raw path tokens**: `getUrlComponentTitle()` ([markdown_linker/markdown_linker.user.js](markdown_linker/markdown_linker.user.js#L1935-L1991)) blindly reuses the first two sanitized path segments, so intermediate URLs (`/sspa/click`, `/gp/slredirect`, etc.) bubble up as `Sspa - Click`. Once classification data is available we should branch on `parsedUrl.type` (`product`, `store`, `search`, …) instead of guessing from path segments.
- **No classification logs yet**: Even after calling `AmazonToolkit.Links.parseAmazonAnchor()` we never persist or log the detected URL type, which makes debugging hard. Add explicit logging (and possibly menu badges) so it’s obvious when a link is treated as `product`, `store`, or `intermediate`.
- **Script lacks discoverable usage docs**: ViolentMonkey doesn’t expose `--help`, and today the only reference is the running TODO list in [markdown_linker/markdown_linker.user.md](markdown_linker/markdown_linker.user.md). We should add a lightweight “Capabilities & Shortcuts” doc (or README section) that lists the current gestures, menu entries, and toolkit-backed behaviors so users don’t have to read the source.

## Gap Analysis

| Concern                              | Current userscript logic                                                                 | Toolkit capability                                          | Notes                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| URL type classification              | Regex helpers (`isAmazonProductUrl`) and manual hostname checks                          | `determineURLType`, `parseAmazonURL`                       | Prefer a single parser to detect product/store/search cases.                                     |
| ASIN & variant extraction            | Regex in `cleanUrl` plus `data-asin` crawling                                            | `extractASINFromURL`, `parseAmazonAnchor`, variant capture | Toolkit keeps seller + variant params so size/color persists.                                   |
| URL cleaning                         | Drops most query params, including desired variants                                      | `cleanAmazonURL` with `preserveVariants/seller` flags       | Switching avoids future divergence and centralizes tracking prefixes.                            |
| Title normalization                  | Ad-hoc stripping of `Amazon.com:` prefix and limited path formatting                     | `cleanProductTitle`, `markdown_formatter.js`                | Toolkit formatter handles suffixes like `: Clothing, Shoes & Jewelry` already.                   |
| Domain-specific title overrides      | Only ![youtube](docs/images/icons/youtube.png) `YouTube` handled via `getDomainSpecificTitle` | Product/store extractors + markdown generators              | Feeding extractor output into toolkit markdown generator would yield concise product/store titles. |
| Data re-use / DRY                    | Userscript duplicates parsing/cleaning even though toolkit modules exist                 | Toolkit modules are written to be reusable                  | Moving logic reduces code size and keeps Amazon fixes in one place.                              |

## Phased Integration Plan

1. **Ship a usable toolkit bundle**
   - Connect `common/amazon_toolkit/index.js` to the real module implementations (either via `require` statements or by building a concatenated file for `@require`).
   - Expose a single global (e.g., `window.AmazonToolkit`) when running in ViolentMonkey and verify helpers (`AmazonToolkit.Links.cleanAmazonURL`, etc.) are callable.
   - Tests: load the bundle in a standalone HTML fixture, run `AmazonToolkit.parseURL('https://www.amazon.com/dp/B08N5WRWNW?th=1&psc=1')`, and assert the returned structure keeps variant params.

2. **Replace URL parsing inside `markdown_linker`**
   - Swap `isAmazonHostname/isAmazonProductUrl` usage for `AmazonToolkit.Links.parseAmazonURL()` output so every Alt+Z path works with a structured object.
   - Update `extractUrlFromAnchor()` to delegate `AmazonToolkit.Links.parseAmazonAnchor()` for the opt+click path, falling back to legacy logic only when toolkit parsing fails.
   - Tests: opt+click multiple anchor types (plain, image, tiles without `<a>`) on at least two ![amazon](docs/images/icons/amazon.png) `Amazon` product pages and confirm the inferred URL + ASIN match toolkit output.

3. **Adopt toolkit URL cleaning + preservation**
   - Replace `cleanUrl()` with `AmazonToolkit.Links.cleanAmazonURL()` for ![amazon](docs/images/icons/amazon.png) `Amazon` hosts while leaving non-Amazon URLs untouched.
   - Honor `preserveVariants`/`preserveSeller` flags via future user preferences so color/size sticks around when the user toggles variants.
   - Tests: validate the cleaned URL retains `th`/`psc` for multi-variant items but still removes `pd_rd_*` trackers using clipboard output comparisons.

4. **Move title normalization and markdown generation**
   - Feed toolkit extractor output into a new domain-specific branch inside `getDomainSpecificTitle()` so `Alt+Z` can use `generateProductLink()` / `generateStoreLink()`.
   - Retire bespoke `normalizeTitleForUrl()` logic for ![amazon](docs/images/icons/amazon.png) `Amazon` by relying on `cleanProductTitle()` and `markdown_formatter.js` options (e.g., `removePrefix`, `removeSuffix`).
   - Tests: ensure `Alt+Z` titles switch from `URL (forward/reverse)` to concise `Brand: Product Variant` strings while non-Amazon domains retain existing behavior.

5. **Centralize shared helpers**
   - Remove `isAmazonHostname`, `formatPathSegment` (for ASIN cases), and other domain helpers from the userscript once toolkit equivalents exist; keep only glue code or UI-specific logic (buffers, notifications, `<kbd>Alt</kbd> + <kbd>Z</kbd>` interactions).
   - Tests: `node --check markdown_linker/markdown_linker.user.js` and lint runs to ensure no orphan references remain.

6. **Add regression test harness**
   - Create a small Node-based smoke test that loads `tests/fixtures/amazon/products/*.html` via `jsdom`, pipes each into `AmazonToolkit.extractProductData()`, and asserts markdown produced by toolkit matches expected snapshots.
   - Wire that harness into CI or at least document the command so we can run it before shipping future ![amazon](docs/images/icons/amazon.png) `Amazon` changes.

## Validation & Manual Testing Checklist
- Clipboard flow: run `./violentmonkey.zsh --script markdown_linker/markdown_linker.user.js --debug`, visit two different ![amazon](docs/images/icons/amazon.png) `Amazon` product URLs, and confirm `<kbd>Alt</kbd> + <kbd>Z</kbd>` copies the new title style.
- Buffering: hold `<kbd>Alt</kbd>` and click multiple cards to ensure the buffered list still formats correctly once toolkit-derived titles are used.
- Non-Amazon sanity: smoke-test GitHub/Jira links to ensure toolkit imports do not affect general parsing paths.
- Fixture-driven regression: run the proposed `node tests/amazon_toolkit_smoke.js` script to compare extractor output against stored JSON for `product_00`, `product_01`, `product_02` fixtures.

## Open Questions
- Should we prefer toolkit markdown generation (which may include brand + variant data) everywhere, or only in `<kbd>Alt</kbd> + <kbd>Z</kbd>` mode while keeping manual menu entries stable for now?
- Do we want to expose toolkit options (URL format short/medium/long, title max length) as ViolentMonkey preferences before flipping the defaults?
- What is the desired distribution method for the toolkit bundle (single concatenated file committed to the repo vs. generated artifact during build)?
