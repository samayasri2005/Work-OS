/**
 * Workspaces store for Work OS — backed by Firebase Firestore.
 * Workspaces scope all data (tasks, projects, notes, links) in Work OS.
 *
 * Stored under wrk_workspaces flat collection.
 * Active workspace preference stored under wrk_workspaceConfig flat collection (doc ID = user uid).
 */

import { useSyncExternalStore } from "react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Workspace {
  id: string;
  userId?: string;
  name: string;
  emoji: string;
  createdAt: number;
}

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const DEFAULT_WORKSPACES: Workspace[] = [
  { id: "work-main", name: "Work", emoji: "💼", createdAt: Date.now() },
  { id: "clients", name: "Clients", emoji: "🤝", createdAt: Date.now() },
  { id: "personal-projects", name: "Side Projects", emoji: "🚀", createdAt: Date.now() },
];

// ── Firestore helpers ──────────────────────────────────────────────────────

const fsLoadWorkspaces = async (uid: string): Promise<Workspace[]> => {
  const q = query(collection(db, "wrk_workspaces"), where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Workspace);
};

const fsSaveWorkspace = async (uid: string, ws: Workspace): Promise<void> => {
  await setDoc(doc(db, "wrk_workspaces", ws.id), { ...ws, userId: uid });
};

const fsDeleteWorkspace = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, "wrk_workspaces", id));
};

const fsLoadActiveWorkspace = async (uid: string): Promise<string | null> => {
  const snap = await getDoc(doc(db, "wrk_workspaceConfig", uid));
  return snap.exists() ? (snap.data()?.activeWorkspaceId ?? null) : null;
};

const fsSaveActiveWorkspace = async (uid: string, id: string): Promise<void> => {
  await setDoc(doc(db, "wrk_workspaceConfig", uid), { activeWorkspaceId: id }, { merge: true });
};

// ── In-memory state ────────────────────────────────────────────────────────

let workspaces: Workspace[] = [];
let activeWorkspaceId: string = "";
let currentUid: string | null = null;

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };
const emit = () => listeners.forEach((cb) => cb());

const setState = (ws: Workspace[], active: string) => {
  workspaces = ws;
  activeWorkspaceId = active;
  emit();
};

// ── Public init/clear ──────────────────────────────────────────────────────

export const initWorkspacesStore = async (uid: string): Promise<void> => {
  currentUid = uid;
  try {
    let [loaded, savedActive] = await Promise.all([
      fsLoadWorkspaces(uid),
      fsLoadActiveWorkspace(uid),
    ]);

    if (loaded.length === 0) {
      // First-time user — seed defaults
      for (const ws of DEFAULT_WORKSPACES) {
        await fsSaveWorkspace(uid, ws);
      }
      loaded = DEFAULT_WORKSPACES;
    }

    const active = savedActive && loaded.find((w) => w.id === savedActive)
      ? savedActive
      : loaded[0].id;

    setState(loaded, active);
  } catch (err) {
    console.error("Failed to load workspaces:", err);
  }
};

export const clearWorkspacesStore = (): void => {
  currentUid = null;
  setState([], "");
};

// ── Hooks ──────────────────────────────────────────────────────────────────

export const useWorkspaces = () =>
  useSyncExternalStore(subscribe, () => workspaces, () => workspaces);

export const useActiveWorkspace = () =>
  useSyncExternalStore(subscribe, () => activeWorkspaceId, () => activeWorkspaceId);

export const getActiveWorkspaceId = () => activeWorkspaceId;

// ── API ────────────────────────────────────────────────────────────────────

export const workspacesApi = {
  setActive(id: string) {
    if (!workspaces.find((w) => w.id === id)) return;
    activeWorkspaceId = id;
    emit();
    if (currentUid) fsSaveActiveWorkspace(currentUid, id).catch(console.error);
  },

  add(name: string, emoji = "📁") {
    const ws: Workspace = { id: genId(), name: name.trim(), emoji, createdAt: Date.now() };
    workspaces = [...workspaces, ws];
    if (!activeWorkspaceId) activeWorkspaceId = ws.id;
    emit();
    if (currentUid) fsSaveWorkspace(currentUid, ws).catch(console.error);
    return ws;
  },

  rename(id: string, name: string, emoji?: string) {
    workspaces = workspaces.map((w) =>
      w.id === id ? { ...w, name: name.trim(), emoji: emoji ?? w.emoji } : w
    );
    emit();
    const ws = workspaces.find((w) => w.id === id);
    if (currentUid && ws) fsSaveWorkspace(currentUid, ws).catch(console.error);
  },

  remove(id: string) {
    if (workspaces.length <= 1) return; // always keep at least one
    workspaces = workspaces.filter((w) => w.id !== id);
    if (activeWorkspaceId === id) {
      activeWorkspaceId = workspaces[0].id;
      if (currentUid) fsSaveActiveWorkspace(currentUid, activeWorkspaceId).catch(console.error);
    }
    emit();
    if (currentUid) fsDeleteWorkspace(currentUid, id).catch(console.error);
  },
};
