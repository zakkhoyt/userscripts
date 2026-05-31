
# bundling vs linking/loading
* Today I want to resume working on `markdown_linker/markdown_linker.user.js.md`
* One of the things that the agent and I were working on was:
  * how to structure code so that:
    * Create resuable libraries of javascript, consumable from userscript and any other javascripts like node, *.js, etc...
      * `common/amazon_toolkit/`
      * `common/youtube_toolkit/`
    * How to consume the code in those libraries from a userscript
      * I recall this being less than straight forward.
      * the agent that I was using wasn't great and concluded that userscripts run from firefox can't by loaded dynamically at runtime. 
        * The agent's solution was to copy the library code into the userscript. 
        * The agent wrote these docs: `common/docs/*.md`
        * And maybe this: `scripts/userscript/scaffold_userscript_project.zsh`
* I'd like today's planning agent to take a skeptical viewpoint about this (like me) and contuct research (discarding any bias towards bundling being necessary)
* Write a report about this: `markdown_linker/ai/planning/planning_references/notes/userscript/VIOLENTMONKEY_JS-LIBRARIES.md`
  * Use the `/write-markdown` skill to help with this report
  * This research should be conducted specifically for my preferred environment: 
    * macos (currently `26.4.1`)
    * firefox (currently `151.0.2`)
    * violentmonkey (currently `2.40.0`)
* I would prefer to link or load libraries vs bundling them.
* HOwever I can live with bundling so long as:
  * it's easy to deploy new userscript changes
  * the library source code can still be used with node scripts / js scripts
* We had tried formatting the library code in a a couple of different ways/conventions and then tried loading them from the userscripts.
  * I want to make sure that we left those libraries with the most modern library/interface conventions, not an older or weird convention. 
  * That is, so long is i doesnt' affect the bundler
* I noticed this new feature in violentmonkey: [Inject scripts into different contexts](https://violentmonkey.github.io/posts/inject-into-context/) 
  * Does this have to do with our bundling problem?
  * Please summarize what this new feature is good for and what we could do with it. 

