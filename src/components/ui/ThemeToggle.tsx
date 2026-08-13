"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showText?: boolean;
}

export function ThemeToggle({ className, showText = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-8 w-8 rounded-lg bg-surface-alt animate-pulse flex-shrink-0",
          className
        )}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex items-center justify-center gap-2 h-8 px-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-all duration-150 border border-transparent hover:border-border-subtle active:scale-95",
        className
      )}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45 flex-shrink-0" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-600 transition-transform duration-200 -rotate-12 hover:rotate-0 flex-shrink-0" />
      )}
      {showText && (
        <span className="text-xs font-medium capitalize">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
