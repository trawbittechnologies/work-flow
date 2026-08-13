import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "navy";
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
    "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[#0A1237] font-extrabold shadow-sm border border-transparent active:scale-[0.98]",
  navy:
    "bg-[#0A1237] hover:bg-[#142054] text-white font-bold shadow-sm border border-transparent active:scale-[0.98]",
  secondary:
    "bg-surface hover:bg-surface-alt text-text-primary border border-border shadow-xs hover:border-border/80 active:scale-[0.98]",
  ghost:
    "bg-transparent hover:bg-surface-alt text-text-secondary hover:text-text-primary border border-transparent active:scale-[0.98]",
  danger:
    "bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent active:scale-[0.98]",
  outline:
    "bg-transparent hover:bg-primary-subtle text-[#0A1237] dark:text-[#C3D946] border border-[#C3D946] hover:border-primary active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-xs gap-1.5 rounded-lg font-medium",
  md: "h-9 px-4 text-sm gap-2 rounded-xl font-medium",
  lg: "h-10 px-5 text-sm gap-2 rounded-xl font-semibold",
  icon: "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
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
          "inline-flex items-center justify-center transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
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
