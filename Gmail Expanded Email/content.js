const PROCESSED_ATTR = 'data-gmailexpander-processed';

function findClippedLink(messageEl) {
  for (const link of messageEl.querySelectorAll('a')) {
    if (link.textContent.trim() === 'View entire message') {
      return link;
    }
  }
  return null;
}

function injectButton(messageEl, url) {
  const body = messageEl.querySelector('.a3s');
  if (!body) return;

  const btn = document.createElement('div');
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', '0');
  btn.setAttribute('aria-label', 'View full message in new tab');
  btn.textContent = '↗ View full message';

  btn.style.cssText = `
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    margin-bottom: 12px;
    border-radius: 16px;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    user-select: none;
    background: rgba(128, 128, 128, 0.1);
    border: 1px solid rgba(128, 128, 128, 0.3);
    color: inherit;
    transition: background 0.15s;
  `;

  btn.addEventListener('mouseenter', () => {
    btn.style.background = 'rgba(128, 128, 128, 0.2)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'rgba(128, 128, 128, 0.1)';
  });

  const open = () => chrome.runtime.sendMessage({ action: 'openTab', url });
  btn.addEventListener('click', open);
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });

  body.insertBefore(btn, body.firstChild);
}

function processMessages() {
  for (const msg of document.querySelectorAll('div[data-message-id]')) {
    // Skip already-processed messages
    if (msg.hasAttribute(PROCESSED_ATTR)) continue;

    const body = msg.querySelector('.a3s');

    // Skip collapsed messages (no body) and messages whose body hasn't loaded yet
    if (!body || !body.textContent.trim()) continue;

    // Mark processed before injecting so repeated observer firings don't double-inject
    msg.setAttribute(PROCESSED_ATTR, 'true');

    const link = findClippedLink(msg);
    if (link) injectButton(msg, link.href);
  }
}

// Handle direct email links where the message is already open on page load
processMessages();

// Handle all subsequent navigation and dynamic renders within Gmail's SPA
new MutationObserver(processMessages).observe(document.body, {
  childList: true,
  subtree: true,
});
