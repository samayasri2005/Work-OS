import { useState, useEffect } from "react";
import { Plus, Search, Trash2, StickyNote, X } from "lucide-react";
import { PageLayout } from "@/components/dashboard/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchNotes,
  saveNote,
  deleteNote,
  type WorkOsNote,
} from "@/lib/firestoreData";

import { useActiveWorkspace } from "@/lib/workspacesStore";

const TAGS = ["Work", "Personal", "Travel", "System", "Ideas", "Other"];

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const Notes = () => {
  const { user } = useAuth();
  const activeWorkspaceId = useActiveWorkspace();
  const [notes, setNotes] = useState<WorkOsNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newTag, setNewTag] = useState("Work");

  // Load notes from Firestore
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchNotes(user.uid)
      .then((loaded) => {
        setNotes(loaded.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const addNote = async () => {
    if (!user || !newTitle.trim()) return;
    const note: WorkOsNote = {
      id: genId(),
      workspaceId: activeWorkspaceId,
      title: newTitle.trim(),
      body: newBody.trim(),
      tag: newTag,
      updatedAt: new Date().toISOString(),
    };
    setNotes([note, ...notes]);
    setAdding(false);
    setNewTitle("");
    setNewBody("");
    setNewTag("Work");
    await saveNote(user.uid, note).catch(console.error);
  };

  const removeNote = async (id: string) => {
    if (!user) return;
    setNotes(notes.filter((n) => n.id !== id));
    await deleteNote(user.uid, id).catch(console.error);
  };

  // Only display notes that belong to the active workspace.
  // Legacy notes without workspaceId are mapped to the fallback "work-main" workspace.
  const workspaceNotes = notes.filter(
    (n) => n.workspaceId === activeWorkspaceId || (!n.workspaceId && activeWorkspaceId === "work-main")
  );

  const filtered = workspaceNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.body.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <PageLayout
      breadcrumb="Workspace / Notes"
      title="Notes"
      action={{ label: "New Note", icon: <Plus className="h-3.5 w-3.5" />, onClick: () => setAdding(true) }}
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="relative w-full max-w-md rounded-md border border-border bg-card px-3 py-1.5 flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums ml-auto">
          {filtered.length} of {workspaceNotes.length}
        </span>
      </div>

      {/* Add note form */}
      {adding && (
        <div className="rounded-lg border border-border bg-card shadow-card p-4 mb-5 space-y-3 animate-fade-in">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Note title…"
            className="w-full text-sm rounded-md bg-background border border-border px-3 py-1.5 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            autoFocus
          />
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Note content…"
            rows={3}
            className="w-full text-sm rounded-md bg-background border border-border px-3 py-1.5 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 resize-none"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="text-xs rounded-md bg-background border border-border px-2 py-1.5 outline-none"
            >
              {TAGS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => { setAdding(false); setNewTitle(""); setNewBody(""); }}
                className="text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground transition"
              >
                Cancel
              </button>
              <button
                onClick={addNote}
                disabled={!newTitle.trim()}
                className="text-xs px-4 py-1.5 rounded-md btn-gradient border-0 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading notes…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
          <StickyNote className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No notes yet</p>
          <p className="text-xs text-muted-foreground mt-1">Click "New Note" to create your first note.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((n) => (
            <div
              key={n.id}
              className="group rounded-lg border border-border bg-card shadow-card p-4 hover:border-foreground/20 transition flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-gradient-subtle grid place-items-center">
                    <StickyNote className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold">{n.title}</h3>
                </div>
                <button
                  onClick={() => removeNote(n.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                  aria-label="Remove note"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed flex-1">{n.body}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {n.tag}
                </span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {formatRelative(n.updatedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Notes;
