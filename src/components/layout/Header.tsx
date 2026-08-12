"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, Plus, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
  };
  unreadNotifications?: number;
}

export function Header({ user, unreadNotifications = 0 }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cmd+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  return (
    <header className="h-[var(--header-height)] fixed top-0 right-0 left-0 md:left-[var(--sidebar-width)] z-20 bg-surface/80 backdrop-blur-md border-b border-border flex items-center px-4 gap-3 transition-all duration-200 ease-in-out">
      {/* Mobile logo */}
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden flex-shrink-0">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
            <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.7" />
            <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.7" />
            <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" />
          </svg>
        </div>
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-primary transition-colors" />
          <input
            id="global-search"
            type="search"
            placeholder="Search projects, tasks, people…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-9 pl-9 pr-12 text-sm rounded-lg border",
              "bg-surface-alt text-text-primary shadow-sm",
              "border-border placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "transition-all duration-150"
            )}
            aria-label="Global search"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] font-mono text-text-muted pointer-events-none">
            <span className="border border-border bg-surface rounded px-1.5 py-0.5 font-medium shadow-sm">⌘K</span>
          </kbd>
        </div>
      </form>

      <div className="ml-auto flex items-center gap-2">
        {/* Create */}
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => router.push("/projects/new")}
          className="hidden sm:flex shadow-sm"
        >
          New Project
        </Button>
        <Button
          variant="primary"
          size="icon"
          onClick={() => router.push("/projects/new")}
          className="sm:hidden shadow-sm"
          aria-label="Create new project"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative text-text-secondary hover:text-text-primary hover:bg-surface-alt" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-danger border-2 border-surface rounded-full" />
            )}
          </Button>
        </Link>

        {/* User menu */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 h-9 px-1.5 rounded-lg hover:bg-surface-alt transition-colors border border-transparent hover:border-border-subtle"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <Avatar name={user.name} src={user.avatar} size="xs" className="ring-0" />
            <ChevronDown className="h-4 w-4 text-text-muted hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in slide-in-up">
              <div className="px-4 py-3 border-b border-border bg-surface-alt/50">
                <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                <p className="text-xs text-text-muted truncate mt-0.5">{user.email}</p>
              </div>
              <div className="p-1.5">
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </div>
              <div className="p-1.5 border-t border-border">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-danger-subtle hover:text-danger transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
