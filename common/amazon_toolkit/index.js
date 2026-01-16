/**
 * @file index.js
 * @description Main entry point for Amazon Toolkit
 * @author Zakk Hoyt
 * @namespace AmazonToolkit
 * 
 * Amazon Toolkit - Comprehensive Amazon data extraction and markdown generation
 * 
 * This module provides a unified interface to all Amazon Toolkit functionality:
 * - Extract product and store data from HTML
 * - Parse URLs and HTML anchors
 * - Clean and build URLs
 * - Generate and manipulate image URLs
 * - Format and generate markdown links
 * 
 * @version 1.0.0
 * @license MIT
 * 
 * @example
 * // Browser (ViolentMonkey userscript)
 * // @require file://path/to/common/amazon_toolkit/index.js
 * 
 * const productData = AmazonToolkit.extractProductData(document, window.location.href);
 * const markdown = AmazonToolkit.generateProductLink(productData);
 * 
 * @example
 * // Node.js
 * const AmazonToolkit = require('./common/amazon_toolkit');
 * 
 * const productData = AmazonToolkit.extractProductData(htmlString, url);
 * const markdown = AmazonToolkit.generateProductLink(productData);
 */

'use strict';

// ============================================================================
// Module Loader Helpers
// ============================================================================

function loadModule(registryKey, requirePath) {
    if (typeof require === 'function') {
        try {
            return require(requirePath);
        } catch (error) {
            // Fall through to global lookup
        }
    }

    if (typeof window !== 'undefined' && window.__AmazonToolkitModules) {
        return window.__AmazonToolkitModules[registryKey] || {};
    }

    return {};
}

const domHelpers = loadModule('helpers/dom_helpers', './helpers/dom_helpers.js');
const loggingHelpers = loadModule('helpers/logging_helpers', './helpers/logging_helpers.js');
const validationHelpers = loadModule('helpers/validation_helpers', './helpers/validation_helpers.js');
const sharedExtractor = loadModule('extractors/shared_extractor', './extractors/shared_extractor.js');
const productExtractor = loadModule('extractors/product_extractor', './extractors/product_extractor.js');
const storeExtractor = loadModule('extractors/store_extractor', './extractors/store_extractor.js');
const linkParser = loadModule('links/link_parser', './links/link_parser.js');
const linkCleaner = loadModule('links/link_cleaner', './links/link_cleaner.js');
const linkImage = loadModule('links/link_image', './links/link_image.js');
const markdownFormatter = loadModule('markdown/markdown_formatter', './markdown/markdown_formatter.js');
const markdownGenerator = loadModule('markdown/markdown_generator', './markdown/markdown_generator.js');

const noop = () => {};

function ensureFunctions(target, names) {
    names.forEach((name) => {
        if (typeof target[name] !== 'function') {
            target[name] = noop;
        }
    });
    return target;
}

const helperFunctions = ensureFunctions(
    Object.assign({}, domHelpers, loggingHelpers, validationHelpers),
    [
        'safeQuery',
        'safeQueryAll',
        'safeText',
        'safeAttr',
        'parseJsonLD',
        'getMetaByProperty',
        'getMetaByName',
        'setDebugMode',
        'log',
        'logInfo',
        'logWarn',
        'logError',
        'logFunctionBegin',
        'logFunctionEnd',
        'isValidASIN',
        'isValidURL',
        'isAmazonURL',
        'isAmazonProductURL',
        'isAmazonStoreURL',
        'isAmazonImageURL'
    ]
);

const extractorFunctions = ensureFunctions(
    Object.assign({}, sharedExtractor, productExtractor, storeExtractor),
    [
        'extractProductASIN',
        'extractProductTitle',
        'extractProductBrand',
        'extractProductDescription',
        'extractProductPrice',
        'extractProductImageURL',
        'extractProductVariant',
        'cleanProductTitle',
        'extractProductData',
        'extractProductPriceData',
        'extractProductImageData',
        'extractProductImageID',
        'extractProductAvailability',
        'extractProductShipping',
        'extractProductRating',
        'parseProductPriceValue',
        'extractProductCurrency',
        'extractStoreData',
        'isStorePage',
        'extractStoreName',
        'cleanStoreName',
        'extractStoreBrandName',
        'extractStoreDescription',
        'extractStoreLogo',
        'extractSellerId',
        'extractStoreId',
        'parseStoreURLData',
        'extractStoreImageID'
    ]
);

const linkFunctions = ensureFunctions(
    Object.assign({}, linkParser, linkCleaner, linkImage),
    [
        'parseAmazonURL',
        'parseAmazonAnchor',
        'determineURLType',
        'extractAmazonAnchorsFromDOM',
        'cleanAmazonURL',
        'buildAmazonURL',
        'cleanProductTitle',
        'shortenTitle',
        'extractImageID',
        'buildImageURL',
        'resizeImageURL',
        'generateImageVariants',
        'parseImageURL'
    ]
);

