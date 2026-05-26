import { useEffect, useState } from "react";
import { Check, Loader2, Bookmark } from "lucide-react";

const CATEGORIES = ["Dev", "Design", "Work", "Personal", "Other"];

export default function App() {
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState<string | null>(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("work-main");
  const [captureStatus, setCaptureStatus] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("Initializing...");

  // Form states
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Dev");
  const [saveType, setSaveType] = useState<"link" | "capture">("link");

  // Load current page details on mount
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs?.[0]) {
        // Pre-fill fields but make sure we don't pre-fill extension settings pages
        const tab = tabs[0];
        if (tab.url && !tab.url.startsWith("chrome://")) {
          setName(tab.title || "");
          setUrl(tab.url || "");
        }
      }
    });
  }, []);

  // Helper to find all tabs running the Work OS web app
  const getWorkOSTabs = (): Promise<chrome.tabs.Tab[]> => {
    return new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        if (chrome.runtime.lastError || !tabs) {
          resolve([]);
          return;
        }
        const matching = tabs.filter(t => 
          t.id && t.url && (t.url.includes("work-os-sooty.vercel.app") || t.url.includes("localhost:3000"))
        );
        resolve(matching);
      });
    });
  };

  // Helper to send a message via chrome.tabs messaging to a Work OS tab (creates background tab if none open)
  const sendRuntimeMessage = async (msg: any): Promise<any> => {
    let tabs = await getWorkOSTabs();
    let tempTabId: number | null = null;

    if (tabs.length === 0) {
      setDebugInfo("No open tab found. Launching a background bridge tab...");
      const newTab = await new Promise<chrome.tabs.Tab>((resolve, reject) => {
        chrome.tabs.create({ url: "https://work-os-sooty.vercel.app", active: false }, (t) => {
          if (chrome.runtime.lastError || !t) {
            reject(new Error("Failed to open background Work OS tab"));
          } else {
            resolve(t);
          }
        });
      });

      tempTabId = newTab.id || null;

      // Wait for the tab to finish loading
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(listener);
          reject(new Error("Timeout waiting for background tab to load"));
        }, 10000); // 10s timeout

        const listener = (tabId: number, changeInfo: any) => {
          if (tabId === tempTabId && changeInfo.status === "complete") {
            clearTimeout(timeout);
            chrome.tabs.onUpdated.removeListener(listener);
            // Brief pause for react to initialize listeners
            setTimeout(resolve, 2000);
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });

      // Refresh list of tabs to find our newly opened one
      tabs = await getWorkOSTabs();
    }

    setDebugInfo(`Attempting connection to ${tabs.length} Work OS tab(s)...`);
    let lastError = null;

    for (const tab of tabs) {
      try {
        const response = await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(tab.id!, msg, (resp) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(resp);
            }
          });
        });

        // Clean up temporary tab if created
        if (tempTabId !== null) {
          chrome.tabs.remove(tempTabId);
        }

        setDebugInfo(`Successfully completed operation via Work OS tab: ${tab.url}`);
        return response;
      } catch (err: any) {
        console.warn(`Failed to message tab ${tab.id}:`, err.message);
        lastError = err;
      }
    }

    // Clean up temporary tab if created and failed
    if (tempTabId !== null) {
      chrome.tabs.remove(tempTabId);
    }

    throw new Error(lastError?.message || "Could not connect to Work OS. Please sign in to the web app.");
  };

  // Request auth state from the web app via the content script bridge
  const requestAuthState = async () => {
    setErrorMsg(null);
    try {
      const resp: any = await sendRuntimeMessage({ source: "extension", type: "GET_AUTH_STATE" });
      if (resp?.source === "webapp" && resp?.response?.uid) {
        setAuthUser(resp.response.uid);
        const wsId = resp.response.activeWorkspaceId || "work-main";
        setActiveWorkspaceId(wsId);
        chrome.storage.local.set({ authUser: resp.response.uid, activeWorkspaceId: wsId });
        setDebugInfo("Auth state successfully fetched: " + resp.response.uid);
      } else {
        setAuthUser(null);
        setDebugInfo("Fetched auth state but no active user found in webapp");
      }
    } catch (e: any) {
      console.warn("Failed to get auth state", e.message);
      setErrorMsg(e.message);
      // Try to fallback to stored user
      chrome.storage.local.get(["authUser", "activeWorkspaceId"], (result: any) => {
        if (result && result.authUser) {
          setAuthUser(result.authUser);
          setActiveWorkspaceId(result.activeWorkspaceId || "work-main");
          setDebugInfo("Loaded auth user from local storage backup: " + result.authUser);
          setErrorMsg(null); // Clear error because we have a cached login
        } else {
          setAuthUser(null);
          setDebugInfo("No cached user in storage fallback");
        }
      });
    }
  };

  // Capture the current page URL and title via the content script bridge
  const handleSave = async () => {
    if (!authUser) {
      setCaptureStatus("Not authenticated");
      return;
    }
    if (!name.trim() || !url.trim()) {
      setCaptureStatus("Name and URL are required");
      return;
    }

    setLoading(true);
    setCaptureStatus("");
    setErrorMsg(null);
    try {
      let resp: any;
      if (saveType === "link") {
        const payload = {
          name: name.trim(),
          url: url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`,
          category,
          workspaceId: activeWorkspaceId,
        };
        resp = await sendRuntimeMessage({ source: "extension", type: "SAVE_LINK", payload });
      } else {
        const payload = {
          title: name.trim(),
          url: url.trim(),
        };
        resp = await sendRuntimeMessage({ source: "extension", type: "SAVE_CAPTURE", payload });
      }

      if (resp?.source === "webapp" && resp?.response?.success) {
        setCaptureStatus("Saved successfully!");
      } else {
        setCaptureStatus(resp?.error || "Failed to save");
      }
    } catch (e: any) {
      console.error(e);
      setCaptureStatus(e.message || "Error");
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  // On mount, request auth state and listen for auth updates from the page
  useEffect(() => {
    requestAuthState();
    const listener = (msg: any) => {
      if (msg?.source === "webapp" && msg?.type === "AUTH_STATE") {
        setAuthUser(msg.payload?.uid ?? null);
        chrome.storage.local.set({ authUser: msg.payload?.uid ?? null });
        setDebugInfo("Auth state updated from runtime message: " + (msg.payload?.uid ?? "null"));
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return (
    <div className="flex flex-col items-stretch justify-start min-h-[420px] w-[320px] bg-gray-950 text-white p-4">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Work OS Capture
        </h1>
        {authUser && (
          <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
            Linked
          </span>
        )}
      </div>

      {authUser ? (
        <div className="flex flex-col gap-3 flex-1">
          {/* Save Type Switcher */}
          <div className="flex bg-gray-900 p-0.5 rounded-lg border border-gray-800">
            <button
              onClick={() => setSaveType("link")}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                saveType === "link" ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
              }`}
            >
              Links Space
            </button>
            <button
              onClick={() => setSaveType("capture")}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                saveType === "capture" ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
              }`}
            >
              Quick Capture
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Google Docs"
              className="text-xs bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 outline-none focus:border-blue-500 text-white w-full"
            />

            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="text-xs bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 outline-none focus:border-blue-500 text-white w-full"
            />

            {saveType === "link" && (
              <>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-xs bg-gray-900 border border-gray-800 rounded px-2 py-1.5 outline-none focus:border-blue-500 text-white w-full"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2 px-4 rounded mt-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            <span className="text-xs">{loading ? "Saving..." : `Save to ${saveType === "link" ? "Links" : "Captures"}`}</span>
          </button>

          {captureStatus && (
            <p className={`text-center text-xs font-semibold py-1 rounded ${
              captureStatus.includes("successfully") ? "text-green-400 bg-green-950/20" : "text-yellow-400 bg-yellow-950/20"
            }`}>
              {captureStatus}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-900">
            <span className="text-[9px] text-gray-500 truncate max-w-[150px]">
              Workspace: {activeWorkspaceId}
            </span>
            <button
              onClick={() => {
                setAuthUser(null);
                chrome.storage.local.clear();
              }}
              className="text-[9px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
            >
              Sign Out (Local)
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 py-6">
          <p className="mb-4 text-center text-xs text-gray-400 leading-relaxed">
            Please log in to your Work OS web app to link your account.
          </p>
          <button
            onClick={() => {
              chrome.tabs.create({ url: "https://work-os-sooty.vercel.app" });
            }}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2 px-4 rounded w-full transition-all cursor-pointer shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span className="text-xs">Log In to Work OS</span>
          </button>
          <button
            onClick={requestAuthState}
            className="text-[10px] text-blue-400 underline cursor-pointer hover:text-blue-300 mt-4"
          >
            Check status again
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 p-2 bg-red-950/40 border border-red-900/50 rounded text-[10px] text-red-300 w-full break-all">
          <strong>Bridge Status:</strong> {errorMsg}
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-gray-900 text-[9px] text-gray-600 w-full break-all">
        <strong>Status Info:</strong> {debugInfo}
      </div>
    </div>
  );
}
