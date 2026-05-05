# Gmail Full Message — Chrome Extension

Surfaces a button at the top of clipped Gmail messages so you don't have to scroll to find the buried "View entire message" link.

## What it does

When you open an email in Gmail that contains a "[Message clipped] View entire message" link, the extension injects a small **↗ View full message** button at the top of that email's body. Clicking the button opens the full message in a new focused tab. The button stays active and can be clicked multiple times.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Manifest V3 config — host permission for `mail.google.com`, registers content script and service worker |
| `content.js` | Injected into Gmail — detects clipped messages and injects the button |
| `background.js` | Service worker — opens the full-message URL in a new focused tab |

## How to load in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select this folder
4. Open Gmail — the button will appear automatically on any clipped message

To reload after code changes: click the refresh icon on the extension card at `chrome://extensions`.

## How content.js works

- Runs `processMessages()` once on load (handles emails already open via direct link)
- Sets up a `MutationObserver` on `document.body` to detect Gmail's dynamic email renders
- For each `div[data-message-id]` (Gmail's per-message container in a thread):
  - Skips collapsed messages (no `.a3s` body div present)
  - Skips messages whose body text is still empty (content not yet loaded)
  - Marks each processed message with `data-gmailexpander-processed` to prevent double-injection
  - Searches for an `<a>` tag with exact text `"View entire message"`
  - If found, injects the button as the first child of the `.a3s` body div

## Fragile points

Gmail's internal DOM uses minified, unstable class names. The two selectors this extension depends on are:

- `div[data-message-id]` — per-message container in a thread
- `.a3s` — the message body div

If the extension stops working after a Gmail update, check whether these selectors still match using browser DevTools.

## Styling

Button uses `rgba(128, 128, 128, 0.1)` background with `color: inherit` — intentionally neutral so it works in both Gmail light and dark modes without needing to track Gmail's internal CSS variables.
