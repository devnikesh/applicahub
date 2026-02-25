import { Bell, Moon, Sun, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

interface Props {
  onOpenSearch: () => void;
}

export function TopBar({ onOpenSearch }: Props) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "U";

  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  return (
    <header className="h-14 border-b flex items-center gap-4 px-4 bg-card">
      <SidebarTrigger />

      {/* Search trigger — opens ⌘K dialog */}
      <button
        onClick={onOpenSearch}
        className="flex-1 max-w-md flex items-center gap-2 text-left bg-muted/50 rounded-lg h-9 px-3 border border-transparent hover:border-border transition-colors group"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-sm text-muted-foreground">Search applicants…</span>
        <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground bg-background border rounded px-1.5 py-0.5">
          {isMac ? "⌘" : "Ctrl"}
          <span>K</span>
        </kbd>
      </button>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => (window.location.href = "/settings")}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
