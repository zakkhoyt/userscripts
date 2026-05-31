



<!-- 
I want to get back to work on `markdown_linker/markdown_linker.user.js`, however it's been several months since working in this repository. 
I doubt any of the AI chat sessions are still accessible on this machine, so I'll do the best I can to provide the new Agent with history, context, etc...

# Agent Boostrapping
In order to understand what this repostiory is:
* Read `docs/ai/GUIDE.md` in the repo root
* Read `README.md` in the repo root
* Read *all* files in this repo to understand what the code is for, best practices, etc..
* Read git commit history as well to understand what has been changed and what was last being worked on. 
* Read github Pull Requests to get a bead on recent work

# GUIDE.md
* Create a new document in the root of this repository: `GUIDE.md`
* Format the content for ingestion by AI agents
* The content should describe what this repository is, what it contains, that it was written for use in macos/firefox/violentmonkey, etc...
  * A claude skill is available to help with this: `/write-markdown` 
* The idea is that I can spin up new agents and have them read this file to get a full understanding of the repo


# README.md & CONTRIBUTING.md
* I started re-rewriting README.md. Please finish this work for me
* Proofread what I have written
* continue writing the document in the same style and according to AI rules about markdown 

-->



---

<!-- 
# claude rules

* I'd like you to pull `~/.ai/instructions/userscript/*` into this repository,
* Format the content for claude rules convention
* Do not shorten or drop any of the content, just change any incompatible formats
* Okay to rename the file too. 



# Newer code is NOT following required conventions

First let me make sure i'm understanding something

* My understanding is that the bundler works:
  * accepts a source script as an input: This would be `markdown_linker/markdown_linker.user.js`
    * copied to `markdown_linker/bundler/src/*`
  * I'm not sure where this is defined, but something has to associate the userscript with library source codde
    * copied to `markdown_linker/bundler/lib/*`
  * The bundler then packages the two together into an a single script and writes that output to 
    * written to: `markdown_linker/bundler/dist/markdown_linker.user.js`
  * bundler and wrapper scripts should NOT overwrite the input script: `markdown_linker/markdown_linker.user.js`
* am I misunderstanding?
  * What's the purpose of `markdown_linker/markdown_linker.user.js` vs `markdown_linker/bundler/src/markdown_linker.source.js`?
  * I thought bundler/src is a read-only dir? 
    * if not, why do we have both files?
    * Why are both files modified in the current PR?
* Write a new doc: `docs/ai/bundler/ABOUT_BUNDLER.md` that explains every thing above and more. 



* `markdown_linker/markdown_linker.user.js` was originally implemented following the instructions defined at: `~/.ai/instructions/userscript/*`
  * NOTE: those instrctions will be migratted into this repo. See: `# claude rules` above

* Unfortunately, it looks like some agent, bundler, or bundler script has STOMPED over the origianl implementation, replacing with dry/scraped code: `markdown_linker/markdown_linker.user.js`
* !! This is not acceptable aand must be repaired now !!


markdown_linker/bundler/src/markdown_linker.source.js




## Reference Code
* to see examples of code that follows these conventsions, 
  * see `common/amazon_toolkit/extractors/product_extractor.js` or any other of the amazon_toolkit files
  * Funny enough the `markdown_linker/bundler/src/markdown_linker.source.js` looks to follow the conventions. 




## Action Items

### claude rules for userscript / javascript
* This work is blocked by `# claude rules`, so get that done first

### Fix `markdown_linker/markdown_linker.user.js`
* Look at the git history for `markdown_linker/markdown_linker.user.js` to track down the last commit that contained well commented code
  * You will find VERY well commented code

* Find the last commit that followed this convention, then use it to restore the current file.
* Then follow up by rewriting the remaing code, applying the userscript 

### Fix `common/youtube_toolkit/**/*`
* it looks liek the youtube_toolkit was not written with these conventsions in mind either
* I'm going to ask that we re-write these files to match
  
### Common
* When fixing these files, hopefully only need to add comments...
* however, if other things are wrong, such as snake_case vs camelCase or what ever... then we must rewrite the code, callers, and mapping






# Early review

* I was looking at the PR and noticed something in `markdown_linker/bundler/src/userscript.entry.js`
* Our PR adds a single line: `import '../lib-youtube/index.js';
* however the amaazon code (just above in that same file) has many more lines in addition to `index.js`
* It looks like both libraries are structured the same way, so why the difference?

 -->

# Deploying markdown_linker

* Since we added the bundler step, I'm unsure of how to compile the bundled ooutput
* Please uppdate CONTRIBUTING.md to include a section about this
  * explain about bundler
  * explain how to use bundler to package a script (is there a wrapper script?)
    * include example code 
  * Explain where the bundled output script can be found
  * Explain how to load that script into violentmonkey (with example) using the ./violentmonkey.zsh script
