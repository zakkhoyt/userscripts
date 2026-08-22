/**
 * @file product_extractor.js
 * @description Extracts comprehensive product data from Amazon product pages
 * @author Zakk Hoyt
 * @namespace AmazonToolkit.Extractors.Product
 * 
 * Extracts all product-related data from Amazon product pages including:
 * - Basic info (ASIN, title, brand, description)
 * - Pricing (current price, list price, savings)
 * - Images (primary image, additional images, variant images)
 * - Variants (color, size, style options)
 * - Shipping and availability
 * - Rating and review count
 * - URL data (original URL, clean URL, query parameters)
 * 
 * Returns rich data structures that contain everything needed for:
 * - URL composition (short, long, medium versions)
 * - Image URL generation (various sizes)
 * - Markdown link generation
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL MDN URL API}
 */

'use strict';

/**
 * Extracts complete product data from an Amazon product page
 * 
 * @param {Document|string} source - DOM document or HTML string
 * @param {string} [url] - Original URL (optional but recommended)
 * @returns {Object|null} Product data structure or null if extraction fails
 * 
 * @example
 * // Browser context
 * const productData = extractProductData(document, window.location.href);
 * 
 * // Node.js context with HTML string
 * const productData = extractProductData(htmlString, url);
 * 
 * // Returns:
 * {
 *   asin: 'B08N5WRWNW',
 *   title: 'Nintendo Switch – OLED Model',
 *   titleCleaned: 'Nintendo Switch – OLED Model',
 *   brand: 'Nintendo',
 *   description: 'Meet the newest member...',
 *   price: {
 *     current: '$349.99',
 *     currentValue: 349.99,
 *     currency: 'USD',
 *     list: '$359.99',
 *     savings: '$10.00',
 *     savingsPercent: '3%'
 *   },
 *   images: {
 *     primary: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_.jpg',
 *     primaryId: '61CGHv6kmWL',
 *     additional: [...],
 *     variants: {...}
 *   },
 *   variant: {
 *     type: 'Color',
 *     value: 'White',
 *     selected: true
 *   },
 *   availability: 'In Stock',
 *   shipping: 'FREE delivery',
 *   rating: {
 *     value: 4.8,
 *     count: 15234,
 *     stars: '4.8 out of 5 stars'
 *   },
 *   url: {
 *     original: 'https://www.amazon.com/dp/B08N5WRWNW?th=1&psc=1&...',
 *     originalClean: 'https://www.amazon.com/dp/B08N5WRWNW',
 *     protocol: 'https:',
 *     hostname: 'www.amazon.com',
 *     pathname: '/dp/B08N5WRWNW',
 *     queryParams: {
 *       th: '1',
 *       psc: '1',
 *       // ... all original parameters
 *     },
 *     variantParams: {
 *       th: '1',
 *       psc: '1'
 *     },
 *     trackingParams: {
 *       pd_rd_w: '...',
 *       // ... all tracking parameters
 *     }
 *   },
 *   metadata: {
 *     extractedAt: '2025-11-04T12:34:56.789Z',
 *     extractionMethod: 'product_extractor',
 *     pageType: 'product'
 *   }
 * }
 */
