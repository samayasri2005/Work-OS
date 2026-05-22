import { useState, useEffect } from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveWorkspace } from "@/lib/workspacesStore";
import {
  fetchTasks,
  saveTask,
  deleteTask,
  type WorkOsTask,
} from "@/lib/firestoreData";

type Priority = "high" | "medium" | "low";

const priorityStyles: Record<Priority, string> = {
  high: "bg-[hsl(0_85%_95%)] text-[hsl(0_72%_50%)] dark:bg-[hsl(0_50%_20%)] dark:text-[hsl(0_85%_75%)]",
  medium: "bg-[hsl(35_95%_92%)] text-[hsl(25_92%_45%)] dark:bg-[hsl(25_50%_20%)] dark:text-[hsl(35_92%_75%)]",
  low: "bg-[hsl(158_60%_92%)] text-[hsl(158_64%_35%)] dark:bg-[hsl(158_40%_18%)] dark:text-[hsl(158_64%_70%)]",
};

export const TasksWidget = () => {
  const { user } = useAuth();
  const activeWorkspaceId = useActiveWorkspace();
  const [tasks, setTasks] = useState<WorkOsTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  // Load tasks from Firestore
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchTasks(user.uid)
      .then((loaded) => {
        // Sort: incomplete first, then by createdAt desc
        const sorted = loaded.sort((a, b) => {
          if (a.done !== b.done) return a.done ? 1 : -1;
          return b.createdAt - a.createdAt;
        });
        setTasks(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Filter tasks by active workspace ID
  const workspaceTasks = tasks.filter((t) => t.workspaceId === activeWorkspaceId);

  const add = async () => {
    if (!user || !input.trim() || !activeWorkspaceId) return;
    const newTask: WorkOsTask = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspaceId,
      title: input.trim(),
      done: false,
      priority,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    setInput("");
    await saveTask(user.uid, newTask).catch(console.error);
  };

  const toggle = async (id: string) => {
    if (!user) return;
    const updatedTasks = tasks.map((t) => {
      if (t.id === id) {
        const next = { ...t, done: !t.done };
        saveTask(user.uid, next).catch(console.error);
        return next;
      }
      return t;
    });
    setTasks(updatedTasks);
  };

  const remove = async (id: string) => {
    if (!user) return;
    setTasks(tasks.filter((t) => t.id !== id));
    await deleteTask(user.uid, id).catch(console.error);
  };

  const doneCount = workspaceTasks.filter((t) => t.done).length;

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur shadow-card animate-fade-in flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Today's Tasks</h2>
          <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
            {loading ? "Loading…" : `${doneCount}/${workspaceTasks.length} completed`}
          </p>
        </div>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="text-[11px] bg-background border border-border rounded-full px-3 py-1 outline-none cursor-pointer hover:bg-accent transition font-medium"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="px-5 pt-1">
        <div className="flex gap-2 mb-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a task…"
            className="flex-1 text-sm rounded-full bg-background border border-border px-4 py-2 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition placeholder:text-muted-foreground"
          />
          <button
            onClick={add}
            className="rounded-full btn-gradient h-9 w-9 grid place-items-center transition shrink-0"
            aria-label="Add task"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground text-center py-8">Loading tasks…</div>
      ) : workspaceTasks.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-8">No tasks in this workspace</div>
      ) : (
        <ul className="px-3 pb-3 space-y-0.5 flex-1 overflow-y-auto max-h-72">
          {workspaceTasks.map((t) => (
            <li
              key={t.id}
              className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/60 transition"
            >
              <button
                onClick={() => toggle(t.id)}
                className={cn(
                  "h-5 w-5 rounded-full border-2 grid place-items-center transition shrink-0",
                  t.done ? "bg-gradient-primary border-transparent shadow-glow" : "border-border hover:border-primary",
                )}
              >
                {t.done && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
              </button>
              <span className={cn("text-sm flex-1 truncate", t.done && "line-through text-muted-foreground")}>
                {t.title}
              </span>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize", priorityStyles[t.priority])}>
                {t.priority}
              </span>
              <button
                onClick={() => remove(t.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                aria-label="Delete task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
