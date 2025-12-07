'use strict';

/**
 * @file playlist_extractor.js
 * @description Extracts playlist data from YouTube playlist or watch pages
 * @namespace YouTubeToolkit.Extractors.Playlist
 */

const DOM = require('../helpers/dom_helpers');
const Time = require('../helpers/time_helpers');
const VideoExtractor = require('./video_extractor');

const PLAYLIST_RENDERERS = [
    'ytd-playlist-video-renderer',
    'ytd-playlist-panel-video-renderer'
];

function parseIndexFromRenderer(renderer) {
    const indexText = DOM.getText('#index span', renderer) || DOM.getText('#index', renderer);
    const parsed = parseInt(indexText, 10);
    return Number.isFinite(parsed) ? parsed : null;
}

function parseDuration(renderer) {
    const durationText = DOM.getText('span#text.ytd-thumbnail-overlay-time-status-renderer', renderer)
        || DOM.getText('span.ytd-thumbnail-overlay-time-status-renderer', renderer)
        || DOM.getText('span.thumbnail-overlay-time-status-renderer', renderer);
    const seconds = Time.parseClockText(durationText);
    return {
        durationSeconds: seconds,
        durationText: seconds ? Time.secondsToClock(seconds) : null,
    };
}

function buildPlaylistItem(anchor, renderer, fallbackIndex) {
    if (!anchor) {
        return null;
    }
    const href = anchor.href || anchor.getAttribute('href');
    const resolvedUrl = DOM.resolveUrl(href);
    const urlObject = resolvedUrl ? new URL(resolvedUrl) : null;
    const videoId = urlObject ? VideoExtractor.getVideoIdFromUrl(urlObject.toString()) : null;
    const { durationSeconds, durationText } = parseDuration(renderer);
    const channelName = DOM.getText('a.yt-simple-endpoint.yt-formatted-string', renderer) || null;
    const playlistIndex = urlObject && urlObject.searchParams.get('index')
        ? parseInt(urlObject.searchParams.get('index'), 10)
        : parseIndexFromRenderer(renderer) || fallbackIndex;
    return {
        index: playlistIndex || fallbackIndex || null,
        title: DOM.getText(anchor) || null,
        url: resolvedUrl,
        videoId,
        durationSeconds,
        durationText,
        channelName,
    };
}

function extractPlaylistItems(doc) {
    const items = [];
    const seen = new Set();
    PLAYLIST_RENDERERS.forEach((selector) => {
        const renderers = DOM.safeQueryAll(selector, doc);
        renderers.forEach((renderer, idx) => {
            const anchor = DOM.safeQuery('a#video-title', renderer) || DOM.safeQuery('a.yt-simple-endpoint', renderer);
            const item = buildPlaylistItem(anchor, renderer, idx + 1);
            if (!item || !item.url) {
                return;
            }
            const dedupeKey = `${item.videoId || item.url}#${item.index || idx}`;
            if (seen.has(dedupeKey)) {
                return;
            }
            seen.add(dedupeKey);
            items.push(item);
        });
    });
    return items;
}

function extractPlaylistTitle(doc) {
    return DOM.getText('yt-formatted-string#title', doc)
        || DOM.getText('yt-formatted-string.ytd-playlist-panel-renderer', doc)
        || DOM.getMetaContent(doc, 'meta[property="og:title"]')
        || null;
}

function extractPlaylistMetadata(doc, url = '') {
    const playlistId = VideoExtractor.getPlaylistIdFromUrl(url)
        || DOM.getAttribute('meta[itemprop="playlistId"]', 'content', doc)
        || null;
    const title = extractPlaylistTitle(doc);
    const items = extractPlaylistItems(doc);
    const playlistUrl = playlistId ? `https://www.youtube.com/playlist?list=${playlistId}` : (url || null);
    return {
        playlistId,
        title,
        url: playlistUrl,
        videos: items,
    };
}

module.exports = {
    extractPlaylistMetadata,
};

if (typeof window !== 'undefined') {
    window.YouTubeToolkit = window.YouTubeToolkit || {};
    window.YouTubeToolkit.Extractors = window.YouTubeToolkit.Extractors || {};
    window.YouTubeToolkit.Extractors.Playlist = module.exports;
}
