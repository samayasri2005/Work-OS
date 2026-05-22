import { useState, useEffect } from "react";
import { Github, Cloud, Trello, Figma, Mail, Calendar, Plus, Globe, ExternalLink, Search, Trash2 } from "lucide-react";
import { PageLayout } from "@/components/dashboard/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchLinks,
  saveLink,
  deleteLink,
  type WorkOsLink,
} from "@/lib/firestoreData";
import { useActiveWorkspace } from "@/lib/workspacesStore";

const ICON_MAP: Record<string, any> = {
  github: Github,
  jira: Trello,
  gcp: Cloud,
  figma: Figma,
  mail: Mail,
  calendar: Calendar,
};

const getIcon = (name: string) =>
  ICON_MAP[name.toLowerCase()] ?? Globe;

const CATEGORIES = ["All", "Dev", "Design", "Work", "Personal", "Other"];

const DEFAULT_LINKS: WorkOsLink[] = [
  { id: "1", name: "GitHub", url: "https://github.com", category: "Dev" },
  { id: "2", name: "Jira", url: "https://atlassian.com", category: "Work" },
  { id: "3", name: "GCP", url: "https://cloud.google.com", category: "Dev" },
  { id: "4", name: "Figma", url: "https://figma.com", category: "Design" },
  { id: "5", name: "Mail", url: "https://mail.google.com", category: "Work" },
  { id: "6", name: "Calendar", url: "https://calendar.google.com", category: "Work" },
  { id: "7", name: "Vercel", url: "https://vercel.com", category: "Dev" },
  { id: "8", name: "Notion", url: "https://notion.so", category: "Work" },
];

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const Links = () => {
  const { user } = useAuth();
  const activeWorkspaceId = useActiveWorkspace();
  const [links, setLinks] = useState<WorkOsLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Dev");

  // Load links from Firestore; seed defaults for new users
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchLinks(user.uid)
      .then(async (loaded) => {
        if (loaded.length === 0) {
          // First-time user — seed default links to Firestore
          const wsId = activeWorkspaceId || "work-main";
          const seeded = DEFAULT_LINKS.map((link) => ({ ...link, workspaceId: wsId }));
          for (const link of seeded) {
            await saveLink(user.uid, link).catch(console.error);
          }
          setLinks(seeded);
        } else {
          setLinks(loaded);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, activeWorkspaceId]);

  const addLink = async () => {
    if (!user || !name.trim() || !url.trim()) return;
    const link: WorkOsLink = {
      id: genId(),
      workspaceId: activeWorkspaceId,
      name: name.trim(),
      url: url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`,
      category,
    };
    setLinks([...links, link]);
    setName("");
    setUrl("");
    setCategory("Dev");
    setAdding(false);
    await saveLink(user.uid, link).catch(console.error);
  };

  const removeLink = async (id: string) => {
    if (!user) return;
    setLinks(links.filter((l) => l.id !== id));
    await deleteLink(user.uid, id).catch(console.error);
  };

  // Only display links that belong to the active workspace.
  // Legacy links without workspaceId are mapped to the fallback "work-main" workspace.
  const workspaceLinks = links.filter(
    (l) => l.workspaceId === activeWorkspaceId || (!l.workspaceId && activeWorkspaceId === "work-main")
  );

  const filtered = workspaceLinks.filter(
    (l) =>
      (active === "All" || l.category === active) &&
      l.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <PageLayout
      breadcrumb="Workspace / Links"
      title="Links"
      action={{ label: "Add Link", icon: <Plus className="h-3.5 w-3.5" />, onClick: () => setAdding(true) }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative w-full max-w-xs rounded-md border border-border bg-card px-3 py-1.5 flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shortcuts…"
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>
        <div className="flex items-center gap-1 ml-auto flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`text-xs px-2.5 py-1 rounded-md border transition ${
                active === c
                  ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Add link form */}
      {adding && (
        <div className="rounded-lg border border-border bg-card shadow-card p-4 mb-5 flex flex-wrap gap-2 animate-fade-in">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            autoFocus
            className="flex-1 min-w-[120px] text-sm rounded-md bg-background border border-border px-3 py-1.5 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            className="flex-[2] min-w-[200px] text-sm rounded-md bg-background border border-border px-3 py-1.5 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs rounded-md bg-background border border-border px-2 py-1.5 outline-none"
          >
            {CATEGORIES.filter((c) => c !== "All").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={addLink}
            disabled={!name.trim() || !url.trim()}
            className="rounded-md btn-gradient px-4 text-xs font-medium disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => { setAdding(false); setName(""); setUrl(""); }}
            className="text-xs px-3 text-muted-foreground hover:text-foreground transition"
          >
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading links…</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((l) => {
            const Icon = getIcon(l.name);
            return (
              <div key={l.id} className="group relative rounded-lg border border-border bg-card shadow-card p-4 flex flex-col items-center gap-3 hover:border-foreground/30 hover:-translate-y-0.5 transition">
                <button
                  onClick={() => removeLink(l.id)}
                  className="absolute top-2 right-2 h-5 w-5 grid place-items-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition"
                  aria-label="Remove link"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-3 w-full"
                >
                  <div className="h-10 w-10 rounded-md bg-gradient-subtle grid place-items-center group-hover:bg-gradient-primary transition">
                    <Icon className="h-5 w-5 text-foreground group-hover:text-primary-foreground transition" strokeWidth={2} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold truncate max-w-full">{l.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{l.category}</p>
                  </div>
                </a>
              </div>
            );
          })}
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg border border-dashed border-border p-4 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition min-h-[120px]"
          >
            <div className="h-10 w-10 rounded-md grid place-items-center bg-muted/60">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Add</span>
          </button>
        </div>
      )}
    </PageLayout>
  );
};

export default Links;
