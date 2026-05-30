/**
 * @file link_parser.js
 * @description Parses Amazon URLs and HTML anchors to extract data
 * @author Zakk Hoyt
 * @namespace AmazonToolkit.Links.Parser
 * 
 * Provides functions to parse Amazon URLs and HTML anchor elements.
 * Handles multiple URL formats and extracts relevant data for link composition.
 * 
 * Use cases:
 * - Parse URL strings to extract ASIN, store ID, query parameters
 * - Parse HTML anchor elements (opt+click on anchor scenario)
 * - Extract anchor text and href for markdown generation
 * - Categorize URLs (product, store, search, etc.)
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL MDN URL API}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement MDN Anchor Element}
 */

'use strict';

const MAX_AMAZON_REDIRECT_DEPTH = 3;
const AMAZON_REDIRECT_PATTERNS = [
    {
        matches: (pathname) => pathname.startsWith('/sspa/click'),
        paramKeys: ['url'],
        reason: 'sponsored-click'
    },
    {
        matches: (pathname) => pathname.startsWith('/gp/slredirect'),
        paramKeys: ['url'],
        reason: 'slredirect'
    },
    {
        matches: (pathname) => pathname.startsWith('/aclk'),
        paramKeys: ['url', 'u'],
        reason: 'ad-click'
    }
];

/**
 * Parses an Amazon URL string into a structured data object
 * 
 * @param {string} urlString - URL to parse
 * @returns {Object|null} Parsed URL data or null if invalid
 * 
 * @example
 * const data = parseAmazonURL('https://www.amazon.com/dp/B08N5WRWNW?th=1&psc=1');
 * // Returns:
 * {
 *   type: 'product',
 *   asin: 'B08N5WRWNW',
 *   storeId: null,
 *   sellerId: null,
 *   url: {
 *     original: 'https://www.amazon.com/dp/B08N5WRWNW?th=1&psc=1',
 *     clean: 'https://www.amazon.com/dp/B08N5WRWNW',
 *     protocol: 'https:',
 *     hostname: 'www.amazon.com',
 *     pathname: '/dp/B08N5WRWNW',
 *     queryParams: { th: '1', psc: '1' },
 *     variantParams: { th: '1', psc: '1' },
 *     trackingParams: {}
 *   }
 * }
 */
function parseAmazonURL(urlString) {
    if (!urlString || typeof urlString !== 'string') {
        return null;
    }

    return parseAmazonURLInternal(urlString, {
        depth: 0,
        rootOriginal: urlString,
        redirectChain: []
    });
}

function parseAmazonURLInternal(urlString, state) {
    if (state.depth > MAX_AMAZON_REDIRECT_DEPTH) {
        logWarn('Reached maximum Amazon redirect depth, aborting parse');
        return null;
    }

    try {
        const urlObj = new URL(urlString);

        if (!isAmazonURL(urlObj)) {
            return null;
        }

        const redirectTarget = resolveAmazonRedirect(urlObj);
        if (redirectTarget) {
            const redirectEntry = {
                wrapper: redirectTarget.wrapper,
                reason: redirectTarget.reason,
                param: redirectTarget.param
            };
            const nested = parseAmazonURLInternal(redirectTarget.target, {
                depth: state.depth + 1,
                rootOriginal: state.rootOriginal,
                redirectChain: state.redirectChain.concat(redirectEntry)
            });
            if (nested) {
                const chain = nested.redirectChain || state.redirectChain.concat(redirectEntry);
                nested.redirectChain = chain;
                nested.url = nested.url || {};
                nested.url.original = state.rootOriginal;
                nested.url.redirectChain = chain;
                return nested;
            }
        }

        const type = determineURLType(urlObj);
        const asin = extractASINFromURL(urlObj);
        const storeId = extractStoreIDFromURL(urlObj);
        const sellerId = extractSellerIDFromURL(urlObj);
        const queryParams = parseQueryParams(urlObj);
        const variantParams = extractVariantParams(queryParams);
        const trackingParams = extractTrackingParams(queryParams);
        const canonicalPath = normalizeAmazonPath(urlObj.pathname, { asin, type });
        const cleanUrl = buildCleanURL(urlObj, variantParams, { canonicalPath });
        const redirectChain = (state.redirectChain || []).slice();

        return {
            type,
            asin,
            storeId,
            sellerId,
            redirectChain,
            url: {
                original: state.rootOriginal,
                clean: cleanUrl,
                protocol: urlObj.protocol,
                hostname: urlObj.hostname,
                pathname: urlObj.pathname,
                canonicalPath,
                queryParams,
                variantParams,
                trackingParams,
                redirectChain
            }
        };
    } catch (error) {
        logError('Failed to parse Amazon URL:', error);
        return null;
    }
}

