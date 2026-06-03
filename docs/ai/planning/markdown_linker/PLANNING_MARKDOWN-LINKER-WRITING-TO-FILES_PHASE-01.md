
# Saving HTML & JavaScript source code to disk

## Writing to files from userscripts

The intent here is to create a dev-time tool. This will help me/agent to capture the actual source code which will help us debug and figure out how to extract additional data. Also will build an archive of pages to help double check extraction techniques. 


Now then, if we can save HTML / js source, then we can also save our logs, right? This would be tremendously helpful for getting agents access to the logs. 

This feature would be very useful in any userscript really. I think this should be implemented under `common/` as a standalone piece of code (that has no ties to markdown_linker, just called by it)


## Triggering

Let's control this behavior with a new `preference` (we have an existing preference: `# Alt+Z title: Anchor text (click to cycle)` where you have to click on it to iterate to the next preference setting). 

We only have two choices in this case
* none
* html & logs



## Sequencing

When to actually make the post? After writing the output to the clipboard (no matter the trigger). 
Make the post to the server at that time
* if the call fails / server not available: Fail gracefully, just log a line about it
* if the call succeeds, I would like our home made notification/feedback UI to indicate that the file was saved (as a second paragraph/sentence) 


## Filepath

* products: in the repo: `.gitignored/${userscript_name}/sources/products/${dsin}.html`
  * a `products` folder as we will be adding support for `stores`, `searches`, and other page types in the future. 
* logs: in the repo: `.gitignored/${userscript_name}/logs/${dsin}.html`


## Server
Sounds like we should implment this new server as it's own *.zsh script (please follow the zsh conventions listed in the rules under `~/.claude`). 







