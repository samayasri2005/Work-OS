import { Plus, Sparkles } from "lucide-react";

export const CustomWidgets = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button className="rounded-2xl p-5 animate-fade-in border border-dashed border-border hover:border-foreground/30 hover:bg-card/50 text-left group transition">
        <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center mb-3 group-hover:bg-background transition">
          <Plus className="h-4 w-4 text-foreground" />
        </div>
        <p className="text-sm font-semibold">Add Widget</p>
        <p className="text-xs text-muted-foreground mt-0.5">Customize your command center with new modules.</p>
      </button>

      <div className="relative overflow-hidden rounded-2xl p-5 animate-fade-in border border-border bg-card/80 backdrop-blur shadow-card">
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-primary opacity-20 blur-2xl" />
        <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center mb-3 shadow-glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <p className="text-sm font-semibold flex items-center gap-2">
          AI Assistant
          <span className="text-[10px] bg-gradient-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-semibold">Soon</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Smart suggestions, briefings, and daily summaries.</p>
      </div>
    </div>
  );
};
