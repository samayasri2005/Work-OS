import { CheckCircle2, Circle, Clock, Tag } from "lucide-react";
import { format, parseISO, isPast, isToday } from "date-fns";
import { WorkOsTask } from "@/lib/firestoreData";
import { useTasksStore } from "@/lib/tasksStore";
import { cn } from "@/lib/utils";

interface TaskRowProps {
  task: WorkOsTask;
  onClick?: () => void;
}

const priorityColors = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export function TaskRow({ task, onClick }: TaskRowProps) {
  const toggleDone = useTasksStore((s) => s.toggleTaskDone);
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
  const dueToday = task.dueDate && isToday(parseISO(task.dueDate));

  return (
    <div
      onClick={onClick}
      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 border border-transparent hover:border-border transition-colors cursor-pointer"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleDone(task.id);
        }}
        className="mt-0.5 text-muted-foreground/50 hover:text-green-500 transition-colors shrink-0"
      >
        {task.done ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className={cn("text-sm font-medium", task.done && "line-through text-muted-foreground")}>
          {task.title}
        </div>
        
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1 text-[11px] font-medium",
              isOverdue ? "text-red-500" : dueToday ? "text-green-500" : "text-muted-foreground"
            )}>
              <Clock className="h-3 w-3" />
              {isOverdue ? "Yesterday" : format(parseISO(task.dueDate), "MMM d")}
            </div>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              {task.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-md">
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center">
        <span className={cn(
          "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border",
          priorityColors[task.priority]
        )}>
          {task.priority === "medium" ? "Med" : task.priority}
        </span>
      </div>
    </div>
  );
}