const markdownFunctions = ensureFunctions(
    Object.assign({}, markdownFormatter, markdownGenerator),
    [
        'escapeMarkdown',
        'formatTitle',
        'formatBrand',
        'formatVariant',
        'formatPrice',
        'formatCompleteTitle',
        'generateProductLink',
        'generateProductImage',
        'generateProductImageLink',
        'generateProductCombined',
        'generateStoreLink',
        'generateAnchorLink'
    ]
);

// ============================================================================
// Main Exports
// ============================================================================

const AmazonToolkit = {
    // Version
    version: '1.0.0',

    // ========================================================================
    // Helpers Namespace
    // ========================================================================
    Helpers: helperFunctions,

    // ========================================================================
    // Extractors Namespace
    // ========================================================================
    Extractors: extractorFunctions,

    // ========================================================================
    // Links Namespace
    // ========================================================================
    Links: linkFunctions,

    // ========================================================================
    // Markdown Namespace
    // ========================================================================
    Markdown: markdownFunctions,

    // ========================================================================
    // Convenience Methods (Top-level access to most common functions)
    // ========================================================================

    /**
     * Extract complete product data from a page
     * @param {Document|string} source - DOM document or HTML string
     * @param {string} [url] - Original URL
     * @returns {Object|null} Product data
     */
    extractProductData: function(source, url) {
        const fn = this.Extractors.extractProductData;
        return typeof fn === 'function' ? fn(source, url) : null;
    },

    /**
     * Extract complete store data from a page
     * @param {Document|string} source - DOM document or HTML string
     * @param {string} [url] - Original URL
     * @returns {Object|null} Store data
     */
    extractStoreData: function(source, url) {
        const fn = this.Extractors.extractStoreData;
        return typeof fn === 'function' ? fn(source, url) : null;
    },

    /**
     * Parse an Amazon URL
     * @param {string} urlString - URL to parse
     * @returns {Object|null} Parsed URL data
     */
    parseURL: function(urlString) {
        const fn = this.Links.parseAmazonURL;
        return typeof fn === 'function' ? fn(urlString) : null;
    },

    /**
     * Parse an HTML anchor element
     * @param {HTMLAnchorElement} anchor - Anchor element
     * @returns {Object|null} Parsed anchor data
     */
    parseAnchor: function(anchor) {
        const fn = this.Links.parseAmazonAnchor;
        return typeof fn === 'function' ? fn(anchor) : null;
    },

    /**
     * Generate markdown link from product data
     * @param {Object} productData - Product data structure
     * @param {Object} [options] - Generation options
     * @returns {string} Markdown link
     */
    generateProductLink: function(productData, options) {
        const fn = this.Markdown.generateProductLink;
        return typeof fn === 'function' ? fn(productData, options) : '';
    },

    /**
     * Generate markdown link from store data
     * @param {Object} storeData - Store data structure
     * @param {Object} [options] - Generation options
     * @returns {string} Markdown link
     */
    generateStoreLink: function(storeData, options) {
        const fn = this.Markdown.generateStoreLink;
        return typeof fn === 'function' ? fn(storeData, options) : '';
    },

    /**
     * Clean an Amazon URL
     * @param {string} urlString - URL to clean
     * @param {Object} [options] - Cleaning options
     * @returns {string|null} Cleaned URL
     */
    cleanURL: function(urlString, options) {
        const fn = this.Links.cleanAmazonURL;
        return typeof fn === 'function' ? fn(urlString, options) : urlString;
    },

    /**
     * Build an image URL from image ID
     * @param {string} imageId - Image ID
     * @param {Object} [options] - Image options
     * @returns {string|null} Image URL
     */
    buildImageURL: function(imageId, options) {
        const fn = this.Links.buildImageURL;
        return typeof fn === 'function' ? fn(imageId, options) : null;
    },

    /**
     * Enable or disable debug logging
     * @param {boolean} enabled - True to enable, false to disable
     * @returns {void}
     */
    setDebugMode: function(enabled) {
        const fn = this.Helpers.setDebugMode;
        if (typeof fn === 'function') {
            fn(enabled);
        }
    }
};

// ============================================================================
// Export for different environments
// ============================================================================

// Node.js / CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmazonToolkit;
}

// Browser global
if (typeof window !== 'undefined') {
    window.AmazonToolkit = AmazonToolkit;
}

// AMD
if (typeof define === 'function' && define.amd) {
    define([], function() {
        return AmazonToolkit;
    });
}