/**
 * Parses an HTML anchor element to extract Amazon link data
 * 
 * @param {HTMLAnchorElement} anchorElement - Anchor element to parse
 * @returns {Object|null} Parsed anchor data or null if invalid
 * 
 * @example
 * const anchor = document.querySelector('a[href*="amazon"]');
 * const data = parseAmazonAnchor(anchor);
 * // Returns:
 * {
 *   text: 'Nintendo Switch – OLED Model',
 *   textCleaned: 'Nintendo Switch – OLED Model',
 *   href: 'https://www.amazon.com/dp/B08N5WRWNW',
 *   type: 'product',
 *   asin: 'B08N5WRWNW',
 *   title: 'Nintendo Switch – OLED Model',
 *   url: { ... }
 * }
 */
function parseAmazonAnchor(anchorElement) {
    if (!anchorElement || !isValidElement(anchorElement)) {
        return null;
    }

    try {
        const href = safeAttr(anchorElement, 'href');
        if (!href) {
            return null;
        }

        // Parse the URL
        const urlData = parseAmazonURL(href);
        if (!urlData) {
            return null;
        }

        // Extract anchor text
        const text = safeText(anchorElement);
        const textCleaned = text ? cleanAnchorText(text) : null;

        // Extract title attribute
        const title = safeAttr(anchorElement, 'title');

        // Extract image if anchor contains one
        const img = safeQuery('img', anchorElement);
        const imageData = img ? {
            src: safeAttr(img, 'src'),
            alt: safeAttr(img, 'alt'),
            imageId: extractImageIDFromURL(safeAttr(img, 'src'))
        } : null;

        return {
            text,
            textCleaned,
            href,
            title,
            image: imageData,
            ...urlData
        };
    } catch (error) {
        logError('Failed to parse Amazon anchor:', error);
        return null;
    }
}

/**
 * Cleans anchor text by removing extra whitespace and common suffixes
 * @param {string} text - Raw anchor text
 * @returns {string} Cleaned text
 */
function cleanAnchorText(text) {
    if (!text) return '';
    
    let cleaned = text.trim();
    
    // Replace multiple whitespace with single space
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Remove "Visit the Amazon ... page" pattern
    cleaned = cleaned.replace(/Visit the Amazon .+ page/gi, '');
    
    // Remove "Amazon.com:" prefix
    cleaned = cleaned.replace(/^Amazon\.com:\s*/i, '');
    
    return cleaned.trim();
}

/**
 * Determines the type of Amazon URL
 * @param {URL} urlObj - URL object
 * @returns {string} URL type: 'product', 'store', 'search', 'category', 'other'
 */
function determineURLType(urlObj) {
    const pathname = urlObj.pathname.toLowerCase();
    const search = urlObj.search.toLowerCase();

    // Product URLs
    if (pathname.includes('/dp/') || 
        pathname.includes('/gp/product/') ||
        pathname.includes('/o/asin/') ||
        pathname.includes('/exec/obidos/asin/')) {
        return 'product';
    }

    // Store URLs
    if (pathname.includes('/stores/')) {
        return 'store';
    }

    // Seller/Store URLs by query parameter
    if (search.includes('me=') || search.includes('marketplaceid=')) {
        return 'store';
    }

    // Search URLs
    if (pathname === '/s' || pathname === '/s/') {
        return 'search';
    }

    // Category/Browse URLs
    if (pathname.includes('/b/') || pathname.includes('/gp/browse')) {
        return 'category';
    }

    // Best Sellers
    if (pathname.includes('/best-sellers') || pathname.includes('/gp/bestsellers')) {
        return 'bestsellers';
    }

    // Deals
    if (pathname.includes('/deals') || pathname.includes('/goldbox')) {
        return 'deals';
    }

    return 'other';
}

/**
 * Extracts ASIN from URL object
 * @param {URL} urlObj - URL object
 * @returns {string|null} ASIN or null
 */
function extractASINFromURL(urlObj) {
    const pathname = urlObj.pathname;

    // Try different URL patterns
    const patterns = [
        /\/dp\/([A-Z0-9]{10})/i,
        /\/gp\/product\/([A-Z0-9]{10})/i,
        /\/o\/ASIN\/([A-Z0-9]{10})/i,
        /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/i
    ];

    for (const pattern of patterns) {
        const match = pathname.match(pattern);
        if (match) {
            const asin = match[1].toUpperCase();
            if (isValidASIN(asin)) {
                return asin;
            }
        }
    }

    return null;
}

