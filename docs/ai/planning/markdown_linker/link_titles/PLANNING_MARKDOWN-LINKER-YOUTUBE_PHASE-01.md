

<!-- 

# Youtube.com

* I've noticed some unexpected behavior for markdown_linker when using on youtube. 
* Reminder that we now have `common/youtube_toolkit` similar to `amazon_toolkit`


## Unexpected menu content

* I notice that when opt+clicking (popup menu) is not producing the expected menu items on some pages, but is on others
  * the page does give the expected menu option: https://www.youtube.com/watch?v=2KpWVXFRVNk
    * ![alt text](images/PLANNING_MARKDOWN-LINKER-YOUTUBE_PHASE-01/Firefox_20260606011634.png)
  * this does not: https://www.youtube.com/watch?v=uDuf-im3stk
    * ![alt text](images/PLANNING_MARKDOWN-LINKER-YOUTUBE_PHASE-01/Firefox_20260606011803.png)


* Here are a few things that I noticed:
  * the `page title` title contains the prefix `(57) ` which as to do with my inbox count. We have def added code to strip that out
  * Next there is no `timestamped` entry in the domain specific subsection
  * I'm sure there are more

* I'm a bit confused because I started up the source capture server (`/Users/zakkhoyt/conductor/workspaces/userscripts/albuquerque/scripts/source_capture/source_capture_server.zsh`), then reloaded the youtube pages listed above, and they both suddenly started working properly. 


## Source Capture Server. 

* I have the server running, but nothing is being captured from youtube.com (or any site right now)
* I do have the preference enabled in violentmonkey's confiruation UI
  * ![alt text](images/PLANNING_MARKDOWN-LINKER-YOUTUBE_PHASE-01/Firefox_20260606012515.png)
* I dont' have violentmonkey script/server running, but I dont' need to, right?

* I manually saved off some logs: /Users/zakkhoyt/conductor/workspaces/userscripts/albuquerque/.gitignored/markdown_linker/logs/youtube_mortalshell2.log 

-->