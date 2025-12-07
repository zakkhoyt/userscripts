'use strict';

/**
 * @file page_state_extractor.js
 * @description Determines what kind of YouTube page is currently loaded
 * @namespace YouTubeToolkit.Extractors.PageState
 */

const { resolveUrl } = require('../helpers/dom_helpers');

const WATCH_PATHS = ['/watch', '/live'];
const PLAYLIST_PATHS = ['/playlist'];
const SHORTS_PATH = '/shorts';

function normalizeUrl(url) {
    if (!url && typeof window !== 'undefined') {
        return window.location.href;
    }
    return url;
}

function determinePageState(url = '', doc) {
    const resolved = normalizeUrl(url);
    if (!resolved) {
        return 'unknown';
    }
    let parsed;
    try {
        parsed = new URL(resolved, 'https://www.youtube.com');
    } catch (error) {
        return 'unknown';
    }

    const pathname = parsed.pathname || '';
    const hasWatchParam = parsed.searchParams.has('v');
    const hasPlaylistParam = parsed.searchParams.has('list');

    if (WATCH_PATHS.some((segment) => pathname.startsWith(segment)) || hasWatchParam) {
        return hasPlaylistParam ? 'watch-with-playlist' : 'watch';
    }

    if (pathname.startsWith(SHORTS_PATH)) {
        return 'shorts';
    }

    if (PLAYLIST_PATHS.some((segment) => pathname.startsWith(segment)) || hasPlaylistParam) {
        return 'playlist';
    }

    if (pathname.startsWith('/channel/') || pathname.startsWith('/@')) {
        return 'channel';
    }

    if (doc) {
        const ogType = doc.querySelector ? doc.querySelector('meta[property="og:type"]') : null;
        const ogContent = ogType ? ogType.content : null;
        if (ogContent === 'video.other') {
            return 'watch';
        }
    }

    return 'unknown';
}

function isYouTubeHost(url = '') {
    const resolved = normalizeUrl(url);
    if (!resolved) {
        return false;
    }
    try {
        const parsed = new URL(resolved, 'https://www.youtube.com');
        return parsed.hostname.includes('youtube.com') || parsed.hostname === 'youtu.be';
    } catch (error) {
        return false;
    }
}

module.exports = {
    determinePageState,
    isYouTubeHost,
};

if (typeof window !== 'undefined') {
    window.YouTubeToolkit = window.YouTubeToolkit || {};
    window.YouTubeToolkit.Extractors = window.YouTubeToolkit.Extractors || {};
    window.YouTubeToolkit.Extractors.PageState = module.exports;
}