/**
 * Extracts store ID from URL object
 * @param {URL} urlObj - URL object
 * @returns {string|null} Store ID or null
 */
function extractStoreIDFromURL(urlObj) {
    const pathname = urlObj.pathname;

    // Pattern: /stores/BrandName/page/STORE_ID
    const match1 = pathname.match(/\/stores\/[^\/]+\/page\/([A-Z0-9-]+)/i);
    if (match1) {
        return match1[1];
    }

    // Pattern: /stores/page/STORE_ID
    const match2 = pathname.match(/\/stores\/page\/([A-Z0-9-]+)/i);
    if (match2) {
        return match2[1];
    }

    return null;
}

/**
 * Extracts seller ID from URL object
 * @param {URL} urlObj - URL object
 * @returns {string|null} Seller ID or null
 */
function extractSellerIDFromURL(urlObj) {
    return urlObj.searchParams.get('me') || null;
}

/**
 * Parses all query parameters from URL
 * @param {URL} urlObj - URL object
 * @returns {Object} Object with all query parameters
 */
function parseQueryParams(urlObj) {
    const params = {};
    for (const [key, value] of urlObj.searchParams.entries()) {
        params[key] = value;
    }
    return params;
}

/**
 * Extracts variant parameters from query params
 * @param {Object} queryParams - Query parameters object
 * @returns {Object} Object with only variant parameters
 */
function extractVariantParams(queryParams) {
    const variantKeys = ['th', 'psc', 'smid'];
    const variantParams = {};
    
    for (const key of variantKeys) {
        if (queryParams[key]) {
            variantParams[key] = queryParams[key];
        }
    }
    
    return variantParams;
}

/**
 * Extracts tracking parameters from query params
 * @param {Object} queryParams - Query parameters object
 * @returns {Object} Object with only tracking parameters
 */
function extractTrackingParams(queryParams) {
    const trackingPrefixes = ['pd_rd_', 'pf_rd_', '_encoding', 'qid', 'sr', 'keywords', 'crid', 'sprefix', 'dib', 'tag', 'linkCode', 'linkId', 'ref', 'ref_'];
    const trackingParams = {};
    
    for (const [key, value] of Object.entries(queryParams)) {
        if (trackingPrefixes.some(prefix => key.toLowerCase().startsWith(prefix))) {
            trackingParams[key] = value;
        }
    }
    
    return trackingParams;
}

/**
 * Builds a clean URL with optional variant parameters
 * @param {URL} urlObj - URL object
 * @param {Object} [variantParams={}] - Variant parameters to include
 * @returns {string} Clean URL
 */
function buildCleanURL(urlObj, variantParams = {}, options = {}) {
    const canonicalPath = options.canonicalPath || urlObj.pathname;
    let cleanUrl = `${urlObj.protocol}//${urlObj.hostname}${canonicalPath}`;
    
    // Add variant parameters if any
    const paramKeys = Object.keys(variantParams);
    if (paramKeys.length > 0) {
        const paramString = paramKeys
            .map(key => `${key}=${variantParams[key]}`)
            .join('&');
        cleanUrl += `?${paramString}`;
    }
    
    return cleanUrl;
}

function normalizeAmazonPath(pathname = '/', context = {}) {
    if (!pathname) {
        return '/';
    }

    if (context.type === 'product' && context.asin) {
        return `/dp/${context.asin}`;
    }

    const asinPatterns = [
        /\/dp\/([A-Z0-9]{10})/i,
        /\/gp\/product\/([A-Z0-9]{10})/i,
        /\/o\/ASIN\/([A-Z0-9]{10})/i,
        /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/i,
        /\/gp\/aw\/d\/([A-Z0-9]{10})/i
    ];

    for (const pattern of asinPatterns) {
        const match = pathname.match(pattern);
        if (match) {
            return `/dp/${match[1].toUpperCase()}`;
        }
    }

    return pathname;
}

/**
 * Extracts image ID from image URL
 * @param {string} imageUrl - Image URL
 * @returns {string|null} Image ID or null
 */
function extractImageIDFromURL(imageUrl) {
    if (!imageUrl) return null;
    const match = imageUrl.match(/\/images\/[ISP]\/([A-Za-z0-9+_-]+)\./);
    return match ? match[1] : null;
}

/**
 * Parses multiple Amazon URLs from text content
 * Useful for extracting all Amazon links from a page or text block
 * 
 * @param {string} text - Text content to parse
 * @returns {Array<Object>} Array of parsed URL data objects
 * 
 * @example
 * const text = 'Check out https://amazon.com/dp/B08N5WRWNW and https://amazon.com/dp/B09ABCDEFG';
 * const urls = parseAmazonURLsFromText(text);
 * // Returns array with 2 parsed URL objects
 */
