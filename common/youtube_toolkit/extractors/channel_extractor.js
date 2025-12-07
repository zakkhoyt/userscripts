'use strict';

/**
 * @file channel_extractor.js
 * @description Extracts channel level metadata from YouTube pages
 * @namespace YouTubeToolkit.Extractors.Channel
 */

const DOM = require('../helpers/dom_helpers');

function extractSubscriberCount(doc) {
    const badge = DOM.getText('#subscriber-count', doc) || DOM.getText('#subscriber-count yt-formatted-string', doc);
    return badge || null;
}

function extractChannelMetadata(doc, url = '') {
    const title = DOM.getText('ytd-channel-name #text', doc) || DOM.getText('meta[property="og:title"]', doc);
    const description = DOM.getMetaContent(doc, 'meta[name="description"]');
    const canonicalUrl = DOM.getLinkHref(doc, 'link[rel="canonical"]') || url || null;
    const handle = DOM.getText('ytd-channel-handle', doc) || DOM.getAttribute('a[href^="/@"]', 'href', doc);
    const avatar = DOM.getAttribute('#avatar img', 'src', doc) || DOM.getAttribute('img#img', 'src', doc);
    const subscriberCount = extractSubscriberCount(doc);
    return {
        title,
        description,
        canonicalUrl,
        handle: handle ? handle.replace('/', '').trim() : null,
        avatar,
        subscriberCount,
    };
}

module.exports = {
    extractChannelMetadata,
};

if (typeof window !== 'undefined') {
    window.YouTubeToolkit = window.YouTubeToolkit || {};
    window.YouTubeToolkit.Extractors = window.YouTubeToolkit.Extractors || {};
    window.YouTubeToolkit.Extractors.Channel = module.exports;
}
