# Expanded Keyboard Shortcuts

Research and feasibility notes for `markdown_linker`'s configurable trigger system.
Each section answers a specific question, with implementation detail following the direct answer.

> [!NOTE]
> Terminology used throughout this document follows the definitions in
> [`KEYBOARD_SHORTCUTS.md`](../planning_references/notes/keyboards/KEYBOARD_SHORTCUTS.md):
> **Key Combo** = one or more modifier keys held while a normal key fires.
> **Chord** = a sequence of Key Combos (multi-step).

---

## Table of Contents

- [Collision Detection](#collision-detection)
- [fn / Globe Key](#fn--globe-key)
- [Escape Key as a Trigger](#escape-key-as-a-trigger)
- [Multiple Sequential Key Presses](#multiple-sequential-key-presses)
- [Chord Support](#chord-support)
- [Additional Mouse Triggers](#additional-mouse-triggers)
  - [Double Click / Multi-Click](#double-click--multi-click)
  - [Right Click](#right-click)
  - [Double Right Click](#double-right-click)
  - [Trackpad Multi-Finger Events](#trackpad-multi-finger-events)

---

## Collision Detection

**Question:** Can the userscript enumerate all shortcuts registered by the browser or macOS, and warn
the user when their custom shortcut conflicts with one already in use?

**Direct answer:** No enumeration API exists. The best achievable option is a hardcoded
warning list of known `Firefox` shortcuts checked at record time.

### Why enumeration is not possible

A `ViolentMonkey` content script runs in the page context — the same sandbox as any web
page JavaScript. That context provides no API for introspecting the host browser's own
registered commands or the host OS's system shortcuts:

- **Browser shortcuts:** The [`browser.commands`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/commands)
  API (which lets extensions register and query keyboard shortcuts) is only available to
  full `WebExtensions` installed via `about:addons`. Content scripts in `ViolentMonkey`
  cannot access it. ([MDN — commands API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/commands))

- **macOS system shortcuts:** The macOS `Accessibility API` (`AXUIElement`) can inspect
  application menus and their attached shortcuts, but only from native processes with
  accessibility permissions. No browser-accessible JavaScript API exposes this.
  ([Apple — Accessibility Programming Guide](https://developer.apple.com/library/archive/documentation/Accessibility/Conceptual/AccessibilityMacOSX/))

### What is achievable: a static warning list

We can maintain a hardcoded set of known `Firefox` shortcuts and surface a non-blocking
warning in the Settings panel when the user records one that matches.

`Firefox` publishes its full shortcut reference:
[Firefox keyboard shortcuts — Mozilla Support](https://support.mozilla.org/en-US/kb/keyboard-shortcuts-perform-firefox-tasks-quickly)

A curated subset covering the highest-collision risk:

| Shortcut                                     | Firefox Action                    |
| -------------------------------------------- | --------------------------------- |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>T</kbd> | New Tab                        |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>W</kbd> | Close Tab                      |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>L</kbd> | Focus Address Bar              |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>R</kbd> | Reload                         |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>F</kbd> | Find in Page                   |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | Focus Search Bar               |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>+</kbd> | Zoom In                        |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>-</kbd> | Zoom Out                       |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>0</kbd> | Reset Zoom                     |
| <kbd>Alt</kbd> + <kbd>←</kbd>                   | Back                           |
| <kbd>Alt</kbd> + <kbd>→</kbd>                   | Forward                        |
| <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>J</kbd> | Browser Console               |
| <kbd>F12</kbd>                                  | DevTools                       |
| <kbd>Esc</kbd>                                  | Stop Loading / Close Dialog    |

> [!TIP]
> Store the list in a constant in `markdown_linker.source.js`
> (e.g. `KNOWN_BROWSER_SHORTCUTS`) and check against it in the Settings panel's
> recorder — show a yellow warning badge rather than blocking the save.

### macOS system shortcut awareness

We cannot enumerate them, but we can document the highest-collision modifiers:

- <kbd>Cmd</kbd> + <kbd>Space</kbd> — `Spotlight`
- <kbd>Cmd</kbd> + <kbd>Tab</kbd> — App switcher
- <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>4</kbd> — Screenshot
- <kbd>Ctrl</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> — `Mission Control`

([Apple — macOS keyboard shortcuts](https://support.apple.com/en-us/111894))

> [!NOTE]
> macOS intercepts its system shortcuts before `Firefox` ever receives them, so
> the browser cannot `preventDefault()` them regardless. Our warning list for these is
> informational only.

---

## fn / Globe Key

**Question:** Can the userscript observe the <kbd>fn</kbd> / <kbd>🌐</kbd> (Globe) key as a modifier?

**Direct answer:** No. `Firefox` on macOS does not deliver reliable `KeyboardEvent`s for
bare <kbd>fn</kbd> / Globe presses. It is not usable as a trigger modifier.

### Why fn is not observable in a browser content script

The `KeyboardEvent` specification includes
[`KeyboardEvent.getModifierState("Fn")`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState),
but browser implementations vary significantly:

- On macOS, the Globe/Fn key is intercepted at the OS input stack before the browser
  receives a key event. When <kbd>fn</kbd> is held and a function-row key is pressed,
  the event arrives as that function key (`F1`–`F12`) — the fn state itself is not
  reflected in `event.getModifierState("Fn")` in `Firefox`.
  ([MDN — getModifierState](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState))

- On Apple Silicon and recent Apple keyboards, the Globe key's primary role is opening
  the emoji picker and switching input sources — both OS-level intercepts.
  ([Apple Support — Change Globe key function](https://support.apple.com/guide/mac-help/change-the-function-of-the-globe-key-mchl870853c8/mac))

- `Firefox`'s `KeyboardEvent` fires for alphanumeric and standard modifier keys, but not
  for a bare <kbd>fn</kbd> keydown with no accompanying key.

> [!WARNING]
> This limitation was confirmed during the trigger-refactor session. Attempting to use
> `getModifierState("Fn")` on `Firefox` on macOS returns `false` even when <kbd>fn</kbd>
> is physically held. Do not add it to the modifier checkbox list in the Settings panel —
> it will never match.

### What fn-modified keys do produce

When <kbd>fn</kbd> + a letter key fires an input character (e.g., some keyboards produce
glyphs with <kbd>fn</kbd> combos), those arrive as normal `keydown` events with the
resulting character as `event.key`. These can be bound as normal keys — not as "fn is a
modifier" — but that depends entirely on the hardware layout.

---

## Escape Key as a Trigger

**Question:** Can Escape be used as a shortcut trigger? Specifically, can we require
three sequential Escape presses to activate?

**Direct answer:** Yes — `Escape` fires standard `KeyboardEvent`s and can be observed.
Multi-press sequences are implementable with the same state machine described in
[Multiple Sequential Key Presses](#multiple-sequential-key-presses).

### Escape as a single trigger

`Escape` fires `event.key === 'Escape'` on both `keydown` and `keyup`. The script already
listens for it (to cancel the recording overlay). There is no browser restriction on
observing it in a content script. ([MDN — KeyboardEvent: key values — Escape](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values#ui_keys))

> [!WARNING]
> Single-Escape is overloaded at the browser level: it stops page loading, dismisses
> native dialogs, and closes some browser UI panels. Calling `event.preventDefault()` on
> a single Escape press can break these behaviors. A multi-press requirement (e.g., ×3)
> sidesteps most of this friction, because the first and second presses are not
> intercepted — only the third fires our action.

### Triple-Escape implementation sketch

```javascript
// State shared with the existing pressedKeys / chord tracking
const escapeHistory = []; // timestamps of recent Escape keydowns
const ESCAPE_MULTI_WINDOW_MS = 600; // max gap between presses

function handleKeydown(event) {
    if (event.key === 'Escape') {
        const now = Date.now();
        // Trim presses outside the window
        while (escapeHistory.length && now - escapeHistory[0] > ESCAPE_MULTI_WINDOW_MS) {
            escapeHistory.shift();
        }
        escapeHistory.push(now);
        if (escapeHistory.length >= 3) {
            escapeHistory.length = 0;   // reset
            event.preventDefault();
            fireAction('openMenu');     // or whatever the bound action is
        }
    }
}
```

> [!NOTE]
> This is the same sliding-window approach used for "multiple presses" below.
> The existing chord-state machine in the script can host this with minimal new code.

---

## Multiple Sequential Key Presses

**Question:** Can the script detect patterns like "press <kbd>⌥ Opt</kbd> three times" —
including the variant where the last press is held before a click?

**Direct answer:** Yes. Modifier-only keydown events are observable in `Firefox`.
A sliding-window counter can detect N consecutive presses within a time budget.

### How modifier keydowns work in the browser

When a modifier key is pressed without any accompanying normal key, `Firefox` fires a
`keydown` event with `event.key === 'Alt'` (for Option), `event.key === 'Meta'` (for
Command), etc. The `event.code` identifies the physical key
(`'AltLeft'`, `'AltRight'`, `'MetaLeft'`, etc.).
([MDN — Modifier keys](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values#modifier_keys))

This means `opt (keydown) → opt (keyup) → opt (keydown) → opt (keyup) → opt (keydown)`
is fully observable — each cycle fires a distinct pair of DOM events.

### State machine design

A **multi-press binding** is a new binding shape alongside the existing single-combo shape:

```javascript
// Single-combo binding (existing)
{ modifiers: { alt: true }, keys: [], requiresClick: false }

// Multi-press binding (new)
{ multiPress: { key: 'Alt', count: 3, windowMs: 600 }, requiresClick: false }

// Multi-press + hold + click (new)
{ multiPress: { key: 'Alt', count: 3, windowMs: 600 }, requiresClick: true }
```

The evaluation logic at keydown:

```javascript
const recentPresses = []; // { key, time }[]

function evaluateMultiPress(event) {
    const now = Date.now();
    recentPresses.push({ key: event.key, time: now });
    // Expire old entries
    const cutoff = now - binding.multiPress.windowMs;
    while (recentPresses.length && recentPresses[0].time < cutoff) {
        recentPresses.shift();
    }
    const matchCount = recentPresses.filter(p => p.key === binding.multiPress.key).length;
    if (matchCount >= binding.multiPress.count) {
        if (binding.requiresClick) {
            enterWaitForClickMode();   // arm a one-shot mousedown listener
        } else {
            fireAction();
        }
        recentPresses.length = 0;
    }
}
```

### "Hold last press, then click" variant

```
opt↓  opt↑  opt↓  opt↑  opt↓  [mousedown]
```

This is the `requiresClick: true` case above. After the Nth keydown without a matching
keyup, `enterWaitForClickMode()` registers a one-shot `mousedown` listener. If a click
arrives while the key is still down, the action fires. If the key is released before the
click, the one-shot listener is removed.

> [!NOTE]
> This fits neatly into the chord state machine described in
> [Chord Support](#chord-support) — a multi-press can be modeled as a chord whose
> each "term" is a single modifier keydown+keyup, with the optional final term being
> a click.

---

## Chord Support

**Question:** Can the userscript implement `VSCode`-style chords — multi-step key combo
sequences where the first combo acts as a prefix that arms the second?

**Direct answer:** Yes, completely. Chords are implementable in pure JavaScript with a
stateful prefix tracker and a timeout. No browser APIs beyond standard `KeyboardEvent`
are required.

### What a chord is (terminology recap)

A **chord** is a sequence of Key Combos where each combo is a "term."
The first term enters a temporary **prefix state**; subsequent terms are evaluated
against that state. ([`KEYBOARD_SHORTCUTS.md`](../planning_references/notes/keyboards/KEYBOARD_SHORTCUTS.md))

Example — `VSCode`'s open-keyboard-shortcuts command: press <kbd>⌘ K</kbd>, release,
then press <kbd>⌘ S</kbd>. The `⌘ K` is the **chord prefix**.

<img src="images/PLAN_SHORTCUTS_PHASE-02/visual_studio_code_shortcut_notation.png"
     alt="visual_studio_code_shortcut_notation"
     width="500">

`VSCode` wraps each term in square brackets in its keybinding notation, e.g.
`[⌘K] [⌘S]`. This document adopts the same notation.

### Why chords are useful in a browser userscript

Single-key and modifier+key combos in a browser are heavily pre-claimed. Chords let us
overload safe prefix keys without colliding with browser defaults:

- `[V]` alone opens the menu (current default, browser-safe).
- `[V] [B]` could open a different menu variant, or copy in a specific format.
- `[V] [1]` through `[V] [9]` could select the Nth menu item directly.

The prefix key burns one combo but unlocks a full namespace of subsequent keys.

### State machine design

```javascript
const chordState = {
    active: false,       // are we in prefix-wait mode?
    prefix: null,        // which Binding matched the first term
    startTime: 0,        // when did we enter prefix-wait
};
const CHORD_TIMEOUT_MS = 1500;  // cancel prefix if second term doesn't arrive

function handleKeydown(event) {
    if (chordState.active) {
        // We're waiting for the second term
        if (Date.now() - chordState.startTime > CHORD_TIMEOUT_MS) {
            cancelChord();   // timeout expired before this keydown
        } else if (matchesBindingSecondTerm(event, chordState.prefix)) {
            fireAction(chordState.prefix.action);
            cancelChord();
            event.preventDefault();
            return;
        } else {
            cancelChord();   // unexpected key — pass through
        }
    }

    // Check if this keydown matches any first-term binding
    const match = findFirstTermMatch(event);
    if (match && match.hasSecondTerm) {
        enterPrefixMode(match);
        event.preventDefault();  // suppress default behavior while waiting
        showChordHint(match);    // e.g. notification: "V pressed — waiting for next key…"
    } else if (match) {
        fireAction(match.action);
        event.preventDefault();
    }
}

function cancelChord() {
    chordState.active = false;
    chordState.prefix = null;
    hideChordHint();
}
```

> [!IMPORTANT]
> During prefix-wait state, the script must suppress the default action of the prefix key
> (`preventDefault()`) so the browser does not act on it independently. This means that if
> the chord is cancelled (timeout or wrong second key), the suppressed prefix action is
> simply lost. Design prefix keys to be low-cost to lose (e.g. `V` with no browser
> meaning, rather than <kbd>⌘ K</kbd> which opens the address bar in `Firefox`).

### Chord notation for the Settings UI

The existing recorder UI captures a single binding (modifiers + keys ± click).
Chord support requires a two-step recorder:

1. **Record prefix term** — user performs the first combo; UI shows `[V] recorded. Now record the second term…`
2. **Record second term** — user performs the second combo; UI shows `[V] [B]`

The serialized storage format extends the existing binding:

```javascript
// Two-term chord stored as an array of bindings
{
    terms: [
        { modifiers: {}, keys: ['v'], requiresClick: false },   // prefix
        { modifiers: {}, keys: ['b'], requiresClick: false },   // action key
    ],
    action: 'openMenu',
}
```

### Timeout and user feedback

| State            | UI indication                                                  |
| ---------------- | -------------------------------------------------------------- |
| Prefix recorded  | Small notification: "V — waiting for next key…"               |
| Second term fires | Dismiss notification, execute action                          |
| Timeout expires  | Dismiss notification silently; no action                      |
| Wrong key pressed | Dismiss notification, pass event through to browser          |

`VSCode` uses ~1 000 ms. A 1 500 ms default gives comfortable typing pace without
feeling sluggish.

### Browser-safe prefix key choices

Because `Firefox` pre-claims many modifier+key combos, the safest chord prefixes are:

| Prefix      | Browser conflict?                                             | Notes                                          |
| ----------- | ------------------------------------------------------------- | ---------------------------------------------- |
| `V`         | None in `Firefox` or `YouTube`                               | Current default menu trigger — good prefix     |
| `B`         | None in `Firefox` or `YouTube`                               | Current quiet-copy trigger                     |
| `Z`         | None in `Firefox` or `YouTube`                               | Current buffer-links trigger                   |
| `` ` ``     | None (backtick has no browser binding)                       | Maximally safe; harder to reach                |
| <kbd>⌘ K</kbd> | **Yes** — opens address bar in `Firefox`                 | Avoid as chord prefix in browser context       |

([Firefox keyboard shortcuts](https://support.mozilla.org/en-US/kb/keyboard-shortcuts-perform-firefox-tasks-quickly))

> [!TIP]
> A chord prefix of `V` followed by a digit (`[V] [1]` … `[V] [9]`) would allow
> quick-selecting the Nth visible menu item without opening the menu first — a natural
> keyboard-navigation extension of the existing system.

---

## Cross-Topic: Fitting Everything Into One Model

All four new trigger shapes — multi-press, Escape-N, chord, click variants — are
extensions of the same underlying binding model already in the script:

```javascript
// Existing
{ modifiers: {alt, meta, ctrl, shift}, keys: [...], requiresClick: bool }

// Extensions
{ multiPress: { key, count, windowMs }, requiresClick: bool }   // ×N press
{ chord: { terms: [Binding, Binding, ...] }, action }            // multi-step
{ clickCount: 2, modifiers: {}, requiresRightClick: false }      // double-click
```

A single `matchesAnyBinding(event, bindings)` evaluator handles all shapes. The Settings
panel recorder would present a mode selector: **Single Combo | Multi-Press | Chord |
Mouse**, then run the appropriate capture flow.

---

## Additional Mouse Triggers

### Apple macOS Keyboard Shortcut List as Collision Reference

**Question:** Can the script use the Apple Support macOS shortcut list
([Mac keyboard shortcuts — Apple Support](https://support.apple.com/en-us/102650))
as a "used" list to warn the user? And can the script know if individual macOS
shortcuts have been disabled by the user?

**Direct answer:** The list can be hardcoded as a static warning reference.
The script **cannot** know whether any of those shortcuts are disabled — that
information lives in macOS system preference files that the browser cannot access.

#### Why disabled-state is unknowable

macOS keyboard shortcuts are stored in each user's `~/Library/Preferences/` plist files
(e.g. `com.apple.symbolichotkeys.plist`). There is no browser-accessible JavaScript API
to query those preferences. The browser sandbox and content-script context have no
filesystem or native interprocess access. Even if the script ran with all available
`GM_xmlhttpRequest` grants, a localhost server could not read another process's macOS
preferences without elevated system access.

([Apple Developer — Keyboard Shortcuts — Avoid Conflicts](https://developer.apple.com/design/human-interface-guidelines/keyboards#Avoid-conflicts))

#### Practical approach: a two-tier warning list

The [Apple Support macOS shortcuts reference](https://support.apple.com/en-us/102650) is
a useful baseline. Combine it with the `Firefox`-specific list from the
[Collision Detection](#collision-detection) section above.

Tier 1 — highest collision risk (macOS system-level; not suppressible by the browser):

| Shortcut                                                           | macOS Action                    |
| ------------------------------------------------------------------ | ------------------------------- |
| <kbd>Cmd</kbd> + <kbd>Space</kbd>                                  | `Spotlight` Search              |
| <kbd>Cmd</kbd> + <kbd>Tab</kbd>                                    | App switcher                    |
| <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>3</kbd>                   | Screenshot (full screen)        |
| <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>4</kbd>                   | Screenshot (selection)          |
| <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>5</kbd>                   | Screenshot/recording controls   |
| <kbd>Ctrl</kbd> + <kbd>↑</kbd>                                     | `Mission Control`               |
| <kbd>Ctrl</kbd> + <kbd>↓</kbd>                                     | App Exposé                      |
| <kbd>Ctrl</kbd> + <kbd>←</kbd> / <kbd>→</kbd>                      | Move between Spaces             |
| <kbd>Cmd</kbd> + <kbd>H</kbd>                                      | Hide application                |
| <kbd>Cmd</kbd> + <kbd>M</kbd>                                      | Minimize window                 |
| <kbd>Cmd</kbd> + <kbd>Q</kbd>                                      | Quit application                |
| <kbd>Cmd</kbd> + <kbd>W</kbd>                                      | Close window                    |

Tier 2 — browser-level (suppressible by `preventDefault()`, but may surprise users):

| Shortcut                                                           | Firefox Action                  |
| ------------------------------------------------------------------ | ------------------------------- |
| <kbd>Cmd</kbd> + <kbd>T</kbd>                                      | New Tab                         |
| <kbd>Cmd</kbd> + <kbd>L</kbd>                                      | Focus Address Bar               |
| <kbd>Cmd</kbd> + <kbd>F</kbd>                                      | Find in Page                    |
| <kbd>Cmd</kbd> + <kbd>R</kbd>                                      | Reload Page                     |

> [!NOTE]
> When a shortcut appears in Tier 1, our `preventDefault()` call in the content script
> cannot suppress it — macOS processes these keys before `Firefox` receives the event.
> A Tier 1 warning in the Settings recorder should say "macOS will intercept this
> before the script can act" rather than just "already in use."

---

### Double Click / Multi-Click

**Question:** Can the script receive double-click (and triple/quad-click) events
and use them as shortcut triggers? How should they be represented graphically?

**Direct answer:** Yes. `dblclick` is a standard DOM event available in all browsers.
Higher click counts (`×3`, `×4`) have no dedicated event, but `MouseEvent.detail`
reports the click count and is fully observable.

#### How click counts work in the browser

The browser fires:
- `click` — every click; `event.detail` = `1` for first, `2` for second (arriving within
  the OS double-click interval), `3` for third, etc.
- `dblclick` — fires after the second click completes (in addition to the two `click`
  events). `event.detail` = `2`.

([MDN — MouseEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/detail))
([MDN — dblclick event](https://developer.mozilla.org/en-US/docs/Web/API/Element/dblclick_event))

The OS-configured double-click interval is not exposed to JavaScript, but the browser
interprets it and fires `dblclick` accordingly. We don't need to measure timing ourselves.

#### Listening for click counts in the existing handler

The simplest extension of the current `handleClick`:

```javascript
// In handleClick (currently registered on 'click' with capture: true)
function handleClick(event) {
    if (event.detail === 2 && actionMatchesClick('openMenu', buildClickState(event))) {
        event.preventDefault();
        event.stopPropagation();
        openMenu(event);
        return;
    }
    // existing single-click logic below…
}
```

Or register a dedicated `dblclick` listener alongside the existing `click` listener —
the choice depends on whether we want to keep `click` and `dblclick` actions orthogonal
(separate listeners) or unified (check `detail` inside one handler).

> [!WARNING]
> If a double-click trigger fires on `click` (checking `detail === 2`), the first click
> (`detail === 1`) will also be evaluated by whatever single-click binding is active.
> Use `dblclick` listener (fires after both clicks) if you want to avoid the first click
> triggering a single-click action.

#### Triple and quad click

```javascript
document.addEventListener('click', (event) => {
    if (event.detail === 3) { /* triple click action */ }
    if (event.detail === 4) { /* quad click action */   }
}, true);
```

Triple-click in most browsers selects the current line of text; quad-click selects
the paragraph. Both can be `preventDefault()`'d to suppress that behavior.

#### Graphical representation in the Settings UI

| Click type    | Suggested notation       | Alternate glyph form |
| ------------- | ------------------------ | -------------------- |
| Single click  | `Click`                  | `1× 🖱`              |
| Double click  | `2× Click`               | `2× 🖱`              |
| Triple click  | `3× Click`               | `3× 🖱`              |
| Quad click    | `4× Click`               | `4× 🖱`              |

With a modifier: `⌥ 2× Click` (Option + double-click). The `×N` prefix is concise and
mirrors the multi-press notation from [Multiple Sequential Key Presses](#multiple-sequential-key-presses).

> [!TIP]
> Quad-click is unusual enough that most users won't discover it accidentally.
> It makes a reasonable "safe" trigger for rarely-needed actions.

---

### Right Click

**Question:** Can the script intercept right-click and use it as a trigger, preventing
the browser's native context menu from appearing?

**Direct answer:** Yes — and it is **already implemented**. The script registers a
`contextmenu` event listener that calls `event.preventDefault()` + `event.stopPropagation()`
when the configured trigger modifier is held, suppressing the native menu and opening our
custom popup instead.

#### Current implementation

- Listener: `document.addEventListener('contextmenu', handleContextMenu, true)` (capture phase)
- Suppression: `event.preventDefault()` prevents `Firefox`'s native context menu when our
  trigger condition matches
- Plain right-click (no trigger modifier held) passes through to the browser normally
- When our popup opens from right-click, `isContextMenu = true` causes a "Quick copy" item
  to be prepended at the top

([MDN — Element: contextmenu event](https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event))

#### Unmodified right-click as a trigger

The current design requires the configured trigger modifier key to be held during the
right-click. A plain right-click always shows the browser menu. This could be changed —
`handleContextMenu` could check `isAnchorTarget` and intercept plain right-clicks on
links only (Option A from the transcript), but this would remove native Firefox link
options ("Open in new tab", "Save link as", etc.) which the user previously decided
to preserve.

---

### Double Right Click

**Question:** Is double right-click a detectable event that could be used as a trigger?

**Direct answer:** Yes, with a custom counter — there is no native `dbl-contextmenu`
event, but the same `MouseEvent.detail` or a timestamp-window approach works.

#### How to detect it

```javascript
let lastContextmenuTime = 0;
const DOUBLE_CONTEXTMENU_WINDOW_MS = 400;

function handleContextMenu(event) {
    const now = Date.now();
    const isDouble = (now - lastContextmenuTime) < DOUBLE_CONTEXTMENU_WINDOW_MS;
    lastContextmenuTime = now;

    if (isDouble) {
        event.preventDefault();
        event.stopPropagation();
        fireDoubleRightClickAction(event);
        return;
    }
    // Existing single right-click logic…
}
```

> [!WARNING]
> The first right-click arrives before you know the second is coming. If you call
> `event.preventDefault()` on all `contextmenu` events while waiting for a possible
> second click, **the native context menu never appears even for single right-clicks**.
> The practical solution is to either:
> - **Always suppress** and show our menu on double, nothing on single (breaks expected
>   single right-click behavior), or
> - **Require a modifier** on the second click to confirm intent (e.g., right-click,
>   right-click+<kbd>Shift</kbd>), or
> - **Accept a brief delay** before showing the native menu on single right-click
>   (setTimeout of ~400 ms), cancelled if a second arrives — this mimics how
>   `dblclick` works but is noticeable as a lag on every right-click.

Double right-click without a modifier is therefore tricky in practice; pairing it with
a modifier key avoids the ambiguity entirely.

---

### Trackpad Multi-Finger Events

**Question:** Can the script detect the number of fingers currently touching an Apple
trackpad, or react to multi-finger gestures?

**Direct answer:** No. `Firefox` on macOS does not expose raw trackpad touch data to
content scripts. The trackpad is translated entirely into mouse and scroll events before
the browser's JavaScript layer ever sees it. Finger count is not available.

#### Why finger data is inaccessible in Firefox on macOS

The relevant web APIs and their limitations:

| API                                                                                                      | Available in `Firefox` on macOS?                                  |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)                           | **No** — designed for touchscreens, not trackpads                 |
| [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)                       | **No multi-finger** — trackpad shows as `pointerType: "mouse"`, one pointer |
| [`navigator.maxTouchPoints`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/maxTouchPoints)  | Returns `0` on macOS desktop — no touch capability declared       |
| `GestureEvent` (`gesturestart`, `gesturechange`, `gestureend`)                                           | **`WebKit`/Safari only** — not available in `Firefox`             |
| `WheelEvent` (`wheel`)                                                                                   | Available, but only carries scroll delta — no finger count        |

On macOS, the `WindowServer` process translates all trackpad input into OS-level gesture
events before `Firefox` ever receives anything. `Firefox` receives the final translation
(scroll wheel delta, click at coordinates) — not the raw multitouch data.

([MDN — Touch Events: Firefox compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events#browser_compatibility))
([MDN — Pointer Events: browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#browser_compatibility))

#### What is observable from the trackpad

Even without finger count, two categories of trackpad behavior do reach content scripts:

1. **Scroll (`wheel` event):** `event.deltaX` / `event.deltaY` indicate direction and
   magnitude. A two-finger swipe left/right fires `wheel` events. We can build triggers
   from scroll direction (e.g., "horizontal scroll while hovering a link"), though these
   are not "finger-count" triggers per se.

2. **`WheelEvent.deltaMode`** and momentum: `Firefox` sets `deltaMode: DOM_DELTA_PIXEL`
   on trackpad scroll events, which can be distinguished from physical scroll wheels
   (`DOM_DELTA_LINE`). This is a weak signal and unreliable for trigger design.

> [!WARNING]
> Even if a future browser version exposed basic touch point count, implementing
> triggers based on "two fingers spread apart in the left and right quarters of the
> trackpad" would require geometric analysis of multi-touch coordinates — data that
> is still not exposed today.

#### Future possibility: `WheelEvent`-based gestures

A horizontal swipe gesture (two-finger swipe left/right) that is not consumed by the
page for scrolling is detectable:

```javascript
document.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 50) {
        // Horizontal swipe — direction: event.deltaX > 0 is swipe-right
    }
}, { passive: true });
```

This is not a finger-count trigger, but a gesture-direction trigger. It's something we
could explore without waiting for browser support of raw multitouch.

---

## Cross-Topic: Fitting Everything Into One Model

All trigger shapes — single combo, multi-press, Escape-N, chord, click variants, mouse
multi-click — are extensions of the same underlying binding model in the script:

```javascript
// Existing
{ modifiers: {alt, meta, ctrl, shift}, keys: [...], requiresClick: bool }

// Extensions
{ multiPress: { key, count, windowMs }, requiresClick: bool }    // ×N key press
{ chord: { terms: [Binding, Binding, ...] }, action }             // multi-step
{ clickCount: 2, modifiers: {}, requiresRightClick: false }       // double-click
{ clickCount: 2, modifiers: {}, requiresRightClick: true }        // double right-click
```

A single `matchesAnyBinding(event, bindings)` evaluator handles all shapes. The Settings
panel recorder would present a mode selector: **Single Combo | Multi-Press | Chord |
Mouse Click**, then run the appropriate capture flow.

---

*References:*

- [MDN — KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
- [MDN — KeyboardEvent key values](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values)
- [MDN — getModifierState](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState)
- [MDN — browser.commands API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/commands)
- [MDN — MouseEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/detail)
- [MDN — dblclick event](https://developer.mozilla.org/en-US/docs/Web/API/Element/dblclick_event)
- [MDN — Element: contextmenu event](https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event)
- [MDN — Touch Events: browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events#browser_compatibility)
- [MDN — Pointer Events: browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#browser_compatibility)
- [Firefox keyboard shortcuts — Mozilla Support](https://support.mozilla.org/en-US/kb/keyboard-shortcuts-perform-firefox-tasks-quickly)
- [Apple Support — macOS keyboard shortcuts](https://support.apple.com/en-us/102650)
- [Apple Support — Change Globe key function](https://support.apple.com/guide/mac-help/change-the-function-of-the-globe-key-mchl870853c8/mac)
- [Apple — Accessibility Programming Guide](https://developer.apple.com/library/archive/documentation/Accessibility/Conceptual/AccessibilityMacOSX/)
- [Apple HIG — Avoid keyboard shortcut conflicts](https://developer.apple.com/design/human-interface-guidelines/keyboards#Avoid-conflicts)
- [`KEYBOARD_SHORTCUTS.md`](../planning_references/notes/keyboards/KEYBOARD_SHORTCUTS.md) — local terminology reference
