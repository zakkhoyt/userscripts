// Amazon Toolkit modules (ensure window.__AmazonToolkitModules is populated)
import '../lib/helpers/validation_helpers.js';
import '../lib/extractors/shared_extractor.js';
import '../lib/extractors/product_extractor.js';
import '../lib/extractors/store_extractor.js';
import '../lib/links/link_parser.js';
import '../lib/links/link_cleaner.js';
import '../lib/links/link_image.js';
import '../lib/markdown/markdown_formatter.js';
import '../lib/markdown/markdown_generator.js';
import '../lib/index.js';

// YouTube Toolkit (populates window.YouTubeToolkit via its require() graph)
import '../lib-youtube/index.js';

// Source capture dev tool (populates window.SourceCapture)
import '../lib-capture/source_capture.js';

// Main Markdown Linker userscript source
import './markdown_linker.source.js';
