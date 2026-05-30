# Amazon Toolkit Integration Plan

## Goals
- Align ![amazon](docs/images/icons/amazon.png) `Amazon` link handling between `markdown_linker/markdown_linker.user.js` and `common/amazon_toolkit/**` without regressing existing features.
- Capture a phased plan (with validation checkpoints) before migrating runtime logic so we can discuss scope and testing expectations up front.

## Status (2026-01-16)

### ✅ Completed Integration
- Module registry established: toolkit files register under `window.__AmazonToolkitModules[...]` (browser) while exporting via CommonJS (Node)
- `common/amazon_toolkit/index.js` wired to real extractors/helpers/link utils/markdown generators
- Userscript delegates all ![amazon](docs/images/icons/amazon.png) `Amazon` anchor parsing and URL cleaning to toolkit (`parseAmazonAnchor()`, `cleanAmazonURL()`)
- Link parser unwraps sponsored redirects (`/sspa/click`, `/gp/slredirect`, `/aclk`), canonicalizes `/dp/{ASIN}` paths
- Title normalization uses `cleanProductTitle()` + `formatTitle()` to strip suffixes
- Logs now show `type`, `asin`, redirect counts for each ![amazon](docs/images/icons/amazon.png) `Amazon` action

### 🚧 Current Blockers
1. **"Amazon toolkit unavailable" false positives in logs**
   - Toolkit IS loading and working correctly
   - Warning logs are misleading/incorrect - need to remove or clarify condition
   - Appears around line 171-172 in [markdown_linker/markdown_linker.user.js](../markdown_linker.user.js)

2. **Bloated URLs still present** (all menu entries)
   - URLs retain full paths and tracking params despite toolkit integration
   - Expected: `https://www.amazon.com/dp/B0CTPML3NM`
   - Actual: `https://www.amazon.com/ORGANIC-VALLEY%C2%AE-.../dp/B0CTPML3NM?crid=...&sprefix=...`
   - Indicates `cleanAmazonURL()` not being called or not working correctly

3. **URL-encoded characters in titles** (`%c2%ae` not decoded to `®`)
   - Example: "Organic Valley%c2%ae Cheddar" should be "Organic Valley® Cheddar"
   - `formatTitle()` needs to handle URL decoding

4. **Trailing `- Dp` still present in some titles**
   - `cleanProductTitle()` regex may not be matching all cases
   - Needs investigation of title cleaning pipeline

5. **Additional suffix to remove: ` : Grocery & Gourmet Food`**
   - New pattern identified, needs adding to `cleanProductTitle()`

6. **`userscript_common/` files need reorganization**
   - `logging_helpers.js`, `dom_helpers.js` are generic utilities, not Amazon-specific
   - Should move to `common/userscript_common/` for broader reuse
   - Need to verify this doesn't break existing imports

### 📋 Next Actions (Priority Order)
1. Fix "toolkit unavailable" false positive logs
2. Verify `cleanAmazonURL()` is being called for all menu entries
3. Add URL decoding to `formatTitle()`
4. Debug `- Dp` suffix removal
5. Add `: Grocery & Gourmet Food` to suffix removal list
6. Reorganize `userscript_common/` files
7. Maintain frequent documentation updates (this file + [user.md](../markdown_linker.user.md))

## Historical Context (For Reference)

### ![amazon](docs/images/icons/amazon.png) `Amazon` Toolkit highlights
- `common/amazon_toolkit/extractors/product_extractor.js` already assembles rich product data (ASIN, title, price, variant, images) with fallback chains (JSON-LD → meta → DOM) suitable for both browser and Node contexts.
- `common/amazon_toolkit/links/link_parser.js` classifies URLs into product/store/search/deals, extracts ASIN + seller IDs, and retains variant vs tracking params so downstream callers know what to preserve.
- `common/amazon_toolkit/links/link_cleaner.js` normalizes `/dp/` links, keeps variant params (`th`, `psc`, `smid`) when requested, and strips tracking suffixes.
- Tests/fixtures (`tests/fixtures/amazon/**`) provide saved HTML that can be fed into the extractors for regression checks without live scraping.

### Gap Analysis

| Concern                              | Current userscript logic                                                                 | Toolkit capability                                          | Notes                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| URL type classification              | Regex helpers (`isAmazonProductUrl`) and manual hostname checks                          | `determineURLType`, `parseAmazonURL`                       | Prefer a single parser to detect product/store/search cases.                                     |
| ASIN & variant extraction            | Delegates to toolkit parsing for both URLs and anchors (legacy regex removed)            | `extractASINFromURL`, `parseAmazonAnchor`, variant capture | Keep monitoring tiles without anchors so toolkit continues to cover every click surface.        |
| URL cleaning                         | Thin shim over `AmazonToolkit.Links.cleanAmazonURL()`                                    | `cleanAmazonURL` with `preserveVariants/seller` flags       | Any missing canonicalization now surfaces as warnings instead of silently stripping variants.    |
| Title normalization                  | Ad-hoc stripping of `Amazon.com:` prefix and limited path formatting                     | `cleanProductTitle`, `markdown_formatter.js`                | Toolkit formatter handles suffixes like `: Clothing, Shoes & Jewelry` already.                   |
| Domain-specific title overrides      | Only ![youtube](docs/images/icons/youtube.png) `YouTube` handled via `getDomainSpecificTitle` | Product/store extractors + markdown generators              | Feeding extractor output into toolkit markdown generator would yield concise product/store titles. |
| Data re-use / DRY                    | Userscript duplicates parsing/cleaning even though toolkit modules exist                 | Toolkit modules are written to be reusable                  | Moving logic reduces code size and keeps Amazon fixes in one place.                              |

### Phased Integration Plan (Original)

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

### Validation & Manual Testing Checklist
- Clipboard flow: run `./violentmonkey.zsh --script markdown_linker/markdown_linker.user.js --debug`, visit two different ![amazon](docs/images/icons/amazon.png) `Amazon` product URLs, and confirm `<kbd>Alt</kbd> + <kbd>Z</kbd>` copies the new title style.
- Buffering: hold `<kbd>Alt</kbd>` and click multiple cards to ensure the buffered list still formats correctly once toolkit-derived titles are used.
- Non-Amazon sanity: smoke-test GitHub/Jira links to ensure toolkit imports do not affect general parsing paths.
- Fixture-driven regression: run the proposed `node tests/amazon_toolkit_smoke.js` script to compare extractor output against stored JSON for `product_00`, `product_01`, `product_02` fixtures.

### Open Questions
- Should we prefer toolkit markdown generation (which may include brand + variant data) everywhere, or only in `<kbd>Alt</kbd> + <kbd>Z</kbd>` mode while keeping manual menu entries stable for now?
- Do we want to expose toolkit options (URL format short/medium/long, title max length) as ViolentMonkey preferences before flipping the defaults?
- What is the desired distribution method for the toolkit bundle (single concatenated file committed to the repo vs. generated artifact during build)?
