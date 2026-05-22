import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Note { id: string; text: string; }

const seed: Note[] = [
  { id: "1", text: "Idea: weekly review template with mood tracking" },
  { id: "2", text: "Read 'Designing Data-Intensive Apps' chapter 4" },
  { id: "3", text: "Call mom this weekend" },
];

const tints = [
  "bg-[hsl(270_80%_94%)] dark:bg-[hsl(270_35%_22%)] dark:text-[hsl(270_30%_92%)]",
  "bg-[hsl(210_90%_94%)] dark:bg-[hsl(210_45%_22%)] dark:text-[hsl(210_30%_92%)]",
  "bg-[hsl(25_95%_92%)] dark:bg-[hsl(25_45%_22%)] dark:text-[hsl(25_30%_92%)]",
  "bg-[hsl(150_60%_92%)] dark:bg-[hsl(150_30%_20%)] dark:text-[hsl(150_30%_92%)]",
];

export const NotesWidget = () => {
  const [notes, setNotes] = useState<Note[]>(seed);
  const [input, setInput] = useState("");

  const add = () => {
    if (!input.trim()) return;
    setNotes([{ id: crypto.randomUUID(), text: input.trim() }, ...notes]);
    setInput("");
  };

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur shadow-card animate-fade-in flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Quick Notes</h2>
          <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">{notes.length} saved</p>
        </div>
      </div>

      <div className="px-5 pt-1">
        <div className="flex gap-2 mb-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Jot a thought…"
            className="flex-1 text-sm rounded-full bg-background border border-border px-4 py-2 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition"
          />
          <button
            onClick={add}
            className="rounded-full btn-gradient h-9 w-9 grid place-items-center transition shrink-0"
            aria-label="Add note"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-5 grid grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-72 content-start">
        {notes.map((n, i) => (
          <div
            key={n.id}
            className={cn(
              "group relative rounded-xl p-3 border border-transparent hover:border-foreground/10 hover:-translate-y-0.5 transition shadow-sm",
              tints[i % tints.length],
            )}
          >
            <p className="text-xs leading-relaxed pr-4 text-foreground/85 font-medium">{n.text}</p>
            <button
              onClick={() => setNotes(notes.filter(x => x.id !== n.id))}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-foreground/60 hover:text-destructive transition"
              aria-label="Remove note"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