function extractProductData(source, url) {
    // Convert source to document if string
    let doc;
    if (typeof source === 'string') {
        doc = parseHTMLString(source);
        if (!doc) {
            logError('Failed to parse HTML string');
            return null;
        }
    } else {
        doc = source;
    }

    // Extract basic data
    const asin = extractProductASIN(doc, url);
    if (!asin) {
        logWarn('Could not extract ASIN - may not be a product page');
        return null;
    }

    // Extract all product properties
    const title = extractProductTitle(doc);
    const brand = extractProductBrand(doc);
    const description = extractProductDescription(doc);
    const priceData = extractProductPriceData(doc);
    const imageData = extractProductImageData(doc);
    const variant = extractProductVariant(doc);
    const variants = extractProductVariants(doc);
    const availability = extractProductAvailability(doc);
    const shipping = extractProductShipping(doc);
    const delivery = extractProductDelivery(doc);
    const store = extractProductStore(doc);
    const locker = extractProductLocker(doc);
    const rating = extractProductRating(doc);
    const urlData = parseURLData(url, doc);

    // Build comprehensive data structure
    const productData = {
        asin,
        title,
        titleCleaned: title ? cleanProductTitle(title) : null,
        brand,
        description,
        price: priceData,
        images: imageData,
        variant,
        variants,
        availability,
        shipping,
        delivery,
        store,
        locker,
        rating,
        url: urlData,
        metadata: {
            extractedAt: new Date().toISOString(),
            extractionMethod: 'product_extractor',
            pageType: 'product'
        }
    };

    return productData;
}

/**
 * Extracts ALL selected variant dimensions (color, size, style, …) for the current ASIN.
 *
 * Amazon renders each selected dimension as a span whose id is
 * `inline-twister-expanded-dimension-text-<dimension>_name` (e.g. `…-color_name`), with the
 * human value as text (e.g. "Beige-4 Rolls"). Variant combinations are usually distinct child
 * ASINs (see docs/.../AMAZON_URL_ANATOMY.md §Product Variants), so this reads the dimensions
 * selected on the current page.
 *
 * @param {Document} doc - DOM document
 * @returns {Array<{dimension: string, value: string}>} Ordered dimensions ([] when none)
 *
 * @example
 * // Returns: [{ dimension: 'color', value: 'Beige-4 Rolls' }, { dimension: 'size', value: '15 yards' }]
 */
function extractProductVariants(doc) {
    const out = [];
    try {
        const spans = safeQueryAll('span[id^="inline-twister-expanded-dimension-text-"]', doc);
        for (const span of spans) {
            const id = (span && span.id) || '';
            const match = id.match(/^inline-twister-expanded-dimension-text-(.+?)_name$/);
            if (!match) continue;
            const dimension = match[1];
            const value = safeText(span);
            if (dimension && value) {
                out.push({ dimension, value });
            }
        }
    } catch (error) {
        // Variants are optional
    }
    return out;
}

/**
 * Converts an Amazon delivery-time string into a whole number of days from today.
 * @param {string|null} text - e.g. "Today", "Today 2 PM - 6 PM", "Tomorrow, June 1",
 *   "Thursday, June 4", "Overnight", "One-Day", "Two-Day"
 * @returns {number|null} Days from today (0 = today, 1 = tomorrow), or null if unparseable
 */
function deliveryTimeToDays(text) {
    if (!text || typeof text !== 'string') {
        return null;
    }
    const trimmed = text.trim();
    if (/today/i.test(trimmed)) return 0;
    if (/tomorrow/i.test(trimmed)) return 1;
    // Named delivery-speed labels (arrival relative to today).
    if (/overnight/i.test(trimmed)) return 1;
    if (/\b(?:one|next)[\s-]?day\b/i.test(trimmed)) return 1;
    if (/\btwo[\s-]?day\b/i.test(trimmed)) return 2;

    // Match an explicit month + day (ignores any leading weekday like "Thursday, ")
    const match = trimmed.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\b/i);
    if (!match) {
        return null;
    }
    const months = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
    };
    const monthIdx = months[match[1].toLowerCase()];
    const day = parseInt(match[2], 10);
    if (monthIdx === undefined || isNaN(day)) {
        return null;
    }

    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let target = new Date(now.getFullYear(), monthIdx, day);
        // If the parsed date already passed, it must refer to next year (year rollover)
        if (target.getTime() < today.getTime()) {
            target = new Date(now.getFullYear() + 1, monthIdx, day);
        }
        const days = Math.round((target.getTime() - today.getTime()) / 86400000);
        return days >= 0 ? days : null;
    } catch (error) {
        return null;
    }
}

