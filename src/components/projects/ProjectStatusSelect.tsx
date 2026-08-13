"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export type ProjectStatusType =
  | "PLANNING"
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "REVIEW"
  | "COMPLETED"
  | "ARCHIVED"
  | "CANCELLED"
  | "Pending"
  | "In Progress"
  | "On Hold"
  | "Completed";

interface ProjectStatusSelectProps {
  projectId?: string;
  initialStatus: string;
  onStatusChange?: (newStatus: string) => void;
  className?: string;
  size?: "sm" | "md";
  dropdownAlign?: "left" | "right";
}

const statusConfig: Record<
  string,
  { label: string; badgeClass: string; dotClass: string; value: string }
> = {
  IN_PROGRESS: {
    label: "In Progress",
    badgeClass: "bg-[#F3F9DE] text-[#659A08] hover:bg-[#EAF5CE]",
    dotClass: "bg-[#88C315]",
    value: "IN_PROGRESS",
  },
  "In Progress": {
    label: "In Progress",
    badgeClass: "bg-[#F3F9DE] text-[#659A08] hover:bg-[#EAF5CE]",
    dotClass: "bg-[#88C315]",
    value: "IN_PROGRESS",
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
    label: "Not Started",
    badgeClass: "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]",
    dotClass: "bg-[#9CA3AF]",
    value: "NOT_STARTED",
  },
  ON_HOLD: {
    label: "On Hold",
    badgeClass: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
    dotClass: "bg-[#9CA3AF]",
    value: "ON_HOLD",
  },
  "On Hold": {
    label: "On Hold",
    badgeClass: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
    dotClass: "bg-[#9CA3AF]",
    value: "ON_HOLD",
  },
  REVIEW: {
    label: "In Review",
    badgeClass: "bg-[#EDE9FE] text-[#7C3AED] hover:bg-[#E4DEFD]",
    dotClass: "bg-[#7C3AED]",
    value: "REVIEW",
  },
  COMPLETED: {
    label: "Completed",
    badgeClass: "bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5]",
    dotClass: "bg-[#10B981]",
    value: "COMPLETED",
  },
  Completed: {
    label: "Completed",
    badgeClass: "bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5]",
    dotClass: "bg-[#10B981]",
    value: "COMPLETED",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]",
    dotClass: "bg-[#EF4444]",
    value: "CANCELLED",
  },
};

const selectableStatuses = [
  { value: "IN_PROGRESS", label: "In Progress", dot: "bg-[#88C315]" },
  { value: "PLANNING", label: "Pending / Planning", dot: "bg-[#F59E0B]" },
  { value: "REVIEW", label: "In Review", dot: "bg-[#7C3AED]" },
  { value: "ON_HOLD", label: "On Hold", dot: "bg-[#9CA3AF]" },
  { value: "COMPLETED", label: "Completed", dot: "bg-[#10B981]" },
  { value: "CANCELLED", label: "Cancelled", dot: "bg-[#EF4444]" },
];

export function ProjectStatusSelect({
  projectId,
  initialStatus,
  onStatusChange,
  className,
  size = "sm",
  dropdownAlign = "left",
}: ProjectStatusSelectProps) {
  const router = useRouter();
  const { success, error: errToast } = useToast();
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Determine if dropdown should open upwards when close to bottom of screen
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 260) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
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
    <div className="relative inline-block" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        disabled={isLoading}
        onClick={handleToggle}
        title="Click to update project status"
        className={cn(
          "inline-flex items-center gap-1.5 font-bold rounded-lg transition-all cursor-pointer select-none",
          size === "sm" ? "text-[11px] px-2.5 py-1" : "text-xs px-3 py-1.5",
          config.badgeClass,
          isLoading && "opacity-75 cursor-wait",
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

      {isOpen && (
        <div
          className={cn(
            "absolute w-52 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl z-[100] py-2 text-xs animate-in font-medium",
            dropdownAlign === "right" ? "right-0" : "left-0",
            openUpwards ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          <div className="px-3.5 py-1 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider border-b border-[#F3F4F6] mb-1">
            Update Status
          </div>
          <div className="space-y-0.5 px-1">
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
                    "w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer",
                    isSelected
                      ? "bg-[#F3F9DE] text-[#111827] font-bold"
                      : "hover:bg-[#F3F4F6] text-[#374151]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn("h-2 w-2 rounded-full flex-shrink-0", item.dot)} />
                    <span>{item.label}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#88C315] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
