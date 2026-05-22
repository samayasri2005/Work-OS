import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Pencil,
  Plus,
  ExternalLink,
  Github,
  Server,
  Database,
  Shield,
  Cloud,
  FolderKanban,
  Clock,
  Check,
} from "lucide-react";

type Status = "Active" | "Completed";

interface ProjectLink {
  id: string;
  label: string;
  url: string;
}
interface ProjectService {
  id: string;
  name: string;
  type: string;
}
export interface DetailProject {
  id: string;
  name: string;
  description: string;
  status: Status;
  stack: string[];
  github?: string;
  live?: string;
  links: ProjectLink[];
  services: ProjectService[];
  notes: string;
  lastUpdated?: string;
}

interface Props {
  project: DetailProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (project: DetailProject) => void;
  onNotesChange?: (id: string, notes: string) => void;
}

const serviceIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("auth")) return Shield;
  if (t.includes("db") || t.includes("data")) return Database;
  if (t.includes("host")) return Cloud;
  return Server;
};

const TabNav = ({
  value,
  onChange,
  tabs,
}: {
  value: string;
  onChange: (v: string) => void;
  tabs: { value: string; label: string }[];
}) => (
  <TabsList className="bg-transparent p-0 h-auto gap-1 border-b border-border w-full justify-start rounded-none">
    {tabs.map((t) => (
      <TabsTrigger
        key={t.value}
        value={t.value}
        onClick={() => onChange(t.value)}
        className={cn(
          "relative h-9 px-3 text-xs font-medium rounded-md data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground text-muted-foreground",
          "after:content-[''] after:absolute after:left-2 after:right-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-gradient-primary after:opacity-0 data-[state=active]:after:opacity-100 data-[state=active]:after:shadow-glow",
          "transition-colors",
        )}
      >
        {t.label}
      </TabsTrigger>
    ))}
  </TabsList>
);

export const ProjectDetailPanel = ({
  project,
  open,
  onOpenChange,
  onEdit,
  onNotesChange,
}: Props) => {
  const [tab, setTab] = useState("overview");
  const [notesDraft, setNotesDraft] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (project) {
      setNotesDraft(project.notes ?? "");
      setTab("overview");
      setSaved(false);
    }
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    if (notesDraft === project.notes) return;
    setSaved(false);
    const t = setTimeout(() => {
      onNotesChange?.(project.id, notesDraft);
      setSaved(true);
    }, 500);
    return () => clearTimeout(t);
  }, [notesDraft]);

  if (!project) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[40vw] sm:w-[40vw] p-0 flex flex-col bg-card border-l border-border"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary grid place-items-center shadow-glow shrink-0">
              <FolderKanban className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1 pr-8">
              <SheetTitle className="text-xl font-bold truncate leading-tight">
                {project.name}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-medium px-2 py-0 h-5",
                    project.status === "Active"
                      ? "border-primary/30 text-primary bg-primary/5"
                      : "border-border text-muted-foreground bg-muted/40",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full mr-1.5",
                      project.status === "Active"
                        ? "bg-primary animate-pulse"
                        : "bg-muted-foreground",
                    )}
                  />
                  {project.status}
                </Badge>
                {project.lastUpdated && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {project.lastUpdated}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs shrink-0"
              onClick={() => onEdit?.(project)}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-3">
            <TabNav
              value={tab}
              onChange={setTab}
              tabs={[
                { value: "overview", label: "Overview" },
                { value: "links", label: "Links" },
                { value: "services", label: "Services" },
                { value: "notes", label: "Notes" },
              ]}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* OVERVIEW */}
            <TabsContent
              value="overview"
              className="mt-0 space-y-5 animate-in fade-in-50 duration-200"
            >
              <section>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Description
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {project.description || "No description provided."}
                </p>
              </section>

              <section>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Tech stack
                </p>
                {project.stack.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No stack tags.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-gradient-subtle border border-border text-foreground/80 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              <section className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-card p-3 shadow-card">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Links
                  </p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">
                    {project.links.length + (project.github ? 1 : 0) + (project.live ? 1 : 0)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3 shadow-card">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Services
                  </p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">
                    {project.services.length}
                  </p>
                </div>
              </section>
            </TabsContent>

            {/* LINKS */}
            <TabsContent
              value="links"
              className="mt-0 space-y-2 animate-in fade-in-50 duration-200"
            >
              {[
                project.github && { label: "GitHub", url: project.github, icon: Github },
                project.live && { label: "Live", url: project.live, icon: ExternalLink },
                ...project.links.map((l) => ({
                  label: l.label || "Link",
                  url: l.url,
                  icon: ExternalLink,
                })),
              ]
                .filter(Boolean)
                .map((item, i) => {
                  const it = item as { label: string; url: string; icon: typeof Github };
                  const Icon = it.icon;
                  return (
                    <a
                      key={i}
                      href={it.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-glow p-3 transition"
                    >
                      <div className="h-8 w-8 rounded-md bg-gradient-subtle grid place-items-center shrink-0">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{it.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{it.url}</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition" />
                    </a>
                  );
                })}

              {!project.github && !project.live && project.links.length === 0 && (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                  <p className="text-xs text-muted-foreground">No links yet.</p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 h-9 gap-1.5 text-xs border-dashed"
                onClick={() => onEdit?.(project)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Link
              </Button>
            </TabsContent>

            {/* SERVICES */}
            <TabsContent
              value="services"
              className="mt-0 space-y-2 animate-in fade-in-50 duration-200"
            >
              {project.services.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                  <p className="text-xs text-muted-foreground">No services configured.</p>
                </div>
              ) : (
                project.services.map((s) => {
                  const Icon = serviceIcon(s.type);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-card hover:border-primary/30 transition"
                    >
                      <div className="h-9 w-9 rounded-md bg-gradient-subtle grid place-items-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{s.name || "Untitled"}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {s.type || "Service"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 h-9 gap-1.5 text-xs border-dashed"
                onClick={() => onEdit?.(project)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Service
              </Button>
            </TabsContent>

            {/* NOTES */}
            <TabsContent
              value="notes"
              className="mt-0 space-y-2 animate-in fade-in-50 duration-200"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Notes
                </p>
                {saved && notesDraft && (
                  <span className="flex items-center gap-1 text-[11px] text-primary animate-in fade-in">
                    <Check className="h-3 w-3" />
                    Saved
                  </span>
                )}
              </div>
              <Textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Write project notes…"
                className="min-h-[200px] resize-none text-sm leading-relaxed"
              />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
