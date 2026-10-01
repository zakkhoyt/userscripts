


This repo has several `userscripts` (`*.user.js`). 
* Learn more by reading these notes: `albuquerque/docs/.ai/planning/markdown_linker/planning_references/notes/userscript/**/*`

# UserScript documentation

* I'd like you to research and draft a document about userscript extensions/engines
* Use the claude skill `/write-markdown` (`~/.claude/skills/write-markdown/`) to research and draft a document set
  * Docs in this set can use dirs to group related docs together. 
* `docs/.ai/planning/markdown_linker/planning_references/notes/userscript/guide/README.md` - landing page
  * Blurb about what this **doc series** is about, how it's broken up generally, what each dir and file is about, how they are related, etc...)
  * Contains a TOC which links to the other **/*.md files in this dir
    * Markdown link to each doc, (relattive filepath for link title)
  * `README.md` is a markdown file and must follow all of the same markdown conventions and instructions like any other doc produced by `/write-markdown`
* `docs/.ai/planning/markdown_linker/planning_references/notes/userscript/guide/USERSCRIPT_OVERVIEW.md` - the main/general document

!!! info <!--title-->
    For the purproses of below, we need an list of userscript browser extension which I will annotate as:
    `${USERSCRIPT_BROWSER_EXTENSIONS}=(voilentmonkey, greasemonkey, tampermonkey, etc...)` 
    (do include others if I missed some)

* `docs/.ai/planning/markdown_linker/planning_references/notes/userscript/guide/USERSCRIPT_EXTENSIONS_COMPARED.md` 
  * Introduces the user to `${USERSCRIPT_BROWSER_EXTENSIONS[@]}` with a short blurb about each and makes it unique (markdown links to the full docs for each)
  * The main thing I want out of this docs is to compare and contrast the VIOLENTMONKEY vs GREASEMONKEY vs ....
    * What sets them apart? 
    * What do they have in common?
    * How do thier APIs differ?
    * Aspects I'd like to see includes
      * how do thier metadata syntaxes compare to each other
      * what about their APIs? What's common across all? What's unique
      * which extensions are derived from others? 
    * etc...
  * Make use of tables or diagrams where useful


* `for USERSCRIPT_BROWSER_EXTENSION in ${USERSCRIPT_BROWSER_EXTENSIONS[@]}`:
  * Create an overview document: * `docs/.ai/planning/markdown_linker/planning_references/notes/userscript/guide/browser_extensions/${USERSCRIPT_BROWSER_EXTENSION}/${USERSCRIPT_BROWSER_EXTENSION}.md` - 
    * about the `${USERSCRIPT_BROWSER_EXTENSION}` browser extension
      * discuss which browsers support the extension
        * how the extension differs accross the browsers (is it compiled with different capabilites)
        * Can the extension access different resources / permissions in one browser vs another?
  * Create an programming document: * `docs/.ai/planning/markdown_linker/planning_references/notes/userscript/guide/browser_extensions/${USERSCRIPT_BROWSER_EXTENSION}/${USERSCRIPT_BROWSER_EXTENSION}_PROGRAMMING.md` - 
    * A quick tutorial on the APIs when writing a userscripts
    * Add many reference links throghout these docs
    * metadata/header - discuss the modern syntax used. Not older syntax in a subsection as well though
      * which are required? 
      * which are optional;?
    * APIs - Info about programming APIs for the platform 
      * Commonly used APIs
      * Links, links, links
        * full API docs, metadata docs, homepage references
        * link to docs for any API that is called (as a comment in the code fence)
  * Example userscripts: `docs/.ai/planning/markdown_linker/planning_references/notes/userscript/guide/browser_extensions/${USERSCRIPT_BROWSER_EXTENSION}/examples/${(L)USERSCRIPT_BROWSER_EXTENSION}_example_*.user.js`
    * Include a feww short example userscripts using the metadata and APIs for `USERSCRIPT_BROWSER_EXTENSION`
    * Examples should be WELL COMMENTED (just like `/Users/zakkhoyt/conductor/workspaces/userscripts/albuquerque/markdown_linker/bundler/src/markdown_linker.source.js` is)
    

* Other content I want included
  * Discusses what userscripts are, a bit about the history, interesting bits from wikis
  * Differen wayt to consume userscripts
    * Browsers only? Are there other ways to run them?
    * Are they only run in browser extensions? Is there any other ways to do this kind of thing in a browser?
  * Modern browser support
    * Differences across browsers (permissions, ability to run scripts, sandboxing rules, what the scripts can/can't access, etc..)
  * Browser Extensions
    * greasemonkey, violentmonkey, etc...
    * link to the specifi *.md files on for each browser
  * Should def link to other markdown files under this dir where relevant
  * Should provide lots of resource links (educational, programming, documentation, etc..)



--






Anyhow, to accelerated deveopment, I wrote a helper script


`scripts/violentmonkey/violentmonkey.zsh`, which is symlinked to `./violentmonkey.zsh`



