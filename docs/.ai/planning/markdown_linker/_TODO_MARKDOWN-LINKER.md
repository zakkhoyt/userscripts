

# Bugs


## macOS Keyboard Layouts (affects opt key)

The macOS appliction (`Keyboard Viewer.app`) displays a virutal keyboard on screen. 
* When modifier keys are pressed down, the glyphs on the other keys are updated to reflect. 

**Border Colors**
* Keys rendered with a dark red border indicate that key's state is `key down` 
* Keys rendered with a white border indicate `mouse hover` (click to type)
* Keys rendered with an oragne border are.... ? I dunno. Maybe you can figure it out.


### Keyboard Layouts
`US` vs Custom (`x_layout`)
* The default keyboard configuration that ships with macOS is `US`
  * Pressing the `opt` key, the letter keys produce some alternate chars (like greek letters, etc...)




!!! info
    Images in this doc which 


## M
* [Insulated](https://www.amazon.com/dp/B0BVGFB7WW)
* [Insulated](https://www.amazon.com/dp/B0BVGFB7WW)
* [Insulated](https://www.amazon.com/dp/B0BVGFB7WW)

* [Epic
HSD-12706
Epic
HSD-15089
Epic
HSD-14527
Epic
HSD-12972](https://hatchbaby.atlassian.net/browse/HSD-12706)
* [Epic
HSD-12706
Epic
HSD-15089
Epic
HSD-14527
Epic
HSD-12972](https://hatchbaby.atlassian.net/browse/HSD-15089)
* [Epic
HSD-12706
Epic
HSD-15089
Epic
HSD-14527
Epic
HSD-12972](https://hatchbaby.atlassian.net/browse/HSD-14527)
* [Epic
HSD-12706
Epic
HSD-15089
Epic
HSD-14527
Epic
HSD-12972](https://hatchbaby.atlassian.net/browse/HSD-12972)



# Shortcuts
* In settingsUI and n/v preference storage, we should allow the user to define multiple shortcuts per listing
  * [X] ~~*Can we use normal keys as modifiers keys? EX: `opt z click` Currently*~~ [2026-08-14] 
* Add a dedicated shortcut/preference for showing the settings UI
* In the popup menu, allow arrow using the arrow keys to navigate
  * The right arrow should act as "return" if highlighted menuItem is a leaf (no children)
  * Using the actual return key might be an issue if the browser reacts to it already
  * Perhaps we should add preference & settings ui. Check box for each?
    * Allow `return` key to select menu item
    * Allow `right arrow` key to select menu item
  * Actually, I think I'd like to let the user customize this just like with the existing shortcuts. Let them build their own
















# Shortcuts
* In settingsUI and n/v preference storage, we should allow the user to define multiple shortcuts per listing
  * [X] ~~*Can we use normal keys as modifiers keys? EX: `opt z click` Currently*~~ [2026-08-14] 
* Add a dedicated shortcut/preference for showing the settings UI
* In the popup menu, allow arrow using the arrow keys to navigate
  * The right arrow should act as "return" if highlighted menuItem is a leaf (no children)
  * Using the actual return key might be an issue if the browser reacts to it already
  * Perhaps we should add preference & settings ui. Check box for each?
    * Allow `return` key to select menu item
    * Allow `right arrow` key to select menu item
  * Actually, I think I'd like to let the user customize this just like with the existing shortcuts. Let them build their own






# New Common Format



Let's look at what a few links would look like vs current output


## github.com

### Pull Requests
* url: `https://github.com/hatch-baby/mobile/pull/3463` 
* compared: 
  * page title: `[[HSD-18620] iOS: serialize IoTCommunicationProtocolStatusMonitor.statusSubject read-modify-write by zakkhoyt · Pull Request #3463 · hatch-baby/mobile](https://github.com/hatch-baby/mobile/pull/3463)`
  * reference format: `github.com: hatch-baby/mobile Pull Request #3463 - [[HSD-18620] iOS: serialize IoTCommunicationProtocolStatusMonitor.statusSubject read-modify-write by zakkhoyt](https://github.com/hatch-baby/mobile/pull/3463)`
* synthesizing the title
  * You could almost compose the new title format by rearranging the page title, however I suggest using the URL as the primary data source, falling back to the title, and then extracting from HTML
  * `github.com: hatch-baby/mobile Pull Request #3463` should come by transforming the url itself. 
    * if url contains `github.com/[^\]*/[^\]*/pull/[\d+]`
      * Here is ONE way this could be done, there are many. 
        * Prep the url for parsing by replacing some strings: `s/pull/PR/g` -> `github.com/[^\]*/[^\]*/PR/[\d+]`
        * regex capture groups`(github.com)/([^\]*/[^\]*)/(PR)/([\d+])`
        * Compose the link.title: `$1: $2 $3 #$4` ->  `github.com: hatch-baby/mobile Pull Request #3463`
  * The remainder of the expected link title is sourced from `page title`, 
    * I believe `page title` is currently originating from this part of the HTML:
      * `<meta name="twitter:title" content="[HSD-18620] iOS: serialize IoTCommunicationProtocolStatusMonitor.statusSubject read-modify-write by zakkhoyt · Pull Request #3463 · hatch-baby/mobile">`
      * Extracting the `content` value: `[HSD-18620] iOS: serialize IoTCommunicationProtocolStatusMonitor.statusSubject read-modify-write by zakkhoyt · Pull Request #3463 · hatch-baby/mobile`
      * Next can we drop ` by zakkhoyt · Pull Request #3463 · hatch-baby/mobile`
    * However there are other HTML elements that contain the bare PR title:
      * xpath: `/html/body/div[1]/div[6]/div/main/turbo-frame/div/react-app/div/div/div/div[2]/header/div[1]/div[3]/div/div[1]/div/h1/span[1]`



### Issues
Issues can be parsed similarly to [Pull Requests](#pull-requests)

* url: `https://github.com/hatch-baby/mobile/issues/2918`
[Cross-platform Git LFS bootstrap: ensure git-lfs installed/initialized + write guard (iOS + Android)](https://github.com/hatch-baby/mobile/issues/2918)

## stackoverflow.com
* URL: `https://stackoverflow.com/questions/11876485/how-to-disable-generating-special-characters-when-pressing-the-alta-optiona`

* page title output: [macos - How to disable generating special characters when pressing the `alt+a`/`option+a` keybinding in Mac OS (`⌥+a` )? - Stack Overflow](https://stackoverflow.com/questions/11876485/how-to-disable-generating-special-characters-when-pressing-the-alta-optiona)


* reference format (new): [stackoverflow.com: How to disable generating special characters when pressing the `alt+a`/`option+a` keybinding in Mac OS (`⌥+a` )? [closed]](https://stackoverflow.com/questions/11876485/how-to-disable-generating-special-characters-when-pressing-the-alta-optiona/16019737#16019737)

