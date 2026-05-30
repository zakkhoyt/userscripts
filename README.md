


# About

This repository contains a series of userscripts for Greasemonky, Violentmonkey, etc... Each nested in a subfolder. 


# Userscripts

> [!NOTE]
> A userscript (or user script) is a program, usually written in JavaScript, for modifying web pages to augment browsing. Uses include adding shortcut buttons and keyboard shortcuts, controlling playback speeds, adding features to sites, and enhancing the browsing history.
> 
> From [Userscript - Wikipedia](https://en.wikipedia.org/wiki/Userscript)



# Directories

## `common`
* The `common` contains code that is intended to be reusable. 
* The idea was to create javascript libraries that can be re-used across any type of javascript environment. Specifically:
  * userscripts (most important)
  * node script
  * normal javascript


### `common/youtube_toolkit`
* This is a javascript library to help with extracting data from youtube pages
  * channel properites
  * playlist infromation
  * video informatoin
  * etc...
* Read all source files staring with `common/youtube_toolkit/README.md`, `IMPLEMENTATION_STATUS.md`, `index.js`, etc...

### `common/amazon_toolkit`
* This is a javascript library to help with extracting data from amazon web pages
  * product properites
  * seller/store infromation
  * searches, 
  * etc...
  * building markdown representation products, sellers, etc... (links, lists, etc...)
* Read all source files staring with `common/youtube_toolkit/README.md`, `IMPLEMENTATION_STATUS.md`, `index.js`, etc...




# Development & Contributing

* See [CONTRIBUTING.md](CONTRIBUTING.md)