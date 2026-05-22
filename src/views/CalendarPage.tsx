import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageLayout } from "@/components/dashboard/PageLayout";
import { cn } from "@/lib/utils";

interface Event { date: string; time: string; title: string; tag: string; color: string; }

const events: Event[] = [
  { date: "today", time: "09:30", title: "Daily standup", tag: "Team", color: "bg-primary" },
  { date: "today", time: "11:00", title: "Design review with Studio", tag: "Design", color: "bg-secondary" },
  { date: "today", time: "14:30", title: "1:1 with Alex", tag: "1:1", color: "bg-primary" },
  { date: "today", time: "16:00", title: "Roadmap planning", tag: "Strategy", color: "bg-secondary" },
  { date: "tomorrow", time: "10:00", title: "Customer interview", tag: "Research", color: "bg-primary" },
  { date: "tomorrow", time: "13:00", title: "Lunch with Sam", tag: "Personal", color: "bg-secondary" },
  { date: "this-week", time: "Wed 15:00", title: "Sprint demo", tag: "Team", color: "bg-primary" },
  { date: "this-week", time: "Fri 11:00", title: "Quarterly review", tag: "Strategy", color: "bg-secondary" },
];

const CalendarPage = () => {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const monthName = month.toLocaleString("en", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isToday = (d: number) =>
    d === today.getDate() &&
    month.getMonth() === today.getMonth() &&
    month.getFullYear() === today.getFullYear();

  const sections = [
    { key: "today", label: "Today" },
    { key: "tomorrow", label: "Tomorrow" },
    { key: "this-week", label: "This week" },
  ];

  return (
    <PageLayout
      breadcrumb="Workspace / Calendar"
      title="Calendar"
      action={{ label: "New Event", icon: <Plus className="h-3.5 w-3.5" /> }}
    >
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-lg border border-border bg-card shadow-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">{monthName}</h2>
              <div className="flex items-center gap-1">
                <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                  className="h-7 w-7 rounded-md border border-border grid place-items-center hover:bg-accent transition" aria-label="Previous month">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}
                  className="text-xs font-medium px-2.5 py-1 border border-border rounded-md hover:bg-accent transition">
                  Today
                </button>
                <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                  className="h-7 w-7 rounded-md border border-border grid place-items-center hover:bg-accent transition" aria-label="Next month">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <span key={d} className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider py-1">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((d, i) => (
                  <div key={i} className="aspect-square">
                    {d && (
                      <button className={cn(
                        "w-full h-full rounded-md text-sm font-medium transition tabular-nums border",
                        isToday(d)
                          ? "bg-gradient-primary text-primary-foreground shadow-glow border-transparent"
                          : "border-transparent hover:bg-accent hover:border-border text-foreground/80",
                      )}>
                        {d}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-4">
          {sections.map((s) => {
            const list = events.filter((e) => e.date === s.key);
            return (
              <div key={s.key} className="rounded-lg border border-border bg-card shadow-card">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{s.label}</h3>
                  <span className="text-[11px] text-muted-foreground tabular-nums">{list.length} events</span>
                </div>
                <ul className="p-3 space-y-1">
                  {list.map((e, i) => (
                    <li key={i} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition">
                      <span className={`h-2 w-2 rounded-full ${e.color}`} />
                      <span className="text-xs text-muted-foreground tabular-nums w-16">{e.time}</span>
                      <span className="text-sm font-medium flex-1 truncate">{e.title}</span>
                      <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded">{e.tag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

export default CalendarPage;