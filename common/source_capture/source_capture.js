'use strict';
/**
 * @file source_capture.js
 * @description Dev-time tool: ship in-page bytes (page source, runtime logs, …) to a local capture
 * server that writes them into the repo. Useful for building an archive of real pages and logs that
 * an agent can read while debugging/extending extraction.
 *
 * This module is intentionally DECOUPLED from any particular userscript. Callers supply their
 * userscript name and the relative file paths; this module only handles transport (and offers a
 * generic in-memory log buffer). A browser userscript cannot write to disk, so files are POSTed via
 * `GM_xmlhttpRequest` (a privileged API that — unlike `fetch` — is allowed from an HTTPS page to a
 * local `http://127.0.0.1` server) to the companion server (`source_capture_server.zsh` / `.py`).
 *
 * Consuming userscripts must declare:
 *   // @grant   GM_xmlhttpRequest
 *   // @connect 127.0.0.1
 *
 * @namespace SourceCapture
 * @see {@link https://violentmonkey.github.io/api/gm/#gm_xmlhttprequest GM_xmlhttpRequest}
 */

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 8787;
// Localhost dev token. Not a secret — it only stops random pages from POSTing into your repo while
// the server runs. The server's launcher can print a random token to override both sides.
const DEFAULT_TOKEN = 'source-capture-dev';
const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Creates a bounded in-memory log buffer. Any userscript can route its log lines through this so the
 * captured `.log` reflects the session.
 * @param {number} [maxLines=5000] - Hard cap; oldest lines are dropped past this.
 * @returns {{push:(line:string)=>void, getText:()=>string, clear:()=>void, size:()=>number}}
 */
function createLogBuffer(maxLines = 5000) {
    const lines = [];
    return {
        push(line) {
            lines.push(typeof line === 'string' ? line : String(line));
            if (lines.length > maxLines) {
                lines.splice(0, lines.length - maxLines);
            }
        },
        getText() {
            return lines.join('\n');
        },
        clear() {
            lines.length = 0;
        },
        size() {
            return lines.length;
        }
    };
}

/**
 * Resolves the GM XHR function across managers/grant styles. Returns null when unavailable.
 * @returns {Function|null}
 */
function resolveGmXhr() {
    if (typeof GM_xmlhttpRequest === 'function') {
        return GM_xmlhttpRequest;
    }
    if (typeof GM !== 'undefined' && GM && typeof GM.xmlHttpRequest === 'function') {
        return GM.xmlHttpRequest.bind(GM);
    }
    return null;
}

/**
 * POSTs a single file's bytes to the capture server. The body is the raw content; metadata travels
 * in headers (avoids JSON-encoding multi-MB HTML). Never rejects — always resolves a result object.
 * @param {object} opts
 * @param {string} opts.host
 * @param {number} opts.port
 * @param {string} opts.token
 * @param {string} opts.userscript - Used by the server as the `.gitignored/<userscript>/` root.
 * @param {string} opts.path - Repo-relative path under that root (e.g. `sources/products/<asin>.html`).
 * @param {string} opts.content
 * @returns {Promise<{ok:boolean, path:string, status?:number, error?:string, response?:string}>}
 */
function postFile(opts) {
    return new Promise((resolve) => {
        const xhr = resolveGmXhr();
        if (!xhr) {
            resolve({ ok: false, path: opts.path, error: 'GM_xmlhttpRequest unavailable (missing @grant?)' });
            return;
        }
        const url = `http://${opts.host}:${opts.port}/save`;
        try {
            xhr({
                method: 'POST',
                url,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'X-Capture-Token': opts.token,
                    'X-Capture-Userscript': opts.userscript,
                    'X-Capture-Path': opts.path
                },
                data: opts.content,
                timeout: DEFAULT_TIMEOUT_MS,
                onload: (response) => {
                    const status = response && typeof response.status === 'number' ? response.status : 0;
                    resolve({
                        ok: status >= 200 && status < 300,
                        path: opts.path,
                        status,
                        response: response ? response.responseText : ''
                    });
                },
                onerror: () => resolve({ ok: false, path: opts.path, error: 'network error (server not running?)' }),
                ontimeout: () => resolve({ ok: false, path: opts.path, error: 'timeout' })
            });
        } catch (error) {
            resolve({ ok: false, path: opts.path, error: String(error) });
        }
    });
}

/**
 * Captures (POSTs) one or more files to the local server. Fails gracefully: the returned promise
 * always resolves, and `onResult` is invoked with the aggregate outcome.
 * @param {object} options
 * @param {string} options.userscript - Required; the `.gitignored/<userscript>/` root on disk.
 * @param {Array<{path:string, content:string}>} options.files - Required; one POST per file.
 * @param {string} [options.host=127.0.0.1]
 * @param {number} [options.port=8787]
 * @param {string} [options.token]
 * @param {(result:{ok:boolean, results:Array}) => void} [options.onResult]
 * @returns {Promise<{ok:boolean, results:Array, error?:string}>}
 */
function capture(options) {
    const opts = options || {};
    const host = opts.host || DEFAULT_HOST;
    const port = opts.port || DEFAULT_PORT;
    const token = opts.token || DEFAULT_TOKEN;
    const userscript = opts.userscript;
    const files = Array.isArray(opts.files) ? opts.files.filter((file) => file && file.path) : [];

    if (!userscript || files.length === 0) {
        const result = { ok: false, results: [], error: 'capture requires { userscript, files: [{path, content}] }' };
        if (typeof opts.onResult === 'function') {
            try { opts.onResult(result); } catch (error) { /* noop */ }
        }
        return Promise.resolve(result);
    }

    const requests = files.map((file) => postFile({
        host,
        port,
        token,
        userscript,
        path: file.path,
        content: file.content == null ? '' : String(file.content)
    }));

    return Promise.all(requests).then((results) => {
        const ok = results.length > 0 && results.every((entry) => entry.ok);
        const result = { ok, results };
        if (typeof opts.onResult === 'function') {
            try { opts.onResult(result); } catch (error) { /* noop */ }
        }
        return result;
    });
}

const SourceCapture = {
    version: '0.1.0',
    DEFAULT_HOST,
    DEFAULT_PORT,
    DEFAULT_TOKEN,
    capture,
    postFile,
    createLogBuffer,
    // Shared buffer instance for the common "pipe my logs through this" case.
    logBuffer: createLogBuffer()
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SourceCapture;
}

if (typeof window !== 'undefined') {
    window.SourceCapture = SourceCapture;
}
