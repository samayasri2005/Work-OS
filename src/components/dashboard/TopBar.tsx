import { Search, Sun, Moon, Bell, Pencil } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  breadcrumb?: string;
  title?: string;
  action?: { label: string; icon?: React.ReactNode; onClick?: () => void } | null;
}

export const TopBar = ({
  breadcrumb = "Dashboard / Overview",
  title = "Hello, Thomas",
  action = { label: "Edit Dashboard", icon: <Pencil className="h-3.5 w-3.5" /> },
}: TopBarProps) => {
  const { theme, toggle } = useTheme();

  // Split title into greeting + name for gradient effect (e.g. "Hello, Thomas")
  const renderTitle = () => {
    const match = title.match(/^(.*?,\s*)(.+)$/);
    if (match) {
      const isHello = /hello/i.test(match[1]);
      return (
        <>
          <span>{match[1]}</span>
          <span className="text-gradient">{match[2]}</span>
          {isHello && <span className="ml-2 inline-block animate-wave origin-bottom-right">👋</span>}
        </>
      );
    }
    return title;
  };

  return (
    <header className="flex items-center gap-4 mb-7 animate-fade-in">
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium">{breadcrumb}</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-0.5 truncate">
          {renderTitle()}
        </h1>
      </div>

      <div className="flex-1 hidden md:flex justify-center">
        <div className="relative w-full max-w-md rounded-full border border-border bg-card/80 backdrop-blur px-4 py-2 flex items-center gap-2 shadow-sm hover:shadow-md transition">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks, notes, links…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
          <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">⌘K</kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          className="rounded-full h-9 w-9 border-border bg-card/80 backdrop-blur"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" className="rounded-full h-9 w-9 relative border-border bg-card/80 backdrop-blur" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-gradient-primary" />
        </Button>
        {action && (
          <Button
            className="rounded-full h-9 btn-gradient gap-1.5 text-xs font-medium px-4 border-0"
            onClick={action.onClick}
          >
            {action.icon}
            <span className="hidden sm:inline">{action.label}</span>
          </Button>
        )}
      </div>
    </header>
  );
};
