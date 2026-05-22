import { useState } from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Pencil,
  Check,
  X,
  Star,
  Folders,
  Tag,
  Flag,
  Bell,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useWorkspaceConfig,
  workspaceConfigApi,
  ConfigSection,
} from "@/lib/workspaceConfigStore";

/* ---------- Local toggle (matches Settings page) ---------- */
const Toggle = ({
  checked,
  onChange,
  size = "md",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  size?: "sm" | "md";
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={cn(
      "relative rounded-full transition shrink-0",
      size === "sm" ? "h-4 w-7" : "h-5 w-9",
      checked ? "bg-gradient-primary shadow-glow" : "bg-muted",
    )}
    aria-pressed={checked}
  >
    <span
      className={cn(
        "absolute top-0.5 rounded-full bg-background shadow transition-transform",
        size === "sm" ? "h-3 w-3" : "h-4 w-4",
        size === "sm"
          ? checked
            ? "translate-x-3"
            : "translate-x-0.5"
          : checked
            ? "translate-x-4"
            : "translate-x-0.5",
      )}
    />
  </button>
);

/* ---------- Drag-and-drop helper hook (HTML5 DnD, no deps) ---------- */
const useReorder = (onReorder: (from: number, to: number) => void) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  return {
    dragIndex,
    overIndex,
    handlers: (i: number) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        setDragIndex(i);
        e.dataTransfer.effectAllowed = "move";
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (overIndex !== i) setOverIndex(i);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        if (dragIndex !== null && dragIndex !== i) onReorder(dragIndex, i);
        setDragIndex(null);
        setOverIndex(null);
      },
      onDragEnd: () => {
        setDragIndex(null);
        setOverIndex(null);
      },
    }),
  };
};

/* ---------- Inline rename input ---------- */
const InlineRename = ({
  value,
  onSave,
  onCancel,
}: {
  value: string;
  onSave: (v: string) => void;
  onCancel: () => void;
}) => {
  const [v, setV] = useState(value);
  return (
    <div className="flex items-center gap-1 flex-1">
      <Input
        autoFocus
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(v.trim() || value);
          if (e.key === "Escape") onCancel();
        }}
        className="h-7 text-sm"
      />
      <button
        onClick={() => onSave(v.trim() || value)}
        className="h-7 w-7 grid place-items-center rounded-md text-success hover:bg-muted transition"
        aria-label="Save"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onCancel}
        className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted transition"
        aria-label="Cancel"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

