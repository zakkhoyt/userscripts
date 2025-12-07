# YouTube Toolkit

Reusable helpers for extracting metadata from ![youtube](../../docs/images/icons/youtube.png) `YouTube` pages in both browser (ViolentMonkey) and Node.js (jsdom) environments.

## Features

- **Video extraction**: title, channel name, channel handle, canonical and short URLs, duration, live status, playlist ID, description
- **Playback state**: reads runtime `<video>` elements to expose elapsed seconds and human-friendly timestamps
- **Channel extraction**: channel title, description, canonical URL, avatar, subscriber counts
- **Playlist extraction**: captures playlist title plus ordered video entries (title, index, URL, duration, channel) from playlist pages or watch-page sidebars
- **Page classification**: determine whether the current document is a watch page, playlist, shorts, or channel surface
- **Helpers**: DOM safety wrappers, URL resolution, JSON scraping, and timestamp parsing/formatting

## Directory Layout

```
youtube_toolkit/
├── extractors/
│   ├── channel_extractor.js
│   ├── page_state_extractor.js
│   ├── playlist_extractor.js
│   └── video_extractor.js
├── helpers/
│   ├── dom_helpers.js
│   └── time_helpers.js
└── index.js
```

## Usage

### Browser (ViolentMonkey)

```javascript
// ==UserScript==
// @require      file:///absolute/path/to/common/youtube_toolkit/index.js
// ==/UserScript==

const videoMeta = window.YouTubeToolkit.Extractors.Video.extractVideoMetadata(document, window.location.href);
const playback = window.YouTubeToolkit.Extractors.Video.extractPlaybackState(document);
```

### Node.js / jsdom

```javascript
const { JSDOM } = require('jsdom');
const YouTubeToolkit = require('./common/youtube_toolkit');

const dom = new JSDOM(htmlString);
const videoMeta = YouTubeToolkit.Extractors.Video.extractVideoMetadata(dom.window.document, url);
```

## API surface

- `Extractors.Video.extractVideoMetadata(document, url)`
- `Extractors.Video.extractPlaybackState(document, options)`
- `Extractors.Video.getVideoIdFromUrl(url)`
- `Extractors.Video.getPlaylistIdFromUrl(url)`
- `Extractors.Channel.extractChannelMetadata(document, url)`
- `Extractors.Playlist.extractPlaylistMetadata(document, url)`
- `Extractors.PageState.determinePageState(url, document)`
- `Extractors.PageState.isYouTubeHost(url)`
- `Helpers.DOM.*` safe DOM utilities
- `Helpers.Time.*` timestamp parsing/formatting helpers

The toolkit attaches itself to `window.YouTubeToolkit` when loaded in a browser and exports via `module.exports` for Node.js consumers, mirroring the `common/amazon_toolkit` pattern.
