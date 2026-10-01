<!-- 
# Menu Sections

* when displaying the popup menu, the functions are grouped into sections
* Some sites have an additional section for domain specific functions (youtube, amazon, ...)
* there are 2 changes I'd like to make:


## 1. Section Ordering
* Domain specific section is currently displayed as the 2nd section 
* I'd like any Domain Specific sections to be listed first (at the top) of the popu menu

## 2. Named subsections
* All sections in the popup menu should be named
* Currently the domain specific section is the only one that has a section title
  * EX: `YOUTUBE`
  * I'd like to change the title of this section to "DOMAIN SPECIFIC"
* Let's give the other two sections a name as well. "Common", "All Links" or something along those lines

## 3. Settings section
* Let's add a 4th menu section named "SETTINGS"
* under this section there should be entries that mirror the violent monkey prefs
 -->
---

<!-- 
# Firefox Context Menu
* I wanted to look into the possibilty of also driving all of the functions from firefox's context click menu. 
* If we can add entry into this menu (depending on the mouse hover target when context clicking) that would be a very nice feature. 
* See this image of what the menu currently looks like:  Firefox_20260613213504.png 


!!! failure Not Possible
    Violentmonkey / Firefox do not extend appropriate APIs
 -->

---
<!-- 
# Tooltips
* I'd like to add tooltip support (label popup on mouse hover) in the popup and context menus. 
* I've added a `tooltip` property in the example lists. 

## Popup menu
* Let's add a small `info` icon to each menu item (where the tooltip is defined (property != "" && proeprty != null)
  * Hovering over or clicking on this icon should reveal the tooltip text

## Context Menu
* In firefox's context menu, implement what ever tooltip support is provided by the APIs 
-->

---
<!-- 

## Examples

* This json5 document describes how I'd like the menus to appear and behave: 
  * `docs/ai/planning/markdown_linker/PLANNING_MARKDOWN-LINKER-CONTEXT-MENU_PHASE-01.json5`
  * Please validate the

* The below examples are approximate and will contain different entries depending on:
  * The target (html link, html page, domain, etc...)
  * Our Violentmonkey preferences and custom UI


### Hierarchical Context Menu
* this should be constructed the same as `## Hierarchical Popup Menu` with one difference
* the first entry in the root of the menu hierarchy should be the "quick action". IE the same thing that is currently mapped to `opt+v+click` (or what ever we are calling that action now that it can map to any shortcut)
 -->


