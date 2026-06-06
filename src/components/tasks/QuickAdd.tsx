import { useState } from "react";
import { Plus, Tag, Flag, Calendar } from "lucide-react";
import { useTasksStore } from "@/lib/tasksStore";
import { cn } from "@/lib/utils";

interface QuickAddProps {
  folderId?: string;
  defaultDate?: string;
}

export function QuickAdd({ folderId, defaultDate }: QuickAddProps) {
  const addTask = useTasksStore((s) => s.addTask);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [tagsInput, setTagsInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    addTask({
      title: title.trim(),
      priority,
      folderId: folderId === "inbox" ? undefined : folderId,
      dueDate: defaultDate,
      tags: tags.length > 0 ? tags : undefined,
    });

    setTitle("");
    setTagsInput("");
    setPriority("medium");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-3 w-full p-3 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
      >
        <div className="h-5 w-5 rounded-full border border-dashed border-muted-foreground group-hover:border-primary flex items-center justify-center transition-colors">
          <Plus className="h-3 w-3" />
        </div>
        <span className="text-sm font-medium">Add task...</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg bg-card p-3 shadow-card animate-in fade-in zoom-in-95 duration-200">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="w-full bg-transparent border-none text-sm font-medium focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60 mb-3"
      />
      
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center bg-secondary rounded-md px-2 py-1 flex-1">
          <Tag className="h-3.5 w-3.5 text-muted-foreground mr-2" />
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags (comma separated)..."
            className="bg-transparent border-none text-xs focus:outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPriority((p) => (p === "low" ? "medium" : p === "medium" ? "high" : "low"))}
            className={cn(
              "p-1.5 rounded-md border transition-colors flex items-center gap-1.5 text-xs font-medium",
              priority === "high" ? "bg-red-500/10 text-red-500 border-red-500/20" :
              priority === "medium" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
              "bg-blue-500/10 text-blue-500 border-blue-500/20"
            )}
          >
            <Flag className="h-3 w-3" />
            Priority {priority}
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add task
          </button>
        </div>
      </div>
    </form>
  );
}
