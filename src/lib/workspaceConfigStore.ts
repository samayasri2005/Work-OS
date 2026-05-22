/**
 * Workspace Config store — backed by Firebase Firestore.
 * Stores UI configuration (section visibility, link categories, command categories).
 * Config is loaded via initWorkspaceConfigStore(uid) called from AuthContext.
 */

import { useSyncExternalStore } from "react";
import { fetchWorkspaceConfig, saveWorkspaceConfig } from "./firestoreData";

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export interface ConfigSection {
  id: string;
  key: string;
  name: string;
  enabled: boolean;
  custom?: boolean;
  fields?: { name: string; label: string; enabled: boolean }[];
}

export interface LinksCategory {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface CommandCategory {
  id: string;
  name: string;
  enabled: boolean;
}

export interface WorkspaceConfig {
  project: {
    sections: ConfigSection[];
  };
  task: {
    folders: boolean;
    tags: boolean;
    priorities: boolean;
    reminders: boolean;
  };
  links: {
    categories: LinksCategory[];
  };
  command: {
    categories: CommandCategory[];
  };
}

const defaultConfig: WorkspaceConfig = {
  project: {
    sections: [
      { id: genId(), key: "overview", name: "Overview", enabled: true,
        fields: [
          { name: "description", label: "Description", enabled: true },
          { name: "stack", label: "Tech Stack", enabled: true },
          { name: "stats", label: "Stat cards", enabled: true },
        ]},
      { id: genId(), key: "deployments", name: "Deployments", enabled: true,
        fields: [
          { name: "url", label: "URL", enabled: true },
          { name: "tag", label: "Environment tag", enabled: true },
          { name: "method", label: "Method", enabled: true },
        ]},
      { id: genId(), key: "services", name: "Services", enabled: true,
        fields: [
          { name: "name", label: "Name", enabled: true },
          { name: "platform", label: "Platform", enabled: true },
          { name: "account", label: "Account", enabled: true },
          { name: "dashboardUrl", label: "URL", enabled: true },
          { name: "notes", label: "Notes", enabled: true },
        ]},
      { id: genId(), key: "accounts", name: "Accounts", enabled: true,
        fields: [
          { name: "email", label: "Email", enabled: true },
          { name: "platform", label: "Platform", enabled: true },
          { name: "label", label: "Label", enabled: true },
          { name: "notes", label: "Notes", enabled: true },
        ]},
      { id: genId(), key: "commands", name: "Commands", enabled: true,
        fields: [
          { name: "label", label: "Label", enabled: true },
          { name: "command", label: "Command", enabled: true },
          { name: "category", label: "Category", enabled: true },
        ]},
      { id: genId(), key: "env", name: "Env", enabled: true,
        fields: [
          { name: "key", label: "Key", enabled: true },
          { name: "value", label: "Value", enabled: true },
          { name: "env", label: "Environment", enabled: true },
        ]},
      { id: genId(), key: "notes", name: "Notes", enabled: true },
      { id: genId(), key: "setup", name: "Setup", enabled: true },
    ],
  },
  task: {
    folders: true,
    tags: true,
    priorities: true,
    reminders: false,
  },
  links: {
    categories: [
      { id: genId(), name: "Dev", isDefault: true },
      { id: genId(), name: "Work" },
      { id: genId(), name: "AI" },
      { id: genId(), name: "Personal" },
    ],
  },
  command: {
    categories: [
      { id: genId(), name: "dev", enabled: true },
      { id: genId(), name: "deploy", enabled: true },
      { id: genId(), name: "db", enabled: true },
      { id: genId(), name: "test", enabled: true },
    ],
  },
};

let config: WorkspaceConfig = defaultConfig;
let currentUid: string | null = null;

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const emit = () => listeners.forEach((cb) => cb());

const setConfig = (next: WorkspaceConfig) => {
  config = next;
  emit();
  if (currentUid) saveWorkspaceConfig(currentUid, next).catch(console.error);
};

/** Called by AuthContext when a user signs in. Loads config from Firestore. */
export const initWorkspaceConfigStore = async (uid: string): Promise<void> => {
  currentUid = uid;
  try {
    const loaded = await fetchWorkspaceConfig(uid);
    if (loaded) {
      config = loaded;
      emit();
    } else {
      await saveWorkspaceConfig(uid, defaultConfig);
    }
  } catch (err) {
    console.error("Failed to load workspace config from Firestore:", err);
  }
};

/** Called by AuthContext when a user signs out. Resets to defaults. */
export const clearWorkspaceConfigStore = (): void => {
  currentUid = null;
  config = defaultConfig;
  emit();
};

export const useWorkspaceConfig = () =>
  useSyncExternalStore(
    subscribe,
    () => config,
    () => config,
  );

const reorder = <T,>(arr: T[], from: number, to: number): T[] => {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export const workspaceConfigApi = {
  toggleSection(id: string) {
    setConfig({
      ...config,
      project: {
        sections: config.project.sections.map((s) =>
          s.id === id ? { ...s, enabled: !s.enabled } : s,
        ),
      },
    });
  },
  renameSection(id: string, name: string) {
    setConfig({
      ...config,
      project: {
        sections: config.project.sections.map((s) => (s.id === id ? { ...s, name } : s)),
      },
    });
  },
  reorderSection(from: number, to: number) {
    setConfig({
      ...config,
      project: { sections: reorder(config.project.sections, from, to) },
    });
  },
  addCustomSection(name: string) {
    if (!name.trim()) return;
    setConfig({
      ...config,
      project: {
        sections: [
          ...config.project.sections,
          {
            id: genId(),
            key: `custom-${genId().slice(0, 6)}`,
            name: name.trim(),
            enabled: true,
            custom: true,
          },
        ],
      },
    });
  },
  removeSection(id: string) {
    const target = config.project.sections.find((s) => s.id === id);
    if (!target?.custom) return;
    setConfig({
      ...config,
      project: { sections: config.project.sections.filter((s) => s.id !== id) },
    });
  },
  toggleField(sectionId: string, fieldName: string) {
    setConfig({
      ...config,
      project: {
        sections: config.project.sections.map((s) =>
          s.id === sectionId && s.fields
            ? {
                ...s,
                fields: s.fields.map((f) =>
                  f.name === fieldName ? { ...f, enabled: !f.enabled } : f,
                ),
              }
            : s,
        ),
      },
    });
  },

  toggleTask(key: keyof WorkspaceConfig["task"]) {
    setConfig({ ...config, task: { ...config.task, [key]: !config.task[key] } });
  },

  addLinkCategory(name: string) {
    if (!name.trim()) return;
    setConfig({
      ...config,
      links: {
        categories: [...config.links.categories, { id: genId(), name: name.trim() }],
      },
    });
  },
  renameLinkCategory(id: string, name: string) {
    setConfig({
      ...config,
      links: {
        categories: config.links.categories.map((c) => (c.id === id ? { ...c, name } : c)),
      },
    });
  },
  removeLinkCategory(id: string) {
    setConfig({
      ...config,
      links: { categories: config.links.categories.filter((c) => c.id !== id) },
    });
  },
  reorderLinkCategory(from: number, to: number) {
    setConfig({
      ...config,
      links: { categories: reorder(config.links.categories, from, to) },
    });
  },
  setDefaultLinkCategory(id: string) {
    setConfig({
      ...config,
      links: {
        categories: config.links.categories.map((c) => ({ ...c, isDefault: c.id === id })),
      },
    });
  },

  addCommandCategory(name: string) {
    if (!name.trim()) return;
    setConfig({
      ...config,
      command: {
        categories: [...config.command.categories, { id: genId(), name: name.trim(), enabled: true }],
      },
    });
  },
  renameCommandCategory(id: string, name: string) {
    setConfig({
      ...config,
      command: {
        categories: config.command.categories.map((c) => (c.id === id ? { ...c, name } : c)),
      },
    });
  },
  toggleCommandCategory(id: string) {
    setConfig({
      ...config,
      command: {
        categories: config.command.categories.map((c) =>
          c.id === id ? { ...c, enabled: !c.enabled } : c,
        ),
      },
    });
  },
  removeCommandCategory(id: string) {
    setConfig({
      ...config,
      command: { categories: config.command.categories.filter((c) => c.id !== id) },
    });
  },
  reorderCommandCategory(from: number, to: number) {
    setConfig({
      ...config,
      command: { categories: reorder(config.command.categories, from, to) },
    });
  },
};
