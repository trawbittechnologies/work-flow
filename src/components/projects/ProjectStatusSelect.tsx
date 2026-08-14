"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export type ProjectStatusType =
  | "PLANNING"
  | "NOT_STARTED"
  | "PENDING"
  | "IN_PROGRESS"
  | "TESTING"
  | "ON_HOLD"
  | "REVIEW"
  | "COMPLETED"
  | "ARCHIVED"
  | "REOPENED"
  | "CANCELLED";

interface ProjectStatusSelectProps {
  projectId?: string;
  initialStatus: string;
  onStatusChange?: (newStatus: string) => void;
  className?: string;
  size?: "sm" | "md";
  dropdownAlign?: "left" | "right";
  disabled?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; badgeClass: string; dotClass: string; value: string }
> = {
  IN_PROGRESS: {
    label: "Progressing",
    badgeClass: "bg-[#F3F9DE] text-[#659A08] hover:bg-[#EAF5CE]",
    dotClass: "bg-[#88C315]",
    value: "IN_PROGRESS",
  },
  "In Progress": {
    label: "Progressing",
    badgeClass: "bg-[#F3F9DE] text-[#659A08] hover:bg-[#EAF5CE]",
    dotClass: "bg-[#88C315]",
    value: "IN_PROGRESS",
  },
  PENDING: {
    label: "Pending",
    badgeClass: "bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7]",
    dotClass: "bg-[#F59E0B]",
    value: "PENDING",
  },
  PLANNING: {
    label: "Pending",
    badgeClass: "bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7]",
    dotClass: "bg-[#F59E0B]",
    value: "PLANNING",
  },
  Pending: {
    label: "Pending",
    badgeClass: "bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7]",
    dotClass: "bg-[#F59E0B]",
    value: "PLANNING",
  },
  NOT_STARTED: {
    label: "Pending",
    badgeClass: "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]",
    dotClass: "bg-[#9CA3AF]",
    value: "NOT_STARTED",
  },
  TESTING: {
    label: "Testing",
    badgeClass: "bg-[#ECFEFF] text-[#0891B2] hover:bg-[#CFFAFE]",
    dotClass: "bg-[#06B6D4]",
    value: "TESTING",
  },
  ON_HOLD: {
    label: "Hold",
    badgeClass: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
    dotClass: "bg-[#9CA3AF]",
    value: "ON_HOLD",
  },
  "On Hold": {
    label: "Hold",
    badgeClass: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
    dotClass: "bg-[#9CA3AF]",
    value: "ON_HOLD",
  },
  REVIEW: {
    label: "Review",
    badgeClass: "bg-[#EDE9FE] text-[#7C3AED] hover:bg-[#E4DEFD]",
    dotClass: "bg-[#7C3AED]",
    value: "REVIEW",
  },
  IN_REVIEW: {
    label: "Review",
    badgeClass: "bg-[#EDE9FE] text-[#7C3AED] hover:bg-[#E4DEFD]",
    dotClass: "bg-[#7C3AED]",
    value: "REVIEW",
  },
  COMPLETED: {
    label: "Complete",
    badgeClass: "bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5]",
    dotClass: "bg-[#10B981]",
    value: "COMPLETED",
  },
  Completed: {
    label: "Complete",
    badgeClass: "bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5]",
    dotClass: "bg-[#10B981]",
    value: "COMPLETED",
  },
  REOPENED: {
    label: "Re-Open",
    badgeClass: "bg-[#FFF7ED] text-[#EA580C] hover:bg-[#FFEDD5]",
    dotClass: "bg-[#F97316]",
    value: "REOPENED",
  },
  CANCELLED: {
    label: "Cancel",
    badgeClass: "bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]",
    dotClass: "bg-[#EF4444]",
    value: "CANCELLED",
  },
  ARCHIVED: {
    label: "Archived",
    badgeClass: "bg-[#F3F4F6] text-[#9CA3AF] hover:bg-[#E5E7EB]",
    dotClass: "bg-[#9CA3AF]",
    value: "ARCHIVED",
  },
};

