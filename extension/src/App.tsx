import { useEffect, useState } from "react";
import { LogOut, Check, Loader2, Bookmark } from "lucide-react";

// Extension UI uses chrome.runtime messaging to communicate with the content script which forwards to the Work OS page.

export default function App() {
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState<string | null>(null);
  const [captureStatus, setCaptureStatus] = useState<string>("");

  // Helper to send a message via chrome.tabs messaging to the active tab
  const sendRuntimeMessage = (msg: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Get the active tab in the current window
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        const tab = tabs[0];
        if (!tab?.id) {
          reject(new Error('No active tab found'));
          return;
        }
        // Send the message to the content script in the active tab
        chrome.tabs.sendMessage(tab.id, msg, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });
    });
  };

  // Request auth state from the web app via the content script bridge
  const requestAuthState = async () => {
    try {
      const resp: any = await sendRuntimeMessage({ source: "extension", type: "REQUEST_AUTH_STATE" });
      if (resp?.source === "webapp" && resp?.type === "AUTH_STATE" && resp?.payload?.uid) {
        setAuthUser(resp.payload.uid);
        chrome.storage.local.set({ authUser: resp.payload.uid });
        // Optionally inform the page that auth is established
        await sendRuntimeMessage({ source: "extension", type: "AUTH_STATE_CONFIRMED", payload: { uid: resp.payload.uid } });
      } else {
        setAuthUser(null);
      }
    } catch (e) {
      console.error("Failed to get auth state", e);
      setAuthUser(null);
    }
  };

  // Capture the current page URL and title via the content script bridge
  const handleCapture = async () => {
    if (!authUser) {
      setCaptureStatus("Not authenticated");
      return;
    }
    setLoading(true);
    setCaptureStatus("");
    try {
      const payload = {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        uid: authUser,
      };
      const resp: any = await sendRuntimeMessage({ source: "extension", type: "CAPTURE_LINK", payload });
      if (resp?.source === "webapp" && resp?.type === "CAPTURE_ACK") {
        setCaptureStatus("Saved!");
      } else {
        setCaptureStatus("Failed to save");
      }
    } catch (e) {
      console.error(e);
      setCaptureStatus("Error");
    } finally {
      setLoading(false);
    }
  };

  // On mount, request auth state and listen for auth updates from the page
  useEffect(() => {
    requestAuthState();
    const listener = (event: MessageEvent) => {
      const data = event.data;
      if (data?.source === "webapp" && data?.type === "AUTH_STATE") {
        setAuthUser(data.payload?.uid ?? null);
        chrome.storage.local.set({ authUser: data.payload?.uid ?? null });
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Work OS Capture</h1>
      {authUser ? (
        <div className="flex flex-col items-center">
          <p className="mb-2">Signed in as {authUser}</p>
          <button
            onClick={handleCapture}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded mb-2"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
            <span>{loading ? "Saving..." : "Save to Work OS"}</span>
          </button>
          {captureStatus && <p className="mt-2 text-sm">{captureStatus}</p>}
          <button
            onClick={() => {
              sendRuntimeMessage({ source: "extension", type: "SIGN_OUT_REQUEST" })
                .catch(() => {})
                .finally(() => {
                  setAuthUser(null);
                  chrome.storage.local.remove(["authUser"]);
                });
            }}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-5 text-white font-bold py-1 px-3 rounded mt-4"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="mb-2">You need to be signed in to the Work OS web app.</p>
          <button
            onClick={() => {
              chrome.tabs.create({ url: "https://work-os-sooty.vercel.app" });
            }}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-5 text-white font-bold py-1 px-3 rounded"
          >
            <Check className="w-4 h-4" />
            <span>Open Work OS</span>
          </button>
        </div>
      )}
    </div>
  );
}
