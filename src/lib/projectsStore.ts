/**
 * Projects store — backed by Firebase Firestore.
 * Data is loaded via initProjectsStore(uid) called from AuthContext.
 */

import { useSyncExternalStore } from "react";
import { fetchProjects, saveProject, deleteProject } from "./firestoreData";
import { getActiveWorkspaceId, useActiveWorkspace } from "./workspacesStore";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export type Status = "Idea" | "In Progress" | "Completed" | "On Hold";

export interface ProjectLink {
  id: string;
  label: string;
  url: string;
}

export interface ProjectService {
  id: string;
  name: string;
  platform?: string;
  account?: string;
  dashboardUrl?: string;
  notes?: string;
}

export interface ProjectAccount {
  id: string;
  email: string;
  platform: string;
  label?: string;
  notes?: string;
}

export interface ProjectDeployment {
  id: string;
  url: string;
  tag: "prod" | "staging" | "test";
  method: "GitHub" | "Manual";
}

export interface ProjectCommand {
  id: string;
  label?: string;
  command: string;
  category?: string;
}

export interface ProjectEnvVar {
  id: string;
  key: string;
  value: string;
  env: "dev" | "prod";
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: Status;
  stack: string[];
  github?: string;
  live?: string;
  /** Schema account ID that owns this project */
  account?: string;
  links: ProjectLink[];
  services: ProjectService[];
  accounts: ProjectAccount[];
  deployments: ProjectDeployment[];
  commands: ProjectCommand[];
  env: ProjectEnvVar[];
  notes: string;
  setup: string;
  updatedAt: number;
}

export const emptyProject = (): Project => ({
  id: uid(),
  workspaceId: getActiveWorkspaceId(),
  name: "",
  description: "",
  status: "In Progress",
  stack: [],
  github: "",
  live: "",
  links: [],
  services: [],
  accounts: [],
  deployments: [],
  commands: [],
  env: [],
  notes: "",
  setup: "",
  updatedAt: Date.now(),
});

let projects: Project[] = [];
let currentUid: string | null = null;

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const emit = () => listeners.forEach((cb) => cb());

const setProjects = (next: Project[]) => {
  projects = next;
  emit();
};

/** Called by AuthContext when a user signs in. Loads projects from Firestore. */
export const initProjectsStore = async (uid: string): Promise<void> => {
  currentUid = uid;
  try {
    const loaded = await fetchProjects(uid);
    setProjects(loaded);
  } catch (err) {
    console.error("Failed to load projects from Firestore:", err);
  }
};

/** Called by AuthContext when a user signs out. Clears in-memory state. */
export const clearProjectsStore = (): void => {
  currentUid = null;
  setProjects([]);
};

export const useProjects = () => {
  const activeWsId = useActiveWorkspace();
  const allProjects = useSyncExternalStore(
    subscribe,
    () => projects,
    () => projects,
  );
  return allProjects.filter((p) => p.workspaceId === activeWsId || (!p.workspaceId && activeWsId === "work-main"));
};

export const useProject = (id: string | undefined) => {
  const list = useProjects();
  return id ? list.find((p) => p.id === id) ?? null : null;
};

export const projectsApi = {
  upsert(p: Project) {
    const wsId = getActiveWorkspaceId();
    const updated = { ...p, workspaceId: p.workspaceId || wsId, updatedAt: Date.now() };
    const exists = projects.some((x) => x.id === p.id);
    setProjects(
      exists
        ? projects.map((x) => (x.id === p.id ? updated : x))
        : [updated, ...projects],
    );
    if (currentUid) saveProject(currentUid, updated).catch(console.error);
  },
  remove(id: string) {
    setProjects(projects.filter((p) => p.id !== id));
    if (currentUid) deleteProject(currentUid, id).catch(console.error);
  },
  patch(id: string, patch: Partial<Project>) {
    const updated = projects.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p
    );
    setProjects(updated);
    const project = updated.find((p) => p.id === id);
    if (currentUid && project) saveProject(currentUid, project).catch(console.error);
  },
  newId: uid,
};
