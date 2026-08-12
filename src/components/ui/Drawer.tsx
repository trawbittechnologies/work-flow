"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}

export function Drawer({ isOpen, onClose, title, children, width = "w-[500px]" }: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          "relative ml-auto h-full bg-surface border-l border-border shadow-2xl",
          "flex flex-col overflow-hidden slide-in-right",
          width,
          "max-w-[100vw]"
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface-alt/50 flex-shrink-0">
            <h2 className="text-lg font-bold text-text-primary tracking-tight">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel" className="hover:bg-surface text-text-muted hover:text-text-primary">
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
