#!/usr/bin/env python3
"""Local capture receiver for the source_capture dev tool.

Receives raw file bytes over HTTP POST from a userscript (via GM_xmlhttpRequest) and writes them
into the repo under ``<root>/.gitignored/<userscript>/<path>``. Bound to 127.0.0.1 only.

Protocol:
    POST /save
        body                  : raw file content (text)
        X-Capture-Token       : shared token (must match --token)
        X-Capture-Userscript  : userscript name -> .gitignored/<userscript>/ root
        X-Capture-Path        : repo-relative path under that root, e.g. sources/products/<asin>.html

Security: token check, 127.0.0.1 bind, and a path sandbox (no absolute paths, no ``..``; the
resolved target must stay within .gitignored/<userscript>/). It is a dev tool, not a public service.

Usage:
    python3 source_capture_server.py --root "$(git rev-parse --show-toplevel)" --port 8787 --token <tok>

References:
    - http.server: https://docs.python.org/3/library/http.server.html
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# Allowed characters in a userscript name and in each path segment (defense-in-depth on top of the
# realpath sandbox check). Segments are split on "/"; "." and ".." are rejected explicitly.
SAFE_SEGMENT = re.compile(r"^[A-Za-z0-9._-]+$")
MAX_BODY_BYTES = 64 * 1024 * 1024  # 64 MB ceiling (a captured page is a few MB)


def sanitize_userscript(name: str) -> str:
    """Returns a safe single-segment userscript name, or "" if invalid."""
    name = (name or "").strip()
    return name if SAFE_SEGMENT.match(name) else ""


def safe_target(root: str, userscript: str, rel_path: str) -> str:
    """Resolves the on-disk target and confirms it stays within .gitignored/<userscript>/.

    Raises ValueError on any traversal / invalid segment / escape attempt.
    """
    rel_path = (rel_path or "").strip()
    if not rel_path or rel_path.startswith("/") or "\\" in rel_path:
        raise ValueError("path must be relative and use forward slashes")
    segments = [seg for seg in rel_path.split("/") if seg != ""]
    if not segments:
        raise ValueError("empty path")
    for seg in segments:
        if seg in (".", "..") or not SAFE_SEGMENT.match(seg):
            raise ValueError(f"illegal path segment: {seg!r}")

    base = os.path.realpath(os.path.join(root, ".gitignored", userscript))
    target = os.path.realpath(os.path.join(base, *segments))
    if target != base and not target.startswith(base + os.sep):
        raise ValueError("path escapes sandbox")
    return target


def handle_save(root, expected_token, token, userscript_raw, rel_path, body):
    """Validates a save request and writes the file. Socket-free so it is unit-testable.

    Returns ``(status_code, payload_dict)`` and writes ``body`` to disk on success.
    """
    if token != expected_token:
        return 403, {"ok": False, "error": "bad token"}
    userscript = sanitize_userscript(userscript_raw)
    if not userscript:
        return 400, {"ok": False, "error": "missing/invalid X-Capture-Userscript"}
    if len(body) > MAX_BODY_BYTES:
        return 413, {"ok": False, "error": "body too large"}
    try:
        target = safe_target(root, userscript, rel_path)
    except ValueError as error:
        return 400, {"ok": False, "error": f"path rejected: {error}"}
    try:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "wb") as handle:
            handle.write(body)
    except OSError as error:
        return 500, {"ok": False, "error": f"write failed: {error}"}
    return 200, {"ok": True, "written": os.path.relpath(target, root), "bytes": len(body)}


class CaptureHandler(BaseHTTPRequestHandler):
    server_version = "SourceCapture/0.1"

    def _send_json(self, code: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        try:
            self.wfile.write(body)
        except BrokenPipeError:
            pass

    def do_POST(self) -> None:  # noqa: N802 (http.server API)
        if self.path != "/save":
            self._send_json(404, {"ok": False, "error": "unknown endpoint"})
            return

        length = int(self.headers.get("Content-Length", "0") or "0")
        if length < 0 or length > MAX_BODY_BYTES:
            self._send_json(413, {"ok": False, "error": "body too large"})
            return
        body = self.rfile.read(length) if length > 0 else b""

        status, payload = handle_save(
            self.server.capture_root,  # type: ignore[attr-defined]
            self.server.capture_token,  # type: ignore[attr-defined]
            self.headers.get("X-Capture-Token", ""),
            self.headers.get("X-Capture-Userscript", ""),
            self.headers.get("X-Capture-Path", ""),
            body,
        )
        if status == 200:
            sys.stderr.write(f"[capture] wrote {payload['bytes']} bytes -> {payload['written']}\n")
            sys.stderr.flush()
        self._send_json(status, payload)

    def log_message(self, fmt: str, *args) -> None:  # quieter default logging
        sys.stderr.write("[capture] " + (fmt % args) + "\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="source_capture local receiver")
    parser.add_argument("--root", required=True, help="Repo root; files land under <root>/.gitignored/")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host (default 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8787, help="Bind port (default 8787)")
    parser.add_argument("--token", default="source-capture-dev", help="Shared token")
    args = parser.parse_args()

    root = os.path.realpath(args.root)
    if not os.path.isdir(root):
        sys.stderr.write(f"[capture] ERROR: --root is not a directory: {root}\n")
        return 1

    httpd = ThreadingHTTPServer((args.host, args.port), CaptureHandler)
    httpd.capture_root = root  # type: ignore[attr-defined]
    httpd.capture_token = args.token  # type: ignore[attr-defined]
    sys.stderr.write(
        f"[capture] listening on http://{args.host}:{args.port}  ->  {root}/.gitignored/<userscript>/\n"
    )
    sys.stderr.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        sys.stderr.write("[capture] shutting down\n")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
