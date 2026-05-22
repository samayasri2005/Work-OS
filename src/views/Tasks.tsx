import { CheckSquare, Plus } from "lucide-react";
import { PageLayout } from "@/components/dashboard/PageLayout";
import { TasksWidget } from "@/components/dashboard/TasksWidget";

const stats = [
  { label: "Total", value: "24" },
  { label: "In progress", value: "8" },
  { label: "Completed", value: "12", accent: true },
  { label: "Overdue", value: "4" },
];

const Tasks = () => {
  return (
    <PageLayout
      breadcrumb="Workspace / Tasks"
      title="Tasks"
      action={{ label: "New Task", icon: <Plus className="h-3.5 w-3.5" /> }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card shadow-card p-4">
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            <p className={`text-2xl font-semibold tracking-tight tabular-nums mt-1 ${s.accent ? "text-gradient" : ""}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7">
          <TasksWidget />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-lg border border-border bg-card shadow-card p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Productivity tips</h2>
            </div>
            <ul className="space-y-3 text-sm text-foreground/80">
              <li className="flex gap-3">
                <span className="h-5 w-5 shrink-0 rounded-md bg-gradient-primary text-primary-foreground text-[11px] font-semibold grid place-items-center">1</span>
                Break large tasks into 25-minute focus blocks.
              </li>
              <li className="flex gap-3">
                <span className="h-5 w-5 shrink-0 rounded-md bg-gradient-primary text-primary-foreground text-[11px] font-semibold grid place-items-center">2</span>
                Tag the top 3 priorities at the start of every day.
              </li>
              <li className="flex gap-3">
                <span className="h-5 w-5 shrink-0 rounded-md bg-gradient-primary text-primary-foreground text-[11px] font-semibold grid place-items-center">3</span>
                Review completed tasks every Friday afternoon.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Tasks;