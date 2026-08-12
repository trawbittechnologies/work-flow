"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FolderKanban, CheckSquare, Settings, Users, MessageSquare } from "lucide-react";
import { Modal } from "./Modal";
import { cn } from "@/lib/utils";

const commands = [
  { label: "Create Task", icon: CheckSquare, shortcut: "T", action: "/tasks/new" },
  { label: "Create Project", icon: FolderKanban, shortcut: "P", action: "/projects/new" },
  { label: "Go to Projects", icon: FolderKanban, shortcut: "G P", action: "/projects" },
  { label: "Go to Chat", icon: MessageSquare, shortcut: "G C", action: "/chat" },
  { label: "Go to Team", icon: Users, shortcut: "G T", action: "/team" },
  { label: "Settings", icon: Settings, shortcut: "G S", action: "/settings" },
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
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg" className="p-0 overflow-hidden bg-surface/95 backdrop-blur-xl border-border shadow-2xl">
      <div className="flex items-center px-4 py-3 border-b border-border">
        <Search className="h-5 w-5 text-text-muted mr-3" />
        <input
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-base text-text-primary placeholder:text-text-muted"
          placeholder="Type a command or search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-text-muted bg-surface-alt px-1.5 py-0.5 rounded border border-border shadow-sm">
          ESC
        </kbd>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-2">
        {filteredCommands.length === 0 ? (
          <p className="text-center text-sm text-text-muted py-8">No results found.</p>
        ) : (
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Suggestions
            </div>
            {filteredCommands.map((cmd) => (
              <button
                key={cmd.label}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary-subtle group transition-colors"
                onClick={() => executeCommand(cmd.action)}
              >
                <div className="flex items-center gap-3">
                  <cmd.icon className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                    {cmd.label}
                  </span>
                </div>
                {cmd.shortcut && (
                  <div className="flex items-center gap-1">
                    {cmd.shortcut.split(" ").map((key) => (
                      <kbd key={key} className="text-[10px] font-mono text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border group-hover:border-primary/20 shadow-sm">
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
