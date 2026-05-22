import { useState } from "react";
import {
  Plus,
  Search,
  Github,
  ExternalLink,
  Settings2,
  Trash2,
  FolderKanban,
  Pencil,
  X,
  Link as LinkIcon,
  Server,
  FileText,
} from "lucide-react";
import { PageLayout } from "@/components/dashboard/PageLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useSchema, STATUS_COLORS } from "@/lib/schemaStore";
import { useProjects, projectsApi, emptyProject } from "@/lib/projectsStore";
import type { Project, ProjectLink, ProjectService, Status } from "@/lib/projectsStore";

const Projects = () => {
  const projects = useProjects();
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Project | null>(null);
  const [stackInput, setStackInput] = useState("");
  const navigate = useNavigate();
  const schema = useSchema();
  const statuses = schema.projects.statuses;
  const accounts = schema.projects.accounts;
  const statusColor = (name: string) =>
    statuses.find((s) => s.name === name)?.color ?? "muted";
  const statusClass = (name: string) =>
    STATUS_COLORS.find((c) => c.id === statusColor(name))?.className ?? "";

  const openDetail = (p: Project) => {
    navigate(`/projects/${p.id}`);
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.stack.some((t) => t.toLowerCase().includes(query.toLowerCase())),
  );

  const openNew = () => {
    const fresh = emptyProject();
    if (statuses[0]) fresh.status = statuses[0].name as Status;
    setDraft(fresh);
    setActiveId(null);
    setStackInput("");
    setEditorOpen(true);
  };

  const openEdit = (p: Project) => {
    setDraft({ ...p, links: [...p.links], services: [...p.services], stack: [...p.stack] });
    setActiveId(p.id);
    setStackInput("");
    setEditorOpen(true);
  };

  const saveDraft = () => {
    if (!draft || !draft.name.trim()) return;
    projectsApi.upsert(draft);
    setEditorOpen(false);
  };

  const removeProject = (id: string) => {
    projectsApi.remove(id);
    if (activeId === id) setEditorOpen(false);
  };

  const addStackTag = () => {
    const v = stackInput.trim();
    if (!v || !draft) return;
    if (!draft.stack.includes(v)) setDraft({ ...draft, stack: [...draft.stack, v] });
    setStackInput("");
  };

  const updateLink = (idx: number, patch: Partial<ProjectLink>) => {
    if (!draft) return;
    const next = draft.links.map((l, i) => (i === idx ? { ...l, ...patch } : l));
    setDraft({ ...draft, links: next });
  };

  const updateService = (idx: number, patch: Partial<ProjectService>) => {
    if (!draft) return;
    const next = draft.services.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    setDraft({ ...draft, services: next });
  };

  return (
    <PageLayout
      breadcrumb="Workspace / Projects"
      title="Your Projects"
      action={null}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="relative w-full max-w-md rounded-md border border-border bg-card px-3 py-1.5 flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, stack…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} of {projects.length}
        </span>
        <Button
          onClick={openNew}
          className="ml-auto rounded-full h-9 btn-gradient gap-1.5 text-xs font-medium px-4 border-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Project
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mx-auto h-10 w-10 rounded-lg bg-gradient-subtle grid place-items-center mb-3">
            <FolderKanban className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium">No projects yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add your first project to start tracking links, services, and notes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => openDetail(p)}
              className="group cursor-pointer rounded-lg border border-border bg-card shadow-card p-4 hover:border-primary/40 hover:shadow-glow hover:-translate-y-0.5 transition flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-md bg-gradient-subtle grid place-items-center shrink-0">
                    <FolderKanban className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold truncate">{p.name}</h3>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-medium px-2 py-0 h-5 shrink-0 border-transparent",
                    statusClass(p.status),
                  )}
                >
                  {p.status}
                </Badge>
              </div>

              <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2 mb-3">
                {p.description || "No description."}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {p.stack.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noreferrer"
                      className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition"
                      aria-label="GitHub"
                    >
                      <Github className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {p.live && (
                    <a
                      href={p.live}
                      target="_blank"
                      rel="noreferrer"
                      className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition"
                      aria-label="Live URL"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => openEdit(p)}
                    className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition"
                    aria-label="Open details"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProject(p.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                  aria-label="Delete project"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          {draft && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gradient-primary grid place-items-center shadow-glow shrink-0">
                    <FolderKanban className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-base">
                      {activeId ? "Edit Project" : "New Project"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Manage details, links, services and notes.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="px-6 py-5 max-h-[65vh] overflow-y-auto space-y-5">
                {/* Core fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Name
                    </label>
                    <Input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      placeholder="Project name"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </label>
                    <div className="flex flex-wrap gap-1 p-1 rounded-md border border-border bg-muted/40">
                      {statuses.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setDraft(draft ? { ...draft, status: s.name as Status } : null)}
                          className={cn(
                            "flex-1 min-w-[80px] text-xs h-7 rounded transition font-medium",
                            draft.status === s.name
                              ? cn("shadow-sm", statusClass(s.name))
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                    {accounts.length > 0 && (
                      <div className="pt-2">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          Account
                        </label>
                        <select
                          value={draft.account ?? ""}
                          onChange={(e) => setDraft({ ...draft, account: e.target.value })}
                          className="mt-1.5 w-full h-9 text-sm rounded-md border border-border bg-background px-3 outline-none focus:border-ring transition"
                        >
                          <option value="">— None —</option>
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.label} ({a.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </label>
                  <Textarea
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="What is this project about?"
                    className="min-h-[70px] resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Tech stack
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={stackInput}
                      onChange={(e) => setStackInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addStackTag();
                        }
                      }}
                      placeholder="Add tag and press Enter"
                      className="h-9"
                    />
                    <Button variant="outline" size="sm" onClick={addStackTag} className="h-9">
                      Add
                    </Button>
                  </div>
                  {draft.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {draft.stack.map((tag) => (
                        <span
                          key={tag}
                          className="group/tag flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
                        >
                          {tag}
                          <button
                            onClick={() =>
                              setDraft({ ...draft, stack: draft.stack.filter((t) => t !== tag) })
                            }
                            className="hover:text-destructive"
                            aria-label={`Remove ${tag}`}
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Tabs defaultValue="links" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-9">
                    <TabsTrigger value="links" className="text-xs gap-1.5">
                      <LinkIcon className="h-3 w-3" /> Links
                    </TabsTrigger>
                    <TabsTrigger value="services" className="text-xs gap-1.5">
                      <Server className="h-3 w-3" /> Services
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="text-xs gap-1.5">
                      <FileText className="h-3 w-3" /> Notes
                    </TabsTrigger>
                  </TabsList>

                  {/* LINKS */}
                  <TabsContent value="links" className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          GitHub
                        </label>
                        <Input
                          value={draft.github ?? ""}
                          onChange={(e) => setDraft({ ...draft, github: e.target.value })}
                          placeholder="https://github.com/…"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          Live URL
                        </label>
                        <Input
                          value={draft.live ?? ""}
                          onChange={(e) => setDraft({ ...draft, live: e.target.value })}
                          placeholder="https://…"
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          Other links
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              links: [
                                ...draft.links,
                                { id: crypto.randomUUID(), label: "", url: "" },
                              ],
                            })
                          }
                        >
                          <Plus className="h-3 w-3" /> Add link
                        </Button>
                      </div>
                      {draft.links.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No additional links.</p>
                      ) : (
                        draft.links.map((l, idx) => (
                          <div key={l.id} className="flex gap-2">
                            <Input
                              value={l.label}
                              onChange={(e) => updateLink(idx, { label: e.target.value })}
                              placeholder="Label (e.g. API docs)"
                              className="h-9 flex-1"
                            />
                            <Input
                              value={l.url}
                              onChange={(e) => updateLink(idx, { url: e.target.value })}
                              placeholder="https://…"
                              className="h-9 flex-[1.5]"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                setDraft({
                                  ...draft,
                                  links: draft.links.filter((_, i) => i !== idx),
                                })
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  {/* SERVICES */}
                  <TabsContent value="services" className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Services
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            services: [
                              ...draft.services,
                              { id: crypto.randomUUID(), name: "", platform: "" },
                            ],
                          })
                        }
                      >
                        <Plus className="h-3 w-3" /> Add service
                      </Button>
                    </div>
                    {draft.services.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No services yet. Add Firebase, Auth, DB, hosting…
                      </p>
                    ) : (
                      draft.services.map((s, idx) => (
                        <div key={s.id} className="flex gap-2">
                          <Input
                            value={s.name}
                            onChange={(e) => updateService(idx, { name: e.target.value })}
                            placeholder="Name (e.g. Supabase)"
                            className="h-9 flex-1"
                          />
                          <Input
                            value={s.platform ?? ""}
                            onChange={(e) => updateService(idx, { platform: e.target.value })}
                            placeholder="Platform (Auth, DB, Hosting…)"
                            className="h-9 flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                services: draft.services.filter((_, i) => i !== idx),
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* NOTES */}
                  <TabsContent value="notes" className="mt-4">
                    <Textarea
                      value={draft.notes}
                      onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                      placeholder="Free text notes about the project…"
                      className="min-h-[140px] resize-none"
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 sm:justify-between gap-2">
                <div>
                  {activeId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                      onClick={() => removeProject(activeId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditorOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveDraft}
                    disabled={!draft.name.trim()}
                    className="btn-gradient gap-1.5 border-0"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {activeId ? "Save changes" : "Create project"}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Projects;