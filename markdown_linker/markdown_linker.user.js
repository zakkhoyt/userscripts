// ==UserScript==
// @name         Markdown Linker
// @namespace    https://github.com/zakkhoyt/greasemonkey/markdown_linker
// @version      1.0.0
// @description  Convert URLs to markdown links — configurable key triggers (defaults: V=menu, B=quiet copy, hold Z+click=buffer)
// @downloadURL  https://raw.githubusercontent.com/zakkhoyt/userscripts/zakk/markdown_linker_domains/markdown_linker/markdown_linker.user.js
// @updateURL    https://raw.githubusercontent.com/zakkhoyt/userscripts/zakk/markdown_linker_domains/markdown_linker/markdown_linker.user.js
// @author       Zakk Hoyt
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @run-at       document-idle
// @noframes
// ==/UserScript==
'use strict';

(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // ../../common/amazon_toolkit/helpers/validation_helpers.js
  var require_validation_helpers = __commonJS({
    "../../common/amazon_toolkit/helpers/validation_helpers.js"(exports, module) {
      "use strict";
      var ASIN_PATTERN = /^[A-Z0-9]{10}$/;
      var PRODUCT_URL_PATTERNS = [
        /\/dp\/[A-Z0-9]{10}/i,
        /\/gp\/product\/[A-Z0-9]{10}/i,
        /\/o\/ASIN\/[A-Z0-9]{10}/i,
        /\/exec\/obidos\/ASIN\/[A-Z0-9]{10}/i
      ];
      var STORE_URL_PATTERNS = [
        /\/stores\/[^\/]+\/page\/[A-Z0-9-]+/i,
        /\/s\?me=/i,
        /\/s\?marketplaceID=/i
      ];
      var AMAZON_DOMAIN_PATTERN = /^(www\.)?amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)$/i;
      function isValidASIN(value) {
        if (!value || typeof value !== "string") {
          return false;
        }
        return ASIN_PATTERN.test(value);
      }
      function isValidURL(value) {
        if (!value || typeof value !== "string") {
          return false;
        }
        try {
          new URL(value);
          return true;
        } catch (error) {
          return false;
        }
      }
      function isAmazonURL(value) {
        if (!value) {
          return false;
        }
        try {
          const url = typeof value === "string" ? new URL(value) : value;
          return AMAZON_DOMAIN_PATTERN.test(url.hostname);
        } catch (error) {
          return false;
        }
      }
      function isAmazonProductURL(value) {
        if (!isAmazonURL(value)) {
          return false;
        }
        try {
          const url = typeof value === "string" ? new URL(value) : value;
          const pathname = url.pathname;
          return PRODUCT_URL_PATTERNS.some((pattern) => pattern.test(pathname));
        } catch (error) {
          return false;
        }
      }
      function isAmazonStoreURL(value) {
        if (!isAmazonURL(value)) {
          return false;
        }
        try {
          const url = typeof value === "string" ? new URL(value) : value;
          const pathname = url.pathname;
          const search = url.search;
          return STORE_URL_PATTERNS.some((pattern) => pattern.test(pathname) || pattern.test(search));
        } catch (error) {
          return false;
        }
      }
      function isAmazonImageURL(value) {
        if (!value || typeof value !== "string") {
          return false;
        }
        try {
          const url = new URL(value);
          const imageHosts = [
            "m.media-amazon.com",
            "images-na.ssl-images-amazon.com",
            "images-amazon.com",
            "ecx.images-amazon.com"
          ];
          return imageHosts.some((host) => url.hostname === host || url.hostname.endsWith("." + host));
        } catch (error) {
          return false;
        }
      }
      function isNonEmptyString(value) {
        return typeof value === "string" && value.trim().length > 0;
      }
      function isValidPrice(value) {
        if (!isNonEmptyString(value)) {
          return false;
        }
        const cleaned = value.replace(/[$£€¥₹,\s]/g, "");
        const num = parseFloat(cleaned);
        return !isNaN(num) && num >= 0;
      }
      function isNonEmptyArray(value) {
        return Array.isArray(value) && value.length > 0;
      }
      function isNonEmptyObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;
      }
      function isValidElement(value) {
        return value instanceof Element;
      }
      function isValidDocument(value) {
        if (typeof Document !== "undefined") {
          return value instanceof Document;
        }
        return value && typeof value.querySelector === "function";
      }
      var ValidationHelpers = {
        ASIN_PATTERN,
        PRODUCT_URL_PATTERNS,
        STORE_URL_PATTERNS,
        AMAZON_DOMAIN_PATTERN,
        isValidASIN,
        isValidURL,
        isAmazonURL,
        isAmazonProductURL,
        isAmazonStoreURL,
        isAmazonImageURL,
        isNonEmptyString,
        isValidPrice,
        isNonEmptyArray,
        isNonEmptyObject,
        isValidElement,
        isValidDocument
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = ValidationHelpers;
      }
      if (typeof window !== "undefined") {
        window.__AmazonToolkitModules = window.__AmazonToolkitModules || {};
        window.__AmazonToolkitModules["helpers/validation_helpers"] = ValidationHelpers;
      }
    }
  });

  // ../../common/amazon_toolkit/extractors/shared_extractor.js
  var require_shared_extractor = __commonJS({
    "../../common/amazon_toolkit/extractors/shared_extractor.js"(exports, module) {
      "use strict";
      function extractProductASIN(doc, url) {
        try {
          const jsonLdData = parseJsonLD(doc);
          for (const data of jsonLdData) {
            if (data["@type"] === "Product" && data.sku) {
              const sku = String(data.sku).trim();
              if (isValidASIN(sku)) {
                return sku;
              }
            }
          }
        } catch (error) {
        }
        if (url) {
          try {
            const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})/i);
            if (dpMatch) {
              const asin = dpMatch[1].toUpperCase();
              if (isValidASIN(asin)) {
                return asin;
              }
            }
            const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
            if (gpMatch) {
              const asin = gpMatch[1].toUpperCase();
              if (isValidASIN(asin)) {
                return asin;
              }
            }
            const oMatch = url.match(/\/o\/ASIN\/([A-Z0-9]{10})/i);
            if (oMatch) {
              const asin = oMatch[1].toUpperCase();
              if (isValidASIN(asin)) {
                return asin;
              }
            }
            const obidosMatch = url.match(/\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/i);
            if (obidosMatch) {
              const asin = obidosMatch[1].toUpperCase();
              if (isValidASIN(asin)) {
                return asin;
              }
            }
          } catch (error) {
          }
        }
        try {
          const selectors = [
            "[data-asin]",
            "[data-product-asin]",
            'input[name="ASIN"]'
          ];
          for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
              const asin = (safeAttr(element, "data-asin") || safeAttr(element, "data-product-asin") || safeAttr(element, "value") || "").toUpperCase();
              if (isValidASIN(asin)) {
                return asin;
              }
            }
          }
        } catch (error) {
        }
        try {
          const html = doc.documentElement.outerHTML;
          const asinMatch1 = html.match(/"asin"\s*:\s*"([A-Z0-9]{10})"/i);
          if (asinMatch1) {
            const asin = asinMatch1[1].toUpperCase();
            if (isValidASIN(asin)) {
              return asin;
            }
          }
          const asinMatch2 = html.match(/asin\s*:\s*'([A-Z0-9]{10})'/i);
          if (asinMatch2) {
            const asin = asinMatch2[1].toUpperCase();
            if (isValidASIN(asin)) {
              return asin;
            }
          }
        } catch (error) {
        }
        return null;
      }
      function extractProductTitle(doc) {
        const candidates = [];
        try {
          const jsonLdData = parseJsonLD(doc);
          for (const data of jsonLdData) {
            if (data["@type"] === "Product" && data.name) {
              candidates.push(String(data.name));
            }
          }
        } catch (error) {
        }
        try {
          const ogTitle = getMetaByProperty("og:title", doc);
          if (ogTitle) candidates.push(ogTitle);
          const twitterTitle = getMetaByProperty("twitter:title", doc);
          if (twitterTitle) candidates.push(twitterTitle);
        } catch (error) {
        }
        try {
          const productTitle = safeQuery("#productTitle", doc);
          if (productTitle) {
            const text = safeText(productTitle);
            if (text) candidates.push(text);
          }
          const itemName = safeQuery('span[id="productTitle"]', doc);
          if (itemName) {
            const text = safeText(itemName);
            if (text) candidates.push(text);
          }
        } catch (error) {
        }
        try {
          const titleElement = safeQuery("title", doc);
          if (titleElement) {
            let titleText = safeText(titleElement);
            if (titleText) {
              titleText = titleText.replace(/\s*[-:]\s*Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*$/i, "");
              if (titleText) candidates.push(titleText);
            }
          }
        } catch (error) {
        }
        if (candidates.length === 0) {
          return null;
        }
        const cleaned = candidates.map((title) => cleanProductTitle(title)).filter((title) => title && title.length > 0).sort((a, b) => a.length - b.length);
        return cleaned.length > 0 ? cleaned[0] : null;
      }
      function cleanProductTitle(title) {
        if (!title) return "";
        let cleaned = title.trim();
        cleaned = cleaned.replace(/^Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*:\s*/i, "");
        cleaned = cleaned.replace(/\s+at\s+Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*$/i, "");
        const colonIndex = cleaned.indexOf(" : ");
        if (colonIndex > 0) {
          cleaned = cleaned.substring(0, colonIndex);
        }
        return cleaned.trim();
      }
      function extractProductBrand(doc) {
        try {
          const jsonLdData = parseJsonLD(doc);
          for (const data of jsonLdData) {
            if (data["@type"] === "Product" && data.brand) {
              if (typeof data.brand === "object" && data.brand.name) {
                return String(data.brand.name).trim();
              } else if (typeof data.brand === "string") {
                return data.brand.trim();
              }
            }
          }
        } catch (error) {
        }
        try {
          const bylineInfo = safeQuery("#bylineInfo", doc);
          if (bylineInfo) {
            let text = safeText(bylineInfo);
            if (text) {
              text = text.replace(/^(Visit the|Brand:)\s*/i, "");
              text = text.replace(/\s+Store$/i, "");
              if (text) return text.trim();
            }
          }
        } catch (error) {
        }
        try {
          const brandLink = safeQuery("a#bylineInfo", doc);
          if (brandLink) {
            const text = safeText(brandLink);
            if (text) {
              const cleaned = text.replace(/^(Visit the|Brand:)\s*/i, "").replace(/\s+Store$/i, "");
              if (cleaned) return cleaned.trim();
            }
          }
        } catch (error) {
        }
        try {
          const brandMeta = getMetaByName("brand", doc);
          if (brandMeta) return brandMeta;
        } catch (error) {
        }
        return null;
      }
      function extractProductDescription(doc) {
        try {
          const jsonLdData = parseJsonLD(doc);
          for (const data of jsonLdData) {
            if (data["@type"] === "Product" && data.description) {
              return String(data.description).trim();
            }
          }
        } catch (error) {
        }
        try {
          const ogDesc = getMetaByProperty("og:description", doc);
          if (ogDesc) return ogDesc;
          const metaDesc = getMetaByName("description", doc);
          if (metaDesc) return metaDesc;
        } catch (error) {
        }
        try {
          const productDesc = safeQuery("#productDescription", doc);
          if (productDesc) {
            const text = safeText(productDesc);
            if (text) return text;
          }
          const featureBullets = safeQuery("#feature-bullets", doc);
          if (featureBullets) {
            const text = safeText(featureBullets);
            if (text) return text;
          }
        } catch (error) {
        }
        return null;
      }
      function extractProductPrice(doc) {
        try {
          const jsonLdData = parseJsonLD(doc);
          for (const data of jsonLdData) {
            if (data["@type"] === "Product" && data.offers) {
              const offers = Array.isArray(data.offers) ? data.offers : [data.offers];
              for (const offer of offers) {
                if (offer.price) {
                  const currency = offer.priceCurrency || "$";
                  return `${currency}${offer.price}`;
                }
              }
            }
          }
        } catch (error) {
        }
        try {
          const offscreenElement = safeQuery(".a-price .a-offscreen", doc);
          if (offscreenElement) {
            const text = safeText(offscreenElement);
            if (text && isValidPrice(text)) {
              return text;
            }
          }
        } catch (error) {
        }
        try {
          const wholeElement = safeQuery(".a-price-whole", doc);
          if (wholeElement) {
            const whole = (safeText(wholeElement) || "").replace(/[^\d]/g, "");
            if (whole) {
              const scope = wholeElement.parentElement || doc;
              const symbolRaw = safeText(safeQuery(".a-price-symbol", scope)) || "$";
              const symbol = symbolRaw.replace(/\s/g, "") || "$";
              const fractionElement = safeQuery(".a-price-fraction", scope);
              const fraction = fractionElement ? (safeText(fractionElement) || "").replace(/[^\d]/g, "") : "";
              return fraction ? `${symbol}${whole}.${fraction}` : `${symbol}${whole}`;
            }
          }
        } catch (error) {
        }
        try {
          const legacySelectors = ["#priceblock_ourprice", "#priceblock_dealprice", "#priceblock_saleprice"];
          for (const selector of legacySelectors) {
            const element = safeQuery(selector, doc);
            if (element) {
              const text = safeText(element);
              if (text && isValidPrice(text)) {
                return text;
              }
            }
          }
        } catch (error) {
        }
        return null;
      }
      function extractProductImageURL(doc) {
        try {
          const jsonLdData = parseJsonLD(doc);
          for (const data of jsonLdData) {
            if (data["@type"] === "Product" && data.image) {
              if (Array.isArray(data.image) && data.image.length > 0) {
                return String(data.image[0]).trim();
              } else if (typeof data.image === "string") {
                return data.image.trim();
              }
            }
          }
        } catch (error) {
        }
        try {
          const ogImage = getMetaByProperty("og:image", doc);
          if (ogImage && isAmazonImageURL(ogImage)) {
            return ogImage;
          }
        } catch (error) {
        }
        try {
          const landingImage = safeQuery("#landingImage", doc);
          if (landingImage) {
            const hiRes = safeAttr(landingImage, "data-old-hires");
            if (hiRes && isAmazonImageURL(hiRes)) {
              return hiRes;
            }
            const dynamicImage = safeAttr(landingImage, "data-a-dynamic-image");
            if (dynamicImage) {
              try {
                const imageData = JSON.parse(dynamicImage);
                const urls = Object.keys(imageData);
                if (urls.length > 0) {
                  return urls[0];
                }
              } catch (jsonError) {
              }
            }
            const src = safeAttr(landingImage, "src");
            if (src && isAmazonImageURL(src)) {
              return src;
            }
          }
          const imgBlkFront = safeQuery("#imgBlkFront", doc);
          if (imgBlkFront) {
            const src = safeAttr(imgBlkFront, "src");
            if (src && isAmazonImageURL(src)) {
              return src;
            }
          }
        } catch (error) {
        }
        return null;
      }
      function extractProductVariant(doc) {
        try {
          const selectors = [
            "#variation_color_name .selection",
            "#variation_size_name .selection",
            "#variation_style_name .selection"
          ];
          for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
              const value = safeText(element);
              if (value) {
                const type = selector.includes("color") ? "Color" : selector.includes("size") ? "Size" : selector.includes("style") ? "Style" : "Variant";
                return { type, value };
              }
            }
          }
        } catch (error) {
        }
        return null;
      }
      function safeQuery(selector, context = document) {
        try {
          return context.querySelector(selector);
        } catch (e) {
          return null;
        }
      }
      function safeText(element) {
        if (!element) return null;
        const text = element.textContent || "";
        return text.trim() || null;
      }
      function safeAttr(element, attr) {
        if (!element) return null;
        const value = element.getAttribute(attr);
        return value ? value.trim() : null;
      }
      function parseJsonLD(doc) {
        const results = [];
        try {
          const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
          for (const script of scripts) {
            try {
              const text = script.textContent || script.innerText;
              if (text) {
                results.push(JSON.parse(text));
              }
            } catch (e) {
              continue;
            }
          }
        } catch (e) {
        }
        return results;
      }
      function getMetaByProperty(property, doc = document) {
        try {
          const meta = doc.querySelector(`meta[property="${property}"]`);
          return meta ? (meta.getAttribute("content") || "").trim() || null : null;
        } catch (e) {
          return null;
        }
      }
      function getMetaByName(name, doc = document) {
        try {
          const meta = doc.querySelector(`meta[name="${name}"]`);
          return meta ? (meta.getAttribute("content") || "").trim() || null : null;
        } catch (e) {
          return null;
        }
      }
      function isValidASIN(value) {
        if (!value || typeof value !== "string") return false;
        return /^[A-Z0-9]{10}$/.test(value);
      }
      function isValidPrice(value) {
        if (!value || typeof value !== "string") return false;
        const cleaned = value.replace(/[$£€¥₹,\s]/g, "");
        const num = parseFloat(cleaned);
        return !isNaN(num) && num >= 0;
      }
      function isAmazonImageURL(value) {
        if (!value || typeof value !== "string") return false;
        try {
          const url = new URL(value);
          const imageHosts = [
            "m.media-amazon.com",
            "images-na.ssl-images-amazon.com",
            "images-amazon.com",
            "ecx.images-amazon.com"
          ];
          return imageHosts.some((host) => url.hostname === host || url.hostname.endsWith("." + host));
        } catch (e) {
          return false;
        }
      }
      var SharedExtractor = {
        extractProductASIN,
        extractProductTitle,
        cleanProductTitle,
        extractProductBrand,
        extractProductDescription,
        extractProductPrice,
        extractProductImageURL,
        extractProductVariant
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = SharedExtractor;
      }
      if (typeof window !== "undefined") {
        window.__AmazonToolkitModules = window.__AmazonToolkitModules || {};
        window.__AmazonToolkitModules["extractors/shared_extractor"] = SharedExtractor;
      }
    }
  });

  // ../../common/amazon_toolkit/extractors/product_extractor.js
  var require_product_extractor = __commonJS({
    "../../common/amazon_toolkit/extractors/product_extractor.js"(exports, module) {
      "use strict";
      function extractProductData(source, url) {
        let doc;
        if (typeof source === "string") {
          doc = parseHTMLString(source);
          if (!doc) {
            logError("Failed to parse HTML string");
            return null;
          }
        } else {
          doc = source;
        }
        const asin = extractProductASIN(doc, url);
        if (!asin) {
          logWarn("Could not extract ASIN - may not be a product page");
          return null;
        }
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
            extractedAt: (/* @__PURE__ */ new Date()).toISOString(),
            extractionMethod: "product_extractor",
            pageType: "product"
          }
        };
        return productData;
      }
      function extractProductVariants(doc) {
        const out = [];
        try {
          const spans = safeQueryAll('span[id^="inline-twister-expanded-dimension-text-"]', doc);
          for (const span of spans) {
            const id = span && span.id || "";
            const match = id.match(/^inline-twister-expanded-dimension-text-(.+?)_name$/);
            if (!match) continue;
            const dimension = match[1];
            const value = safeText(span);
            if (dimension && value) {
              out.push({ dimension, value });
            }
          }
        } catch (error) {
        }
        return out;
      }
      function deliveryTimeToDays(text) {
        if (!text || typeof text !== "string") {
          return null;
        }
        const trimmed = text.trim();
        if (/today/i.test(trimmed)) return 0;
        if (/tomorrow/i.test(trimmed)) return 1;
        if (/overnight/i.test(trimmed)) return 1;
        if (/\b(?:one|next)[\s-]?day\b/i.test(trimmed)) return 1;
        if (/\btwo[\s-]?day\b/i.test(trimmed)) return 2;
        const match = trimmed.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\b/i);
        if (!match) {
          return null;
        }
        const months = {
          january: 0,
          february: 1,
          march: 2,
          april: 3,
          may: 4,
          june: 5,
          july: 6,
          august: 7,
          september: 8,
          october: 9,
          november: 10,
          december: 11
        };
        const monthIdx = months[match[1].toLowerCase()];
        const day = parseInt(match[2], 10);
        if (monthIdx === void 0 || isNaN(day)) {
          return null;
        }
        try {
          const now = /* @__PURE__ */ new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          let target = new Date(now.getFullYear(), monthIdx, day);
          if (target.getTime() < today.getTime()) {
            target = new Date(now.getFullYear() + 1, monthIdx, day);
          }
          const days = Math.round((target.getTime() - today.getTime()) / 864e5);
          return days >= 0 ? days : null;
        } catch (error) {
          return null;
        }
      }
      function extractProductDelivery(doc) {
        try {
          const slot = safeQuery("#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE", doc);
          if (!slot) {
            return null;
          }
          const span = slot.querySelector("[data-csa-c-delivery-time]");
          if (!span) {
            return null;
          }
          const actual = safeAttr(span, "data-csa-c-delivery-time");
          const price = safeAttr(span, "data-csa-c-delivery-price");
          const type = safeAttr(span, "data-csa-c-delivery-type");
          const program = safeAttr(span, "data-csa-c-delivery-benefit-program-id");
          return {
            actual: actual || null,
            inDays: deliveryTimeToDays(actual),
            price: price || null,
            type: type || null,
            program: program || null,
            isPrime: (program || "").toLowerCase() === "prime"
          };
        } catch (error) {
          return null;
        }
      }
      function extractProductStore(doc) {
        try {
          const byline = safeQuery("a#bylineInfo", doc) || safeQuery("#bylineInfo a", doc) || safeQuery("#bylineInfo", doc);
          if (!byline) {
            return null;
          }
          const href = safeAttr(byline, "href");
          if (!href) {
            return null;
          }
          const name = safeText(byline);
          let url = href;
          let pathname = href;
          try {
            const parsed = new URL(href, "https://www.amazon.com");
            url = parsed.toString();
            pathname = parsed.pathname;
          } catch (error) {
          }
          let kind = "store";
          if (pathname.indexOf("/stores/") !== -1) {
            kind = "store";
          } else if (pathname === "/s" || pathname.indexOf("/s/") === 0) {
            kind = "search";
          }
          return { kind, name: name || null, url };
        } catch (error) {
          return null;
        }
      }
      function extractProductLocker(doc) {
        try {
          const result = { isLocker: false, name: null, location: null, cannotShipReason: null };
          const lockerLink = safeQuery("#contextualIngressPtLink", doc);
          const ariaLabel = lockerLink ? safeAttr(lockerLink, "aria-label") : null;
          if (ariaLabel && /amazon locker/i.test(ariaLabel)) {
            result.isLocker = true;
            const parts = ariaLabel.split(" - ");
            if (parts.length >= 3) {
              result.name = parts[1].trim();
              result.location = parts.slice(2).join(" - ").trim();
            }
          }
          const errorSpan = safeQuery("#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE span.a-color-error", doc);
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
        try {
          const listPriceElement = safeQuery(".a-price.a-text-price .a-offscreen", doc);
          if (listPriceElement) {
            const listPrice = safeText(listPriceElement);
            if (listPrice && listPrice !== currentPrice) {
              priceData.list = listPrice;
              priceData.listValue = parseProductPriceValue(listPrice);
              if (priceData.listValue && priceData.currentValue) {
                priceData.savingsValue = priceData.listValue - priceData.currentValue;
                priceData.savings = `${priceData.currency}${priceData.savingsValue.toFixed(2)}`;
                priceData.savingsPercent = `${Math.round(priceData.savingsValue / priceData.listValue * 100)}%`;
              }
            }
          }
        } catch (error) {
        }
        return priceData;
      }
      function parseProductPriceValue(priceStr) {
        if (!priceStr) return null;
        const cleaned = priceStr.replace(/[$£€¥₹,\s]/g, "");
        const value = parseFloat(cleaned);
        return isNaN(value) ? null : value;
      }
      function extractProductCurrency(priceStr) {
        if (!priceStr) return "$";
        const match = priceStr.match(/^([£€¥₹$])/);
        return match ? match[1] : "$";
      }
      function extractProductImageData(doc) {
        const imageData = {
          primary: null,
          primaryId: null,
          additional: [],
          variants: {}
        };
        const primaryURL = extractProductImageURL(doc);
        if (primaryURL) {
          imageData.primary = primaryURL;
          imageData.primaryId = extractProductImageID(primaryURL);
        }
        try {
          const thumbnails = safeQueryAll(".imageThumbnail img", doc);
          for (const thumb of thumbnails) {
            const src = safeAttr(thumb, "src");
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
        }
        try {
          const variantImages = safeQueryAll(".variation_color_name img", doc);
          for (const img of variantImages) {
            const src = safeAttr(img, "src");
            const alt = safeAttr(img, "alt");
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
        }
        return imageData;
      }
      function extractProductImageID(imageUrl) {
        if (!imageUrl) return null;
        const match = imageUrl.match(/\/images\/I\/([A-Za-z0-9+_-]+)\./);
        return match ? match[1] : null;
      }
      function extractProductAvailability(doc) {
        try {
          const selectors = [
            "#availability span",
            "#availability .a-declarative",
            ".a-color-success",
            ".a-color-price"
          ];
          for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
              const text = safeText(element);
              if (text) return text;
            }
          }
        } catch (error) {
        }
        return null;
      }
      function extractProductShipping(doc) {
        try {
          const selectors = [
            "#deliveryBlockMessage",
            "#mir-layout-DELIVERY_BLOCK",
            ".a-color-success.a-text-bold"
          ];
          for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
              const text = safeText(element);
              if (text && text.toLowerCase().includes("delivery")) {
                return text;
              }
            }
          }
        } catch (error) {
        }
        return null;
      }
      function extractProductRating(doc) {
        try {
          const ratingElement = safeQuery('[data-hook="rating-out-of-text"]', doc) || safeQuery(".a-icon-alt", doc);
          if (!ratingElement) return null;
          const ratingText = safeText(ratingElement);
          if (!ratingText) return null;
          const ratingMatch = ratingText.match(/(\d+\.?\d*)\s*out of\s*5/i);
          if (!ratingMatch) return null;
          const ratingValue = parseFloat(ratingMatch[1]);
          let reviewCount = null;
          const countElement = safeQuery('[data-hook="total-review-count"]', doc) || safeQuery("#acrCustomerReviewText", doc);
          if (countElement) {
            const countText = safeAttr(countElement, "aria-label") || safeText(countElement);
            if (countText) {
              const countMatch = countText.match(/([\d,]+)/);
              if (countMatch) {
                reviewCount = parseInt(countMatch[1].replace(/,/g, ""), 10);
              }
            }
          }
          return {
            value: ratingValue,
            count: reviewCount,
            stars: ratingText
          };
        } catch (error) {
        }
        return null;
      }
      function parseURLData(url, doc) {
        let urlString = url;
        if (!urlString && doc) {
          const canonical = safeQuery('link[rel="canonical"]', doc);
          if (canonical) {
            urlString = safeAttr(canonical, "href");
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
          for (const [key, value] of urlObj.searchParams.entries()) {
            queryParams[key] = value;
            if (isVariantParameter(key)) {
              variantParams[key] = value;
            } else if (isTrackingParameter(key)) {
              trackingParams[key] = value;
            }
          }
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
          logError("Failed to parse URL:", error);
          return null;
        }
      }
      function isVariantParameter(key) {
        const variantParams = ["th", "psc", "smid"];
        return variantParams.includes(key.toLowerCase());
      }
      function isTrackingParameter(key) {
        const trackingPrefixes = ["pd_rd_", "pf_rd_", "_encoding", "qid", "sr", "keywords", "crid", "sprefix", "dib", "tag", "linkCode", "linkId", "ref", "ref_"];
        return trackingPrefixes.some((prefix) => key.toLowerCase().startsWith(prefix));
      }
      function parseHTMLString(htmlString) {
        if (typeof DOMParser !== "undefined") {
          const parser = new DOMParser();
          return parser.parseFromString(htmlString, "text/html");
        }
        return null;
      }
      function getSharedExtractor() {
        if (typeof window !== "undefined" && window.__AmazonToolkitModules) {
          return window.__AmazonToolkitModules["extractors/shared_extractor"] || {};
        }
        try {
          return require_shared_extractor();
        } catch (error) {
          return {};
        }
      }
      function extractProductASIN(doc, url) {
        const shared = getSharedExtractor();
        return typeof shared.extractProductASIN === "function" ? shared.extractProductASIN(doc, url) : null;
      }
      function extractProductTitle(doc) {
        const shared = getSharedExtractor();
        return typeof shared.extractProductTitle === "function" ? shared.extractProductTitle(doc) : null;
      }
      function cleanProductTitle(title) {
        const shared = getSharedExtractor();
        return typeof shared.cleanProductTitle === "function" ? shared.cleanProductTitle(title) : title;
      }
      function extractProductBrand(doc) {
        const shared = getSharedExtractor();
        return typeof shared.extractProductBrand === "function" ? shared.extractProductBrand(doc) : null;
      }
      function extractProductDescription(doc) {
        const shared = getSharedExtractor();
        return typeof shared.extractProductDescription === "function" ? shared.extractProductDescription(doc) : null;
      }
      function extractProductPrice(doc) {
        const shared = getSharedExtractor();
        return typeof shared.extractProductPrice === "function" ? shared.extractProductPrice(doc) : null;
      }
      function extractProductImageURL(doc) {
        const shared = getSharedExtractor();
        return typeof shared.extractProductImageURL === "function" ? shared.extractProductImageURL(doc) : null;
      }
      function extractProductVariant(doc) {
        const shared = getSharedExtractor();
        return typeof shared.extractProductVariant === "function" ? shared.extractProductVariant(doc) : null;
      }
      function safeQuery(selector, context = typeof document !== "undefined" ? document : null) {
        try {
          return context ? context.querySelector(selector) : null;
        } catch (error) {
          return null;
        }
      }
      function safeQueryAll(selector, context = typeof document !== "undefined" ? document : null) {
        try {
          return context ? Array.from(context.querySelectorAll(selector)) : [];
        } catch (error) {
          return [];
        }
      }
      function safeText(element) {
        if (!element) return null;
        const text = element.textContent || "";
        return text.trim() || null;
      }
      function safeAttr(element, attr) {
        if (!element) return null;
        const value = element.getAttribute(attr);
        return value ? value.trim() : null;
      }
      function isAmazonImageURL(value) {
        if (!value || typeof value !== "string") return false;
        try {
          const url = new URL(value);
          const imageHosts = ["m.media-amazon.com", "images-na.ssl-images-amazon.com", "images-amazon.com", "ecx.images-amazon.com"];
          return imageHosts.some((host) => url.hostname === host || url.hostname.endsWith("." + host));
        } catch (error) {
          return false;
        }
      }
      function logWarn(...args) {
        try {
          console.warn("[amazon_toolkit/product]", ...args);
        } catch (error) {
        }
      }
      function logError(...args) {
        try {
          console.error("[amazon_toolkit/product]", ...args);
        } catch (error) {
        }
      }
      var ProductExtractor = {
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
      if (typeof module !== "undefined" && module.exports) {
        module.exports = ProductExtractor;
      }
      if (typeof window !== "undefined") {
        window.__AmazonToolkitModules = window.__AmazonToolkitModules || {};
        window.__AmazonToolkitModules["extractors/product_extractor"] = ProductExtractor;
      }
    }
  });

  // ../../common/amazon_toolkit/extractors/store_extractor.js
  var require_store_extractor = __commonJS({
    "../../common/amazon_toolkit/extractors/store_extractor.js"(exports, module) {
      "use strict";
      function extractStoreData(source, url) {
        let doc;
        if (typeof source === "string") {
          doc = parseHTMLString(source);
          if (!doc) {
            logError("Failed to parse HTML string");
            return null;
          }
        } else {
          doc = source;
        }
        if (!isStorePage(doc, url)) {
          logWarn("Not a store page - extraction may fail");
        }
        const storeName = extractStoreName(doc);
        const brandName = extractStoreBrandName(doc);
        const description = extractStoreDescription(doc);
        const logo = extractStoreLogo(doc);
        const sellerId = extractSellerId(doc, url);
        const storeId = extractStoreId(url);
        const urlData = parseStoreURLData(url, doc);
        const storeData = {
          storeName,
          storeNameCleaned: storeName ? cleanStoreName(storeName) : null,
          brandName,
          description,
          logo,
          sellerId,
          storeId,
          url: urlData,
          metadata: {
            extractedAt: (/* @__PURE__ */ new Date()).toISOString(),
            extractionMethod: "store_extractor",
            pageType: "store"
          }
        };
        return storeData;
      }
      function isStorePage(doc, url) {
        if (url) {
          try {
            const urlObj = new URL(url);
            if (urlObj.pathname.includes("/stores/")) {
              return true;
            }
            if (urlObj.searchParams.has("me") || urlObj.searchParams.has("marketplaceID")) {
              return true;
            }
          } catch (error) {
          }
        }
        try {
          if (safeQuery('[data-component-type="s-store-hub"]', doc)) {
            return true;
          }
          if (safeQuery(".store-header", doc)) {
            return true;
          }
          if (safeQuery('[data-card-metrics-id*="store"]', doc)) {
            return true;
          }
        } catch (error) {
        }
        return false;
      }
      function extractStoreName(doc) {
        try {
          const selectors = [
            ".store-header h1",
            '[data-component-type="s-store-hub"] h1',
            ".store-brand-title",
            "#store-name"
          ];
          for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
              const text = safeText(element);
              if (text) return text;
            }
          }
        } catch (error) {
        }
        try {
          const ogSiteName = getMetaByProperty("og:site_name", doc);
          if (ogSiteName && ogSiteName.toLowerCase() !== "amazon") {
            return ogSiteName;
          }
          const ogTitle = getMetaByProperty("og:title", doc);
          if (ogTitle && !ogTitle.toLowerCase().includes("amazon")) {
            return ogTitle;
          }
        } catch (error) {
        }
        try {
          const titleElement = safeQuery("title", doc);
          if (titleElement) {
            let titleText = safeText(titleElement);
            if (titleText) {
              titleText = titleText.replace(/\s*[-:]\s*Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*$/i, "");
              titleText = titleText.replace(/\s+Store\s*$/i, "");
              if (titleText) return titleText;
            }
          }
        } catch (error) {
        }
        return null;
      }
      function cleanStoreName(name) {
        if (!name) return "";
        let cleaned = name.trim();
        cleaned = cleaned.replace(/\s+(Official\s+)?Store$/i, "");
        cleaned = cleaned.replace(/\s+on\s+Amazon$/i, "");
        cleaned = cleaned.replace(/^Visit the\s+/i, "");
        return cleaned.trim();
      }
      function extractStoreBrandName(doc) {
        try {
          const bylineInfo = safeQuery("#bylineInfo", doc);
          if (bylineInfo) {
            let text = safeText(bylineInfo);
            if (text) {
              text = text.replace(/^(Visit the|Brand:)\s*/i, "");
              text = text.replace(/\s+Store$/i, "");
              if (text) return text.trim();
            }
          }
        } catch (error) {
        }
        return null;
      }
      function extractStoreDescription(doc) {
        try {
          const selectors = [
            ".store-description",
            '[data-component-type="s-store-hub"] p',
            'meta[name="description"]'
          ];
          for (const selector of selectors) {
            if (selector.startsWith("meta")) {
              const desc = getMetaByName("description", doc);
              if (desc) return desc;
            } else {
              const element = safeQuery(selector, doc);
              if (element) {
                const text = safeText(element);
                if (text) return text;
              }
            }
          }
        } catch (error) {
        }
        return null;
      }
      function extractStoreLogo(doc) {
        try {
          const selectors = [
            ".store-logo img",
            ".store-header img",
            '[data-component-type="s-store-hub"] img'
          ];
          for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
              const src = safeAttr(element, "src");
              if (src) {
                return {
                  url: src,
                  imageId: extractStoreImageID(src)
                };
              }
            }
          }
          const ogImage = getMetaByProperty("og:image", doc);
          if (ogImage) {
            return {
              url: ogImage,
              imageId: extractStoreImageID(ogImage)
            };
          }
        } catch (error) {
        }
        return null;
      }
      function extractSellerId(doc, url) {
        if (url) {
          try {
            const urlObj = new URL(url);
            const meParam = urlObj.searchParams.get("me");
            if (meParam) return meParam;
          } catch (error) {
          }
        }
        try {
          const selectors = [
            "[data-seller-id]",
            "[data-me]",
            'input[name="me"]'
          ];
          for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
              const sellerId = safeAttr(element, "data-seller-id") || safeAttr(element, "data-me") || safeAttr(element, "value");
              if (sellerId) return sellerId;
            }
          }
        } catch (error) {
        }
        return null;
      }
      function extractStoreId(url) {
        if (!url) return null;
        try {
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;
          const match = pathname.match(/\/stores\/[^\/]+\/page\/([A-Z0-9-]+)/i);
          if (match) {
            return match[1];
          }
          const match2 = pathname.match(/\/stores\/page\/([A-Z0-9-]+)/i);
          if (match2) {
            return match2[1];
          }
        } catch (error) {
        }
        return null;
      }
      function parseStoreURLData(url, doc) {
        let urlString = url;
        if (!urlString && doc) {
          const canonical = safeQuery('link[rel="canonical"]', doc);
          if (canonical) {
            urlString = safeAttr(canonical, "href");
          }
        }
        if (!urlString) {
          return null;
        }
        try {
          const urlObj = new URL(urlString);
          const queryParams = {};
          const trackingParams = {};
          for (const [key, value] of urlObj.searchParams.entries()) {
            queryParams[key] = value;
            if (isTrackingParameter(key)) {
              trackingParams[key] = value;
            }
          }
          const cleanUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
          return {
            original: urlString,
            originalClean: cleanUrl,
            protocol: urlObj.protocol,
            hostname: urlObj.hostname,
            pathname: urlObj.pathname,
            queryParams,
            trackingParams
          };
        } catch (error) {
          logError("Failed to parse store URL:", error);
          return null;
        }
      }
      function isTrackingParameter(key) {
        const trackingPrefixes = ["pd_rd_", "pf_rd_", "_encoding", "qid", "sr", "keywords", "crid", "sprefix", "dib", "tag", "linkCode", "linkId", "ref", "ref_"];
        return trackingPrefixes.some((prefix) => key.toLowerCase().startsWith(prefix));
      }
      function extractStoreImageID(imageUrl) {
        if (!imageUrl) return null;
        const match = imageUrl.match(/\/images\/[SI]\/([A-Za-z0-9+_-]+)\./);
        return match ? match[1] : null;
      }
      function parseHTMLString(htmlString) {
        if (typeof DOMParser !== "undefined") {
          const parser = new DOMParser();
          return parser.parseFromString(htmlString, "text/html");
        }
        return null;
      }
      function safeQuery(selector, context) {
        return null;
      }
      function safeText(element) {
        return null;
      }
      function safeAttr(element, attr) {
        return null;
      }
      function getMetaByProperty(property, doc) {
        return null;
      }
      function getMetaByName(name, doc) {
        return null;
      }
      function logWarn(...args) {
      }
      function logError(...args) {
      }
      var StoreExtractor = {
        extractStoreData,
        isStorePage,
        extractStoreName,
        cleanStoreName,
        extractStoreBrandName,
        extractStoreDescription,
        extractStoreLogo,
        extractSellerId,
        extractStoreId,
        parseStoreURLData,
        isTrackingParameter,
        extractStoreImageID
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = StoreExtractor;
      }
      if (typeof window !== "undefined") {
        window.__AmazonToolkitModules = window.__AmazonToolkitModules || {};
        window.__AmazonToolkitModules["extractors/store_extractor"] = StoreExtractor;
      }
    }
  });

  // ../../common/amazon_toolkit/links/link_parser.js
  var require_link_parser = __commonJS({
    "../../common/amazon_toolkit/links/link_parser.js"(exports, module) {
      "use strict";
      var MAX_AMAZON_REDIRECT_DEPTH = 3;
      var AMAZON_REDIRECT_PATTERNS = [
        {
          matches: (pathname) => pathname.startsWith("/sspa/click"),
          paramKeys: ["url"],
          reason: "sponsored-click"
        },
        {
          matches: (pathname) => pathname.startsWith("/gp/slredirect"),
          paramKeys: ["url"],
          reason: "slredirect"
        },
        {
          matches: (pathname) => pathname.startsWith("/aclk"),
          paramKeys: ["url", "u"],
          reason: "ad-click"
        }
      ];
      function parseAmazonURL(urlString) {
        if (!urlString || typeof urlString !== "string") {
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
          logWarn("Reached maximum Amazon redirect depth, aborting parse");
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
          logError("Failed to parse Amazon URL:", error);
          return null;
        }
      }
      function parseAmazonAnchor(anchorElement) {
        if (!anchorElement || !isValidElement(anchorElement)) {
          return null;
        }
        try {
          const href = safeAttr(anchorElement, "href");
          if (!href) {
            return null;
          }
          const urlData = parseAmazonURL(href);
          if (!urlData) {
            return null;
          }
          const text = safeText(anchorElement);
          const textCleaned = text ? cleanAnchorText(text) : null;
          const title = safeAttr(anchorElement, "title");
          const img = safeQuery("img", anchorElement);
          const imageData = img ? {
            src: safeAttr(img, "src"),
            alt: safeAttr(img, "alt"),
            imageId: extractImageIDFromURL(safeAttr(img, "src"))
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
          logError("Failed to parse Amazon anchor:", error);
          return null;
        }
      }
      function cleanAnchorText(text) {
        if (!text) return "";
        let cleaned = text.trim();
        cleaned = cleaned.replace(/\s+/g, " ");
        cleaned = cleaned.replace(/Visit the Amazon .+ page/gi, "");
        cleaned = cleaned.replace(/^Amazon\.com:\s*/i, "");
        return cleaned.trim();
      }
      function determineURLType(urlObj) {
        const pathname = urlObj.pathname.toLowerCase();
        const search = urlObj.search.toLowerCase();
        if (pathname.includes("/dp/") || pathname.includes("/gp/product/") || pathname.includes("/o/asin/") || pathname.includes("/exec/obidos/asin/")) {
          return "product";
        }
        if (pathname.includes("/stores/")) {
          return "store";
        }
        if (search.includes("me=") || search.includes("marketplaceid=")) {
          return "store";
        }
        if (pathname === "/s" || pathname === "/s/") {
          return "search";
        }
        if (pathname.includes("/b/") || pathname.includes("/gp/browse")) {
          return "category";
        }
        if (pathname.includes("/best-sellers") || pathname.includes("/gp/bestsellers")) {
          return "bestsellers";
        }
        if (pathname.includes("/deals") || pathname.includes("/goldbox")) {
          return "deals";
        }
        return "other";
      }
      function extractASINFromURL(urlObj) {
        const pathname = urlObj.pathname;
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
      function extractStoreIDFromURL(urlObj) {
        const pathname = urlObj.pathname;
        const match1 = pathname.match(/\/stores\/[^\/]+\/page\/([A-Z0-9-]+)/i);
        if (match1) {
          return match1[1];
        }
        const match2 = pathname.match(/\/stores\/page\/([A-Z0-9-]+)/i);
        if (match2) {
          return match2[1];
        }
        return null;
      }
      function extractSellerIDFromURL(urlObj) {
        return urlObj.searchParams.get("me") || null;
      }
      function parseQueryParams(urlObj) {
        const params = {};
        for (const [key, value] of urlObj.searchParams.entries()) {
          params[key] = value;
        }
        return params;
      }
      function extractVariantParams(queryParams) {
        const variantKeys = ["th", "psc", "smid"];
        const variantParams = {};
        for (const key of variantKeys) {
          if (queryParams[key]) {
            variantParams[key] = queryParams[key];
          }
        }
        return variantParams;
      }
      function extractTrackingParams(queryParams) {
        const trackingPrefixes = ["pd_rd_", "pf_rd_", "_encoding", "qid", "sr", "keywords", "crid", "sprefix", "dib", "tag", "linkCode", "linkId", "ref", "ref_"];
        const trackingParams = {};
        for (const [key, value] of Object.entries(queryParams)) {
          if (trackingPrefixes.some((prefix) => key.toLowerCase().startsWith(prefix))) {
            trackingParams[key] = value;
          }
        }
        return trackingParams;
      }
      function buildCleanURL(urlObj, variantParams = {}, options = {}) {
        const canonicalPath = options.canonicalPath || urlObj.pathname;
        let cleanUrl = `${urlObj.protocol}//${urlObj.hostname}${canonicalPath}`;
        const paramKeys = Object.keys(variantParams);
        if (paramKeys.length > 0) {
          const paramString = paramKeys.map((key) => `${key}=${variantParams[key]}`).join("&");
          cleanUrl += `?${paramString}`;
        }
        return cleanUrl;
      }
      function normalizeAmazonPath(pathname = "/", context = {}) {
        if (!pathname) {
          return "/";
        }
        if (context.type === "product" && context.asin) {
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
      function extractImageIDFromURL(imageUrl) {
        if (!imageUrl) return null;
        const match = imageUrl.match(/\/images\/[ISP]\/([A-Za-z0-9+_-]+)\./);
        return match ? match[1] : null;
      }
      function parseAmazonURLsFromText(text) {
        if (!text || typeof text !== "string") {
          return [];
        }
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
        const pathname = (urlObj.pathname || "").toLowerCase();
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
        if (candidate.startsWith("//")) {
          candidate = `${baseUrlObj.protocol}${candidate}`;
        } else if (candidate.startsWith("/")) {
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
      function isAmazonURL(urlObj) {
        const amazonDomainPattern = /^(www\.)?amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)$/i;
        return amazonDomainPattern.test(urlObj.hostname);
      }
      function isValidASIN(value) {
        if (!value || typeof value !== "string") return false;
        return /^[A-Z0-9]{10}$/.test(value);
      }
      function isValidElement(element) {
        return element instanceof Element || element && element.nodeType === 1;
      }
      function safeQuery(selector, context) {
        return null;
      }
      function safeQueryAll(selector, context) {
        return [];
      }
      function safeText(element) {
        return null;
      }
      function safeAttr(element, attr) {
        return null;
      }
      function logWarn(...args) {
      }
      function logError(...args) {
      }
      var LinkParser = {
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
      if (typeof module !== "undefined" && module.exports) {
        module.exports = LinkParser;
      }
      if (typeof window !== "undefined") {
        window.__AmazonToolkitModules = window.__AmazonToolkitModules || {};
        window.__AmazonToolkitModules["links/link_parser"] = LinkParser;
      }
    }
  });

  // ../../common/amazon_toolkit/links/link_cleaner.js
  var require_link_cleaner = __commonJS({
    "../../common/amazon_toolkit/links/link_cleaner.js"(exports, module) {
      "use strict";
      var MAX_CLEANER_REDIRECT_DEPTH = 3;
      var AMAZON_REDIRECT_PATTERNS = [
        {
          matches: (pathname) => pathname.startsWith("/sspa/click"),
          paramKeys: ["url"],
          reason: "sponsored-click"
        },
        {
          matches: (pathname) => pathname.startsWith("/gp/slredirect"),
          paramKeys: ["url"],
          reason: "slredirect"
        },
        {
          matches: (pathname) => pathname.startsWith("/aclk"),
          paramKeys: ["url", "u"],
          reason: "ad-click"
        }
      ];
      function cleanAmazonURL(urlString, options = {}) {
        return cleanAmazonURLInternal(urlString, options, 0);
      }
      function cleanAmazonURLInternal(urlString, options, depth) {
        const { preserveVariants = true, preserveSeller = false } = options;
        if (depth > MAX_CLEANER_REDIRECT_DEPTH) {
          logWarn("Reached maximum Amazon redirect depth while cleaning URL");
          return urlString;
        }
        try {
          const urlObj = new URL(urlString);
          const redirectTarget = resolveAmazonRedirect(urlObj);
          if (redirectTarget) {
            return cleanAmazonURLInternal(redirectTarget, options, depth + 1);
          }
          const canonicalPath = normalizeAmazonPath(urlObj.pathname);
          let cleanUrl = `${urlObj.protocol}//${urlObj.hostname}${canonicalPath}`;
          if (preserveVariants || preserveSeller) {
            const paramsToKeep = [];
            if (preserveVariants) {
              const th = urlObj.searchParams.get("th");
              const psc = urlObj.searchParams.get("psc");
              if (th) paramsToKeep.push(`th=${th}`);
              if (psc) paramsToKeep.push(`psc=${psc}`);
            }
            if (preserveSeller) {
              const smid = urlObj.searchParams.get("smid");
              if (smid) paramsToKeep.push(`smid=${smid}`);
            }
            if (paramsToKeep.length > 0) {
              cleanUrl += "?" + paramsToKeep.join("&");
            }
          }
          return cleanUrl;
        } catch (error) {
          logError("Failed to clean URL:", error);
          return null;
        }
      }
      function buildAmazonURL(components, format = "short") {
        const {
          asin,
          hostname = "www.amazon.com",
          protocol = "https:",
          queryParams = {}
        } = components;
        if (!asin || !isValidASIN(asin)) {
          logWarn("Invalid ASIN provided to buildAmazonURL");
          return null;
        }
        let url = `${protocol}//${hostname}/dp/${asin}`;
        if (format === "short") {
          return url;
        }
        if (format === "medium") {
          const variantParams = [];
          if (queryParams.th) variantParams.push(`th=${queryParams.th}`);
          if (queryParams.psc) variantParams.push(`psc=${queryParams.psc}`);
          if (variantParams.length > 0) {
            url += "?" + variantParams.join("&");
          }
          return url;
        }
        if (format === "long") {
          const paramStr = Object.entries(queryParams).map(([key, value]) => `${key}=${value}`).join("&");
          if (paramStr) {
            url += "?" + paramStr;
          }
          return url;
        }
        return url;
      }
      function cleanProductTitle(title) {
        if (!title) return "";
        let cleaned = title.trim();
        cleaned = cleaned.replace(/^Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*:\s*/i, "");
        cleaned = cleaned.replace(/\s+at\s+Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*$/i, "");
        cleaned = cleaned.replace(/\s+at\s+Amazon[^:]*store$/i, "");
        cleaned = cleaned.replace(/^Amazon\s+Grocery,\s*/i, "");
        cleaned = cleaned.replace(/\s+-\s*Dp$/i, "");
        const colonIndex = cleaned.indexOf(" : ");
        if (colonIndex > 0) {
          cleaned = cleaned.substring(0, colonIndex);
        }
        cleaned = cleaned.replace(/\s+/g, " ");
        return cleaned.trim();
      }
      function shortenTitle(title, maxLength = 80, ellipsis = "...") {
        if (!title || title.length <= maxLength) {
          return title || "";
        }
        const truncated = title.substring(0, maxLength - ellipsis.length);
        const lastSpace = truncated.lastIndexOf(" ");
        if (lastSpace > maxLength / 2) {
          return truncated.substring(0, lastSpace) + ellipsis;
        }
        return truncated + ellipsis;
      }
      function removeTrackingParams(urlString) {
        try {
          const urlObj = new URL(urlString);
          const trackingPrefixes = ["pd_rd_", "pf_rd_", "_encoding", "qid", "sr", "keywords", "crid", "sprefix", "dib", "tag", "linkCode", "linkId", "ref", "ref_"];
          for (const [key] of Array.from(urlObj.searchParams.entries())) {
            if (trackingPrefixes.some((prefix) => key.toLowerCase().startsWith(prefix))) {
              urlObj.searchParams.delete(key);
            }
          }
          return urlObj.toString();
        } catch (error) {
          return null;
        }
      }
      function normalizeAmazonHostname(hostname, preferredDomain = "com") {
        const clean = hostname.replace(/^www\./, "");
        if (clean === `amazon.${preferredDomain}`) {
          return `www.amazon.${preferredDomain}`;
        }
        return hostname.startsWith("www.") ? hostname : `www.${hostname}`;
      }
      function normalizeAmazonPath(pathname = "/") {
        if (!pathname) {
          return "/";
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
      function resolveAmazonRedirect(urlObj) {
        const pathname = (urlObj.pathname || "").toLowerCase();
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
              return absoluteTarget;
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
        if (candidate.startsWith("//")) {
          candidate = `${baseUrlObj.protocol}${candidate}`;
        } else if (candidate.startsWith("/")) {
          candidate = `${baseUrlObj.protocol}//${baseUrlObj.hostname}${candidate}`;
        } else if (!/^https?:/i.test(candidate)) {
          candidate = `${baseUrlObj.protocol}//${candidate}`;
        }
        try {
          const result = new URL(candidate);
          if (isAmazonHostname(result.hostname)) {
            return result.href;
          }
        } catch (error) {
          return null;
        }
        return null;
      }
      function isAmazonHostname(hostname) {
        if (!hostname) {
          return false;
        }
        return hostname.toLowerCase().includes("amazon.");
      }
      function isValidASIN(value) {
        if (!value || typeof value !== "string") return false;
        return /^[A-Z0-9]{10}$/.test(value);
      }
      function logWarn(...args) {
      }
      function logError(...args) {
      }
      var LinkCleaner = {
        cleanAmazonURL,
        buildAmazonURL,
        cleanProductTitle,
        shortenTitle,
        removeTrackingParams,
        normalizeAmazonHostname
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = LinkCleaner;
      }
      if (typeof window !== "undefined") {
        window.__AmazonToolkitModules = window.__AmazonToolkitModules || {};
        window.__AmazonToolkitModules["links/link_cleaner"] = LinkCleaner;
      }
    }
  });

  // ../../common/amazon_toolkit/links/link_image.js
  var require_link_image = __commonJS({
    "../../common/amazon_toolkit/links/link_image.js"(exports, module) {
      "use strict";
      function extractImageID(imageUrl) {
        if (!imageUrl || typeof imageUrl !== "string") {
          return null;
        }
        const match = imageUrl.match(/\/images\/[ISP]\/([A-Za-z0-9+_-]+)\./);
        return match ? match[1] : null;
      }
      function buildImageURL(imageId, options = {}) {
        if (!imageId) {
          return null;
        }
        const {
          size,
          width,
          height,
          quality = 95,
          format = "jpg",
          autoCrop = false,
          host = "m.media-amazon.com"
        } = options;
        const modifiers = [];
        if (width) {
          modifiers.push(`SX${width}`);
        }
        if (height) {
          modifiers.push(`SY${height}`);
        }
        if (size && !width && !height) {
          modifiers.push(`SL${size}`);
        }
        if (!size && !width && !height) {
          modifiers.push("SL500");
        }
        if (quality && quality !== 95) {
          modifiers.push(`QL${quality}`);
        }
        if (autoCrop) {
          modifiers.push("AC");
        }
        const modifierString = modifiers.length > 0 ? `_${modifiers.join("_")}_` : "";
        return `https://${host}/images/I/${imageId}.${modifierString}.${format}`;
      }
      function resizeImageURL(imageUrl, sizeOrOptions) {
        const imageId = extractImageID(imageUrl);
        if (!imageId) {
          return null;
        }
        let options;
        if (typeof sizeOrOptions === "number") {
          options = { size: sizeOrOptions };
        } else if (typeof sizeOrOptions === "object") {
          options = sizeOrOptions;
        } else {
          options = {};
        }
        if (!options.format) {
          const formatMatch = imageUrl.match(/\.([a-z]{3,4})$/i);
          if (formatMatch) {
            options.format = formatMatch[1].toLowerCase();
          }
        }
        return buildImageURL(imageId, options);
      }
      function generateImageVariants(imageIdOrUrl, sizes = [75, 160, 500, 1e3, 1500]) {
        const imageId = imageIdOrUrl.includes("/") ? extractImageID(imageIdOrUrl) : imageIdOrUrl;
        if (!imageId) {
          return {};
        }
        const variants = {};
        for (const size of sizes) {
          variants[size] = buildImageURL(imageId, { size });
        }
        return variants;
      }
      function parseImageURL(imageUrl) {
        if (!imageUrl || typeof imageUrl !== "string") {
          return null;
        }
        const imageId = extractImageID(imageUrl);
        if (!imageId) {
          return null;
        }
        try {
          const url = new URL(imageUrl);
          const host = url.hostname;
          const match = imageUrl.match(/\.([^.]+)\.([a-z]{3,4})$/i);
          if (!match) {
            return { imageId, host, modifiers: [], format: "jpg" };
          }
          const modifierString = match[1];
          const format = match[2].toLowerCase();
          const modifiers = modifierString.split("_").filter((m) => m.length > 0);
          let size = null;
          let width = null;
          let height = null;
          let quality = null;
          let autoCrop = false;
          for (const mod of modifiers) {
            if (mod.startsWith("SL")) {
              size = parseInt(mod.substring(2));
            } else if (mod.startsWith("SX")) {
              width = parseInt(mod.substring(2));
            } else if (mod.startsWith("SY")) {
              height = parseInt(mod.substring(2));
            } else if (mod.startsWith("QL")) {
              quality = parseInt(mod.substring(2));
            } else if (mod === "AC") {
              autoCrop = true;
            }
          }
          return {
            imageId,
            host,
            modifiers,
            size,
            width,
            height,
            quality,
            autoCrop,
            format
          };
        } catch (error) {
          return { imageId, host: null, modifiers: [], format: "jpg" };
        }
      }
      function isAmazonImageURL(url) {
        if (!url || typeof url !== "string") {
          return false;
        }
        try {
          const urlObj = new URL(url);
          const imageHosts = [
            "m.media-amazon.com",
            "images-na.ssl-images-amazon.com",
            "images-amazon.com",
            "ecx.images-amazon.com"
          ];
          return imageHosts.some((host) => urlObj.hostname === host || urlObj.hostname.endsWith("." + host));
        } catch (error) {
          return false;
        }
      }
      function getHighestResolution(imageUrl, maxSize = 1500) {
        const imageId = extractImageID(imageUrl);
        if (!imageId) {
          return null;
        }
        return buildImageURL(imageId, { size: maxSize });
      }
      var LinkImage = {
        extractImageID,
        buildImageURL,
        resizeImageURL,
        generateImageVariants,
        parseImageURL,
        isAmazonImageURL,
        getHighestResolution
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = LinkImage;
      }
      if (typeof window !== "undefined") {
        window.__AmazonToolkitModules = window.__AmazonToolkitModules || {};
        window.__AmazonToolkitModules["links/link_image"] = LinkImage;
      }
    }
  });

  // ../../common/amazon_toolkit/markdown/markdown_formatter.js
  var require_markdown_formatter = __commonJS({
    "../../common/amazon_toolkit/markdown/markdown_formatter.js"(exports, module) {
      "use strict";
      function escapeMarkdown(text, options = {}) {
        if (!text) return "";
        const {
          escapeBrackets = true,
          escapeParens = true,
          escapeAsterisks = true,
          escapeUnderscores = true,
          escapeBackticks = true
        } = options;
        let escaped = text;
        escaped = escaped.replace(/\\/g, "\\\\");
        if (escapeBrackets) {
          escaped = escaped.replace(/\[/g, "\\[");
          escaped = escaped.replace(/\]/g, "\\]");
        }
        if (escapeParens) {
          escaped = escaped.replace(/\(/g, "\\(");
          escaped = escaped.replace(/\)/g, "\\)");
        }
        if (escapeAsterisks) {
          escaped = escaped.replace(/\*/g, "\\*");
        }
        if (escapeUnderscores) {
          escaped = escaped.replace(/_/g, "\\_");
        }
        if (escapeBackticks) {
          escaped = escaped.replace(/`/g, "\\`");
        }
        return escaped;
      }
      function formatTitle(title, options = {}) {
        if (!title) return "";
        const {
          maxLength,
          escape = true,
          removePrefix = true,
          removeSuffix = true
        } = options;
        let formatted = title.trim();
        if (removePrefix) {
          formatted = formatted.replace(/^Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*:\s*/i, "");
        }
        if (removeSuffix) {
          const colonIndex = formatted.indexOf(" : ");
          if (colonIndex > 0) {
            formatted = formatted.substring(0, colonIndex);
          }
        }
        formatted = formatted.trim();
        if (maxLength && formatted.length > maxLength) {
          formatted = formatted.substring(0, maxLength - 3);
          const lastSpace = formatted.lastIndexOf(" ");
          if (lastSpace > maxLength / 2) {
            formatted = formatted.substring(0, lastSpace);
          }
          formatted += "...";
        }
        if (escape) {
          formatted = escapeMarkdown(formatted, {
            escapeBrackets: true,
            escapeParens: false,
            // Allow parens in title text
            escapeAsterisks: true,
            escapeUnderscores: true,
            escapeBackticks: true
          });
        }
        return formatted;
      }
      function formatBrand(brand, escape = true) {
        if (!brand) return "";
        let formatted = brand.trim();
        formatted = formatted.replace(/^Brand:\s*/i, "");
        formatted = formatted.replace(/\s+Store$/i, "");
        if (escape) {
          formatted = escapeMarkdown(formatted);
        }
        return formatted;
      }
      function formatVariant(variant, escape = true) {
        if (!variant) return "";
        let text;
        if (typeof variant === "object" && variant.value) {
          text = variant.value;
        } else if (typeof variant === "string") {
          text = variant;
        } else {
          return "";
        }
        text = text.trim();
        if (escape) {
          text = escapeMarkdown(text, { escapeParens: false });
        }
        return text ? `(${text})` : "";
      }
      function formatPrice(price) {
        if (!price) return "";
        if (typeof price === "string") {
          return price;
        }
        if (typeof price === "number") {
          return `$${price.toFixed(2)}`;
        }
        if (typeof price === "object") {
          if (price.current && price.list && price.current !== price.list) {
            return `${price.current} (was ${price.list})`;
          }
          return price.current || "";
        }
        return "";
      }
      function normalizeWhitespace(text) {
        if (!text) return "";
        return text.replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
      }
      function truncateText(text, maxLength, ellipsis = "...") {
        if (!text || text.length <= maxLength) {
          return text || "";
        }
        const truncated = text.substring(0, maxLength - ellipsis.length);
        const lastSpace = truncated.lastIndexOf(" ");
        if (lastSpace > maxLength / 2) {
          return truncated.substring(0, lastSpace) + ellipsis;
        }
        return truncated + ellipsis;
      }
      function stripHTML(html) {
        if (!html) return "";
        return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
      }
      function formatCompleteTitle(components) {
        const { brand, title, variant } = components;
        const parts = [];
        if (brand) {
          parts.push(formatBrand(brand));
        }
        if (title) {
          parts.push(formatTitle(title, { escape: true, removePrefix: true, removeSuffix: true }));
        }
        let result = parts.join(" ");
        if (variant) {
          result += " " + formatVariant(variant);
        }
        return result;
      }
      var MarkdownFormatter = {
        escapeMarkdown,
        formatTitle,
        formatBrand,
        formatVariant,
        formatPrice,
        normalizeWhitespace,
        truncateText,
        stripHTML,
        formatCompleteTitle
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = MarkdownFormatter;
      }
      if (typeof window !== "undefined") {
        window.__AmazonToolkitModules = window.__AmazonToolkitModules || {};
        window.__AmazonToolkitModules["markdown/markdown_formatter"] = MarkdownFormatter;
      }
    }
  });

  // ../../common/amazon_toolkit/markdown/markdown_generator.js
  var require_markdown_generator = __commonJS({
    "../../common/amazon_toolkit/markdown/markdown_generator.js"(exports, module) {
      "use strict";
      function generateProductLink(productData, options = {}) {
        if (!productData || !productData.asin) {
          return "";
        }
        const {
          urlFormat = "short",
          maxTitleLength,
          includeBrand = true,
          includeVariant = true
        } = options;
        let title = "";
        if (includeBrand && productData.brand) {
          title += formatBrand(productData.brand) + " ";
        }
        if (productData.titleCleaned || productData.title) {
          title += formatTitle(productData.titleCleaned || productData.title, {
            maxLength: maxTitleLength,
            escape: true
          });
        }
        if (includeVariant && productData.variant) {
          title += " " + formatVariant(productData.variant);
        }
        title = title.trim();
        if (!title) {
          title = "Amazon Product";
        }
        const url = buildProductURL(productData, urlFormat);
        if (!url) {
          return title;
        }
        return `[${title}](${url})`;
      }
      function generateProductImage(productData, options = {}) {
        if (!productData || !productData.images || !productData.images.primaryId) {
          return "";
        }
        const {
          imageSize = 500,
          alt
        } = options;
        const altText = alt || formatCompleteTitle({
          brand: productData.brand,
          title: productData.titleCleaned || productData.title,
          variant: productData.variant
        });
        const imageUrl = buildImageURL(productData.images.primaryId, { size: imageSize });
        if (!imageUrl) {
          return "";
        }
        return `![${altText}](${imageUrl})`;
      }
      function generateProductImageLink(productData, options = {}) {
        if (!productData || !productData.asin) {
          return "";
        }
        const {
          urlFormat = "short",
          imageSize = 500,
          alt
        } = options;
        const image = generateProductImage(productData, { imageSize, alt });
        if (!image) {
          return "";
        }
        const url = buildProductURL(productData, urlFormat);
        if (!url) {
          return image;
        }
        return `[${image}](${url})`;
      }
      function generateProductCombined(productData, options = {}) {
        if (!productData || !productData.asin) {
          return "";
        }
        const {
          format = "inline",
          urlFormat = "short",
          imageSize = 160
        } = options;
        const textLink = generateProductLink(productData, { urlFormat });
        const imageLink = generateProductImageLink(productData, { urlFormat, imageSize });
        if (format === "inline") {
          return `${imageLink} ${textLink}`;
        }
        if (format === "block") {
          return `${imageLink}

${textLink}`;
        }
        if (format === "table") {
          return `| ${imageLink} | ${textLink} |`;
        }
        return `${imageLink} ${textLink}`;
      }
      function generateStoreLink(storeData, options = {}) {
        if (!storeData || !storeData.url) {
          return "";
        }
        const title = formatBrand(storeData.storeNameCleaned || storeData.storeName || "Amazon Store");
        const url = storeData.url.originalClean || storeData.url.original;
        if (!url) {
          return title;
        }
        return `[${title}](${url})`;
      }
      function generateAnchorLink(anchorData, options = {}) {
        if (!anchorData) {
          return "";
        }
        const title = formatTitle(
          anchorData.textCleaned || anchorData.text || anchorData.title || "Amazon Link",
          { escape: true }
        );
        const url = anchorData.url?.clean || anchorData.href;
        if (!url) {
          return title;
        }
        return `[${title}](${url})`;
      }
      function buildProductURL(productData, format = "short") {
        if (!productData.asin) {
          return null;
        }
        const hostname = productData.url?.hostname || "www.amazon.com";
        const protocol = productData.url?.protocol || "https:";
        const queryParams = productData.url?.queryParams || {};
        return buildAmazonURL(
          { asin: productData.asin, hostname, protocol, queryParams },
          format
        );
      }
      function formatBrand(brand) {
        if (!brand) return "";
        return brand.trim().replace(/\s+Store$/i, "");
      }
      function formatTitle(title, options = {}) {
        if (!title) return "";
        let formatted = title.trim();
        if (options.maxLength && formatted.length > options.maxLength) {
          formatted = formatted.substring(0, options.maxLength - 3) + "...";
        }
        if (options.escape) {
          formatted = formatted.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
        }
        return formatted;
      }
      function formatVariant(variant) {
        if (!variant) return "";
        const text = typeof variant === "object" ? variant.value : variant;
        return text ? `(${text})` : "";
      }
      function formatCompleteTitle(components) {
        const parts = [];
        if (components.brand) parts.push(components.brand);
        if (components.title) parts.push(components.title);
        let result = parts.join(" ");
        if (components.variant) result += " " + formatVariant(components.variant);
        return result;
      }
      function buildImageURL(imageId, options = {}) {
        if (!imageId) return null;
        const size = options.size || 500;
        return `https://m.media-amazon.com/images/I/${imageId}._SL${size}_.jpg`;
      }
      function buildAmazonURL(components, format = "short") {
        const { asin, hostname = "www.amazon.com", protocol = "https:", queryParams = {} } = components;
        if (!asin) return null;
        let url = `${protocol}//${hostname}/dp/${asin}`;
        if (format === "medium") {
          const params = [];
          if (queryParams.th) params.push(`th=${queryParams.th}`);
          if (queryParams.psc) params.push(`psc=${queryParams.psc}`);
          if (params.length > 0) url += "?" + params.join("&");
        } else if (format === "long") {
          const paramStr = Object.entries(queryParams).map(([k, v]) => `${k}=${v}`).join("&");
          if (paramStr) url += "?" + paramStr;
        }
        return url;
      }
      var MarkdownGenerator = {
        generateProductLink,
        generateProductImage,
        generateProductImageLink,
        generateProductCombined,
        generateStoreLink,
        generateAnchorLink
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = MarkdownGenerator;
      }
      if (typeof window !== "undefined") {
        window.__AmazonToolkitModules = window.__AmazonToolkitModules || {};
        window.__AmazonToolkitModules["markdown/markdown_generator"] = MarkdownGenerator;
      }
    }
  });

  // ../../common/amazon_toolkit/index.js
  var require_amazon_toolkit = __commonJS({
    "../../common/amazon_toolkit/index.js"(exports, module) {
      "use strict";
      function loadModule(registryKey, requirePath) {
        if (typeof __require === "function") {
          try {
            return __require(requirePath);
          } catch (error) {
          }
        }
        if (typeof window !== "undefined" && window.__AmazonToolkitModules) {
          return window.__AmazonToolkitModules[registryKey] || {};
        }
        return {};
      }
      var domHelpers = loadModule("helpers/dom_helpers", "./helpers/dom_helpers.js");
      var loggingHelpers = loadModule("helpers/logging_helpers", "./helpers/logging_helpers.js");
      var validationHelpers = loadModule("helpers/validation_helpers", "./helpers/validation_helpers.js");
      var sharedExtractor = loadModule("extractors/shared_extractor", "./extractors/shared_extractor.js");
      var productExtractor = loadModule("extractors/product_extractor", "./extractors/product_extractor.js");
      var storeExtractor = loadModule("extractors/store_extractor", "./extractors/store_extractor.js");
      var linkParser = loadModule("links/link_parser", "./links/link_parser.js");
      var linkCleaner = loadModule("links/link_cleaner", "./links/link_cleaner.js");
      var linkImage = loadModule("links/link_image", "./links/link_image.js");
      var markdownFormatter = loadModule("markdown/markdown_formatter", "./markdown/markdown_formatter.js");
      var markdownGenerator = loadModule("markdown/markdown_generator", "./markdown/markdown_generator.js");
      var noop = () => {
      };
      function ensureFunctions(target, names) {
        names.forEach((name) => {
          if (typeof target[name] !== "function") {
            target[name] = noop;
          }
        });
        return target;
      }
      var helperFunctions = ensureFunctions(
        Object.assign({}, domHelpers, loggingHelpers, validationHelpers),
        [
          "safeQuery",
          "safeQueryAll",
          "safeText",
          "safeAttr",
          "parseJsonLD",
          "getMetaByProperty",
          "getMetaByName",
          "setDebugMode",
          "log",
          "logInfo",
          "logWarn",
          "logError",
          "logFunctionBegin",
          "logFunctionEnd",
          "isValidASIN",
          "isValidURL",
          "isAmazonURL",
          "isAmazonProductURL",
          "isAmazonStoreURL",
          "isAmazonImageURL"
        ]
      );
      var extractorFunctions = ensureFunctions(
        Object.assign({}, sharedExtractor, productExtractor, storeExtractor),
        [
          "extractProductASIN",
          "extractProductTitle",
          "extractProductBrand",
          "extractProductDescription",
          "extractProductPrice",
          "extractProductImageURL",
          "extractProductVariant",
          "cleanProductTitle",
          "extractProductData",
          "extractProductPriceData",
          "extractProductImageData",
          "extractProductImageID",
          "extractProductAvailability",
          "extractProductShipping",
          "extractProductRating",
          "parseProductPriceValue",
          "extractProductCurrency",
          "extractStoreData",
          "isStorePage",
          "extractStoreName",
          "cleanStoreName",
          "extractStoreBrandName",
          "extractStoreDescription",
          "extractStoreLogo",
          "extractSellerId",
          "extractStoreId",
          "parseStoreURLData",
          "extractStoreImageID"
        ]
      );
      var linkFunctions = ensureFunctions(
        Object.assign({}, linkParser, linkCleaner, linkImage),
        [
          "parseAmazonURL",
          "parseAmazonAnchor",
          "determineURLType",
          "extractAmazonAnchorsFromDOM",
          "cleanAmazonURL",
          "buildAmazonURL",
          "cleanProductTitle",
          "shortenTitle",
          "extractImageID",
          "buildImageURL",
          "resizeImageURL",
          "generateImageVariants",
          "parseImageURL"
        ]
      );
      var markdownFunctions = ensureFunctions(
        Object.assign({}, markdownFormatter, markdownGenerator),
        [
          "escapeMarkdown",
          "formatTitle",
          "formatBrand",
          "formatVariant",
          "formatPrice",
          "formatCompleteTitle",
          "generateProductLink",
          "generateProductImage",
          "generateProductImageLink",
          "generateProductCombined",
          "generateStoreLink",
          "generateAnchorLink"
        ]
      );
      var AmazonToolkit = {
        // Version
        version: "1.0.0",
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
          return typeof fn === "function" ? fn(source, url) : null;
        },
        /**
         * Extract complete store data from a page
         * @param {Document|string} source - DOM document or HTML string
         * @param {string} [url] - Original URL
         * @returns {Object|null} Store data
         */
        extractStoreData: function(source, url) {
          const fn = this.Extractors.extractStoreData;
          return typeof fn === "function" ? fn(source, url) : null;
        },
        /**
         * Parse an Amazon URL
         * @param {string} urlString - URL to parse
         * @returns {Object|null} Parsed URL data
         */
        parseURL: function(urlString) {
          const fn = this.Links.parseAmazonURL;
          return typeof fn === "function" ? fn(urlString) : null;
        },
        /**
         * Parse an HTML anchor element
         * @param {HTMLAnchorElement} anchor - Anchor element
         * @returns {Object|null} Parsed anchor data
         */
        parseAnchor: function(anchor) {
          const fn = this.Links.parseAmazonAnchor;
          return typeof fn === "function" ? fn(anchor) : null;
        },
        /**
         * Generate markdown link from product data
         * @param {Object} productData - Product data structure
         * @param {Object} [options] - Generation options
         * @returns {string} Markdown link
         */
        generateProductLink: function(productData, options) {
          const fn = this.Markdown.generateProductLink;
          return typeof fn === "function" ? fn(productData, options) : "";
        },
        /**
         * Generate markdown link from store data
         * @param {Object} storeData - Store data structure
         * @param {Object} [options] - Generation options
         * @returns {string} Markdown link
         */
        generateStoreLink: function(storeData, options) {
          const fn = this.Markdown.generateStoreLink;
          return typeof fn === "function" ? fn(storeData, options) : "";
        },
        /**
         * Clean an Amazon URL
         * @param {string} urlString - URL to clean
         * @param {Object} [options] - Cleaning options
         * @returns {string|null} Cleaned URL
         */
        cleanURL: function(urlString, options) {
          const fn = this.Links.cleanAmazonURL;
          return typeof fn === "function" ? fn(urlString, options) : urlString;
        },
        /**
         * Build an image URL from image ID
         * @param {string} imageId - Image ID
         * @param {Object} [options] - Image options
         * @returns {string|null} Image URL
         */
        buildImageURL: function(imageId, options) {
          const fn = this.Links.buildImageURL;
          return typeof fn === "function" ? fn(imageId, options) : null;
        },
        /**
         * Enable or disable debug logging
         * @param {boolean} enabled - True to enable, false to disable
         * @returns {void}
         */
        setDebugMode: function(enabled) {
          const fn = this.Helpers.setDebugMode;
          if (typeof fn === "function") {
            fn(enabled);
          }
        }
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = AmazonToolkit;
      }
      if (typeof window !== "undefined") {
        window.AmazonToolkit = AmazonToolkit;
      }
      if (typeof define === "function" && define.amd) {
        define([], function() {
          return AmazonToolkit;
        });
      }
    }
  });

  // ../../common/youtube_toolkit/helpers/dom_helpers.js
  var require_dom_helpers = __commonJS({
    "../../common/youtube_toolkit/helpers/dom_helpers.js"(exports, module) {
      "use strict";
      function normalizeWhitespace(text) {
        if (typeof text !== "string") {
          return "";
        }
        return text.replace(/\s+/g, " ").trim();
      }
      function safeRoot(root) {
        if (root && typeof root.querySelector === "function") {
          return root;
        }
        if (typeof document !== "undefined" && document.querySelector) {
          return document;
        }
        return null;
      }
      function safeQuery(selector, root) {
        const ctx = safeRoot(root);
        if (!ctx) {
          return null;
        }
        try {
          return ctx.querySelector(selector);
        } catch (error) {
          return null;
        }
      }
      function safeQueryAll(selector, root) {
        const ctx = safeRoot(root);
        if (!ctx) {
          return [];
        }
        try {
          return Array.from(ctx.querySelectorAll(selector));
        } catch (error) {
          return [];
        }
      }
      function textFromNode(node) {
        if (!node || typeof node.textContent !== "string") {
          return "";
        }
        return normalizeWhitespace(node.textContent);
      }
      function getText(selectorOrNode, root) {
        if (typeof selectorOrNode === "string") {
          const node = safeQuery(selectorOrNode, root);
          return textFromNode(node);
        }
        return textFromNode(selectorOrNode);
      }
      function getAttribute(selectorOrNode, attribute, root) {
        if (!attribute) {
          return null;
        }
        const node = typeof selectorOrNode === "string" ? safeQuery(selectorOrNode, root) : selectorOrNode;
        if (!node || typeof node.getAttribute !== "function") {
          return null;
        }
        const value = node.getAttribute(attribute);
        return value === null ? null : value;
      }
      function getMetaContent(doc, selector) {
        if (!selector) {
          return null;
        }
        const node = safeQuery(selector, doc);
        if (!node) {
          return null;
        }
        return normalizeWhitespace(node.content || node.getAttribute("content") || "");
      }
      function getLinkHref(doc, selector) {
        const node = safeQuery(selector, doc);
        if (!node) {
          return null;
        }
        const href = node.href || node.getAttribute("href");
        return href ? href.trim() : null;
      }
      function resolveUrl(href, base) {
        if (!href) {
          return null;
        }
        const origin = base || (typeof window !== "undefined" ? window.location.origin : "https://www.youtube.com");
        try {
          return new URL(href, origin).toString();
        } catch (error) {
          return null;
        }
      }
      function extractJSONFromScripts(doc, variableNames = []) {
        const scripts = safeQueryAll("script", doc);
        for (const script of scripts) {
          const content = script && script.textContent ? script.textContent.trim() : "";
          if (!content) {
            continue;
          }
          for (const variableName of variableNames) {
            const json = extractAssignedObject(content, variableName);
            if (json) {
              return json;
            }
          }
        }
        return null;
      }
      function extractAssignedObject(source, variableName) {
        const assignmentIndex = source.indexOf(variableName);
        if (assignmentIndex === -1) {
          return null;
        }
        const equalsIndex = source.indexOf("=", assignmentIndex);
        if (equalsIndex === -1) {
          return null;
        }
        const braceStart = source.indexOf("{", equalsIndex);
        if (braceStart === -1) {
          return null;
        }
        let depth = 0;
        for (let index = braceStart; index < source.length; index += 1) {
          const char = source[index];
          if (char === "{") {
            depth += 1;
          } else if (char === "}") {
            depth -= 1;
            if (depth === 0) {
              const jsonString = source.slice(braceStart, index + 1);
              try {
                return JSON.parse(jsonString);
              } catch (error) {
                return null;
              }
            }
          }
        }
        return null;
      }
      module.exports = {
        safeQuery,
        safeQueryAll,
        getText,
        getAttribute,
        getMetaContent,
        getLinkHref,
        resolveUrl,
        extractJSONFromScripts,
        normalizeWhitespace
      };
      if (typeof window !== "undefined") {
        window.YouTubeToolkit = window.YouTubeToolkit || {};
        window.YouTubeToolkit.Helpers = window.YouTubeToolkit.Helpers || {};
        window.YouTubeToolkit.Helpers.DOM = module.exports;
      }
    }
  });

  // ../../common/youtube_toolkit/helpers/time_helpers.js
  var require_time_helpers = __commonJS({
    "../../common/youtube_toolkit/helpers/time_helpers.js"(exports, module) {
      "use strict";
      function toInteger(value) {
        const parsed = parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      function secondsToTimestamp(seconds) {
        if (!Number.isFinite(seconds) || seconds <= 0) {
          return null;
        }
        const wholeSeconds = Math.floor(seconds);
        const hours = Math.floor(wholeSeconds / 3600);
        const minutes = Math.floor(wholeSeconds % 3600 / 60);
        const secs = wholeSeconds % 60;
        const parts = [];
        if (hours > 0) {
          parts.push(`${hours}h`);
        }
        if (hours > 0 || minutes > 0) {
          parts.push(`${minutes}m`);
        }
        parts.push(`${secs}s`);
        return parts.join("");
      }
      function secondsToClock(seconds) {
        if (!Number.isFinite(seconds) || seconds <= 0) {
          return null;
        }
        const wholeSeconds = Math.floor(seconds);
        const hours = Math.floor(wholeSeconds / 3600);
        const minutes = Math.floor(wholeSeconds % 3600 / 60);
        const secs = wholeSeconds % 60;
        const pad = (value) => value.toString().padStart(2, "0");
        if (hours > 0) {
          return `${hours}:${pad(minutes)}:${pad(secs)}`;
        }
        return `${minutes}:${pad(secs)}`;
      }
      function parseClockText(text) {
        if (!text) {
          return null;
        }
        const sanitized = text.replace(/[^0-9:]/g, "").trim();
        if (!sanitized) {
          return null;
        }
        const parts = sanitized.split(":").map(toInteger);
        if (parts.some((part) => !Number.isFinite(part))) {
          return null;
        }
        while (parts.length < 3) {
          parts.unshift(0);
        }
        const [hours, minutes, seconds] = parts;
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        return totalSeconds > 0 ? totalSeconds : null;
      }
      function parseISODuration(isoDuration) {
        if (typeof isoDuration !== "string" || !isoDuration.startsWith("PT")) {
          return null;
        }
        const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) {
          return null;
        }
        const hours = toInteger(match[1]);
        const minutes = toInteger(match[2]);
        const seconds = toInteger(match[3]);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        return totalSeconds > 0 ? totalSeconds : null;
      }
      function formatTimestampParam(seconds) {
        if (!Number.isFinite(seconds) || seconds <= 0) {
          return null;
        }
        return `t=${Math.floor(seconds)}s`;
      }
      module.exports = {
        secondsToTimestamp,
        secondsToClock,
        parseClockText,
        parseISODuration,
        formatTimestampParam
      };
      if (typeof window !== "undefined") {
        window.YouTubeToolkit = window.YouTubeToolkit || {};
        window.YouTubeToolkit.Helpers = window.YouTubeToolkit.Helpers || {};
        window.YouTubeToolkit.Helpers.Time = module.exports;
      }
    }
  });

  // ../../common/youtube_toolkit/extractors/video_extractor.js
  var require_video_extractor = __commonJS({
    "../../common/youtube_toolkit/extractors/video_extractor.js"(exports, module) {
      "use strict";
      var DOM = require_dom_helpers();
      var Time = require_time_helpers();
      function getVideoIdFromUrl(url = "") {
        if (!url) {
          return null;
        }
        try {
          const parsed = new URL(url, "https://www.youtube.com");
          if (parsed.hostname === "youtu.be") {
            const slug = parsed.pathname.replace("/", "").trim();
            return slug || null;
          }
          const id = parsed.searchParams.get("v");
          if (id) {
            return id;
          }
          const segments = parsed.pathname.split("/");
          if (segments.includes("shorts")) {
            const idx = segments.indexOf("shorts");
            return segments[idx + 1] || null;
          }
          return null;
        } catch (error) {
          return null;
        }
      }
      function getPlaylistIdFromUrl(url = "") {
        if (!url) {
          return null;
        }
        try {
          const parsed = new URL(url, "https://www.youtube.com");
          return parsed.searchParams.get("list");
        } catch (error) {
          return null;
        }
      }
      function getPlayerResponse(doc) {
        return DOM.extractJSONFromScripts(doc, ["ytInitialPlayerResponse"]);
      }
      function extractVideoTitle(doc, playerResponse) {
        const ogTitle = DOM.getMetaContent(doc, 'meta[property="og:title"]');
        if (ogTitle) {
          return ogTitle;
        }
        const h1 = DOM.getText("h1.ytd-watch-metadata", doc);
        if (h1) {
          return h1;
        }
        const titleElement = DOM.getText("#title #container yt-formatted-string", doc);
        if (titleElement) {
          return titleElement;
        }
        return playerResponse?.videoDetails?.title || null;
      }
      function extractChannelName(doc, playerResponse) {
        const header = DOM.getText("#top-row #channel-name a", doc) || DOM.getText("#channel-name a", doc);
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
        const anchor = DOM.getAttribute("#channel-name a", "href", doc);
        if (anchor) {
          return DOM.resolveUrl(anchor);
        }
        const handleAnchor = DOM.getAttribute('a[href^="/@"]', "href", doc);
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
        const handleAnchor = DOM.getAttribute('a[href^="/@"]', "href", doc);
        if (!handleAnchor) {
          return null;
        }
        return handleAnchor.replace("/", "").trim();
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
          return liveBadge === "True";
        }
        const isLive = playerResponse?.videoDetails?.isLiveContent;
        return Boolean(isLive);
      }
      function extractVideoMetadata(doc, url = "") {
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
          description: DOM.getMetaContent(doc, 'meta[name="description"]') || null
        };
      }
      function extractPlaybackState(doc, options = {}) {
        const videoElement = options.videoElement || DOM.safeQuery("video", doc);
        if (!videoElement) {
          return { seconds: 0, formatted: null, isActive: false };
        }
        const seconds = Number(videoElement.currentTime || 0);
        const validSeconds = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
        return {
          seconds: validSeconds,
          formatted: Time.secondsToTimestamp(validSeconds) || null,
          isActive: validSeconds > 0
        };
      }
      module.exports = {
        extractVideoMetadata,
        extractPlaybackState,
        getVideoIdFromUrl,
        getPlaylistIdFromUrl
      };
      if (typeof window !== "undefined") {
        window.YouTubeToolkit = window.YouTubeToolkit || {};
        window.YouTubeToolkit.Extractors = window.YouTubeToolkit.Extractors || {};
        window.YouTubeToolkit.Extractors.Video = module.exports;
      }
    }
  });

  // ../../common/youtube_toolkit/extractors/channel_extractor.js
  var require_channel_extractor = __commonJS({
    "../../common/youtube_toolkit/extractors/channel_extractor.js"(exports, module) {
      "use strict";
      var DOM = require_dom_helpers();
      function extractSubscriberCount(doc) {
        const badge = DOM.getText("#subscriber-count", doc) || DOM.getText("#subscriber-count yt-formatted-string", doc);
        return badge || null;
      }
      function extractChannelMetadata(doc, url = "") {
        const title = DOM.getText("ytd-channel-name #text", doc) || DOM.getText('meta[property="og:title"]', doc);
        const description = DOM.getMetaContent(doc, 'meta[name="description"]');
        const canonicalUrl = DOM.getLinkHref(doc, 'link[rel="canonical"]') || url || null;
        const handle = DOM.getText("ytd-channel-handle", doc) || DOM.getAttribute('a[href^="/@"]', "href", doc);
        const avatar = DOM.getAttribute("#avatar img", "src", doc) || DOM.getAttribute("img#img", "src", doc);
        const subscriberCount = extractSubscriberCount(doc);
        return {
          title,
          description,
          canonicalUrl,
          handle: handle ? handle.replace("/", "").trim() : null,
          avatar,
          subscriberCount
        };
      }
      module.exports = {
        extractChannelMetadata
      };
      if (typeof window !== "undefined") {
        window.YouTubeToolkit = window.YouTubeToolkit || {};
        window.YouTubeToolkit.Extractors = window.YouTubeToolkit.Extractors || {};
        window.YouTubeToolkit.Extractors.Channel = module.exports;
      }
    }
  });

  // ../../common/youtube_toolkit/extractors/playlist_extractor.js
  var require_playlist_extractor = __commonJS({
    "../../common/youtube_toolkit/extractors/playlist_extractor.js"(exports, module) {
      "use strict";
      var DOM = require_dom_helpers();
      var Time = require_time_helpers();
      var VideoExtractor = require_video_extractor();
      var PLAYLIST_RENDERERS = [
        "ytd-playlist-video-renderer",
        "ytd-playlist-panel-video-renderer"
      ];
      function parseIndexFromRenderer(renderer) {
        const indexText = DOM.getText("#index span", renderer) || DOM.getText("#index", renderer);
        const parsed = parseInt(indexText, 10);
        return Number.isFinite(parsed) ? parsed : null;
      }
      function parseDuration(renderer) {
        const durationText = DOM.getText("span#text.ytd-thumbnail-overlay-time-status-renderer", renderer) || DOM.getText("span.ytd-thumbnail-overlay-time-status-renderer", renderer) || DOM.getText("span.thumbnail-overlay-time-status-renderer", renderer);
        const seconds = Time.parseClockText(durationText);
        return {
          durationSeconds: seconds,
          durationText: seconds ? Time.secondsToClock(seconds) : null
        };
      }
      function buildPlaylistItem(anchor, renderer, fallbackIndex) {
        if (!anchor) {
          return null;
        }
        const href = anchor.href || anchor.getAttribute("href");
        const resolvedUrl = DOM.resolveUrl(href);
        const urlObject = resolvedUrl ? new URL(resolvedUrl) : null;
        const videoId = urlObject ? VideoExtractor.getVideoIdFromUrl(urlObject.toString()) : null;
        const { durationSeconds, durationText } = parseDuration(renderer);
        const channelName = DOM.getText("a.yt-simple-endpoint.yt-formatted-string", renderer) || null;
        const playlistIndex = urlObject && urlObject.searchParams.get("index") ? parseInt(urlObject.searchParams.get("index"), 10) : parseIndexFromRenderer(renderer) || fallbackIndex;
        return {
          index: playlistIndex || fallbackIndex || null,
          title: DOM.getText(anchor) || null,
          url: resolvedUrl,
          videoId,
          durationSeconds,
          durationText,
          channelName
        };
      }
      function extractPlaylistItems(doc) {
        const items = [];
        const seen = /* @__PURE__ */ new Set();
        PLAYLIST_RENDERERS.forEach((selector) => {
          const renderers = DOM.safeQueryAll(selector, doc);
          renderers.forEach((renderer, idx) => {
            const anchor = DOM.safeQuery("a#video-title", renderer) || DOM.safeQuery("a.yt-simple-endpoint", renderer);
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
        return DOM.getText("yt-formatted-string#title", doc) || DOM.getText("yt-formatted-string.ytd-playlist-panel-renderer", doc) || DOM.getMetaContent(doc, 'meta[property="og:title"]') || null;
      }
      function extractPlaylistMetadata(doc, url = "") {
        const playlistId = VideoExtractor.getPlaylistIdFromUrl(url) || DOM.getAttribute('meta[itemprop="playlistId"]', "content", doc) || null;
        const title = extractPlaylistTitle(doc);
        const items = extractPlaylistItems(doc);
        const playlistUrl = playlistId ? `https://www.youtube.com/playlist?list=${playlistId}` : url || null;
        return {
          playlistId,
          title,
          url: playlistUrl,
          videos: items
        };
      }
      module.exports = {
        extractPlaylistMetadata
      };
      if (typeof window !== "undefined") {
        window.YouTubeToolkit = window.YouTubeToolkit || {};
        window.YouTubeToolkit.Extractors = window.YouTubeToolkit.Extractors || {};
        window.YouTubeToolkit.Extractors.Playlist = module.exports;
      }
    }
  });

  // ../../common/youtube_toolkit/extractors/page_state_extractor.js
  var require_page_state_extractor = __commonJS({
    "../../common/youtube_toolkit/extractors/page_state_extractor.js"(exports, module) {
      "use strict";
      var { resolveUrl } = require_dom_helpers();
      var WATCH_PATHS = ["/watch", "/live"];
      var PLAYLIST_PATHS = ["/playlist"];
      var SHORTS_PATH = "/shorts";
      function normalizeUrl(url) {
        if (!url && typeof window !== "undefined") {
          return window.location.href;
        }
        return url;
      }
      function determinePageState(url = "", doc) {
        const resolved = normalizeUrl(url);
        if (!resolved) {
          return "unknown";
        }
        let parsed;
        try {
          parsed = new URL(resolved, "https://www.youtube.com");
        } catch (error) {
          return "unknown";
        }
        const pathname = parsed.pathname || "";
        const hasWatchParam = parsed.searchParams.has("v");
        const hasPlaylistParam = parsed.searchParams.has("list");
        if (WATCH_PATHS.some((segment) => pathname.startsWith(segment)) || hasWatchParam) {
          return hasPlaylistParam ? "watch-with-playlist" : "watch";
        }
        if (pathname.startsWith(SHORTS_PATH)) {
          return "shorts";
        }
        if (PLAYLIST_PATHS.some((segment) => pathname.startsWith(segment)) || hasPlaylistParam) {
          return "playlist";
        }
        if (pathname.startsWith("/channel/") || pathname.startsWith("/@")) {
          return "channel";
        }
        if (doc) {
          const ogType = doc.querySelector ? doc.querySelector('meta[property="og:type"]') : null;
          const ogContent = ogType ? ogType.content : null;
          if (ogContent === "video.other") {
            return "watch";
          }
        }
        return "unknown";
      }
      function isYouTubeHost(url = "") {
        const resolved = normalizeUrl(url);
        if (!resolved) {
          return false;
        }
        try {
          const parsed = new URL(resolved, "https://www.youtube.com");
          return parsed.hostname.includes("youtube.com") || parsed.hostname === "youtu.be";
        } catch (error) {
          return false;
        }
      }
      module.exports = {
        determinePageState,
        isYouTubeHost
      };
      if (typeof window !== "undefined") {
        window.YouTubeToolkit = window.YouTubeToolkit || {};
        window.YouTubeToolkit.Extractors = window.YouTubeToolkit.Extractors || {};
        window.YouTubeToolkit.Extractors.PageState = module.exports;
      }
    }
  });

  // ../../common/youtube_toolkit/index.js
  var require_youtube_toolkit = __commonJS({
    "../../common/youtube_toolkit/index.js"(exports, module) {
      "use strict";
      var DOMHelpers = require_dom_helpers();
      var TimeHelpers = require_time_helpers();
      var VideoExtractor = require_video_extractor();
      var ChannelExtractor = require_channel_extractor();
      var PlaylistExtractor = require_playlist_extractor();
      var PageStateExtractor = require_page_state_extractor();
      var YouTubeToolkit = {
        version: "0.1.0",
        Helpers: {
          DOM: DOMHelpers,
          Time: TimeHelpers
        },
        Extractors: {
          Video: VideoExtractor,
          Channel: ChannelExtractor,
          Playlist: PlaylistExtractor,
          PageState: PageStateExtractor
        }
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = YouTubeToolkit;
      }
      if (typeof window !== "undefined") {
        window.YouTubeToolkit = YouTubeToolkit;
      }
    }
  });

  // ../../common/source_capture/source_capture.js
  var require_source_capture = __commonJS({
    "../../common/source_capture/source_capture.js"(exports, module) {
      "use strict";
      var DEFAULT_HOST = "127.0.0.1";
      var DEFAULT_PORT = 8787;
      var DEFAULT_TOKEN = "source-capture-dev";
      var DEFAULT_TIMEOUT_MS = 8e3;
      function createLogBuffer(maxLines = 5e3) {
        const lines = [];
        return {
          push(line) {
            lines.push(typeof line === "string" ? line : String(line));
            if (lines.length > maxLines) {
              lines.splice(0, lines.length - maxLines);
            }
          },
          getText() {
            return lines.join("\n");
          },
          clear() {
            lines.length = 0;
          },
          size() {
            return lines.length;
          }
        };
      }
      function resolveGmXhr() {
        if (typeof GM_xmlhttpRequest === "function") {
          return GM_xmlhttpRequest;
        }
        if (typeof GM !== "undefined" && GM && typeof GM.xmlHttpRequest === "function") {
          return GM.xmlHttpRequest.bind(GM);
        }
        return null;
      }
      function postFile(opts) {
        return new Promise((resolve) => {
          const xhr = resolveGmXhr();
          if (!xhr) {
            resolve({ ok: false, path: opts.path, error: "GM_xmlhttpRequest unavailable (missing @grant?)" });
            return;
          }
          const url = `http://${opts.host}:${opts.port}/save`;
          try {
            xhr({
              method: "POST",
              url,
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Capture-Token": opts.token,
                "X-Capture-Userscript": opts.userscript,
                "X-Capture-Path": opts.path
              },
              data: opts.content,
              timeout: DEFAULT_TIMEOUT_MS,
              onload: (response) => {
                const status = response && typeof response.status === "number" ? response.status : 0;
                resolve({
                  ok: status >= 200 && status < 300,
                  path: opts.path,
                  status,
                  response: response ? response.responseText : ""
                });
              },
              onerror: () => resolve({ ok: false, path: opts.path, error: "network error (server not running?)" }),
              ontimeout: () => resolve({ ok: false, path: opts.path, error: "timeout" })
            });
          } catch (error) {
            resolve({ ok: false, path: opts.path, error: String(error) });
          }
        });
      }
      function capture(options) {
        const opts = options || {};
        const host = opts.host || DEFAULT_HOST;
        const port = opts.port || DEFAULT_PORT;
        const token = opts.token || DEFAULT_TOKEN;
        const userscript = opts.userscript;
        const files = Array.isArray(opts.files) ? opts.files.filter((file) => file && file.path) : [];
        if (!userscript || files.length === 0) {
          const result = { ok: false, results: [], error: "capture requires { userscript, files: [{path, content}] }" };
          if (typeof opts.onResult === "function") {
            try {
              opts.onResult(result);
            } catch (error) {
            }
          }
          return Promise.resolve(result);
        }
        const requests = files.map((file) => postFile({
          host,
          port,
          token,
          userscript,
          path: file.path,
          content: file.content == null ? "" : String(file.content)
        }));
        return Promise.all(requests).then((results) => {
          const ok = results.length > 0 && results.every((entry) => entry.ok);
          const result = { ok, results };
          if (typeof opts.onResult === "function") {
            try {
              opts.onResult(result);
            } catch (error) {
            }
          }
          return result;
        });
      }
      var SourceCapture = {
        version: "0.1.0",
        DEFAULT_HOST,
        DEFAULT_PORT,
        DEFAULT_TOKEN,
        capture,
        postFile,
        createLogBuffer,
        // Shared buffer instance for the common "pipe my logs through this" case.
        logBuffer: createLogBuffer()
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = SourceCapture;
      }
      if (typeof window !== "undefined") {
        window.SourceCapture = SourceCapture;
      }
    }
  });

  // src/userscript.entry.js
  var import_validation_helpers = __toESM(require_validation_helpers(), 1);
  var import_shared_extractor = __toESM(require_shared_extractor(), 1);
  var import_product_extractor = __toESM(require_product_extractor(), 1);
  var import_store_extractor = __toESM(require_store_extractor(), 1);
  var import_link_parser = __toESM(require_link_parser(), 1);
  var import_link_cleaner = __toESM(require_link_cleaner(), 1);
  var import_link_image = __toESM(require_link_image(), 1);
  var import_markdown_formatter = __toESM(require_markdown_formatter(), 1);
  var import_markdown_generator = __toESM(require_markdown_generator(), 1);
  var import_lib = __toESM(require_amazon_toolkit(), 1);
  var import_lib_youtube = __toESM(require_youtube_toolkit(), 1);
  var import_source_capture = __toESM(require_source_capture(), 1);

  // src/markdown_linker.source.js
  console.log(`markdown_linker: 01`);
  (function() {
    "use strict";
    console.log(`markdown_linker: 11`);
    let isDebug = false;
    let logBase = "markdown_linker";
    let activeNotification = null;
    let currentMenu = null;
    let targetElement = null;
    let targetUrl = null;
    let menuClickHandler = null;
    let menuEscapeHandler = null;
    const SELECTION_MEMORY_MS = 15e3;
    let lastNonEmptySelection = null;
    let lastSelectionTimestamp = 0;
    const DOMAIN_TITLE_OVERRIDES = {
      github: "GitHub",
      gitlab: "GitLab",
      google: "Google",
      amazon: "Amazon",
      notion: "Notion",
      linkedin: "LinkedIn",
      youtube: "YouTube",
      stackoverflow: "Stack Overflow",
      medium: "Medium"
    };
    document.addEventListener("selectionchange", () => {
      const selection = window.getSelection ? window.getSelection() : null;
      if (!selection) {
        return;
      }
      const text = selection.toString().trim();
      if (!text) {
        return;
      }
      lastNonEmptySelection = text;
      lastSelectionTimestamp = Date.now();
    });
    const IS_DEBUG_PREF_KEY = "markdown_linker.is_debug";
    const ALT_Z_TITLE_PREF_KEY = "markdown_linker.altz_title_source";
    const ALT_Z_TITLE_OPTIONS = [
      { id: "url-forward", label: "URL (forward)" },
      { id: "url-reverse", label: "URL (reverse)" },
      { id: "anchor", label: "Anchor text" },
      { id: "page", label: "Page title" }
    ];
    let altZTitlePreference = ALT_Z_TITLE_OPTIONS[0].id;
    const CAPTURE_MODE_PREF_KEY = "markdown_linker.capture_mode";
    const CAPTURE_MODE_OPTIONS = [
      { id: "none", label: "none" },
      { id: "html_logs", label: "html & logs" }
    ];
    let captureMode = CAPTURE_MODE_OPTIONS[0].id;
    let captureMenuCommandId = null;
    const TRIGGERS_PREF_KEY = "markdown_linker.triggers";
    const DEFAULT_TRIGGERS = {
      menu: [{ modifiers: {}, keys: ["v"], requiresClick: false }],
      // hover + V -> open menu
      inferQuiet: [{ modifiers: {}, keys: ["b"], requiresClick: false }],
      // hover + B -> copy one link
      inferBuffer: [{ modifiers: {}, keys: ["z"], requiresClick: true }]
      // hold Z + click… -> buffer list
    };
    let triggers = cloneTriggers(DEFAULT_TRIGGERS);
    function bufferLog(line) {
      try {
        if (typeof window !== "undefined" && window.SourceCapture && window.SourceCapture.logBuffer) {
          window.SourceCapture.logBuffer.push(`${(/* @__PURE__ */ new Date()).toISOString()} ${line}`);
        }
      } catch (error) {
      }
    }
    function log(message) {
      const line = `${logBase}: ${message}`;
      bufferLog(line);
      if (isDebug) {
        console.log(line);
      }
    }
    function logWarn(message) {
      const line = `${logBase}: ${message}`;
      bufferLog(`WARN ${line}`);
      console.warn(line);
    }
    function logError(message) {
      const line = `${logBase}: ${message}`;
      bufferLog(`ERROR ${line}`);
      console.error(line);
    }
    function logFunctionBegin(functionName) {
      const line = `${logBase}: begin ${functionName}`;
      bufferLog(line);
      if (isDebug) {
        console.log(line);
      }
    }
    function logFunctionEnd(functionName) {
      const line = `${logBase}: end ${functionName}`;
      bufferLog(line);
      if (isDebug) {
        console.log(line);
      }
    }
    function unwrap(obj, prop) {
      return obj && obj[prop] ? obj[prop] : "null";
    }
    function getAltZOption(optionId) {
      return ALT_Z_TITLE_OPTIONS.find((option) => option.id === optionId) || ALT_Z_TITLE_OPTIONS[0];
    }
    function loadAltZTitlePreference() {
      logFunctionBegin("loadAltZTitlePreference");
      let storedValue = ALT_Z_TITLE_OPTIONS[0].id;
      if (typeof GM_getValue === "function") {
        try {
          storedValue = GM_getValue(ALT_Z_TITLE_PREF_KEY, storedValue);
        } catch (error) {
          logWarn(`Failed to load quick-copy title preference: ${error}`);
        }
      }
      if (!ALT_Z_TITLE_OPTIONS.some((option) => option.id === storedValue)) {
        logWarn(`Quick-copy title preference "${storedValue}" invalid, reverting to default`);
        storedValue = ALT_Z_TITLE_OPTIONS[0].id;
      }
      log(`Loaded quick-copy title preference: ${storedValue}`);
      logFunctionEnd("loadAltZTitlePreference");
      return storedValue;
    }
    function persistAltZTitlePreference() {
      logFunctionBegin("persistAltZTitlePreference");
      if (typeof GM_setValue === "function") {
        try {
          GM_setValue(ALT_Z_TITLE_PREF_KEY, altZTitlePreference);
        } catch (error) {
          logWarn(`Failed to persist quick-copy title preference: ${error}`);
        }
      }
      refreshSettingsPanel();
      logFunctionEnd("persistAltZTitlePreference");
    }
    function cycleAltZTitlePreference() {
      logFunctionBegin("cycleAltZTitlePreference");
      const currentIndex = ALT_Z_TITLE_OPTIONS.findIndex((option) => option.id === altZTitlePreference);
      const nextIndex = (currentIndex + 1) % ALT_Z_TITLE_OPTIONS.length;
      altZTitlePreference = ALT_Z_TITLE_OPTIONS[nextIndex].id;
      log(`Quick-copy title preference changed to: ${altZTitlePreference}`);
      persistAltZTitlePreference();
      const optionLabel = getAltZOption(altZTitlePreference).label;
      showNotification(`Quick-copy title: ${optionLabel}`);
      logFunctionEnd("cycleAltZTitlePreference");
    }
    function initializeAltZPreference() {
      logFunctionBegin("initializeAltZPreference");
      altZTitlePreference = loadAltZTitlePreference();
      logFunctionEnd("initializeAltZPreference");
    }
    function loadIsDebug() {
      logFunctionBegin("loadIsDebug");
      let stored = false;
      if (typeof GM_getValue === "function") {
        try {
          stored = GM_getValue(IS_DEBUG_PREF_KEY, false);
        } catch (error) {
        }
      }
      const value = stored === true || stored === "true";
      logFunctionEnd("loadIsDebug");
      return value;
    }
    function persistIsDebug() {
      logFunctionBegin("persistIsDebug");
      if (typeof GM_setValue === "function") {
        try {
          GM_setValue(IS_DEBUG_PREF_KEY, isDebug);
        } catch (error) {
          logWarn(`Failed to persist debug mode: ${error}`);
        }
      }
      refreshSettingsPanel();
      logFunctionEnd("persistIsDebug");
    }
    function toggleIsDebug() {
      logFunctionBegin("toggleIsDebug");
      isDebug = !isDebug;
      log(`Debug mode changed to: ${isDebug}`);
      persistIsDebug();
      showNotification(`Debug mode: ${isDebug ? "on" : "off"}`);
      logFunctionEnd("toggleIsDebug");
    }
    function initializeIsDebug() {
      logFunctionBegin("initializeIsDebug");
      isDebug = loadIsDebug();
      logFunctionEnd("initializeIsDebug");
    }
    function getCaptureOption(optionId) {
      return CAPTURE_MODE_OPTIONS.find((option) => option.id === optionId) || CAPTURE_MODE_OPTIONS[0];
    }
    function loadCaptureMode() {
      logFunctionBegin("loadCaptureMode");
      let storedValue = CAPTURE_MODE_OPTIONS[0].id;
      if (typeof GM_getValue === "function") {
        try {
          storedValue = GM_getValue(CAPTURE_MODE_PREF_KEY, storedValue);
        } catch (error) {
          logWarn(`Failed to load capture mode: ${error}`);
        }
      }
      if (!CAPTURE_MODE_OPTIONS.some((option) => option.id === storedValue)) {
        logWarn(`Capture mode "${storedValue}" invalid, reverting to default`);
        storedValue = CAPTURE_MODE_OPTIONS[0].id;
      }
      log(`Loaded capture mode: ${storedValue}`);
      logFunctionEnd("loadCaptureMode");
      return storedValue;
    }
    function persistCaptureMode() {
      logFunctionBegin("persistCaptureMode");
      if (typeof GM_setValue === "function") {
        try {
          GM_setValue(CAPTURE_MODE_PREF_KEY, captureMode);
        } catch (error) {
          logWarn(`Failed to persist capture mode: ${error}`);
        }
      }
      registerCaptureModeMenuCommand();
      logFunctionEnd("persistCaptureMode");
    }
    function registerCaptureModeMenuCommand() {
      logFunctionBegin("registerCaptureModeMenuCommand");
      if (typeof GM_registerMenuCommand !== "function") {
        log("GM_registerMenuCommand unavailable, skipping capture menu registration");
        logFunctionEnd("registerCaptureModeMenuCommand");
        return;
      }
      if (captureMenuCommandId && typeof GM_unregisterMenuCommand === "function") {
        try {
          GM_unregisterMenuCommand(captureMenuCommandId);
        } catch (error) {
          logWarn(`Failed to unregister previous capture menu command: ${error}`);
        }
      }
      const optionLabel = getCaptureOption(captureMode).label;
      const menuLabel = `Capture: ${optionLabel} (click to cycle)`;
      captureMenuCommandId = GM_registerMenuCommand(menuLabel, cycleCaptureMode);
      logFunctionEnd("registerCaptureModeMenuCommand");
    }
    function cycleCaptureMode() {
      logFunctionBegin("cycleCaptureMode");
      const currentIndex = CAPTURE_MODE_OPTIONS.findIndex((option) => option.id === captureMode);
      const nextIndex = (currentIndex + 1) % CAPTURE_MODE_OPTIONS.length;
      captureMode = CAPTURE_MODE_OPTIONS[nextIndex].id;
      log(`Capture mode changed to: ${captureMode}`);
      persistCaptureMode();
      showNotification(`Capture: ${getCaptureOption(captureMode).label}`);
      logFunctionEnd("cycleCaptureMode");
    }
    function initializeCaptureMode() {
      logFunctionBegin("initializeCaptureMode");
      captureMode = loadCaptureMode();
      registerCaptureModeMenuCommand();
      logFunctionEnd("initializeCaptureMode");
    }
    log("begin script");
    initializeIsDebug();
    initializeAltZPreference();
    initializeCaptureMode();
    triggers = loadTriggers();
    registerSettingsMenuCommand();
    let youtubeContextCacheKey = null;
    let youtubeContextCacheValue = null;
    function getYouTubeToolkit() {
      logFunctionBegin("getYouTubeToolkit");
      if (typeof window === "undefined") {
        log("Window unavailable, cannot access YouTube toolkit");
        logFunctionEnd("getYouTubeToolkit");
        return null;
      }
      const toolkit = window.YouTubeToolkit || null;
      log(`YouTube toolkit ${toolkit ? "available" : "unavailable"}`);
      logFunctionEnd("getYouTubeToolkit");
      return toolkit;
    }
    function isYouTubeUrl(url) {
      logFunctionBegin("isYouTubeUrl");
      if (!url) {
        log("URL missing for YouTube detection");
        logFunctionEnd("isYouTubeUrl");
        return false;
      }
      const toolkit = getYouTubeToolkit();
      const pageStateExtractor = toolkit?.Extractors?.PageState;
      if (pageStateExtractor && typeof pageStateExtractor.isYouTubeHost === "function") {
        const toolkitResult = pageStateExtractor.isYouTubeHost(url);
        log(`Toolkit YouTube host result: ${toolkitResult}`);
        logFunctionEnd("isYouTubeUrl");
        return toolkitResult;
      }
      try {
        const parsed = new URL(url, window.location.href);
        const hostname = parsed.hostname || "";
        const fallbackResult = hostname.includes("youtube.com") || hostname === "youtu.be";
        log(`Fallback YouTube host result: ${fallbackResult}`);
        logFunctionEnd("isYouTubeUrl");
        return fallbackResult;
      } catch (error) {
        logWarn(`Failed to parse URL for YouTube detection: ${error.message}`);
        logFunctionEnd("isYouTubeUrl");
        return false;
      }
    }
    function extractYouTubeVideoIdFromUrl(urlLike) {
      logFunctionBegin("extractYouTubeVideoIdFromUrl");
      if (!urlLike) {
        log("URL missing for video ID extraction");
        logFunctionEnd("extractYouTubeVideoIdFromUrl");
        return null;
      }
      let urlObj;
      try {
        urlObj = urlLike instanceof URL ? urlLike : new URL(urlLike, window.location.href);
      } catch (error) {
        logWarn(`Invalid URL for video ID extraction: ${error.message}`);
        logFunctionEnd("extractYouTubeVideoIdFromUrl");
        return null;
      }
      const candidateKeys = ["v", "vi", "video_id"];
      const idPattern = /^[A-Za-z0-9_-]{11}$/;
      for (const key of candidateKeys) {
        const paramCandidate = urlObj.searchParams.get(key);
        if (paramCandidate && idPattern.test(paramCandidate)) {
          log(`Extracted video ID from query parameter: ${paramCandidate}`);
          logFunctionEnd("extractYouTubeVideoIdFromUrl");
          return paramCandidate;
        }
      }
      if (urlObj.hostname === "youtu.be") {
        const shortCandidate = urlObj.pathname.slice(1).split("/")[0];
        if (shortCandidate && idPattern.test(shortCandidate)) {
          log(`Extracted video ID from youtu.be short URL: ${shortCandidate}`);
          logFunctionEnd("extractYouTubeVideoIdFromUrl");
          return shortCandidate;
        }
      }
      const pathMatch = urlObj.pathname.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/);
      if (pathMatch) {
        log(`Extracted video ID from path segment: ${pathMatch[1]}`);
        logFunctionEnd("extractYouTubeVideoIdFromUrl");
        return pathMatch[1];
      }
      log("No video ID found in URL");
      logFunctionEnd("extractYouTubeVideoIdFromUrl");
      return null;
    }
    function buildYouTubeFallbackContext(url) {
      logFunctionBegin("buildYouTubeFallbackContext");
      let urlObj;
      try {
        urlObj = new URL(url, window.location.href);
      } catch (error) {
        logWarn(`Fallback context URL parse failed: ${error.message}`);
        logFunctionEnd("buildYouTubeFallbackContext");
        return null;
      }
      const hostname = (urlObj.hostname || "").toLowerCase();
      if (!hostname.includes("youtube.com") && hostname !== "youtu.be") {
        log("Fallback context skipped: non-YouTube host");
        logFunctionEnd("buildYouTubeFallbackContext");
        return null;
      }
      const videoId = extractYouTubeVideoIdFromUrl(urlObj);
      const canonicalUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : urlObj.toString();
      const shortUrl = videoId ? `https://youtu.be/${videoId}` : null;
      const titleFromDom = getFirstMatchingText([
        { selector: "h1.ytd-watch-metadata" },
        { selector: "#title h1" },
        { selector: 'meta[property="og:title"]', attribute: "content" },
        { selector: 'meta[name="title"]', attribute: "content" }
      ], "YouTube title");
      let resolvedTitle = stripYouTubeTitleSuffix(titleFromDom);
      if (!resolvedTitle && document && typeof document.title === "string") {
        resolvedTitle = stripYouTubeTitleSuffix(document.title);
      }
      const channelName = getFirstMatchingText([
        { selector: "#owner-name a" },
        { selector: "ytd-channel-name a" },
        { selector: "#channel-name a" },
        { selector: 'meta[itemprop="author"]', attribute: "content" }
      ], "YouTube channel");
      if (!resolvedTitle) {
        resolvedTitle = "YouTube Video";
      }
      const context = {
        video: {
          title: resolvedTitle,
          channelName: channelName || null,
          shortUrl,
          canonicalUrl
        },
        playlist: null,
        playback: null,
        channel: channelName ? { title: channelName, canonicalUrl: null } : null,
        pageState: "watch"
      };
      const videoElement = document.querySelector("video");
      if (videoElement && typeof videoElement.currentTime === "number" && Number.isFinite(videoElement.currentTime)) {
        context.playback = {
          isActive: true,
          seconds: videoElement.currentTime
        };
      }
      if (!context.video.title) {
        log("Fallback context missing title, aborting");
        logFunctionEnd("buildYouTubeFallbackContext");
        return null;
      }
      const cacheKey = videoId ? `fallback-video:${videoId}` : `fallback-url:${canonicalUrl}`;
      if (cacheKey && youtubeContextCacheKey === cacheKey && youtubeContextCacheValue) {
        log("Using cached fallback YouTube context");
        logFunctionEnd("buildYouTubeFallbackContext");
        return youtubeContextCacheValue;
      }
      if (cacheKey) {
        youtubeContextCacheKey = cacheKey;
      }
      youtubeContextCacheValue = context;
      log("Cached fallback YouTube context");
      logFunctionEnd("buildYouTubeFallbackContext");
      return context;
    }
    function buildYouTubePlaylistMarkdown(playlistMeta) {
      logFunctionBegin("buildYouTubePlaylistMarkdown");
      if (!playlistMeta || !Array.isArray(playlistMeta.videos) || playlistMeta.videos.length === 0) {
        log("Playlist metadata incomplete, cannot build markdown");
        logFunctionEnd("buildYouTubePlaylistMarkdown");
        return null;
      }
      const header = playlistMeta.title ? `**${playlistMeta.title}**
` : "";
      const lines = playlistMeta.videos.map((item, index) => {
        const fallbackTitle = item.videoId ? `Video ${index + 1} (${item.videoId})` : `Video ${index + 1}`;
        const title = item.title || fallbackTitle;
        const videoUrl = item.url || (item.videoId ? `https://www.youtube.com/watch?v=${item.videoId}` : playlistMeta.url);
        const infoParts = [];
        if (item.channelName) {
          infoParts.push(item.channelName);
        }
        if (item.durationText) {
          infoParts.push(item.durationText);
        }
        const infoSuffix = infoParts.length > 0 ? ` \u2014 ${infoParts.join(" \u2022 ")}` : "";
        return `${index + 1}. [${title}](${videoUrl})${infoSuffix}`;
      });
      const markdown = `${header}${lines.join("\n")}`;
      logFunctionEnd("buildYouTubePlaylistMarkdown");
      return markdown;
    }
    function formatSecondsAsTimestamp(seconds) {
      if (!Number.isFinite(seconds) || seconds < 0) {
        return null;
      }
      const totalSeconds = Math.floor(seconds);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor(totalSeconds % 3600 / 60);
      const secs = totalSeconds % 60;
      const paddedMinutes = String(minutes).padStart(2, "0");
      const paddedSeconds = String(secs).padStart(2, "0");
      if (hours > 0) {
        return `${hours}:${paddedMinutes}:${paddedSeconds}`;
      }
      return `${paddedMinutes}:${paddedSeconds}`;
    }
    function isLikelyYouTubeDescription(candidate) {
      if (!candidate) {
        return false;
      }
      const normalized = candidate.trim();
      if (!normalized) {
        return false;
      }
      if (normalized.length >= 140) {
        return true;
      }
      if (normalized.includes("\n")) {
        return true;
      }
      if (/https?:\/\//i.test(normalized)) {
        return true;
      }
      if (/subscribe|available\snow|check\s+out/i.test(normalized)) {
        return true;
      }
      return false;
    }
    function enrichYouTubeContextWithFallback(context, url) {
      if (!context) {
        return context;
      }
      const needsVideoFallback = !context.video || isLikelyYouTubeDescription(context.video.title);
      const needsChannelFallback = !context.channel || !context.channel.title;
      if (!needsVideoFallback && !needsChannelFallback) {
        return context;
      }
      const fallbackContext = buildYouTubeFallbackContext(url);
      if (!fallbackContext) {
        return context;
      }
      if (needsVideoFallback && fallbackContext.video) {
        if (!context.video) {
          context.video = fallbackContext.video;
        } else {
          context.video.title = fallbackContext.video.title || context.video.title;
          context.video.channelName = context.video.channelName || fallbackContext.video.channelName;
          context.video.shortUrl = context.video.shortUrl || fallbackContext.video.shortUrl;
          context.video.canonicalUrl = context.video.canonicalUrl || fallbackContext.video.canonicalUrl;
        }
      }
      if (needsChannelFallback && fallbackContext.channel) {
        context.channel = context.channel || fallbackContext.channel;
      }
      return context;
    }
    function buildYouTubeContextIntent(url, toolkit) {
      logFunctionBegin("buildYouTubeContextIntent");
      if (!url || !toolkit) {
        log("Missing URL or toolkit for YouTube context intent");
        logFunctionEnd("buildYouTubeContextIntent");
        return { key: null };
      }
      const pageStateExtractor = toolkit?.Extractors?.PageState;
      const videoExtractor = toolkit?.Extractors?.Video;
      if (!pageStateExtractor || !videoExtractor) {
        log("Toolkit missing PageState or Video extractors");
        logFunctionEnd("buildYouTubeContextIntent");
        return { key: null };
      }
      let targetUrl2;
      let currentUrl;
      try {
        targetUrl2 = new URL(url, window.location.href);
        currentUrl = new URL(window.location.href);
      } catch (error) {
        logWarn(`Failed to parse URLs for context intent: ${error.message}`);
        logFunctionEnd("buildYouTubeContextIntent");
        return { key: null };
      }
      const isCurrentYouTube = pageStateExtractor.isYouTubeHost(currentUrl.toString());
      const isTargetYouTube = pageStateExtractor.isYouTubeHost(targetUrl2.toString());
      if (!isCurrentYouTube || !isTargetYouTube) {
        log("Either current or target URL is not a YouTube host");
        logFunctionEnd("buildYouTubeContextIntent");
        return { key: null };
      }
      const targetVideoId = videoExtractor.getVideoIdFromUrl(targetUrl2.toString());
      const currentVideoId = videoExtractor.getVideoIdFromUrl(currentUrl.toString());
      const sameVideo = Boolean(targetVideoId && currentVideoId && targetVideoId === currentVideoId);
      let targetPlaylistId = videoExtractor.getPlaylistIdFromUrl(targetUrl2.toString());
      const currentPlaylistId = videoExtractor.getPlaylistIdFromUrl(currentUrl.toString());
      if (!targetPlaylistId && sameVideo) {
        targetPlaylistId = currentPlaylistId;
      }
      const samePlaylist = Boolean(targetPlaylistId && currentPlaylistId && targetPlaylistId === currentPlaylistId);
      const sameChannel = currentUrl.pathname === targetUrl2.pathname && (currentUrl.pathname.startsWith("/channel/") || currentUrl.pathname.startsWith("/@"));
      let key = null;
      if (sameVideo) {
        key = `video:${currentVideoId}:${currentPlaylistId || ""}`;
      } else if (samePlaylist) {
        key = `playlist:${targetPlaylistId || currentPlaylistId}`;
      } else if (sameChannel) {
        key = `channel:${currentUrl.pathname}`;
      }
      log(`YouTube context key computed: ${key || "none"}`);
      logFunctionEnd("buildYouTubeContextIntent");
      return {
        key,
        sameVideo,
        samePlaylist,
        sameChannel,
        playlistId: currentPlaylistId || targetPlaylistId || null
      };
    }
    function getYouTubeContext(url) {
      logFunctionBegin("getYouTubeContext");
      if (!url || !isYouTubeUrl(url)) {
        log("URL not eligible for YouTube context");
        logFunctionEnd("getYouTubeContext");
        return null;
      }
      const toolkit = getYouTubeToolkit();
      if (!toolkit) {
        log("YouTube toolkit unavailable, attempting DOM fallback context");
        const fallbackContext = buildYouTubeFallbackContext(url);
        logFunctionEnd("getYouTubeContext");
        return fallbackContext;
      }
      const intent = buildYouTubeContextIntent(url, toolkit);
      if (!intent.key) {
        log("No valid YouTube context key, attempting fallback context");
        const fallbackContext = buildYouTubeFallbackContext(url);
        logFunctionEnd("getYouTubeContext");
        return fallbackContext;
      }
      if (youtubeContextCacheKey === intent.key && youtubeContextCacheValue) {
        log("Using cached YouTube context");
        logFunctionEnd("getYouTubeContext");
        return youtubeContextCacheValue;
      }
      const pageStateExtractor = toolkit?.Extractors?.PageState;
      const videoExtractor = toolkit?.Extractors?.Video;
      const playlistExtractor = toolkit?.Extractors?.Playlist;
      const channelExtractor = toolkit?.Extractors?.Channel;
      const context = {
        video: null,
        playlist: null,
        playback: null,
        channel: null,
        pageState: null
      };
      if (pageStateExtractor && typeof pageStateExtractor.determinePageState === "function") {
        context.pageState = pageStateExtractor.determinePageState(window.location.href, document);
      }
      if (intent.sameVideo && videoExtractor) {
        context.video = videoExtractor.extractVideoMetadata(document, url);
        context.playback = videoExtractor.extractPlaybackState(document);
      }
      const shouldAttachPlaylist = intent.samePlaylist || intent.sameVideo && intent.playlistId || context.pageState === "playlist" || context.pageState === "watch-with-playlist";
      if (shouldAttachPlaylist && playlistExtractor) {
        const playlistSourceUrl = intent.samePlaylist ? url : window.location.href;
        context.playlist = playlistExtractor.extractPlaylistMetadata(document, playlistSourceUrl);
      }
      if (intent.sameChannel && channelExtractor) {
        context.channel = channelExtractor.extractChannelMetadata(document, url);
      }
      if (!context.video && !context.playlist && !context.channel) {
        log("YouTube context extraction produced no data, attempting fallback context");
        const fallbackContext = buildYouTubeFallbackContext(url);
        logFunctionEnd("getYouTubeContext");
        return fallbackContext;
      }
      const enrichedContext = enrichYouTubeContextWithFallback(context, url);
      youtubeContextCacheKey = intent.key;
      youtubeContextCacheValue = enrichedContext;
      log("Cached toolkit YouTube context");
      logFunctionEnd("getYouTubeContext");
      return enrichedContext;
    }
    function buildYouTubeVideoTitle(videoMeta) {
      logFunctionBegin("buildYouTubeVideoTitle");
      if (!videoMeta) {
        log("Video metadata missing");
        logFunctionEnd("buildYouTubeVideoTitle");
        return null;
      }
      const channel = videoMeta.channelName || videoMeta.channelHandle || "YouTube";
      const title = videoMeta.title || "Video";
      const formatted = `YouTube: ${channel} - ${title}`;
      log(`Formatted YouTube video title: "${formatted}"`);
      logFunctionEnd("buildYouTubeVideoTitle");
      return formatted;
    }
    function buildYouTubeTimestampUrl(baseUrl, timestampValue) {
      logFunctionBegin("buildYouTubeTimestampUrl");
      if (!baseUrl || !timestampValue) {
        log("Base URL or timestamp missing");
        logFunctionEnd("buildYouTubeTimestampUrl");
        return null;
      }
      try {
        const urlObj = new URL(baseUrl, window.location.href);
        urlObj.searchParams.set("t", timestampValue);
        const result = urlObj.toString();
        log(`Timestamp URL built: ${result}`);
        logFunctionEnd("buildYouTubeTimestampUrl");
        return result;
      } catch (error) {
        logWarn(`Failed to build timestamp URL via URL API: ${error.message}`);
        const separator = baseUrl.includes("?") ? "&" : "?";
        const fallback = `${baseUrl}${separator}t=${timestampValue}`;
        log(`Using fallback timestamp URL: ${fallback}`);
        logFunctionEnd("buildYouTubeTimestampUrl");
        return fallback;
      }
    }
    function buildYouTubeTimestampMenuOptions(context, baseTitle, fallbackUrl) {
      logFunctionBegin("buildYouTubeTimestampMenuOptions");
      if (!context || !context.playback || !context.playback.isActive || !context.video) {
        log("Timestamp prerequisites missing (context/playback/video)");
        logFunctionEnd("buildYouTubeTimestampMenuOptions");
        return [];
      }
      const seconds = context.playback.seconds;
      if (!Number.isFinite(seconds) || seconds <= 0) {
        log("Playback seconds invalid for timestamp options");
        logFunctionEnd("buildYouTubeTimestampMenuOptions");
        return [];
      }
      const shortBase = context.video.shortUrl || fallbackUrl || context.video.canonicalUrl;
      if (!shortBase) {
        log("No base URL available for timestamp links");
        logFunctionEnd("buildYouTubeTimestampMenuOptions");
        return [];
      }
      const timestampDisplay = formatSecondsAsTimestamp(seconds) || `${Math.floor(seconds)}s`;
      const decoratedBaseTitle = baseTitle || context.video.title || "YouTube Video";
      const decoratedTitle = `${decoratedBaseTitle} @ ${timestampDisplay}`;
      const timestampUrl = buildYouTubeTimestampUrl(shortBase, `${Math.floor(seconds)}`);
      if (!timestampUrl) {
        log("Failed to build timestamp URL");
        logFunctionEnd("buildYouTubeTimestampMenuOptions");
        return [];
      }
      const option = {
        label: "Timestamp",
        displayValue: decoratedTitle,
        tooltip: "Link to the video at the current playback position.",
        getResult: () => ({
          title: decoratedTitle,
          url: timestampUrl
        })
      };
      log("Built 1 timestamp menu option");
      logFunctionEnd("buildYouTubeTimestampMenuOptions");
      return [option];
    }
    function getFirstMatchingText(descriptors, contextLabel) {
      logFunctionBegin("getFirstMatchingText");
      if (!Array.isArray(descriptors) || descriptors.length === 0) {
        log("Descriptor list empty");
        logFunctionEnd("getFirstMatchingText");
        return null;
      }
      for (let index = 0; index < descriptors.length; index += 1) {
        const descriptor = descriptors[index];
        if (!descriptor || !descriptor.selector) {
          continue;
        }
        const element = document.querySelector(descriptor.selector);
        if (!element) {
          continue;
        }
        const rawValue = descriptor.attribute ? element.getAttribute(descriptor.attribute) : element.textContent;
        const trimmedValue = rawValue ? rawValue.trim() : "";
        if (trimmedValue) {
          log(`Matched ${contextLabel} selector: ${descriptor.selector}`);
          logFunctionEnd("getFirstMatchingText");
          return trimmedValue;
        }
      }
      log(`No ${contextLabel} selector produced text`);
      logFunctionEnd("getFirstMatchingText");
      return null;
    }
    function stripYouTubeTitleSuffix(title) {
      if (!title) {
        return null;
      }
      const trimmed = title.trim();
      if (!trimmed) {
        return null;
      }
      const stripped = trimmed.replace(/\s+-\s+YouTube$/i, "").trim();
      return stripped || trimmed;
    }
    function buildYouTubeMenuOptions(context, capturedUrl) {
      logFunctionBegin("buildYouTubeMenuOptions");
      if (!context) {
        log("No YouTube context provided");
        logFunctionEnd("buildYouTubeMenuOptions");
        return [];
      }
      const options = [];
      if (context.video) {
        const videoTitle = buildYouTubeVideoTitle(context.video);
        if (videoTitle) {
          log("Adding YouTube video title option");
          options.push({
            label: "Video Title",
            displayValue: videoTitle,
            tooltip: "Title from YouTube video metadata.",
            getResult: () => ({
              title: videoTitle,
              url: capturedUrl
            })
          });
        }
        const timestampOptions = buildYouTubeTimestampMenuOptions(
          context,
          videoTitle,
          context.video.canonicalUrl || capturedUrl
        );
        timestampOptions.forEach((option) => options.push(option));
      }
      if (context.playlist && context.playlist.videos && context.playlist.videos.length > 0) {
        const playlistMarkdown = buildYouTubePlaylistMarkdown(context.playlist);
        if (playlistMarkdown) {
          log("Adding YouTube playlist markdown option");
          options.push({
            label: "Playlist Markdown",
            displayValue: `${context.playlist.videos.length} entries`,
            tooltip: "All playlist entries as a flat markdown bullet list.",
            getValue: () => playlistMarkdown,
            isAllLinks: true
          });
        }
        const playlistTitle = context.playlist.title || context.playlist.url || "YouTube Playlist";
        log("Adding YouTube playlist link option");
        options.push({
          label: "Playlist Link",
          displayValue: playlistTitle,
          tooltip: "Link to the YouTube playlist.",
          getResult: () => ({
            title: context.playlist.title ? `YouTube Playlist: ${context.playlist.title}` : "YouTube Playlist",
            url: context.playlist.url || capturedUrl
          })
        });
      }
      if (context.channel && context.channel.title) {
        log("Adding YouTube channel link option");
        options.push({
          label: "Channel Link",
          displayValue: context.channel.title,
          tooltip: "Link to the YouTube channel page.",
          getResult: () => ({
            title: `YouTube Channel: ${context.channel.title}`,
            url: context.channel.canonicalUrl || capturedUrl
          })
        });
      }
      log(`Built ${options.length} YouTube-specific menu options`);
      logFunctionEnd("buildYouTubeMenuOptions");
      return options;
    }
    function getAmazonToolkit() {
      logFunctionBegin("getAmazonToolkit");
      if (typeof window === "undefined") {
        log("[amazon_toolkit] Window unavailable, cannot access Amazon toolkit");
        logFunctionEnd("getAmazonToolkit");
        return null;
      }
      const toolkit = window.AmazonToolkit || null;
      logFunctionEnd("getAmazonToolkit");
      return toolkit;
    }
    const amazonMetadataCache = /* @__PURE__ */ new Map();
    function normalizeAmazonCacheKey(url) {
      logFunctionBegin("normalizeAmazonCacheKey");
      if (!url) {
        log("Cache key URL missing");
        logFunctionEnd("normalizeAmazonCacheKey");
        return null;
      }
      try {
        const normalized = new URL(url, window.location.href);
        logFunctionEnd("normalizeAmazonCacheKey");
        return normalized.href;
      } catch (error) {
        logWarn(`Failed to normalize Amazon cache key: ${error.message}`);
        logFunctionEnd("normalizeAmazonCacheKey");
        return url;
      }
    }
    function cacheAmazonMetadataKey(key, metadata) {
      logFunctionBegin("cacheAmazonMetadataKey");
      if (!key || !metadata) {
        log("Cache key or metadata missing");
        logFunctionEnd("cacheAmazonMetadataKey");
        return;
      }
      const normalizedKey = normalizeAmazonCacheKey(key);
      if (!normalizedKey) {
        log("Normalized cache key unavailable");
        logFunctionEnd("cacheAmazonMetadataKey");
        return;
      }
      amazonMetadataCache.set(normalizedKey, metadata);
      logFunctionEnd("cacheAmazonMetadataKey");
    }
    function rememberAmazonMetadata(metadata) {
      logFunctionBegin("rememberAmazonMetadata");
      if (!metadata) {
        log("No Amazon metadata to remember");
        logFunctionEnd("rememberAmazonMetadata");
        return;
      }
      const keys = /* @__PURE__ */ new Set();
      const urlInfo = metadata.url || {};
      if (urlInfo.original) {
        keys.add(urlInfo.original);
      }
      if (urlInfo.clean) {
        keys.add(urlInfo.clean);
      }
      if (metadata.href) {
        keys.add(metadata.href);
      }
      keys.forEach((key) => cacheAmazonMetadataKey(key, metadata));
      logFunctionEnd("rememberAmazonMetadata");
    }
    function getCachedAmazonMetadata(url) {
      logFunctionBegin("getCachedAmazonMetadata");
      const normalizedKey = normalizeAmazonCacheKey(url);
      if (!normalizedKey) {
        log("Normalized Amazon cache key missing");
        logFunctionEnd("getCachedAmazonMetadata");
        return null;
      }
      const cached = amazonMetadataCache.get(normalizedKey) || null;
      log(`Amazon metadata cache ${cached ? "hit" : "miss"} for ${normalizedKey}`);
      logFunctionEnd("getCachedAmazonMetadata");
      return cached;
    }
    function getAmazonMetadataForUrl(url, sourceLabel = "parse") {
      logFunctionBegin("getAmazonMetadataForUrl");
      if (!url) {
        log("URL missing for Amazon metadata parse");
        logFunctionEnd("getAmazonMetadataForUrl");
        return null;
      }
      const cached = getCachedAmazonMetadata(url);
      if (cached) {
        logFunctionEnd("getAmazonMetadataForUrl");
        return cached;
      }
      const toolkit = getAmazonToolkit();
      const parseFn = toolkit?.Links?.parseAmazonURL;
      if (typeof parseFn !== "function") {
        log("Amazon toolkit parseAmazonURL unavailable");
        logFunctionEnd("getAmazonMetadataForUrl");
        return null;
      }
      try {
        const parsed = parseFn(url);
        if (parsed) {
          rememberAmazonMetadata(parsed);
          log(`Amazon metadata parsed for ${sourceLabel}`);
          logFunctionEnd("getAmazonMetadataForUrl");
          return parsed;
        }
      } catch (error) {
        logWarn(`Amazon metadata parse failed (${sourceLabel}): ${error.message}`);
      }
      logFunctionEnd("getAmazonMetadataForUrl");
      return null;
    }
    function logAmazonLinkMetadata(metadata, sourceLabel = "unknown") {
      logFunctionBegin("logAmazonLinkMetadata");
      if (!metadata) {
        log("No Amazon metadata to log");
        logFunctionEnd("logAmazonLinkMetadata");
        return;
      }
      const urlInfo = metadata.url || {};
      const redirectChain = urlInfo.redirectChain || metadata.redirectChain || [];
      const infoParts = [
        `source=${sourceLabel}`,
        metadata.type ? `type=${metadata.type}` : null,
        metadata.asin ? `asin=${metadata.asin}` : null,
        metadata.storeId ? `storeId=${metadata.storeId}` : null,
        metadata.sellerId ? `sellerId=${metadata.sellerId}` : null,
        urlInfo.hostname ? `host=${urlInfo.hostname}` : null,
        urlInfo.canonicalPath || urlInfo.pathname ? `path=${urlInfo.canonicalPath || urlInfo.pathname}` : null,
        redirectChain.length ? `redirects=${redirectChain.length}` : null
      ].filter(Boolean);
      log(`Amazon classification: ${infoParts.join(" | ")}`);
      logFunctionEnd("logAmazonLinkMetadata");
    }
    function getAmazonUrlFromAnchor(anchor) {
      logFunctionBegin("getAmazonUrlFromAnchor");
      if (!anchor) {
        log("No anchor provided for Amazon parsing");
        logFunctionEnd("getAmazonUrlFromAnchor");
        return null;
      }
      const toolkit = getAmazonToolkit();
      const linkNamespace = toolkit?.Links;
      if (!linkNamespace || typeof linkNamespace.parseAmazonAnchor !== "function") {
        log("Amazon toolkit parseAmazonAnchor unavailable");
        logFunctionEnd("getAmazonUrlFromAnchor");
        return null;
      }
      try {
        const parsedAnchor = linkNamespace.parseAmazonAnchor(anchor);
        if (parsedAnchor) {
          rememberAmazonMetadata(parsedAnchor);
          logAmazonLinkMetadata(parsedAnchor, "anchor");
        }
        if (parsedAnchor?.url?.clean) {
          log(`Toolkit returned clean Amazon URL: "${parsedAnchor.url.clean}"`);
          logFunctionEnd("getAmazonUrlFromAnchor");
          return parsedAnchor.url.clean;
        }
        if (parsedAnchor?.url?.original) {
          log(`Toolkit returned original Amazon URL: "${parsedAnchor.url.original}"`);
          logFunctionEnd("getAmazonUrlFromAnchor");
          return parsedAnchor.url.original;
        }
        if (parsedAnchor?.href) {
          log(`Toolkit returned href fallback: "${parsedAnchor.href}"`);
          logFunctionEnd("getAmazonUrlFromAnchor");
          return parsedAnchor.href;
        }
        log("Toolkit parseAmazonAnchor returned no usable URL");
      } catch (error) {
        logWarn(`Amazon toolkit anchor parsing failed: ${error.message}`);
      }
      logFunctionEnd("getAmazonUrlFromAnchor");
      return null;
    }
    function getDomainSpecificTitle(url, precomputedContext = null) {
      logFunctionBegin("getDomainSpecificTitle");
      if (!url) {
        log("URL missing for domain-specific title resolution");
        logFunctionEnd("getDomainSpecificTitle");
        return null;
      }
      if (!isYouTubeUrl(url)) {
        log("Domain-specific title not applicable (non-YouTube URL)");
        logFunctionEnd("getDomainSpecificTitle");
        return null;
      }
      const context = precomputedContext || getYouTubeContext(url);
      if (context?.video) {
        const videoTitle = buildYouTubeVideoTitle(context.video);
        log(`Using YouTube video title override: ${videoTitle}`);
        logFunctionEnd("getDomainSpecificTitle");
        return videoTitle;
      }
      if (context?.playlist && context.playlist.title) {
        const playlistTitle = `YouTube Playlist: ${context.playlist.title}`;
        log(`Using YouTube playlist title override: ${playlistTitle}`);
        logFunctionEnd("getDomainSpecificTitle");
        return playlistTitle;
      }
      if (context?.channel && context.channel.title) {
        const channelTitle = `YouTube Channel: ${context.channel.title}`;
        log(`Using YouTube channel title override: ${channelTitle}`);
        logFunctionEnd("getDomainSpecificTitle");
        return channelTitle;
      }
      log("No domain-specific title available for URL");
      logFunctionEnd("getDomainSpecificTitle");
      return null;
    }
    function validateUrl(url, anchor, event, source) {
      logFunctionBegin("validateUrl");
      log(`Validating URL from ${source}`);
      log(`  URL value: ${url || "null"}`);
      log(`  URL type: ${typeof url}`);
      log(`  URL length: ${url ? url.length : 0}`);
      const isValid = url && url !== "null" && url.trim() !== "";
      if (isValid) {
        log(`URL validation passed: "${url}"`);
        logFunctionEnd("validateUrl");
        return true;
      }
      logError(`URL validation FAILED at ${source}`);
      logError(`  URL value: ${url}`);
      logError(`  URL type: ${typeof url}`);
      logError(`  event.target: ${unwrap(event.target, "tagName")}`);
      logError(`  event.target.className: ${unwrap(event.target, "className")}`);
      logError(`  event.type: ${unwrap(event, "type")}`);
      logError(`  anchor: ${anchor ? "exists" : "null"}`);
      logError(`  anchor.tagName: ${unwrap(anchor, "tagName")}`);
      logError(`  anchor.href: ${unwrap(anchor, "href")}`);
      logError(`  anchor.getAttribute('href'): ${anchor ? anchor.getAttribute("href") : "null"}`);
      logError(`  anchor.textContent: ${anchor && anchor.textContent ? anchor.textContent.substring(0, 50) : "null"}`);
      logError(`  window.location.href: ${window.location.href}`);
      const debugMessage = `URL Validation Failed!

Source: ${source}
URL: ${url || "null"}
Type: ${typeof url}

Event Details:
  Type: ${unwrap(event, "type")}
  Target: ${unwrap(event.target, "tagName")}
  Class: ${anchor && anchor.textContent ? anchor.textContent.substring(0, 50) : "null"}

Anchor Details:
  Exists: ${anchor ? "yes" : "no"}
  Tag: ${unwrap(anchor, "tagName")}
  href property: ${unwrap(anchor, "href")}
  href attribute: ${anchor ? anchor.getAttribute("href") : "null"}
  Text: ${anchor && anchor.textContent ? anchor.textContent.substring(0, 50) : "null"}

Open debugger to inspect?`;
      const openDebugger = confirm(debugMessage);
      if (openDebugger) {
        console.log("Debug context:", { url, anchor, event, source });
        debugger;
      }
      logFunctionEnd("validateUrl");
      return false;
    }
    function cleanUrl(url) {
      logFunctionBegin("cleanUrl");
      log(`Original URL: "${url}"`);
      if (!url) {
        log("URL missing, returning original value");
        logFunctionEnd("cleanUrl");
        return url;
      }
      let urlObj;
      try {
        urlObj = new URL(url);
      } catch (error) {
        logError(`Error cleaning URL: ${error.message}`);
        log("Returning original URL");
        logFunctionEnd("cleanUrl");
        return url;
      }
      const hostname = urlObj.hostname || "";
      const isAmazonHost = isAmazonHostname(hostname);
      if (isAmazonHost) {
        const toolkit = getAmazonToolkit();
        const linkNamespace = toolkit?.Links;
        let amazonMetadata = getAmazonMetadataForUrl(url, "cleanUrl-pre");
        let cleanedAmazonUrl = null;
        if (linkNamespace && typeof linkNamespace.cleanAmazonURL === "function") {
          cleanedAmazonUrl = linkNamespace.cleanAmazonURL(url, { preserveVariants: true, preserveSeller: false });
          if (!cleanedAmazonUrl) {
            logWarn("Toolkit cleanAmazonURL returned null");
          }
        } else {
          log("Amazon toolkit cleanAmazonURL unavailable");
        }
        const canonicalAmazonUrl = cleanedAmazonUrl || amazonMetadata?.url?.clean || amazonMetadata?.url?.original;
        if (canonicalAmazonUrl) {
          if (!amazonMetadata) {
            amazonMetadata = getAmazonMetadataForUrl(canonicalAmazonUrl, "cleanUrl-post");
          }
          if (amazonMetadata) {
            logAmazonLinkMetadata(amazonMetadata, "cleanUrl");
          }
          log(`Toolkit cleaned Amazon URL: "${canonicalAmazonUrl}"`);
          logFunctionEnd("cleanUrl");
          return canonicalAmazonUrl;
        }
        logWarn("Amazon toolkit did not provide a canonical URL, returning original value");
        logFunctionEnd("cleanUrl");
        return url;
      }
      log("Removing common tracking parameters");
      const trackingParams = [
        // Google Analytics
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        // Facebook
        "fbclid",
        // Google Ads
        "gclid",
        "gclsrc",
        // Amazon tracking
        "ref",
        "ref_",
        "pf_rd_r",
        "pf_rd_p",
        "pf_rd_m",
        "pf_rd_s",
        "pf_rd_t",
        "pf_rd_i",
        "pd_rd_r",
        "pd_rd_w",
        "pd_rd_wg",
        "qid",
        "sr",
        "keywords",
        "crid",
        "sprefix",
        "th",
        "psc",
        "dib",
        "dib_tag",
        // Marketing campaign
        "mc_cid",
        "mc_eid",
        // General analytics
        "_ga",
        "_gl",
        // Other common tracking
        "msclkid",
        "twclid"
      ];
      trackingParams.forEach((param) => {
        urlObj.searchParams.delete(param);
      });
      const paramsToDelete = [];
      for (const [key] of urlObj.searchParams) {
        if (key.startsWith("utm_") || key.startsWith("ref") || key.startsWith("pf_") || key.startsWith("pd_") || key.startsWith("mc_")) {
          paramsToDelete.push(key);
        }
      }
      paramsToDelete.forEach((param) => urlObj.searchParams.delete(param));
      const cleanedUrl = urlObj.toString();
      log(`Cleaned URL: "${cleanedUrl}"`);
      logFunctionEnd("cleanUrl");
      return cleanedUrl;
    }
    function extractUrlFromAnchor(anchor, event) {
      logFunctionBegin("extractUrlFromAnchor");
      let toolkitAmazonUrl = null;
      if (anchor && anchor.href) {
        try {
          const anchorUrlObj = new URL(anchor.href, window.location.href);
          if (isAmazonHostname(anchorUrlObj.hostname || "")) {
            toolkitAmazonUrl = getAmazonUrlFromAnchor(anchor);
          }
        } catch (error) {
          logWarn(`Failed to parse anchor href for Amazon detection: ${error.message}`);
        }
      }
      if (toolkitAmazonUrl) {
        log("Toolkit provided Amazon URL, skipping legacy extraction strategies");
        logFunctionEnd("extractUrlFromAnchor");
        return toolkitAmazonUrl;
      }
      if (anchor && anchor.href) {
        log(`Strategy 1: Found href via anchor.href: "${anchor.href}"`);
        logFunctionEnd("extractUrlFromAnchor");
        return anchor.href;
      }
      logWarn("Strategy 1 failed: anchor.href is null or empty");
      log(`  anchor exists: ${!!anchor}`);
      log(`  anchor.href: ${unwrap(anchor, "href")}`);
      log(`  anchor.tagName: ${unwrap(anchor, "tagName")}`);
      if (anchor) {
        const rawHref = anchor.getAttribute("href");
        log(`Strategy 2: Attempting manual URL resolution with raw href: "${rawHref}"`);
        if (rawHref) {
          try {
            const absoluteUrl = new URL(rawHref, window.location.origin);
            log(`Strategy 2: Successfully resolved to: "${absoluteUrl.href}"`);
            logFunctionEnd("extractUrlFromAnchor");
            return absoluteUrl.href;
          } catch (error) {
            logError(`Strategy 2 failed: URL construction error: ${error.message}`);
          }
        } else {
          logWarn('Strategy 2 failed: getAttribute("href") returned null');
        }
      }
      log("Strategy 3: Walking up DOM tree to find valid anchor");
      let currentElement = event.target;
      let depth = 0;
      const maxDepth = 10;
      while (currentElement && currentElement !== document.body && depth < maxDepth) {
        log(`  Checking element at depth ${depth}: ${currentElement.tagName}`);
        if (currentElement.tagName === "A" && currentElement.href) {
          log(`Strategy 3: Found anchor with href at depth ${depth}: "${currentElement.href}"`);
          logFunctionEnd("extractUrlFromAnchor");
          return currentElement.href;
        }
        currentElement = currentElement.parentElement;
        depth++;
      }
      logWarn(`Strategy 3 failed: No valid anchor found in ${depth} parent elements`);
      logError("All URL extraction strategies failed");
      logError(`  event.target: ${unwrap(event.target, "tagName")}`);
      logError(`  event.target.className: ${unwrap(event.target, "className")}`);
      logError(`  anchor: ${unwrap(anchor, "tagName")}`);
      logError(`  anchor.href: ${unwrap(anchor, "href")}`);
      logError(`  anchor.getAttribute('href'): ${anchor ? anchor.getAttribute("href") : "null"}`);
      if (isDebug) {
        const debugMessage = `URL extraction failed!

Target element: ${unwrap(event.target, "tagName")}
Anchor found: ${anchor ? "yes" : "no"}
Anchor href: ${unwrap(anchor, "href")}
Raw href attribute: ${anchor ? anchor.getAttribute("href") : "null"}

Open debugger to inspect?`;
        const openDebugger = confirm(debugMessage);
        if (openDebugger) {
          debugger;
        }
      }
      logFunctionEnd("extractUrlFromAnchor");
      return null;
    }
    function getSelectedText() {
      logFunctionBegin("getSelectedText");
      log("Will get selection from window");
      const liveSelection = window.getSelection ? window.getSelection() : null;
      const liveText = liveSelection ? liveSelection.toString().trim() : "";
      if (liveText) {
        lastNonEmptySelection = liveText;
        lastSelectionTimestamp = Date.now();
        log(`Did get live selection: "${liveText}"`);
        logFunctionEnd("getSelectedText");
        return liveText;
      }
      const selectionAge = Date.now() - lastSelectionTimestamp;
      if (lastNonEmptySelection && selectionAge <= SELECTION_MEMORY_MS) {
        log(`Did get cached selection (${selectionAge}ms old): "${lastNonEmptySelection}"`);
        logFunctionEnd("getSelectedText");
        return lastNonEmptySelection;
      }
      log("No selection available");
      logFunctionEnd("getSelectedText");
      return null;
    }
    function clearSelectionCache(reason = "unspecified") {
      logFunctionBegin("clearSelectionCache");
      log(`Clearing selection cache (reason: ${reason})`);
      lastNonEmptySelection = null;
      lastSelectionTimestamp = 0;
      logFunctionEnd("clearSelectionCache");
    }
    function handleSelectionAutoCopy(selectedText, resolvedUrl) {
      logFunctionBegin("handleSelectionAutoCopy");
      if (!selectedText || !resolvedUrl) {
        log("Selection text or URL missing, cannot auto-copy");
        logFunctionEnd("handleSelectionAutoCopy");
        return false;
      }
      const sanitizedUrl = cleanUrl(resolvedUrl) || resolvedUrl;
      if (sanitizedUrl !== resolvedUrl) {
        log(`Sanitized selection auto-copy URL: "${sanitizedUrl}"`);
      }
      const markdown = createMarkdown(selectedText, sanitizedUrl);
      if (!markdown) {
        logError("Failed to build markdown for selection auto-copy");
        logFunctionEnd("handleSelectionAutoCopy");
        return false;
      }
      copyToClipboard(markdown, selectedText, sanitizedUrl, {
        originalUrl: typeof window !== "undefined" && window.location && window.location.href || sanitizedUrl,
        format: "selection"
      });
      showNotification("Selection copied to clipboard");
      clearSelectionCache("selection auto copied");
      logFunctionEnd("handleSelectionAutoCopy");
      return true;
    }
    function maybeAutoCopySelection(skipAutoCopy, resolvedUrl) {
      logFunctionBegin("maybeAutoCopySelection");
      if (skipAutoCopy) {
        log("Auto-copy skipped by caller");
        logFunctionEnd("maybeAutoCopySelection");
        return false;
      }
      const selectionText = getSelectedText();
      if (!selectionText) {
        log("No selection text available for auto-copy");
        logFunctionEnd("maybeAutoCopySelection");
        return false;
      }
      const result = handleSelectionAutoCopy(selectionText, resolvedUrl);
      logFunctionEnd("maybeAutoCopySelection");
      return result;
    }
    function getPageTitle() {
      logFunctionBegin("getPageTitle");
      log("Will get document.title");
      let title = document.title.trim() || null;
      if (title) {
        const normalizedTitle = normalizeTitleForUrl(title, window.location.href);
        if (normalizedTitle && normalizedTitle !== title) {
          log(`Normalized page title for current URL: "${normalizedTitle}"`);
        }
        title = normalizedTitle || title;
      }
      log(`Did get page title: ${title ? `"${title}"` : "null"}`);
      logFunctionEnd("getPageTitle");
      return title;
    }
    function getMetaDescription() {
      logFunctionBegin("getMetaDescription");
      log('Will query meta[name="description"]');
      const meta = document.querySelector('meta[name="description"]');
      let description = meta ? meta.content.trim() : null;
      if (description) {
        const normalizedDescription = normalizeTitleForUrl(description, window.location.href);
        if (normalizedDescription && normalizedDescription !== description) {
          log(`Normalized meta description for current URL: "${normalizedDescription}"`);
        }
        description = normalizedDescription || description;
      }
      log(`Did get meta description: ${description ? `"${description}"` : "null"}`);
      logFunctionEnd("getMetaDescription");
      return description;
    }
    function isAmazonHostname(hostname) {
      logFunctionBegin("isAmazonHostname");
      if (!hostname) {
        log("Hostname missing for Amazon detection");
        logFunctionEnd("isAmazonHostname");
        return false;
      }
      const result = hostname.toLowerCase().includes("amazon.");
      logFunctionEnd("isAmazonHostname");
      return result;
    }
    function isAmazonProductUrl(url) {
      logFunctionBegin("isAmazonProductUrl");
      if (!url) {
        log("URL missing for Amazon detection");
        logFunctionEnd("isAmazonProductUrl");
        return false;
      }
      try {
        const parsedUrl = new URL(url, window.location.href);
        const hostname = parsedUrl.hostname || "";
        if (!isAmazonHostname(hostname)) {
          log("Hostname not Amazon, skipping detection");
          logFunctionEnd("isAmazonProductUrl");
          return false;
        }
        const path = parsedUrl.pathname || "";
        const isProduct = /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/.test(path) || /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/.test(path);
        log(`Amazon product route detected: ${isProduct}`);
        logFunctionEnd("isAmazonProductUrl");
        return isProduct;
      } catch (error) {
        logWarn(`Failed to parse URL for Amazon detection: ${error.message}`);
        logFunctionEnd("isAmazonProductUrl");
        return false;
      }
    }
    function normalizeTitleForUrl(title, url) {
      logFunctionBegin("normalizeTitleForUrl");
      if (!title || !url) {
        log("Title or URL missing, skipping normalization");
        logFunctionEnd("normalizeTitleForUrl");
        return title;
      }
      let parsedUrl;
      try {
        parsedUrl = new URL(url, window.location.href);
      } catch (error) {
        logWarn(`Failed to parse URL for normalization: ${error.message}`);
        logFunctionEnd("normalizeTitleForUrl");
        return title;
      }
      if (isAmazonHostname(parsedUrl.hostname || "")) {
        const toolkit = getAmazonToolkit();
        const linkNamespace = toolkit?.Links;
        const markdownNamespace = toolkit?.Markdown;
        let cleanedTitle = title.trim();
        if (linkNamespace && typeof linkNamespace.cleanProductTitle === "function") {
          cleanedTitle = linkNamespace.cleanProductTitle(cleanedTitle);
        } else {
          cleanedTitle = cleanedTitle.replace(/^Amazon\.com:\s*/i, "").trim();
        }
        if (markdownNamespace && typeof markdownNamespace.formatTitle === "function") {
          cleanedTitle = markdownNamespace.formatTitle(cleanedTitle, {
            escape: false,
            removePrefix: true,
            removeSuffix: true
          });
        }
        cleanedTitle = cleanedTitle.replace(/\s+/g, " ").trim();
        if (cleanedTitle) {
          if (cleanedTitle !== title) {
            log(`Normalized Amazon title: "${cleanedTitle}"`);
          }
          logFunctionEnd("normalizeTitleForUrl");
          return cleanedTitle;
        }
      }
      logFunctionEnd("normalizeTitleForUrl");
      return title;
    }
    function formatPathSegment(segment) {
      logFunctionBegin("formatPathSegment");
      if (!segment) {
        log("Segment empty, returning empty string");
        logFunctionEnd("formatPathSegment");
        return "";
      }
      const uppercaseCandidate = segment.toUpperCase();
      if (/^[A-Z0-9]{10}$/.test(uppercaseCandidate)) {
        log(`Segment appears to be ASIN, preserving formatting: "${uppercaseCandidate}"`);
        logFunctionEnd("formatPathSegment");
        return uppercaseCandidate;
      }
      const noExtension = segment.replace(/\.[a-z0-9]+$/i, "");
      const withDelimiters = noExtension.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").trim();
      if (!withDelimiters) {
        log("Segment collapsed after cleanup");
        logFunctionEnd("formatPathSegment");
        return "";
      }
      const words = withDelimiters.split(/\s+/).map((word) => {
        const lower = word.toLowerCase();
        if (lower === "api") {
          return "API";
        }
        if (lower === "cli") {
          return "CLI";
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });
      const result = words.join(" ");
      log(`Formatted segment: "${result}"`);
      logFunctionEnd("formatPathSegment");
      return result;
    }
    function getDomainTitleFromHostname(hostname) {
      logFunctionBegin("getDomainTitleFromHostname");
      if (!hostname) {
        log("Hostname missing");
        logFunctionEnd("getDomainTitleFromHostname");
        return null;
      }
      const cleanHost = hostname.replace(/^www\./i, "");
      const parts = cleanHost.split(".").filter(Boolean);
      if (parts.length === 0) {
        log("Hostname parts empty");
        logFunctionEnd("getDomainTitleFromHostname");
        return null;
      }
      parts.pop();
      if (parts.length === 0) {
        const fallback = formatPathSegment(cleanHost);
        log(`Only TLD present, fallback: "${fallback}"`);
        logFunctionEnd("getDomainTitleFromHostname");
        return fallback || cleanHost;
      }
      const brandKey = parts.pop();
      const brandTitle = DOMAIN_TITLE_OVERRIDES[brandKey.toLowerCase()] || formatPathSegment(brandKey);
      if (parts.length === 0) {
        log(`No subdomains, returning brand: "${brandTitle}"`);
        logFunctionEnd("getDomainTitleFromHostname");
        return brandTitle;
      }
      const subdomains = parts.reverse().map(formatPathSegment).filter(Boolean);
      if (subdomains.length === 0) {
        log("Subdomains collapsed, returning brand only");
        logFunctionEnd("getDomainTitleFromHostname");
        return brandTitle;
      }
      const delimiter = subdomains.length === 1 ? " " : ": ";
      const descriptor = subdomains.join(" ");
      const domainTitle = `${brandTitle}${delimiter}${descriptor}`;
      log(`Generated domain title: "${domainTitle}"`);
      logFunctionEnd("getDomainTitleFromHostname");
      return domainTitle;
    }
    function getUrlComponentTitle(url, options = {}) {
      logFunctionBegin("getUrlComponentTitle");
      if (!url) {
        log("URL missing, cannot build component title");
        logFunctionEnd("getUrlComponentTitle");
        return null;
      }
      try {
        const direction = options.direction === "reverse" ? "reverse" : "forward";
        const urlObj = new URL(url);
        const hostname = urlObj.hostname || "";
        const isAmazonHost = isAmazonHostname(hostname);
        const domainTitle = getDomainTitleFromHostname(hostname) || hostname;
        const pathSegments = urlObj.pathname.split("/").filter(Boolean);
        const meaningfulSegments = pathSegments.filter((segment) => segment && segment !== "." && segment !== "..").map(formatPathSegment).filter(Boolean);
        let orderedSegments;
        if (direction === "reverse") {
          orderedSegments = meaningfulSegments.slice(-2).reverse();
        } else {
          orderedSegments = meaningfulSegments.slice(0, 2);
        }
        if (isAmazonHost) {
          const amazonSegments = orderedSegments.filter(Boolean);
          let amazonTitle;
          if (amazonSegments.length >= 2) {
            amazonTitle = `${amazonSegments[0]} - ${amazonSegments[1]}`;
          } else if (amazonSegments.length === 1) {
            amazonTitle = amazonSegments[0];
          } else {
            const asinMatch = urlObj.pathname.match(/([A-Z0-9]{10})/);
            amazonTitle = asinMatch ? asinMatch[1].toUpperCase() : "Product Page";
          }
          log(`Generated Amazon URL component title: "${amazonTitle}"`);
          logFunctionEnd("getUrlComponentTitle");
          return amazonTitle;
        }
        let finalTitle = domainTitle;
        if (orderedSegments.length === 1) {
          finalTitle = `${domainTitle}: ${orderedSegments[0]}`;
        } else if (orderedSegments.length >= 2) {
          finalTitle = `${domainTitle}: ${orderedSegments[0]} - ${orderedSegments[1]}`;
        }
        log(`Generated URL component title: "${finalTitle}"`);
        logFunctionEnd("getUrlComponentTitle");
        return finalTitle;
      } catch (error) {
        logWarn(`Failed to build URL component title: ${error.message}`);
        logFunctionEnd("getUrlComponentTitle");
        return null;
      }
    }
    function getLinkText(anchor) {
      logFunctionBegin("getLinkText");
      log("Will get anchor textContent");
      let text = anchor.textContent || anchor.title || "";
      text = text.replace(/\s+/g, " ").trim();
      const result = text || null;
      log(`Did get link text: ${result ? `"${result}"` : "null"}`);
      logFunctionEnd("getLinkText");
      return result;
    }
    function promptCustomTitle() {
      logFunctionBegin("promptCustomTitle");
      log("Will prompt user for custom title");
      const title = prompt("Enter custom title for markdown link:");
      const result = title ? title.trim() : null;
      log(`Did get custom title: ${result ? `"${result}"` : "null (cancelled)"}`);
      logFunctionEnd("promptCustomTitle");
      return result;
    }
    function getAltZSourceOrder() {
      const remaining = ALT_Z_TITLE_OPTIONS.map((option) => option.id).filter((id) => id !== altZTitlePreference);
      return [altZTitlePreference].concat(remaining);
    }
    function getTitleFromSource(sourceId, anchor, url) {
      switch (sourceId) {
        case "anchor":
          return anchor ? getLinkText(anchor) : null;
        case "page":
          return getPageTitle();
        case "url-forward":
          return url ? getUrlComponentTitle(url) : null;
        case "url-reverse":
          return url ? getUrlComponentTitle(url, { direction: "reverse" }) : null;
        default:
          logWarn(`Unknown Alt+Z source requested: ${sourceId}`);
          return null;
      }
    }
    function getAutoInferredTitle(anchor, url) {
      logFunctionBegin("getAutoInferredTitle");
      const selectedText = getSelectedText();
      if (selectedText) {
        log("Selection available, will prioritize it over preference order");
        clearSelectionCache("auto-infer prioritized selection");
        logFunctionEnd("getAutoInferredTitle");
        return selectedText;
      }
      if (url) {
        log("Will evaluate domain-specific title overrides");
        const domainTitle = getDomainSpecificTitle(url);
        if (domainTitle) {
          log(`Domain-specific title selected: "${domainTitle}"`);
          logFunctionEnd("getAutoInferredTitle");
          return domainTitle;
        }
        log("No domain-specific title override available");
      } else {
        log("URL missing, skipping domain-specific title evaluation");
      }
      const sourceOrder = getAltZSourceOrder();
      log(`Will attempt to auto-infer title in order: ${sourceOrder.join(" > ")}`);
      for (let i = 0; i < sourceOrder.length; i += 1) {
        const sourceId = sourceOrder[i];
        const title = getTitleFromSource(sourceId, anchor, url);
        if (title) {
          const normalizedTitle = normalizeTitleForUrl(title, url) || title;
          log(`Selected "${normalizedTitle}" from source ${sourceId} (priority ${i + 1})`);
          logFunctionEnd("getAutoInferredTitle");
          return normalizedTitle;
        }
        log(`Source ${sourceId} produced no title`);
      }
      log("No auto-infer sources produced a title");
      logFunctionEnd("getAutoInferredTitle");
      return null;
    }
    function autoInferAndCopyMarkdown(url, anchor) {
      logFunctionBegin("autoInferAndCopyMarkdown");
      log(`Will auto-infer and copy markdown for URL: "${url}"`);
      const resolvedUrl = cleanUrl(url) || url;
      if (resolvedUrl !== url) {
        log(`Sanitized auto-infer URL: "${resolvedUrl}"`);
      }
      const titleSourceUrl = url || resolvedUrl;
      log("Will get auto-inferred title");
      const title = getAutoInferredTitle(anchor, titleSourceUrl);
      if (!title) {
        log("Auto-infer failed - no title source available");
        logError("Could not auto-infer title from selected text, anchor text, or page title");
        showNotification("Could not infer title - no text selected and no anchor found");
        logFunctionEnd("autoInferAndCopyMarkdown");
        return;
      }
      log(`Did get title: "${title}"`);
      log("Will create markdown");
      const markdown = createMarkdown(title, resolvedUrl);
      log(`Did create markdown: "${markdown}"`);
      log("Will copy to clipboard");
      try {
        GM_setClipboard(markdown, "text/plain");
        log("Did copy to clipboard");
        const preview = markdown.length > 60 ? markdown.substring(0, 57) + "..." : markdown;
        showNotification(`Copied: ${preview}`);
        log(`Did show notification with preview: "${preview}"`);
      } catch (error) {
        logError(`Failed to copy to clipboard: ${error}`);
        showNotification("Failed to copy to clipboard - check console for errors");
      }
      logFunctionEnd("autoInferAndCopyMarkdown");
    }
    function compileAndCopyBufferedLinks(buffer) {
      logFunctionBegin("compileAndCopyBufferedLinks");
      log(`Will compile ${buffer.length} buffered links into markdown list`);
      if (buffer.length === 0) {
        log("Buffer is empty, nothing to compile");
        logFunctionEnd("compileAndCopyBufferedLinks");
        return;
      }
      const formatBufferItem = (item, asList = true) => {
        const resolvedUrl = cleanUrl(item.url) || item.url;
        if (resolvedUrl !== item.url) {
          log(`Sanitized buffered URL: "${resolvedUrl}"`);
        }
        if (shouldEmitAmazonProductBlock(resolvedUrl, !item.anchor)) {
          const amazonData = getAmazonProductData(resolvedUrl);
          const amazonBlock = amazonData ? buildAmazonProductMarkdown(amazonData, resolvedUrl) : null;
          if (amazonBlock) {
            log("Buffered item is an Amazon product on the current page; using details block");
            return amazonBlock;
          }
        }
        const titleSourceUrl = item.url || resolvedUrl;
        const title = getAutoInferredTitle(item.anchor, titleSourceUrl);
        if (!title) {
          try {
            const url = new URL(resolvedUrl);
            const fallbackTitle = url.hostname || "Link";
            return asList ? `* [${fallbackTitle}](${url.href})` : `[${fallbackTitle}](${url.href})`;
          } catch (e) {
            return asList ? `* [Link](${resolvedUrl})` : `[Link](${resolvedUrl})`;
          }
        }
        return asList ? `* [${title}](${resolvedUrl})` : `[${title}](${resolvedUrl})`;
      };
      if (buffer.length === 1) {
        log("Buffer contains single link, skipping list formatting");
        const fullMarkdown = formatBufferItem(buffer[0], false);
        log(`Did compile single link markdown (${fullMarkdown.length} characters):`);
        log(fullMarkdown);
        try {
          GM_setClipboard(fullMarkdown, "text/plain");
          log("Did copy to clipboard");
          showNotification(`Copied link to clipboard`);
          log(`Did show notification for 1 link`);
          const captureItem = buffer[0];
          const captureResolvedUrl = cleanUrl(captureItem.url) || captureItem.url;
          maybeCaptureSources({
            originalUrl: captureItem.anchor && captureItem.anchor.href ? captureItem.anchor.href : captureItem.url,
            format: shouldEmitAmazonProductBlock(captureResolvedUrl, !captureItem.anchor) ? "amazon product" : getAltZOption(altZTitlePreference).label.toLowerCase(),
            output: fullMarkdown
          });
        } catch (error) {
          logError(`Failed to copy to clipboard: ${error}`);
          showNotification(`Failed to copy link - check console for errors`);
        }
      } else {
        log("Will infer titles and build markdown list");
        const markdownLines = buffer.map((item, index) => {
          log(`Processing buffered link ${index + 1}/${buffer.length}: ${item.url}`);
          return formatBufferItem(item, true);
        });
        const fullMarkdown = markdownLines.join("\n");
        log(`Did compile full markdown list (${fullMarkdown.length} characters):`);
        log(fullMarkdown);
        log("Will copy markdown list to clipboard");
        try {
          GM_setClipboard(fullMarkdown, "text/plain");
          log("Did copy to clipboard");
          showNotification(`Copied ${buffer.length} links to clipboard`);
          log(`Did show notification for ${buffer.length} links`);
          maybeCaptureSources({
            originalUrl: typeof window !== "undefined" && window.location && window.location.href || "",
            format: `${getAltZOption(altZTitlePreference).label.toLowerCase()} (x${buffer.length})`,
            output: fullMarkdown
          });
        } catch (error) {
          logError(`Failed to copy to clipboard: ${error}`);
          showNotification(`Failed to copy ${buffer.length} links - check console for errors`);
        }
      }
      logFunctionEnd("compileAndCopyBufferedLinks");
    }
    function createMarkdown(title, url) {
      logFunctionBegin("createMarkdown");
      log(`Will create markdown with title: "${title}", url: "${url}"`);
      const normalizedTitle = normalizeTitleForUrl(title, url);
      const finalTitle = normalizedTitle || title;
      const markdown = `[${finalTitle}](${url})`;
      log(`Did create markdown: "${markdown}"`);
      logFunctionEnd("createMarkdown");
      return markdown;
    }
    function copyToClipboard(markdown, title, url, captureContext) {
      logFunctionBegin("copyToClipboard");
      log(`Will copy to clipboard: "${markdown}"`);
      try {
        GM_setClipboard(markdown, "text/plain");
        log("Did copy to clipboard successfully");
        log(`  Title: ${title}`);
        log(`  URL: ${url}`);
        log(`  Markdown: ${markdown}`);
        log("Will show notification");
        showNotification("Markdown link copied to clipboard!");
        log("Did show notification");
        const captureCtx = captureContext || {};
        maybeCaptureSources({
          originalUrl: captureCtx.originalUrl || url,
          format: captureCtx.format || "link",
          output: markdown
        });
      } catch (error) {
        log(`ERROR: Failed to copy to clipboard: ${error}`);
        console.error(`${logBase}: Failed to copy to clipboard:`, error);
        alert("Failed to copy to clipboard. Check console for details.");
      }
      logFunctionEnd("copyToClipboard");
    }
    function extractAllLinksFlat() {
      logFunctionBegin("extractAllLinksFlat");
      log("Will extract all anchor elements from page");
      const anchors = document.querySelectorAll("a[href]");
      log(`Found ${anchors.length} anchor elements`);
      const markdownLinks = [];
      anchors.forEach((anchor, index) => {
        const href = anchor.href;
        if (!href || href === "#" || href.startsWith("javascript:")) {
          log(`Skipping anchor ${index}: invalid href`);
          return;
        }
        const cleanedUrl = cleanUrl(href);
        const text = getLinkText(anchor) || cleanedUrl;
        const markdown = createMarkdown(text, cleanedUrl);
        markdownLinks.push(markdown);
        log(`Added link ${index}: ${markdown}`);
      });
      const result = markdownLinks.join("\n");
      log(`Generated ${markdownLinks.length} markdown links`);
      logFunctionEnd("extractAllLinksFlat");
      return result;
    }
    function extractAllLinksHierarchical() {
      logFunctionBegin("extractAllLinksHierarchical");
      log("Will extract all anchor elements from page with hierarchy");
      const anchors = document.querySelectorAll("a[href]");
      log(`Found ${anchors.length} anchor elements`);
      const markdownLinks = [];
      anchors.forEach((anchor, index) => {
        const href = anchor.href;
        if (!href || href === "#" || href.startsWith("javascript:")) {
          log(`Skipping anchor ${index}: invalid href`);
          return;
        }
        let depth = 0;
        let element = anchor.parentElement;
        while (element && element !== document.body) {
          depth++;
          element = element.parentElement;
        }
        const indent = "  ".repeat(Math.min(depth, 10));
        const cleanedUrl = cleanUrl(href);
        const text = getLinkText(anchor) || cleanedUrl;
        const markdown = `${indent}- ${createMarkdown(text, cleanedUrl)}`;
        markdownLinks.push(markdown);
        log(`Added link ${index} at depth ${depth}: ${markdown}`);
      });
      const result = markdownLinks.join("\n");
      log(`Generated ${markdownLinks.length} hierarchical markdown links`);
      logFunctionEnd("extractAllLinksHierarchical");
      return result;
    }
    function showNotification(message) {
      logFunctionBegin("showNotification");
      log(`Will create notification with message: "${message}"`);
      const notification = document.createElement("div");
      notification.textContent = message;
      notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 999999;
            font-family: sans-serif;
            font-size: 14px;
            white-space: pre-line;
            animation: mdLinkerFadeIn 0.3s, mdLinkerFadeOut 0.3s 2.7s;
        `;
      log("Will append notification to body");
      document.body.appendChild(notification);
      activeNotification = notification;
      log("Did append notification to body");
      log("Will schedule notification removal in 3000ms");
      setTimeout(() => {
        log("Will remove notification");
        notification.remove();
        if (activeNotification === notification) {
          activeNotification = null;
        }
        log("Did remove notification");
      }, 3e3);
      logFunctionEnd("showNotification");
    }
    function appendNotificationLine(text) {
      try {
        if (activeNotification && activeNotification.isConnected) {
          activeNotification.textContent = `${activeNotification.textContent}
${text}`;
        } else {
          showNotification(text);
        }
      } catch (error) {
      }
    }
    function buildCaptureSlug(url) {
      try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/[^A-Za-z0-9.-]/g, "_");
        const path = parsed.pathname.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "index";
        return `${host}_${path}`.slice(0, 120);
      } catch (error) {
        return "page";
      }
    }
    function captureTimestamp() {
      const now = /* @__PURE__ */ new Date();
      const pad = (value) => String(value).padStart(2, "0");
      return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    }
    function maybeCaptureSources(context) {
      if (captureMode !== "html_logs") {
        return;
      }
      logFunctionBegin("maybeCaptureSources");
      const sourceCapture = typeof window !== "undefined" && window.SourceCapture ? window.SourceCapture : null;
      if (!sourceCapture || typeof sourceCapture.capture !== "function") {
        log("SourceCapture unavailable, skipping capture");
        logFunctionEnd("maybeCaptureSources");
        return;
      }
      const ctx = context || {};
      const pageUrl = typeof window !== "undefined" && window.location && window.location.href || "";
      const originalUrl = ctx.originalUrl || pageUrl;
      const format = ctx.format || "";
      const output = ctx.output || "";
      let asin = null;
      const toolkit = getAmazonToolkit();
      if (toolkit && toolkit.Extractors && typeof toolkit.Extractors.extractProductASIN === "function") {
        try {
          asin = toolkit.Extractors.extractProductASIN(document, pageUrl);
        } catch (error) {
        }
      }
      let pageType;
      let baseName;
      if (asin) {
        pageType = "products";
        baseName = asin;
      } else {
        pageType = "other";
        baseName = buildCaptureSlug(pageUrl);
      }
      const timestamp = captureTimestamp();
      const htmlPath = `sources/${pageType}/${baseName}_${timestamp}.html`;
      const logsPath = `logs/${baseName}_${timestamp}.log`;
      const commentBody = `* original_url: ${originalUrl}
* format: ${format}

${output}`.replace(/-->/g, "-- >");
      const html = `<!--
${commentBody}
-->
<!DOCTYPE html>
${document.documentElement.outerHTML}`;
      const logs = sourceCapture.logBuffer ? sourceCapture.logBuffer.getText() : "";
      log(`Will capture page source + logs -> ${htmlPath}, ${logsPath}`);
      sourceCapture.capture({
        userscript: "markdown_linker",
        files: [
          { path: htmlPath, content: html },
          { path: logsPath, content: logs }
        ],
        onResult: (result) => {
          if (result && result.ok) {
            log(`Capture saved: ${htmlPath} + ${logsPath}`);
            appendNotificationLine("Saved page source + logs to disk");
          } else {
            const firstError = result && result.results && result.results[0] && result.results[0].error ? result.results[0].error : "unknown";
            log(`Capture not saved (server unavailable?): ${firstError}`);
          }
        }
      });
      logFunctionEnd("maybeCaptureSources");
    }
    log("Will add CSS keyframe animations");
    const style = document.createElement("style");
    style.textContent = `
        @keyframes mdLinkerFadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mdLinkerFadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes mdLinkerClickPulse {
            0% { 
                transform: scale(1);
                opacity: 1;
                box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
            }
            50% {
                box-shadow: 0 0 0 12px rgba(76, 175, 80, 0.3);
            }
            100% { 
                transform: scale(1.4);
                opacity: 0;
                box-shadow: 0 0 0 20px rgba(76, 175, 80, 0);
            }
        }
    `;
    document.head.appendChild(style);
    log("Did add CSS keyframe animations");
    function showClickFeedback(x, y) {
      logFunctionBegin("showClickFeedback");
      log(`Will create click feedback animation at position (${x}, ${y})`);
      const feedback = document.createElement("div");
      feedback.style.cssText = `
            position: fixed;
            left: ${x - 12}px;
            top: ${y - 12}px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(76, 175, 80, 0.2);
            border: 2px solid #4CAF50;
            z-index: 999998;
            pointer-events: none;
            animation: mdLinkerClickPulse 0.6s ease-out forwards;
        `;
      log("Will append click feedback to body");
      document.body.appendChild(feedback);
      log("Did append click feedback to body");
      log("Will schedule click feedback removal after animation completes");
      setTimeout(() => {
        log("Will remove click feedback element");
        feedback.remove();
        log("Did remove click feedback element");
      }, 600);
      logFunctionEnd("showClickFeedback");
    }
    function isAmazonProductUrl(url) {
      if (!url) return false;
      const toolkit = getAmazonToolkit();
      const fn = toolkit && toolkit.Helpers ? toolkit.Helpers.isAmazonProductURL : null;
      if (typeof fn === "function") {
        try {
          return !!fn(url);
        } catch (error) {
        }
      }
      return /amazon\.[a-z.]+\/(?:[^/]+\/)?(?:dp|gp\/product)\/[A-Z0-9]{10}/i.test(url);
    }
    function amazonAsinMatchesCurrentPage(url) {
      const toolkit = getAmazonToolkit();
      const extractors = toolkit && toolkit.Extractors;
      if (!extractors || typeof extractors.extractProductASIN !== "function") {
        return false;
      }
      const pageUrl = typeof window !== "undefined" && window.location && window.location.href || "";
      let targetAsin = null;
      let pageAsin = null;
      try {
        targetAsin = extractors.extractProductASIN(document, url);
      } catch (error) {
      }
      try {
        pageAsin = extractors.extractProductASIN(document, pageUrl);
      } catch (error) {
      }
      return !!targetAsin && targetAsin === pageAsin;
    }
    function shouldEmitAmazonProductBlock(url, isPageAction) {
      if (!url || !isAmazonProductUrl(url)) {
        return false;
      }
      if (isPageAction) {
        return true;
      }
      return amazonAsinMatchesCurrentPage(url);
    }
    let amazonProductCacheKey = null;
    let amazonProductCacheValue = null;
    function getAmazonProductData(url) {
      logFunctionBegin("getAmazonProductData");
      if (!url) {
        logFunctionEnd("getAmazonProductData");
        return null;
      }
      if (amazonProductCacheKey === url && amazonProductCacheValue) {
        log("Using cached Amazon product data");
        logFunctionEnd("getAmazonProductData");
        return amazonProductCacheValue;
      }
      const toolkit = getAmazonToolkit();
      const extractFn = toolkit && toolkit.Extractors ? toolkit.Extractors.extractProductData : null;
      if (typeof extractFn !== "function") {
        log("Amazon toolkit extractProductData unavailable, skipping product details");
        logFunctionEnd("getAmazonProductData");
        return null;
      }
      let data = null;
      try {
        data = extractFn(document, url);
      } catch (error) {
        logError(`Amazon product extraction failed: ${error}`);
      }
      if (data) {
        amazonProductCacheKey = url;
        amazonProductCacheValue = data;
        log("Extracted Amazon product data");
      } else {
        log("Amazon product extraction returned no data");
      }
      logFunctionEnd("getAmazonProductData");
      return data;
    }
    function buildAmazonProductMarkdown(productData, cleanedUrl) {
      logFunctionBegin("buildAmazonProductMarkdown");
      if (!productData) {
        logFunctionEnd("buildAmazonProductMarkdown");
        return null;
      }
      const title = productData.titleCleaned || productData.title || "Amazon Product";
      const url = cleanedUrl || productData.url && (productData.url.originalClean || productData.url.original) || "";
      const lines = [`* [${title}](${url})`];
      if (productData.price && productData.price.current) {
        lines.push(`  * price: ${productData.price.current}`);
      }
      if (productData.delivery && Number.isFinite(productData.delivery.inDays)) {
        lines.push(`  * delivers: ${productData.delivery.inDays}d`);
      }
      if (productData.rating && productData.rating.value != null) {
        const count = productData.rating.count != null ? ` / ${productData.rating.count}` : "";
        lines.push(`  * rating: ${productData.rating.value}${count}`);
      }
      if (Array.isArray(productData.variants)) {
        const dimensionPriority = { color: 0, size: 1 };
        const orderedVariants = productData.variants.map((entry, index) => ({ entry, index })).sort((a, b) => {
          const pa = dimensionPriority[a.entry.dimension];
          const pb = dimensionPriority[b.entry.dimension];
          const ra = pa === void 0 ? 100 + a.index : pa;
          const rb = pb === void 0 ? 100 + b.index : pb;
          return ra - rb;
        }).map((wrapped) => wrapped.entry);
        orderedVariants.forEach((entry) => {
          if (entry && entry.dimension && entry.value) {
            lines.push(`  * ${entry.dimension}: ${entry.value}`);
          }
        });
      }
      if (productData.store && productData.store.url) {
        const isSearch = productData.store.kind === "search";
        const label = isSearch ? "search" : "store";
        const storeName = productData.store.name || (isSearch ? "Brand" : "Store");
        lines.push(`  * ${label}: [${storeName}](${productData.store.url})`);
      }
      const markdown = lines.join("\n");
      log(`Built Amazon product markdown (${lines.length} lines)`);
      logFunctionEnd("buildAmazonProductMarkdown");
      return markdown;
    }
    function buildSettingsMenuOptions() {
      return [
        {
          label: "Open settings\u2026",
          displayValue: "Triggers and preferences",
          tooltip: "Opens the Markdown Linker settings panel where you can configure key bindings and preferences.",
          action: () => {
            openTriggerSettings();
            removeMenu();
          }
        },
        {
          label: "Quick-copy title",
          displayValue: getAltZOption(altZTitlePreference).label,
          tooltip: "Title format used for quiet copy and buffer copy. Click to cycle.",
          action: () => {
            cycleAltZTitlePreference();
          }
        },
        {
          label: "Capture",
          displayValue: getCaptureOption(captureMode).label,
          tooltip: "Toggle source+log capture to the local capture server.",
          action: () => {
            cycleCaptureMode();
          }
        },
        {
          label: "Debug mode",
          displayValue: isDebug ? "on" : "off",
          tooltip: "Enable console logging and reveal the Developer section in the popup.",
          action: () => {
            toggleIsDebug();
          }
        }
      ];
    }
    function createMenu(x, y, isAnchor, anchor = null, isContextMenu = false) {
      logFunctionBegin("createMenu");
      log(`Will create menu at position (${x}, ${y}), isAnchor: ${isAnchor}`);
      const capturedUrl = cleanUrl(targetUrl) || targetUrl;
      log(`Captured URL for menu (cleaned): "${capturedUrl}"`);
      let youtubeContext = null;
      if (capturedUrl) {
        log("Will evaluate YouTube context for captured URL");
        try {
          youtubeContext = getYouTubeContext(capturedUrl);
        } catch (error) {
          logError(`YouTube context evaluation failed (non-fatal): ${error}`);
          youtubeContext = null;
        }
        if (youtubeContext) {
          log("YouTube context detected for menu");
        } else {
          log("No YouTube context available for this URL");
        }
      } else {
        log("No URL captured for menu, skipping YouTube context evaluation");
      }
      log("Will remove any existing menu");
      removeMenu();
      log("Did remove any existing menu");
      log("Will create menu element");
      const menu = document.createElement("div");
      menu.id = "markdown-linker-menu";
      menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: rgba(28, 28, 30, 0.94);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
            padding: 4px 0;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 13px;
            min-width: 220px;
            max-width: 520px;
            width: max-content;
            color: #f8f9fa;
            backdrop-filter: blur(8px) saturate(160%);
        `;
      log("Did create menu element");
      log("Will build menu options array");
      const domainSectionItems = [];
      if (youtubeContext) {
        log("YouTube context available, will append specialized menu options");
        const youtubeOptions = buildYouTubeMenuOptions(youtubeContext, capturedUrl);
        youtubeOptions.forEach((optionDescriptor) => {
          log(`Queueing YouTube option: ${optionDescriptor.label}`);
          domainSectionItems.push(optionDescriptor);
        });
      }
      if (shouldEmitAmazonProductBlock(capturedUrl, !isAnchor)) {
        log("Amazon product detected for current page, will build product details option");
        let amazonProductData = null;
        try {
          amazonProductData = getAmazonProductData(capturedUrl);
        } catch (error) {
          logError(`Amazon product evaluation failed (non-fatal): ${error}`);
        }
        const amazonBlock = amazonProductData ? buildAmazonProductMarkdown(amazonProductData, capturedUrl) : null;
        if (amazonBlock) {
          const amazonTitle = amazonProductData.titleCleaned || amazonProductData.title || "Product details";
          domainSectionItems.push({
            label: "Amazon Product",
            displayValue: amazonTitle,
            tooltip: "Full product details block (title, ASIN, price) as a markdown snippet.",
            getValue: () => amazonBlock,
            isAllLinks: true
          });
          log("Queued Amazon Product details option");
        } else {
          log("No Amazon product details available for this URL");
        }
      }
      const commonItems = [];
      if (isAnchor) {
        log("Is anchor, will get link text");
        const linkText = getLinkText(anchor);
        if (linkText) {
          log(`Did get link text, adding to options: "${linkText}"`);
          commonItems.push({
            label: "Link Text",
            displayValue: linkText,
            getValue: () => linkText
          });
        } else {
          log("No link text available");
        }
      }
      log("Will get page title");
      const pageTitle = getPageTitle();
      if (pageTitle) {
        log(`Did get page title, adding to options: "${pageTitle}"`);
        commonItems.push({
          label: "Page Title",
          displayValue: pageTitle,
          tooltip: "Current document.title; may include notification counts or site suffixes.",
          getValue: () => pageTitle
        });
      } else {
        log("No page title available");
      }
      if (capturedUrl) {
        log("Will build URL component title option");
        const urlComponentTitle = getUrlComponentTitle(capturedUrl);
        if (urlComponentTitle) {
          log(`Did build URL component title, adding to options: "${urlComponentTitle}"`);
          commonItems.push({
            label: "URL (forward)",
            displayValue: urlComponentTitle,
            tooltip: "Domain \u2192 path segments left-to-right.",
            getValue: () => urlComponentTitle
          });
        } else {
          log("URL component title unavailable");
        }
        const urlComponentTitleLRU = getUrlComponentTitle(capturedUrl, { direction: "reverse" });
        if (urlComponentTitleLRU) {
          log(`Did build reverse URL component title, adding to options: "${urlComponentTitleLRU}"`);
          commonItems.push({
            label: "URL (reverse)",
            displayValue: urlComponentTitleLRU,
            tooltip: "Domain \u2190 path segments right-to-left (most-specific first).",
            getValue: () => urlComponentTitleLRU
          });
        } else {
          log("Reverse URL component title unavailable");
        }
      }
      if (!isAnchor && !youtubeContext) {
        log("Not anchor, will get meta description");
        const metaDesc = getMetaDescription();
        if (metaDesc) {
          log(`Did get meta description, adding to options: "${metaDesc}"`);
          commonItems.push({
            label: "Meta Description",
            displayValue: metaDesc,
            getValue: () => metaDesc
          });
        } else {
          log("No meta description available");
        }
      }
      const options = [];
      if (isContextMenu) {
        options.push({
          label: "Quick copy",
          displayValue: `${getAltZOption(altZTitlePreference).label} \u2014 no menu`,
          action: () => {
            compileAndCopyBufferedLinks([{ url: capturedUrl, anchor: isAnchor ? anchor : null }]);
            removeMenu();
          }
        });
      }
      if (domainSectionItems.length > 0) {
        log(`Adding ${domainSectionItems.length} domain-specific items`);
        options.push({ isSectionHeader: true, label: "Domain Specific" });
        domainSectionItems.forEach((item) => options.push(item));
      }
      options.push({ isSectionHeader: true, label: "Common" });
      commonItems.forEach((item) => options.push(item));
      log("Adding extract all links options");
      options.push({ isSectionHeader: true, label: "Lists" });
      options.push({
        label: "All Links (flat)",
        displayValue: "Single-level list",
        tooltip: "All anchors on the page as a flat bullet list.",
        getValue: extractAllLinksFlat,
        isAllLinks: true
      });
      options.push({
        label: "All Links (tree)",
        displayValue: "Preserves heading depth",
        tooltip: "All anchors grouped under the nearest heading (preserves document structure).",
        getValue: extractAllLinksHierarchical,
        isAllLinks: true
      });
      options.push({ isSectionHeader: true, label: "Settings" });
      buildSettingsMenuOptions().forEach((item) => options.push(item));
      if (isDebug) {
        options.push({ isSectionHeader: true, label: "Developer" });
        options.push({
          label: "Copy page state",
          displayValue: "JSON to clipboard",
          tooltip: "Copies current URL, title, capture mode, and debug state as JSON.",
          action: () => {
            const state = {
              url: capturedUrl,
              title: getPageTitle(),
              captureMode,
              isDebug,
              altZTitlePreference,
              isAnchor,
              anchorHref: isAnchor && anchor ? anchor.href : null
            };
            try {
              GM_setClipboard(JSON.stringify(state, null, 2), "text/plain");
              showNotification("Page state copied to clipboard");
            } catch (error) {
              logError(`Copy page state failed: ${error}`);
            }
            removeMenu();
          }
        });
      }
      log(`Did build ${options.length} menu options`);
      log("Will create menu items");
      let isFirstSectionHeader = true;
      options.forEach((option, index) => {
        const debugLabel = option.displayValue ? `${option.label}: ${option.displayValue}` : option.label;
        log(`Creating menu item ${index}: "${debugLabel}"`);
        if (option.isSectionHeader) {
          const headerWrapper = document.createElement("div");
          headerWrapper.style.cssText = `margin-top: ${isFirstSectionHeader ? "2px" : "8px"};`;
          isFirstSectionHeader = false;
          const headerLine = document.createElement("div");
          headerLine.style.cssText = `
                    border-top: 1px solid rgba(255, 255, 255, 0.45);
                `;
          const headerLabel = document.createElement("div");
          headerLabel.textContent = option.label;
          headerLabel.style.cssText = `
                    margin-top: 3px;
                    padding: 2px 0 2px 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.18em;
                    font-size: 10px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.45);
                `;
          headerWrapper.appendChild(headerLine);
          headerWrapper.appendChild(headerLabel);
          menu.appendChild(headerWrapper);
          return;
        }
        const item = document.createElement("div");
        item.style.cssText = `
                padding: 4px 14px 4px 20px;
                cursor: pointer;
                white-space: normal;
                line-height: 1.3;
                word-break: break-word;
                color: inherit;
                background-color: transparent;
                transition: background-color 120ms ease;
            `;
        const labelElement = document.createElement("div");
        let valueElement = null;
        if (option.displayValue) {
          labelElement.textContent = option.label;
          labelElement.style.cssText = `
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: rgba(248, 249, 250, 0.5);
                    margin-bottom: 1px;
                `;
          valueElement = document.createElement("div");
          valueElement.textContent = option.displayValue;
          valueElement.style.cssText = `
                    font-size: 13px;
                    color: #f8f9fa;
                `;
        } else {
          labelElement.textContent = option.label;
          labelElement.style.cssText = `
                    font-size: 13px;
                    color: #f8f9fa;
                `;
        }
        if (option.tooltip) {
          item.style.display = "flex";
          item.style.alignItems = "flex-start";
          const contentWrap = document.createElement("div");
          contentWrap.style.cssText = "flex:1;min-width:0;";
          contentWrap.appendChild(labelElement);
          if (valueElement) {
            contentWrap.appendChild(valueElement);
          }
          const icon = document.createElement("span");
          icon.textContent = "\u24D8";
          icon.style.cssText = "flex-shrink:0;margin-left:6px;margin-top:1px;opacity:0.45;cursor:help;user-select:none;font-size:11px;";
          let tooltipBubble = null;
          icon.addEventListener("mouseenter", () => {
            tooltipBubble = document.createElement("div");
            tooltipBubble.textContent = option.tooltip;
            tooltipBubble.style.cssText = [
              "position:fixed",
              "z-index:1000001",
              "max-width:240px",
              "background:#111",
              "color:#f8f9fa",
              "border:1px solid rgba(255,255,255,0.2)",
              "border-radius:6px",
              "padding:6px 10px",
              "font-size:11px",
              "line-height:1.4",
              "pointer-events:none",
              "white-space:normal"
            ].join(";");
            document.body.appendChild(tooltipBubble);
            const r = icon.getBoundingClientRect();
            tooltipBubble.style.left = `${Math.min(r.left, window.innerWidth - 248)}px`;
            tooltipBubble.style.top = `${Math.max(4, r.top - tooltipBubble.offsetHeight - 6)}px`;
          });
          icon.addEventListener("mouseleave", () => {
            if (tooltipBubble) {
              tooltipBubble.remove();
              tooltipBubble = null;
            }
          });
          item.appendChild(contentWrap);
          item.appendChild(icon);
        } else {
          item.appendChild(labelElement);
          if (valueElement) {
            item.appendChild(valueElement);
          }
        }
        item.addEventListener("mouseenter", () => {
          item.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
        });
        item.addEventListener("mouseleave", () => {
          item.style.backgroundColor = "transparent";
        });
        item.addEventListener("click", () => {
          log(`Menu item clicked: "${option.label}"`);
          if (option.action) {
            log(`Settings action invoked: "${option.label}"`);
            option.action();
            return;
          }
          if (option.isAllLinks) {
            log("All Links option selected, will extract all links");
            const allLinksMarkdown = option.getValue ? option.getValue() : null;
            if (allLinksMarkdown) {
              log(`Generated all links markdown (${allLinksMarkdown.length} characters)`);
              log("Will copy to clipboard");
              try {
                GM_setClipboard(allLinksMarkdown, "text/plain");
                log("Did copy all links to clipboard");
                showNotification("All page links copied to clipboard!");
                maybeCaptureSources({
                  originalUrl: isAnchor && anchor ? anchor.href || capturedUrl : typeof window !== "undefined" && window.location && window.location.href || capturedUrl,
                  format: (option.label || "").toLowerCase(),
                  output: allLinksMarkdown
                });
              } catch (error) {
                logError(`Failed to copy all links: ${error}`);
                alert("Failed to copy to clipboard. Check console for details.");
              }
            } else {
              logError("Failed to generate all links markdown");
            }
          } else {
            log("Will resolve title/value for option");
            const resolved = option.getResult ? option.getResult() : option.getValue ? option.getValue() : null;
            let title = resolved;
            let resolvedUrl = capturedUrl;
            if (resolved && typeof resolved === "object") {
              title = resolved.title || null;
              resolvedUrl = resolved.url || capturedUrl;
            }
            log(`Resolved title: ${title ? `"${title}"` : "null"}`);
            log(`Resolved URL: ${resolvedUrl || "null"}`);
            if (title && resolvedUrl) {
              log(`Will create markdown with title: "${title}", url: "${resolvedUrl}"`);
              const markdown = createMarkdown(title, resolvedUrl);
              if (markdown) {
                log(`Did create markdown: "${markdown}"`);
                log("Will copy to clipboard");
                copyToClipboard(markdown, title, resolvedUrl, {
                  originalUrl: isAnchor && anchor ? anchor.href || resolvedUrl : typeof window !== "undefined" && window.location && window.location.href || resolvedUrl,
                  format: (option.label || "").toLowerCase()
                });
                log("Did copy to clipboard");
              } else {
                logError("Markdown creation failed (returned null)");
              }
            } else {
              logWarn("Menu option did not provide both title and URL");
            }
          }
          log("Will remove menu");
          removeMenu();
        });
        menu.appendChild(item);
      });
      log("Did build all menu items");
      log("Will append menu to body");
      document.body.appendChild(menu);
      currentMenu = menu;
      log("Did append menu to body");
      log("Will adjust menu position to stay on screen");
      const rect = menu.getBoundingClientRect();
      log(`Menu bounds: right=${rect.right}, bottom=${rect.bottom}, window: width=${window.innerWidth}, height=${window.innerHeight}`);
      if (rect.right > window.innerWidth) {
        const newLeft = window.innerWidth - rect.width - 10;
        log(`Menu extends past right edge, adjusting left to ${newLeft}px`);
        menu.style.left = newLeft + "px";
      }
      if (rect.bottom > window.innerHeight) {
        const newTop = window.innerHeight - rect.height - 10;
        log(`Menu extends past bottom edge, adjusting top to ${newTop}px`);
        menu.style.top = newTop + "px";
      }
      log("Did adjust menu position");
      log("Will schedule outside click listener");
      setTimeout(() => {
        menuClickHandler = (event) => {
          if (currentMenu && !currentMenu.contains(event.target)) {
            log("Outside click detected, will prevent propagation and remove menu");
            event.preventDefault();
            event.stopPropagation();
            removeMenu();
          } else {
            log("Click inside menu, allowing propagation");
          }
        };
        menuEscapeHandler = (event) => {
          if (event.key === "Escape") {
            log("Escape key detected, will remove menu");
            event.preventDefault();
            event.stopPropagation();
            removeMenu();
          }
        };
        document.addEventListener("click", menuClickHandler, { capture: true });
        log("Did add outside click listener with event prevention");
        document.addEventListener("keydown", menuEscapeHandler, { capture: true });
        log("Did add Escape key listener");
      }, 0);
      logFunctionEnd("createMenu");
    }
    function removeMenu() {
      logFunctionBegin("removeMenu");
      if (menuClickHandler) {
        log("Removing click handler");
        document.removeEventListener("click", menuClickHandler, true);
        menuClickHandler = null;
      }
      if (menuEscapeHandler) {
        log("Removing escape handler");
        document.removeEventListener("keydown", menuEscapeHandler, true);
        menuEscapeHandler = null;
      }
      if (currentMenu) {
        log("Menu exists, will remove it");
        currentMenu.remove();
        currentMenu = null;
        log("Did remove menu");
      } else {
        log("No menu to remove");
      }
      log("Will clear target variables");
      targetElement = null;
      targetUrl = null;
      log("Did clear target variables");
      logFunctionEnd("removeMenu");
    }
    function cloneTriggers(source) {
      const out = {};
      Object.keys(source || {}).forEach((action) => {
        out[action] = (source[action] || []).map((binding) => ({
          modifiers: Object.assign({}, binding.modifiers),
          keys: (binding.keys || []).slice(),
          requiresClick: !!binding.requiresClick
        }));
      });
      return out;
    }
    function bindingState(event) {
      return {
        meta: !!event.metaKey,
        ctrl: !!event.ctrlKey,
        alt: !!event.altKey,
        shift: !!event.shiftKey
      };
    }
    function bindingHasInput(binding) {
      const m = binding.modifiers || {};
      return binding.keys && binding.keys.length > 0 || !!(m.meta || m.ctrl || m.alt || m.shift);
    }
    function matchesBinding(binding, state) {
      if (!binding || !bindingHasInput(binding)) {
        return false;
      }
      const m = binding.modifiers || {};
      if (!!m.meta !== state.meta || !!m.ctrl !== state.ctrl || !!m.alt !== state.alt || !!m.shift !== state.shift) {
        return false;
      }
      const keys = binding.keys || [];
      for (let index = 0; index < keys.length; index += 1) {
        if (!pressedKeys.has(keys[index])) {
          return false;
        }
      }
      return true;
    }
    function actionMatchesClick(actionName, state) {
      const list = triggers[actionName] || [];
      return list.some((binding) => binding && binding.requiresClick && matchesBinding(binding, state));
    }
    function keyboardActionTriggered(actionName, state, justPressedKey) {
      const list = triggers[actionName] || [];
      return list.some((binding) => binding && !binding.requiresClick && (binding.keys || []).indexOf(justPressedKey) !== -1 && matchesBinding(binding, state));
    }
    function loadTriggers() {
      if (typeof GM_getValue === "function") {
        try {
          const stored = GM_getValue(TRIGGERS_PREF_KEY, null);
          if (stored) {
            const parsed = typeof stored === "string" ? JSON.parse(stored) : stored;
            if (parsed && typeof parsed === "object") {
              return cloneTriggers(parsed);
            }
          }
        } catch (error) {
          logWarn(`Failed to load triggers, using defaults: ${error}`);
        }
      }
      return cloneTriggers(DEFAULT_TRIGGERS);
    }
    function saveTriggers() {
      if (typeof GM_setValue === "function") {
        try {
          GM_setValue(TRIGGERS_PREF_KEY, JSON.stringify(triggers));
        } catch (error) {
          logWarn(`Failed to save triggers: ${error}`);
        }
      }
    }
    const ACTION_LABELS = {
      menu: "Open menu",
      inferQuiet: "Quiet copy (no menu)",
      inferBuffer: "Buffer links (hold + click)"
    };
    let settingsPanelEl = null;
    let settingsBodyEl = null;
    let recordingAction = null;
    let recordOverlayEl = null;
    let recordModifiers = null;
    let recordKeys = null;
    function formatBinding(binding) {
      const parts = [];
      const m = binding.modifiers || {};
      if (m.meta) {
        parts.push("\u2318");
      }
      if (m.ctrl) {
        parts.push("\u2303");
      }
      if (m.alt) {
        parts.push("\u2325");
      }
      if (m.shift) {
        parts.push("\u21E7");
      }
      (binding.keys || []).forEach((key) => parts.push(key.toUpperCase()));
      let label = parts.join(" + ") || "(unset)";
      if (binding.requiresClick) {
        label = `${label} + click`;
      }
      return label;
    }
    function formatActionBindings(actionName) {
      const list = triggers[actionName] || [];
      return list.length ? list.map(formatBinding).join("  or  ") : "(none)";
    }
    function styleSettingsButton(button) {
      button.style.cssText = "margin-left:8px;padding:3px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#f8f9fa;font-size:12px;cursor:pointer;";
    }
    function updateRecordOverlay() {
      if (!recordOverlayEl) {
        return;
      }
      const preview = recordOverlayEl.querySelector("#markdown-linker-record-preview");
      if (preview) {
        preview.textContent = `${formatBinding({ modifiers: recordModifiers, keys: Array.from(recordKeys) })} \u2026`;
      }
    }
    function hideRecordOverlay() {
      if (recordOverlayEl) {
        recordOverlayEl.remove();
        recordOverlayEl = null;
      }
    }
    function showRecordOverlay(actionName) {
      hideRecordOverlay();
      const overlay = document.createElement("div");
      overlay.id = "markdown-linker-record-overlay";
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:1000001;display:flex;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;text-align:center;";
      const box = document.createElement("div");
      box.style.cssText = "max-width:80vw;padding:0 20px;";
      const heading = document.createElement("div");
      heading.textContent = `Recording: ${ACTION_LABELS[actionName] || actionName}`;
      heading.style.cssText = "font-size:18px;font-weight:600;margin-bottom:8px;";
      const instr = document.createElement("div");
      instr.textContent = "Press your keys, then click anywhere \u2014 or just release the keys for a keyboard-only trigger. Esc to cancel.";
      instr.style.cssText = "font-size:13px;opacity:0.8;margin-bottom:12px;";
      const preview = document.createElement("div");
      preview.id = "markdown-linker-record-preview";
      preview.textContent = "\u2026";
      preview.style.cssText = "font-size:22px;font-weight:700;letter-spacing:0.04em;";
      box.appendChild(heading);
      box.appendChild(instr);
      box.appendChild(preview);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      recordOverlayEl = overlay;
    }
    function accumulateRecordModifiers(event) {
      const state = bindingState(event);
      recordModifiers.meta = recordModifiers.meta || state.meta;
      recordModifiers.ctrl = recordModifiers.ctrl || state.ctrl;
      recordModifiers.alt = recordModifiers.alt || state.alt;
      recordModifiers.shift = recordModifiers.shift || state.shift;
    }
    function recordKeydownHandler(event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") {
        stopRecording();
        return;
      }
      accumulateRecordModifiers(event);
      if (event.key && event.key.length === 1) {
        recordKeys.add(event.key.toLowerCase());
      }
      updateRecordOverlay();
    }
    function recordKeyupHandler(event) {
      event.preventDefault();
      event.stopPropagation();
      if (recordKeys && recordKeys.size > 0) {
        commitRecording(false);
      }
    }
    function recordClickHandler(event) {
      event.preventDefault();
      event.stopPropagation();
      accumulateRecordModifiers(event);
      commitRecording(true);
    }
    function commitRecording(requiresClick) {
      const action = recordingAction;
      if (!action) {
        return;
      }
      const binding = {
        modifiers: {
          meta: !!recordModifiers.meta,
          ctrl: !!recordModifiers.ctrl,
          alt: !!recordModifiers.alt,
          shift: !!recordModifiers.shift
        },
        keys: Array.from(recordKeys),
        requiresClick: !!requiresClick
      };
      if (!bindingHasInput(binding)) {
        stopRecording();
        return;
      }
      triggers[action] = [binding];
      saveTriggers();
      log(`Recorded ${action} trigger: ${formatBinding(binding)}`);
      stopRecording();
    }
    function startRecording(actionName) {
      recordingAction = actionName;
      recordModifiers = { meta: false, ctrl: false, alt: false, shift: false };
      recordKeys = /* @__PURE__ */ new Set();
      window.addEventListener("keydown", recordKeydownHandler, true);
      window.addEventListener("keyup", recordKeyupHandler, true);
      window.addEventListener("click", recordClickHandler, true);
      showRecordOverlay(actionName);
    }
    function stopRecording() {
      window.removeEventListener("keydown", recordKeydownHandler, true);
      window.removeEventListener("keyup", recordKeyupHandler, true);
      window.removeEventListener("click", recordClickHandler, true);
      recordingAction = null;
      recordModifiers = null;
      recordKeys = null;
      hideRecordOverlay();
      refreshSettingsPanel();
    }
    function renderSettingsBody(body) {
      body.textContent = "";
      Object.keys(ACTION_LABELS).forEach((action) => {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.12);";
        const left = document.createElement("div");
        const name = document.createElement("div");
        name.textContent = ACTION_LABELS[action];
        name.style.cssText = "font-size:13px;color:#f8f9fa;";
        const bindingLabel = document.createElement("div");
        bindingLabel.textContent = formatActionBindings(action);
        bindingLabel.style.cssText = "font-size:12px;color:rgba(248,249,250,0.7);margin-top:2px;";
        left.appendChild(name);
        left.appendChild(bindingLabel);
        const right = document.createElement("div");
        const recordButton = document.createElement("button");
        recordButton.textContent = "Record";
        styleSettingsButton(recordButton);
        recordButton.addEventListener("click", (event) => {
          event.stopPropagation();
          startRecording(action);
        });
        const resetButton = document.createElement("button");
        resetButton.textContent = "Reset";
        styleSettingsButton(resetButton);
        resetButton.addEventListener("click", (event) => {
          event.stopPropagation();
          triggers[action] = cloneTriggers(DEFAULT_TRIGGERS)[action];
          saveTriggers();
          refreshSettingsPanel();
        });
        right.appendChild(recordButton);
        right.appendChild(resetButton);
        row.appendChild(left);
        row.appendChild(right);
        body.appendChild(row);
      });
      const prefSectionLabel = document.createElement("div");
      prefSectionLabel.textContent = "Preferences";
      prefSectionLabel.style.cssText = "font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:rgba(248,249,250,0.45);margin-top:14px;margin-bottom:4px;";
      body.appendChild(prefSectionLabel);
      const titleRow = document.createElement("div");
      titleRow.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.12);";
      const titleLeft = document.createElement("div");
      const titleName = document.createElement("div");
      titleName.textContent = "Quick-copy title";
      titleName.style.cssText = "font-size:13px;color:#f8f9fa;";
      const titleValueLabel = document.createElement("div");
      titleValueLabel.textContent = getAltZOption(altZTitlePreference).label;
      titleValueLabel.style.cssText = "font-size:12px;color:rgba(248,249,250,0.7);margin-top:2px;";
      titleLeft.appendChild(titleName);
      titleLeft.appendChild(titleValueLabel);
      const titleRight = document.createElement("div");
      const cycleButton = document.createElement("button");
      cycleButton.textContent = "Cycle";
      styleSettingsButton(cycleButton);
      cycleButton.addEventListener("click", (event) => {
        event.stopPropagation();
        cycleAltZTitlePreference();
      });
      const titleResetButton = document.createElement("button");
      titleResetButton.textContent = "Reset";
      styleSettingsButton(titleResetButton);
      titleResetButton.addEventListener("click", (event) => {
        event.stopPropagation();
        altZTitlePreference = ALT_Z_TITLE_OPTIONS[0].id;
        persistAltZTitlePreference();
      });
      titleRight.appendChild(cycleButton);
      titleRight.appendChild(titleResetButton);
      titleRow.appendChild(titleLeft);
      titleRow.appendChild(titleRight);
      body.appendChild(titleRow);
      const debugRow = document.createElement("div");
      debugRow.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.12);";
      const debugLeft = document.createElement("div");
      const debugName = document.createElement("div");
      debugName.textContent = "Debug mode";
      debugName.style.cssText = "font-size:13px;color:#f8f9fa;";
      const debugValueLabel = document.createElement("div");
      debugValueLabel.textContent = isDebug ? "on" : "off";
      debugValueLabel.style.cssText = "font-size:12px;color:rgba(248,249,250,0.7);margin-top:2px;";
      debugLeft.appendChild(debugName);
      debugLeft.appendChild(debugValueLabel);
      const debugRight = document.createElement("div");
      const debugToggleButton = document.createElement("button");
      debugToggleButton.textContent = "Toggle";
      styleSettingsButton(debugToggleButton);
      debugToggleButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleIsDebug();
      });
      debugRight.appendChild(debugToggleButton);
      debugRow.appendChild(debugLeft);
      debugRow.appendChild(debugRight);
      body.appendChild(debugRow);
    }
    function refreshSettingsPanel() {
      if (settingsBodyEl) {
        renderSettingsBody(settingsBodyEl);
      }
    }
    function closeTriggerSettings() {
      if (settingsPanelEl) {
        settingsPanelEl.remove();
        settingsPanelEl = null;
        settingsBodyEl = null;
      }
    }
    function openTriggerSettings() {
      closeTriggerSettings();
      const panel = document.createElement("div");
      panel.id = "markdown-linker-settings";
      panel.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:400px;max-width:92vw;background:#1f1f1f;color:#f8f9fa;border:1px solid rgba(255,255,255,0.25);border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,0.6);z-index:1000000;font-family:sans-serif;padding:16px;";
      const title = document.createElement("div");
      title.textContent = "Markdown Linker \u2014 Settings";
      title.style.cssText = "font-size:15px;font-weight:600;margin-bottom:4px;";
      const hint = document.createElement("div");
      hint.textContent = "Click Record, then press your keys and/or click. Esc cancels.";
      hint.style.cssText = "font-size:11px;color:rgba(248,249,250,0.6);margin-bottom:10px;";
      const body = document.createElement("div");
      const footer = document.createElement("div");
      footer.style.cssText = "display:flex;justify-content:flex-end;margin-top:12px;";
      const resetAll = document.createElement("button");
      resetAll.textContent = "Reset all";
      styleSettingsButton(resetAll);
      resetAll.addEventListener("click", (event) => {
        event.stopPropagation();
        triggers = cloneTriggers(DEFAULT_TRIGGERS);
        saveTriggers();
        refreshSettingsPanel();
      });
      const closeButton = document.createElement("button");
      closeButton.textContent = "Close";
      styleSettingsButton(closeButton);
      closeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        closeTriggerSettings();
      });
      footer.appendChild(resetAll);
      footer.appendChild(closeButton);
      panel.appendChild(title);
      panel.appendChild(hint);
      panel.appendChild(body);
      panel.appendChild(footer);
      document.body.appendChild(panel);
      settingsPanelEl = panel;
      settingsBodyEl = body;
      renderSettingsBody(body);
    }
    function registerSettingsMenuCommand() {
      if (typeof GM_registerMenuCommand === "function") {
        GM_registerMenuCommand("Markdown Linker: settings\u2026", openTriggerSettings);
      }
    }
    function handleClick(event) {
      logFunctionBegin("handleClick");
      log("Click event received");
      const clickState = bindingState(event);
      const menuClick = actionMatchesClick("menu", clickState);
      const bufferClick = actionMatchesClick("inferBuffer", clickState);
      log(`Click: menuTrigger=${menuClick}, bufferTrigger=${bufferClick}, buffer active=${isAltZBufferActive}, buffer size=${altZClickBuffer.length}`);
      if (!menuClick && !bufferClick) {
        log("No click trigger matched, returning");
        logFunctionEnd("handleClick");
        return;
      }
      log("Will prevent default and stop propagation");
      event.preventDefault();
      event.stopPropagation();
      log("Did prevent default and stop propagation");
      const isAutoInferMode = bufferClick;
      log(`Is auto-infer (buffer) mode: ${isAutoInferMode}`);
      if (isAutoInferMode && !isAltZBufferActive) {
        isAltZBufferActive = true;
        log("Activated Alt+Z buffer mode");
      }
      log("Will find closest anchor element");
      const anchor = event.target.closest("a");
      if (anchor) {
        log("Found anchor element, will attempt URL extraction");
        targetUrl = extractUrlFromAnchor(anchor, event);
        targetElement = anchor;
        if (validateUrl(targetUrl, anchor, event, "handleClick after extractUrlFromAnchor")) {
          log(`Successfully extracted and validated URL: "${targetUrl}"`);
          targetUrl = cleanUrl(targetUrl);
          log(`Cleaned URL: "${targetUrl}"`);
          if (isAutoInferMode) {
            log("In auto-infer mode, will buffer this link");
            log("Will show click feedback animation");
            showClickFeedback(event.clientX, event.clientY);
            log("Did show click feedback animation");
            altZClickBuffer.push({ url: targetUrl, anchor });
            log(`Buffered link #${altZClickBuffer.length}: "${targetUrl}"`);
          } else {
            log("In normal mode, will create menu for anchor");
            if (maybeAutoCopySelection(false, targetUrl)) {
              log("Selection auto-copied; skipping menu for anchor click");
              logFunctionEnd("handleClick");
              return;
            }
            createMenu(event.clientX, event.clientY, true, anchor);
          }
        } else {
          logError("URL validation failed, using current page URL as fallback");
          targetUrl = window.location.href;
          targetElement = null;
          log(`Set targetUrl to current page: "${targetUrl}"`);
          if (isAutoInferMode) {
            log("In auto-infer mode, will buffer this link (page URL fallback)");
            log("Will show click feedback animation");
            showClickFeedback(event.clientX, event.clientY);
            log("Did show click feedback animation");
            altZClickBuffer.push({ url: targetUrl, anchor: null });
            log(`Buffered link #${altZClickBuffer.length}: "${targetUrl}"`);
          } else {
            log("In normal mode, will create menu for page (fallback)");
            if (maybeAutoCopySelection(false, targetUrl)) {
              log("Selection auto-copied; skipping fallback menu");
              logFunctionEnd("handleClick");
              return;
            }
            createMenu(event.clientX, event.clientY, false);
          }
        }
      } else {
        log("Clicked on page (not an anchor)");
        targetUrl = window.location.href;
        targetElement = null;
        log(`Set targetUrl to current page: "${targetUrl}"`);
        if (isAutoInferMode) {
          log("In auto-infer mode, will buffer this link (page URL)");
          log("Will show click feedback animation");
          showClickFeedback(event.clientX, event.clientY);
          log("Did show click feedback animation");
          altZClickBuffer.push({ url: targetUrl, anchor: null });
          log(`Buffered link #${altZClickBuffer.length}: "${targetUrl}"`);
        } else {
          log("In normal mode, will create menu for page");
          if (maybeAutoCopySelection(false, targetUrl)) {
            log("Selection auto-copied; skipping page menu");
            logFunctionEnd("handleClick");
            return;
          }
          createMenu(event.clientX, event.clientY, false);
        }
      }
      logFunctionEnd("handleClick");
    }
    function handleContextMenu(event) {
      logFunctionBegin("handleContextMenu");
      log("Context menu (right-click) event received");
      const contextState = bindingState(event);
      if (!actionMatchesClick("menu", contextState)) {
        log("No menu trigger matched on right-click, returning");
        logFunctionEnd("handleContextMenu");
        return;
      }
      log("Will prevent default and stop propagation");
      event.preventDefault();
      event.stopPropagation();
      log("Did prevent default and stop propagation");
      log("Will find closest anchor element");
      const anchor = event.target.closest("a");
      if (anchor) {
        log("Found anchor element, will attempt URL extraction");
        targetUrl = extractUrlFromAnchor(anchor, event);
        targetElement = anchor;
        if (validateUrl(targetUrl, anchor, event, "handleContextMenu after extractUrlFromAnchor")) {
          log(`Successfully extracted and validated URL: "${targetUrl}"`);
          targetUrl = cleanUrl(targetUrl);
          log(`Cleaned URL: "${targetUrl}"`);
          log("Will create menu for anchor");
          if (maybeAutoCopySelection(false, targetUrl)) {
            log("Selection auto-copied; skipping context menu for anchor");
            logFunctionEnd("handleContextMenu");
            return;
          }
          createMenu(
            event.clientX,
            event.clientY,
            true,
            anchor,
            true
            /* isContextMenu */
          );
        } else {
          logError("URL validation failed, using current page URL as fallback");
          targetUrl = window.location.href;
          targetElement = null;
          log(`Set targetUrl to current page: "${targetUrl}"`);
          log("Will create menu for page (fallback)");
          if (maybeAutoCopySelection(false, targetUrl)) {
            log("Selection auto-copied; skipping fallback context menu");
            logFunctionEnd("handleContextMenu");
            return;
          }
          createMenu(
            event.clientX,
            event.clientY,
            false,
            null,
            true
            /* isContextMenu */
          );
        }
      } else {
        log("Right-clicked on page (not an anchor)");
        targetUrl = window.location.href;
        targetElement = null;
        log(`Set targetUrl to current page: "${targetUrl}"`);
        log("Will create menu for page");
        if (maybeAutoCopySelection(false, targetUrl)) {
          log("Selection auto-copied; skipping context menu for page");
          logFunctionEnd("handleContextMenu");
          return;
        }
        createMenu(
          event.clientX,
          event.clientY,
          false,
          null,
          true
          /* isContextMenu */
        );
      }
      logFunctionEnd("handleContextMenu");
    }
    function isInEditableContext(event) {
      logFunctionBegin("isInEditableContext");
      const target = event.target;
      log(`Checking if target is editable: ${unwrap(target, "tagName")}`);
      const isInputField = target instanceof HTMLInputElement;
      log(`Is input field: ${isInputField}`);
      const isTextArea = target instanceof HTMLTextAreaElement;
      log(`Is textarea: ${isTextArea}`);
      const isContentEditable = !!(target && (target.contentEditable === "true" || typeof target.closest === "function" && target.closest('[contenteditable="true"]')));
      log(`Is contenteditable: ${isContentEditable}`);
      const result = isInputField || isTextArea || !!isContentEditable;
      log(`Should skip keyboard trigger: ${result}`);
      logFunctionEnd("isInEditableContext");
      return result;
    }
    function handleKeydown(event) {
      if (event.repeat) {
        return;
      }
      const justPressedKey = event.key && event.key.length === 1 ? event.key.toLowerCase() : null;
      const keyState = bindingState(event);
      const isMenuKey = !!justPressedKey && keyboardActionTriggered("menu", keyState, justPressedKey);
      const isInferKey = !!justPressedKey && keyboardActionTriggered("inferQuiet", keyState, justPressedKey);
      if (isMenuKey || isInferKey) {
        logFunctionBegin("handleKeydown");
        log(`Keyboard trigger detected (key=${justPressedKey}, menu=${isMenuKey}, inferQuiet=${isInferKey})`);
        if (isInEditableContext(event)) {
          log("In editable context (input/textarea/contenteditable), skipping keyboard trigger");
          logFunctionEnd("handleKeydown");
          return;
        }
        log("Will prevent default and stop propagation");
        event.preventDefault();
        event.stopPropagation();
        log("Did prevent default and stop propagation");
        if (isInferKey) {
          const inferHovered = document.elementFromPoint(mouseX, mouseY);
          const inferAnchor = inferHovered ? inferHovered.closest("a") : null;
          const inferRawUrl = inferAnchor ? extractUrlFromAnchor(inferAnchor, event) : window.location.href;
          log("Keyboard auto-infer: copying single link without menu");
          compileAndCopyBufferedLinks([{ url: inferRawUrl, anchor: inferAnchor }]);
          logFunctionEnd("handleKeydown");
          return;
        }
        log(`Will check element at mouse position (${mouseX}, ${mouseY})`);
        const hoveredElement = document.elementFromPoint(mouseX, mouseY);
        log(`Found element: ${hoveredElement ? hoveredElement.tagName : "null"}`);
        const anchor = hoveredElement ? hoveredElement.closest("a") : null;
        log(`Found anchor: ${anchor ? "yes" : "no"}`);
        if (anchor) {
          log("Found anchor element, will attempt URL extraction");
          targetUrl = extractUrlFromAnchor(anchor, event);
          targetElement = anchor;
          if (validateUrl(targetUrl, anchor, event, "handleKeydown after extractUrlFromAnchor")) {
            log(`Successfully extracted and validated URL: "${targetUrl}"`);
            targetUrl = cleanUrl(targetUrl);
            log(`Cleaned URL: "${targetUrl}"`);
            log("Will create menu for anchor");
            if (maybeAutoCopySelection(false, targetUrl)) {
              log("Selection auto-copied; skipping keyboard anchor menu");
              logFunctionEnd("handleKeydown");
              return;
            }
            createMenu(mouseX, mouseY, true, anchor);
          } else {
            logError("URL validation failed, using current page URL as fallback");
            targetUrl = window.location.href;
            targetElement = null;
            log(`Set targetUrl to current page: "${targetUrl}"`);
            log("Will create menu for page (fallback)");
            if (maybeAutoCopySelection(false, targetUrl)) {
              log("Selection auto-copied; skipping keyboard fallback menu");
              logFunctionEnd("handleKeydown");
              return;
            }
            createMenu(mouseX, mouseY, false);
          }
        } else {
          log("Keyboard triggered on page (not hovering over anchor)");
          targetUrl = window.location.href;
          targetElement = null;
          log(`Set targetUrl to current page: "${targetUrl}"`);
          log("Will create menu for page");
          if (maybeAutoCopySelection(false, targetUrl)) {
            log("Selection auto-copied; skipping keyboard page menu");
            logFunctionEnd("handleKeydown");
            return;
          }
          createMenu(mouseX, mouseY, false);
        }
        logFunctionEnd("handleKeydown");
      }
    }
    let mouseX = 0;
    let mouseY = 0;
    log("Will add mousemove listener to track mouse position");
    document.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    });
    log("Did add mousemove listener");
    const pressedKeys = /* @__PURE__ */ new Set();
    let altZClickBuffer = [];
    let isAltZBufferActive = false;
    log("Will add keydown listener to track pressed keys (using capture phase, registered FIRST so fires FIRST)");
    let isZKeyDown = false;
    document.addEventListener("keydown", (event) => {
      if (event.key && event.key.length === 1) {
        pressedKeys.add(event.key.toLowerCase());
      }
    }, true);
    document.addEventListener("keyup", (event) => {
      if (event.key && event.key.length === 1) {
        pressedKeys.delete(event.key.toLowerCase());
      }
    }, true);
    log("Did add keydown listener for key tracking");
    log("Registering keydown listener for Alt+M handler (registered SECOND so fires SECOND during capture)");
    document.addEventListener("keydown", handleKeydown, true);
    log("Did register keydown listener for Alt+M handler");
    log("Will add keyup listener to track key releases");
    document.addEventListener("keyup", (event) => {
      logFunctionBegin("keyup tracker");
      log(`Key released: ${event.key}, altKey=${event.altKey}`);
      console.log(`[MARKDOWN_LINKER_DEBUG] KeyUp: released=${event.key}, altKey=${event.altKey}, buffer active=${isAltZBufferActive}, buffer size=${altZClickBuffer.length}`);
      const wasAltZActive = isAltZBufferActive;
      const bufferStillHeld = isAltZBufferActive && actionMatchesClick("inferBuffer", bindingState(event));
      log(`Buffer still held: ${bufferStillHeld}, was active: ${wasAltZActive}`);
      if (wasAltZActive && !bufferStillHeld) {
        log(`Alt+Z was deactivated, processing buffer with ${altZClickBuffer.length} buffered links`);
        isAltZBufferActive = false;
        if (altZClickBuffer.length > 0) {
          log("Will compile buffered links into markdown list");
          compileAndCopyBufferedLinks(altZClickBuffer);
          const count = altZClickBuffer.length;
          altZClickBuffer = [];
          log(`Did process ${count} links and clear buffer`);
        } else {
          log("Buffer is empty, nothing to copy");
        }
      } else {
        log("Alt+Z was not active or combo still active, skipping buffer processing");
      }
      logFunctionEnd("keyup tracker");
    }, false);
    log("Did add keyup listener for key tracking");
    log("Will register event listeners");
    log("Registering click listener");
    document.addEventListener("click", handleClick, true);
    log("Did register click listener");
    log("Registering contextmenu listener");
    document.addEventListener("contextmenu", handleContextMenu, true);
    log("Did register contextmenu listener");
    log("All event listeners registered");
    log("Triggers (configurable): hover+V = menu, hover+B = quiet copy, hold Z + click\u2026 = buffer list");
    log("Script initialization complete");
  })();
})();
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