/**
 * Extracts delivery information from the primary delivery-message slot.
 *
 * The slot `#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE` holds a span carrying
 * `data-csa-c-delivery-*` attributes (time, price, type, benefit program). See the user's notes in
 * the planning references for the full attribute list.
 *
 * @param {Document} doc - DOM document
 * @returns {Object|null} { actual, inDays, price, type, program, isPrime } or null
 */
function extractProductDelivery(doc) {
    try {
        const slot = safeQuery('#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE', doc);
        if (!slot) {
            return null;
        }
        const span = slot.querySelector('[data-csa-c-delivery-time]');
        if (!span) {
            return null;
        }
        const actual = safeAttr(span, 'data-csa-c-delivery-time');
        const price = safeAttr(span, 'data-csa-c-delivery-price');
        const type = safeAttr(span, 'data-csa-c-delivery-type');
        const program = safeAttr(span, 'data-csa-c-delivery-benefit-program-id');
        return {
            actual: actual || null,
            inDays: deliveryTimeToDays(actual),
            price: price || null,
            type: type || null,
            program: program || null,
            isPrime: (program || '').toLowerCase() === 'prime'
        };
    } catch (error) {
        return null;
    }
}

/**
 * Extracts the product's brand link from the byline (`#bylineInfo`).
 *
 * The byline is the canonical brand attribution. It points either at a brand storefront
 * (`/stores/...`, e.g. "Visit the OK TAPE Store") or, when the brand has no storefront, a brand
 * search (`/s/...`, e.g. "Brand: ALLOLO"). We read ONLY the byline so we never pick up
 * sponsored-product storefront links elsewhere on the page — those carry ad params
 * (`aaxitk`/`aref`/`sref`) and render as "Click to learn more about this sponsored product".
 *
 * @param {Document} doc - DOM document
 * @returns {Object|null} `{ kind: 'store'|'search', name, url }` or null when no byline link
 */
function extractProductStore(doc) {
    try {
        const byline = safeQuery('a#bylineInfo', doc) ||
                       safeQuery('#bylineInfo a', doc) ||
                       safeQuery('#bylineInfo', doc);
        if (!byline) {
            return null;
        }
        const href = safeAttr(byline, 'href');
        if (!href) {
            return null;
        }
        const name = safeText(byline);
        let url = href;
        let pathname = href;
        try {
            const parsed = new URL(href, 'https://www.amazon.com');
            url = parsed.toString();
            pathname = parsed.pathname;
        } catch (error) {
            // keep raw href
        }
        // Classify the byline target: storefront vs. brand-search. `new URL('/s?k=x').pathname` is
        // "/s"; `new URL('/s/ref=...').pathname` is "/s/ref=...". Default to 'store' for anything else.
        let kind = 'store';
        if (pathname.indexOf('/stores/') !== -1) {
            kind = 'store';
        } else if (pathname === '/s' || pathname.indexOf('/s/') === 0) {
            kind = 'search';
        }
        return { kind, name: name || null, url };
    } catch (error) {
        return null;
    }
}

/**
 * Extracts Amazon Locker shipping state (when the user's address is a locker).
 * @param {Document} doc - DOM document
 * @returns {Object|null} { isLocker, name, location, cannotShipReason } or null when no locker signal
 */
function extractProductLocker(doc) {
    try {
        const result = { isLocker: false, name: null, location: null, cannotShipReason: null };

        const lockerLink = safeQuery('#contextualIngressPtLink', doc);
        const ariaLabel = lockerLink ? safeAttr(lockerLink, 'aria-label') : null;
        if (ariaLabel && /amazon locker/i.test(ariaLabel)) {
            result.isLocker = true;
            // e.g. "Amazon Locker - Frio - Boise 83703" -> name="Frio", location="Boise 83703"
            const parts = ariaLabel.split(' - ');
            if (parts.length >= 3) {
                result.name = parts[1].trim();
                result.location = parts.slice(2).join(' - ').trim();
            }
        }

        // "cannot ship to this locker" reason lives as an error span in the delivery slot
        const errorSpan = safeQuery('#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE span.a-color-error', doc);
        if (errorSpan) {
            result.cannotShipReason = safeText(errorSpan);
        }

        if (!result.isLocker && !result.cannotShipReason) {
            return null;
        }
        return result;
    } catch (error) {
        return null;
    }
}

