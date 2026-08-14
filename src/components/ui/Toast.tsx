"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const toastConfigs: Record<
  ToastType,
  {
    icon: React.ReactNode;
    badgeBg: string;
    borderColor: string;
    progressColor: string;
    glowColor: string;
  }
> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60",
    borderColor: "border-emerald-200/90 dark:border-emerald-800/80",
    progressColor: "bg-emerald-500",
    glowColor: "shadow-emerald-500/10",
  },
  error: {
    icon: <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />,
    badgeBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-800/60",
    borderColor: "border-rose-200/90 dark:border-rose-800/80",
    progressColor: "bg-rose-500",
    glowColor: "shadow-rose-500/10",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />,
    badgeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/60",
    borderColor: "border-amber-200/90 dark:border-amber-800/80",
    progressColor: "bg-amber-500",
    glowColor: "shadow-amber-500/10",
  },
  info: {
    icon: <Info className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />,
    badgeBg: "bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 dark:border-sky-800/60",
    borderColor: "border-sky-200/90 dark:border-sky-800/80",
    progressColor: "bg-sky-500",
    glowColor: "shadow-sky-500/10",
  },
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const duration = toast.duration ?? 4500;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const config = toastConfigs[toast.type] || toastConfigs.info;

  // Handle timer with pause on hover
  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();
    const interval = 20;

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
      setProgress((currentRemaining / duration) * 100);

      if (currentRemaining <= 0) {
        clearInterval(intervalId);
        onRemove(toast.id);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [isPaused, duration, onRemove, toast.id]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-3.5 sm:p-4 shadow-xl backdrop-blur-xl transition-all duration-200",
        "bg-white/95 dark:bg-[#1A1D24]/95 text-text-primary",
        config.borderColor,
        config.glowColor,
        "animate-in slide-in-up hover:scale-[1.01] hover:shadow-2xl"
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon Badge */}
        <div
          className={cn(
            "h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs",
            config.badgeBg
          )}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs sm:text-[13px] font-bold text-[#111827] dark:text-neutral-100 leading-snug break-words">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-[11px] sm:text-xs text-[#4B5563] dark:text-neutral-400 mt-0.5 leading-relaxed break-words font-medium">
              {toast.message}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onRemove(toast.id)}
          className="h-7 w-7 rounded-lg text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-neutral-800 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Interactive Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5 overflow-hidden">
        <div
          className={cn("h-full transition-all duration-75", config.progressColor)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]);
  }, []);

  const contextValue: ToastContextValue = {
    toast: addToast,
    success: (title, message) => addToast({ type: "success", title, message }),
    error: (title, message) => addToast({ type: "error", title, message }),
    warning: (title, message) => addToast({ type: "warning", title, message }),
    info: (title, message) => addToast({ type: "info", title, message }),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Responsive positioning: above mobile bottom nav on small screens, bottom-right on desktop */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm sm:max-w-md w-auto sm:w-96"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
