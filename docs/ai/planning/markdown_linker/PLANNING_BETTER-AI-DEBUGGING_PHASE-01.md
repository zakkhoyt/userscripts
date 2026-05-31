# Better AI Debugging

The problems: Right now I have to manually:
* Bundle the script+libraries
* install the lastest script into violentmonkey (I use ./violentmonkey.zsh for this)
* Then i have to manually interact with a webpage
* I ahve to open the debugger console in Firefox, manually save the logs to a file
* Then I have to tell the agent where to find the logs, etc...



## Ideas / solutions in order of helpfulness
* If the agent could somehow read the logs without any effort from me, that would be SOOO helpful
  * I am open to installing additional Firefox extensions, making changes to my configuraiton settins, etc... in order to get this to work\x1B[1m

* If we had a single zsh script to the following, that would be pretty helpful tooo
  * bundle a script
  * load up violentmonkey with the bundled script
  * Open a webpage of an affected domain
* Also if the agent knew to invoke that script when it's time to test


# ./violentmonkey.zsh is supposed to open a page of a matching domain. 
* I thought this was working for sure at some point but I don't notice it do so now. 
* I recall us defining and adding some customized meta/header comment to the userscript or somethign liek that. 
  * Maybe our bundler step is stripping it out?