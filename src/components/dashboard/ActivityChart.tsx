import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { ArrowUpRight } from "lucide-react";

const data = [
  { day: "Mon", focus: 2.4, tasks: 5 },
  { day: "Tue", focus: 3.1, tasks: 8 },
  { day: "Wed", focus: 2.8, tasks: 6 },
  { day: "Thu", focus: 4.2, tasks: 11 },
  { day: "Fri", focus: 3.9, tasks: 9 },
  { day: "Sat", focus: 1.8, tasks: 4 },
  { day: "Sun", focus: 2.6, tasks: 7 },
];

export const ActivityChart = () => {
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur shadow-card animate-fade-in">
      <div className="flex items-start justify-between px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Weekly Activity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Focus hours & tasks completed</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-tight tabular-nums">20.8h</p>
          <p className="text-[11px] text-success bg-success/10 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold">
            <ArrowUpRight className="h-3 w-3" /> +18.3%
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-1">
        <div className="h-56 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tasksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary-glow))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--primary-glow))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "var(--shadow-lg)",
                }}
              />
              <Area type="monotone" dataKey="tasks" stroke="hsl(var(--primary-glow))" strokeWidth={1.5} fill="url(#tasksGrad)" />
              <Area type="monotone" dataKey="focus" stroke="url(#strokeGrad)" strokeWidth={2.5} fill="url(#focusGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" /> Focus hours</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: "hsl(var(--primary-glow))" }} /> Tasks done</span>
        </div>
      </div>
    </div>
  );
};