/**
 * Extracts comprehensive price data including current, list, and savings
 * 
 * @param {Document} doc - DOM document
 * @returns {Object|null} Price data object or null
 * 
 * @example
 * // Returns:
 * {
 *   current: '$349.99',
 *   currentValue: 349.99,
 *   currency: 'USD',
 *   list: '$359.99',
 *   listValue: 359.99,
 *   savings: '$10.00',
 *   savingsValue: 10.00,
 *   savingsPercent: '3%'
 * }
 */
function extractProductPriceData(doc) {
    const currentPrice = extractProductPrice(doc);
    if (!currentPrice) {
        return null;
    }

    const priceData = {
        current: currentPrice,
        currentValue: parseProductPriceValue(currentPrice),
        currency: extractProductCurrency(currentPrice)
    };

    // Try to extract list price (if on sale)
    try {
        const listPriceElement = safeQuery('.a-price.a-text-price .a-offscreen', doc);
        if (listPriceElement) {
            const listPrice = safeText(listPriceElement);
            if (listPrice && listPrice !== currentPrice) {
                priceData.list = listPrice;
                priceData.listValue = parseProductPriceValue(listPrice);
                
                // Calculate savings
                if (priceData.listValue && priceData.currentValue) {
                    priceData.savingsValue = priceData.listValue - priceData.currentValue;
                    priceData.savings = `${priceData.currency}${priceData.savingsValue.toFixed(2)}`;
                    priceData.savingsPercent = `${Math.round((priceData.savingsValue / priceData.listValue) * 100)}%`;
                }
            }
        }
    } catch (error) {
        // Optional field, continue without
    }

    return priceData;
}

/**
 * Parses price string to numeric value
 * @param {string} priceStr - Price string like '$349.99'
 * @returns {number|null} Numeric price value
 */
function parseProductPriceValue(priceStr) {
    if (!priceStr) return null;
    const cleaned = priceStr.replace(/[$£€¥₹,\s]/g, '');
    const value = parseFloat(cleaned);
    return isNaN(value) ? null : value;
}

/**
 * Extracts currency symbol from price string
 * @param {string} priceStr - Price string like '$349.99'
 * @returns {string} Currency symbol or '$'
 */
function extractProductCurrency(priceStr) {
    if (!priceStr) return '$';
    const match = priceStr.match(/^([£€¥₹$])/);
    return match ? match[1] : '$';
}

/**
 * Extracts comprehensive image data including primary, additional, and variant images
 * 
 * @param {Document} doc - DOM document
 * @returns {Object} Image data object
 * 
 * @example
 * // Returns:
 * {
 *   primary: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_.jpg',
 *   primaryId: '61CGHv6kmWL',
 *   additional: [
 *     { url: 'https://...', imageId: '...' },
 *     ...
 *   ],
 *   variants: {
 *     'White': { url: '...', imageId: '...' },
 *     'Black': { url: '...', imageId: '...' }
 *   }
 * }
 */
