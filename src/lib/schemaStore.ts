/**
 * Schema Builder store — backed by Firebase Firestore.
 * Defines the shape of Projects, Links, Tasks, Commands.
 * Schema is loaded via initSchemaStore(uid) called from AuthContext.
 */

import { useSyncExternalStore } from "react";
import { fetchSchema, saveSchema } from "./firestoreData";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "url"
  | "tags"
  | "reference";

export interface SchemaField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  referenceTo?: "account";
  builtin?: boolean;
  enabled: boolean;
}

export interface ProjectStatus {
  id: string;
  name: string;
  color: StatusColor;
}

export type StatusColor =
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "muted"
  | "secondary";

export const STATUS_COLORS: { id: StatusColor; label: string; className: string }[] = [
  { id: "primary", label: "Blue", className: "bg-primary text-primary-foreground" },
  { id: "success", label: "Green", className: "bg-success text-success-foreground" },
  { id: "warning", label: "Amber", className: "bg-warning text-warning-foreground" },
  { id: "destructive", label: "Red", className: "bg-destructive text-destructive-foreground" },
  { id: "secondary", label: "Slate", className: "bg-secondary text-secondary-foreground" },
  { id: "muted", label: "Muted", className: "bg-muted text-muted-foreground" },
];

export interface SchemaAccount {
  id: string;
  email: string;
  label: string;
}

export interface Schema {
  projects: {
    statuses: ProjectStatus[];
    fields: SchemaField[];
    accounts: SchemaAccount[];
  };
  links: {
    fields: SchemaField[];
  };
  tasks: {
    folders: boolean;
    tags: boolean;
    priority: boolean;
    fields: SchemaField[];
  };
  commands: {
    categories: string[];
    fields: SchemaField[];
  };
}

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const f = (
  name: string,
  type: FieldType,
  opts: Partial<SchemaField> = {},
): SchemaField => ({
  id: genId(),
  name,
  type,
  required: false,
  enabled: true,
  builtin: true,
  ...opts,
});

const defaultSchema: Schema = {
  projects: {
    statuses: [
      { id: genId(), name: "Idea", color: "muted" },
      { id: genId(), name: "In Progress", color: "primary" },
      { id: genId(), name: "Completed", color: "success" },
      { id: genId(), name: "On Hold", color: "warning" },
    ],
    fields: [
      f("Name", "text", { required: true }),
      f("Description", "textarea"),
      f("Status", "select"),
      f("Tech Stack", "tags"),
      f("GitHub", "url"),
      f("Live URL", "url"),
      f("Account", "reference", { referenceTo: "account" }),
    ],
    accounts: [
      { id: genId(), email: "[email protected]", label: "Personal" },
      { id: genId(), email: "[email protected]", label: "Work" },
    ],
  },
  links: {
    fields: [
      f("Title", "text", { required: true }),
      f("URL", "url", { required: true }),
      f("Category", "select", { options: ["Dev", "Design", "Work", "Personal"] }),
      f("Platform", "text"),
      f("Tags", "tags"),
    ],
  },
  tasks: {
    folders: true,
    tags: true,
    priority: true,
    fields: [
      f("Title", "text", { required: true }),
      f("Notes", "textarea"),
    ],
  },
  commands: {
    categories: ["dev", "deploy", "db", "test"],
    fields: [
      f("Label", "text", { required: true }),
      f("Command", "text", { required: true }),
      f("Category", "select"),
      f("Tags", "tags"),
    ],
  },
};

let schema: Schema = defaultSchema;
let currentUid: string | null = null;

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const emit = () => listeners.forEach((cb) => cb());

const setSchema = (next: Schema) => {
  schema = next;
  emit();
  // Persist to Firestore
  if (currentUid) saveSchema(currentUid, next).catch(console.error);
};

/** Called by AuthContext when a user signs in. Loads schema from Firestore. */
export const initSchemaStore = async (uid: string): Promise<void> => {
  currentUid = uid;
  try {
    const loaded = await fetchSchema(uid);
    if (loaded) {
      schema = loaded;
      emit();
    } else {
      // First time — save the default schema to Firestore
      await saveSchema(uid, defaultSchema);
    }
  } catch (err) {
    console.error("Failed to load schema from Firestore:", err);
  }
};