/* ---------- Project sections panel ---------- */
const ProjectConfig = () => {
  const config = useWorkspaceConfig();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const { dragIndex, overIndex, handlers } = useReorder((f, t) =>
    workspaceConfigApi.reorderSection(f, t),
  );

  const handleAdd = () => {
    if (!newName.trim()) return;
    workspaceConfigApi.addCustomSection(newName);
    setNewName("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">Project sections</h3>
        <p className="text-xs text-muted-foreground">
          Toggle, rename and reorder sections that appear inside each project workspace.
        </p>
      </div>

      <div className="space-y-1.5">
        {config.project.sections.map((s, i) => {
          const isOpen = expanded === s.id;
          const isDragging = dragIndex === i;
          const isOver = overIndex === i && dragIndex !== null && dragIndex !== i;
          return (
            <div
              key={s.id}
              {...handlers(i)}
              className={cn(
                "rounded-lg border bg-background/50 transition",
                isDragging && "opacity-50",
                isOver ? "border-primary/60 bg-accent/40" : "border-border",
              )}
            >
              <div className="flex items-center gap-2 px-2.5 py-2">
                <GripVertical className="h-4 w-4 text-muted-foreground/60 cursor-grab active:cursor-grabbing shrink-0" />
                {s.fields && s.fields.length > 0 ? (
                  <button
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                    className="h-6 w-6 grid place-items-center rounded text-muted-foreground hover:bg-muted transition shrink-0"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </button>
                ) : (
                  <span className="w-6 shrink-0" />
                )}

                {renaming === s.id ? (
                  <InlineRename
                    value={s.name}
                    onSave={(v) => {
                      workspaceConfigApi.renameSection(s.id, v);
                      setRenaming(null);
                    }}
                    onCancel={() => setRenaming(null)}
                  />
                ) : (
                  <>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{s.name}</span>
                      {s.custom && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground font-medium">
                          custom
                        </span>
                      )}
                      {!s.enabled && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          hidden
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setRenaming(s.id)}
                      className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0"
                      aria-label="Rename"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {s.custom && (
                      <button
                        onClick={() => workspaceConfigApi.removeSection(s.id)}
                        className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive transition shrink-0"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <Toggle
                      checked={s.enabled}
                      onChange={() => workspaceConfigApi.toggleSection(s.id)}
                    />
                  </>
                )}
              </div>

              {isOpen && s.fields && (
                <div className="px-3 pb-3 pt-1 ml-9 border-t border-border/60 mt-1">
                  <p className="text-[11px] text-muted-foreground mt-2 mb-2">
                    Fields shown in this section
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {s.fields.map((f) => (
                      <label
                        key={f.name}
                        className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-card px-2.5 py-1.5"
                      >
                        <span className="text-xs">{f.label}</span>
                        <Toggle
                          size="sm"
                          checked={f.enabled}
                          onChange={() => workspaceConfigApi.toggleField(s.id, f.name)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 flex items-center gap-2">
        <Plus className="h-4 w-4 text-muted-foreground" />
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add custom section (e.g. APIs, Roadmap…)"
          className="h-8 border-0 bg-transparent focus-visible:ring-0 px-0 text-sm"
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="text-xs btn-gradient rounded-md px-3 py-1.5 font-medium disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          Add
        </button>
      </div>
    </div>
  );
};

/* ---------- Task config ---------- */
const TaskConfig = () => {
  const config = useWorkspaceConfig();
  const items: { key: keyof typeof config.task; label: string; desc: string; icon: any }[] = [
    { key: "folders", label: "Folders", desc: "Group tasks into folders.", icon: Folders },
    { key: "tags", label: "Tags", desc: "Attach colored tags to tasks.", icon: Tag },
    { key: "priorities", label: "Priorities", desc: "Mark tasks as low / medium / high.", icon: Flag },
    { key: "reminders", label: "Reminders", desc: "Show reminder UI on tasks.", icon: Bell },
  ];
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">Task features</h3>
        <p className="text-xs text-muted-foreground">
          Choose which task capabilities are surfaced in the workspace.
        </p>
      </div>
      <div className="space-y-1.5">
        {items.map(({ key, label, desc, icon: Icon }) => (
          <div
            key={key}
            className="flex items-center gap-3 rounded-lg border border-border bg-background/50 px-3 py-2.5"
          >
            <div className="h-8 w-8 rounded-md bg-gradient-subtle grid place-items-center shrink-0">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <Toggle
              checked={config.task[key]}
              onChange={() => workspaceConfigApi.toggleTask(key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- Links config ---------- */
const LinksConfig = () => {
  const config = useWorkspaceConfig();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const { dragIndex, overIndex, handlers } = useReorder((f, t) =>
    workspaceConfigApi.reorderLinkCategory(f, t),
  );

  const handleAdd = () => {
    if (!newName.trim()) return;
    workspaceConfigApi.addLinkCategory(newName);
    setNewName("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">Link categories</h3>
        <p className="text-xs text-muted-foreground">
          Reorder, rename and pick a default category for new links.
        </p>
      </div>
      <div className="space-y-1.5">
        {config.links.categories.map((c, i) => {
          const isDragging = dragIndex === i;
          const isOver = overIndex === i && dragIndex !== null && dragIndex !== i;
          return (
            <div
              key={c.id}
              {...handlers(i)}
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-background/50 px-2.5 py-2 transition",
                isDragging && "opacity-50",
                isOver ? "border-primary/60 bg-accent/40" : "border-border",
              )}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/60 cursor-grab active:cursor-grabbing shrink-0" />
              {renaming === c.id ? (
                <InlineRename
                  value={c.name}
                  onSave={(v) => {
                    workspaceConfigApi.renameLinkCategory(c.id, v);
                    setRenaming(null);
                  }}
                  onCancel={() => setRenaming(null)}
                />
              ) : (
                <>
                  <span className="text-sm font-medium flex-1 truncate">{c.name}</span>
                  <button
                    onClick={() => workspaceConfigApi.setDefaultLinkCategory(c.id)}
                    className={cn(
                      "h-7 px-2 grid place-items-center rounded-md text-[11px] font-medium gap-1 flex transition shrink-0",
                      c.isDefault
                        ? "bg-gradient-primary text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                    aria-label="Set default"
                  >
                    <Star className={cn("h-3 w-3", c.isDefault && "fill-current")} />
                    {c.isDefault ? "Default" : "Set default"}
                  </button>
                  <button
                    onClick={() => setRenaming(c.id)}
                    className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0"
                    aria-label="Rename"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => workspaceConfigApi.removeLinkCategory(c.id)}
                    className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive transition shrink-0"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 flex items-center gap-2">
        <Plus className="h-4 w-4 text-muted-foreground" />
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add link category"
          className="h-8 border-0 bg-transparent focus-visible:ring-0 px-0 text-sm"
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="text-xs btn-gradient rounded-md px-3 py-1.5 font-medium disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          Add
        </button>
      </div>
    </div>
  );
};

/* ---------- Command config ---------- */
const CommandConfig = () => {
  const config = useWorkspaceConfig();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const { dragIndex, overIndex, handlers } = useReorder((f, t) =>
    workspaceConfigApi.reorderCommandCategory(f, t),
  );

  const handleAdd = () => {
    if (!newName.trim()) return;
    workspaceConfigApi.addCommandCategory(newName);
    setNewName("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">Command categories</h3>
        <p className="text-xs text-muted-foreground">
          Define groups for your CLI snippets. Disable to hide a category from filters.
        </p>
      </div>
      <div className="space-y-1.5">
        {config.command.categories.map((c, i) => {
          const isDragging = dragIndex === i;
          const isOver = overIndex === i && dragIndex !== null && dragIndex !== i;
          return (
            <div
              key={c.id}
              {...handlers(i)}
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-background/50 px-2.5 py-2 transition",
                isDragging && "opacity-50",
                isOver ? "border-primary/60 bg-accent/40" : "border-border",
              )}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/60 cursor-grab active:cursor-grabbing shrink-0" />
              {renaming === c.id ? (
                <InlineRename
                  value={c.name}
                  onSave={(v) => {
                    workspaceConfigApi.renameCommandCategory(c.id, v);
                    setRenaming(null);
                  }}
                  onCancel={() => setRenaming(null)}
                />
              ) : (
                <>
                  <span className="text-sm font-medium flex-1 truncate font-mono">{c.name}</span>
                  {!c.enabled && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      hidden
                    </span>
                  )}
                  <button
                    onClick={() => setRenaming(c.id)}
                    className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0"
                    aria-label="Rename"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => workspaceConfigApi.removeCommandCategory(c.id)}
                    className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive transition shrink-0"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <Toggle
                    checked={c.enabled}
                    onChange={() => workspaceConfigApi.toggleCommandCategory(c.id)}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 flex items-center gap-2">
        <Plus className="h-4 w-4 text-muted-foreground" />
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add command category"
          className="h-8 border-0 bg-transparent focus-visible:ring-0 px-0 text-sm"
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="text-xs btn-gradient rounded-md px-3 py-1.5 font-medium disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          Add
        </button>
      </div>
    </div>
  );
};

/* ---------- Public component ---------- */
export const WorkspaceConfig = () => {
  return (
    <div className="rounded-lg border border-border bg-card shadow-card p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          🔧 Workspace Configuration
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Configure how Projects, Tasks, Links and Commands behave across the workspace.
        </p>
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="bg-muted/50 h-9 rounded-lg p-1 mb-5 w-full grid grid-cols-4">
          {[
            { v: "projects", label: "Projects" },
            { v: "tasks", label: "Tasks" },
            { v: "links", label: "Links" },
            { v: "commands", label: "Commands" },
          ].map((t) => (
            <TabsTrigger
              key={t.v}
              value={t.v}
              className="text-xs h-7 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="projects" className="mt-0">
          <ProjectConfig />
        </TabsContent>
        <TabsContent value="tasks" className="mt-0">
          <TaskConfig />
        </TabsContent>
        <TabsContent value="links" className="mt-0">
          <LinksConfig />
        </TabsContent>
        <TabsContent value="commands" className="mt-0">
          <CommandConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkspaceConfig;
