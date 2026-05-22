import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  FolderKanban,
  Rocket,
  Server,
  KeyRound,
  Terminal,
  Leaf,
  FileText,
  Wrench,
  LayoutGrid,
  Github,
} from "lucide-react";
import { PageLayout } from "@/components/dashboard/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  projectsApi,
  Status,
  useProject,
  ProjectDeployment,
  ProjectService,
  ProjectAccount,
  ProjectCommand,
  ProjectEnvVar,
} from "@/lib/projectsStore";
import { useWorkspaceConfig } from "@/lib/workspaceConfigStore";

const statusStyles: Record<Status, string> = {
  "Idea": "border-info/30 text-info bg-info/5",
  "In Progress": "border-primary/30 text-primary bg-primary/5",
  "Completed": "border-success/30 text-success bg-success/5",
  "On Hold": "border-warning/30 text-warning bg-warning/5",
};

const formatRelative = (ts: number) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

/* ---------- Reusable ---------- */

const SectionCard = ({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold truncate">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const EmptyState = ({ icon: Icon, label, hint }: { icon: any; label: string; hint?: string }) => (
  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
    <div className="mx-auto h-9 w-9 rounded-lg bg-gradient-subtle grid place-items-center mb-2">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <p className="text-sm font-medium">{label}</p>
    {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) => (
  <div className="rounded-xl border border-border bg-card shadow-card p-4 flex items-center gap-3">
    <div className="h-10 w-10 rounded-lg bg-gradient-subtle grid place-items-center">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className="text-lg font-semibold tabular-nums leading-tight">{value}</p>
    </div>
  </div>
);

/* ---------- Add Modal (generic) ---------- */

type FieldDef =
  | { name: string; label: string; type: "text" | "url"; placeholder?: string; required?: boolean }
  | { name: string; label: string; type: "select"; options: string[] }
  | { name: string; label: string; type: "textarea"; placeholder?: string };

const AddModal = <T extends Record<string, string>>({
  open,
  onOpenChange,
  title,
  fields,
  initial,
  onSubmit,
  submitLabel = "Add",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  fields: FieldDef[];
  initial: T;
  onSubmit: (values: T) => void;
  submitLabel?: string;
}) => {
  const [values, setValues] = useState<T>(initial);

  // reset values whenever the modal opens with fresh initial data
  const openKey = open ? "open" : "closed";
  useMemo(() => {
    if (open) setValues(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openKey]);

  const handleSubmit = () => {
    const required = fields.filter((f) => "required" in f && f.required) as Array<{ name: string }>;
    if (required.some((f) => !values[f.name]?.trim())) return;
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription className="text-xs">Fill the details below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {f.label}
              </label>
              {f.type === "textarea" ? (
                <Textarea
                  value={(values as any)[f.name] ?? ""}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value } as T)}
                  placeholder={f.placeholder}
                  className="min-h-[70px] resize-none"
                />
              ) : f.type === "select" ? (
                <div className="flex gap-1 p-1 rounded-md border border-border bg-muted/40">
                  {f.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setValues({ ...values, [f.name]: opt } as T)}
                      className={cn(
                        "flex-1 text-xs h-7 rounded transition font-medium capitalize",
                        (values as any)[f.name] === opt
                          ? "bg-card shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <Input
                  type={f.type === "url" ? "url" : "text"}
                  value={(values as any)[f.name] ?? ""}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value } as T)}
                  placeholder={f.placeholder}
                  className="h-9"
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="h-9 btn-gradient border-0">
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ---------- Page ---------- */

const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = useProject(id);
  const wsConfig = useWorkspaceConfig();

  const [addOpen, setAddOpen] = useState<null | "deployment" | "service" | "account" | "command" | "env">(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!project) {
    return (
      <PageLayout breadcrumb="Workspace / Projects" title="Project not found" action={null}>
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-sm font-medium">This project does not exist.</p>
          <Button asChild variant="outline" className="mt-4 h-9">
            <Link to="/projects">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Projects
            </Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  const copyCmd = (id: string, value: string) => {
    navigator.clipboard?.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1200);
  };

  const cycleStatus = () => {
    const order: Status[] = ["Idea", "In Progress", "On Hold", "Completed"];
    const next = order[(order.indexOf(project.status) + 1) % order.length];
    projectsApi.patch(project.id, { status: next });
  };

  const iconMap: Record<string, any> = {
    overview: LayoutGrid,
    deployments: Rocket,
    services: Server,
    accounts: KeyRound,
    commands: Terminal,
    env: Leaf,
    notes: FileText,
    setup: Wrench,
  };

  const enabledSections = wsConfig.project.sections.filter((s) => s.enabled);
  const fieldOn = (sectionKey: string, fieldName: string) => {
    const sec = wsConfig.project.sections.find((s) => s.key === sectionKey);
    if (!sec?.fields) return true;
    return sec.fields.find((f) => f.name === fieldName)?.enabled !== false;
  };
  const defaultTab = enabledSections[0]?.key ?? "overview";

  return (
    <PageLayout
      breadcrumb={`Workspace / Projects / ${project.name}`}
      title={project.name}
      action={null}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3 mb-6 -mt-2">
        <Button asChild variant="outline" size="sm" className="h-8 rounded-full">
          <Link to="/projects">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Projects
          </Link>
        </Button>
        <button
          onClick={cycleStatus}
          title="Click to cycle status"
          className="focus:outline-none"
        >
          <Badge
            variant="outline"
            className={cn("text-[10px] font-medium px-2.5 py-0.5 h-6", statusStyles[project.status])}
          >
            {project.status}
          </Badge>
        </button>
        <span className="text-xs text-muted-foreground">
          Updated {formatRelative(project.updatedAt)}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {project.github && (
            <Button asChild variant="outline" size="sm" className="h-8 rounded-full gap-1.5">
              <a href={project.github} target="_blank" rel="noreferrer">
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
            </Button>
          )}
          {project.live && (
            <Button asChild variant="outline" size="sm" className="h-8 rounded-full gap-1.5">
              <a href={project.live} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" /> Live
              </a>
            </Button>
          )}
          <Button
            onClick={() => navigate(`/projects?edit=${project.id}`)}
            size="sm"
            className="h-8 rounded-full btn-gradient border-0 gap-1.5 px-3"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} key={defaultTab} className="w-full">
        <TabsList className="bg-card border border-border h-10 rounded-full p-1 mb-6 overflow-x-auto flex-nowrap inline-flex w-auto max-w-full">
          {enabledSections.map((sec) => {
            const Icon = iconMap[sec.key] ?? FolderKanban;
            return (
              <TabsTrigger
                key={sec.id}
                value={sec.key}
                className="rounded-full text-xs px-3.5 h-8 gap-1.5 data-[state=active]:btn-gradient data-[state=active]:border-0 data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
              >
                <Icon className="h-3.5 w-3.5" />
                {sec.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          {fieldOn("overview", "stats") && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={Rocket} label="Deployments" value={project.deployments.length} />
              <StatCard icon={Server} label="Services" value={project.services.length} />
              <StatCard icon={Terminal} label="Commands" value={project.commands.length} />
              <StatCard icon={Leaf} label="Env vars" value={project.env.length} />
            </div>
          )}

          <SectionCard title="About" description="Project description and stack">
            {fieldOn("overview", "description") && (
              <p className="text-sm text-foreground/80 leading-relaxed">
                {project.description || "No description yet."}
              </p>
            )}
            {fieldOn("overview", "stack") && project.stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {project.stack.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* DEPLOYMENTS */}
        <TabsContent value="deployments" className="mt-0">
          <SectionCard
            title="Deployments"
            description="Track every deployed environment for this project"
            action={
              <Button onClick={() => setAddOpen("deployment")} size="sm" className="h-8 btn-gradient border-0 gap-1.5 rounded-full">
                <Plus className="h-3.5 w-3.5" /> Add Deployment
              </Button>
            }
          >
            {project.deployments.length === 0 ? (
              <EmptyState icon={Rocket} label="No deployments yet" hint="Add a URL to track prod, staging or test." />
            ) : (
              <div className="space-y-2">
                {project.deployments.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background/50 px-3 py-2.5 hover:border-primary/30 transition"
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-medium px-2 py-0 h-5 capitalize shrink-0",
                        d.tag === "prod" && "border-success/30 text-success bg-success/5",
                        d.tag === "staging" && "border-warning/30 text-warning bg-warning/5",
                        d.tag === "test" && "border-info/30 text-info bg-info/5",
                      )}
                    >
                      {d.tag}
                    </Badge>
                    <span className="text-xs text-muted-foreground shrink-0">{d.method}</span>
                    <span className="text-sm truncate flex-1 font-mono">{d.url}</span>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0"
                      aria-label="Open"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() =>
                        projectsApi.patch(project.id, {
                          deployments: project.deployments.filter((x) => x.id !== d.id),
                        })
                      }
                      className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive transition shrink-0"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* SERVICES */}
        <TabsContent value="services" className="mt-0">
          <SectionCard
            title="Services"
            description="External services and infrastructure powering this project"
            action={
              <Button onClick={() => setAddOpen("service")} size="sm" className="h-8 btn-gradient border-0 gap-1.5 rounded-full">
                <Plus className="h-3.5 w-3.5" /> Add Service
              </Button>
            }
          >
            {project.services.length === 0 ? (
              <EmptyState icon={Server} label="No services yet" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.services.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-border bg-background/50 p-3 hover:border-primary/30 transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-md bg-gradient-subtle grid place-items-center shrink-0">
                          <Server className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{s.name}</p>
                          {s.platform && (
                            <p className="text-[11px] text-muted-foreground truncate">{s.platform}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          projectsApi.patch(project.id, {
                            services: project.services.filter((x) => x.id !== s.id),
                          })
                        }
                        className="text-muted-foreground hover:text-destructive transition"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {s.account && (
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="text-foreground/70">Account:</span> {s.account}
                      </p>
                    )}
                    {s.notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.notes}</p>
                    )}
                    {s.dashboardUrl && (
                      <a
                        href={s.dashboardUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline"
                      >
                        Open dashboard <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* ACCOUNTS */}
        <TabsContent value="accounts" className="mt-0">
          <SectionCard
            title="Accounts"
            description="Logins and identities used across services"
            action={
              <Button onClick={() => setAddOpen("account")} size="sm" className="h-8 btn-gradient border-0 gap-1.5 rounded-full">
                <Plus className="h-3.5 w-3.5" /> Add Account
              </Button>
            }
          >
            {project.accounts.length === 0 ? (
              <EmptyState icon={KeyRound} label="No accounts yet" />
            ) : (
              <div className="space-y-2">
                {project.accounts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background/50 px-3 py-2.5 hover:border-primary/30 transition"
                  >
                    <div className="h-7 w-7 rounded-md bg-gradient-subtle grid place-items-center shrink-0">
                      <KeyRound className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{a.email}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {a.platform}
                        {a.label ? ` · ${a.label}` : ""}
                      </p>
                    </div>
                    {a.notes && (
                      <p className="text-xs text-muted-foreground hidden md:block max-w-[40%] truncate">
                        {a.notes}
                      </p>
                    )}
                    <button
                      onClick={() =>
                        projectsApi.patch(project.id, {
                          accounts: project.accounts.filter((x) => x.id !== a.id),
                        })
                      }
                      className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive transition shrink-0"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* COMMANDS */}
        <TabsContent value="commands" className="mt-0">
          <SectionCard
            title="Commands"
            description="One-click access to the commands you keep forgetting"
            action={
              <Button onClick={() => setAddOpen("command")} size="sm" className="h-8 btn-gradient border-0 gap-1.5 rounded-full">
                <Plus className="h-3.5 w-3.5" /> Add Command
              </Button>
            }
          >
            {project.commands.length === 0 ? (
              <EmptyState icon={Terminal} label="No commands yet" hint="Save your most-used CLI commands." />
            ) : (
              <div className="space-y-2">
                {project.commands.map((c) => (
                  <div
                    key={c.id}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-background/50 px-3 py-2.5 hover:border-primary/30 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        {c.label && <span className="text-xs font-medium">{c.label}</span>}
                        {c.category && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 border-border text-muted-foreground bg-muted/40 capitalize"
                          >
                            {c.category}
                          </Badge>
                        )}
                      </div>
                      <code className="text-xs font-mono text-foreground/90 break-all">{c.command}</code>
                    </div>
                    <button
                      onClick={() => copyCmd(c.id, c.command)}
                      className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0"
                      aria-label="Copy"
                    >
                      {copiedId === c.id ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        projectsApi.patch(project.id, {
                          commands: project.commands.filter((x) => x.id !== c.id),
                        })
                      }
                      className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive transition shrink-0"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* ENV */}
        <TabsContent value="env" className="mt-0">
          <SectionCard
            title="Environment Variables"
            description="Stored locally for reference. Values are masked."
            action={
              <Button onClick={() => setAddOpen("env")} size="sm" className="h-8 btn-gradient border-0 gap-1.5 rounded-full">
                <Plus className="h-3.5 w-3.5" /> Add Variable
              </Button>
            }
          >
            {project.env.length === 0 ? (
              <EmptyState icon={Leaf} label="No env variables yet" />
            ) : (
              <div className="space-y-2">
                {project.env.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background/50 px-3 py-2.5 hover:border-primary/30 transition font-mono"
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-2 py-0 h-5 shrink-0 capitalize",
                        v.env === "prod"
                          ? "border-success/30 text-success bg-success/5"
                          : "border-info/30 text-info bg-info/5",
                      )}
                    >
                      {v.env}
                    </Badge>
                    <span className="text-xs font-semibold">{v.key}</span>
                    <span className="text-xs text-muted-foreground flex-1 truncate">
                      {"•".repeat(Math.min(12, Math.max(6, v.value.length)))}
                    </span>
                    <button
                      onClick={() =>
                        projectsApi.patch(project.id, {
                          env: project.env.filter((x) => x.id !== v.id),
                        })
                      }
                      className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive transition shrink-0"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* NOTES */}
        <TabsContent value="notes" className="mt-0">
          <SectionCard title="Notes" description="Free-form notes for this project">
            <Textarea
              value={project.notes}
              onChange={(e) => projectsApi.patch(project.id, { notes: e.target.value })}
              placeholder="Write project notes…"
              className="min-h-[260px] resize-y font-medium"
            />
          </SectionCard>
        </TabsContent>

        {/* SETUP */}
        <TabsContent value="setup" className="mt-0">
          <SectionCard
            title="Setup"
            description="Steps to get this project running again later"
            action={
              project.setup && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full gap-1.5"
                  onClick={() => copyCmd("setup", project.setup)}
                >
                  {copiedId === "setup" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-success" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy all
                    </>
                  )}
                </Button>
              )
            }
          >
            {project.setup && (
              <pre className="rounded-lg border border-border bg-muted/30 p-4 text-xs font-mono overflow-x-auto mb-3 whitespace-pre-wrap break-words">
                {project.setup}
              </pre>
            )}
            <Textarea
              value={project.setup}
              onChange={(e) => projectsApi.patch(project.id, { setup: e.target.value })}
              placeholder="git clone …\nnpm install\nnpm run dev"
              className="min-h-[160px] resize-y font-mono text-xs"
            />
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Custom user-defined sections render as inline panels below the tabs */}
      {enabledSections.filter((s) => s.custom).length > 0 && (
        <div className="mt-6 space-y-4">
          {enabledSections
            .filter((s) => s.custom)
            .map((s) => (
              <SectionCard
                key={s.id}
                title={s.name}
                description="Custom section — configured in Settings → Workspace"
              >
                <EmptyState
                  icon={FolderKanban}
                  label={`${s.name} is empty`}
                  hint="Custom sections are placeholders. Add fields support coming soon."
                />
              </SectionCard>
            ))}
        </div>
      )}

      {/* Add modals */}
      <AddModal
        open={addOpen === "deployment"}
        onOpenChange={(v) => !v && setAddOpen(null)}
        title="Add Deployment"
        fields={[
          { name: "url", label: "URL", type: "url", placeholder: "https://app.example.com", required: true },
          { name: "tag", label: "Environment", type: "select", options: ["prod", "staging", "test"] },
          { name: "method", label: "Method", type: "select", options: ["GitHub", "Manual"] },
        ]}
        initial={{ url: "", tag: "prod", method: "GitHub" }}
        onSubmit={(v) => {
          const item: ProjectDeployment = {
            id: projectsApi.newId(),
            url: v.url,
            tag: (v.tag as any) || "prod",
            method: (v.method as any) || "GitHub",
          };
          projectsApi.patch(project.id, { deployments: [item, ...project.deployments] });
        }}
      />

      <AddModal
        open={addOpen === "service"}
        onOpenChange={(v) => !v && setAddOpen(null)}
        title="Add Service"
        fields={[
          { name: "name", label: "Service name", type: "text", placeholder: "Supabase", required: true },
          { name: "platform", label: "Platform", type: "text", placeholder: "Supabase" },
          { name: "account", label: "Linked account", type: "text", placeholder: "you@email.com" },
          { name: "dashboardUrl", label: "Dashboard URL", type: "url", placeholder: "https://app.supabase.com" },
          { name: "notes", label: "Notes", type: "textarea", placeholder: "Optional notes" },
        ]}
        initial={{ name: "", platform: "", account: "", dashboardUrl: "", notes: "" }}
        onSubmit={(v) => {
          const item: ProjectService = {
            id: projectsApi.newId(),
            name: v.name,
            platform: v.platform || undefined,
            account: v.account || undefined,
            dashboardUrl: v.dashboardUrl || undefined,
            notes: v.notes || undefined,
          };
          projectsApi.patch(project.id, { services: [item, ...project.services] });
        }}
      />

      <AddModal
        open={addOpen === "account"}
        onOpenChange={(v) => !v && setAddOpen(null)}
        title="Add Account"
        fields={[
          { name: "email", label: "Email", type: "text", placeholder: "you@email.com", required: true },
          { name: "platform", label: "Platform", type: "text", placeholder: "Vercel", required: true },
          { name: "label", label: "Label", type: "text", placeholder: "Personal / Work" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        initial={{ email: "", platform: "", label: "", notes: "" }}
        onSubmit={(v) => {
          const item: ProjectAccount = {
            id: projectsApi.newId(),
            email: v.email,
            platform: v.platform,
            label: v.label || undefined,
            notes: v.notes || undefined,
          };
          projectsApi.patch(project.id, { accounts: [item, ...project.accounts] });
        }}
      />

      <AddModal
        open={addOpen === "command"}
        onOpenChange={(v) => !v && setAddOpen(null)}
        title="Add Command"
        fields={[
          { name: "command", label: "Command", type: "text", placeholder: "npm run dev", required: true },
          { name: "label", label: "Label", type: "text", placeholder: "Run dev" },
          { name: "category", label: "Category", type: "select", options: ["dev", "deploy", "db", "test"] },
        ]}
        initial={{ command: "", label: "", category: "dev" }}
        onSubmit={(v) => {
          const item: ProjectCommand = {
            id: projectsApi.newId(),
            command: v.command,
            label: v.label || undefined,
            category: v.category || undefined,
          };
          projectsApi.patch(project.id, { commands: [item, ...project.commands] });
        }}
      />

      <AddModal
        open={addOpen === "env"}
        onOpenChange={(v) => !v && setAddOpen(null)}
        title="Add Environment Variable"
        fields={[
          { name: "key", label: "Key", type: "text", placeholder: "API_KEY", required: true },
          { name: "value", label: "Value", type: "text", placeholder: "sk_…", required: true },
          { name: "env", label: "Environment", type: "select", options: ["dev", "prod"] },
        ]}
        initial={{ key: "", value: "", env: "dev" }}
        onSubmit={(v) => {
          const item: ProjectEnvVar = {
            id: projectsApi.newId(),
            key: v.key,
            value: v.value,
            env: (v.env as any) || "dev",
          };
          projectsApi.patch(project.id, { env: [item, ...project.env] });
        }}
      />
    </PageLayout>
  );
};

export default ProjectWorkspace;