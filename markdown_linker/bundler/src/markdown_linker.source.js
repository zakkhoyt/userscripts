// ==UserScript==
// @name         Markdown Linker
// @namespace    https://github.com/zakkhoyt/greasemonkey/markdown_linker
// @version      1.0.0
// @description  Convert URLs to markdown links — configurable key triggers (defaults: V=menu, B=quiet copy, hold Z+click=buffer)
// @downloadURL  https://raw.githubusercontent.com/zakkhoyt/userscripts/zakk/markdown_linker_domains/markdown_linker/markdown_linker.user.js
// @updateURL    https://raw.githubusercontent.com/zakkhoyt/userscripts/zakk/markdown_linker_domains/markdown_linker/markdown_linker.user.js
// @author       Zakk Hoyt
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @run-at       document-idle
// @noframes
// ==/UserScript==

// Development targets consumed by scripts/violentmonkey/violentmonkey.zsh
// #dev-open https://developer.mozilla.org/en-US/docs/Web/API/Selection
// ##dev-open https://www.youtube.com/watch?v=aqz-KE-bpKQ
// ##dev-open https://www.youtube.com/playlist?list=PL590L5WQmH8cDj0KQvhZpW7x1YgnPZXoq

/*
 * Markdown Linker - ViolentMonkey Userscript
 * 
 * PURPOSE:
 * Creates markdown-formatted links [title](url) from webpage anchors or current page URL.
 * Triggered by Alt+Click, Alt+Right-Click, Alt+M, or M key combinations.
 * 
 * WORKFLOW:
 * 1. User triggers script with modifier+click or keyboard shortcut
 * 2. Script detects if target is an anchor link or the page itself
 * 3. Context menu appears with title options (link text, selected text, page title, etc.)
 * 4. User selects desired title format
 * 5. Markdown link is generated and copied to clipboard
 * 
 * KEY APIS:
 * - ViolentMonkey GM_setClipboard: https://violentmonkey.github.io/api/gm/#gm_setclipboard
 * - DOM Selection API: https://developer.mozilla.org/en-US/docs/Web/API/Selection
 * - Event.closest(): https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
 * - Event capture phase: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture
 * 
 * VIOLENTMONKEY METADATA BLOCK:
 * @match 
 *   - Matches all URLs on all domains (wildcard pattern)
 *   - Required by ViolentMonkey to determine which pages run this script
 *   - Reference: https://violentmonkey.github.io/api/matching/
 * 
 * @grant GM_setClipboard
 *   - Requests permission to use GM_setClipboard API
 *   - Without @grant, script runs in page context without privileged APIs
 *   - Reference: https://violentmonkey.github.io/api/metadata-block/#grant
 * 
 * @grant GM_registerMenuCommand
 *   - Requests permission for menu command API (reserved for future use)
 *   - Allows adding items to ViolentMonkey popup menu
 *   - Reference: https://violentmonkey.github.io/api/gm/#gm_registermenucommand
 * 
 * @run-at document-idle
 *   - Script runs after DOM is fully loaded but before all resources (images, etc.)
 *   - Better than document-end for performance and reliability
 *   - Reference: https://violentmonkey.github.io/api/metadata-block/#run-at
 * 
 * @noframes
 *   - Prevents script from running in iframes/frames
 *   - Reduces overhead and prevents duplicate executions
 *   - Reference: https://violentmonkey.github.io/api/metadata-block/#noframes
 * 
 * BROWSER COMPATIBILITY:
 * Tested on Firefox 144.0.2 with ViolentMonkey 2.31.0 on macOS
 * 
 * TODO / IDEAS:
 *   - See sibling file: markdown_linker.user.md
 */


 console.log(`markdown_linker: 01`);

