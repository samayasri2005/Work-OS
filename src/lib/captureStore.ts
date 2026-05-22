/**
 * Quick Capture store — backed by Firebase Firestore.
 * Data is loaded via initCaptureStore(uid) called from AuthContext.
 */

import { useSyncExternalStore } from "react";
import { fetchCaptures, saveCapture, updateCapture, deleteCapture } from "./firestoreData";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export type CaptureKind = "idea" | "note" | "link" | "command";

export interface CaptureItem {
  id: string;
  kind: CaptureKind;
  title: string;
  body?: string;
  url?: string;
  command?: string;
  createdAt: number;
  promoted?: boolean;
}

let items: CaptureItem[] = [];
let currentUid: string | null = null;

const listeners = new Set<() => void>();
const sub = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const emit = () => listeners.forEach((cb) => cb());
const set = (next: CaptureItem[]) => {
  items = next;
  emit();
};

/** Called by AuthContext when a user signs in. Loads captures from Firestore. */
export const initCaptureStore = async (uid: string): Promise<void> => {
  currentUid = uid;
  try {
    const loaded = await fetchCaptures(uid);
    // Sort by createdAt descending
    set(loaded.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    console.error("Failed to load captures from Firestore:", err);
  }
};

/** Called by AuthContext when a user signs out. Clears in-memory state. */
export const clearCaptureStore = (): void => {
  currentUid = null;
  set([]);
};

export const useCaptures = () =>
  useSyncExternalStore(sub, () => items, () => items);

export const captureApi = {
  add(item: Omit<CaptureItem, "id" | "createdAt">) {
    const newItem: CaptureItem = { ...item, id: uid(), createdAt: Date.now() };
    set([newItem, ...items]);
    if (currentUid) saveCapture(currentUid, newItem).catch(console.error);
  },
  remove(id: string) {
    set(items.filter((i) => i.id !== id));
    if (currentUid) deleteCapture(currentUid, id).catch(console.error);
  },
  markPromoted(id: string) {
    set(items.map((i) => (i.id === id ? { ...i, promoted: true } : i)));
    if (currentUid) updateCapture(currentUid, id, { promoted: true }).catch(console.error);
  },
};