/** Called by AuthContext when a user signs out. Resets to defaults. */
export const clearSchemaStore = (): void => {
  currentUid = null;
  schema = defaultSchema;
  emit();
};

export const useSchema = () =>
  useSyncExternalStore(
    subscribe,
    () => schema,
    () => schema,
  );

const reorder = <T,>(arr: T[], from: number, to: number): T[] => {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

type Entity = "projects" | "links" | "tasks" | "commands";

const updateFields = (entity: Entity, mut: (fields: SchemaField[]) => SchemaField[]) => {
  const e = schema[entity];
  setSchema({ ...schema, [entity]: { ...e, fields: mut(e.fields) } });
};

export const schemaApi = {
  addStatus(name: string, color: StatusColor = "muted") {
    if (!name.trim()) return;
    setSchema({
      ...schema,
      projects: {
        ...schema.projects,
        statuses: [...schema.projects.statuses, { id: genId(), name: name.trim(), color }],
      },
    });
  },
  renameStatus(id: string, name: string) {
    setSchema({
      ...schema,
      projects: {
        ...schema.projects,
        statuses: schema.projects.statuses.map((s) => (s.id === id ? { ...s, name } : s)),
      },
    });
  },
  setStatusColor(id: string, color: StatusColor) {
    setSchema({
      ...schema,
      projects: {
        ...schema.projects,
        statuses: schema.projects.statuses.map((s) => (s.id === id ? { ...s, color } : s)),
      },
    });
  },
  reorderStatus(from: number, to: number) {
    setSchema({
      ...schema,
      projects: {
        ...schema.projects,
        statuses: reorder(schema.projects.statuses, from, to),
      },
    });
  },
  removeStatus(id: string) {
    setSchema({
      ...schema,
      projects: {
        ...schema.projects,
        statuses: schema.projects.statuses.filter((s) => s.id !== id),
      },
    });
  },

  addAccount(email: string, label: string) {
    if (!email.trim()) return;
    setSchema({
      ...schema,
      projects: {
        ...schema.projects,
        accounts: [
          ...schema.projects.accounts,
          { id: genId(), email: email.trim(), label: label.trim() || email.trim() },
        ],
      },
    });
  },
  removeAccount(id: string) {
    setSchema({
      ...schema,
      projects: {
        ...schema.projects,
        accounts: schema.projects.accounts.filter((a) => a.id !== id),
      },
    });
  },
  patchAccount(id: string, patch: Partial<SchemaAccount>) {
    setSchema({
      ...schema,
      projects: {
        ...schema.projects,
        accounts: schema.projects.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      },
    });
  },

  addField(entity: Entity, name: string, type: FieldType) {
    if (!name.trim()) return;
    updateFields(entity, (fs) => [
      ...fs,
      { id: genId(), name: name.trim(), type, required: false, enabled: true, builtin: false },
    ]);
  },
  removeField(entity: Entity, id: string) {
    updateFields(entity, (fs) => fs.filter((f) => f.id !== id || f.builtin));
  },
  patchField(entity: Entity, id: string, patch: Partial<SchemaField>) {
    updateFields(entity, (fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  },
  reorderField(entity: Entity, from: number, to: number) {
    updateFields(entity, (fs) => reorder(fs, from, to));
  },

  toggleTaskFeature(key: "folders" | "tags" | "priority") {
    setSchema({
      ...schema,
      tasks: { ...schema.tasks, [key]: !schema.tasks[key] },
    });
  },

  addCommandCategory(name: string) {
    if (!name.trim()) return;
    setSchema({
      ...schema,
      commands: {
        ...schema.commands,
        categories: [...schema.commands.categories, name.trim()],
      },
    });
  },
  removeCommandCategory(name: string) {
    setSchema({
      ...schema,
      commands: {
        ...schema.commands,
        categories: schema.commands.categories.filter((c) => c !== name),
      },
    });
  },
};

export const visibleFields = (fields: SchemaField[]) =>
  fields.filter((f) => f.enabled);
