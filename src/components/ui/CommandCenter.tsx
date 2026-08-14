"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FolderKanban, CheckSquare, Settings, Users, MessageSquare, LayoutGrid, Calendar, Clock, BarChart2 } from "lucide-react";
import { Modal } from "./Modal";
import { cn } from "@/lib/utils";

const commands = [
  { label: "Create Task", icon: CheckSquare, shortcut: "T", action: "/tasks" },
  { label: "Create Project", icon: FolderKanban, shortcut: "P", action: "/projects/new" },
  { label: "Go to Dashboard", icon: LayoutGrid, shortcut: "G D", action: "/dashboard" },
  { label: "Go to Projects", icon: FolderKanban, shortcut: "G P", action: "/projects" },
  { label: "Go to Tasks", icon: CheckSquare, shortcut: "G T", action: "/tasks" },
  { label: "Go to Kanban Board", icon: LayoutGrid, shortcut: "G B", action: "/board" },
  { label: "Go to Calendar", icon: Calendar, shortcut: "G K", action: "/calendar" },
  { label: "Go to Time Tracking", icon: Clock, shortcut: "G M", action: "/time-tracking" },
  { label: "Go to Analytics & Reports", icon: BarChart2, shortcut: "G R", action: "/reports" },
  { label: "Go to Chat & DMs", icon: MessageSquare, shortcut: "G C", action: "/chat" },
  { label: "Go to Team", icon: Users, shortcut: "G U", action: "/team" },
  { label: "Workspace Settings", icon: Settings, shortcut: "G S", action: "/settings" },
];

export function CommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  function executeCommand(action: string | (() => void)) {
    setIsOpen(false);
    setSearch("");
    if (typeof action === "string") {
      router.push(action);
    } else {
      action();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg" className="p-0 overflow-hidden bg-white border border-[#EAEDF2] shadow-2xl rounded-2xl">
      <div className="flex items-center px-4 py-3.5 border-b border-[#EAEDF2]">
        <Search className="h-4.5 w-4.5 text-[#9CA3AF] mr-3 shrink-0" />
        <input
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-[#111827] placeholder:text-[#9CA3AF] font-medium"
          placeholder="Type a command or jump to page..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded border border-[#E5E7EB] shadow-2xs">
          ESC
        </kbd>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
        {filteredCommands.length === 0 ? (
          <p className="text-center text-xs text-[#9CA3AF] py-8 font-medium">No results found.</p>
        ) : (
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
              Quick Navigation & Actions
            </div>
            {filteredCommands.map((cmd) => (
              <button
                key={cmd.label}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F3F9DE] group transition-colors cursor-pointer text-left"
                onClick={() => executeCommand(cmd.action)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[#F3F4F6] group-hover:bg-white group-hover:text-[#88C315] flex items-center justify-center text-[#6B7280] transition-colors">
                    <cmd.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#111827] group-hover:text-[#111827]">
                    {cmd.label}
                  </span>
                </div>
                {cmd.shortcut && (
                  <div className="flex items-center gap-1">
                    {cmd.shortcut.split(" ").map((key) => (
                      <kbd key={key} className="text-[10px] font-mono font-bold text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded border border-[#E5E7EB] group-hover:bg-white transition-colors">
                        {key}
                      </kbd>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
