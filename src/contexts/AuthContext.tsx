import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
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
