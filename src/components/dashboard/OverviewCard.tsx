import { CheckSquare, StickyNote, Link2, Timer } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  delta: string;
  icon: any;
  progress: number;
  iconBg: string;
  iconColor: string;
  barFrom: string;
  barTo: string;
}

const stats: Stat[] = [
  { label: "Tasks today", value: "12", delta: "+3", icon: CheckSquare, progress: 65,
    iconBg: "bg-[hsl(270_80%_94%)] dark:bg-[hsl(270_45%_22%)]",
    iconColor: "text-[hsl(262_83%_55%)] dark:text-[hsl(280_85%_75%)]",
    barFrom: "from-[hsl(280_85%_70%)]", barTo: "to-[hsl(330_85%_70%)]" },
  { label: "Notes", value: "48", delta: "+5", icon: StickyNote, progress: 80,
    iconBg: "bg-[hsl(210_90%_94%)] dark:bg-[hsl(210_50%_22%)]",
    iconColor: "text-[hsl(217_91%_55%)] dark:text-[hsl(217_91%_75%)]",
    barFrom: "from-[hsl(217_91%_60%)]", barTo: "to-[hsl(195_85%_60%)]" },
  { label: "Links saved", value: "127", delta: "+12", icon: Link2, progress: 42,
    iconBg: "bg-[hsl(158_60%_92%)] dark:bg-[hsl(158_40%_20%)]",
    iconColor: "text-[hsl(158_64%_38%)] dark:text-[hsl(158_64%_70%)]",
    barFrom: "from-[hsl(158_64%_50%)]", barTo: "to-[hsl(180_64%_50%)]" },
  { label: "Focus time", value: "4.2h", delta: "+18%", icon: Timer, progress: 72,
    iconBg: "bg-[hsl(25_95%_92%)] dark:bg-[hsl(25_50%_22%)]",
    iconColor: "text-[hsl(25_92%_50%)] dark:text-[hsl(25_92%_70%)]",
    barFrom: "from-[hsl(35_92%_55%)]", barTo: "to-[hsl(15_92%_60%)]" },
];

export const OverviewCard = () => {
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur shadow-card animate-fade-in">
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h2 className="text-base font-semibold">Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Your activity at a glance</p>
        </div>
        <span className="text-[11px] text-muted-foreground border border-border px-3 py-1 rounded-full font-medium bg-background/60">This week</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="group rounded-xl border border-border bg-background/60 p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`h-10 w-10 rounded-xl grid place-items-center ${s.iconBg}`}>
                  <Icon className={`h-5 w-5 ${s.iconColor}`} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                  {s.delta}
                </span>
              </div>
              <p className="text-3xl font-bold tracking-tight tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
              <div className="h-1 rounded-full bg-muted overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${s.barFrom} ${s.barTo} transition-all duration-700`}
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