function parseAmazonURLsFromText(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    // Regex to match Amazon URLs
    const amazonURLPattern = /https?:\/\/(?:www\.)?amazon\.[a-z.]{2,}\/[^\s<>"]+/gi;
    const matches = text.match(amazonURLPattern);
    
    if (!matches) {
        return [];
    }

    const parsedURLs = [];
    for (const urlString of matches) {
        const parsed = parseAmazonURL(urlString);
        if (parsed) {
            parsedURLs.push(parsed);
        }
    }

    return parsedURLs;
}

/**
 * Extracts Amazon URLs from all anchors in a document or element
 * @param {Document|Element} context - Context to search within
 * @returns {Array<Object>} Array of parsed anchor data objects
 * 
 * @example
 * const anchors = extractAmazonAnchorsFromDOM(document);
 * // Returns array of all parsed Amazon anchors on page
 */
function extractAmazonAnchorsFromDOM(context = document) {
    const anchors = safeQueryAll('a[href*="amazon"]', context);
    const parsed = [];

    for (const anchor of anchors) {
        const data = parseAmazonAnchor(anchor);
        if (data) {
            parsed.push(data);
        }
    }

    return parsed;
}

function resolveAmazonRedirect(urlObj) {
    const pathname = (urlObj.pathname || '').toLowerCase();
    for (const pattern of AMAZON_REDIRECT_PATTERNS) {
        if (!pattern.matches(pathname)) {
            continue;
        }

        for (const key of pattern.paramKeys) {
            if (!urlObj.searchParams.has(key)) {
                continue;
            }

            const rawTarget = urlObj.searchParams.get(key);
            if (!rawTarget) {
                continue;
            }

            const decodedTarget = safeDecodeURIComponent(rawTarget);
            const absoluteTarget = buildAbsoluteAmazonURL(decodedTarget, urlObj);
            if (absoluteTarget) {
                return {
                    target: absoluteTarget,
                    wrapper: urlObj.href,
                    reason: pattern.reason,
                    param: key
                };
            }
        }
    }

    return null;
}

function safeDecodeURIComponent(value) {
    try {
        return decodeURIComponent(value);
    } catch (error) {
        return value;
    }
}

function buildAbsoluteAmazonURL(target, baseUrlObj) {
    if (!target) {
        return null;
    }

    let candidate = target.trim();
    if (!candidate) {
        return null;
    }

    if (candidate.startsWith('//')) {
        candidate = `${baseUrlObj.protocol}${candidate}`;
    } else if (candidate.startsWith('/')) {
        candidate = `${baseUrlObj.protocol}//${baseUrlObj.hostname}${candidate}`;
    } else if (!/^https?:/i.test(candidate)) {
        candidate = `${baseUrlObj.protocol}//${candidate}`;
    }

    try {
        const result = new URL(candidate);
        if (isAmazonURL(result)) {
            return result.href;
        }
    } catch (error) {
        return null;
    }

    return null;
}

// Placeholder functions - these would be imported from helpers
function isAmazonURL(urlObj) {
    const amazonDomainPattern = /^(www\.)?amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)$/i;
    return amazonDomainPattern.test(urlObj.hostname);
}

function isValidASIN(value) {
    if (!value || typeof value !== 'string') return false;
    return /^[A-Z0-9]{10}$/.test(value);
}

function isValidElement(element) {
    return element instanceof Element || (element && element.nodeType === 1);
}

function safeQuery(selector, context) { /* Implementation in dom_helpers.js */ return null; }
function safeQueryAll(selector, context) { /* Implementation in dom_helpers.js */ return []; }
function safeText(element) { /* Implementation in dom_helpers.js */ return null; }
function safeAttr(element, attr) { /* Implementation in dom_helpers.js */ return null; }
function logWarn(...args) { /* Implementation in logging_helpers.js */ }
function logError(...args) { /* Implementation in logging_helpers.js */ }

const LinkParser = {
    parseAmazonURL,
    parseAmazonAnchor,
    cleanAnchorText,
    determineURLType,
    extractASINFromURL,
    extractStoreIDFromURL,
    extractSellerIDFromURL,
    parseQueryParams,
    extractVariantParams,
    extractTrackingParams,
    buildCleanURL,
    extractImageIDFromURL,
    parseAmazonURLsFromText,
    extractAmazonAnchorsFromDOM
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinkParser;
}

if (typeof window !== 'undefined') {
    window.__AmazonToolkitModules = window.__AmazonToolkitModules || {};
    window.__AmazonToolkitModules['links/link_parser'] = LinkParser;
}
