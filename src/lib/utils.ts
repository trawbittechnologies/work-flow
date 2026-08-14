import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDueDate(date: Date | string | null | undefined): string {
  if (!date) return "No due date";
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d");
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  return isPast(new Date(date)) && !isToday(new Date(date));
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "CRITICAL": return "text-red-700 bg-red-100 border-red-300 dark:text-red-300 dark:bg-red-950 dark:border-red-800";
    case "URGENT": return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800";
    case "HIGH": return "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800";
    case "MEDIUM": return "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800";
    case "LOW": return "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-900 dark:border-slate-700";
    default: return "text-slate-600 bg-slate-50 border-slate-200";
  }
}

export function getPriorityDotColor(priority: string): string {
  switch (priority) {
    case "CRITICAL": return "bg-red-700";
    case "URGENT": return "bg-red-500";
    case "HIGH": return "bg-orange-500";
    case "MEDIUM": return "bg-amber-500";
    case "LOW": return "bg-slate-400";
    default: return "bg-slate-400";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
    case "TODO":
    case "PLANNING":
    case "NOT_STARTED":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800";
    case "IN_PROGRESS":
      return "text-[#659A08] bg-[#F3F9DE] border-[#D7ECC0] dark:text-lime-400 dark:bg-lime-950 dark:border-lime-800";
    case "TESTING":
      return "text-cyan-700 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950 dark:border-cyan-800";
    case "ON_HOLD":
      return "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700";
    case "IN_REVIEW":
    case "REVIEW":
      return "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950 dark:border-purple-800";
    case "COMPLETED":
    case "DONE":
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800";
    case "REOPENED":
      return "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800";
    case "CANCELLED":
      return "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800";
    case "ARCHIVED":
      return "text-gray-400 bg-gray-100 border-gray-200 dark:text-gray-500 dark:bg-gray-800 dark:border-gray-700";
    default:
      return "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    case "PENDING":
      return "Pending";
    case "TODO":
      return "To Do";
    case "TESTING":
      return "Testing";
    case "ON_HOLD":
      return "On Hold";
    case "IN_REVIEW":
      return "In Review";
    case "REVIEW":
      return "Review";
    case "COMPLETED":
      return "Completed";
    case "DONE":
      return "Done";
    case "REOPENED":
      return "Re-opened";
    case "CANCELLED":
      return "Cancelled";
    case "PLANNING":
      return "Planning";
    case "NOT_STARTED":
      return "Not Started";
    case "ARCHIVED":
      return "Archived";
    default:
      return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
