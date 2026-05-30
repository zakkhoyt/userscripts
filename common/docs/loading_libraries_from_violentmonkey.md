


# AI Prompt

> I'm writing a user.js script for use with violent monkey. The userscript needs to load a local javascript library in a sibling directory. How do I load the library? What syntax? 
> 
> I want the library to be compatible with node scripts as well
> 
> I want to avoid absolute paths. Write a section about how to use relative paths with violentmonkey. Write it in a way where I can feed it to a coding agent
> Reflect and be very clear that the userscript will load the libarary from a LOCAL dir using a RELATIVE PATH. 
> 
> No github. No 127.0.0.1. Just a direct local file/library import



--- 
From [this ai chat](https://duckduckgo.com/?q=DuckDuckGo+AI+Chat&ia=chat&duckai=1&atb=v444-1)


# Local Relative Path Library Loading in Violentmonkey User Scripts

Violentmonkey enables loading local JavaScript libraries from sibling or relative directories using `GM_xmlhttpRequest`. This approach allows direct file system access for library imports within the same project structure.

```javascript
// ==UserScript==
// @name         Local Relative Library Loader
// @namespace    local-dev
// @version      1.0
// @match        file:///path/to/specific/website/index.html
// @grant        GM\_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Load library from same directory or sibling directory
    function loadLocalLibrary(relativePath) {
        return new Promise((resolve, reject) => {
            GM\_xmlhttpRequest({
                method: "GET",
                url: new URL(relativePath, document.currentScript.baseURI).href,
                onload: function(response) {
                    try {
                        // Directly evaluate local library
                        const libraryLoader = new Function(response.responseText);
                        const library = libraryLoader();
                        resolve(library);
                    } catch (error) {
                        reject(error);
                    }
                },
                onerror: reject
            });
        });
    }

    // Example: Load library from same directory
    loadLocalLibrary('./my-local-library.js')
        .then(library => {
            console.log('Local library loaded successfully');
            library.init();
        })
        .catch(error => {
            console.error('Local library load failed:', error);
        });
})();



Key Characteristics:

* Directly imports JavaScript libraries from local file system* 
* Uses relative path resolution* 
* Works with local file:/// protocol* 
* Supports same-directory and sibling-directory library loading* 
* Requires @grant GM_xmlhttpRequest

Important Considerations:
* Must match exact local file path in @match* 
* Relative paths are resolved from the current script's location* 
* Requires Violentmonkey's local file access permissions* 
* Primarily for development and local testing scenarios

Potential Use Cases:
* Local web development* 
* Modular script organization* 
* Personal project library management* 
* Offline development environments

Limitations:
* 
* Not suitable for production deployment* 
* Requires manual path management* 
* Security restrictions on local file access* 
* Violentmonkey-specific implementation

Recommendation: Use for development and local testing, with plans to bundle or host libraries for production environments.