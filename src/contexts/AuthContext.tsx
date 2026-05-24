import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import {
  ensureUserProfile,
  getUserProfile,
  type UserProfile,
} from "@/lib/userProfile";
import { initProjectsStore, clearProjectsStore } from "@/lib/projectsStore";
import { initCaptureStore, clearCaptureStore } from "@/lib/captureStore";
import { initSchemaStore, clearSchemaStore } from "@/lib/schemaStore";
import { initWorkspaceConfigStore, clearWorkspaceConfigStore } from "@/lib/workspaceConfigStore";
import { initWorkspacesStore, clearWorkspacesStore } from "@/lib/workspacesStore";

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    const profile = await getUserProfile(auth.currentUser.uid);
    setUserProfile(profile);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setUserProfile(null);
        // Clear all stores on sign-out
        clearProjectsStore();
        clearCaptureStore();
        clearSchemaStore();
        clearWorkspaceConfigStore();
        clearWorkspacesStore();
        setLoading(false);
        return;
      }

      try {
        const profile = await ensureUserProfile(nextUser);
        setUserProfile(profile);
        // Load all data from Firestore for this user
        await Promise.all([
          initProjectsStore(nextUser.uid),
          initCaptureStore(nextUser.uid),
          initSchemaStore(nextUser.uid),
          initWorkspaceConfigStore(nextUser.uid),
          initWorkspacesStore(nextUser.uid),
        ]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Web‑App Auth Bridge: listen for messages from the Chrome extension
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Only accept messages from the same window (the page) sent by the extension
      if (event.source !== window) return;
      const data = (event as any).data;
      if (!data || data.source !== 'extension') return;

      console.log('Extension bridge received message', data);
      const { type, id, payload } = data;
      if (type === 'GET_AUTH_STATE') {
        const user = auth.currentUser;
        const response = { uid: user?.uid || null, email: user?.email || null };
        window.postMessage({ source: 'webapp', replyTo: id, response }, '*');
      } else if (type === 'SAVE_CAPTURE') {
        if (!auth.currentUser) {
          window.postMessage({ source: 'webapp', replyTo: id, error: 'Not authenticated' }, '*');
          return;
        }
        const { title, url } = payload;
        const captureId = crypto.randomUUID();
        try {
          await setDoc(doc(collection(db, 'wrk_captures'), captureId), {
            id: captureId,
            userId: auth.currentUser!.uid,
            kind: 'link',
            title,
            url,
            createdAt: Date.now(),
          });
          window.postMessage({ source: 'webapp', replyTo: id, response: { success: true } }, '*');
        } catch (e) {
          console.error('Failed to save capture via bridge', e);
          window.postMessage({ source: 'webapp', replyTo: id, error: String(e) }, '*');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);


  const signOut = async () => {
    clearProjectsStore();
    clearCaptureStore();
    clearSchemaStore();
    clearWorkspaceConfigStore();
    clearWorkspacesStore();
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
