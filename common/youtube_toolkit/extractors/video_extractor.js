'use strict';

/**
 * @file video_extractor.js
 * @description Extracts YouTube video metadata from DOM/JSDOM documents
 * @namespace YouTubeToolkit.Extractors.Video
 */

const DOM = require('../helpers/dom_helpers');
const Time = require('../helpers/time_helpers');

function getVideoIdFromUrl(url = '') {
    if (!url) {
        return null;
    }
    try {
        const parsed = new URL(url, 'https://www.youtube.com');
        if (parsed.hostname === 'youtu.be') {
            const slug = parsed.pathname.replace('/', '').trim();
            return slug || null;
        }
        const id = parsed.searchParams.get('v');
        if (id) {
            return id;
        }
        const segments = parsed.pathname.split('/');
        if (segments.includes('shorts')) {
            const idx = segments.indexOf('shorts');
            return segments[idx + 1] || null;
        }
        return null;
    } catch (error) {
        return null;
    }
}

function getPlaylistIdFromUrl(url = '') {
    if (!url) {
        return null;
    }
    try {
        const parsed = new URL(url, 'https://www.youtube.com');
        return parsed.searchParams.get('list');
    } catch (error) {
        return null;
    }
}

function getPlayerResponse(doc) {
    return DOM.extractJSONFromScripts(doc, ['ytInitialPlayerResponse']);
}

function extractVideoTitle(doc, playerResponse) {
    const ogTitle = DOM.getMetaContent(doc, 'meta[property="og:title"]');
    if (ogTitle) {
        return ogTitle;
    }
    const h1 = DOM.getText('h1.ytd-watch-metadata', doc);
    if (h1) {
        return h1;
    }
    const titleElement = DOM.getText('#title #container yt-formatted-string', doc);
    if (titleElement) {
        return titleElement;
    }
    return playerResponse?.videoDetails?.title || null;
}

function extractChannelName(doc, playerResponse) {
    const header = DOM.getText('#top-row #channel-name a', doc) || DOM.getText('#channel-name a', doc);
    if (header) {
        return header;
    }
    const author = DOM.getText('link[itemprop="name"]', doc);
    if (author) {
        return author;
    }
    return playerResponse?.videoDetails?.author || null;
}

function extractChannelUrl(doc) {
    const anchor = DOM.getAttribute('#channel-name a', 'href', doc);
    if (anchor) {
        return DOM.resolveUrl(anchor);
    }
    const handleAnchor = DOM.getAttribute('a[href^="/@"]', 'href', doc);
    if (handleAnchor) {
        return DOM.resolveUrl(handleAnchor);
    }
    const channelId = DOM.getMetaContent(doc, 'meta[itemprop="channelId"]');
    if (channelId) {
        return `https://www.youtube.com/channel/${channelId}`;
    }
    return null;
}

function extractChannelHandle(doc) {
    const handleAnchor = DOM.getAttribute('a[href^="/@"]', 'href', doc);
    if (!handleAnchor) {
        return null;
    }
    return handleAnchor.replace('/', '').trim();
}

function extractDuration(doc, playerResponse) {
    const isoDuration = DOM.getMetaContent(doc, 'meta[itemprop="duration"]');
    if (isoDuration) {
        const parsed = Time.parseISODuration(isoDuration);
        if (parsed) {
            return parsed;
        }
    }
    const lengthSeconds = playerResponse?.videoDetails?.lengthSeconds;
    if (lengthSeconds) {
        const parsed = parseInt(lengthSeconds, 10);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

function detectLive(doc, playerResponse) {
    const liveBadge = DOM.getMetaContent(doc, 'meta[itemprop="isLiveBroadcast"]');
    if (liveBadge) {
        return liveBadge === 'True';
    }
    const isLive = playerResponse?.videoDetails?.isLiveContent;
    return Boolean(isLive);
}

function extractVideoMetadata(doc, url = '') {
    const playerResponse = getPlayerResponse(doc);
    const title = extractVideoTitle(doc, playerResponse);
    const channelName = extractChannelName(doc, playerResponse);
    const channelUrl = extractChannelUrl(doc);
    const channelHandle = extractChannelHandle(doc);
    const canonicalUrl = DOM.getLinkHref(doc, 'link[rel="canonical"]');
    const videoId = getVideoIdFromUrl(url) || playerResponse?.videoDetails?.videoId || getVideoIdFromUrl(canonicalUrl);
    const shortUrl = videoId ? `https://youtu.be/${videoId}` : null;
    const playlistId = getPlaylistIdFromUrl(url) || playerResponse?.playlistId || null;
    const durationSeconds = extractDuration(doc, playerResponse);
    const isLive = detectLive(doc, playerResponse);
    return {
        title,
        channelName,
        channelUrl,
        channelHandle,
        canonicalUrl: canonicalUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null),
        shortUrl,
        videoId,
        playlistId,
        durationSeconds,
        isLive,
        description: DOM.getMetaContent(doc, 'meta[name="description"]') || null,
    };
}

function extractPlaybackState(doc, options = {}) {
    const videoElement = options.videoElement || DOM.safeQuery('video', doc);
    if (!videoElement) {
        return { seconds: 0, formatted: null, isActive: false };
    }
    const seconds = Number(videoElement.currentTime || 0);
    const validSeconds = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
    return {
        seconds: validSeconds,
        formatted: Time.secondsToTimestamp(validSeconds) || null,
        isActive: validSeconds > 0,
    };
}

module.exports = {
    extractVideoMetadata,
    extractPlaybackState,
    getVideoIdFromUrl,
    getPlaylistIdFromUrl,
};

if (typeof window !== 'undefined') {
    window.YouTubeToolkit = window.YouTubeToolkit || {};
    window.YouTubeToolkit.Extractors = window.YouTubeToolkit.Extractors || {};
    window.YouTubeToolkit.Extractors.Video = module.exports;
}
