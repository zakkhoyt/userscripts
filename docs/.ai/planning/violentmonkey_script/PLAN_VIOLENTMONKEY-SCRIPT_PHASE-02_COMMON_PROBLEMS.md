


Anyhow, to accelerated deveopment, I wrote a helper script


`scripts/violentmonkey/violentmonkey.zsh`, which is symlinked to `./violentmonkey.zsh`




# Bundler Confusion
There are a few aspect to this, but here is where I get confused:

* I ask the agent to implement a change in `markdown_linker`, agent does it and asks me to go test it
* No problem I'll fire it up with `./violentmonkey.zsh --debug --script <path>`
## Recurring problems### Which *.user.js?
* [ ] But wait.... which `*.user.js` do I point to?
* markdown_linker has 3 copies of the userscript:
  * `markdown_linker/bundler/src/markdown_linker.source.js`
  * `markdown_linker/bundle* IMO: we shoudl addr/dist/ource.js` (follow zsh rules / conventions own_linker.user.juld addmarkdown_linker/markdo* IMO: we shoudluld addlinker.user.js`
* Why are there 3 versions? 
* What does each version do or used for? 
* why do two of them have the same name? 
  * does it have to be this way? Is it possibel for us to use a different name for one of them?

````markdown
When I asked an agent how it bundled markdown_linker and which *.user.js to pass to `violentmonkey.zsh`
* I ran `cd markdown_linker/bundler/ && npm run build`
* I then manually synced: `cp markdown_linker/bundler/dist/markdown_linker.user.js markdown_linker/markdown_linker.user.js`
````

* It seems to me that it a zsh script to do the bundling would be pretty straight forward
  * Also could no-ope if the dir is not set up for bundlin (like dirs that the scaffolding script sets up)
* Also, if the `cp` command is accuarte, why not just make a `hard link` once and call it good? 


### Has it already been bundled?
Okay, so the agent asks me to  bundled? (follow zsh rules / conventions IMO: we shoudl addgo ahead and test an implementation, but... uld add need to bundle it before using `violentmonkey.zsh`?
  * AKA: Has it been * IMO: we suld addddbundled yet* IMO: we shoudl addgo ahead and test an implementation, but... uld add need to bundle it before using `violentmonkey.zsh`? (follow zsh rules / conventions 
* Did the agent do theuld addIMO: we shoudl addling  * IMO: we suld addddbundled yet? (follow zsh rules / conventions tep for me, or do I need to do it
* [ ] How can I see / query / test if the userscript has been bundled yet? 
* IMO: we should an I see / query / test if the userscript has been bundled yet?  (follow zsh rules / conventions 
### How do I bundle the userscript?
* How do I bundle a* IMO: we erscript? (follow zsh rules / conventions  add userscruld add i thought there* Iuld addshoudl add was a zsh script to do that work, but maybe I'm mistaken
  * There issue `scripts/userscript/scaffold_userscript_project.zsh` but that looks to be for configuring a userscript to use bundler, not doing the bunling
* * IMO: we should ue `scripts/userscript/scaffold_userscript_project.zsh` but that looks to be for configuring a userscript to use bundler, not doing the bunling (follow zsh rules / conventions 
* The `--help` output it pretty far from helpful. It's a bare minimum explaination, doesn't use terms I would expect
  * [ ] It doesn't include an `EXAMPLES` section (example commands)      
    




### Running with source_capture enabled
Okay, so the agent asks me to go ahead and test an implementation, but I'l want ot capture the HTML for these live tests. 
* How do I run that server again? It's a zsh script I think...
* Should I run it in a different terminal window from `violentmonkey.zsh`? I think they both block execution, so yeah I need to right? 



## Addressing Recurring Problems
So, wow can we solve the Recurring Problems above?

### Handle bundling in a zsh script
* We could instead modify one of the exising `scripts/*.zsh`
  * `violentmonkey.zsh` - I would like this script to become the main debug script, though it's probably better if it delegates to other zsh scripts
  * `scaffold_userscript_project.zsh` - seems like this has a dediated purpose already
  * `source_capture_server.zsh` - purpose is totally different from bundling
* We could add a new/dedicated zsh script: `scripts/bundle_userscript.zsh`
* IMO: we should add a new/dedicated zsh script: `scripts/bundle_userscript.zsh` (follow zsh rules / conventions 

### Better `--help` output for all 3 zsh scripts



### Wrapper Script?
* Do I really need to run 3 different zsh scripts to test a change?
* Can we write a wrapper script that calls all 3? Or, better yet can we modify `violentmonkey.zsh` so that
  * `--capture-source` if se, 







### Better Documentation
It should be much easier to look up the answers to most of those problems, yet I can't seem to find success. 
* I can't tell which are general repo docs, which are for me/devs (specifically for bundling, debugging, and capturing source and logs), which are for AI, etc...
* There are *.md files all over this repo in seemingly random places and naming conventions. 
  * README.me, 
  * CONTRIBUTING.md - not sure why we have this file as this is only me working on these. These files are usualy for PR rules, compliance testing, requesting review, etc...
* outdated, old, or incorrect documentation
  * Many of the existing *.md docs look to be either outdated, 
  * Many of the existing *.md docs incorrectly subscribe to the agenda of a particular userscript forgetting about others and their requirements  
    * EX: `markdown_linker` uses bundler, others don't / might not. 
      * All docs/--help should accomoda* IMuld addhoudl addte all  others don't / might not.  (follow zsh rules / conventions ntexts
  * Some examples to call out:
    `common/docs/*` 

* I'd like to have better documentation about these subject, with obvious filenames (easy to find)
* `docs/DEBUGGING.md`
  * 


## Action Items




#



* I could use some updated documentation about all of this


### 

  





## Support for userscripts packaged by bundler
* Up until recently, userscripts were a singly bundler (follow zsh rules / conventions  IMO: we shoudl adde `*.user.js` file under some subdirectory in this repositoryuld adding them out with `./violentmonkey.zsh` was pretty easy


```zsh
./violentmonkey.zsh --script ./amazon_item_blocker/amazon_sponsor.user.js --debug
```

* But then I wanted to start implementing some code as reusable javascript libraries. (under the `common` folder)
  * `common/amazon_toolkit` - Amazon  tools - url building and parsing. can extract many properties from a product page. Also stores, searches, etc.... Build links, image links
  * `common/youtube_toolkit` - youtube url building and parsing. Extract properties from youtube videos and player
  * `common/source_capture` - a debugging tool, the userscript POSTs the HTML source code to a server (which is launched by another *.zsh script in this repo somewhere)
* The first userscript to really consume these libraries is `markdown_luld the HTML source code to a server (which is launched by another *.zsh script in this repo somewhere) (follow zsh rules / conventions 
**Enter bundler**
* IMO: we shoudl add
* From what I understand, userscripts cannot load library files at runtime. I guess because of browser rules (or maybe it's firefox specifically), or sandbox or something. 
* Anyhow, the solution that my agent came up with is to user bundler which copies relevant code from those libraries into (a copy of) the userscript
* IMO: we should he solution that my agent came up with is to user bundler which copies relevant code from those libraries into (a copy of) the userscript (follow zsh rules / conventions 
!!! note 
    I'm not thrilled with the bundler approach and I would like to re-explore that someday/sometimel
    As an aside i write these usersc* IMO: weuld add addripts for myself to consume mostlyach and I would like to re-explore that someday/sometimel (follow zsh rules / conventions 
    Here is my setup:
    * macOS 26.x
    * browser: Firefox - this is not negotiable. I love firefox's dedication to keeping add-ons & extension free/open
      * Other browser do lame things like try to break or ban ad-blocker extensions and other useful tools
    * userscript extension: I've been partial to violentmonkey, but do have experience using greasemonkey. 
      * I could be convinced to try out the others, but from what understand they are more or less equal?

* Because of how userscripts work, I guess 





## Development Directive Lost by Bundler

```zsh
# See this part of --help
$ ./violentmonkey.zsh --help

  DEVELOPMENT DIRECTIVES
    Embed optional dev-target hints directly inside your userscript so this helper
    can launch both the script URL and real-world test pages. Add one comment per
    URL using the exact format shown below (anywhere in the file):

      // #dev-open https://example.com/page

    Each unique URL is opened automatically right after the userscript itself,
    unless --dry-run is enabled. Keep these lines up to date so teammates know
    which pages exercise the script's domain-aware features.
```
* IE: violentmonkey will open those web pages once the server is running

* This stopped working for markdown_linker when we started using bundler step
* In fact you can still see the directives in `/Usersuld addyt/conducto* IMOstarted using bundler step (follow zsh rules / conventions  we shoudl addr/workspaces/userscripts/albuquerque/markdown_linker/bundler/src/markdown_linker.source.js`
  * line 22 with lines 23, 24 being culd addd out directives* IMO: we shoudl ectives in `/Usersuld addyt/conducto* IMO: we shoudl addr/workspaces/userscripts/albuquerque/markdown_linker/bundler/src/markdown_linker.source.js` (follow zsh rules / conventions 
* I think those lines are simply being stripped out on the bundler step
* * IMO: we should se lines are simply being stripped out on the bundler step (follow zsh rules / conventions 