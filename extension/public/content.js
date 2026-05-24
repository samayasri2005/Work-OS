// content.js - bridges messages between extension popup and the Work OS web app page
// It receives messages from the extension (via chrome.tabs.sendMessage) and forwards them to the page
// It also listens for responses from the page (via window.postMessage) and sends them back to the extension

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Content script received from extension:', msg);
  if (!msg || msg.source !== 'extension') {
    // Not our message
    return false;
  }

  // Forward the message to the page
  window.postMessage(msg, '*');

  // Listen for the page's reply and resolve the original sendResponse
  const handler = (event) => {
    const data = event.data;
    if (!data || data.source !== 'webapp') return;
    // Match the response type to the request type
    if (msg.type === 'REQUEST_AUTH_STATE' && data.type === 'AUTH_STATE') {
      sendResponse(data);
      window.removeEventListener('message', handler);
    } else if (msg.type === 'CAPTURE_LINK' && data.type === 'CAPTURE_ACK') {
      sendResponse(data);
      window.removeEventListener('message', handler);
    } else if (msg.type === 'SIGN_OUT_REQUEST' && data.type === 'SIGN_OUT_ACK') {
      sendResponse(data);
      window.removeEventListener('message', handler);
    }
  };
  window.addEventListener('message', handler);

  // Return true to indicate we will send a response asynchronously
  return true;
});

// Optionally, forward any messages from the page that are not direct responses
// (e.g., auth state changes) to the extension runtime for listeners elsewhere.
window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.source !== 'webapp') return;
  // Forward to extension runtime (may be received by other listeners if needed)
  chrome.runtime.sendMessage(data);
});
