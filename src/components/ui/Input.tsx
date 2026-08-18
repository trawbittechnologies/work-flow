import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftAddon, rightAddon, className, id, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold uppercase tracking-wider text-[#071A49] dark:text-white"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <span className="absolute left-3 text-text-muted flex items-center pointer-events-none">
              {leftAddon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-9.5 px-3 text-sm rounded-[2px] border transition-all duration-150 font-medium",
              "bg-white text-[#071A49] dark:bg-[#071A49] dark:text-[#F8F9F6] shadow-xs",
              "border-[#DDE2D8] dark:border-[#1E3A7B] placeholder:text-[#8E99A8]",
              "hover:border-[#C5CCC0] dark:hover:border-[#2B4E9E]",
              "focus:outline-none focus:ring-2 focus:ring-[#071A49]/20 focus:border-[#071A49] dark:focus:ring-[#B7D600]/30 dark:focus:border-[#B7D600]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#F0F2EC]",
              error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
              leftAddon && "pl-9",
              rightAddon && "pr-9",
              className
            )}
            {...props}
          />
          {rightAddon && (
            <span className="absolute right-3 text-text-muted flex items-center">
              {rightAddon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 font-bold">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id ?? `textarea-${Math.random().toString(36).slice(2)}`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-[#071A49] dark:text-white">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-[2px] border transition-all duration-150 font-medium resize-y min-h-[80px]",
            "bg-white text-[#071A49] dark:bg-[#071A49] dark:text-[#F8F9F6] shadow-xs",
            "border-[#DDE2D8] dark:border-[#1E3A7B] placeholder:text-[#8E99A8]",
            "hover:border-[#C5CCC0] dark:hover:border-[#2B4E9E]",
            "focus:outline-none focus:ring-2 focus:ring-[#071A49]/20 focus:border-[#071A49] dark:focus:ring-[#B7D600]/30 dark:focus:border-[#B7D600]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#F0F2EC]",
            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
        {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className, id, children, ...props }, ref) => {
    const inputId = id ?? `select-${Math.random().toString(36).slice(2)}`;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-[#071A49] dark:text-white">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-9.5 px-3 text-sm rounded-[2px] border transition-all duration-150 font-medium",
            "bg-white text-[#071A49] dark:bg-[#071A49] dark:text-[#F8F9F6] shadow-xs",
            "border-[#DDE2D8] dark:border-[#1E3A7B]",
            "hover:border-[#C5CCC0] dark:hover:border-[#2B4E9E]",
            "focus:outline-none focus:ring-2 focus:ring-[#071A49]/20 focus:border-[#071A49] dark:focus:ring-[#B7D600]/30 dark:focus:border-[#B7D600]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#F0F2EC]",
            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
        {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

