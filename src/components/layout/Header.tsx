"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, Plus, ChevronDown, User, Settings, LogOut, LayoutGrid } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
    <header className="h-[var(--header-height)] fixed top-0 right-0 left-0 md:left-[var(--sidebar-width)] z-20 bg-surface/90 backdrop-blur-xl border-b border-border flex items-center px-4 md:px-6 gap-3 transition-all duration-200 ease-in-out">
      {/* Mobile logo */}
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden flex-shrink-0">
        <div className="h-8 w-8 bg-[#0A1237] rounded-xl flex items-center justify-center shadow-sm text-[#C3D946]">
          <LayoutGrid className="h-4 w-4" />
        </div>
      </Link>

      {/* Global Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-[#0A1237] dark:group-focus-within:text-[#C3D946] transition-colors" />
          <input
            id="global-search"
            type="search"
            placeholder="Search projects, tasks, people…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-9 pl-9 pr-12 text-xs rounded-xl border font-medium",
              "bg-surface-alt/70 text-text-primary shadow-xs",
              "border-border placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-surface",
              "transition-all duration-150"
            )}
            aria-label="Global search"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] font-mono text-text-muted pointer-events-none">
            <span className="border border-border bg-surface rounded px-1.5 py-0.5 font-medium shadow-xs">⌘K</span>
          </kbd>
        </div>
      </form>

      <div className="ml-auto flex items-center gap-2">
        {/* Create CTA Button with Lime Background */}
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => router.push("/projects/new")}
          className="hidden sm:flex shadow-sm hover:scale-102"
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

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative text-text-secondary hover:text-text-primary hover:bg-surface-alt" aria-label="Notifications">
            <Bell className="h-4.5 w-4.5 text-text-secondary" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#C3D946] border border-surface rounded-full animate-pulse" />
            )}
          </Button>
        </Link>

        {/* User menu */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 h-9 px-1.5 rounded-xl hover:bg-surface-alt transition-colors border border-transparent hover:border-border-subtle cursor-pointer"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <Avatar name={user.name} src={user.avatar} size="xs" className="ring-1 ring-border" />
            <ChevronDown className="h-3.5 w-3.5 text-text-muted hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden z-50 scale-in">
              <div className="px-4 py-3 border-b border-border bg-[#0A1237] text-white">
                <p className="text-xs font-bold truncate">{user.name}</p>
                <p className="text-[11px] text-[#828EA8] truncate mt-0.5">{user.email}</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
                >
                  <User className="h-4 w-4 text-text-muted" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
                >
                  <Settings className="h-4 w-4 text-text-muted" />
                  Settings
                </Link>
              </div>
              <div className="p-1.5 border-t border-border bg-surface-alt/30">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-danger-subtle hover:text-danger transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-danger/80" />
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