function extractProductImageData(doc) {
    const imageData = {
        primary: null,
        primaryId: null,
        additional: [],
        variants: {}
    };

    // Extract primary image
    const primaryURL = extractProductImageURL(doc);
    if (primaryURL) {
        imageData.primary = primaryURL;
        imageData.primaryId = extractProductImageID(primaryURL);
    }

    // Extract additional images from image gallery
    try {
        const thumbnails = safeQueryAll('.imageThumbnail img', doc);
        for (const thumb of thumbnails) {
            const src = safeAttr(thumb, 'src');
            if (src && isAmazonImageURL(src)) {
                const imageId = extractProductImageID(src);
                if (imageId && imageId !== imageData.primaryId) {
                    imageData.additional.push({
                        url: src,
                        imageId
                    });
                }
            }
        }
    } catch (error) {
        // Additional images are optional
    }

    // Extract variant images
    try {
        const variantImages = safeQueryAll('.variation_color_name img', doc);
        for (const img of variantImages) {
            const src = safeAttr(img, 'src');
            const alt = safeAttr(img, 'alt');
            if (src && alt && isAmazonImageURL(src)) {
                const imageId = extractProductImageID(src);
                if (imageId) {
                    imageData.variants[alt] = {
                        url: src,
                        imageId,
                        variantName: alt
                    };
                }
            }
        }
    } catch (error) {
        // Variant images are optional
    }

    return imageData;
}

/**
 * Extracts image ID from Amazon image URL
 * @param {string} imageUrl - Amazon image URL
 * @returns {string|null} Image ID or null
 * 
 * @example
 * extractProductImageID('https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_.jpg')
 * // Returns: '61CGHv6kmWL'
 */
function extractProductImageID(imageUrl) {
    if (!imageUrl) return null;
    const match = imageUrl.match(/\/images\/I\/([A-Za-z0-9+_-]+)\./);
    return match ? match[1] : null;
}

/**
 * Extracts availability status
 * @param {Document} doc - DOM document
 * @returns {string|null} Availability status
 */
function extractProductAvailability(doc) {
    try {
        const selectors = [
            '#availability span',
            '#availability .a-declarative',
            '.a-color-success',
            '.a-color-price'
        ];

        for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
                const text = safeText(element);
                if (text) return text;
            }
        }
    } catch (error) {
        // Optional field
    }
    return null;
}

/**
 * Extracts shipping information
 * @param {Document} doc - DOM document
 * @returns {string|null} Shipping information
 */
function extractProductShipping(doc) {
    try {
        const selectors = [
            '#deliveryBlockMessage',
            '#mir-layout-DELIVERY_BLOCK',
            '.a-color-success.a-text-bold'
        ];

        for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
                const text = safeText(element);
                if (text && text.toLowerCase().includes('delivery')) {
                    return text;
                }
            }
        }
    } catch (error) {
        // Optional field
    }
    return null;
}

/**
 * Extracts rating and review information
 * @param {Document} doc - DOM document
 * @returns {Object|null} Rating data object
 * 
 * @example
 * // Returns:
 * {
 *   value: 4.8,
 *   count: 15234,
 *   stars: '4.8 out of 5 stars'
 * }
 */
function extractProductRating(doc) {
    try {
        // Extract rating value
        const ratingElement = safeQuery('[data-hook="rating-out-of-text"]', doc) ||
                             safeQuery('.a-icon-alt', doc);
        if (!ratingElement) return null;

        const ratingText = safeText(ratingElement);
        if (!ratingText) return null;

        const ratingMatch = ratingText.match(/(\d+\.?\d*)\s*out of\s*5/i);
        if (!ratingMatch) return null;

        const ratingValue = parseFloat(ratingMatch[1]);

        // Extract review count. The count element text varies ("653 global ratings", "(653)",
        // aria-label "653 Reviews"), so take the first integer rather than requiring a trailing
        // "ratings" keyword. Prefer aria-label when present, then visible text.
        let reviewCount = null;
        const countElement = safeQuery('[data-hook="total-review-count"]', doc) ||
                            safeQuery('#acrCustomerReviewText', doc);
        if (countElement) {
            const countText = safeAttr(countElement, 'aria-label') || safeText(countElement);
            if (countText) {
                const countMatch = countText.match(/([\d,]+)/);
                if (countMatch) {
                    reviewCount = parseInt(countMatch[1].replace(/,/g, ''), 10);
                }
            }
        }

        return {
            value: ratingValue,
            count: reviewCount,
            stars: ratingText
        };
    } catch (error) {
        // Optional field
    }
    return null;
}

