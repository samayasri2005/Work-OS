import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Lightbulb, FolderKanban, StickyNote, Link2, Terminal, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { captureApi, CaptureKind } from "@/lib/captureStore";
import { projectsApi, emptyProject } from "@/lib/projectsStore";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const kinds: { id: CaptureKind | "project"; label: string; icon: any; hint: string }[] = [
  { id: "idea", label: "Idea", icon: Lightbulb, hint: "Brain-dump" },
  { id: "project", label: "Project", icon: FolderKanban, hint: "Spin up" },
  { id: "note", label: "Note", icon: StickyNote, hint: "Quick thought" },
  { id: "link", label: "Link", icon: Link2, hint: "Bookmark" },
  { id: "command", label: "Command", icon: Terminal, hint: "Snippet" },
];

export const QuickCapture = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [kind, setKind] = useState<(typeof kinds)[number]["id"]>("idea");
  const [title, setTitle] = useState("");
  const [extra, setExtra] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setExtra("");
      setKind("idea");
    }
  }, [open]);

  const save = () => {
    if (!title.trim()) return;
    if (kind === "project") {
      const p = { ...emptyProject(), name: title.trim(), description: extra };
      projectsApi.upsert(p);
      toast({ title: "Project created", description: title });
      onOpenChange(false);
      navigate(`/projects/${p.id}`);
      return;
    }
    captureApi.add({
      kind,
      title: title.trim(),
      body: kind === "note" || kind === "idea" ? extra : undefined,
      url: kind === "link" ? extra : undefined,
      command: kind === "command" ? extra : undefined,
    });
    toast({ title: "Captured", description: `${kind} saved` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border/60 bg-popover/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-warning" />
            Quick Capture
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          {kinds.map((k) => {
            const Icon = k.icon;
            const active = k === kinds.find((x) => x.id === kind);
            return (
              <button
                key={k.id}
                onClick={() => setKind(k.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card/50 text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {k.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-2 mt-2">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              kind === "command"
                ? "Command label (e.g. Deploy)"
                : kind === "link"
                  ? "Link title"
                  : "What's on your mind?"
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
            }}
          />
          {kind === "link" && (
            <Input
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="https://…"
            />
          )}
          {kind === "command" && (
            <Input
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="npm run deploy"
              className="font-mono text-xs"
            />
          )}
          {(kind === "idea" || kind === "note" || kind === "project") && (
            <Textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="Add detail (optional)"
              rows={3}
            />
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-muted-foreground font-mono">⌘↵ to save</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={!title.trim()}>
              Save {kind}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
