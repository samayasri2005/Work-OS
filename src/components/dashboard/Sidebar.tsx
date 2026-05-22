import { useState } from "react";
import {
  LayoutGrid, CheckSquare, StickyNote, Link2, Calendar, Settings,
  Sparkles, FolderKanban, KeyRound, ChevronDown, Check, Plus, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { useWorkspaces, useActiveWorkspace, workspacesApi } from "@/lib/workspacesStore";

const EMOJI_OPTIONS = ["💼", "🚀", "🤝", "🎯", "🛠️", "📦", "🌐", "💡", "🔥", "⚡"];

const navItems = [
  { label: "Dashboard", icon: LayoutGrid, to: "/" },
  { label: "Tasks",     icon: CheckSquare, to: "/tasks" },
  { label: "Projects",  icon: FolderKanban, to: "/projects" },
  { label: "Accounts",  icon: KeyRound, to: "/accounts" },
  { label: "Notes",     icon: StickyNote, to: "/notes" },
  { label: "Links",     icon: Link2, to: "/links" },
  { label: "Calendar",  icon: Calendar, to: "/calendar" },
  { label: "Settings",  icon: Settings, to: "/settings" },
];

export const Sidebar = () => {
  const workspaces = useWorkspaces();
  const activeId = useActiveWorkspace();
  const active = workspaces.find((w) => w.id === activeId);

  const [wsOpen, setWsOpen] = useState(false);
  const [addingWs, setAddingWs] = useState(false);
  const [wsName, setWsName] = useState("");
  const [wsEmoji, setWsEmoji] = useState("💼");

  const handleAddWs = () => {
    if (!wsName.trim()) return;
    workspacesApi.add(wsName.trim(), wsEmoji);
    setWsName("");
    setWsEmoji("💼");
    setAddingWs(false);
    setWsOpen(false);
  };

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 px-3 py-5 gap-4 bg-sidebar border-r border-sidebar-border">
      {/* Workspace switcher */}
      <div className="relative px-1">
        <button
          onClick={() => setWsOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <div className="h-8 w-8 rounded-md bg-gradient-primary grid place-items-center text-primary-foreground shrink-0 shadow-glow">
            <span className="text-[15px]">{active?.emoji ?? "💼"}</span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[13px] font-semibold tracking-tight truncate">{active?.name ?? "Work OS"}</div>
            <div className="text-[10px] text-muted-foreground truncate">Workspace</div>
          </div>
          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0", wsOpen && "rotate-180")} />
        </button>

        {wsOpen && (
          <div className="absolute left-0 right-0 mt-1.5 z-30 rounded-xl border border-border bg-popover shadow-elev p-1 animate-fade-in">
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => { workspacesApi.setActive(w.id); setWsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary text-sm transition-colors"
              >
                <span className="text-base leading-none">{w.emoji}</span>
                <span className="flex-1 text-left truncate font-medium">{w.name}</span>
                {w.id === activeId && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
              </button>
            ))}

            <div className="my-1 h-px bg-border" />

            {addingWs ? (
              <div className="px-2 py-2 space-y-2">
                <div className="flex flex-wrap gap-1 mb-1">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setWsEmoji(e)}
                      className={cn(
                        "h-7 w-7 rounded-md text-base grid place-items-center transition",
                        wsEmoji === e ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-secondary"
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input
                    autoFocus
                    value={wsName}
                    onChange={(e) => setWsName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddWs(); if (e.key === "Escape") setAddingWs(false); }}
                    placeholder="Workspace name"
                    className="flex-1 text-xs bg-secondary border border-border rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button onClick={handleAddWs} className="px-2 py-1.5 rounded-md bg-foreground text-background text-xs font-medium">
                    Add
                  </button>
                  <button onClick={() => setAddingWs(false)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingWs(true)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-secondary text-sm text-muted-foreground transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> New workspace
              </button>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold text-muted-foreground px-2 mb-1 uppercase tracking-wider">Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-gradient-primary" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer promo */}
      <div className="mt-auto relative overflow-hidden rounded-2xl p-4 bg-gradient-primary text-primary-foreground shadow-glow">
        <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/10 blur-xl" />
        <p className="text-sm font-semibold relative">Upgrade to Pro</p>
        <p className="text-[11px] opacity-80 mt-0.5 leading-snug relative">Unlock unlimited widgets & cloud sync.</p>
        <button className="relative mt-3 w-full rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm transition text-xs font-medium py-1.5 border border-white/20">
          Learn more
        </button>
      </div>
    </aside>
  );
};
