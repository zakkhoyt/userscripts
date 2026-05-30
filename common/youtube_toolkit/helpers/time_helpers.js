'use strict';

/**
 * @file time_helpers.js
 * @description Utility helpers for formatting and parsing YouTube timestamps
 * @namespace YouTubeToolkit.Helpers.Time
 */

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
    const minutes = Math.floor((wholeSeconds % 3600) / 60);
    const secs = wholeSeconds % 60;
    const parts = [];
    if (hours > 0) {
        parts.push(`${hours}h`);
    }
    if (hours > 0 || minutes > 0) {
        parts.push(`${minutes}m`);
    }
    parts.push(`${secs}s`);
    return parts.join('');
}

function secondsToClock(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) {
        return null;
    }
    const wholeSeconds = Math.floor(seconds);
    const hours = Math.floor(wholeSeconds / 3600);
    const minutes = Math.floor((wholeSeconds % 3600) / 60);
    const secs = wholeSeconds % 60;
    const pad = (value) => value.toString().padStart(2, '0');
    if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${minutes}:${pad(secs)}`;
}

function parseClockText(text) {
    if (!text) {
        return null;
    }
    const sanitized = text.replace(/[^0-9:]/g, '').trim();
    if (!sanitized) {
        return null;
    }
    const parts = sanitized.split(':').map(toInteger);
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
    if (typeof isoDuration !== 'string' || !isoDuration.startsWith('PT')) {
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
    formatTimestampParam,
};

if (typeof window !== 'undefined') {
    window.YouTubeToolkit = window.YouTubeToolkit || {};
    window.YouTubeToolkit.Helpers = window.YouTubeToolkit.Helpers || {};
    window.YouTubeToolkit.Helpers.Time = module.exports;
}
