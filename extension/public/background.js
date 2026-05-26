// background.js - Service worker for Chrome extension

// Currently no background logic needed; placeholder for future use.
// Listens for messages from other parts of the extension if needed.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Background received message:', msg);
  // No response needed for now.
  return false;
});
