import { useState } from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Type,
  AlignLeft,
  ChevronDown,
  ListChecks,
  Link2,
  Tags,
  AtSign,
  User,
  Folders,
  Flag,
  Tag as TagIcon,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useSchema,
  schemaApi,
  FieldType,
  SchemaField,
  STATUS_COLORS,
  StatusColor,
} from "@/lib/schemaStore";

/* ---------- shared toggle ---------- */
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

/* ---------- DnD reorder ---------- */
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

/* ---------- Inline rename ---------- */
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
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onCancel}
        className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

/* ---------- Field type metadata ---------- */
const FIELD_TYPES: { id: FieldType; label: string; icon: any }[] = [
  { id: "text", label: "Text", icon: Type },
  { id: "textarea", label: "Textarea", icon: AlignLeft },
  { id: "select", label: "Select", icon: ChevronDown },
  { id: "multiselect", label: "Multi-select", icon: ListChecks },
  { id: "url", label: "URL", icon: Link2 },
  { id: "tags", label: "Tags", icon: Tags },
  { id: "reference", label: "Reference", icon: AtSign },
];

const fieldTypeMeta = (t: FieldType) =>
  FIELD_TYPES.find((f) => f.id === t) ?? FIELD_TYPES[0];

/* ---------- Field card ---------- */
const FieldCard = ({
  entity,
  field,
  onEdit,
  isRenaming,
  setRenaming,
  dragHandlers,
  isDragging,
  isOver,
}: {
  entity: "projects" | "links" | "tasks" | "commands";
  field: SchemaField;
  onEdit: () => void;
  isRenaming: boolean;
  setRenaming: (v: boolean) => void;
  dragHandlers: any;
  isDragging: boolean;
  isOver: boolean;
}) => {
  const meta = fieldTypeMeta(field.type);
  const Icon = meta.icon;
  return (
    <div
      {...dragHandlers}
      className={cn(
        "rounded-lg border bg-background/50 transition",
        isDragging && "opacity-50",
        isOver ? "border-primary/60 bg-accent/40" : "border-border",
      )}
    >
      <div className="flex items-center gap-2 px-2.5 py-2">
        <GripVertical className="h-4 w-4 text-muted-foreground/60 cursor-grab active:cursor-grabbing shrink-0" />
        <div className="h-7 w-7 rounded-md bg-gradient-subtle grid place-items-center shrink-0">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        {isRenaming ? (
          <InlineRename
            value={field.name}
            onSave={(v) => {
              schemaApi.patchField(entity, field.id, { name: v });
              setRenaming(false);
            }}
            onCancel={() => setRenaming(false)}
          />
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate">{field.name}</span>
                {field.builtin && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                    built-in
                  </span>
                )}
                {field.required && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    required
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{meta.label}</p>
            </div>
            <select
              value={field.type}
              onChange={(e) =>
                schemaApi.patchField(entity, field.id, {
                  type: e.target.value as FieldType,
                })
              }
              className="h-7 text-xs rounded-md border border-border bg-card px-2 outline-none focus:border-ring transition shrink-0"
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-muted-foreground">Req</span>
              <Toggle
                size="sm"
                checked={field.required}
                onChange={(v) => schemaApi.patchField(entity, field.id, { required: v })}
              />
            </div>
            <Toggle
              checked={field.enabled}
              onChange={(v) => schemaApi.patchField(entity, field.id, { enabled: v })}
            />
            <button
              onClick={onEdit}
              className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0"
              aria-label="Rename"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {!field.builtin && (
              <button
                onClick={() => schemaApi.removeField(entity, field.id)}
                className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive transition shrink-0"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}
      </div>
      {(field.type === "select" || field.type === "multiselect") && field.enabled && (
        <div className="px-3 pb-3 ml-9 border-t border-border/60 pt-2">
          <p className="text-[11px] text-muted-foreground mb-1.5">Options (comma-separated)</p>
          <Input
            value={(field.options ?? []).join(", ")}
            onChange={(e) =>
              schemaApi.patchField(entity, field.id, {
                options: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Option A, Option B…"
            className="h-8 text-sm"
          />
        </div>
      )}
    </div>
  );
};

/* ---------- Field list with add row ---------- */
const FieldList = ({
  entity,
}: {
  entity: "projects" | "links" | "tasks" | "commands";
}) => {
  const schema = useSchema();
  const fields = schema[entity].fields;
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<FieldType>("text");
  const { dragIndex, overIndex, handlers } = useReorder((f, t) =>
    schemaApi.reorderField(entity, f, t),
  );

  const handleAdd = () => {
    if (!newName.trim()) return;
    schemaApi.addField(entity, newName, newType);
    setNewName("");
    setNewType("text");
  };

  return (
    <div className="space-y-1.5">
      {fields.map((field, i) => (
        <FieldCard
          key={field.id}
          entity={entity}
          field={field}
          onEdit={() => setRenamingId(field.id)}
          isRenaming={renamingId === field.id}
          setRenaming={(v) => setRenamingId(v ? field.id : null)}
          dragHandlers={handlers(i)}
          isDragging={dragIndex === i}
          isOver={overIndex === i && dragIndex !== null && dragIndex !== i}
        />
      ))}
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 flex flex-wrap items-center gap-2">
        <Plus className="h-4 w-4 text-muted-foreground" />
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Field name"
          className="h-8 flex-1 min-w-[140px]"
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as FieldType)}
          className="h-8 text-xs rounded-md border border-border bg-card px-2 outline-none focus:border-ring transition"
        >
          {FIELD_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="text-xs btn-gradient rounded-md px-3 py-1.5 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add field
        </button>
      </div>
    </div>
  );
};

/* ---------- Status row ---------- */
const StatusRow = ({
  status,
  isRenaming,
  setRenaming,
  dragHandlers,
  isDragging,
  isOver,
}: {
  status: { id: string; name: string; color: StatusColor };
  isRenaming: boolean;
  setRenaming: (v: boolean) => void;
  dragHandlers: any;
  isDragging: boolean;
  isOver: boolean;
}) => {
  const colorMeta = STATUS_COLORS.find((c) => c.id === status.color) ?? STATUS_COLORS[0];
  return (
    <div
      {...dragHandlers}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-background/50 px-2.5 py-2 transition",
        isDragging && "opacity-50",
        isOver ? "border-primary/60 bg-accent/40" : "border-border",
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/60 cursor-grab active:cursor-grabbing shrink-0" />
      <span
        className={cn(
          "text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0",
          colorMeta.className,
        )}
      >
        {status.name || "—"}
      </span>
      {isRenaming ? (
        <InlineRename
          value={status.name}
          onSave={(v) => {
            schemaApi.renameStatus(status.id, v);
            setRenaming(false);
          }}
          onCancel={() => setRenaming(false)}
        />
      ) : (
        <>
          <span className="text-sm flex-1 truncate">{status.name}</span>
          <div className="flex items-center gap-1 shrink-0">
            {STATUS_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => schemaApi.setStatusColor(status.id, c.id)}
                title={c.label}
                className={cn(
                  "h-5 w-5 rounded-full border-2 transition",
                  c.className,
                  status.color === c.id
                    ? "border-foreground shadow-glow"
                    : "border-transparent hover:border-border",
                )}
              />
            ))}
          </div>
          <button
            onClick={() => setRenaming(true)}
            className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => schemaApi.removeStatus(status.id)}
            className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive transition shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
};

/* ---------- Project schema panel ---------- */
const ProjectSchema = () => {
  const schema = useSchema();
  const [renamingStatus, setRenamingStatus] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const { dragIndex, overIndex, handlers } = useReorder((f, t) =>
    schemaApi.reorderStatus(f, t),
  );
  const [acctEmail, setAcctEmail] = useState("");
  const [acctLabel, setAcctLabel] = useState("");

  return (
    <div className="space-y-6">
      {/* Statuses */}
      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold mb-1">Statuses</h4>
          <p className="text-xs text-muted-foreground">
            Define lifecycle states. Drag to reorder, pick a color, rename inline.
          </p>
        </div>
        <div className="space-y-1.5">
          {schema.projects.statuses.map((s, i) => (
            <StatusRow
              key={s.id}
              status={s}
              isRenaming={renamingStatus === s.id}
              setRenaming={(v) => setRenamingStatus(v ? s.id : null)}
              dragHandlers={handlers(i)}
              isDragging={dragIndex === i}
              isOver={overIndex === i && dragIndex !== null && dragIndex !== i}
            />
          ))}
        </div>
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <Input
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                schemaApi.addStatus(newStatus);
                setNewStatus("");
              }
            }}
            placeholder="Add status (e.g. Backlog)"
            className="h-8 border-0 bg-transparent focus-visible:ring-0 px-0 text-sm"
          />
          <button
            onClick={() => {
              schemaApi.addStatus(newStatus);
              setNewStatus("");
            }}
            disabled={!newStatus.trim()}
            className="text-xs btn-gradient rounded-md px-3 py-1.5 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </section>

      {/* Fields */}
      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold mb-1">Fields</h4>
          <p className="text-xs text-muted-foreground">
            Define the fields that appear on every project. New projects use these immediately.
          </p>
        </div>
        <FieldList entity="projects" />
      </section>

      {/* Accounts */}
      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold mb-1 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary" />
            Accounts
          </h4>
          <p className="text-xs text-muted-foreground">
            Reusable identities you can attach to projects via reference fields.
          </p>
        </div>
        <div className="space-y-1.5">
          {schema.projects.accounts.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-2.5 py-2"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-primary grid place-items-center shrink-0 text-[10px] font-semibold text-primary-foreground shadow-glow">
                {(a.label || a.email).slice(0, 2).toUpperCase()}
              </div>
              <Input
                value={a.label}
                onChange={(e) => schemaApi.patchAccount(a.id, { label: e.target.value })}
                placeholder="Label"
                className="h-7 text-sm flex-1"
              />
              <Input
                value={a.email}
                onChange={(e) => schemaApi.patchAccount(a.id, { email: e.target.value })}
                placeholder="email@…"
                className="h-7 text-sm flex-[1.5]"
              />
              <button
                onClick={() => schemaApi.removeAccount(a.id)}
                className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive transition shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 flex flex-wrap items-center gap-2">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <Input
            value={acctLabel}
            onChange={(e) => setAcctLabel(e.target.value)}
            placeholder="Label"
            className="h-8 flex-1 min-w-[120px]"
          />
          <Input
            value={acctEmail}
            onChange={(e) => setAcctEmail(e.target.value)}
            placeholder="email@…"
            className="h-8 flex-[1.5] min-w-[180px]"
          />
          <button
            onClick={() => {
              schemaApi.addAccount(acctEmail, acctLabel);
              setAcctEmail("");
              setAcctLabel("");
            }}
            disabled={!acctEmail.trim()}
            className="text-xs btn-gradient rounded-md px-3 py-1.5 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add account
          </button>
        </div>
      </section>
    </div>
  );
};

/* ---------- Tasks schema ---------- */
const TaskSchema = () => {
  const schema = useSchema();
  const items: { key: "folders" | "tags" | "priority"; label: string; desc: string; icon: any }[] = [
    { key: "folders", label: "Folders", desc: "Group tasks into folders.", icon: Folders },
    { key: "tags", label: "Tags", desc: "Attach colored tags to tasks.", icon: TagIcon },
    { key: "priority", label: "Priority", desc: "Mark tasks as low / medium / high.", icon: Flag },
  ];
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold mb-1">Capabilities</h4>
          <p className="text-xs text-muted-foreground">Toggle built-in task features.</p>
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
                checked={schema.tasks[key]}
                onChange={() => schemaApi.toggleTaskFeature(key)}
              />
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold mb-1">Custom fields</h4>
          <p className="text-xs text-muted-foreground">Extra fields on every task.</p>
        </div>
        <FieldList entity="tasks" />
      </section>
    </div>
  );
};

/* ---------- Command schema ---------- */
const CommandSchema = () => {
  const schema = useSchema();
  const [newCat, setNewCat] = useState("");
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold mb-1">Categories</h4>
          <p className="text-xs text-muted-foreground">
            Buckets for organizing CLI snippets.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {schema.commands.categories.map((c) => (
            <span
              key={c}
              className="group inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-muted text-foreground font-medium"
            >
              {c}
              <button
                onClick={() => schemaApi.removeCommandCategory(c)}
                className="text-muted-foreground hover:text-destructive transition"
                aria-label={`Remove ${c}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <Input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                schemaApi.addCommandCategory(newCat);
                setNewCat("");
              }
            }}
            placeholder="Add category (e.g. cleanup)"
            className="h-8 border-0 bg-transparent focus-visible:ring-0 px-0 text-sm"
          />
          <button
            onClick={() => {
              schemaApi.addCommandCategory(newCat);
              setNewCat("");
            }}
            disabled={!newCat.trim()}
            className="text-xs btn-gradient rounded-md px-3 py-1.5 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </section>
      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold mb-1">Fields</h4>
          <p className="text-xs text-muted-foreground">Shape of each command snippet.</p>
        </div>
        <FieldList entity="commands" />
      </section>
    </div>
  );
};

/* ---------- Main builder ---------- */
export const SchemaBuilder = () => {
  return (
    <div className="rounded-lg border border-border bg-card shadow-card p-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-semibold mb-1 flex items-center gap-1.5">
            <span className="text-base">🧠</span> Schema Builder
          </h2>
          <p className="text-xs text-muted-foreground">
            Define custom fields, statuses and structures. Add forms across the workspace adapt automatically.
          </p>
        </div>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-9 mb-5">
          <TabsTrigger value="projects" className="text-xs">Projects</TabsTrigger>
          <TabsTrigger value="links" className="text-xs">Links</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs">Tasks</TabsTrigger>
          <TabsTrigger value="commands" className="text-xs">Commands</TabsTrigger>
        </TabsList>
        <TabsContent value="projects"><ProjectSchema /></TabsContent>
        <TabsContent value="links">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold mb-1">Fields</h4>
              <p className="text-xs text-muted-foreground">
                Add, remove and reorder fields used by every link.
              </p>
            </div>
            <FieldList entity="links" />
          </div>
        </TabsContent>
        <TabsContent value="tasks"><TaskSchema /></TabsContent>
        <TabsContent value="commands"><CommandSchema /></TabsContent>
      </Tabs>
    </div>
  );
};

export default SchemaBuilder;