import { useState } from "react";
import { Github, Cloud, Trello, Figma, Mail, Calendar, Plus, Globe } from "lucide-react";

interface Shortcut { id: string; name: string; url: string; icon: any; }

const seed: Shortcut[] = [
  { id: "1", name: "GitHub", url: "https://github.com", icon: Github },
  { id: "2", name: "Jira", url: "https://atlassian.com", icon: Trello },
  { id: "3", name: "GCP", url: "https://cloud.google.com", icon: Cloud },
  { id: "4", name: "Figma", url: "https://figma.com", icon: Figma },
  { id: "5", name: "Mail", url: "https://mail.google.com", icon: Mail },
  { id: "6", name: "Cal", url: "https://calendar.google.com", icon: Calendar },
];

export const LinksWidget = () => {
  const [links, setLinks] = useState<Shortcut[]>(seed);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const add = () => {
    if (!name.trim() || !url.trim()) return;
    setLinks([...links, { id: crypto.randomUUID(), name, url, icon: Globe }]);
    setName(""); setUrl(""); setAdding(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur shadow-card animate-fade-in">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Shortcuts</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Quick access</p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="text-[11px] border border-border bg-background rounded-full px-3 py-1 hover:bg-accent transition font-medium"
        >
          + Add
        </button>
      </div>

      <div className="px-5 pb-5 pt-1">
        {adding && (
          <div className="flex gap-2 mb-4 animate-fade-in">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name"
              className="flex-1 text-xs rounded-full bg-background border border-border px-3 py-1.5 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" />
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://"
              className="flex-[2] text-xs rounded-full bg-background border border-border px-3 py-1.5 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" />
            <button onClick={add} className="rounded-full btn-gradient px-4 text-xs font-medium">Save</button>
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-background/60 hover:border-foreground/20 hover:-translate-y-0.5 hover:shadow-sm transition"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-subtle grid place-items-center group-hover:bg-gradient-primary transition">
                  <Icon className="h-4 w-4 text-foreground group-hover:text-primary-foreground transition" strokeWidth={2} />
                </div>
                <span className="text-[11px] font-medium truncate max-w-full">{l.name}</span>
              </a>
            );
          })}
          <button
            onClick={() => setAdding(true)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-foreground/30 text-muted-foreground hover:text-foreground transition"
          >
            <div className="h-9 w-9 rounded-xl grid place-items-center bg-muted/60">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-[11px]">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
