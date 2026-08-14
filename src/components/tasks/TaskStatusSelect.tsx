"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export type TaskStatusType =
  | "PENDING"
  | "IN_PROGRESS"
  | "TESTING"
  | "ON_HOLD"
  | "IN_REVIEW"
  | "COMPLETED"
  | "REOPENED"
  | "CANCELLED"
  | "TODO"
  | "DONE";

interface TaskStatusSelectProps {
  taskId?: string;
  initialStatus: string;
  onStatusChange?: (newStatus: TaskStatusType) => void;
  className?: string;
  size?: "sm" | "md";
  dropdownAlign?: "left" | "right";
  disabled?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; badgeClass: string; dotClass: string; value: TaskStatusType }
> = {
  IN_PROGRESS: {
    label: "Progressing",
    badgeClass: "bg-[#F3F9DE] text-[#659A08] hover:bg-[#EAF5CE] border-[#D7ECC0]/60",
    dotClass: "bg-[#88C315]",
    value: "IN_PROGRESS",
  },
  PENDING: {
    label: "Pending",
    badgeClass: "bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7] border-[#FDE68A]/60",
    dotClass: "bg-[#F59E0B]",
    value: "PENDING",
  },
  TODO: {
    label: "Pending",
    badgeClass: "bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7] border-[#FDE68A]/60",
    dotClass: "bg-[#F59E0B]",
    value: "PENDING",
  },
  TESTING: {
    label: "Testing",
    badgeClass: "bg-[#ECFEFF] text-[#0891B2] hover:bg-[#CFFAFE] border-[#A5F3FC]/60",
    dotClass: "bg-[#06B6D4]",
    value: "TESTING",
  },
  ON_HOLD: {
    label: "Hold",
    badgeClass: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] border-[#E5E7EB]/60",
    dotClass: "bg-[#9CA3AF]",
    value: "ON_HOLD",
  },
  IN_REVIEW: {
    label: "Review",
    badgeClass: "bg-[#EDE9FE] text-[#7C3AED] hover:bg-[#E4DEFD] border-[#DDD6FE]/60",
    dotClass: "bg-[#7C3AED]",
    value: "IN_REVIEW",
  },
  REVIEW: {
    label: "Review",
    badgeClass: "bg-[#EDE9FE] text-[#7C3AED] hover:bg-[#E4DEFD] border-[#DDD6FE]/60",
    dotClass: "bg-[#7C3AED]",
    value: "IN_REVIEW",
  },
  COMPLETED: {
    label: "Complete",
    badgeClass: "bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5] border-[#A7F3D0]/60",
    dotClass: "bg-[#10B981]",
    value: "COMPLETED",
  },
  DONE: {
    label: "Complete",
    badgeClass: "bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5] border-[#A7F3D0]/60",
    dotClass: "bg-[#10B981]",
    value: "COMPLETED",
  },
  REOPENED: {
    label: "Re-Open",
    badgeClass: "bg-[#FFF7ED] text-[#EA580C] hover:bg-[#FFEDD5] border-[#FED7AA]/60",
    dotClass: "bg-[#F97316]",
    value: "REOPENED",
  },
  CANCELLED: {
    label: "Cancel",
    badgeClass: "bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] border-[#FECACA]/60",
    dotClass: "bg-[#EF4444]",
    value: "CANCELLED",
  },
};

const selectableStatuses: Array<{ value: TaskStatusType; label: string; dot: string }> = [
  { value: "IN_PROGRESS", label: "Progressing", dot: "bg-[#88C315]" },
  { value: "PENDING", label: "Pending", dot: "bg-[#F59E0B]" },
  { value: "TESTING", label: "Testing", dot: "bg-[#06B6D4]" },
  { value: "ON_HOLD", label: "Hold", dot: "bg-[#9CA3AF]" },
  { value: "IN_REVIEW", label: "Review", dot: "bg-[#7C3AED]" },
  { value: "COMPLETED", label: "Complete", dot: "bg-[#10B981]" },
  { value: "REOPENED", label: "Re-Open", dot: "bg-[#F97316]" },
  { value: "CANCELLED", label: "Cancel", dot: "bg-[#EF4444]" },
];

