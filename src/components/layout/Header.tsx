"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

interface HeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
    role?: "ADMIN" | "MEMBER";
  };
  unreadNotifications?: number;
}

export function Header({ user, unreadNotifications = 8 }: HeaderProps) {
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

  // Cmd+K or Ctrl+K to focus search
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

  const displayName = user.name || "Athul Krishna";
  const displayRole = user.role === "ADMIN" ? "Admin" : "Member";

  return (
    <header className="h-[var(--header-height)] fixed top-0 right-0 left-0 md:left-[var(--sidebar-width)] z-20 bg-[#F6F8FA] flex items-center justify-between px-6 transition-all duration-200 ease-in-out border-b border-transparent">
      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] group-focus-within:text-[#111827] transition-colors" />
          <input
            id="global-search"
            type="search"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-10 pl-10 pr-20 text-[13px] rounded-xl border font-medium",
              "bg-white text-[#111827] shadow-2xs",
              "border-[#E5E7EB] placeholder:text-[#9CA3AF]",
              "focus:outline-none focus:ring-2 focus:ring-[#94CB1E]/30 focus:border-[#94CB1E]",
              "transition-all duration-150"
            )}
            aria-label="Global search"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[11px] font-medium text-[#9CA3AF] pointer-events-none">
            <span className="bg-transparent px-1 py-0.5">Ctrl + K</span>
          </div>
        </div>
      </form>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <Link
          href="/notifications"
          className="relative h-10 w-10 rounded-full bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] flex items-center justify-center transition-colors shadow-2xs"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 h-4.5 min-w-[18px] px-1 bg-[#88C315] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
              {unreadNotifications > 99 ? "99+" : unreadNotifications}
            </span>
          )}
        </Link>

        {/* Chat Bubble */}
        <Link
          href="/chat"
          className="h-10 w-10 rounded-full bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] flex items-center justify-center transition-colors shadow-2xs"
          aria-label="Chat"
        >
          <MessageSquare className="h-4.5 w-4.5" />
        </Link>

        {/* User Profile Dropdown Button */}
        <div className="relative ml-2" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/80 transition-colors border border-transparent cursor-pointer"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <Avatar
              name={displayName}
              src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              size="sm"
              className="h-9 w-9 ring-1 ring-border rounded-full"
            />
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-bold text-[#111827] leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-[#6B7280] leading-none mt-0.5">
                {displayRole}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-[#9CA3AF] hidden sm:block ml-1" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden z-50 animate-in">
              <div className="px-4 py-3 border-b border-[#F3F4F6] bg-[#FAFAFA]">
                <p className="text-xs font-bold text-[#111827] truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                  {user.email}
                </p>
              </div>
              <div className="p-1.5 space-y-0.5">
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 text-[#9CA3AF]" />
                    Admin Portal
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
                >
                  <User className="h-4 w-4 text-[#9CA3AF]" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
                >
                  <Settings className="h-4 w-4 text-[#9CA3AF]" />
                  Settings
                </Link>
              </div>
              <div className="p-1.5 border-t border-[#F3F4F6]">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-[#EF4444]" />
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
