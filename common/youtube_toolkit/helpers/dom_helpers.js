'use strict';

/**
 * @file dom_helpers.js
 * @description Safe DOM helper functions for YouTube Toolkit
 * @namespace YouTubeToolkit.Helpers.DOM
 */

function normalizeWhitespace(text) {
    if (typeof text !== 'string') {
        return '';
    }
    return text.replace(/\s+/g, ' ').trim();
}

function safeRoot(root) {
    if (root && typeof root.querySelector === 'function') {
        return root;
    }
    if (typeof document !== 'undefined' && document.querySelector) {
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
    if (!node || typeof node.textContent !== 'string') {
        return '';
    }
    return normalizeWhitespace(node.textContent);
}

function getText(selectorOrNode, root) {
    if (typeof selectorOrNode === 'string') {
        const node = safeQuery(selectorOrNode, root);
        return textFromNode(node);
    }
    return textFromNode(selectorOrNode);
}

function getAttribute(selectorOrNode, attribute, root) {
    if (!attribute) {
        return null;
    }
    const node = typeof selectorOrNode === 'string'
        ? safeQuery(selectorOrNode, root)
        : selectorOrNode;
    if (!node || typeof node.getAttribute !== 'function') {
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
    return normalizeWhitespace(node.content || node.getAttribute('content') || '');
}

function getLinkHref(doc, selector) {
    const node = safeQuery(selector, doc);
    if (!node) {
        return null;
    }
    const href = node.href || node.getAttribute('href');
    return href ? href.trim() : null;
}

function resolveUrl(href, base) {
    if (!href) {
        return null;
    }
    const origin = base || (typeof window !== 'undefined' ? window.location.origin : 'https://www.youtube.com');
    try {
        return new URL(href, origin).toString();
    } catch (error) {
        return null;
    }
}

function extractJSONFromScripts(doc, variableNames = []) {
    const scripts = safeQueryAll('script', doc);
    for (const script of scripts) {
        const content = script && script.textContent ? script.textContent.trim() : '';
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
    const equalsIndex = source.indexOf('=', assignmentIndex);
    if (equalsIndex === -1) {
        return null;
    }
    const braceStart = source.indexOf('{', equalsIndex);
    if (braceStart === -1) {
        return null;
    }
    let depth = 0;
    for (let index = braceStart; index < source.length; index += 1) {
        const char = source[index];
        if (char === '{') {
            depth += 1;
        } else if (char === '}') {
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
    normalizeWhitespace,
};

if (typeof window !== 'undefined') {
    window.YouTubeToolkit = window.YouTubeToolkit || {};
    window.YouTubeToolkit.Helpers = window.YouTubeToolkit.Helpers || {};
    window.YouTubeToolkit.Helpers.DOM = module.exports;
}
