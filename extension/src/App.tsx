import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { LogIn, LogOut, Check, Loader2, Bookmark } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Capture State
  const [tabInfo, setTabInfo] = useState<{ title: string; url: string } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (user && typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        if (tabs[0]) {
          setTabInfo({ title: tabs[0].title || "", url: tabs[0].url || "" });
        }
      });
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError(err.message || "Failed to log in.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleCapture = async () => {
    if (!user || !tabInfo) return;
    setIsCapturing(true);
    try {
      const id = crypto.randomUUID();
      const payload = {
        id,
        userId: user.uid,
        kind: "link",
        title: tabInfo.title,
        url: tabInfo.url,
        createdAt: Date.now(),
      };
      
      await setDoc(doc(collection(db, "wrk_captures"), id), payload);
      setCaptureSuccess(true);
      setTimeout(() => {
        window.close(); // Close the popup after success
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to save capture.");
    } finally {
      setIsCapturing(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="w-80 h-48 bg-background flex items-center justify-center dark">
        <Loader2 className="animate-spin text-primary h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="w-80 min-h-[280px] bg-background text-foreground flex flex-col font-sans dark">
      {/* Header */}
      <div className="border-b border-border/40 px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-primary" />
          <h1 className="font-semibold text-sm">Work OS Capture</h1>
        </div>
        {user && (
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        {!user ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-3 flex-1 justify-center">
            <p className="text-xs text-muted-foreground mb-1">Sign in to save links to your workspace.</p>
            {loginError && <p className="text-[10px] text-red-500">{loginError}</p>}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              required
            />
            <button
              type="submit"
              disabled={isLoggingIn}
              className="mt-1 bg-primary text-primary-foreground font-medium text-sm py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isLoggingIn ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <LogIn className="h-3.5 w-3.5" />}
              Sign In
            </button>
          </form>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Current Page</p>
              {tabInfo ? (
                <div className="bg-muted/30 border border-border/50 rounded-lg p-3">
                  <p className="text-sm font-medium line-clamp-2 leading-tight mb-1">{tabInfo.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{tabInfo.url}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Loading tab info...</p>
              )}
            </div>
            
            <button
              onClick={handleCapture}
              disabled={isCapturing || captureSuccess || !tabInfo}
              className={`mt-4 font-medium text-sm py-2.5 rounded-md transition-all flex justify-center items-center gap-2
                ${captureSuccess ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'}
                disabled:opacity-70`}
            >
              {isCapturing ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : captureSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  Save to Work OS
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