const selectableStatuses = [
  { value: "IN_PROGRESS", label: "Progressing", dot: "bg-[#88C315]" },
  { value: "PLANNING", label: "Pending", dot: "bg-[#F59E0B]" },
  { value: "TESTING", label: "Testing", dot: "bg-[#06B6D4]" },
  { value: "ON_HOLD", label: "Hold", dot: "bg-[#9CA3AF]" },
  { value: "REVIEW", label: "Review", dot: "bg-[#7C3AED]" },
  { value: "COMPLETED", label: "Complete", dot: "bg-[#10B981]" },
  { value: "REOPENED", label: "Re-Open", dot: "bg-[#F97316]" },
  { value: "CANCELLED", label: "Cancel", dot: "bg-[#EF4444]" },
];

export function ProjectStatusSelect({
  projectId,
  initialStatus,
  onStatusChange,
  className,
  size = "sm",
  dropdownAlign = "left",
  disabled = false,
}: ProjectStatusSelectProps) {
  const router = useRouter();
  const { success, error: errToast } = useToast();
  const [prevInitial, setPrevInitial] = useState(initialStatus);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);

  if (prevInitial !== initialStatus) {
    setPrevInitial(initialStatus);
    setCurrentStatus(initialStatus);
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    openUpwards: boolean;
  }>({
    top: 0,
    left: 0,
    openUpwards: false,
  });

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 280 && rect.top > 280;
      setCoords({
        top: openUp ? rect.top : rect.bottom,
        left: dropdownAlign === "right" ? rect.right - 190 : rect.left,
        openUpwards: openUp,
      });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    function handleScrollOrResize() {
      updateCoords();
    }
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isUpdating || isPending) return;
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen((prev) => !prev);
  };

  const config =
    statusConfig[currentStatus] ||
    statusConfig.IN_PROGRESS;

  async function handleStatusSelect(newStatus: string) {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);
    setIsOpen(false);
    onStatusChange?.(newStatus);

    if (projectId) {
      setIsUpdating(true);
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
          throw new Error("Failed to update status");
        }

        success(
          "Status updated",
          `Project status changed to ${statusConfig[newStatus]?.label || newStatus}`
        );

        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        console.error(error);
        setCurrentStatus(previousStatus);
        errToast(
          "Error updating status",
          "Could not update project status. Please try again."
        );
      } finally {
        setIsUpdating(false);
      }
    }
  }

  const isLoading = isUpdating || isPending;

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled || isLoading}
        onClick={handleToggle}
        title="Click to update project status"
        className={cn(
          "inline-flex items-center gap-1.5 font-bold rounded-lg transition-all cursor-pointer select-none",
          size === "sm" ? "text-[11px] px-2.5 py-1" : "text-xs px-3 py-1.5",
          config.badgeClass,
          isLoading && "opacity-75 cursor-wait",
          disabled && "opacity-60 cursor-not-allowed",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", config.dotClass)} />
        )}
        <span>{config.label}</span>
        <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: coords.openUpwards ? "auto" : `${coords.top + 6}px`,
              bottom: coords.openUpwards
                ? `${window.innerHeight - coords.top + 6}px`
                : "auto",
              left: `${Math.max(8, Math.min(window.innerWidth - 200, coords.left))}px`,
              zIndex: 99999,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-52 bg-white dark:bg-[#1C1F26] border border-[#E5E7EB] dark:border-[#2D3139] rounded-2xl shadow-2xl p-2 text-xs font-semibold animate-in fade-in-50 zoom-in-95 duration-150"
          >
            <div className="px-3.5 py-1 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider border-b border-[#F3F4F6] dark:border-[#2D3139] mb-1">
              Update Status
            </div>
            <div className="space-y-0.5 px-1 max-h-64 overflow-y-auto scrollbar-thin">
              {selectableStatuses.map((item) => {
                const isSelected =
                  currentStatus === item.value ||
                  (config.label === item.label);

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusSelect(item.value);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer text-xs",
                      isSelected
                        ? "bg-[#F3F9DE] text-[#659A08] font-bold dark:bg-lime-950/50 dark:text-lime-400"
                        : "text-[#374151] dark:text-[#E5E7EB] hover:bg-[#F3F4F6] dark:hover:bg-[#282C35] font-medium"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full flex-shrink-0", item.dot)} />
                      <span>{item.label}</span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#659A08] dark:text-lime-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
