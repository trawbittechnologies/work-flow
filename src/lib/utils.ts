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
    case "CRITICAL": return "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/40 dark:border-red-900";
    case "URGENT": return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/40 dark:border-red-900";
    case "HIGH": return "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/40 dark:border-orange-900";
    case "MEDIUM": return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-900";
    case "LOW": return "text-[#586274] bg-[#F0F2EC] border-[#DDE2D8] dark:text-[#A6B4C9] dark:bg-[#0D2561] dark:border-[#1E3A7B]";
    default: return "text-[#586274] bg-[#F0F2EC] border-[#DDE2D8]";
  }
}

export function getPriorityDotColor(priority: string): string {
  switch (priority) {
    case "CRITICAL": return "bg-red-600";
    case "URGENT": return "bg-red-500";
    case "HIGH": return "bg-orange-500";
    case "MEDIUM": return "bg-amber-500";
    case "LOW": return "bg-[#586274]";
    default: return "bg-[#586274]";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
    case "TODO":
    case "PLANNING":
    case "NOT_STARTED":
      return "text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-900";
    case "IN_PROGRESS":
      return "text-[#071A49] bg-[#F1F8CE] border-[#B7D600] dark:text-[#B7D600] dark:bg-[#182B00] dark:border-[#B7D600]";
    case "TESTING":
      return "text-cyan-800 bg-cyan-50 border-cyan-200 dark:text-cyan-300 dark:bg-cyan-950/40 dark:border-cyan-900";
    case "ON_HOLD":
      return "text-[#586274] bg-[#F0F2EC] border-[#DDE2D8] dark:text-[#A6B4C9] dark:bg-[#0D2561] dark:border-[#1E3A7B]";
    case "IN_REVIEW":
    case "REVIEW":
      return "text-purple-800 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950/40 dark:border-purple-900";
    case "COMPLETED":
    case "DONE":
      return "text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900";
    case "REOPENED":
      return "text-orange-800 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950/40 dark:border-orange-900";
    case "CANCELLED":
      return "text-red-800 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/40 dark:border-red-900";
    case "ARCHIVED":
      return "text-gray-500 bg-gray-100 border-[#DDE2D8] dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700";
    default:
      return "text-[#586274] bg-[#F0F2EC] border-[#DDE2D8]";
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