/**
 * Parses URL into comprehensive data structure
 * Separates original URL, query parameters, variant parameters, and tracking parameters
 * 
 * @param {string} [url] - URL to parse
 * @param {Document} [doc] - Document (fallback to extract URL from canonical)
 * @returns {Object|null} URL data object
 * 
 * @example
 * // Returns:
 * {
 *   original: 'https://www.amazon.com/dp/B08N5WRWNW?th=1&psc=1&pd_rd_w=...',
 *   originalClean: 'https://www.amazon.com/dp/B08N5WRWNW',
 *   protocol: 'https:',
 *   hostname: 'www.amazon.com',
 *   pathname: '/dp/B08N5WRWNW',
 *   queryParams: { th: '1', psc: '1', pd_rd_w: '...', ... },
 *   variantParams: { th: '1', psc: '1' },
 *   trackingParams: { pd_rd_w: '...', pd_rd_r: '...', ... }
 * }
 */
function parseURLData(url, doc) {
    // Try to get URL from parameter or canonical link
    let urlString = url;
    if (!urlString && doc) {
        const canonical = safeQuery('link[rel="canonical"]', doc);
        if (canonical) {
            urlString = safeAttr(canonical, 'href');
        }
    }

    if (!urlString) {
        return null;
    }

    try {
        const urlObj = new URL(urlString);
        const queryParams = {};
        const variantParams = {};
        const trackingParams = {};

        // Parse all query parameters
        for (const [key, value] of urlObj.searchParams.entries()) {
            queryParams[key] = value;

            // Categorize parameters
            if (isVariantParameter(key)) {
                variantParams[key] = value;
            } else if (isTrackingParameter(key)) {
                trackingParams[key] = value;
            }
        }

        // Build clean URL (no tracking params)
        const cleanUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;

        return {
            original: urlString,
            originalClean: cleanUrl,
            protocol: urlObj.protocol,
            hostname: urlObj.hostname,
            pathname: urlObj.pathname,
            queryParams,
            variantParams,
            trackingParams
        };
    } catch (error) {
        logError('Failed to parse URL:', error);
        return null;
    }
}

/**
 * Checks if a query parameter is a variant parameter
 * @param {string} key - Parameter key
 * @returns {boolean} True if variant parameter
 */
function isVariantParameter(key) {
    const variantParams = ['th', 'psc', 'smid'];
    return variantParams.includes(key.toLowerCase());
}

/**
 * Checks if a query parameter is a tracking parameter
 * @param {string} key - Parameter key
 * @returns {boolean} True if tracking parameter
 */
function isTrackingParameter(key) {
    const trackingPrefixes = ['pd_rd_', 'pf_rd_', '_encoding', 'qid', 'sr', 'keywords', 'crid', 'sprefix', 'dib', 'tag', 'linkCode', 'linkId', 'ref', 'ref_'];
    return trackingPrefixes.some(prefix => key.toLowerCase().startsWith(prefix));
}

/**
 * Parses HTML string into DOM document
 * @param {string} htmlString - HTML string
 * @returns {Document|null} Parsed document
 */
function parseHTMLString(htmlString) {
    if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        return parser.parseFromString(htmlString, 'text/html');
    }
    return null;
}

// ---------------------------------------------------------------------------
// Module wiring
//
// The per-field extractors (ASIN/title/price/variant/…) live in shared_extractor.js.
// Resolve that module at CALL time — in the browser via the registry that shared_extractor
// populates on load (window.__AmazonToolkitModules), in Node via require — so that
// extractProductData() runs the REAL implementations instead of null stubs.
// The DOM helpers are tiny querySelector wrappers, implemented locally.
// ---------------------------------------------------------------------------