export function TaskStatusSelect({
  taskId,
  initialStatus,
  onStatusChange,
  className,
  size = "sm",
  dropdownAlign = "left",
  disabled = false,
}: TaskStatusSelectProps) {
  const router = useRouter();
  const { success, error: errToast } = useToast();
  const [prevInitial, setPrevInitial] = useState(initialStatus);
  const [currentStatus, setCurrentStatus] = useState<TaskStatusType>(
    (initialStatus as TaskStatusType) || "PENDING"
  );

  if (prevInitial !== initialStatus) {
    setPrevInitial(initialStatus);
    setCurrentStatus((initialStatus as TaskStatusType) || "PENDING");
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [, startTransition] = useTransition();
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
        left: dropdownAlign === "right" ? rect.right - 180 : rect.left,
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
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen((prev) => !prev);
  };

  const config =
    statusConfig[currentStatus] ||
    statusConfig.PENDING ||
    statusConfig.TODO;

  async function handleStatusSelect(newStatus: TaskStatusType) {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);
    setIsOpen(false);
    onStatusChange?.(newStatus);

    if (taskId) {
      setIsUpdating(true);
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to update task status");
        }

        const displayLabel =
          statusConfig[newStatus]?.label || newStatus.replace(/_/g, " ");
        success("Status Updated", `Task status changed to "${displayLabel}"`);

        startTransition(() => {
          router.refresh();
        });
      } catch (err: unknown) {
        setCurrentStatus(previousStatus);
        onStatusChange?.(previousStatus);
        const message =
          err instanceof Error ? err.message : "Could not update status.";
        errToast("Update Failed", message);
      } finally {
        setIsUpdating(false);
      }
    }
  }

  const isSmall = size === "sm";

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled || isUpdating}
        onClick={handleToggle}
        title="Click to update task status"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-bold tracking-tight border transition-all duration-150 select-none shadow-2xs",
          isSmall ? "text-[11px] px-2.5 py-1" : "text-xs px-3 py-1.5",
          config.badgeClass,
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-95",
          isOpen && "ring-2 ring-primary/30"
        )}
      >
        {isUpdating ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin text-current shrink-0" />
        ) : (
          <span
            className={cn(
              "rounded-full shrink-0 animate-pulse",
              isSmall ? "h-1.5 w-1.5" : "h-2 w-2",
              config.dotClass
            )}
          />
        )}
        <span className="truncate">{config.label}</span>
        {!disabled && (
          <ChevronDown
            className={cn(
              "shrink-0 opacity-60 transition-transform duration-200",
              isSmall ? "h-3 w-3" : "h-3.5 w-3.5",
              isOpen && "rotate-180"
            )}
          />
        )}
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
              left: `${Math.max(8, Math.min(window.innerWidth - 188, coords.left))}px`,
              zIndex: 99999,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-[180px] rounded-2xl bg-white dark:bg-[#1C1F26] border border-[#EAEDF2] dark:border-[#2D3139] shadow-2xl p-1.5 text-xs font-semibold animate-in fade-in-50 zoom-in-95 duration-150"
          >
            <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#9CA3AF] border-b border-[#EAEDF2] dark:border-[#2D3139] mb-1">
              Change Status
            </div>
            <div className="space-y-0.5 max-h-64 overflow-y-auto scrollbar-thin">
              {selectableStatuses.map((s) => {
                const isSelected =
                  currentStatus === s.value ||
                  (s.value === "PENDING" &&
                    (currentStatus as string) === "TODO") ||
                  (s.value === "COMPLETED" &&
                    (currentStatus as string) === "DONE") ||
                  (s.value === "IN_REVIEW" &&
                    (currentStatus as string) === "REVIEW");

                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => handleStatusSelect(s.value)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer text-xs",
                      isSelected
                        ? "bg-[#F3F9DE] text-[#659A08] font-bold dark:bg-lime-950/50 dark:text-lime-400"
                        : "text-[#374151] dark:text-[#E5E7EB] hover:bg-[#F3F4F6] dark:hover:bg-[#282C35] font-medium"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full shrink-0", s.dot)} />
                      <span>{s.label}</span>
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-[#659A08] dark:text-lime-400 shrink-0" />
                    )}
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
