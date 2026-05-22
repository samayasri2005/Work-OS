import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { CommandPalette } from "./CommandPalette";
import { QuickCapture } from "./QuickCapture";
import { Zap, Command as CmdIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Ctx {
  openPalette: () => void;
  openCapture: () => void;
}
const WorkOSCtx = createContext<Ctx | null>(null);

export const useWorkOS = () => {
  const c = useContext(WorkOSCtx);
  if (!c) throw new Error("WorkOS provider missing");
  return c;
};

export const WorkOSProvider = ({ children }: { children: ReactNode }) => {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const openCapture = useCallback(() => setCaptureOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setCaptureOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <WorkOSCtx.Provider value={{ openPalette, openCapture }}>
      {children}

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onQuickCapture={() => setCaptureOpen(true)}
      />
      <QuickCapture open={captureOpen} onOpenChange={setCaptureOpen} />

      {/* Floating quick actions */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2 items-end">
        <button
          onClick={openPalette}
          className={cn(
            "group flex items-center gap-2 rounded-full border border-border bg-card/90 backdrop-blur",
            "shadow-card hover:shadow-glow transition px-3 py-2 text-xs text-muted-foreground hover:text-foreground",
          )}
          aria-label="Open command palette"
        >
          <CmdIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="text-[9px] px-1 py-0.5 rounded bg-muted font-mono">⌘K</kbd>
        </button>
        <button
          onClick={openCapture}
          className={cn(
            "h-12 w-12 rounded-full bg-gradient-primary text-primary-foreground shadow-glow",
            "grid place-items-center hover:scale-105 active:scale-95 transition",
          )}
          aria-label="Quick capture"
          title="Quick capture (⌘⇧N)"
        >
          <Zap className="h-5 w-5" />
        </button>
      </div>
    </WorkOSCtx.Provider>
  );
};