function getSharedExtractor() {
    if (typeof window !== 'undefined' && window.__AmazonToolkitModules) {
        return window.__AmazonToolkitModules['extractors/shared_extractor'] || {};
    }
    try {
        return require('./shared_extractor');
    } catch (error) {
        return {};
    }
}

function extractProductASIN(doc, url) {
    const shared = getSharedExtractor();
    return typeof shared.extractProductASIN === 'function' ? shared.extractProductASIN(doc, url) : null;
}
function extractProductTitle(doc) {
    const shared = getSharedExtractor();
    return typeof shared.extractProductTitle === 'function' ? shared.extractProductTitle(doc) : null;
}
function cleanProductTitle(title) {
    const shared = getSharedExtractor();
    return typeof shared.cleanProductTitle === 'function' ? shared.cleanProductTitle(title) : title;
}
function extractProductBrand(doc) {
    const shared = getSharedExtractor();
    return typeof shared.extractProductBrand === 'function' ? shared.extractProductBrand(doc) : null;
}
function extractProductDescription(doc) {
    const shared = getSharedExtractor();
    return typeof shared.extractProductDescription === 'function' ? shared.extractProductDescription(doc) : null;
}
function extractProductPrice(doc) {
    const shared = getSharedExtractor();
    return typeof shared.extractProductPrice === 'function' ? shared.extractProductPrice(doc) : null;
}
function extractProductImageURL(doc) {
    const shared = getSharedExtractor();
    return typeof shared.extractProductImageURL === 'function' ? shared.extractProductImageURL(doc) : null;
}
function extractProductVariant(doc) {
    const shared = getSharedExtractor();
    return typeof shared.extractProductVariant === 'function' ? shared.extractProductVariant(doc) : null;
}

// Local DOM helpers — mirror shared_extractor's private querySelector wrappers.
function safeQuery(selector, context = (typeof document !== 'undefined' ? document : null)) {
    try {
        return context ? context.querySelector(selector) : null;
    } catch (error) {
        return null;
    }
}
function safeQueryAll(selector, context = (typeof document !== 'undefined' ? document : null)) {
    try {
        return context ? Array.from(context.querySelectorAll(selector)) : [];
    } catch (error) {
        return [];
    }
}
function safeText(element) {
    if (!element) return null;
    const text = element.textContent || '';
    return text.trim() || null;
}
function safeAttr(element, attr) {
    if (!element) return null;
    const value = element.getAttribute(attr);
    return value ? value.trim() : null;
}
function isAmazonImageURL(value) {
    if (!value || typeof value !== 'string') return false;
    try {
        const url = new URL(value);
        const imageHosts = ['m.media-amazon.com', 'images-na.ssl-images-amazon.com', 'images-amazon.com', 'ecx.images-amazon.com'];
        return imageHosts.some(host => url.hostname === host || url.hostname.endsWith('.' + host));
    } catch (error) {
        return false;
    }
}
function logWarn(...args) { try { console.warn('[amazon_toolkit/product]', ...args); } catch (error) { /* noop */ } }
function logError(...args) { try { console.error('[amazon_toolkit/product]', ...args); } catch (error) { /* noop */ } }

const ProductExtractor = {
    extractProductData,
    extractProductPriceData,
    extractProductImageData,
    extractProductImageID,
    extractProductVariants,
    extractProductAvailability,
    extractProductShipping,
    extractProductDelivery,
    deliveryTimeToDays,
    extractProductStore,
    extractProductLocker,
    extractProductRating,
    parseProductPriceValue,
    extractProductCurrency,
    parseURLData,
    isVariantParameter,
    isTrackingParameter
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductExtractor;
}

if (typeof window !== 'undefined') {
    window.__AmazonToolkitModules = window.__AmazonToolkitModules || {};
    window.__AmazonToolkitModules['extractors/product_extractor'] = ProductExtractor;
}