(function() {
    'use strict';

    console.log(`markdown_linker: 11`);
    
    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    
    // Enable debug mode to show error dialogs with debugger option
    // Type: boolean
    const isDebug = true;
    
    // Script identifier prefix for all console.log statements
    // Type: string
    let logBase = "markdown_linker";

    // The currently visible notification element, so an async capture result can append a 2nd line.
    let activeNotification = null;
    
    // Reference to currently displayed popup menu DOM element
    // Tracked globally to enable removal when user clicks outside or selects option
    // Type: HTMLDivElement | null
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement
    let currentMenu = null;
    
    // The DOM element that triggered the menu (anchor element if on link, null if on page)
    // Stored for potential future use in context-aware operations
    // Type: HTMLElement | null
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
    let targetElement = null;
    
    // The URL to convert to markdown (either anchor's href or current page URL)
    // Type: string | null
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/URL
    let targetUrl = null;
    
    // Event handlers for menu dismissal (stored so they can be removed)
    // Type: Function | null
    let menuClickHandler = null;
    let menuEscapeHandler = null;

    // Maximum age (in ms) for cached text selection reuse when clicks clear live selection
    const SELECTION_MEMORY_MS = 15000;
    let lastNonEmptySelection = null;
    let lastSelectionTimestamp = 0;

    // Domain overrides ensure well-known providers retain their official casing (GitHub, etc.)
    const DOMAIN_TITLE_OVERRIDES = {
        github: 'GitHub',
        gitlab: 'GitLab',
        google: 'Google',
        amazon: 'Amazon',
        notion: 'Notion',
        linkedin: 'LinkedIn',
        youtube: 'YouTube',
        stackoverflow: 'Stack Overflow',
        medium: 'Medium'
    };

    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection ? window.getSelection() : null;
        if (!selection) {
            return;
        }

        const text = selection.toString().trim();
        if (!text) {
            return;
        }

        lastNonEmptySelection = text;
        lastSelectionTimestamp = Date.now();
    });

    // Alt+Z title preference options (first element is default)
    const ALT_Z_TITLE_PREF_KEY = 'markdown_linker.altz_title_source';
    const ALT_Z_TITLE_OPTIONS = [
        { id: 'url-forward', label: 'URL (forward)' },
        { id: 'url-reverse', label: 'URL (reverse)' },
        { id: 'anchor', label: 'Anchor text' },
        { id: 'page', label: 'Page title' }
    ];
    let altZTitlePreference = ALT_Z_TITLE_OPTIONS[0].id;
    let altZMenuCommandId = null;

    // Source-capture preference: when "html & logs", every clipboard copy also POSTs the page
    // source + session logs to the local capture server (scripts/source_capture). Default: none.
    const CAPTURE_MODE_PREF_KEY = 'markdown_linker.capture_mode';
    const CAPTURE_MODE_OPTIONS = [
        { id: 'none', label: 'none' },
        { id: 'html_logs', label: 'html & logs' }
    ];
    let captureMode = CAPTURE_MODE_OPTIONS[0].id;
    let captureMenuCommandId = null;

    // ---- Configurable triggers (replaces the hard-coded Alt modifier) ----
    // A binding = { modifiers:{meta,ctrl,alt,shift}, keys:[lowercase chars], requiresClick }.
    // Modifiers are read from the event; regular keys from the `pressedKeys` set. `fn` is NOT
    // supported (browsers don't expose it). Defaults avoid Alt (unreliable on macOS) and use keys
    // that are unbound in the YouTube player and in Firefox: V (menu), B (quiet copy), Z (buffer).
    const TRIGGERS_PREF_KEY = 'markdown_linker.triggers';
    const DEFAULT_TRIGGERS = {
        menu: [{ modifiers: {}, keys: ['v'], requiresClick: false }],         // hover + V -> open menu
        inferQuiet: [{ modifiers: {}, keys: ['b'], requiresClick: false }],   // hover + B -> copy one link
        inferBuffer: [{ modifiers: {}, keys: ['z'], requiresClick: true }]    // hold Z + click… -> buffer list
    };
    let triggers = cloneTriggers(DEFAULT_TRIGGERS);
    // ============================================================================

    /**
     * Mirrors a formatted log line into the SourceCapture buffer (when present) so captured `.log`
     * files reflect the full session. Buffers regardless of `isDebug` (so captures are complete even
     * when console logging is off). Safe no-op when the capture module is unavailable.
     * @param {string} line - Already-formatted log line
     */
    function bufferLog(line) {
        try {
            if (typeof window !== 'undefined' && window.SourceCapture && window.SourceCapture.logBuffer) {
                // Prefix each captured log line with an ISO timestamp (console output stays unprefixed).
                window.SourceCapture.logBuffer.push(`${new Date().toISOString()} ${line}`);
            }
        } catch (error) {
            /* noop — logging must never throw */
        }
    }

    /**
     * Simple logging wrapper with consistent prefix
     * @param {string} message - The message to log
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Console/log
     */
    function log(message) {
        const line = `${logBase}: ${message}`;
        bufferLog(line);
        if (isDebug) {
            console.log(line);
        }
    }

    /**
     * Logs a warning message with consistent prefix
     * @param {string} message - The warning message to log
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Console/warn
     */
    function logWarn(message) {
        const line = `${logBase}: ${message}`;
        bufferLog(`WARN ${line}`);
        console.warn(line);
    }

    /**
     * Logs an error message with consistent prefix
     * @param {string} message - The error message to log
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Console/error
     */
    function logError(message) {
        const line = `${logBase}: ${message}`;
        bufferLog(`ERROR ${line}`);
        console.error(line);
    }

    /**
     * Logs a function's entry point for tracing execution flow
     * @param {string} functionName - Name of the function being entered
     */
    function logFunctionBegin(functionName) {
        const line = `${logBase}: begin ${functionName}`;
        bufferLog(line);
        if (isDebug) {
            console.log(line);
        }
    }

    /**
     * Logs a function's exit point for tracing execution flow
     * @param {string} functionName - Name of the function being exited
     */
    function logFunctionEnd(functionName) {
        const line = `${logBase}: end ${functionName}`;
        bufferLog(line);
        if (isDebug) {
            console.log(line);
        }
    }

    /**
     * Safely unwraps a property value, returning 'null' string if undefined
     * Avoids optional chaining operator which can confuse syntax highlighters
     * @param {*} obj - The object to access
     * @param {string} prop - The property name to access
     * @returns {*} The property value or the string 'null'
     */
    function unwrap(obj, prop) {
        return obj && obj[prop] ? obj[prop] : 'null';
    }

    // ============================================================================
    // USER PREFERENCES (ALT+Z TITLE SOURCE)
    // ============================================================================

    /**
     * Finds the metadata for a given Alt+Z title option ID
     * @param {string} optionId - Identifier stored in preferences
     * @returns {{id: string, label: string}} Matching option (defaults if not found)
     */
    function getAltZOption(optionId) {
        return ALT_Z_TITLE_OPTIONS.find((option) => option.id === optionId) || ALT_Z_TITLE_OPTIONS[0];
    }

    /**
     * Loads the persisted Alt+Z title preference from ViolentMonkey storage
     * Falls back to default when storage is unavailable or value is invalid
     * @returns {string} Option ID representing the user's preference
     */
    function loadAltZTitlePreference() {
        logFunctionBegin('loadAltZTitlePreference');
        let storedValue = ALT_Z_TITLE_OPTIONS[0].id;

        if (typeof GM_getValue === 'function') {
            try {
                storedValue = GM_getValue(ALT_Z_TITLE_PREF_KEY, storedValue);
            } catch (error) {
                logWarn(`Failed to load Alt+Z preference: ${error}`);
            }
        }

        if (!ALT_Z_TITLE_OPTIONS.some((option) => option.id === storedValue)) {
            logWarn(`Alt+Z preference "${storedValue}" invalid, reverting to default`);
            storedValue = ALT_Z_TITLE_OPTIONS[0].id;
        }

        log(`Loaded Alt+Z title preference: ${storedValue}`);
        logFunctionEnd('loadAltZTitlePreference');
        return storedValue;
    }

    /**
     * Persists the current Alt+Z preference and refreshes the menu command label
     */
    function persistAltZTitlePreference() {
        logFunctionBegin('persistAltZTitlePreference');
        if (typeof GM_setValue === 'function') {
            try {
                GM_setValue(ALT_Z_TITLE_PREF_KEY, altZTitlePreference);
            } catch (error) {
                logWarn(`Failed to persist Alt+Z preference: ${error}`);
            }
        }
        registerAltZTitleMenuCommand();
        logFunctionEnd('persistAltZTitlePreference');
    }

    /**
     * Registers (or re-registers) the ViolentMonkey menu command for cycling Alt+Z sources
     */
    function registerAltZTitleMenuCommand() {
        logFunctionBegin('registerAltZTitleMenuCommand');
        if (typeof GM_registerMenuCommand !== 'function') {
            log('GM_registerMenuCommand unavailable, skipping menu registration');
            logFunctionEnd('registerAltZTitleMenuCommand');
            return;
        }

        if (altZMenuCommandId && typeof GM_unregisterMenuCommand === 'function') {
            try {
                GM_unregisterMenuCommand(altZMenuCommandId);
            } catch (error) {
                logWarn(`Failed to unregister previous menu command: ${error}`);
            }
        }

        const optionLabel = getAltZOption(altZTitlePreference).label;
        const menuLabel = `Alt+Z title: ${optionLabel} (click to cycle)`;
        altZMenuCommandId = GM_registerMenuCommand(menuLabel, cycleAltZTitlePreference);
        logFunctionEnd('registerAltZTitleMenuCommand');
    }

    /**
     * Cycles through Alt+Z title options and persists the newly selected value
     */
    function cycleAltZTitlePreference() {
        logFunctionBegin('cycleAltZTitlePreference');
        const currentIndex = ALT_Z_TITLE_OPTIONS.findIndex((option) => option.id === altZTitlePreference);
        const nextIndex = (currentIndex + 1) % ALT_Z_TITLE_OPTIONS.length;
        altZTitlePreference = ALT_Z_TITLE_OPTIONS[nextIndex].id;
        log(`Alt+Z preference changed to: ${altZTitlePreference}`);
        persistAltZTitlePreference();
        const optionLabel = getAltZOption(altZTitlePreference).label;
        showNotification(`Alt+Z title source: ${optionLabel}`);
        logFunctionEnd('cycleAltZTitlePreference');
    }

    /**
     * Initializes Alt+Z preference state and registers control surfaces
     */
    function initializeAltZPreference() {
        logFunctionBegin('initializeAltZPreference');
        altZTitlePreference = loadAltZTitlePreference();
        registerAltZTitleMenuCommand();
        logFunctionEnd('initializeAltZPreference');
    }

    // ============================================================================
    // USER PREFERENCES (SOURCE CAPTURE)
    // ============================================================================

    /**
     * Finds the metadata for a given capture-mode option ID
     * @param {string} optionId - Identifier stored in preferences
     * @returns {{id: string, label: string}} Matching option (defaults if not found)
     */
    function getCaptureOption(optionId) {
        return CAPTURE_MODE_OPTIONS.find((option) => option.id === optionId) || CAPTURE_MODE_OPTIONS[0];
    }

    /**
     * Loads the persisted capture mode from ViolentMonkey storage (defaults to "none").
     * @returns {string} Option ID representing the user's preference
     */
    function loadCaptureMode() {
        logFunctionBegin('loadCaptureMode');
        let storedValue = CAPTURE_MODE_OPTIONS[0].id;

        if (typeof GM_getValue === 'function') {
            try {
                storedValue = GM_getValue(CAPTURE_MODE_PREF_KEY, storedValue);
            } catch (error) {
                logWarn(`Failed to load capture mode: ${error}`);
            }
        }

        if (!CAPTURE_MODE_OPTIONS.some((option) => option.id === storedValue)) {
            logWarn(`Capture mode "${storedValue}" invalid, reverting to default`);
            storedValue = CAPTURE_MODE_OPTIONS[0].id;
        }

        log(`Loaded capture mode: ${storedValue}`);
        logFunctionEnd('loadCaptureMode');
        return storedValue;
    }

    /**
     * Persists the current capture mode and refreshes its menu command label
     */
    function persistCaptureMode() {
        logFunctionBegin('persistCaptureMode');
        if (typeof GM_setValue === 'function') {
            try {
                GM_setValue(CAPTURE_MODE_PREF_KEY, captureMode);
            } catch (error) {
                logWarn(`Failed to persist capture mode: ${error}`);
            }
        }
        registerCaptureModeMenuCommand();
        logFunctionEnd('persistCaptureMode');
    }

    /**
     * Registers (or re-registers) the ViolentMonkey menu command for cycling capture mode
     */
    function registerCaptureModeMenuCommand() {
        logFunctionBegin('registerCaptureModeMenuCommand');
        if (typeof GM_registerMenuCommand !== 'function') {
            log('GM_registerMenuCommand unavailable, skipping capture menu registration');
            logFunctionEnd('registerCaptureModeMenuCommand');
            return;
        }

        if (captureMenuCommandId && typeof GM_unregisterMenuCommand === 'function') {
            try {
                GM_unregisterMenuCommand(captureMenuCommandId);
            } catch (error) {
                logWarn(`Failed to unregister previous capture menu command: ${error}`);
            }
        }

        const optionLabel = getCaptureOption(captureMode).label;
        const menuLabel = `Capture: ${optionLabel} (click to cycle)`;
        captureMenuCommandId = GM_registerMenuCommand(menuLabel, cycleCaptureMode);
        logFunctionEnd('registerCaptureModeMenuCommand');
    }

    /**
     * Cycles through capture-mode options and persists the newly selected value
     */
    function cycleCaptureMode() {
        logFunctionBegin('cycleCaptureMode');
        const currentIndex = CAPTURE_MODE_OPTIONS.findIndex((option) => option.id === captureMode);
        const nextIndex = (currentIndex + 1) % CAPTURE_MODE_OPTIONS.length;
        captureMode = CAPTURE_MODE_OPTIONS[nextIndex].id;
        log(`Capture mode changed to: ${captureMode}`);
        persistCaptureMode();
        showNotification(`Capture: ${getCaptureOption(captureMode).label}`);
        logFunctionEnd('cycleCaptureMode');
    }

    /**
     * Initializes capture-mode state and registers its menu command
     */
    function initializeCaptureMode() {
        logFunctionBegin('initializeCaptureMode');
        captureMode = loadCaptureMode();
        registerCaptureModeMenuCommand();
        logFunctionEnd('initializeCaptureMode');
    }

    log('begin script');
    initializeAltZPreference();
    initializeCaptureMode();
    triggers = loadTriggers();

    // ============================================================================
    // YOUTUBE TOOLKIT INTEGRATION
    // ============================================================================

    let youtubeContextCacheKey = null;
    let youtubeContextCacheValue = null;

    /**
     * Safely returns the YouTube toolkit namespace when available
     * @returns {object|null} Toolkit namespace loaded via @require directives
     */
    function getYouTubeToolkit() {
        logFunctionBegin('getYouTubeToolkit');
        if (typeof window === 'undefined') {
            log('Window unavailable, cannot access YouTube toolkit');
            logFunctionEnd('getYouTubeToolkit');
            return null;
        }
        const toolkit = window.YouTubeToolkit || null;
        log(`YouTube toolkit ${toolkit ? 'available' : 'unavailable'}`);
        logFunctionEnd('getYouTubeToolkit');
        return toolkit;
    }

    /**
     * Determines whether a URL targets a YouTube host (youtube.com or youtu.be)
     * @param {string|null} url - URL string to inspect
     * @returns {boolean} True when URL belongs to YouTube
     */
    function isYouTubeUrl(url) {
        logFunctionBegin('isYouTubeUrl');
        if (!url) {
            log('URL missing for YouTube detection');
            logFunctionEnd('isYouTubeUrl');
            return false;
        }

        const toolkit = getYouTubeToolkit();
        const pageStateExtractor = toolkit?.Extractors?.PageState;
        if (pageStateExtractor && typeof pageStateExtractor.isYouTubeHost === 'function') {
            const toolkitResult = pageStateExtractor.isYouTubeHost(url);
            log(`Toolkit YouTube host result: ${toolkitResult}`);
            logFunctionEnd('isYouTubeUrl');
            return toolkitResult;
        }

        try {
            const parsed = new URL(url, window.location.href);
            const hostname = parsed.hostname || '';
            const fallbackResult = hostname.includes('youtube.com') || hostname === 'youtu.be';
            log(`Fallback YouTube host result: ${fallbackResult}`);
            logFunctionEnd('isYouTubeUrl');
            return fallbackResult;
        } catch (error) {
            logWarn(`Failed to parse URL for YouTube detection: ${error.message}`);
            logFunctionEnd('isYouTubeUrl');
            return false;
        }
    }

    /**
     * Extracts a YouTube video ID from a URL instance or string
     * @param {URL|string|null} urlLike - URL object or string pointing to a YouTube resource
     * @returns {string|null} Canonical 11 character video ID
     */
    function extractYouTubeVideoIdFromUrl(urlLike) {
        logFunctionBegin('extractYouTubeVideoIdFromUrl');
        if (!urlLike) {
            log('URL missing for video ID extraction');
            logFunctionEnd('extractYouTubeVideoIdFromUrl');
            return null;
        }

        let urlObj;
        try {
            urlObj = urlLike instanceof URL ? urlLike : new URL(urlLike, window.location.href);
        } catch (error) {
            logWarn(`Invalid URL for video ID extraction: ${error.message}`);
            logFunctionEnd('extractYouTubeVideoIdFromUrl');
            return null;
        }

        const candidateKeys = ['v', 'vi', 'video_id'];
        const idPattern = /^[A-Za-z0-9_-]{11}$/;
        for (const key of candidateKeys) {
            const paramCandidate = urlObj.searchParams.get(key);
            if (paramCandidate && idPattern.test(paramCandidate)) {
                log(`Extracted video ID from query parameter: ${paramCandidate}`);
                logFunctionEnd('extractYouTubeVideoIdFromUrl');
                return paramCandidate;
            }
        }

        if (urlObj.hostname === 'youtu.be') {
            const shortCandidate = urlObj.pathname.slice(1).split('/')[0];
            if (shortCandidate && idPattern.test(shortCandidate)) {
                log(`Extracted video ID from youtu.be short URL: ${shortCandidate}`);
                logFunctionEnd('extractYouTubeVideoIdFromUrl');
                return shortCandidate;
            }
        }

        const pathMatch = urlObj.pathname.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/);
        if (pathMatch) {
            log(`Extracted video ID from path segment: ${pathMatch[1]}`);
            logFunctionEnd('extractYouTubeVideoIdFromUrl');
            return pathMatch[1];
        }

        log('No video ID found in URL');
        logFunctionEnd('extractYouTubeVideoIdFromUrl');
        return null;
    }

    /**
     * Builds a minimal YouTube context by reading DOM metadata (used when toolkit is unavailable)
     * @param {string} url - Target URL for which context is required
     * @returns {object|null} Fallback context structure compatible with buildYouTubeMenuOptions
     */
    function buildYouTubeFallbackContext(url) {
        logFunctionBegin('buildYouTubeFallbackContext');
        let urlObj;
        try {
            urlObj = new URL(url, window.location.href);
        } catch (error) {
            logWarn(`Fallback context URL parse failed: ${error.message}`);
            logFunctionEnd('buildYouTubeFallbackContext');
            return null;
        }

        const hostname = (urlObj.hostname || '').toLowerCase();
        if (!hostname.includes('youtube.com') && hostname !== 'youtu.be') {
            log('Fallback context skipped: non-YouTube host');
            logFunctionEnd('buildYouTubeFallbackContext');
            return null;
        }

        const videoId = extractYouTubeVideoIdFromUrl(urlObj);
        const canonicalUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : urlObj.toString();
        const shortUrl = videoId ? `https://youtu.be/${videoId}` : null;

        const titleFromDom = getFirstMatchingText([
            { selector: 'h1.ytd-watch-metadata' },
            { selector: '#title h1' },
            { selector: 'meta[property="og:title"]', attribute: 'content' },
            { selector: 'meta[name="title"]', attribute: 'content' }
        ], 'YouTube title');
        let resolvedTitle = stripYouTubeTitleSuffix(titleFromDom);

        if (!resolvedTitle && document && typeof document.title === 'string') {
            resolvedTitle = stripYouTubeTitleSuffix(document.title);
        }

        const channelName = getFirstMatchingText([
            { selector: '#owner-name a' },
            { selector: 'ytd-channel-name a' },
            { selector: '#channel-name a' },
            { selector: 'meta[itemprop="author"]', attribute: 'content' }
        ], 'YouTube channel');

        if (!resolvedTitle) {
            resolvedTitle = 'YouTube Video';
        }

        const context = {
            video: {
                title: resolvedTitle,
                channelName: channelName || null,
                shortUrl,
                canonicalUrl
            },
            playlist: null,
            playback: null,
            channel: channelName ? { title: channelName, canonicalUrl: null } : null,
            pageState: 'watch'
        };

        const videoElement = document.querySelector('video');
        if (videoElement && typeof videoElement.currentTime === 'number' && Number.isFinite(videoElement.currentTime)) {
            context.playback = {
                isActive: true,
                seconds: videoElement.currentTime
            };
        }

        if (!context.video.title) {
            log('Fallback context missing title, aborting');
            logFunctionEnd('buildYouTubeFallbackContext');
            return null;
        }

        const cacheKey = videoId ? `fallback-video:${videoId}` : `fallback-url:${canonicalUrl}`;
        if (cacheKey && youtubeContextCacheKey === cacheKey && youtubeContextCacheValue) {
            log('Using cached fallback YouTube context');
            logFunctionEnd('buildYouTubeFallbackContext');
            return youtubeContextCacheValue;
        }

        if (cacheKey) {
            youtubeContextCacheKey = cacheKey;
        }
        youtubeContextCacheValue = context;
        log('Cached fallback YouTube context');
        logFunctionEnd('buildYouTubeFallbackContext');
        return context;
    }

    /**
     * Builds markdown representing a playlist from toolkit metadata
     * @param {object|null} playlistMeta - Playlist metadata with title, url, and videos array
     * @returns {string|null} Markdown list or null on invalid input
     */
    function buildYouTubePlaylistMarkdown(playlistMeta) {
        logFunctionBegin('buildYouTubePlaylistMarkdown');
        if (!playlistMeta || !Array.isArray(playlistMeta.videos) || playlistMeta.videos.length === 0) {
            log('Playlist metadata incomplete, cannot build markdown');
            logFunctionEnd('buildYouTubePlaylistMarkdown');
            return null;
        }

        const header = playlistMeta.title ? `**${playlistMeta.title}**\n` : '';
        const lines = playlistMeta.videos.map((item, index) => {
            const fallbackTitle = item.videoId ? `Video ${index + 1} (${item.videoId})` : `Video ${index + 1}`;
            const title = item.title || fallbackTitle;
            const videoUrl = item.url || (item.videoId ? `https://www.youtube.com/watch?v=${item.videoId}` : playlistMeta.url);
            const infoParts = [];
            if (item.channelName) {
                infoParts.push(item.channelName);
            }
            if (item.durationText) {
                infoParts.push(item.durationText);
            }
            const infoSuffix = infoParts.length > 0 ? ` — ${infoParts.join(' • ')}` : '';
            return `${index + 1}. [${title}](${videoUrl})${infoSuffix}`;
        });

        const markdown = `${header}${lines.join('\n')}`;
        logFunctionEnd('buildYouTubePlaylistMarkdown');
        return markdown;
    }

    /**
     * Formats seconds into m:ss or h:mm:ss timestamp strings
     * @param {number} seconds - Total seconds elapsed in the video
     * @returns {string|null} Formatted timestamp or null when input invalid
     */
    function formatSecondsAsTimestamp(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return null;
        }
        const totalSeconds = Math.floor(seconds);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSeconds = String(secs).padStart(2, '0');
        if (hours > 0) {
            return `${hours}:${paddedMinutes}:${paddedSeconds}`;
        }
        return `${paddedMinutes}:${paddedSeconds}`;
    }

    /**
     * Heuristically determines whether a supposed YouTube title is actually a description blob
     * @param {string|null} candidate - Title text to inspect
     * @returns {boolean} True when text looks like a description paragraph
     */
    function isLikelyYouTubeDescription(candidate) {
        if (!candidate) {
            return false;
        }
        const normalized = candidate.trim();
        if (!normalized) {
            return false;
        }
        if (normalized.length >= 140) {
            return true;
        }
        if (normalized.includes('\n')) {
            return true;
        }
        if (/https?:\/\//i.test(normalized)) {
            return true;
        }
        if (/subscribe|available\snow|check\s+out/i.test(normalized)) {
            return true;
        }
        return false;
    }

    /**
     * Enriches toolkit context values with DOM fallback data whenever titles look wrong
     * @param {object|null} context - Toolkit context structure to sanitize
     * @param {string} url - Target URL for fallback extraction
     * @returns {object|null} Updated context (or original when already valid)
     */
    function enrichYouTubeContextWithFallback(context, url) {
        if (!context) {
            return context;
        }
        const needsVideoFallback = !context.video || isLikelyYouTubeDescription(context.video.title);
        const needsChannelFallback = !context.channel || !context.channel.title;
        if (!needsVideoFallback && !needsChannelFallback) {
            return context;
        }

        const fallbackContext = buildYouTubeFallbackContext(url);
        if (!fallbackContext) {
            return context;
        }

        if (needsVideoFallback && fallbackContext.video) {
            if (!context.video) {
                context.video = fallbackContext.video;
            } else {
                context.video.title = fallbackContext.video.title || context.video.title;
                context.video.channelName = context.video.channelName || fallbackContext.video.channelName;
                context.video.shortUrl = context.video.shortUrl || fallbackContext.video.shortUrl;
                context.video.canonicalUrl = context.video.canonicalUrl || fallbackContext.video.canonicalUrl;
            }
        }

        if (needsChannelFallback && fallbackContext.channel) {
            context.channel = context.channel || fallbackContext.channel;
        }

        return context;
    }
    /**
     * Computes intent for building a YouTube context (video/playlist/channel) and cache key
     * @param {string} url - Target URL selected by the user
     * @param {object} toolkit - Loaded YouTube toolkit namespace
     * @returns {object} Context intent metadata
     */
    function buildYouTubeContextIntent(url, toolkit) {
        logFunctionBegin('buildYouTubeContextIntent');
        if (!url || !toolkit) {
            log('Missing URL or toolkit for YouTube context intent');
            logFunctionEnd('buildYouTubeContextIntent');
            return { key: null };
        }

        const pageStateExtractor = toolkit?.Extractors?.PageState;
        const videoExtractor = toolkit?.Extractors?.Video;
        if (!pageStateExtractor || !videoExtractor) {
            log('Toolkit missing PageState or Video extractors');
            logFunctionEnd('buildYouTubeContextIntent');
            return { key: null };
        }

        let targetUrl;
        let currentUrl;
        try {
            targetUrl = new URL(url, window.location.href);
            currentUrl = new URL(window.location.href);
        } catch (error) {
            logWarn(`Failed to parse URLs for context intent: ${error.message}`);
            logFunctionEnd('buildYouTubeContextIntent');
            return { key: null };
        }

        const isCurrentYouTube = pageStateExtractor.isYouTubeHost(currentUrl.toString());
        const isTargetYouTube = pageStateExtractor.isYouTubeHost(targetUrl.toString());
        if (!isCurrentYouTube || !isTargetYouTube) {
            log('Either current or target URL is not a YouTube host');
            logFunctionEnd('buildYouTubeContextIntent');
            return { key: null };
        }

        const targetVideoId = videoExtractor.getVideoIdFromUrl(targetUrl.toString());
        const currentVideoId = videoExtractor.getVideoIdFromUrl(currentUrl.toString());
        const sameVideo = Boolean(targetVideoId && currentVideoId && targetVideoId === currentVideoId);

        let targetPlaylistId = videoExtractor.getPlaylistIdFromUrl(targetUrl.toString());
        const currentPlaylistId = videoExtractor.getPlaylistIdFromUrl(currentUrl.toString());
        if (!targetPlaylistId && sameVideo) {
            targetPlaylistId = currentPlaylistId;
        }
        const samePlaylist = Boolean(targetPlaylistId && currentPlaylistId && targetPlaylistId === currentPlaylistId);

        const sameChannel = currentUrl.pathname === targetUrl.pathname &&
            (currentUrl.pathname.startsWith('/channel/') || currentUrl.pathname.startsWith('/@'));

        let key = null;
        if (sameVideo) {
            key = `video:${currentVideoId}:${currentPlaylistId || ''}`;
        } else if (samePlaylist) {
            key = `playlist:${targetPlaylistId || currentPlaylistId}`;
        } else if (sameChannel) {
            key = `channel:${currentUrl.pathname}`;
        }

        log(`YouTube context key computed: ${key || 'none'}`);
        logFunctionEnd('buildYouTubeContextIntent');
        return {
            key,
            sameVideo,
            samePlaylist,
            sameChannel,
            playlistId: currentPlaylistId || targetPlaylistId || null,
        };
    }

    /**
     * Builds (and caches) YouTube metadata for the current page when applicable
     * @param {string|null} url - URL associated with the user action
     * @returns {object|null} Extracted metadata (video/channel/playlist)
     */
    function getYouTubeContext(url) {
        logFunctionBegin('getYouTubeContext');
        if (!url || !isYouTubeUrl(url)) {
            log('URL not eligible for YouTube context');
            logFunctionEnd('getYouTubeContext');
            return null;
        }

        const toolkit = getYouTubeToolkit();
        if (!toolkit) {
            log('YouTube toolkit unavailable, attempting DOM fallback context');
            const fallbackContext = buildYouTubeFallbackContext(url);
            logFunctionEnd('getYouTubeContext');
            return fallbackContext;
        }

        const intent = buildYouTubeContextIntent(url, toolkit);
        if (!intent.key) {
            log('No valid YouTube context key, attempting fallback context');
            const fallbackContext = buildYouTubeFallbackContext(url);
            logFunctionEnd('getYouTubeContext');
            return fallbackContext;
        }

        if (youtubeContextCacheKey === intent.key && youtubeContextCacheValue) {
            log('Using cached YouTube context');
            logFunctionEnd('getYouTubeContext');
            return youtubeContextCacheValue;
        }

        const pageStateExtractor = toolkit?.Extractors?.PageState;
        const videoExtractor = toolkit?.Extractors?.Video;
        const playlistExtractor = toolkit?.Extractors?.Playlist;
        const channelExtractor = toolkit?.Extractors?.Channel;

        const context = {
            video: null,
            playlist: null,
            playback: null,
            channel: null,
            pageState: null,
        };

        if (pageStateExtractor && typeof pageStateExtractor.determinePageState === 'function') {
            context.pageState = pageStateExtractor.determinePageState(window.location.href, document);
        }

        if (intent.sameVideo && videoExtractor) {
            context.video = videoExtractor.extractVideoMetadata(document, url);
            context.playback = videoExtractor.extractPlaybackState(document);
        }

        const shouldAttachPlaylist = intent.samePlaylist ||
            (intent.sameVideo && intent.playlistId) ||
            context.pageState === 'playlist' ||
            context.pageState === 'watch-with-playlist';
        if (shouldAttachPlaylist && playlistExtractor) {
            const playlistSourceUrl = intent.samePlaylist ? url : window.location.href;
            context.playlist = playlistExtractor.extractPlaylistMetadata(document, playlistSourceUrl);
        }

        if (intent.sameChannel && channelExtractor) {
            context.channel = channelExtractor.extractChannelMetadata(document, url);
        }

        if (!context.video && !context.playlist && !context.channel) {
            log('YouTube context extraction produced no data, attempting fallback context');
            const fallbackContext = buildYouTubeFallbackContext(url);
            logFunctionEnd('getYouTubeContext');
            return fallbackContext;
        }

        const enrichedContext = enrichYouTubeContextWithFallback(context, url);
        youtubeContextCacheKey = intent.key;
        youtubeContextCacheValue = enrichedContext;
        log('Cached toolkit YouTube context');
        logFunctionEnd('getYouTubeContext');
        return enrichedContext;
    }

    /**
     * Formats a consistent "YouTube: Channel - Title" string for video metadata
     * @param {object} videoMeta - Metadata returned by the toolkit video extractor
     * @returns {string|null} Formatted title when metadata present
     */
    function buildYouTubeVideoTitle(videoMeta) {
        logFunctionBegin('buildYouTubeVideoTitle');
        if (!videoMeta) {
            log('Video metadata missing');
            logFunctionEnd('buildYouTubeVideoTitle');
            return null;
        }
        const channel = videoMeta.channelName || videoMeta.channelHandle || 'YouTube';
        const title = videoMeta.title || 'Video';
        const formatted = `YouTube: ${channel} - ${title}`;
        log(`Formatted YouTube video title: "${formatted}"`);
        logFunctionEnd('buildYouTubeVideoTitle');
        return formatted;
    }

    /**
     * Appends (or replaces) the t= query parameter in a URL for timestamp links
     * @param {string} baseUrl - URL to modify
     * @param {string} timestampValue - Value for the t parameter (examples: 283, 283s, 4m43s)
     * @returns {string|null} URL with timestamp parameter applied
     */
    function buildYouTubeTimestampUrl(baseUrl, timestampValue) {
        logFunctionBegin('buildYouTubeTimestampUrl');
        if (!baseUrl || !timestampValue) {
            log('Base URL or timestamp missing');
            logFunctionEnd('buildYouTubeTimestampUrl');
            return null;
        }
        try {
            const urlObj = new URL(baseUrl, window.location.href);
            urlObj.searchParams.set('t', timestampValue);
            const result = urlObj.toString();
            log(`Timestamp URL built: ${result}`);
            logFunctionEnd('buildYouTubeTimestampUrl');
            return result;
        } catch (error) {
            logWarn(`Failed to build timestamp URL via URL API: ${error.message}`);
            const separator = baseUrl.includes('?') ? '&' : '?';
            const fallback = `${baseUrl}${separator}t=${timestampValue}`;
            log(`Using fallback timestamp URL: ${fallback}`);
            logFunctionEnd('buildYouTubeTimestampUrl');
            return fallback;
        }
    }

    /**
     * Builds menu option descriptors for timestamped video links
     * @param {object} context - YouTube metadata context with playback information
     * @param {string|null} baseTitle - Base title to prefix the timestamp suffix
     * @param {string|null} fallbackUrl - URL to use when shortUrl is unavailable
     * @returns {Array<object>} Menu option descriptors
     */
    function buildYouTubeTimestampMenuOptions(context, baseTitle, fallbackUrl) {
        logFunctionBegin('buildYouTubeTimestampMenuOptions');
        if (!context || !context.playback || !context.playback.isActive || !context.video) {
            log('Timestamp prerequisites missing (context/playback/video)');
            logFunctionEnd('buildYouTubeTimestampMenuOptions');
            return [];
        }

        const seconds = context.playback.seconds;
        if (!Number.isFinite(seconds) || seconds <= 0) {
            log('Playback seconds invalid for timestamp options');
            logFunctionEnd('buildYouTubeTimestampMenuOptions');
            return [];
        }

        const shortBase = context.video.shortUrl || fallbackUrl || context.video.canonicalUrl;
        if (!shortBase) {
            log('No base URL available for timestamp links');
            logFunctionEnd('buildYouTubeTimestampMenuOptions');
            return [];
        }

        const timestampDisplay = formatSecondsAsTimestamp(seconds) || `${Math.floor(seconds)}s`;
        const decoratedBaseTitle = baseTitle || context.video.title || 'YouTube Video';
        const decoratedTitle = `${decoratedBaseTitle} @ ${timestampDisplay}`;
        const timestampUrl = buildYouTubeTimestampUrl(shortBase, `${Math.floor(seconds)}`);
        if (!timestampUrl) {
            log('Failed to build timestamp URL');
            logFunctionEnd('buildYouTubeTimestampMenuOptions');
            return [];
        }

        const option = {
            label: 'Timestamp',
            displayValue: decoratedTitle,
            getResult: () => ({
                title: decoratedTitle,
                url: timestampUrl
            })
        };

        log('Built 1 timestamp menu option');
        logFunctionEnd('buildYouTubeTimestampMenuOptions');
        return [option];
    }

    /**
     * Returns the first non-empty text value from a list of selector/attribute descriptors
     * @param {Array<{selector: string, attribute?: string}>} descriptors - Query descriptors to evaluate in order
     * @param {string} contextLabel - Human-readable label for logging (e.g., "YouTube title")
     * @returns {string|null} Trimmed text value or null if none found
     */
    function getFirstMatchingText(descriptors, contextLabel) {
        logFunctionBegin('getFirstMatchingText');
        if (!Array.isArray(descriptors) || descriptors.length === 0) {
            log('Descriptor list empty');
            logFunctionEnd('getFirstMatchingText');
            return null;
        }

        for (let index = 0; index < descriptors.length; index += 1) {
            const descriptor = descriptors[index];
            if (!descriptor || !descriptor.selector) {
                continue;
            }
            const element = document.querySelector(descriptor.selector);
            if (!element) {
                continue;
            }
            const rawValue = descriptor.attribute ? element.getAttribute(descriptor.attribute) : element.textContent;
            const trimmedValue = rawValue ? rawValue.trim() : '';
            if (trimmedValue) {
                log(`Matched ${contextLabel} selector: ${descriptor.selector}`);
                logFunctionEnd('getFirstMatchingText');
                return trimmedValue;
            }
        }

        log(`No ${contextLabel} selector produced text`);
        logFunctionEnd('getFirstMatchingText');
        return null;
    }

    /**
     * Removes the trailing " - YouTube" suffix from titles when present
     * @param {string|null} title - Title candidate to clean
     * @returns {string|null} Title without suffix or null when input empty
     */
    function stripYouTubeTitleSuffix(title) {
        if (!title) {
            return null;
        }
        const trimmed = title.trim();
        if (!trimmed) {
            return null;
        }
        const stripped = trimmed.replace(/\s+-\s+YouTube$/i, '').trim();
        return stripped || trimmed;
    }


    /**
     * Generates YouTube-specific menu options (video titles, playlist lists, etc.)
     * @param {object|null} context - Context returned by getYouTubeContext()
     * @param {string|null} capturedUrl - Base URL captured when menu opened
     * @returns {Array<object>} Additional menu option descriptors
     */
    function buildYouTubeMenuOptions(context, capturedUrl) {
        logFunctionBegin('buildYouTubeMenuOptions');
        if (!context) {
            log('No YouTube context provided');
            logFunctionEnd('buildYouTubeMenuOptions');
            return [];
        }

        const options = [];

        if (context.video) {
            const videoTitle = buildYouTubeVideoTitle(context.video);
            if (videoTitle) {
                log('Adding YouTube video title option');
                options.push({
                    label: 'Video Title',
                    displayValue: videoTitle,
                    getResult: () => ({
                        title: videoTitle,
                        url: capturedUrl
                    })
                });
            }

            const timestampOptions = buildYouTubeTimestampMenuOptions(
                context,
                videoTitle,
                context.video.canonicalUrl || capturedUrl
            );
            timestampOptions.forEach((option) => options.push(option));
        }

        if (context.playlist && context.playlist.videos && context.playlist.videos.length > 0) {
            const playlistMarkdown = buildYouTubePlaylistMarkdown(context.playlist);
            if (playlistMarkdown) {
                log('Adding YouTube playlist markdown option');
                options.push({
                    label: 'Playlist Markdown',
                    displayValue: `${context.playlist.videos.length} entries`,
                    getValue: () => playlistMarkdown,
                    isAllLinks: true
                });
            }

            const playlistTitle = context.playlist.title || context.playlist.url || 'YouTube Playlist';
            log('Adding YouTube playlist link option');
            options.push({
                label: 'Playlist Link',
                displayValue: playlistTitle,
                getResult: () => ({
                    title: context.playlist.title ? `YouTube Playlist: ${context.playlist.title}` : 'YouTube Playlist',
                    url: context.playlist.url || capturedUrl
                })
            });
        }

        if (context.channel && context.channel.title) {
            log('Adding YouTube channel link option');
            options.push({
                label: 'Channel Link',
                displayValue: context.channel.title,
                getResult: () => ({
                    title: `YouTube Channel: ${context.channel.title}`,
                    url: context.channel.canonicalUrl || capturedUrl
                })
            });
        }

        log(`Built ${options.length} YouTube-specific menu options`);
        logFunctionEnd('buildYouTubeMenuOptions');
        return options;
    }

    /**
     * Safely returns the Amazon toolkit namespace when available
     * @returns {object|null} Toolkit namespace loaded via @require directives
     */
    function getAmazonToolkit() {
        logFunctionBegin('getAmazonToolkit');
        if (typeof window === 'undefined') {
            log('[amazon_toolkit] Window unavailable, cannot access Amazon toolkit');
            logFunctionEnd('getAmazonToolkit');
            return null;
        }
        const toolkit = window.AmazonToolkit || null;
        logFunctionEnd('getAmazonToolkit');
        return toolkit;
    }

    const amazonMetadataCache = new Map();

    /**
     * Normalizes URL strings into consistent cache keys for Amazon metadata
     * @param {string|null} url - URL candidate to normalize
     * @returns {string|null} Normalized absolute URL suitable for Map keys
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/URL
     */
    function normalizeAmazonCacheKey(url) {
        logFunctionBegin('normalizeAmazonCacheKey');
        if (!url) {
            log('Cache key URL missing');
            logFunctionEnd('normalizeAmazonCacheKey');
            return null;
        }

        try {
            const normalized = new URL(url, window.location.href);
            logFunctionEnd('normalizeAmazonCacheKey');
            return normalized.href;
        } catch (error) {
            logWarn(`Failed to normalize Amazon cache key: ${error.message}`);
            logFunctionEnd('normalizeAmazonCacheKey');
            return url;
        }
    }

    /**
     * Stores metadata for a specific URL key inside the Amazon cache
     * @param {string|null} key - URL string to associate with metadata
     * @param {object} metadata - Parsed Amazon metadata structure
     */
    function cacheAmazonMetadataKey(key, metadata) {
        logFunctionBegin('cacheAmazonMetadataKey');
        if (!key || !metadata) {
            log('Cache key or metadata missing');
            logFunctionEnd('cacheAmazonMetadataKey');
            return;
        }

        const normalizedKey = normalizeAmazonCacheKey(key);
        if (!normalizedKey) {
            log('Normalized cache key unavailable');
            logFunctionEnd('cacheAmazonMetadataKey');
            return;
        }

        amazonMetadataCache.set(normalizedKey, metadata);
        logFunctionEnd('cacheAmazonMetadataKey');
    }

    /**
     * Remembers toolkit-derived Amazon metadata for reuse across menu flows
     * @param {object|null} metadata - Toolkit metadata payload containing url/type info
     */
    function rememberAmazonMetadata(metadata) {
        logFunctionBegin('rememberAmazonMetadata');
        if (!metadata) {
            log('No Amazon metadata to remember');
            logFunctionEnd('rememberAmazonMetadata');
            return;
        }

        const keys = new Set();
        const urlInfo = metadata.url || {};
        if (urlInfo.original) {
            keys.add(urlInfo.original);
        }
        if (urlInfo.clean) {
            keys.add(urlInfo.clean);
        }
        if (metadata.href) {
            keys.add(metadata.href);
        }

        keys.forEach((key) => cacheAmazonMetadataKey(key, metadata));
        logFunctionEnd('rememberAmazonMetadata');
    }

    /**
     * Retrieves cached Amazon metadata for a URL when available
     * @param {string|null} url - URL to lookup in cache
     * @returns {object|null} Cached metadata or null when absent
     */
    function getCachedAmazonMetadata(url) {
        logFunctionBegin('getCachedAmazonMetadata');
        const normalizedKey = normalizeAmazonCacheKey(url);
        if (!normalizedKey) {
            log('Normalized Amazon cache key missing');
            logFunctionEnd('getCachedAmazonMetadata');
            return null;
        }

        const cached = amazonMetadataCache.get(normalizedKey) || null;
        log(`Amazon metadata cache ${cached ? 'hit' : 'miss'} for ${normalizedKey}`);
        logFunctionEnd('getCachedAmazonMetadata');
        return cached;
    }

    /**
     * Parses Amazon metadata via toolkit when cache is cold
     * @param {string|null} url - URL requiring classification
     * @param {string} sourceLabel - Caller context for logging clarity
     * @returns {object|null} Parsed metadata or null on failure
     */
    function getAmazonMetadataForUrl(url, sourceLabel = 'parse') {
        logFunctionBegin('getAmazonMetadataForUrl');
        if (!url) {
            log('URL missing for Amazon metadata parse');
            logFunctionEnd('getAmazonMetadataForUrl');
            return null;
        }

        const cached = getCachedAmazonMetadata(url);
        if (cached) {
            logFunctionEnd('getAmazonMetadataForUrl');
            return cached;
        }

        const toolkit = getAmazonToolkit();
        const parseFn = toolkit?.Links?.parseAmazonURL;
        if (typeof parseFn !== 'function') {
            log('Amazon toolkit parseAmazonURL unavailable');
            logFunctionEnd('getAmazonMetadataForUrl');
            return null;
        }

        try {
            const parsed = parseFn(url);
            if (parsed) {
                rememberAmazonMetadata(parsed);
                log(`Amazon metadata parsed for ${sourceLabel}`);
                logFunctionEnd('getAmazonMetadataForUrl');
                return parsed;
            }
        } catch (error) {
            logWarn(`Amazon metadata parse failed (${sourceLabel}): ${error.message}`);
        }

        logFunctionEnd('getAmazonMetadataForUrl');
        return null;
    }

    /**
     * Logs a concise Amazon classification summary for debugging
     * @param {object|null} metadata - Toolkit metadata payload
     * @param {string} sourceLabel - Caller context for traceability
     */
    function logAmazonLinkMetadata(metadata, sourceLabel = 'unknown') {
        logFunctionBegin('logAmazonLinkMetadata');
        if (!metadata) {
            log('No Amazon metadata to log');
            logFunctionEnd('logAmazonLinkMetadata');
            return;
        }

        const urlInfo = metadata.url || {};
        const redirectChain = urlInfo.redirectChain || metadata.redirectChain || [];
        const infoParts = [
            `source=${sourceLabel}`,
            metadata.type ? `type=${metadata.type}` : null,
            metadata.asin ? `asin=${metadata.asin}` : null,
            metadata.storeId ? `storeId=${metadata.storeId}` : null,
            metadata.sellerId ? `sellerId=${metadata.sellerId}` : null,
            urlInfo.hostname ? `host=${urlInfo.hostname}` : null,
            (urlInfo.canonicalPath || urlInfo.pathname) ? `path=${urlInfo.canonicalPath || urlInfo.pathname}` : null,
            redirectChain.length ? `redirects=${redirectChain.length}` : null
        ].filter(Boolean);

        log(`Amazon classification: ${infoParts.join(' | ')}`);
        logFunctionEnd('logAmazonLinkMetadata');
    }

    /**
     * Attempts to parse an Amazon anchor element via toolkit helpers
     * @param {HTMLAnchorElement|null} anchor - Anchor element to inspect
     * @returns {string|null} Clean or original URL provided by the toolkit
     */
    function getAmazonUrlFromAnchor(anchor) {
        logFunctionBegin('getAmazonUrlFromAnchor');
        if (!anchor) {
            log('No anchor provided for Amazon parsing');
            logFunctionEnd('getAmazonUrlFromAnchor');
            return null;
        }

        const toolkit = getAmazonToolkit();
        const linkNamespace = toolkit?.Links;
        if (!linkNamespace || typeof linkNamespace.parseAmazonAnchor !== 'function') {
            log('Amazon toolkit parseAmazonAnchor unavailable');
            logFunctionEnd('getAmazonUrlFromAnchor');
            return null;
        }

        try {
            const parsedAnchor = linkNamespace.parseAmazonAnchor(anchor);
            if (parsedAnchor) {
                rememberAmazonMetadata(parsedAnchor);
                logAmazonLinkMetadata(parsedAnchor, 'anchor');
            }
            if (parsedAnchor?.url?.clean) {
                log(`Toolkit returned clean Amazon URL: "${parsedAnchor.url.clean}"`);
                logFunctionEnd('getAmazonUrlFromAnchor');
                return parsedAnchor.url.clean;
            }
            if (parsedAnchor?.url?.original) {
                log(`Toolkit returned original Amazon URL: "${parsedAnchor.url.original}"`);
                logFunctionEnd('getAmazonUrlFromAnchor');
                return parsedAnchor.url.original;
            }
            if (parsedAnchor?.href) {
                log(`Toolkit returned href fallback: "${parsedAnchor.href}"`);
                logFunctionEnd('getAmazonUrlFromAnchor');
                return parsedAnchor.href;
            }
            log('Toolkit parseAmazonAnchor returned no usable URL');
        } catch (error) {
            logWarn(`Amazon toolkit anchor parsing failed: ${error.message}`);
        }

        logFunctionEnd('getAmazonUrlFromAnchor');
        return null;
    }

    /**
     * Returns a domain-specific title for supported providers (currently YouTube)
     * @param {string|null} url - Target URL for which the title is being composed
     * @param {object|null} precomputedContext - Optional context to avoid recomputation
     * @returns {string|null} Domain-specific title or null if not applicable
     */
    function getDomainSpecificTitle(url, precomputedContext = null) {
        logFunctionBegin('getDomainSpecificTitle');
        if (!url) {
            log('URL missing for domain-specific title resolution');
            logFunctionEnd('getDomainSpecificTitle');
            return null;
        }

        if (!isYouTubeUrl(url)) {
            log('Domain-specific title not applicable (non-YouTube URL)');
            logFunctionEnd('getDomainSpecificTitle');
            return null;
        }

        const context = precomputedContext || getYouTubeContext(url);
        if (context?.video) {
            const videoTitle = buildYouTubeVideoTitle(context.video);
            log(`Using YouTube video title override: ${videoTitle}`);
            logFunctionEnd('getDomainSpecificTitle');
            return videoTitle;
        }

        if (context?.playlist && context.playlist.title) {
            const playlistTitle = `YouTube Playlist: ${context.playlist.title}`;
            log(`Using YouTube playlist title override: ${playlistTitle}`);
            logFunctionEnd('getDomainSpecificTitle');
            return playlistTitle;
        }

        if (context?.channel && context.channel.title) {
            const channelTitle = `YouTube Channel: ${context.channel.title}`;
            log(`Using YouTube channel title override: ${channelTitle}`);
            logFunctionEnd('getDomainSpecificTitle');
            return channelTitle;
        }

        log('No domain-specific title available for URL');
        logFunctionEnd('getDomainSpecificTitle');
        return null;
    }

    // ============================================================================
    // URL VALIDATION
    // ============================================================================

    /**
     * Validates extracted URL and shows debug dialog if validation fails
     * @param {string|null} url - The URL to validate
     * @param {HTMLElement|null} anchor - The anchor element (for debugging context)
     * @param {MouseEvent|KeyboardEvent} event - The triggering event (for debugging context)
     * @param {string} source - Description of where this validation is being called from
     * @returns {boolean} True if URL is valid, false otherwise
     * 
     * If validation fails and isDebug is true, prompts user with debugger option
     * Logs comprehensive debugging information about the failure
     * 
     * Type returned: boolean
     */
    function validateUrl(url, anchor, event, source) {
        logFunctionBegin('validateUrl');
        log(`Validating URL from ${source}`);
        log(`  URL value: ${url || 'null'}`);
        log(`  URL type: ${typeof url}`);
        log(`  URL length: ${url ? url.length : 0}`);
        
        // Check if URL is null, undefined, empty, or the string "null"
        const isValid = url && url !== 'null' && url.trim() !== '';
        
        if (isValid) {
            log(`URL validation passed: "${url}"`);
            logFunctionEnd('validateUrl');
            return true;
        }
        
        // Validation failed - log comprehensive error details
        logError(`URL validation FAILED at ${source}`);
        logError(`  URL value: ${url}`);
        logError(`  URL type: ${typeof url}`);
        logError(`  event.target: ${unwrap(event.target, 'tagName')}`);
        logError(`  event.target.className: ${unwrap(event.target, 'className')}`);
        logError(`  event.type: ${unwrap(event, 'type')}`);
        logError(`  anchor: ${anchor ? 'exists' : 'null'}`);
        logError(`  anchor.tagName: ${unwrap(anchor, 'tagName')}`);
        logError(`  anchor.href: ${unwrap(anchor, 'href')}`);
        logError(`  anchor.getAttribute('href'): ${anchor ? anchor.getAttribute('href') : 'null'}`);
        logError(`  anchor.textContent: ${anchor && anchor.textContent ? anchor.textContent.substring(0, 50) : 'null'}`);
        logError(`  window.location.href: ${window.location.href}`);
        
        // Show debug dialog if in debug mode
        // if (isDebug) {
            const debugMessage = 
                `URL Validation Failed!\n\n` +
                `Source: ${source}\n` +
                `URL: ${url || 'null'}\n` +
                `Type: ${typeof url}\n\n` +
                `Event Details:\n` +
                `  Type: ${unwrap(event, 'type')}\n` +
                `  Target: ${unwrap(event.target, 'tagName')}\n` +
                `  Class: ${anchor && anchor.textContent ? anchor.textContent.substring(0, 50) : 'null'}\n\n` +
                `Anchor Details:\n` +
                `  Exists: ${anchor ? 'yes' : 'no'}\n` +
                `  Tag: ${unwrap(anchor, 'tagName')}\n` +
                `  href property: ${unwrap(anchor, 'href')}\n` +
                `  href attribute: ${anchor ? anchor.getAttribute('href') : 'null'}\n` +
                `  Text: ${anchor && anchor.textContent ? anchor.textContent.substring(0, 50) : 'null'}\n\n` +
                `Open debugger to inspect?`;
            
            const openDebugger = confirm(debugMessage);
            if (openDebugger) {
                // Make debugging easier by exposing variables
                console.log('Debug context:', { url, anchor, event, source });
                debugger; // Breakpoint for debugging
            }
        // }
        
        logFunctionEnd('validateUrl');
        return false;
    }

    // ============================================================================
    // URL CLEANING
    // ============================================================================

    /**
     * Cleans URL by removing tracking parameters and delegating site-specific canonicalization
     * @param {string} url - The URL to clean
     * @returns {string} Cleaned URL
     * 
     * Common tracking parameters removed:
     * - utm_* (Google Analytics)
     * - fbclid (Facebook)
     * - gclid (Google Ads)
     * - ref, ref_* (Various referral tracking)
     * - mc_* (Marketing campaign)
    * - _ga (Google Analytics)
    * 
    * Site-specific cleaning:
    * - Amazon: Delegates to AmazonToolkit.Links.cleanAmazonURL()
     * 
     * Type returned: string
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/URL
     */
    function cleanUrl(url) {
        logFunctionBegin('cleanUrl');
        log(`Original URL: "${url}"`);

        if (!url) {
            log('URL missing, returning original value');
            logFunctionEnd('cleanUrl');
            return url;
        }

        let urlObj;
        try {
            urlObj = new URL(url);
        } catch (error) {
            logError(`Error cleaning URL: ${error.message}`);
            log('Returning original URL');
            logFunctionEnd('cleanUrl');
            return url;
        }

        const hostname = urlObj.hostname || '';
        const isAmazonHost = isAmazonHostname(hostname);

        if (isAmazonHost) {
            const toolkit = getAmazonToolkit();
            const linkNamespace = toolkit?.Links;
            let amazonMetadata = getAmazonMetadataForUrl(url, 'cleanUrl-pre');
            let cleanedAmazonUrl = null;

            if (linkNamespace && typeof linkNamespace.cleanAmazonURL === 'function') {
                cleanedAmazonUrl = linkNamespace.cleanAmazonURL(url, { preserveVariants: true, preserveSeller: false });
                if (!cleanedAmazonUrl) {
                    logWarn('Toolkit cleanAmazonURL returned null');
                }
            } else {
                log('Amazon toolkit cleanAmazonURL unavailable');
            }

            const canonicalAmazonUrl = cleanedAmazonUrl || amazonMetadata?.url?.clean || amazonMetadata?.url?.original;
            if (canonicalAmazonUrl) {
                if (!amazonMetadata) {
                    amazonMetadata = getAmazonMetadataForUrl(canonicalAmazonUrl, 'cleanUrl-post');
                }
                if (amazonMetadata) {
                    logAmazonLinkMetadata(amazonMetadata, 'cleanUrl');
                }
                log(`Toolkit cleaned Amazon URL: "${canonicalAmazonUrl}"`);
                logFunctionEnd('cleanUrl');
                return canonicalAmazonUrl;
            }

            logWarn('Amazon toolkit did not provide a canonical URL, returning original value');
            logFunctionEnd('cleanUrl');
            return url;
        }

        // General tracking parameter removal
        log('Removing common tracking parameters');
        const trackingParams = [
            // Google Analytics
            'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
            // Facebook
            'fbclid',
            // Google Ads
            'gclid', 'gclsrc',
            // Amazon tracking
            'ref', 'ref_', 'pf_rd_r', 'pf_rd_p', 'pf_rd_m', 'pf_rd_s', 'pf_rd_t', 'pf_rd_i',
            'pd_rd_r', 'pd_rd_w', 'pd_rd_wg',
            'qid', 'sr', 'keywords', 'crid', 'sprefix', 'th', 'psc',
            'dib', 'dib_tag',
            // Marketing campaign
            'mc_cid', 'mc_eid',
            // General analytics
            '_ga', '_gl',
            // Other common tracking
            'msclkid', 'twclid'
        ];

        trackingParams.forEach((param) => {
            urlObj.searchParams.delete(param);
        });

        const paramsToDelete = [];
        for (const [key] of urlObj.searchParams) {
            if (key.startsWith('utm_') ||
                key.startsWith('ref') ||
                key.startsWith('pf_') ||
                key.startsWith('pd_') ||
                key.startsWith('mc_')) {
                paramsToDelete.push(key);
            }
        }
        paramsToDelete.forEach((param) => urlObj.searchParams.delete(param));

        const cleanedUrl = urlObj.toString();
        log(`Cleaned URL: "${cleanedUrl}"`);
        logFunctionEnd('cleanUrl');
        return cleanedUrl;
    }

    // ============================================================================
    // URL EXTRACTION
    // ============================================================================

    /**
     * Extracts URL from an anchor element using multiple fallback strategies
     * Handles relative URLs, missing hrefs, and site-specific patterns
     * @param {HTMLElement} anchor - The anchor element (or closest anchor)
     * @param {MouseEvent|KeyboardEvent} event - The triggering event (for additional context)
    * @returns {string|null} Absolute URL or null if extraction fails
    * 
    * Strategies attempted in order:
    * 1. Standard anchor.href (browser auto-resolves relative URLs)
    * 2. Manual resolution with URL API
    * 3. Walk up DOM tree to find parent anchor
     * 
     * Type returned: string (absolute URL) | null (extraction failed)
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/href
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/URL
     */
    function extractUrlFromAnchor(anchor, event) {
        logFunctionBegin('extractUrlFromAnchor');
        let toolkitAmazonUrl = null;

        if (anchor && anchor.href) {
            try {
                const anchorUrlObj = new URL(anchor.href, window.location.href);
                if (isAmazonHostname(anchorUrlObj.hostname || '')) {
                    toolkitAmazonUrl = getAmazonUrlFromAnchor(anchor);
                }
            } catch (error) {
                logWarn(`Failed to parse anchor href for Amazon detection: ${error.message}`);
            }
        }

        if (toolkitAmazonUrl) {
            log('Toolkit provided Amazon URL, skipping legacy extraction strategies');
            logFunctionEnd('extractUrlFromAnchor');
            return toolkitAmazonUrl;
        }
        
        // Strategy 1: Try standard href property (browser auto-resolves)
        if (anchor && anchor.href) {
            log(`Strategy 1: Found href via anchor.href: "${anchor.href}"`);
            logFunctionEnd('extractUrlFromAnchor');
            return anchor.href;
        }
        
        logWarn('Strategy 1 failed: anchor.href is null or empty');
        log(`  anchor exists: ${!!anchor}`);
        log(`  anchor.href: ${unwrap(anchor, 'href')}`);
        log(`  anchor.tagName: ${unwrap(anchor, 'tagName')}`);
        
        // Strategy 2: Try manual URL resolution with getAttribute
        if (anchor) {
            const rawHref = anchor.getAttribute('href');
            log(`Strategy 2: Attempting manual URL resolution with raw href: "${rawHref}"`);
            
            if (rawHref) {
                try {
                    const absoluteUrl = new URL(rawHref, window.location.origin);
                    log(`Strategy 2: Successfully resolved to: "${absoluteUrl.href}"`);
                    logFunctionEnd('extractUrlFromAnchor');
                    return absoluteUrl.href;
                } catch (error) {
                    logError(`Strategy 2 failed: URL construction error: ${error.message}`);
                }
            } else {
                logWarn('Strategy 2 failed: getAttribute("href") returned null');
            }
        }
        
        // Strategy 3: Walk up DOM tree to find parent anchor with valid href
        log('Strategy 3: Walking up DOM tree to find valid anchor');
        let currentElement = event.target;
        let depth = 0;
        const maxDepth = 10;
        
        while (currentElement && currentElement !== document.body && depth < maxDepth) {
            log(`  Checking element at depth ${depth}: ${currentElement.tagName}`);
            
            if (currentElement.tagName === 'A' && currentElement.href) {
                log(`Strategy 3: Found anchor with href at depth ${depth}: "${currentElement.href}"`);
                logFunctionEnd('extractUrlFromAnchor');
                return currentElement.href;
            }
            
            currentElement = currentElement.parentElement;
            depth++;
        }
        
        logWarn(`Strategy 3 failed: No valid anchor found in ${depth} parent elements`);
        
        // All strategies failed
        logError('All URL extraction strategies failed');
        logError(`  event.target: ${unwrap(event.target, 'tagName')}`);
        logError(`  event.target.className: ${unwrap(event.target, 'className')}`);
        logError(`  anchor: ${unwrap(anchor, 'tagName')}`);
        logError(`  anchor.href: ${unwrap(anchor, 'href')}`);
        logError(`  anchor.getAttribute('href'): ${anchor ? anchor.getAttribute('href') : 'null'}`);
        
        // Show error dialog if in debug mode
        if (isDebug) {
            const debugMessage = 
                `URL extraction failed!\n\n` +
                `Target element: ${unwrap(event.target, 'tagName')}\n` +
                `Anchor found: ${anchor ? 'yes' : 'no'}\n` +
                `Anchor href: ${unwrap(anchor, 'href')}\n` +
                `Raw href attribute: ${anchor ? anchor.getAttribute('href') : 'null'}\n\n` +
                `Open debugger to inspect?`;
            
            const openDebugger = confirm(debugMessage);
            if (openDebugger) {
                debugger; // Breakpoint for debugging
            }
        }
        
        logFunctionEnd('extractUrlFromAnchor');
        return null;
    }

    // ============================================================================
    // TITLE EXTRACTION FUNCTIONS
    // ============================================================================

    /**
     * Gets currently selected text from the page (if any)
     * Uses the Selection API to read user's text highlight
     * @returns {string|null} Selected text or null if nothing selected
     * 
     * JavaScript string type: Immutable sequence of UTF-16 code units
     * Selection API: Represents text selection on page
     * Type returned: string (when selection exists) | null (when no selection)
     * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection
     */
    function getSelectedText() {
        logFunctionBegin('getSelectedText');
        log('Will get selection from window');
        
        const liveSelection = window.getSelection ? window.getSelection() : null;
        const liveText = liveSelection ? liveSelection.toString().trim() : '';
        if (liveText) {
            lastNonEmptySelection = liveText;
            lastSelectionTimestamp = Date.now();
            log(`Did get live selection: "${liveText}"`);
            logFunctionEnd('getSelectedText');
            return liveText;
        }

        const selectionAge = Date.now() - lastSelectionTimestamp;
        if (lastNonEmptySelection && selectionAge <= SELECTION_MEMORY_MS) {
            log(`Did get cached selection (${selectionAge}ms old): "${lastNonEmptySelection}"`);
            logFunctionEnd('getSelectedText');
            return lastNonEmptySelection;
        }
        
        log('No selection available');
        logFunctionEnd('getSelectedText');
        return null;
    }

    /**
     * Clears cached selection memory so stale highlights are not reused
     * @param {string} [reason='unspecified'] - Optional context for log output
     */
    function clearSelectionCache(reason = 'unspecified') {
        logFunctionBegin('clearSelectionCache');
        log(`Clearing selection cache (reason: ${reason})`);
        lastNonEmptySelection = null;
        lastSelectionTimestamp = 0;
        logFunctionEnd('clearSelectionCache');
    }

        /**
         * Copies markdown using a selection value without showing the menu
         * @param {string|null} selectedText - Highlighted text to use as title
         * @param {string|null} resolvedUrl - URL to pair with the selection
         * @returns {boolean} True when clipboard copy succeeded and menu should be skipped
         */
        function handleSelectionAutoCopy(selectedText, resolvedUrl) {
            logFunctionBegin('handleSelectionAutoCopy');
            if (!selectedText || !resolvedUrl) {
                log('Selection text or URL missing, cannot auto-copy');
                logFunctionEnd('handleSelectionAutoCopy');
                return false;
            }

            const sanitizedUrl = cleanUrl(resolvedUrl) || resolvedUrl;
            if (sanitizedUrl !== resolvedUrl) {
                log(`Sanitized selection auto-copy URL: "${sanitizedUrl}"`);
            }

            const markdown = createMarkdown(selectedText, sanitizedUrl);
            if (!markdown) {
                logError('Failed to build markdown for selection auto-copy');
                logFunctionEnd('handleSelectionAutoCopy');
                return false;
            }

            copyToClipboard(markdown, selectedText, sanitizedUrl, {
                originalUrl: (typeof window !== 'undefined' && window.location && window.location.href) || sanitizedUrl,
                format: 'selection'
            });
            showNotification('Selection copied to clipboard');
            clearSelectionCache('selection auto copied');
            logFunctionEnd('handleSelectionAutoCopy');
            return true;
        }

        /**
         * Attempts to copy the current selection automatically when allowed
         * @param {boolean} skipAutoCopy - True when feature should not run (e.g., auto-infer mode)
         * @param {string|null} resolvedUrl - URL to pair with the selection
         * @returns {boolean} True when selection was copied and menu should be skipped
         */
        function maybeAutoCopySelection(skipAutoCopy, resolvedUrl) {
            logFunctionBegin('maybeAutoCopySelection');
            if (skipAutoCopy) {
                log('Auto-copy skipped by caller');
                logFunctionEnd('maybeAutoCopySelection');
                return false;
            }

            const selectionText = getSelectedText();
            if (!selectionText) {
                log('No selection text available for auto-copy');
                logFunctionEnd('maybeAutoCopySelection');
                return false;
            }

            const result = handleSelectionAutoCopy(selectionText, resolvedUrl);
            logFunctionEnd('maybeAutoCopySelection');
            return result;
        }

    /**
     * Gets the current page's title from document
     * @returns {string|null} Page title or null if empty
     * 
     * document.title: Always returns a string (empty string if no <title> tag)
     * Type returned: string | null
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/title
     */
    function getPageTitle() {
        logFunctionBegin('getPageTitle');
        log('Will get document.title');
        
        // Type: string (native browser API always returns string, never null/undefined)
        let title = document.title.trim() || null;
        if (title) {
            const normalizedTitle = normalizeTitleForUrl(title, window.location.href);
            if (normalizedTitle && normalizedTitle !== title) {
                log(`Normalized page title for current URL: "${normalizedTitle}"`);
            }
            title = normalizedTitle || title;
        }
        
        log(`Did get page title: ${title ? `"${title}"` : 'null'}`);
        logFunctionEnd('getPageTitle');
        return title;
    }

    /**
     * Extracts meta description from page <head>
     * Looks for <meta name="description" content="...">
     * @returns {string|null} Meta description or null if not found
     * 
     * querySelector returns: HTMLMetaElement | null
     * HTMLMetaElement.content: string property containing the content attribute value
     * Type returned: string | null
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMetaElement
     */
    function getMetaDescription() {
        logFunctionBegin('getMetaDescription');
        log('Will query meta[name="description"]');
        
        // querySelector returns first matching element or null if none found
        // Type: HTMLMetaElement | null
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
        const meta = document.querySelector('meta[name="description"]');
        
        // meta.content is string if meta exists, ternary converts to null if meta is null
        // Type: string | null
        let description = meta ? meta.content.trim() : null;
        if (description) {
            const normalizedDescription = normalizeTitleForUrl(description, window.location.href);
            if (normalizedDescription && normalizedDescription !== description) {
                log(`Normalized meta description for current URL: "${normalizedDescription}"`);
            }
            description = normalizedDescription || description;
        }
        
        log(`Did get meta description: ${description ? `"${description}"` : 'null'}`);
        logFunctionEnd('getMetaDescription');
        return description;
    }

    /**
     * Determines whether a hostname belongs to Amazon (any TLD)
     * @param {string|null} hostname - Hostname portion of URL
     * @returns {boolean} True when hostname contains amazon.*
     */
    function isAmazonHostname(hostname) {
        logFunctionBegin('isAmazonHostname');
        if (!hostname) {
            log('Hostname missing for Amazon detection');
            logFunctionEnd('isAmazonHostname');
            return false;
        }

        const result = hostname.toLowerCase().includes('amazon.');
        logFunctionEnd('isAmazonHostname');
        return result;
    }

    /**
     * Determines whether the provided URL targets an Amazon product route (/dp/ or /gp/product/)
     * @param {string|null} url - URL string to inspect
     * @returns {boolean} True when URL appears to be an Amazon product page
     */
    function isAmazonProductUrl(url) {
        logFunctionBegin('isAmazonProductUrl');
        if (!url) {
            log('URL missing for Amazon detection');
            logFunctionEnd('isAmazonProductUrl');
            return false;
        }

        try {
            const parsedUrl = new URL(url, window.location.href);
            const hostname = parsedUrl.hostname || '';
            if (!isAmazonHostname(hostname)) {
                log('Hostname not Amazon, skipping detection');
                logFunctionEnd('isAmazonProductUrl');
                return false;
            }

            const path = parsedUrl.pathname || '';
            const isProduct = /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/.test(path) || /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/.test(path);
            log(`Amazon product route detected: ${isProduct}`);
            logFunctionEnd('isAmazonProductUrl');
            return isProduct;
        } catch (error) {
            logWarn(`Failed to parse URL for Amazon detection: ${error.message}`);
            logFunctionEnd('isAmazonProductUrl');
            return false;
        }
    }

    /**
     * Normalizes titles based on URL-specific rules (currently strips "Amazon.com:" prefix)
     * @param {string|null} title - Title value to normalize
     * @param {string|null} url - URL used to determine normalization rules
     * @returns {string|null} Normalized title or original value when unchanged
     */
    function normalizeTitleForUrl(title, url) {
        logFunctionBegin('normalizeTitleForUrl');
        if (!title || !url) {
            log('Title or URL missing, skipping normalization');
            logFunctionEnd('normalizeTitleForUrl');
            return title;
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(url, window.location.href);
        } catch (error) {
            logWarn(`Failed to parse URL for normalization: ${error.message}`);
            logFunctionEnd('normalizeTitleForUrl');
            return title;
        }

        if (isAmazonHostname(parsedUrl.hostname || '')) {
            const toolkit = getAmazonToolkit();
            const linkNamespace = toolkit?.Links;
            const markdownNamespace = toolkit?.Markdown;
            let cleanedTitle = title.trim();

            if (linkNamespace && typeof linkNamespace.cleanProductTitle === 'function') {
                cleanedTitle = linkNamespace.cleanProductTitle(cleanedTitle);
            } else {
                cleanedTitle = cleanedTitle.replace(/^Amazon\.com:\s*/i, '').trim();
            }

            if (markdownNamespace && typeof markdownNamespace.formatTitle === 'function') {
                cleanedTitle = markdownNamespace.formatTitle(cleanedTitle, {
                    escape: false,
                    removePrefix: true,
                    removeSuffix: true
                });
            }

            cleanedTitle = cleanedTitle.replace(/\s+/g, ' ').trim();
            if (cleanedTitle) {
                if (cleanedTitle !== title) {
                    log(`Normalized Amazon title: "${cleanedTitle}"`);
                }
                logFunctionEnd('normalizeTitleForUrl');
                return cleanedTitle;
            }
        }
        logFunctionEnd('normalizeTitleForUrl');
        return title;
    }

    // ============================================================================
    // URL-DERIVED TITLE HELPERS
    // ============================================================================

    /**
     * Converts camelCase, snake_case, or kebab-case segments into title case words
     * @param {string} segment - Raw path or subdomain segment from the URL
     * @returns {string} Human-friendly representation suitable for link titles
     */
    function formatPathSegment(segment) {
        logFunctionBegin('formatPathSegment');
        if (!segment) {
            log('Segment empty, returning empty string');
            logFunctionEnd('formatPathSegment');
            return '';
        }

        const uppercaseCandidate = segment.toUpperCase();
        if (/^[A-Z0-9]{10}$/.test(uppercaseCandidate)) {
            log(`Segment appears to be ASIN, preserving formatting: "${uppercaseCandidate}"`);
            logFunctionEnd('formatPathSegment');
            return uppercaseCandidate;
        }

        const noExtension = segment.replace(/\.[a-z0-9]+$/i, '');
        const withDelimiters = noExtension
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/[-_]+/g, ' ')
            .trim();
        if (!withDelimiters) {
            log('Segment collapsed after cleanup');
            logFunctionEnd('formatPathSegment');
            return '';
        }

        const words = withDelimiters.split(/\s+/).map((word) => {
            const lower = word.toLowerCase();
            if (lower === 'api') {
                return 'API';
            }
            if (lower === 'cli') {
                return 'CLI';
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });

        const result = words.join(' ');
        log(`Formatted segment: "${result}"`);
        logFunctionEnd('formatPathSegment');
        return result;
    }

    /**
     * Generates a readable brand-focused domain title from a hostname
     * @param {string} hostname - URL hostname (e.g., docs.github.com)
     * @returns {string|null} Domain title or null if unavailable
     */
    function getDomainTitleFromHostname(hostname) {
        logFunctionBegin('getDomainTitleFromHostname');
        if (!hostname) {
            log('Hostname missing');
            logFunctionEnd('getDomainTitleFromHostname');
            return null;
        }

        const cleanHost = hostname.replace(/^www\./i, '');
        const parts = cleanHost.split('.').filter(Boolean);
        if (parts.length === 0) {
            log('Hostname parts empty');
            logFunctionEnd('getDomainTitleFromHostname');
            return null;
        }

        parts.pop(); // remove TLD
        if (parts.length === 0) {
            const fallback = formatPathSegment(cleanHost);
            log(`Only TLD present, fallback: "${fallback}"`);
            logFunctionEnd('getDomainTitleFromHostname');
            return fallback || cleanHost;
        }

        const brandKey = parts.pop();
        const brandTitle = DOMAIN_TITLE_OVERRIDES[brandKey.toLowerCase()] || formatPathSegment(brandKey);
        if (parts.length === 0) {
            log(`No subdomains, returning brand: "${brandTitle}"`);
            logFunctionEnd('getDomainTitleFromHostname');
            return brandTitle;
        }

        const subdomains = parts.reverse().map(formatPathSegment).filter(Boolean);
        if (subdomains.length === 0) {
            log('Subdomains collapsed, returning brand only');
            logFunctionEnd('getDomainTitleFromHostname');
            return brandTitle;
        }

        const delimiter = subdomains.length === 1 ? ' ' : ': ';
        const descriptor = subdomains.join(' ');
        const domainTitle = `${brandTitle}${delimiter}${descriptor}`;
        log(`Generated domain title: "${domainTitle}"`);
        logFunctionEnd('getDomainTitleFromHostname');
        return domainTitle;
    }

    /**
     * Builds a link title using URL components (domain + first path segments)
     * @param {string} url - Target URL
     * @returns {string|null} Generated title or null when parsing fails
     */
    function getUrlComponentTitle(url, options = {}) {
        logFunctionBegin('getUrlComponentTitle');
        if (!url) {
            log('URL missing, cannot build component title');
            logFunctionEnd('getUrlComponentTitle');
            return null;
        }

        try {
            const direction = options.direction === 'reverse' ? 'reverse' : 'forward';
            const urlObj = new URL(url);
            const hostname = urlObj.hostname || '';
            const isAmazonHost = isAmazonHostname(hostname);
            const domainTitle = getDomainTitleFromHostname(hostname) || hostname;
            const pathSegments = urlObj.pathname.split('/').filter(Boolean);
            const meaningfulSegments = pathSegments
                .filter((segment) => segment && segment !== '.' && segment !== '..')
                .map(formatPathSegment)
                .filter(Boolean);

            let orderedSegments;
            if (direction === 'reverse') {
                orderedSegments = meaningfulSegments.slice(-2).reverse();
            } else {
                orderedSegments = meaningfulSegments.slice(0, 2);
            }

            if (isAmazonHost) {
                const amazonSegments = orderedSegments.filter(Boolean);
                let amazonTitle;
                if (amazonSegments.length >= 2) {
                    amazonTitle = `${amazonSegments[0]} - ${amazonSegments[1]}`;
                } else if (amazonSegments.length === 1) {
                    amazonTitle = amazonSegments[0];
                } else {
                    const asinMatch = urlObj.pathname.match(/([A-Z0-9]{10})/);
                    amazonTitle = asinMatch ? asinMatch[1].toUpperCase() : 'Product Page';
                }
                log(`Generated Amazon URL component title: "${amazonTitle}"`);
                logFunctionEnd('getUrlComponentTitle');
                return amazonTitle;
            }

            let finalTitle = domainTitle;
            if (orderedSegments.length === 1) {
                finalTitle = `${domainTitle}: ${orderedSegments[0]}`;
            } else if (orderedSegments.length >= 2) {
                finalTitle = `${domainTitle}: ${orderedSegments[0]} - ${orderedSegments[1]}`;
            }

            log(`Generated URL component title: "${finalTitle}"`);
            logFunctionEnd('getUrlComponentTitle');
            return finalTitle;
        } catch (error) {
            logWarn(`Failed to build URL component title: ${error.message}`);
            logFunctionEnd('getUrlComponentTitle');
            return null;
        }
    }

    /**
     * Extracts visible text from an anchor element
     * Falls back to title attribute if textContent is empty
     * @param {HTMLAnchorElement} anchor - The <a> element to extract text from
     * @returns {string|null} Link text or null if empty
     * 
     * textContent: Returns concatenated text of node and descendants (excluding script/style)
     * title attribute: Provides advisory tooltip text
     * Parameter type: HTMLAnchorElement (<a> tag)
     * Type returned: string | null
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
     * Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title
     */
    function getLinkText(anchor) {
        logFunctionBegin('getLinkText');
        log('Will get anchor textContent');
        
        // Get text and clean up whitespace aggressively
        // Replace all newlines, tabs, and multiple spaces with single space
        let text = anchor.textContent || anchor.title || '';
        
        // Replace all whitespace (including newlines, tabs) with single space
        text = text.replace(/\s+/g, ' ').trim();
        
        // Chain of || operators finds first truthy value (non-empty string) or returns null
        // Type: string (textContent always returns string, even if empty)
        const result = text || null;
        
        log(`Did get link text: ${result ? `"${result}"` : 'null'}`);
        logFunctionEnd('getLinkText');
        return result;
    }

    /**
     * Prompts user to enter custom title via browser dialog
     * @returns {string|null} User-entered title or null if cancelled
     * 
     * prompt() returns: string (user input) | null (user clicked Cancel)
     * Note: prompt() is blocking (synchronous) - execution pauses until user responds
     * Type returned: string | null
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt
     */
    function promptCustomTitle() {
        logFunctionBegin('promptCustomTitle');
        log('Will prompt user for custom title');
        
        // prompt() returns null if user clicks Cancel, string (possibly empty) if OK
        // Type: string | null
        const title = prompt('Enter custom title for markdown link:');
        
        // Ternary operator ensures empty strings are converted to null
        // Type: string | null
        const result = title ? title.trim() : null;
        
        log(`Did get custom title: ${result ? `"${result}"` : 'null (cancelled)'}`);
        logFunctionEnd('promptCustomTitle');
        return result;
    }

    // ============================================================================
    // AUTO-INFER HELPER FUNCTIONS (Alt+Z+Click feature)
    // ============================================================================

    /**
     * Returns an ordered list of Alt+Z sources honoring the persisted preference first
     * @returns {string[]} Array of source IDs in priority order
     */
    function getAltZSourceOrder() {
        const remaining = ALT_Z_TITLE_OPTIONS.map((option) => option.id).filter((id) => id !== altZTitlePreference);
        return [altZTitlePreference].concat(remaining);
    }

    /**
     * Retrieves a title based on the requested Alt+Z source identifier
     * @param {string} sourceId - Identifier defined in ALT_Z_TITLE_OPTIONS
     * @param {HTMLElement|null} anchor - Anchor context (if any)
     * @param {string|null} url - Target URL for link
     * @returns {string|null} Title from the specified source or null
     */
    function getTitleFromSource(sourceId, anchor, url) {
        switch (sourceId) {
            case 'anchor':
                return anchor ? getLinkText(anchor) : null;
            case 'page':
                return getPageTitle();
            case 'url-forward':
                return url ? getUrlComponentTitle(url) : null;
            case 'url-reverse':
                return url ? getUrlComponentTitle(url, { direction: 'reverse' }) : null;
            default:
                logWarn(`Unknown Alt+Z source requested: ${sourceId}`);
                return null;
        }
    }

    /**
     * Automatically infers the best title for a markdown link based on preference order
     * @param {HTMLElement|null} anchor - The anchor element if clicking on a link, null otherwise
     * @param {string|null} url - Target URL associated with the action
     * @returns {string|null} The inferred title or null if no title source available
     * 
     * This function encapsulates the title selection logic used in auto-infer mode
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection
     */
    function getAutoInferredTitle(anchor, url) {
        logFunctionBegin('getAutoInferredTitle');
        const selectedText = getSelectedText();
        if (selectedText) {
            log('Selection available, will prioritize it over preference order');
            clearSelectionCache('auto-infer prioritized selection');
            logFunctionEnd('getAutoInferredTitle');
            return selectedText;
        }

        if (url) {
            log('Will evaluate domain-specific title overrides');
            const domainTitle = getDomainSpecificTitle(url);
            if (domainTitle) {
                log(`Domain-specific title selected: "${domainTitle}"`);
                logFunctionEnd('getAutoInferredTitle');
                return domainTitle;
            }
            log('No domain-specific title override available');
        } else {
            log('URL missing, skipping domain-specific title evaluation');
        }

        const sourceOrder = getAltZSourceOrder();
        log(`Will attempt to auto-infer title in order: ${sourceOrder.join(' > ')}`);

        for (let i = 0; i < sourceOrder.length; i += 1) {
            const sourceId = sourceOrder[i];
            const title = getTitleFromSource(sourceId, anchor, url);
            if (title) {
                const normalizedTitle = normalizeTitleForUrl(title, url) || title;
                log(`Selected "${normalizedTitle}" from source ${sourceId} (priority ${i + 1})`);
                logFunctionEnd('getAutoInferredTitle');
                return normalizedTitle;
            }
            log(`Source ${sourceId} produced no title`);
        }

        log('No auto-infer sources produced a title');
        logFunctionEnd('getAutoInferredTitle');
        return null;
    }

    /**
     * Auto-infers title, creates markdown link, copies to clipboard, and shows notification
     * Used by Alt+Z+Click feature to quickly copy markdown without menu
     * @param {string} url - The URL to create markdown link for
     * @param {HTMLElement|null} anchor - The anchor element if on a link, null otherwise
     * 
     * Flow: infer title -> create markdown -> copy to clipboard -> show notification
     * Reference: https://violentmonkey.github.io/api/gm/#gm_setclipboard
     */
    function autoInferAndCopyMarkdown(url, anchor) {
        logFunctionBegin('autoInferAndCopyMarkdown');
        log(`Will auto-infer and copy markdown for URL: "${url}"`);
        const resolvedUrl = cleanUrl(url) || url;
        if (resolvedUrl !== url) {
            log(`Sanitized auto-infer URL: "${resolvedUrl}"`);
        }

        const titleSourceUrl = url || resolvedUrl;
        
        // Get the auto-inferred title using priority logic
        log('Will get auto-inferred title');
        const title = getAutoInferredTitle(anchor, titleSourceUrl);
        
        if (!title) {
            log('Auto-infer failed - no title source available');
            logError('Could not auto-infer title from selected text, anchor text, or page title');
            showNotification('Could not infer title - no text selected and no anchor found');
            logFunctionEnd('autoInferAndCopyMarkdown');
            return;
        }
        
        log(`Did get title: "${title}"`);
        
        // Create markdown link
        log('Will create markdown');
        const markdown = createMarkdown(title, resolvedUrl);
        log(`Did create markdown: "${markdown}"`);
        
        // Copy to clipboard
        log('Will copy to clipboard');
        try {
            GM_setClipboard(markdown, 'text/plain');
            log('Did copy to clipboard');
            
            // Show success notification with preview of what was copied
            const preview = markdown.length > 60 ? markdown.substring(0, 57) + '...' : markdown;
            showNotification(`Copied: ${preview}`);
            log(`Did show notification with preview: "${preview}"`);
        } catch (error) {
            logError(`Failed to copy to clipboard: ${error}`);
            showNotification('Failed to copy to clipboard - check console for errors');
        }
        
        logFunctionEnd('autoInferAndCopyMarkdown');
    }

    /**
     * Compiles buffered links into a markdown list and copies to clipboard
     * Called when Alt+Z keys are released after buffering multiple clicks
     * @param {Array<{url: string, anchor: HTMLElement|null}>} buffer - Array of buffered link data
     * 
     * Creates a flat markdown list:
     * * [Title 1](url1)
     * * [Title 2](url2)
     * * [Title 3](url3)
     * 
     * Each title is auto-inferred using getAutoInferredTitle() priority logic
     */
    function compileAndCopyBufferedLinks(buffer) {
        logFunctionBegin('compileAndCopyBufferedLinks');
        log(`Will compile ${buffer.length} buffered links into markdown list`);
        
        if (buffer.length === 0) {
            log('Buffer is empty, nothing to compile');
            logFunctionEnd('compileAndCopyBufferedLinks');
            return;
        }
        
        // Helper to format a single item with title inference
        const formatBufferItem = (item, asList = true) => {
            const resolvedUrl = cleanUrl(item.url) || item.url;
            if (resolvedUrl !== item.url) {
                log(`Sanitized buffered URL: "${resolvedUrl}"`);
            }

            // Domain-specific output supersedes the preferred title format. For an Amazon product on
            // the current page, emit the full details block (a bullet list that fits both single-copy
            // and multi-item list output). Anchors to OTHER products fall through to the title — their
            // details are not present in the current DOM.
            if (shouldEmitAmazonProductBlock(resolvedUrl, !item.anchor)) {
                const amazonData = getAmazonProductData(resolvedUrl);
                const amazonBlock = amazonData ? buildAmazonProductMarkdown(amazonData, resolvedUrl) : null;
                if (amazonBlock) {
                    log('Buffered item is an Amazon product on the current page; using details block');
                    return amazonBlock;
                }
            }

            const titleSourceUrl = item.url || resolvedUrl;
            const title = getAutoInferredTitle(item.anchor, titleSourceUrl);
            if (!title) {
                try {
                    const url = new URL(resolvedUrl);
                    const fallbackTitle = url.hostname || 'Link';
                    return asList ? `* [${fallbackTitle}](${url.href})` : `[${fallbackTitle}](${url.href})`;
                } catch (e) {
                    return asList ? `* [Link](${resolvedUrl})` : `[Link](${resolvedUrl})`;
                }
            }
            return asList ? `* [${title}](${resolvedUrl})` : `[${title}](${resolvedUrl})`;
        };
        
        // Special case: single link - no list formatting
        if (buffer.length === 1) {
            log('Buffer contains single link, skipping list formatting');
            const fullMarkdown = formatBufferItem(buffer[0], false);
            log(`Did compile single link markdown (${fullMarkdown.length} characters):`);
            log(fullMarkdown);
            
            try {
                GM_setClipboard(fullMarkdown, 'text/plain');
                log('Did copy to clipboard');
                showNotification(`Copied link to clipboard`);
                log(`Did show notification for 1 link`);
                const captureItem = buffer[0];
                const captureResolvedUrl = cleanUrl(captureItem.url) || captureItem.url;
                maybeCaptureSources({
                    originalUrl: (captureItem.anchor && captureItem.anchor.href) ? captureItem.anchor.href : captureItem.url,
                    format: shouldEmitAmazonProductBlock(captureResolvedUrl, !captureItem.anchor)
                        ? 'amazon product'
                        : getAltZOption(altZTitlePreference).label.toLowerCase(),
                    output: fullMarkdown
                });
            } catch (error) {
                logError(`Failed to copy to clipboard: ${error}`);
                showNotification(`Failed to copy link - check console for errors`);
            }
        } else {
            // Build markdown list for multiple links
            log('Will infer titles and build markdown list');
            const markdownLines = buffer.map((item, index) => {
                log(`Processing buffered link ${index + 1}/${buffer.length}: ${item.url}`);
                return formatBufferItem(item, true);
            });
            
            // Join all lines with newlines
            const fullMarkdown = markdownLines.join('\n');
            log(`Did compile full markdown list (${fullMarkdown.length} characters):`);
            log(fullMarkdown);
            
            // Copy to clipboard
            log('Will copy markdown list to clipboard');
            try {
                GM_setClipboard(fullMarkdown, 'text/plain');
                log('Did copy to clipboard');
                
                // Show notification with count
                showNotification(`Copied ${buffer.length} links to clipboard`);
                log(`Did show notification for ${buffer.length} links`);
                maybeCaptureSources({
                    originalUrl: (typeof window !== 'undefined' && window.location && window.location.href) || '',
                    format: `${getAltZOption(altZTitlePreference).label.toLowerCase()} (x${buffer.length})`,
                    output: fullMarkdown
                });
            } catch (error) {
                logError(`Failed to copy to clipboard: ${error}`);
                showNotification(`Failed to copy ${buffer.length} links - check console for errors`);
            }
        }
        
        logFunctionEnd('compileAndCopyBufferedLinks');
    }

    // ============================================================================
    // MARKDOWN GENERATION AND CLIPBOARD
    // ============================================================================

    /**
     * Creates markdown-formatted link: [title](url)
     * Standard markdown link syntax used by GitHub, Reddit, Stack Overflow, etc.
     * @param {string} title - The link text/title
     * @param {string} url - The URL to link to (assumed to be already validated)
     * @returns {string} Markdown-formatted link
     * 
     * Template literal (backticks): Allows ${} interpolation for embedding expressions
     * Markdown link syntax reference: https://www.markdownguide.org/basic-syntax/#links
     * Parameter types: Both strings
     * Return type: string
     * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
     * 
     * Note: URL should be validated with validateUrl() before calling this function
     */
    function createMarkdown(title, url) {
        logFunctionBegin('createMarkdown');
        log(`Will create markdown with title: "${title}", url: "${url}"`);
        const normalizedTitle = normalizeTitleForUrl(title, url);
        const finalTitle = normalizedTitle || title;
        
        // Template literal creates string with embedded title and url values
        // Type: string
        const markdown = `[${finalTitle}](${url})`;
        
        log(`Did create markdown: "${markdown}"`);
        logFunctionEnd('createMarkdown');
        return markdown;
    }

    /**
     * Copies markdown link to system clipboard using ViolentMonkey API
     * @param {string} markdown - The markdown string to copy
     * @param {string} title - The title (for logging)
     * @param {string} url - The URL (for logging)
     * 
     * VIOLENTMONKEY API: GM_setClipboard
     * - Privileged API requiring @grant GM_setClipboard in metadata block
     * - Writes text to system clipboard (works across all platforms)
     * - Signature: GM_setClipboard(data: string, type?: string)
     * - Type parameter defaults to 'text/plain'
     * - Unlike navigator.clipboard.writeText(), works without user gesture requirement
     * 
     * Why not use Clipboard API? Navigator.clipboard.writeText() requires:
     * 1. Secure context (HTTPS)
     * 2. Recent user interaction (within ~5 seconds)
     * 3. Clipboard permission granted
     * GM_setClipboard bypasses these restrictions via browser extension privileges
     * 
     * Parameter types: All strings
     * Return type: void (undefined)
     * Reference: https://violentmonkey.github.io/api/gm/#gm_setclipboard
     */
    function copyToClipboard(markdown, title, url, captureContext) {
        logFunctionBegin('copyToClipboard');
        log(`Will copy to clipboard: "${markdown}"`);
        
        try {
            // GM_setClipboard is a privileged ViolentMonkey API
            // Requires @grant GM_setClipboard in metadata block
            // Type: void (returns undefined)
            GM_setClipboard(markdown, 'text/plain');
            log('Did copy to clipboard successfully');
            log(`  Title: ${title}`);
            log(`  URL: ${url}`);
            log(`  Markdown: ${markdown}`);
            
            log('Will show notification');
            showNotification('Markdown link copied to clipboard!');
            log('Did show notification');
            const captureCtx = captureContext || {};
            maybeCaptureSources({
                originalUrl: captureCtx.originalUrl || url,
                format: captureCtx.format || 'link',
                output: markdown
            });
        } catch (error) {
            // Type: Error object
            // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
            log(`ERROR: Failed to copy to clipboard: ${error}`);
            console.error(`${logBase}: Failed to copy to clipboard:`, error);
            alert('Failed to copy to clipboard. Check console for details.');
        }
        
        logFunctionEnd('copyToClipboard');
    }

    /**
     * Extracts all links from the page and converts them to markdown format (flat list)
     * @returns {string} All links as markdown, one per line
     * 
     * Type returned: string
     */
    function extractAllLinksFlat() {
        logFunctionBegin('extractAllLinksFlat');
        log('Will extract all anchor elements from page');
        
        const anchors = document.querySelectorAll('a[href]');
        log(`Found ${anchors.length} anchor elements`);
        
        const markdownLinks = [];
        
        anchors.forEach((anchor, index) => {
            const href = anchor.href;
            if (!href || href === '#' || href.startsWith('javascript:')) {
                log(`Skipping anchor ${index}: invalid href`);
                return;
            }
            
            // Clean the URL
            const cleanedUrl = cleanUrl(href);
            
            // Get link text
            const text = getLinkText(anchor) || cleanedUrl;
            
            // Create markdown link
            const markdown = createMarkdown(text, cleanedUrl);
            markdownLinks.push(markdown);
            log(`Added link ${index}: ${markdown}`);
        });
        
        const result = markdownLinks.join('\n');
        log(`Generated ${markdownLinks.length} markdown links`);
        logFunctionEnd('extractAllLinksFlat');
        return result;
    }

    /**
     * Extracts all links from the page and converts them to markdown format (hierarchical)
     * Preserves HTML structure with indentation
     * @returns {string} All links as markdown with indentation
     * 
     * Type returned: string
     */
    function extractAllLinksHierarchical() {
        logFunctionBegin('extractAllLinksHierarchical');
        log('Will extract all anchor elements from page with hierarchy');
        
        const anchors = document.querySelectorAll('a[href]');
        log(`Found ${anchors.length} anchor elements`);
        
        const markdownLinks = [];
        
        anchors.forEach((anchor, index) => {
            const href = anchor.href;
            if (!href || href === '#' || href.startsWith('javascript:')) {
                log(`Skipping anchor ${index}: invalid href`);
                return;
            }
            
            // Calculate depth by counting parent elements
            let depth = 0;
            let element = anchor.parentElement;
            while (element && element !== document.body) {
                depth++;
                element = element.parentElement;
            }
            
            // Create indentation (2 spaces per level)
            const indent = '  '.repeat(Math.min(depth, 10)); // Cap at 10 levels
            
            // Clean the URL
            const cleanedUrl = cleanUrl(href);
            
            // Get link text
            const text = getLinkText(anchor) || cleanedUrl;
            
            // Create markdown link with indentation
            const markdown = `${indent}- ${createMarkdown(text, cleanedUrl)}`;
            markdownLinks.push(markdown);
            log(`Added link ${index} at depth ${depth}: ${markdown}`);
        });
        
        const result = markdownLinks.join('\n');
        log(`Generated ${markdownLinks.length} hierarchical markdown links`);
        logFunctionEnd('extractAllLinksHierarchical');
        return result;
    }

    /**
     * Displays temporary success notification to user
     * Creates a fixed-position overlay that auto-dismisses after 3 seconds
     * @param {string} message - The message to display
     * 
     * Creates ephemeral DOM element that doesn't require cleanup tracking
     * Parameter type: string
     * Return type: void (undefined)
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
     */
    function showNotification(message) {
        logFunctionBegin('showNotification');
        log(`Will create notification with message: "${message}"`);
        
        // Type: HTMLDivElement
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement
        const notification = document.createElement('div');
        
        // textContent is safe from XSS attacks (doesn't interpret HTML)
        // Type: string (textContent property always holds string value)
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
        notification.textContent = message;
        
        // Inline styles for notification overlay
        // Using fixed position to stay visible during page scroll
        // High z-index (999999) to appear above most page content
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 999999;
            font-family: sans-serif;
            font-size: 14px;
            white-space: pre-line;
            animation: mdLinkerFadeIn 0.3s, mdLinkerFadeOut 0.3s 2.7s;
        `;

        log('Will append notification to body');
        // appendChild returns the appended node, but we don't use it
        // Type: void
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
        document.body.appendChild(notification);
        // Track as the active notification so appendNotificationLine() can add a 2nd line later.
        activeNotification = notification;
        log('Did append notification to body');

        log('Will schedule notification removal in 3000ms');
        // setTimeout schedules function execution after delay
        // Arrow function captures notification variable from closure
        // Type: number (setTimeout returns a timeout ID, unused here)
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
        setTimeout(() => {
            log('Will remove notification');
            // remove() returns undefined
            // Type: void
            // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/remove
            notification.remove();
            if (activeNotification === notification) {
                activeNotification = null;
            }
            log('Did remove notification');
        }, 3000);

        logFunctionEnd('showNotification');
    }

    /**
     * Appends a second line to the currently visible notification (used to confirm a capture save).
     * Falls back to a fresh notification if the previous one has already faded out.
     * @param {string} text - Line to append
     */
    function appendNotificationLine(text) {
        try {
            if (activeNotification && activeNotification.isConnected) {
                activeNotification.textContent = `${activeNotification.textContent}\n${text}`;
            } else {
                showNotification(text);
            }
        } catch (error) {
            /* noop — feedback must never throw */
        }
    }

    /**
     * Builds a filesystem-safe slug for non-product pages: "<host>_<path>".
     * @param {string} url - Page URL
     * @returns {string} Slug (no path separators), capped in length
     */
    function buildCaptureSlug(url) {
        try {
            const parsed = new URL(url);
            const host = parsed.hostname.replace(/[^A-Za-z0-9.-]/g, '_');
            const path = parsed.pathname.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'index';
            return `${host}_${path}`.slice(0, 120);
        } catch (error) {
            return 'page';
        }
    }

    /**
     * Compact local timestamp for capture filenames: YYYYMMDDHHMMSS (matches `date +%Y%m%d%H%M%S`).
     * @returns {string}
     */
    function captureTimestamp() {
        const now = new Date();
        const pad = (value) => String(value).padStart(2, '0');
        return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    }

    /**
     * When capture mode is "html & logs", POSTs the live page source + session logs to the local
     * capture server (scripts/source_capture) AFTER a clipboard copy. Fails gracefully (just a log
     * line) when the server is unreachable; appends a 2nd notification line on success.
     *
     * The captured HTML is prefixed with an HTML comment recording the raw clicked URL (unstripped),
     * the format used, and the exact clipboard output. Files are timestamped so captures accumulate
     * into an archive rather than overwriting.
     *
     * Naming: product pages -> sources/products/<asin>_<ts>.html + logs/<asin>_<ts>.log (asin via
     * the Amazon toolkit); other pages -> sources/other/<host-slug>_<ts>.* .
     *
     * @param {{originalUrl?: string, format?: string, output?: string}} [context]
     *   - originalUrl: the raw URL of whatever was clicked (NOT stripped); defaults to the page URL
     *   - format: the menu item label / preference / domain format that produced the output
     *   - output: the exact text placed on the clipboard
     */
    function maybeCaptureSources(context) {
        if (captureMode !== 'html_logs') {
            return;
        }
        logFunctionBegin('maybeCaptureSources');
        const sourceCapture = (typeof window !== 'undefined' && window.SourceCapture) ? window.SourceCapture : null;
        if (!sourceCapture || typeof sourceCapture.capture !== 'function') {
            log('SourceCapture unavailable, skipping capture');
            logFunctionEnd('maybeCaptureSources');
            return;
        }

        const ctx = context || {};
        const pageUrl = (typeof window !== 'undefined' && window.location && window.location.href) || '';
        const originalUrl = ctx.originalUrl || pageUrl;
        const format = ctx.format || '';
        const output = ctx.output || '';

        // Name by the PAGE's ASIN (the HTML we're saving is the current page), timestamped.
        let asin = null;
        const toolkit = getAmazonToolkit();
        if (toolkit && toolkit.Extractors && typeof toolkit.Extractors.extractProductASIN === 'function') {
            try {
                asin = toolkit.Extractors.extractProductASIN(document, pageUrl);
            } catch (error) {
                /* noop — ASIN is best-effort */
            }
        }

        let pageType;
        let baseName;
        if (asin) {
            pageType = 'products';
            baseName = asin;
        } else {
            pageType = 'other';
            baseName = buildCaptureSlug(pageUrl);
        }

        const timestamp = captureTimestamp();
        const htmlPath = `sources/${pageType}/${baseName}_${timestamp}.html`;
        const logsPath = `logs/${baseName}_${timestamp}.log`;

        // Prepend a metadata comment: raw clicked URL, the format, then the clipboard output. Guard
        // against an embedded "-->" prematurely closing the comment.
        const commentBody = `* original_url: ${originalUrl}\n* format: ${format}\n\n${output}`.replace(/-->/g, '-- >');
        const html = `<!--\n${commentBody}\n-->\n<!DOCTYPE html>\n${document.documentElement.outerHTML}`;
        const logs = sourceCapture.logBuffer ? sourceCapture.logBuffer.getText() : '';

        log(`Will capture page source + logs -> ${htmlPath}, ${logsPath}`);
        sourceCapture.capture({
            userscript: 'markdown_linker',
            files: [
                { path: htmlPath, content: html },
                { path: logsPath, content: logs }
            ],
            onResult: (result) => {
                if (result && result.ok) {
                    log(`Capture saved: ${htmlPath} + ${logsPath}`);
                    appendNotificationLine('Saved page source + logs to disk');
                } else {
                    const firstError = result && result.results && result.results[0] && result.results[0].error
                        ? result.results[0].error
                        : 'unknown';
                    log(`Capture not saved (server unavailable?): ${firstError}`);
                }
            }
        });
        logFunctionEnd('maybeCaptureSources');
    }

    // Add CSS keyframe animations for notification fade in/out and click feedback
    // Must be injected into document <head> to apply to dynamically created elements
    // Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes
    log('Will add CSS keyframe animations');
    
    // Type: HTMLStyleElement
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLStyleElement
    const style = document.createElement('style');
    
    // textContent for <style> elements is interpreted as CSS
    // Type: string
    style.textContent = `
        @keyframes mdLinkerFadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mdLinkerFadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes mdLinkerClickPulse {
            0% { 
                transform: scale(1);
                opacity: 1;
                box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
            }
            50% {
                box-shadow: 0 0 0 12px rgba(76, 175, 80, 0.3);
            }
            100% { 
                transform: scale(1.4);
                opacity: 0;
                box-shadow: 0 0 0 20px rgba(76, 175, 80, 0);
            }
        }
    `;
    
    // appendChild adds style element to <head>, making animations available globally
    // Type: void
    document.head.appendChild(style);
    log('Did add CSS keyframe animations');

    // ============================================================================
    // CLICK FEEDBACK ANIMATION
    // ============================================================================

    /**
     * Displays a visual click feedback animation at the cursor position
     * Used during Alt+Z+Click to provide immediate visual feedback
     * Creates a brief pulse animation that expands and fades out
     * @param {number} x - X coordinate for animation center (clientX from event)
     * @param {number} y - Y coordinate for animation center (clientY from event)
     * 
     * Animation features:
     * - Green circular pulse that expands outward
     * - Box shadow grows and fades
     * - Total duration 600ms for quick feedback without being distracting
     * - Fixed positioning so it persists across page scroll
     * 
     * Parameter types:
     * - x: number (pixel coordinate from MouseEvent.clientX)
     * - y: number (pixel coordinate from MouseEvent.clientY)
     * Return type: void (undefined)
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
     * Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes
     */
    function showClickFeedback(x, y) {
        logFunctionBegin('showClickFeedback');
        log(`Will create click feedback animation at position (${x}, ${y})`);
        
        // Type: HTMLDivElement
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement
        const feedback = document.createElement('div');
        
        // Position at cursor, center the element by offsetting by half its size
        // Fixed positioning means position is relative to viewport, not document
        // z-index 999998 places it below the menu (999999) but above page content
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
        feedback.style.cssText = `
            position: fixed;
            left: ${x - 12}px;
            top: ${y - 12}px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(76, 175, 80, 0.2);
            border: 2px solid #4CAF50;
            z-index: 999998;
            pointer-events: none;
            animation: mdLinkerClickPulse 0.6s ease-out forwards;
        `;
        
        log('Will append click feedback to body');
        // appendChild adds element to DOM, animation begins immediately
        // Type: void
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
        document.body.appendChild(feedback);
        log('Did append click feedback to body');
        
        log('Will schedule click feedback removal after animation completes');
        // setTimeout waits for animation duration (600ms) to complete before removing
        // This prevents memory buildup from persistent DOM elements
        // Type: number (setTimeout returns a timeout ID, unused here)
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
        setTimeout(() => {
            log('Will remove click feedback element');
            // remove() detaches element from DOM
            // Type: void
            // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/remove
            feedback.remove();
            log('Did remove click feedback element');
        }, 600);
        
        logFunctionEnd('showClickFeedback');
    }

    // ============================================================================
    // AMAZON PRODUCT DETAILS (domain-specific menu section)
    // ============================================================================

    /**
     * Returns true when the URL targets an Amazon product page (/dp/{ASIN} or /gp/product/{ASIN}).
     * Prefers the toolkit's classifier; falls back to a local regex if the toolkit is unavailable.
     * @param {string} url - URL to test
     * @returns {boolean}
     * Reference: common/amazon_toolkit/helpers/validation_helpers.js (isAmazonProductURL)
     */
    function isAmazonProductUrl(url) {
        if (!url) return false;
        const toolkit = getAmazonToolkit();
        const fn = toolkit && toolkit.Helpers ? toolkit.Helpers.isAmazonProductURL : null;
        if (typeof fn === 'function') {
            try {
                return !!fn(url);
            } catch (error) {
                // fall through to local heuristic
            }
        }
        return /amazon\.[a-z.]+\/(?:[^/]+\/)?(?:dp|gp\/product)\/[A-Z0-9]{10}/i.test(url);
    }

    /**
     * True when `url`'s product ASIN matches the CURRENT page's product ASIN. The details block is
     * built from the live `document`, so it is only valid for the product we are actually viewing —
     * not for an anchor that links to a different product (which would mix that ASIN with the
     * current page's price/variants).
     * @param {string} url - Target URL to compare against the current page
     * @returns {boolean}
     */
    function amazonAsinMatchesCurrentPage(url) {
        const toolkit = getAmazonToolkit();
        const extractors = toolkit && toolkit.Extractors;
        if (!extractors || typeof extractors.extractProductASIN !== 'function') {
            return false;
        }
        const pageUrl = (typeof window !== 'undefined' && window.location && window.location.href) || '';
        let targetAsin = null;
        let pageAsin = null;
        try { targetAsin = extractors.extractProductASIN(document, url); } catch (error) { /* noop */ }
        try { pageAsin = extractors.extractProductASIN(document, pageUrl); } catch (error) { /* noop */ }
        return !!targetAsin && targetAsin === pageAsin;
    }

    /**
     * Whether to emit the Amazon details block for `url`. Allowed for a page-level action (no
     * anchor) on an Amazon product — `document` is that product — or for an anchor whose ASIN
     * matches the current page (e.g. the product's own title/image link).
     * @param {string} url - Target (cleaned) URL
     * @param {boolean} isPageAction - True when triggered on the page itself (not an anchor elsewhere)
     * @returns {boolean}
     */
    function shouldEmitAmazonProductBlock(url, isPageAction) {
        if (!url || !isAmazonProductUrl(url)) {
            return false;
        }
        if (isPageAction) {
            return true;
        }
        return amazonAsinMatchesCurrentPage(url);
    }

    // Cache the last extraction so re-opening the menu on the same URL does not re-walk the DOM.
    let amazonProductCacheKey = null;
    let amazonProductCacheValue = null;

    /**
     * Extracts full Amazon product data from the live document via the toolkit orchestrator.
     * Result is cached per URL.
     * @param {string} url - Captured (cleaned) product URL
     * @returns {object|null} Toolkit product-data object, or null when unavailable
     * Reference: common/amazon_toolkit/extractors/product_extractor.js (extractProductData)
     */
    function getAmazonProductData(url) {
        logFunctionBegin('getAmazonProductData');
        if (!url) {
            logFunctionEnd('getAmazonProductData');
            return null;
        }
        if (amazonProductCacheKey === url && amazonProductCacheValue) {
            log('Using cached Amazon product data');
            logFunctionEnd('getAmazonProductData');
            return amazonProductCacheValue;
        }
        const toolkit = getAmazonToolkit();
        const extractFn = toolkit && toolkit.Extractors ? toolkit.Extractors.extractProductData : null;
        if (typeof extractFn !== 'function') {
            log('Amazon toolkit extractProductData unavailable, skipping product details');
            logFunctionEnd('getAmazonProductData');
            return null;
        }
        let data = null;
        try {
            data = extractFn(document, url);
        } catch (error) {
            logError(`Amazon product extraction failed: ${error}`);
        }
        if (data) {
            amazonProductCacheKey = url;
            amazonProductCacheValue = data;
            log('Extracted Amazon product data');
        } else {
            log('Amazon product extraction returned no data');
        }
        logFunctionEnd('getAmazonProductData');
        return data;
    }

    /**
     * Builds the markdown details block for an Amazon product. Shape:
     *   * [title](url)
     *     * price: $9.99
     *     * delivers: 0d
     *     * rating: 4.4 / 653
     *     * color: Beige-4 Rolls   (one line per variant dimension, named)
     *     * size: 15 yards
     *     * store: [Visit the OK TAPE Store](url)
     * Each detail line is omitted when its underlying field is unavailable.
     * @param {object} productData - Toolkit product-data object
     * @param {string} cleanedUrl - Cleaned product URL to use for the link
     * @returns {string|null} Markdown block, or null when productData is missing
     */
    function buildAmazonProductMarkdown(productData, cleanedUrl) {
        logFunctionBegin('buildAmazonProductMarkdown');
        if (!productData) {
            logFunctionEnd('buildAmazonProductMarkdown');
            return null;
        }
        const title = productData.titleCleaned || productData.title || 'Amazon Product';
        const url = cleanedUrl ||
            (productData.url && (productData.url.originalClean || productData.url.original)) ||
            '';
        const lines = [`* [${title}](${url})`];

        if (productData.price && productData.price.current) {
            lines.push(`  * price: ${productData.price.current}`);
        }
        if (productData.delivery && Number.isFinite(productData.delivery.inDays)) {
            lines.push(`  * delivers: ${productData.delivery.inDays}d`);
        }
        if (productData.rating && productData.rating.value != null) {
            const count = productData.rating.count != null ? ` / ${productData.rating.count}` : '';
            lines.push(`  * rating: ${productData.rating.value}${count}`);
        }
        if (Array.isArray(productData.variants)) {
            // Present known dimensions in a stable, spec-matching order (color, then size); any
            // other dimensions follow in their original DOM order. Supports any number of dimensions.
            const dimensionPriority = { color: 0, size: 1 };
            const orderedVariants = productData.variants
                .map((entry, index) => ({ entry, index }))
                .sort((a, b) => {
                    const pa = dimensionPriority[a.entry.dimension];
                    const pb = dimensionPriority[b.entry.dimension];
                    const ra = pa === undefined ? 100 + a.index : pa;
                    const rb = pb === undefined ? 100 + b.index : pb;
                    return ra - rb;
                })
                .map((wrapped) => wrapped.entry);
            orderedVariants.forEach((entry) => {
                if (entry && entry.dimension && entry.value) {
                    lines.push(`  * ${entry.dimension}: ${entry.value}`);
                }
            });
        }
        if (productData.store && productData.store.url) {
            // The byline is either a brand storefront ("store") or a brand search ("search",
            // e.g. "Brand: ALLOLO"). Label the line by kind so search links aren't mislabeled.
            const isSearch = productData.store.kind === 'search';
            const label = isSearch ? 'search' : 'store';
            const storeName = productData.store.name || (isSearch ? 'Brand' : 'Store');
            lines.push(`  * ${label}: [${storeName}](${productData.store.url})`);
        }

        const markdown = lines.join('\n');
        log(`Built Amazon product markdown (${lines.length} lines)`);
        logFunctionEnd('buildAmazonProductMarkdown');
        return markdown;
    }

    // ============================================================================
    // POPUP MENU UI
    // ============================================================================

    /**
     * Creates and displays context menu with title options
     * Menu appears at cursor position and adapts based on whether target is anchor or page
     * @param {number} x - X coordinate for menu placement (clientX from event)
     * @param {number} y - Y coordinate for menu placement (clientY from event)
     * @param {boolean} isAnchor - True if target is an anchor link, false for page
     * @param {HTMLAnchorElement|null} anchor - The anchor element (if isAnchor is true)
     * 
     * JavaScript boolean: Primitive type with two values: true or false
     * MouseEvent coordinates: clientX/clientY are relative to viewport
     * getBoundingClientRect() used for position adjustment
     * Parameter types:sour
     * - x: number (pixel coordinate from MouseEvent.clientX)
     * - y: number (pixel coordinate from MouseEvent.clientY)
     * - isAnchor: boolean (JavaScript primitive boolean type)
     * - anchor: HTMLAnchorElement | null (DOM element or null)
     * Return type: void (undefined)
     * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
     */
    function createMenu(x, y, isAnchor, anchor = null) {
        logFunctionBegin('createMenu');
        log(`Will create menu at position (${x}, ${y}), isAnchor: ${isAnchor}`);
        
        // Capture the current targetUrl value at menu creation time
        // This prevents issues if the global targetUrl is cleared before menu item is clicked
        //
        // Clean it HERE so this is the single chokepoint for both anchor and page paths: the
        // page-click branches (handleClick / handleContextMenu / handleKeydown) set targetUrl to
        // the raw window.location.href without cleaning, which left long Amazon product URLs
        // (slug path + crid/sprefix/sr/sp_csd tracking) in the menu output. cleanUrl is
        // idempotent, so re-cleaning an already-cleaned anchor URL is a no-op.
        const capturedUrl = cleanUrl(targetUrl) || targetUrl;
        log(`Captured URL for menu (cleaned): "${capturedUrl}"`);

        let youtubeContext = null;
        if (capturedUrl) {
            log('Will evaluate YouTube context for captured URL');
            // Defensive: a YouTube toolkit/extractor failure must never abort core menu creation
            try {
                youtubeContext = getYouTubeContext(capturedUrl);
            } catch (error) {
                logError(`YouTube context evaluation failed (non-fatal): ${error}`);
                youtubeContext = null;
            }
            if (youtubeContext) {
                log('YouTube context detected for menu');
            } else {
                log('No YouTube context available for this URL');
            }
        } else {
            log('No URL captured for menu, skipping YouTube context evaluation');
        }
        
        // Remove any existing menu
        log('Will remove any existing menu');
        removeMenu();
        log('Did remove any existing menu');

        log('Will create menu element');
        
        // Type: HTMLDivElement
        const menu = document.createElement('div');
        
        // Setting ID allows CSS targeting and ensures only one menu exists
        // Type: string (ID attribute value)
        menu.id = 'markdown-linker-menu';
        
        // Template literal with embedded ${x} and ${y} values for positioning
        // Type: string (cssText property holds entire inline style string)
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
        menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: rgba(18, 19, 22, 0.78);
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 14px;
            box-shadow: 0 22px 45px rgba(0, 0, 0, 0.65);
            padding: 6px 0;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 11px;
            min-width: 220px;
            max-width: 520px;
            width: max-content;
            color: #f8f9fa;
            backdrop-filter: blur(26px) saturate(120%);
        `;
        log('Did create menu element');

        log('Will build menu options array');
        
        // Array of option descriptors with optional URL overrides or block copy handlers
        // Type: Array<{label: string, getValue?: () => string|null, getResult?: () => ({title: string, url?: string}), isAllLinks?: boolean}>
        // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
        const options = [];
        const domainSectionOptions = [];
        
        if (isAnchor) {
            log('Is anchor, will get link text');
            const linkText = getLinkText(anchor);
            if (linkText) {
                log(`Did get link text, adding to options: "${linkText}"`);
                options.push({
                    label: 'Link Text',
                    displayValue: linkText,
                    getValue: () => linkText
                });
            } else {
                log('No link text available');
            }
        }

        // Common options for both anchor and page
        log('Will get page title');
        const pageTitle = getPageTitle();
        if (pageTitle) {
            log(`Did get page title, adding to options: "${pageTitle}"`);
            options.push({
                label: 'Page Title',
                displayValue: pageTitle,
                getValue: () => pageTitle
            });
        } else {
            log('No page title available');
        }

        if (capturedUrl) {
            log('Will build URL component title option');
            const urlComponentTitle = getUrlComponentTitle(capturedUrl);
            if (urlComponentTitle) {
                log(`Did build URL component title, adding to options: "${urlComponentTitle}"`);
                options.push({
                    label: 'URL (forward)',
                    displayValue: urlComponentTitle,
                    getValue: () => urlComponentTitle
                });
            } else {
                log('URL component title unavailable');
            }

            const urlComponentTitleLRU = getUrlComponentTitle(capturedUrl, { direction: 'reverse' });
            if (urlComponentTitleLRU) {
                log(`Did build reverse URL component title, adding to options: "${urlComponentTitleLRU}"`);
                options.push({
                    label: 'URL (reverse)',
                    displayValue: urlComponentTitleLRU,
                    getValue: () => urlComponentTitleLRU
                });
            } else {
                log('Reverse URL component title unavailable');
            }
        }

        if (youtubeContext) {
            log('YouTube context available, will append specialized menu options');
            const youtubeOptions = buildYouTubeMenuOptions(youtubeContext, capturedUrl);
            if (youtubeOptions.length > 0) {
                domainSectionOptions.push({
                    isSectionHeader: true,
                    label: 'YouTube'
                });
                youtubeOptions.forEach((optionDescriptor) => {
                    log(`Queueing YouTube option: ${optionDescriptor.label}`);
                    domainSectionOptions.push(optionDescriptor);
                });
            }
        }

        if (shouldEmitAmazonProductBlock(capturedUrl, !isAnchor)) {
            log('Amazon product detected for current page, will build product details option');
            let amazonProductData = null;
            try {
                amazonProductData = getAmazonProductData(capturedUrl);
            } catch (error) {
                logError(`Amazon product evaluation failed (non-fatal): ${error}`);
            }
            const amazonBlock = amazonProductData
                ? buildAmazonProductMarkdown(amazonProductData, capturedUrl)
                : null;
            if (amazonBlock) {
                const amazonTitle = amazonProductData.titleCleaned ||
                    amazonProductData.title ||
                    'Product details';
                domainSectionOptions.push({
                    isSectionHeader: true,
                    label: 'Amazon'
                });
                // Displayed label is just the product title; the clipboard value is the full
                // markdown details block. isAllLinks copies getValue() verbatim (no link re-wrap).
                domainSectionOptions.push({
                    label: 'Amazon Product',
                    displayValue: amazonTitle,
                    getValue: () => amazonBlock,
                    isAllLinks: true
                });
                log('Queued Amazon Product details option');
            } else {
                log('No Amazon product details available for this URL');
            }
        }

        if (!isAnchor && !youtubeContext) {
            log('Not anchor, will get meta description');
            const metaDesc = getMetaDescription();
            if (metaDesc) {
                log(`Did get meta description, adding to options: "${metaDesc}"`);
                options.push({
                    label: 'Meta Description',
                    displayValue: metaDesc,
                    getValue: () => metaDesc
                });
            } else {
                log('No meta description available');
            }
        }

        if (domainSectionOptions.length > 0) {
            log(`Adding ${domainSectionOptions.length} domain-specific entries (including headers)`);
            domainSectionOptions.forEach((optionDescriptor) => options.push(optionDescriptor));
        }
        
        // Add separator and "All Links" options at the bottom
        log('Adding extract all links options');
        options.push({ 
            label: 'All Links (flat)', 
            displayValue: 'Single-level list',
            getValue: extractAllLinksFlat,
            isAllLinks: true,
            isSeparator: true  // Add visual separator above this item
        });
        options.push({ 
            label: 'All Links (tree)', 
            displayValue: 'Preserves heading depth',
            getValue: extractAllLinksHierarchical,
            isAllLinks: true 
        });
        
        log(`Did build ${options.length} menu options`);

        // Create menu items
        log('Will create menu items');
        options.forEach((option, index) => {
            const debugLabel = option.displayValue ? `${option.label}: ${option.displayValue}` : option.label;
            log(`Creating menu item ${index}: "${debugLabel}"`);

            if (option.isSectionHeader) {
                const headerWrapper = document.createElement('div');
                headerWrapper.style.cssText = `
                    margin-top: 12px;
                    padding: 0 12px;
                `;

                const headerLine = document.createElement('div');
                headerLine.style.cssText = `
                    border-top: 1px solid rgba(255, 255, 255, 0.55);
                    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.7);
                `;

                const headerLabel = document.createElement('div');
                headerLabel.textContent = option.label;
                headerLabel.style.cssText = `
                    margin-top: 6px;
                    padding: 4px 2px 2px;
                    text-transform: uppercase;
                    letter-spacing: 0.18em;
                    font-size: 10px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.85);
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
                `;

                headerWrapper.appendChild(headerLine);
                headerWrapper.appendChild(headerLabel);
                menu.appendChild(headerWrapper);
                return;
            }

            const item = document.createElement('div');
            item.style.cssText = `
                padding: 8px 14px;
                cursor: pointer;
                white-space: normal;
                line-height: 1.4;
                word-break: break-word;
                color: inherit;
                background-color: transparent;
                transition: background-color 120ms ease;
                ${option.isSeparator ? 'border-top: 2px solid rgba(255,255,255,0.65); box-shadow: 0 -1px 0 rgba(0,0,0,0.65); margin-top: 12px; padding-top: 18px;' : ''}
            `;

            const labelElement = document.createElement('div');
            if (option.displayValue) {
                labelElement.textContent = option.label;
                labelElement.style.cssText = `
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: rgba(248, 249, 250, 0.65);
                    margin-bottom: 2px;
                `;
                const valueElement = document.createElement('div');
                valueElement.textContent = option.displayValue;
                valueElement.style.cssText = `
                    font-size: 12px;
                    color: #f8f9fa;
                `;
                item.appendChild(labelElement);
                item.appendChild(valueElement);
            } else {
                labelElement.textContent = option.label;
                labelElement.style.cssText = `
                    font-size: 12px;
                    color: #f8f9fa;
                `;
                item.appendChild(labelElement);
            }

            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
            });

            item.addEventListener('click', () => {
                log(`Menu item clicked: "${option.label}"`);

                // Check if this is an "All Links" option
                if (option.isAllLinks) {
                    log('All Links option selected, will extract all links');
                    const allLinksMarkdown = option.getValue ? option.getValue() : null;
                    
                    if (allLinksMarkdown) {
                        log(`Generated all links markdown (${allLinksMarkdown.length} characters)`);
                        log('Will copy to clipboard');
                        try {
                            GM_setClipboard(allLinksMarkdown, 'text/plain');
                            log('Did copy all links to clipboard');
                            showNotification('All page links copied to clipboard!');
                            maybeCaptureSources({
                                originalUrl: (isAnchor && anchor)
                                    ? (anchor.href || capturedUrl)
                                    : ((typeof window !== 'undefined' && window.location && window.location.href) || capturedUrl),
                                format: (option.label || '').toLowerCase(),
                                output: allLinksMarkdown
                            });
                        } catch (error) {
                            logError(`Failed to copy all links: ${error}`);
                            alert('Failed to copy to clipboard. Check console for details.');
                        }
                    } else {
                        logError('Failed to generate all links markdown');
                    }
                } else {
                    // Regular single link option with optional URL override
                    log('Will resolve title/value for option');
                    const resolved = option.getResult ? option.getResult() : (option.getValue ? option.getValue() : null);
                    let title = resolved;
                    let resolvedUrl = capturedUrl;

                    if (resolved && typeof resolved === 'object') {
                        title = resolved.title || null;
                        resolvedUrl = resolved.url || capturedUrl;
                    }

                    log(`Resolved title: ${title ? `"${title}"` : 'null'}`);
                    log(`Resolved URL: ${resolvedUrl || 'null'}`);

                    if (title && resolvedUrl) {
                        log(`Will create markdown with title: "${title}", url: "${resolvedUrl}"`);
                        const markdown = createMarkdown(title, resolvedUrl);
                        
                        if (markdown) {
                            log(`Did create markdown: "${markdown}"`);
                            log('Will copy to clipboard');
                            copyToClipboard(markdown, title, resolvedUrl, {
                                originalUrl: (isAnchor && anchor)
                                    ? (anchor.href || resolvedUrl)
                                    : ((typeof window !== 'undefined' && window.location && window.location.href) || resolvedUrl),
                                format: (option.label || '').toLowerCase()
                            });
                            log('Did copy to clipboard');
                        } else {
                            logError('Markdown creation failed (returned null)');
                        }
                    } else {
                        logWarn('Menu option did not provide both title and URL');
                    }
                }
                
                log('Will remove menu');
                removeMenu();
            });

            menu.appendChild(item);
        });
        log('Did build all menu items');

        log('Will append menu to body');
        document.body.appendChild(menu);
        currentMenu = menu;  // Store reference for later removal
        log('Did append menu to body');

        // Position adjustment to keep menu visible on screen
        // getBoundingClientRect() returns element's size and position relative to viewport
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
        log('Will adjust menu position to stay on screen');
        const rect = menu.getBoundingClientRect();
        log(`Menu bounds: right=${rect.right}, bottom=${rect.bottom}, window: width=${window.innerWidth}, height=${window.innerHeight}`);
        
        // If menu extends past right edge, shift it left
        if (rect.right > window.innerWidth) {
            const newLeft = window.innerWidth - rect.width - 10;
            log(`Menu extends past right edge, adjusting left to ${newLeft}px`);
            menu.style.left = newLeft + 'px';
        }
        // If menu extends past bottom edge, shift it up
        if (rect.bottom > window.innerHeight) {
            const newTop = window.innerHeight - rect.height - 10;
            log(`Menu extends past bottom edge, adjusting top to ${newTop}px`);
            menu.style.top = newTop + 'px';
        }
        log('Did adjust menu position');

        // setTimeout with 0ms delay defers execution to next event loop
        // This prevents the current click event from immediately triggering the outside click handler
        // Use capture phase to intercept click before it reaches target elements
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options
        log('Will schedule outside click listener');
        setTimeout(() => {
            // Create handler functions so we can remove them when either one triggers
            menuClickHandler = (event) => {
                // Check if click is outside the menu
                if (currentMenu && !currentMenu.contains(event.target)) {
                    log('Outside click detected, will prevent propagation and remove menu');
                    event.preventDefault();
                    event.stopPropagation();
                    removeMenu();
                } else {
                    log('Click inside menu, allowing propagation');
                }
            };
            
            menuEscapeHandler = (event) => {
                if (event.key === 'Escape') {
                    log('Escape key detected, will remove menu');
                    event.preventDefault();
                    event.stopPropagation();
                    removeMenu();
                }
            };
            
            document.addEventListener('click', menuClickHandler, { capture: true });
            log('Did add outside click listener with event prevention');
            
            document.addEventListener('keydown', menuEscapeHandler, { capture: true });
            log('Did add Escape key listener');
        }, 0);
        
        logFunctionEnd('createMenu');
    }

    /**
     * Removes currently displayed menu and clears target state
     * Called when user selects an option, clicks outside, or cancels
     */
    /**
     * Removes currently displayed menu and clears target state
     * Called when user selects an option, clicks outside, or cancels
     */
    function removeMenu() {
        logFunctionBegin('removeMenu');
        
        // Remove event listeners first
        if (menuClickHandler) {
            log('Removing click handler');
            document.removeEventListener('click', menuClickHandler, true);
            menuClickHandler = null;
        }
        
        if (menuEscapeHandler) {
            log('Removing escape handler');
            document.removeEventListener('keydown', menuEscapeHandler, true);
            menuEscapeHandler = null;
        }
        
        if (currentMenu) {
            log('Menu exists, will remove it');
            currentMenu.remove();  // Removes element from DOM
            currentMenu = null;
            log('Did remove menu');
        } else {
            log('No menu to remove');
        }
        
        log('Will clear target variables');
        targetElement = null;
        targetUrl = null;
        log('Did clear target variables');
        
        logFunctionEnd('removeMenu');
    }

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    /**
     * Deep-clones a triggers config (so defaults are never mutated).
     */
    function cloneTriggers(source) {
        const out = {};
        Object.keys(source || {}).forEach((action) => {
            out[action] = (source[action] || []).map((binding) => ({
                modifiers: Object.assign({}, binding.modifiers),
                keys: (binding.keys || []).slice(),
                requiresClick: !!binding.requiresClick
            }));
        });
        return out;
    }

    /**
     * Snapshots the modifier state from a DOM event.
     */
    function bindingState(event) {
        return {
            meta: !!event.metaKey,
            ctrl: !!event.ctrlKey,
            alt: !!event.altKey,
            shift: !!event.shiftKey
        };
    }

    /**
     * True if a binding requires at least one key or modifier (never matches "no input").
     */
    function bindingHasInput(binding) {
        const m = binding.modifiers || {};
        return (binding.keys && binding.keys.length > 0) || !!(m.meta || m.ctrl || m.alt || m.shift);
    }

    /**
     * Whether the given modifier state + currently-pressed keys satisfy a binding (exact modifier
     * match; all of the binding's regular keys must be held).
     */
    function matchesBinding(binding, state) {
        if (!binding || !bindingHasInput(binding)) {
            return false;
        }
        const m = binding.modifiers || {};
        if (!!m.meta !== state.meta || !!m.ctrl !== state.ctrl || !!m.alt !== state.alt || !!m.shift !== state.shift) {
            return false;
        }
        const keys = binding.keys || [];
        for (let index = 0; index < keys.length; index += 1) {
            if (!pressedKeys.has(keys[index])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Does any click-type binding for `actionName` match the current state? (used on click events)
     */
    function actionMatchesClick(actionName, state) {
        const list = triggers[actionName] || [];
        return list.some((binding) => binding && binding.requiresClick && matchesBinding(binding, state));
    }

    /**
     * Did the just-pressed key complete a keyboard-type binding for `actionName`? (used on keydown).
     * Requiring `justPressedKey` to be part of the binding avoids re-firing on unrelated keydowns.
     */
    function keyboardActionTriggered(actionName, state, justPressedKey) {
        const list = triggers[actionName] || [];
        return list.some((binding) =>
            binding && !binding.requiresClick &&
            (binding.keys || []).indexOf(justPressedKey) !== -1 &&
            matchesBinding(binding, state));
    }

    /**
     * Loads trigger bindings from storage, falling back to defaults. (Settings UI writes them.)
     */
    function loadTriggers() {
        if (typeof GM_getValue === 'function') {
            try {
                const stored = GM_getValue(TRIGGERS_PREF_KEY, null);
                if (stored) {
                    const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
                    if (parsed && typeof parsed === 'object') {
                        return cloneTriggers(parsed);
                    }
                }
            } catch (error) {
                logWarn(`Failed to load triggers, using defaults: ${error}`);
            }
        }
        return cloneTriggers(DEFAULT_TRIGGERS);
    }

    /**
     * Handles left-click events with Alt modifier
     * Intercepts clicks on anchors or page to show markdown menu
     * @param {MouseEvent} event - The click event
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
     */
    function handleClick(event) {
        logFunctionBegin('handleClick');
        log('Click event received');
        
        // Evaluate configurable click triggers (menu vs. buffer/auto-infer).
        const clickState = bindingState(event);
        const menuClick = actionMatchesClick('menu', clickState);
        const bufferClick = actionMatchesClick('inferBuffer', clickState);
        log(`Click: menuTrigger=${menuClick}, bufferTrigger=${bufferClick}, buffer active=${isAltZBufferActive}, buffer size=${altZClickBuffer.length}`);

        if (!menuClick && !bufferClick) {
            log('No click trigger matched, returning');
            logFunctionEnd('handleClick');
            return;
        }

        // Prevent default link navigation and stop event bubbling
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
        log('Will prevent default and stop propagation');
        event.preventDefault();
        event.stopPropagation();
        log('Did prevent default and stop propagation');

        // Buffer (auto-infer) mode when the buffer trigger matched; otherwise open the menu.
        const isAutoInferMode = bufferClick;
        log(`Is auto-infer (buffer) mode: ${isAutoInferMode}`);
        
        // If we just entered auto-infer mode, mark that the buffer is now active
        if (isAutoInferMode && !isAltZBufferActive) {
            isAltZBufferActive = true;
            log('Activated Alt+Z buffer mode');
        }
        // Returns null if no match found
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
        log('Will find closest anchor element');
        const anchor = event.target.closest('a');
        
        if (anchor) {
            log('Found anchor element, will attempt URL extraction');
            targetUrl = extractUrlFromAnchor(anchor, event);
            targetElement = anchor;
            
            // Validate URL immediately after extraction
            if (validateUrl(targetUrl, anchor, event, 'handleClick after extractUrlFromAnchor')) {
                log(`Successfully extracted and validated URL: "${targetUrl}"`);
                // Clean URL to remove tracking parameters
                targetUrl = cleanUrl(targetUrl);
                log(`Cleaned URL: "${targetUrl}"`);
                
                if (isAutoInferMode) {
                    log('In auto-infer mode, will buffer this link');
                    log('Will show click feedback animation');
                    showClickFeedback(event.clientX, event.clientY);
                    log('Did show click feedback animation');
                    
                    altZClickBuffer.push({ url: targetUrl, anchor: anchor });
                    log(`Buffered link #${altZClickBuffer.length}: "${targetUrl}"`);
                } else {
                    log('In normal mode, will create menu for anchor');
                    if (maybeAutoCopySelection(false, targetUrl)) {
                        log('Selection auto-copied; skipping menu for anchor click');
                        logFunctionEnd('handleClick');
                        return;
                    }
                    createMenu(event.clientX, event.clientY, true, anchor);
                }
            } else {
                logError('URL validation failed, using current page URL as fallback');
                targetUrl = window.location.href;
                targetElement = null;
                log(`Set targetUrl to current page: "${targetUrl}"`);
                
                if (isAutoInferMode) {
                    log('In auto-infer mode, will buffer this link (page URL fallback)');
                    log('Will show click feedback animation');
                    showClickFeedback(event.clientX, event.clientY);
                    log('Did show click feedback animation');
                    
                    altZClickBuffer.push({ url: targetUrl, anchor: null });
                    log(`Buffered link #${altZClickBuffer.length}: "${targetUrl}"`);
                } else {
                    log('In normal mode, will create menu for page (fallback)');
                    if (maybeAutoCopySelection(false, targetUrl)) {
                        log('Selection auto-copied; skipping fallback menu');
                        logFunctionEnd('handleClick');
                        return;
                    }
                    createMenu(event.clientX, event.clientY, false);
                }
            }
        } else {
            log('Clicked on page (not an anchor)');
            // window.location.href contains full URL of current page
            // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Location/href
            targetUrl = window.location.href;
            targetElement = null;
            log(`Set targetUrl to current page: "${targetUrl}"`);
            
            if (isAutoInferMode) {
                log('In auto-infer mode, will buffer this link (page URL)');
                log('Will show click feedback animation');
                showClickFeedback(event.clientX, event.clientY);
                log('Did show click feedback animation');
                
                altZClickBuffer.push({ url: targetUrl, anchor: null });
                log(`Buffered link #${altZClickBuffer.length}: "${targetUrl}"`);
            } else {
                log('In normal mode, will create menu for page');
                if (maybeAutoCopySelection(false, targetUrl)) {
                    log('Selection auto-copied; skipping page menu');
                    logFunctionEnd('handleClick');
                    return;
                }
                createMenu(event.clientX, event.clientY, false);
            }
        }
        
        logFunctionEnd('handleClick');
    }

    /**
     * Handles right-click (context menu) events with Alt modifier
     * Similar to handleClick but for right-click interactions
     * @param {MouseEvent} event - The contextmenu event
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
     */
    function handleContextMenu(event) {
        logFunctionBegin('handleContextMenu');
        log('Context menu (right-click) event received');
        
        const contextState = bindingState(event);
        if (!actionMatchesClick('menu', contextState)) {
            log('No menu trigger matched on right-click, returning');
            logFunctionEnd('handleContextMenu');
            return;
        }

        // Prevent browser's default context menu from appearing
        log('Will prevent default and stop propagation');
        event.preventDefault();
        event.stopPropagation();
        log('Did prevent default and stop propagation');

        log('Will find closest anchor element');
        const anchor = event.target.closest('a');
        
        if (anchor) {
            log('Found anchor element, will attempt URL extraction');
            targetUrl = extractUrlFromAnchor(anchor, event);
            targetElement = anchor;
            
            // Validate URL immediately after extraction
            if (validateUrl(targetUrl, anchor, event, 'handleContextMenu after extractUrlFromAnchor')) {
                log(`Successfully extracted and validated URL: "${targetUrl}"`);
                // Clean URL to remove tracking parameters
                targetUrl = cleanUrl(targetUrl);
                log(`Cleaned URL: "${targetUrl}"`);
                log('Will create menu for anchor');
                if (maybeAutoCopySelection(false, targetUrl)) {
                    log('Selection auto-copied; skipping context menu for anchor');
                    logFunctionEnd('handleContextMenu');
                    return;
                }
                createMenu(event.clientX, event.clientY, true, anchor);
            } else {
                logError('URL validation failed, using current page URL as fallback');
                targetUrl = window.location.href;
                targetElement = null;
                log(`Set targetUrl to current page: "${targetUrl}"`);
                log('Will create menu for page (fallback)');
                if (maybeAutoCopySelection(false, targetUrl)) {
                    log('Selection auto-copied; skipping fallback context menu');
                    logFunctionEnd('handleContextMenu');
                    return;
                }
                createMenu(event.clientX, event.clientY, false);
            }
        } else {
            log('Right-clicked on page (not an anchor)');
            targetUrl = window.location.href;
            targetElement = null;
            log(`Set targetUrl to current page: "${targetUrl}"`);
            log('Will create menu for page');
            if (maybeAutoCopySelection(false, targetUrl)) {
                log('Selection auto-copied; skipping context menu for page');
                logFunctionEnd('handleContextMenu');
                return;
            }
            createMenu(event.clientX, event.clientY, false);
        }
        
        logFunctionEnd('handleContextMenu');
    }

    /**
     * Checks if the event target is an input field or contenteditable element
     * We should NOT intercept keyboard events in these contexts
     * @param {KeyboardEvent} event - The keyboard event
     * @returns {boolean} True if target is an input/textarea/contenteditable
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement
     * Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable
     */
    function isInEditableContext(event) {
        logFunctionBegin('isInEditableContext');
        
        const target = event.target;
        log(`Checking if target is editable: ${unwrap(target, 'tagName')}`);
        
        // Check if target is an input field
        // HTMLInputElement covers <input> tags (text, search, password, email, etc.)
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement
        const isInputField = target instanceof HTMLInputElement;
        log(`Is input field: ${isInputField}`);
        
        // Check if target is a textarea
        // HTMLTextAreaElement covers <textarea> tags
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement
        const isTextArea = target instanceof HTMLTextAreaElement;
        log(`Is textarea: ${isTextArea}`);
        
        // Check if target has contenteditable attribute
        // contenteditable="true" allows editing of non-form elements
        // Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable
        // Guard `.closest` — the keydown target may be a non-element (e.g. document) with no closest().
        const isContentEditable = !!(target && (
            target.contentEditable === 'true' ||
            (typeof target.closest === 'function' && target.closest('[contenteditable="true"]'))
        ));
        log(`Is contenteditable: ${isContentEditable}`);
        
        const result = isInputField || isTextArea || !!isContentEditable;
        log(`Should skip keyboard trigger: ${result}`);
        
        logFunctionEnd('isInEditableContext');
        return result;
    }

    /**
     * Handles keyboard shortcuts: Alt+M or M alone
     * Checks element under mouse cursor to determine context
     * @param {KeyboardEvent} event - The keydown event
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     */
    function handleKeydown(event) {
        // Check if M key pressed (case-insensitive)
        // Alt+M or M alone (without Ctrl/Shift/Meta)
        if (event.repeat) { return; } // ignore auto-repeat; fire once per press
        const justPressedKey = (event.key && event.key.length === 1) ? event.key.toLowerCase() : null;
        const keyState = bindingState(event);
        const isMenuKey = !!justPressedKey && keyboardActionTriggered('menu', keyState, justPressedKey);
        const isInferKey = !!justPressedKey && keyboardActionTriggered('inferQuiet', keyState, justPressedKey);

        if (isMenuKey || isInferKey) {
            logFunctionBegin('handleKeydown');
            log(`Keyboard trigger detected (key=${justPressedKey}, menu=${isMenuKey}, inferQuiet=${isInferKey})`);
            
            // Don't fire keyboard triggers while typing in a field.
            if (isInEditableContext(event)) {
                log('In editable context (input/textarea/contenteditable), skipping keyboard trigger');
                logFunctionEnd('handleKeydown');
                return;
            }
            
            log('Will prevent default and stop propagation');
            event.preventDefault();
            event.stopPropagation();
            log('Did prevent default and stop propagation');

            // Quiet auto-infer (no menu): copy the hovered link via the capture-aware compiler.
            if (isInferKey) {
                const inferHovered = document.elementFromPoint(mouseX, mouseY);
                const inferAnchor = inferHovered ? inferHovered.closest('a') : null;
                const inferRawUrl = inferAnchor ? extractUrlFromAnchor(inferAnchor, event) : window.location.href;
                log('Keyboard auto-infer: copying single link without menu');
                compileAndCopyBufferedLinks([{ url: inferRawUrl, anchor: inferAnchor }]);
                logFunctionEnd('handleKeydown');
                return;
            }

            // elementFromPoint() returns topmost element at given coordinates
            // Uses tracked mouse position since keyboard events don't have clientX/Y
            // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint
            log(`Will check element at mouse position (${mouseX}, ${mouseY})`);
            const hoveredElement = document.elementFromPoint(mouseX, mouseY);
            log(`Found element: ${hoveredElement ? hoveredElement.tagName : 'null'}`);
            
            const anchor = hoveredElement ? hoveredElement.closest('a') : null;
            log(`Found anchor: ${anchor ? 'yes' : 'no'}`);

            if (anchor) {
                log('Found anchor element, will attempt URL extraction');
                targetUrl = extractUrlFromAnchor(anchor, event);
                targetElement = anchor;
                
                // Validate URL immediately after extraction
                if (validateUrl(targetUrl, anchor, event, 'handleKeydown after extractUrlFromAnchor')) {
                    log(`Successfully extracted and validated URL: "${targetUrl}"`);
                    // Clean URL to remove tracking parameters
                    targetUrl = cleanUrl(targetUrl);
                    log(`Cleaned URL: "${targetUrl}"`);
                    log('Will create menu for anchor');
                    if (maybeAutoCopySelection(false, targetUrl)) {
                        log('Selection auto-copied; skipping keyboard anchor menu');
                        logFunctionEnd('handleKeydown');
                        return;
                    }
                    createMenu(mouseX, mouseY, true, anchor);
                } else {
                    logError('URL validation failed, using current page URL as fallback');
                    targetUrl = window.location.href;
                    targetElement = null;
                    log(`Set targetUrl to current page: "${targetUrl}"`);
                    log('Will create menu for page (fallback)');
                    if (maybeAutoCopySelection(false, targetUrl)) {
                        log('Selection auto-copied; skipping keyboard fallback menu');
                        logFunctionEnd('handleKeydown');
                        return;
                    }
                    createMenu(mouseX, mouseY, false);
                }
            } else {
                log('Keyboard triggered on page (not hovering over anchor)');
                targetUrl = window.location.href;
                targetElement = null;
                log(`Set targetUrl to current page: "${targetUrl}"`);
                log('Will create menu for page');
                if (maybeAutoCopySelection(false, targetUrl)) {
                    log('Selection auto-copied; skipping keyboard page menu');
                    logFunctionEnd('handleKeydown');
                    return;
                }
                createMenu(mouseX, mouseY, false);
            }
            logFunctionEnd('handleKeydown');
        }
    }

    // Needed because KeyboardEvent doesn't include mouse coordinates
    // Updated continuously by mousemove event listener
    // Used by handleKeydown to determine which element is under cursor
    // Type: number (pixel coordinate, initially 0)
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event
    let mouseX = 0;
    let mouseY = 0;
    
    log('Will add mousemove listener to track mouse position');
    
    // Passive listener (no preventDefault/stopPropagation) for performance
    // Arrow function updates closure variables on every mouse move
    // Type: void (addEventListener returns undefined)
    document.addEventListener('mousemove', (event) => {
        // clientX/Y are relative to viewport, not document
        // Type: number (MouseEvent.clientX and clientY are numbers)
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX
        mouseX = event.clientX;
        mouseY = event.clientY;
    });
    log('Did add mousemove listener');

    // Set to track currently pressed keys
    // Used to detect Alt+Z+Click combinations for auto-infer mode
    // Type: Set<string> (stores key names like 'Alt', 'z', 'Z')
    // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
    const pressedKeys = new Set();
    
    // Buffer to collect multiple links while Alt+Z are held
    // Each entry: {url: string, anchor: HTMLElement|null}
    // Type: Array<{url: string, anchor: HTMLElement|null}>
    let altZClickBuffer = [];
    
    // Flag to track if Alt+Z buffer mode is currently active
    // Prevents reinitializing buffer on key repeat events
    // Type: boolean
    let isAltZBufferActive = false;
    
    // Keyboard shortcuts: Alt+M or M alone - register FIRST so key tracker captures SECOND (fires second during capture)
    log('Will add keydown listener to track pressed keys (using capture phase, registered FIRST so fires FIRST)');
    // Simple state tracking: just remember if z is currently down
    let isZKeyDown = false;
    
    document.addEventListener('keydown', (event) => {
        if (event.key && event.key.length === 1) {
            pressedKeys.add(event.key.toLowerCase());
        }
    }, true);
    
    document.addEventListener('keyup', (event) => {
        if (event.key && event.key.length === 1) {
            pressedKeys.delete(event.key.toLowerCase());
        }
    }, true);
    log('Did add keydown listener for key tracking');
    
    log('Registering keydown listener for Alt+M handler (registered SECOND so fires SECOND during capture)');
    document.addEventListener('keydown', handleKeydown, true);
    log('Did register keydown listener for Alt+M handler');
    
    log('Will add keyup listener to track key releases');
    document.addEventListener('keyup', (event) => {
        logFunctionBegin('keyup tracker');
        log(`Key released: ${event.key}, altKey=${event.altKey}`);
        
        // Debug: Log current state
        console.log(`[MARKDOWN_LINKER_DEBUG] KeyUp: released=${event.key}, altKey=${event.altKey}, buffer active=${isAltZBufferActive}, buffer size=${altZClickBuffer.length}`);
        
        // Check if Alt+Z combo WAS active before this key release
        // At keyup time: event.altKey is already false for the Alt key, so we check what's being released
        // The buffer stays active while its trigger keys are held (this keyup already removed the
        // released key from pressedKeys via the capture-phase tracker), so re-evaluate the binding.
        const wasAltZActive = isAltZBufferActive;
        const bufferStillHeld = isAltZBufferActive && actionMatchesClick('inferBuffer', bindingState(event));
        
        log(`Buffer still held: ${bufferStillHeld}, was active: ${wasAltZActive}`);
        
        // If Alt+Z combo was active and we're releasing Alt or Z, process buffer
        if (wasAltZActive && !bufferStillHeld) {
            log(`Alt+Z was deactivated, processing buffer with ${altZClickBuffer.length} buffered links`);
            
            // Deactivate buffer mode
            isAltZBufferActive = false;
            
            if (altZClickBuffer.length > 0) {
                log('Will compile buffered links into markdown list');
                compileAndCopyBufferedLinks(altZClickBuffer);
                // Clear buffer after processing
                const count = altZClickBuffer.length;
                altZClickBuffer = [];
                log(`Did process ${count} links and clear buffer`);
            } else {
                log('Buffer is empty, nothing to copy');
            }
        } else {
            log('Alt+Z was not active or combo still active, skipping buffer processing');
        }
        
        logFunctionEnd('keyup tracker');
    }, false);  // Use bubble phase (false) so it fires AFTER capture phase handlers
    log('Did add keyup listener for key tracking');

    // ============================================================================
    // REGISTER EVENT LISTENERS
    // ============================================================================
    // All listeners use capture phase (third parameter = true) to intercept events
    // before they reach target elements, ensuring our handlers run first
    // Reference: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture

    log('Will register event listeners');
    
    // Left click with Alt modifier
    log('Registering click listener');
    document.addEventListener('click', handleClick, true);
    log('Did register click listener');

    // Right click with Alt modifier
    log('Registering contextmenu listener');
    document.addEventListener('contextmenu', handleContextMenu, true);
    log('Did register contextmenu listener');

    log('All event listeners registered');
    log('Triggers (configurable): hover+V = menu, hover+B = quiet copy, hold Z + click… = buffer list');
    log('Script initialization complete');

})();
