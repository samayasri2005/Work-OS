import { create } from "zustand";
import { fetchTasks, fetchFolders, saveTask, saveFolder, deleteTask, deleteFolder, WorkOsTask, WorkOsFolder } from "./firestoreData";
import { getActiveWorkspaceId } from "./workspacesStore";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

interface TasksState {
  tasks: WorkOsTask[];
  folders: WorkOsFolder[];
  loading: boolean;
  currentUid: string | null;

  // Init
  initTasksStore: (uid: string) => Promise<void>;
  clearTasksStore: () => void;

  // Tasks
  addTask: (input: Partial<WorkOsTask> & { title: string }) => WorkOsTask;
  updateTask: (id: string, patch: Partial<WorkOsTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskDone: (id: string) => void;

  // Folders
  addFolder: (name: string) => WorkOsFolder;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  folders: [],
  loading: false,
  currentUid: null,

  initTasksStore: async (userId: string) => {
    set({ loading: true, currentUid: userId });
    try {
      const [fetchedTasks, fetchedFolders] = await Promise.all([
        fetchTasks(userId),
        fetchFolders(userId),
      ]);
      set({
        tasks: fetchedTasks,
        folders: fetchedFolders.sort((a, b) => a.order - b.order),
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch tasks/folders", err);
      set({ loading: false });
    }
  },

  clearTasksStore: () => {
    set({ tasks: [], folders: [], currentUid: null });
  },

  addTask: (input) => {
    const wsId = getActiveWorkspaceId();
    const newTask: WorkOsTask = {
      id: uid(),
      workspaceId: wsId,
      done: false,
      priority: "medium",
      createdAt: Date.now(),
      ...input,
    };

    set((state) => ({ tasks: [newTask, ...state.tasks] }));
    const { currentUid } = get();
    if (currentUid) saveTask(currentUid, newTask).catch(console.error);

    return newTask;
  },

  updateTask: (id, patch) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
    const { currentUid, tasks } = get();
    const updated = tasks.find((t) => t.id === id);
    if (currentUid && updated) saveTask(currentUid, updated).catch(console.error);
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id && t.parentId !== id),
    }));
    const { currentUid } = get();
    if (currentUid) deleteTask(currentUid, id).catch(console.error);
    // Note: should ideally recursively delete subtasks in Firestore too, but local deletion filters parentId
  },

  toggleTaskDone: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const nextDone = !task.done;
    get().updateTask(id, { done: nextDone });
  },

  addFolder: (name) => {
    const wsId = getActiveWorkspaceId();
    const folders = get().folders;
    const maxOrder = folders.reduce((max, f) => Math.max(max, f.order), -1);
    
    const newFolder: WorkOsFolder = {
      id: uid(),
      workspaceId: wsId,
      name,
      order: maxOrder + 1,
    };

    set((state) => ({ folders: [...state.folders, newFolder] }));
    const { currentUid } = get();
    if (currentUid) saveFolder(currentUid, newFolder).catch(console.error);

    return newFolder;
  },

  renameFolder: (id, name) => {
    set((state) => ({
      folders: state.folders.map((f) => (f.id === id ? { ...f, name } : f)),
    }));
    const { currentUid, folders } = get();
    const updated = folders.find((f) => f.id === id);
    if (currentUid && updated) saveFolder(currentUid, updated).catch(console.error);
  },

  deleteFolder: (id) => {
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      // Move tasks in this folder to Inbox (no folderId)
      tasks: state.tasks.map((t) => (t.folderId === id ? { ...t, folderId: undefined } : t)),
    }));
    const { currentUid, tasks } = get();
    if (currentUid) {
      deleteFolder(currentUid, id).catch(console.error);
      tasks
        .filter((t) => t.folderId === id)
        .forEach((t) => saveTask(currentUid, { ...t, folderId: undefined }));
    }
  },
}));
