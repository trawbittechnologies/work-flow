import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-primary)] shadow-sm border border-transparent",
  secondary:
    "bg-[var(--surface)] hover:bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm",
  ghost:
    "bg-transparent hover:bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent",
  danger:
    "bg-red-500 hover:bg-red-600 text-white shadow-sm border border-transparent",
  outline:
    "bg-transparent hover:bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)] hover:border-[var(--primary-hover)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5 rounded-[8px]",
  md: "h-9 px-3.5 text-sm gap-2 rounded-[10px]",
  lg: "h-10 px-5 text-sm gap-2 rounded-[10px]",
  icon: "h-8 w-8 rounded-[8px] flex-shrink-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
          "select-none whitespace-nowrap",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          leftIcon
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";
