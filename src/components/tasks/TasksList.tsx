import { useMemo, useState } from "react";
import { useTasksStore } from "@/lib/tasksStore";
import { WorkOsTask } from "@/lib/firestoreData";
import { TaskRow } from "./TaskRow";
import { QuickAdd } from "./QuickAdd";
import { isPast, isToday, isFuture, parseISO, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface TasksListProps {
  viewId: string; // 'inbox', 'today', 'upcoming', or a folderId
}

export function TasksList({ viewId }: TasksListProps) {
  const allTasks = useTasksStore((s) => s.tasks);
  const folders = useTasksStore((s) => s.folders);
  
  const [showCompleted, setShowCompleted] = useState(false);

  // Filter tasks based on viewId
  const viewTasks = useMemo(() => {
    return allTasks.filter((t) => {
      // Don't show subtasks in the main list top level, they should appear inside TaskDetails (unless we flatten them)
      // For now we will show all if parentId is empty
      if (t.parentId) return false;

      if (viewId === "inbox") return !t.folderId;
      if (viewId === "today") {
        if (!t.dueDate) return false;
        const date = parseISO(t.dueDate);
        return isToday(date) || (isPast(date) && !isToday(date));
      }
      if (viewId === "upcoming") {
        if (!t.dueDate) return false;
        const date = parseISO(t.dueDate);
        return isFuture(date) && !isToday(date);
      }
      // Otherwise it's a folderId
      return t.folderId === viewId;
    });
  }, [allTasks, viewId]);

  const activeTasks = viewTasks.filter((t) => !t.done);
  const completedTasks = viewTasks.filter((t) => t.done);

  // Group active tasks
  const overdue: WorkOsTask[] = [];
  const today: WorkOsTask[] = [];
  const upcoming: WorkOsTask[] = [];
  const noDate: WorkOsTask[] = [];

  activeTasks.forEach((t) => {
    if (!t.dueDate) {
      noDate.push(t);
    } else {
      const date = parseISO(t.dueDate);
      if (isToday(date)) today.push(t);
      else if (isPast(date)) overdue.push(t);
      else upcoming.push(t);
    }
  });

  const getTitle = () => {
    if (viewId === "inbox") return "Inbox";
    if (viewId === "today") return "Today";
    if (viewId === "upcoming") return "Upcoming";
    const folder = folders.find((f) => f.id === viewId);
    return folder ? folder.name : "Tasks";
  };

  const defaultDate = viewId === "today" ? new Date().toISOString() : undefined;
  const targetFolderId = viewId === "today" || viewId === "upcoming" ? "inbox" : viewId;

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-[900px] mx-auto w-full">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{getTitle()}</h1>
      </header>

      <div className="space-y-8">
        {overdue.length > 0 && (
          <TaskSection title="Overdue" tasks={overdue} tone="danger" />
        )}
        
        {today.length > 0 && (
          <TaskSection title="Today" tasks={today} tone="accent" />
        )}
        
        {upcoming.length > 0 && viewId !== "today" && (
          <TaskSection title="Upcoming" tasks={upcoming} tone="muted" />
        )}
        
        {noDate.length > 0 && viewId !== "today" && viewId !== "upcoming" && (
          <TaskSection title="No Date" tasks={noDate} tone="muted" />
        )}

        {activeTasks.length === 0 && (
          <div className="py-8 text-center text-muted-foreground border border-dashed border-border rounded-lg bg-secondary/20">
            <p className="text-sm">All caught up! No active tasks here.</p>
          </div>
        )}

        <div className="pt-2">
          <QuickAdd folderId={targetFolderId} defaultDate={defaultDate} />
        </div>

        {completedTasks.length > 0 && (
          <div className="pt-8 border-t border-border mt-8">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 hover:text-foreground transition-colors"
            >
              Completed ({completedTasks.length}) {showCompleted ? "▼" : "▶"}
            </button>
            {showCompleted && (
              <div className="space-y-1 opacity-70">
                {completedTasks.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskSection({ title, tasks, tone }: { title: string; tasks: WorkOsTask[]; tone: "danger" | "accent" | "muted" }) {
  const toneClass =
    tone === "danger" ? "text-red-500" :
    tone === "accent" ? "text-green-500" :
    "text-muted-foreground";

  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h3 className={cn("text-xs font-bold uppercase tracking-wider mb-3 px-1", toneClass)}>
        {title}
      </h3>
      <div className="space-y-1">
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
      </div>
    </section>
  );
}
