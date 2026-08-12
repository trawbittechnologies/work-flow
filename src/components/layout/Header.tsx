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
    <header className="h-[56px] fixed top-0 right-0 left-0 md:left-[240px] z-20 bg-[var(--surface)]/90 backdrop-blur-sm border-b border-[var(--border)] flex items-center px-4 gap-3">
      {/* Mobile logo */}
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden flex-shrink-0">
        <div className="h-7 w-7 bg-[var(--primary)] rounded-[8px] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
            <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.7" />
            <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.7" />
            <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" />
          </svg>
        </div>
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input
            id="global-search"
            type="search"
            placeholder="Search projects, tasks, people…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-8 pl-8 pr-12 text-sm rounded-[8px] border",
              "bg-[var(--background)] text-[var(--text-primary)]",
              "border-[var(--border)] placeholder:text-[var(--text-muted)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]",
              "transition-colors duration-150"
            )}
            aria-label="Global search"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] font-mono text-[var(--text-muted)] pointer-events-none">
            <span className="border border-[var(--border)] rounded px-1 py-0.5">⌘K</span>
          </kbd>
        </div>
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Create */}
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => router.push("/projects/new")}
          className="hidden sm:flex"
        >
          New Project
        </Button>
        <Button
          variant="primary"
          size="icon"
          onClick={() => router.push("/projects/new")}
          className="sm:hidden"
          aria-label="Create new project"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-[var(--primary)] rounded-full" />
            )}
          </Button>
        </Link>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-1.5 h-8 px-1.5 rounded-[8px] hover:bg-[var(--background)] transition-colors"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <Avatar name={user.name} src={user.avatar} size="xs" className="ring-0" />
            <ChevronDown className="h-3 w-3 text-[var(--text-muted)] hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] shadow-lg overflow-hidden z-50 animate-in slide-in-up">
              <div className="px-3 py-2.5 border-b border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
              </div>
              <div className="p-1">
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] text-sm text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] text-sm text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
              </div>
              <div className="p-1 border-t border-[var(--border)]">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] text-sm text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
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
