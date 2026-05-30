





---



# Agent Boostrapping
* I want to get back to work today however it's been several months since working in this repository. 
* I doubt any of the AI chat sessions are still accessible on this machine, so I'll do the best I can to provide the new Agent with history, context, etc...

* In order to understand what this repostiory is:
  * Read `GUIDE.md` in the repo root
  * Read `README.md` in the repo root
  * Then read *all* files in this repo to understand what the code is for, best practices, etc..
  * Read git commit history as well to understand what has been changed and what was last being worked on. 
  * Read pull request history as well

# WIP PRs
* it looks like we are on a branch for the yoututbe library, which has a PR. 
* Please review this PR using the `/review` skill
* Summarize any findings before changin
* Let's get this PR merged so we can start today's work fresh from `main`


--- 



# Organize my legacy planning notes for markdown_linker
* Today I want to resume working on `markdown_linker/markdown_linker.user.js.md`
* I was reading through my legacy planning notes, but am having a hard time figuring out what is done, what is not. 
  * These notes also contain "ideas" which are just thoughts from my mind that I write down until I can re-write them into more detailed prompts which are then fed into a planning agent.
* Please read (not write) these files then compare against the current state of the code:
  * markdown_linker/ai/planning/legacy_planning/markdown_linker.user.js
  * markdown_linker/ai/planning/legacy_planning/markdown_linker.user.js.md
* Then produce two new documents to organize the content from those two files:
  * markdown_linker/ai/planning/legacy_planning/LEGACY_PLANNING_IDEAS.md
  * markdown_linker/ai/planning/legacy_planning/LEGACY_PLANNING_STAGED.md
  * markdown_linker/ai/planning/legacy_planning/LEGACY_PLANNING_COMPLETED.md


* After this I will organize, add some more informatoin, and then we can get to work with a planning agent for markdown_linker

---





We will be working on 
* `markdown_linker/`
  * `common/amazon_toolkit/`
  * `common/youtube_toolkit/`

# About my environment
* These userscripts are being written mainly for myself, though I might eventually publish some
  * macos (currently `26.4.1`)
  * firefox (currently `151.0.2`)
  * violentmonkey (currently `2.40.0`)




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


--- 
