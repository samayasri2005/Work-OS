import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const events = [
  { time: "09:30", title: "Standup", tag: "Team" },
  { time: "11:00", title: "Design review", tag: "Design" },
  { time: "14:30", title: "1:1 with Alex", tag: "1:1" },
];

export const CalendarWidget = () => {
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

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur shadow-card animate-fade-in">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-base font-semibold">Calendar</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="h-7 w-7 rounded-full border border-border grid place-items-center hover:bg-accent transition" aria-label="Previous month">
            <ChevronLeft className="h-3 w-3" />
          </button>
          <span className="text-xs font-semibold px-2 min-w-[110px] text-center tabular-nums">{monthName}</span>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="h-7 w-7 rounded-full border border-border grid place-items-center hover:bg-accent transition" aria-label="Next month">
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-5 pt-1">
        <div className="grid grid-cols-7 gap-0.5 text-center mb-3">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i} className="text-[10px] text-muted-foreground font-semibold py-1 uppercase">{d}</span>
          ))}
          {cells.map((d, i) => (
            <div key={i} className="aspect-square">
              {d && (
                <button className={cn(
                  "w-full h-full rounded-full text-xs font-medium transition tabular-nums",
                  isToday(d)
                    ? "bg-gradient-primary text-primary-foreground shadow-glow font-semibold"
                    : "hover:bg-accent text-foreground/75",
                )}>
                  {d}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-1 pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Today</p>
          {events.map((e, i) => {
            const dot = ["bg-primary", "bg-secondary", "bg-[hsl(195_85%_60%)]"][i % 3];
            return (
              <div key={i} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-accent/60 transition">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <span className="text-xs text-muted-foreground tabular-nums w-10 font-medium">{e.time}</span>
                <span className="text-xs font-medium flex-1 truncate">{e.title}</span>
                <span className="text-[10px] text-muted-foreground border border-border px-2 py-0.5 rounded-full">{e.tag}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
