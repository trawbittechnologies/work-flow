"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md animate-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        ref={ref}
        className={cn(
          "relative w-full max-w-[calc(100vw-1.5rem)] z-10 bg-white rounded-2xl shadow-2xl border border-[#EAEDF2] overflow-hidden flex flex-col max-h-[90vh]",
          "scale-in",
          sizeMap[size],
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between p-4 sm:p-5 border-b border-[#EAEDF2] bg-[#F8F9FA] shrink-0">
            <div>
              {title && (
                <h2 id="modal-title" className="text-sm sm:text-base font-bold text-[#111827] tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 leading-relaxed">{description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close dialog"
              className="ml-3 sm:ml-4 shrink-0 text-[#9CA3AF] hover:text-[#111827] hover:bg-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex gap-2.5 sm:gap-3 justify-end pt-2">
        <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-xs">
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading} className="text-xs">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
