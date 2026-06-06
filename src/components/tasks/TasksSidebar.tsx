import { Inbox, CalendarDays, CalendarClock, Folder, Plus, Trash2 } from "lucide-react";
import { useTasksStore } from "@/lib/tasksStore";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TasksSidebarProps {
  activeView: string;
  onSelectView: (viewId: string) => void;
}

export function TasksSidebar({ activeView, onSelectView }: TasksSidebarProps) {
  const folders = useTasksStore((s) => s.folders);
  const addFolder = useTasksStore((s) => s.addFolder);
  const deleteFolder = useTasksStore((s) => s.deleteFolder);
  const [isAdding, setIsAdding] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName("");
      setIsAdding(false);
    }
  };

  return (
    <div className="w-64 border-r border-border bg-card/50 h-full p-4 flex flex-col gap-6 rounded-l-lg">
      <div className="space-y-1">
        <SidebarItem
          icon={<Inbox className="h-4 w-4" />}
          label="Inbox"
          isActive={activeView === "inbox"}
          onClick={() => onSelectView("inbox")}
          accent="text-blue-500"
        />
        <SidebarItem
          icon={<CalendarDays className="h-4 w-4" />}
          label="Today"
          isActive={activeView === "today"}
          onClick={() => onSelectView("today")}
          accent="text-green-500"
        />
        <SidebarItem
          icon={<CalendarClock className="h-4 w-4" />}
          label="Upcoming"
          isActive={activeView === "upcoming"}
          onClick={() => onSelectView("upcoming")}
          accent="text-purple-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Folders</h3>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-1">
          {folders.map((f) => (
            <div key={f.id} className="group flex items-center">
              <div className="flex-1">
                <SidebarItem
                  icon={<Folder className="h-4 w-4" />}
                  label={f.name}
                  isActive={activeView === f.id}
                  onClick={() => onSelectView(f.id)}
                />
              </div>
              <button
                onClick={() => deleteFolder(f.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {isAdding && (
            <form onSubmit={handleAddFolder} className="px-2 mt-2">
              <input
                autoFocus
                type="text"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={() => setIsAdding(false)}
                className="w-full bg-secondary text-sm px-2 py-1.5 rounded-md border border-border focus:outline-none focus:border-primary transition-colors"
              />
            </form>
          )}
          {folders.length === 0 && !isAdding && (
            <p className="text-xs text-muted-foreground px-2 py-2">No folders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  isActive,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
      )}
    >
      <span className={cn(isActive && accent)}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
