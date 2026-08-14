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

export function Drawer({ isOpen, onClose, title, children, width = "w-full sm:w-[500px]" }: DrawerProps) {
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          "relative ml-auto h-full bg-white border-l border-[#EAEDF2] shadow-2xl",
          "flex flex-col overflow-hidden slide-in-right",
          width,
          "max-w-[100vw]"
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[#EAEDF2] bg-[#F8F9FA] shrink-0">
            <h2 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel" className="hover:bg-white text-[#9CA3AF] hover:text-[#111827]">
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
