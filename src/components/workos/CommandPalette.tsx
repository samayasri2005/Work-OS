import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  FolderKanban,
  Link2,
  Terminal,
  KeyRound,
  LayoutGrid,
  CheckSquare,
  StickyNote,
  Calendar,
  Settings,
  Lightbulb,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useProjects } from "@/lib/projectsStore";
import { useSchema } from "@/lib/schemaStore";
import { useCaptures } from "@/lib/captureStore";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onQuickCapture: () => void;
}

const navTargets = [
  { label: "Dashboard", to: "/", icon: LayoutGrid },
  { label: "Tasks", to: "/tasks", icon: CheckSquare },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "Notes", to: "/notes", icon: StickyNote },
  { label: "Links", to: "/links", icon: Link2 },
  { label: "Accounts", to: "/accounts", icon: KeyRound },
  { label: "Calendar", to: "/calendar", icon: Calendar },
  { label: "Settings", to: "/settings", icon: Settings },
];

export const CommandPalette = ({ open, onOpenChange, onQuickCapture }: Props) => {
  const navigate = useNavigate();
  const projects = useProjects();
  const schema = useSchema();
  const captures = useCaptures();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const allCommands = useMemo(
    () =>
      projects.flatMap((p) =>
        p.commands.map((c) => ({ ...c, projectId: p.id, projectName: p.name })),
      ),
    [projects],
  );
  const allLinks = useMemo(
    () =>
      projects.flatMap((p) =>
        p.links.map((l) => ({ ...l, projectId: p.id, projectName: p.name })),
      ),
    [projects],
  );

  const run = (fn: () => void) => {
    onOpenChange(false);
    setTimeout(fn, 50);
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: label });
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 max-w-2xl border-border/60 bg-popover/95 backdrop-blur-xl">
        <Command className="bg-transparent [&_[cmdk-item]]:rounded-md [&_[cmdk-item]]:gap-2">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Type a command, project, link…"
          />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No matches.</CommandEmpty>

            <CommandGroup heading="Quick Actions">
              <CommandItem onSelect={() => run(onQuickCapture)}>
                <Lightbulb className="h-4 w-4 text-warning" />
                <span>Quick capture…</span>
                <span className="ml-auto text-[10px] text-muted-foreground font-mono">N</span>
              </CommandItem>
              <CommandItem onSelect={() => run(() => navigate("/projects"))}>
                <FolderKanban className="h-4 w-4 text-primary" />
                <span>New project</span>
              </CommandItem>
            </CommandGroup>

            {projects.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Projects">
                  {projects.slice(0, 8).map((p) => (
                    <CommandItem
                      key={p.id}
                      value={`project ${p.name} ${p.stack.join(" ")}`}
                      onSelect={() => run(() => navigate(`/projects/${p.id}`))}
                    >
                      <FolderKanban className="h-4 w-4 text-primary" />
                      <span>{p.name}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground truncate max-w-[200px]">
                        {p.stack.slice(0, 3).join(" · ")}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {allCommands.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Commands">
                  {allCommands.map((c) => (
                    <CommandItem
                      key={c.id}
                      value={`command ${c.label} ${c.command} ${c.projectName}`}
                      onSelect={() => run(() => copy(c.command, c.command))}
                    >
                      <Terminal className="h-4 w-4 text-success" />
                      <span className="font-mono text-xs">{c.command}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
                        {c.projectName}
                        <Copy className="h-3 w-3" />
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {allLinks.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Links">
                  {allLinks.map((l) => (
                    <CommandItem
                      key={l.id}
                      value={`link ${l.label} ${l.url} ${l.projectName}`}
                      onSelect={() => run(() => window.open(l.url, "_blank"))}
                    >
                      <Link2 className="h-4 w-4 text-info" />
                      <span>{l.label}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1 truncate max-w-[240px]">
                        {l.url}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {schema.projects.accounts.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Accounts">
                  {schema.projects.accounts.map((a) => (
                    <CommandItem
                      key={a.id}
                      value={`account ${a.email} ${a.label}`}
                      onSelect={() => run(() => navigate("/accounts"))}
                    >
                      <KeyRound className="h-4 w-4 text-warning" />
                      <span>{a.email}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{a.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {captures.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Captures">
                  {captures.slice(0, 6).map((c) => (
                    <CommandItem
                      key={c.id}
                      value={`capture ${c.title} ${c.body ?? ""} ${c.command ?? ""}`}
                      onSelect={() => run(() => navigate("/"))}
                    >
                      <Lightbulb className="h-4 w-4 text-warning" />
                      <span>{c.title}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground uppercase">{c.kind}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            <CommandSeparator />
            <CommandGroup heading="Navigate">
              {navTargets.map((n) => {
                const Icon = n.icon;
                return (
                  <CommandItem
                    key={n.to}
                    value={`go ${n.label}`}
                    onSelect={() => run(() => navigate(n.to))}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>Go to {n.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          <div className="flex items-center justify-between px-3 py-2 border-t border-border/60 text-[10px] text-muted-foreground font-mono">
            <span>↑↓ navigate · ↵ select · esc close</span>
            <span>WorkOS · ⌘K</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
