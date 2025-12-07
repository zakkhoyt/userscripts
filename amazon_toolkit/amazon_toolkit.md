
# Amazon Toolkit
Let's explore building a reusable "amazon toolkit" (meaning a class / library / framework). 
IE: a piece of code that that has a simplified public interface and which encasuplates the complexityies and implementation details. 

Ideally we implement this "amazon toolkit", then we can update our userscript to consume it later. 

## Convention
This "toolkit" should follow our AI instructions for userscripts (`.github/instructions/userscript-conventions.instructions.md`) even if it might be general javascript file. 
* re-read our AI instructions for userscript at `.github/instructions/userscript-conventions.instructions.md`, then apply it to this "toolkit" 

## Compatibility
This "toolkit" should be consumable from userscript, javascript, and node scripts (ideally all of these). 
* IE: let's write it with compaitble tools (whicih I think is already covered in `docs/notes/amazon_url/AMAZON_PRODUCT_SCRAPING_GUIDE.md`)

## Interface

This "toolkit" should have public APIs for:
* everything that `docs/references/amazon_fetch/amazon_tools2.js` can do
* everything outlined in `docs/notes/amazon_url/AMAZON_PRODUCT_SCRAPING_GUIDE.md`
* everyhing amazon related in `markdown_linker/markdown_linker.user.js`


## DataSources & References
This "toolkit" should use all of our dataSources (*md, *.js, *.userscript.js) and all of our learnings from above in this thread. 

### *.md
Re-read the legacy markdown docs
Our older markdown files (moved to a new subdirectory): 
* docs/notes/amazon/coding/AMAZON_IMAGE_URL_ANATOMY.md
* docs/notes/amazon/coding/AMAZON_SCRATCHPAD.md
* docs/notes/amazon/coding/AMAZON_URL_ANATOMY.md
* docs/notes/amazon/coding/AMAZON_URL_MINED_QUERY_PARAMETERS.md

Re-read the 3 markdown docs that were created eariler in this thread, prefereing this as a data source where there are conflicts with the above
* docs/notes/amazon_url/AMAZON_PRODUCT_SCRAPING_GUIDE.md
* docs/notes/amazon_url/AMAZON_URL_REFERENCE.md
* docs/notes/amazon_url/AMAZON_IMAGE_URL_REFERENCE.md

An re-read these scripts (which will be updated to use this "amazon toolkit" in the near future)
* `docs/references/amazon_fetch/amazon_tools2.js`
* `markdown_linker/markdown_linker.user.js`

## Implementation
* The implementaiton doesn't need to be called "amazon toolkit"; Choose a name that follows typical JavaScript conventions
* Write the new "amazon toolkit" files under the newly created dir: `amazon_toolkit/**`, which you can rename to reflect ^.
* Do not simply copy/paste the code from existing scripts as that code may not be compaitble, may be buggy, and does not follow the conventions outlined in AI instructions.  
    * Analyze each dataSource (listed below), ensure that all code conforms to the AI instructions. 

* DO NOT modify any other files during this phase, only write our new toolkit code and (if helpful) a markdown to reflect what's done and what's left to do. 
### NameSpaces
I think it is wise to design this "toolkit" with what I'm going to call namespaces. Here is very rough idea. 
* amazon_toolkit/product_extractor
* amazon_toolkit/store_extractor
* amazon_toolkit/url_toolbox - funtions that take in data structs from:
    * product_extractor
    * store_extractor
    * html anchors (this refers what we currently do in "opt+z+click" on anchor)

## Other
BTW I ran into some rate limiting problems while developing amazon_tools.js, so it would be good to note that. Doing things like retaining the source code (vs re-fetching would be helpful)


let's explore this idea. Ask me questions





<!-- I mentioned this eariler, but let's consider building an amazon toolkit (a class maybe?). 

---

* This amazon toolkit file shoudl follow all instructions defined in `.github/instructions/userscript-conventions.instructions.md` (read it in full, then apply during write)
* Should be a separate/importable file that we can use from `markdown_linker.user.js` (don't modify that file at this time) and from other userscripts in the future. 
* Refactor the amazon utilities found in `docs/references/amazon_url_miner_node/amazon_tools.js`, 
* Add functions to cover the amazon related stuff from our user scirpt. 

The public API should have support for everything amazon related in both of these current scripts:
* `docs/references/amazon_url_miner_node/amazon_tools.js`
* `markdown_linker/markdown_linker.user.js`

Let's stirctkly focus on creating that amazon toolkit. Do not modify these files right now. Do read them though. 
* `docs/references/amazon_url_miner_node/amazon_tools.js`
* `markdown_linker/markdown_linker.user.js`
* any other pre-exising *.js file
Do not simply copy/paste the code. Analyze each piece, rewrite it according to the AI instructions. 
 -->

---

I was expecting that these files would contain classes (or most of them would). 
* Is there a reasoning behind using just a loose collection of functions? 
* What would consumer code look like? Are these function nested under some namespace when they are called? 
Let's discuss the pros/cons of such an architecture. 
* how does public/internal/private scoping work here? I didn't see any of those keywords used. Are they not supported?

Let's discuss writing tests for the amazon and userscript_common libraries. I can provide raw product source code (as files). 
* What else would you need from me? 
* how to structure tests for this kind of environment?
* what does the dir hierarchy look like?

I do have some more things to talk about but lets' cover these two first. 


why is `function extractASIN(doc, url)` in shared_extractor? (and similar question for other product related functions) It's product releated and I would think goes in product_extractor (maybe I'm wrong and it's )
 If these functions remain in share_extractor the I ask that you be more specific with function names. Here are a few examples:
    * function extractASIN(doc, url) -> function extractProductASIN(doc, url)
    * function extractTitle(doc) -> function extractProductTitle(doc)
    * function extractBrand(doc) -> function extractProductBrand(doc)
In fact update functions names in all cases where the filename isn't descriptive enough


* I feel like `dom_helpers.js` and `logging_helpers.js` are not amazon specific and could be very useful for future userscripts that are written in this repo (since AI instruction will always call for these thing). We should move these to their own "library". I already made a directory for it: `userscript_common`

--- 

