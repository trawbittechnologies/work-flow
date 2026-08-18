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
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg" className="p-0 overflow-hidden bg-white dark:bg-[#071A49] border border-[#DDE2D8] dark:border-[#1E3A7B] shadow-2xl rounded-[2px]">
      <div className="flex items-center px-4 py-3.5 border-b border-[#DDE2D8] dark:border-[#1E3A7B]">
        <Search className="h-4.5 w-4.5 text-[#8E99A8] mr-3 shrink-0" />
        <input
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-[#071A49] dark:text-[#F8F9F6] placeholder:text-[#8E99A8] font-medium"
          placeholder="Type a command or jump to page..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold text-[#586274] dark:text-[#A6B4C9] bg-[#F0F2EC] dark:bg-[#0D2561] px-1.5 py-0.5 rounded-[2px] border border-[#DDE2D8] dark:border-[#1E3A7B] shadow-2xs">
          ESC
        </kbd>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin bg-tech-grid">
        {filteredCommands.length === 0 ? (
          <p className="text-center text-xs text-[#8E99A8] py-8 font-medium">No results found.</p>
        ) : (
          <div className="space-y-0.5">
            <div className="px-3 py-1.5 text-[10px] font-bold text-[#8E99A8] uppercase tracking-wider">
              Quick Navigation & Actions
            </div>
            {filteredCommands.map((cmd) => (
              <button
                key={cmd.label}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[2px] hover:bg-[#F1F8CE] dark:hover:bg-[#182B00] group transition-colors cursor-pointer text-left border border-transparent hover:border-[#B7D600]"
                onClick={() => executeCommand(cmd.action)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-[2px] bg-[#F0F2EC] dark:bg-[#0D2561] group-hover:bg-white group-hover:text-[#071A49] dark:group-hover:text-[#B7D600] flex items-center justify-center text-[#586274] transition-colors border border-[#DDE2D8]/60">
                    <cmd.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#071A49] dark:text-[#F8F9F6] group-hover:text-[#071A49]">
                    {cmd.label}
                  </span>
                </div>
                {cmd.shortcut && (
                  <div className="flex items-center gap-1">
                    {cmd.shortcut.split(" ").map((key) => (
                      <kbd key={key} className="text-[10px] font-mono font-bold text-[#586274] bg-[#F0F2EC] dark:bg-[#0D2561] px-1.5 py-0.5 rounded-[2px] border border-[#DDE2D8] group-hover:bg-white group-hover:border-[#071A49] transition-colors">
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
