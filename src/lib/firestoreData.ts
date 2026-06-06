/**
 * Firestore data layer for Work OS.
 *
 * All data is stored in flat collections prefixed with wrk_:
 *   wrk_projects          — Project documents
 *   wrk_captures          — Quick capture items
 *   wrk_notes             — Standalone notes
 *   wrk_links             — Link shortcuts
 *   wrk_schema            — Single doc per user (doc ID = user.uid)
 *   wrk_workspaceConfig   — Single doc per user (doc ID = user.uid)
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Project } from "./projectsStore";
import type { CaptureItem } from "./captureStore";
import type { Schema } from "./schemaStore";
import type { WorkspaceConfig } from "./workspaceConfigStore";

// ── Projects ───────────────────────────────────────────────────────────────

export const fetchProjects = async (uid: string): Promise<Project[]> => {
  const q = query(collection(db, "wrk_projects"), where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Project);
};

export const saveProject = async (uid: string, project: Project): Promise<void> => {
  await setDoc(doc(db, "wrk_projects", project.id), { ...project, userId: uid });
};

export const deleteProject = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, "wrk_projects", id));
};

// ── Captures ───────────────────────────────────────────────────────────────

export const fetchCaptures = async (uid: string): Promise<CaptureItem[]> => {
  const q = query(collection(db, "wrk_captures"), where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CaptureItem);
};

export const saveCapture = async (uid: string, item: CaptureItem): Promise<void> => {
  await setDoc(doc(db, "wrk_captures", item.id), { ...item, userId: uid });
};

export const updateCapture = async (uid: string, id: string, patch: Partial<CaptureItem>): Promise<void> => {
  await updateDoc(doc(db, "wrk_captures", id), patch as Record<string, unknown>);
};

export const deleteCapture = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, "wrk_captures", id));
};

// ── Tasks ──────────────────────────────────────────────────────────────────

export interface WorkOsTask {
  id: string;
  userId?: string;
  workspaceId: string;
  title: string;
  description?: string;
  done: boolean;
  priority: "high" | "medium" | "low";
  folderId?: string;
  parentId?: string;
  dueDate?: string;
  tags?: string[];
  order?: number;
  recurrence?: string;
  createdAt: number;
}

export const fetchTasks = async (uid: string): Promise<WorkOsTask[]> => {
  const q = query(collection(db, "wrk_tasks"), where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WorkOsTask);
};

export const saveTask = async (uid: string, task: WorkOsTask): Promise<void> => {
  await setDoc(doc(db, "wrk_tasks", task.id), { ...task, userId: uid });
};

export const deleteTask = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, "wrk_tasks", id));
};

// ── Folders ────────────────────────────────────────────────────────────────

export interface WorkOsFolder {
  id: string;
  userId?: string;
  workspaceId: string;
  name: string;
  order: number;
}

export const fetchFolders = async (uid: string): Promise<WorkOsFolder[]> => {
  const q = query(collection(db, "wrk_folders"), where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WorkOsFolder);
};

export const saveFolder = async (uid: string, folder: WorkOsFolder): Promise<void> => {
  await setDoc(doc(db, "wrk_folders", folder.id), { ...folder, userId: uid });
};

export const deleteFolder = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, "wrk_folders", id));
};

// ── Notes ──────────────────────────────────────────────────────────────────

export interface WorkOsNote {
  id: string;
  userId?: string;
  workspaceId?: string;
  title: string;
  body: string;
  updatedAt: string;
  tag: string;
}

export const fetchNotes = async (uid: string): Promise<WorkOsNote[]> => {
  const q = query(collection(db, "wrk_notes"), where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WorkOsNote);
};

export const saveNote = async (uid: string, note: WorkOsNote): Promise<void> => {
  await setDoc(doc(db, "wrk_notes", note.id), { ...note, userId: uid });
};

export const deleteNote = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, "wrk_notes", id));
};

// ── Links ──────────────────────────────────────────────────────────────────

export interface WorkOsLink {
  id: string;
  userId?: string;
  workspaceId?: string;
  name: string;
  url: string;
  category: string;
}

export const fetchLinks = async (uid: string): Promise<WorkOsLink[]> => {
  const q = query(collection(db, "wrk_links"), where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WorkOsLink);
};

export const saveLink = async (uid: string, link: WorkOsLink): Promise<void> => {
  await setDoc(doc(db, "wrk_links", link.id), { ...link, userId: uid });
};

export const deleteLink = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, "wrk_links", id));
};

// ── Schema ─────────────────────────────────────────────────────────────────

export const fetchSchema = async (uid: string): Promise<Schema | null> => {
  const snap = await getDoc(doc(db, "wrk_schema", uid));
  return snap.exists() ? (snap.data() as Schema) : null;
};

export const saveSchema = async (uid: string, schema: Schema): Promise<void> => {
  await setDoc(doc(db, "wrk_schema", uid), schema);
};

// ── Workspace Config ───────────────────────────────────────────────────────

export const fetchWorkspaceConfig = async (uid: string): Promise<WorkspaceConfig | null> => {
  const snap = await getDoc(doc(db, "wrk_workspaceConfig", uid));
  return snap.exists() ? (snap.data() as WorkspaceConfig) : null;
};

export const saveWorkspaceConfig = async (uid: string, config: WorkspaceConfig): Promise<void> => {
  await setDoc(doc(db, "wrk_workspaceConfig", uid), config);
};
