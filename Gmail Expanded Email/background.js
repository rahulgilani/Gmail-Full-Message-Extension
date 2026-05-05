chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'openTab') {
    chrome.tabs.create({ url: message.url, active: true });
  }
});
