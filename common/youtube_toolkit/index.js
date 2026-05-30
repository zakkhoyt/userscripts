'use strict';

/**
 * @file index.js
 * @description Main entry point for YouTube Toolkit
 * @namespace YouTubeToolkit
 */

const DOMHelpers = require('./helpers/dom_helpers');
const TimeHelpers = require('./helpers/time_helpers');
const VideoExtractor = require('./extractors/video_extractor');
const ChannelExtractor = require('./extractors/channel_extractor');
const PlaylistExtractor = require('./extractors/playlist_extractor');
const PageStateExtractor = require('./extractors/page_state_extractor');

const YouTubeToolkit = {
    version: '0.1.0',
    Helpers: {
        DOM: DOMHelpers,
        Time: TimeHelpers,
    },
    Extractors: {
        Video: VideoExtractor,
        Channel: ChannelExtractor,
        Playlist: PlaylistExtractor,
        PageState: PageStateExtractor,
    },
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = YouTubeToolkit;
}

if (typeof window !== 'undefined') {
    window.YouTubeToolkit = YouTubeToolkit;
}
