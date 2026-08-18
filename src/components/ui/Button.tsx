import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "danger" | "outline" | "navy";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#071A49] hover:bg-[#041030] text-white hover:text-[#B7D600] font-bold uppercase tracking-[0.1em] border-2 border-[#071A49] shadow-xs active:scale-[0.98]",
  accent:
    "bg-[#B7D600] hover:bg-[#A5C200] text-[#071A49] font-bold uppercase tracking-[0.1em] border-2 border-[#071A49] shadow-xs active:scale-[0.98]",
  navy:
    "bg-[#071A49] hover:bg-[#041030] text-white hover:text-[#B7D600] font-bold uppercase tracking-[0.1em] border-2 border-[#071A49] shadow-xs active:scale-[0.98]",
  secondary:
    "bg-white hover:bg-[#F8F9F6] text-[#071A49] border border-[#DDE2D8] hover:border-[#071A49] shadow-xs active:scale-[0.98]",
  ghost:
    "bg-transparent hover:bg-[#F0F2EC] text-[#071A49] border border-transparent active:scale-[0.98]",
  danger:
    "bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold shadow-xs border border-[#DC2626] active:scale-[0.98]",
  outline:
    "bg-transparent hover:bg-[#F1F8CE] text-[#071A49] border border-[#DDE2D8] hover:border-[#071A49] active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-[2px] font-semibold",
  md: "h-9 px-4 text-xs gap-2 rounded-[2px] font-bold",
  lg: "h-10 px-5 text-sm gap-2 rounded-[2px] font-bold",
  icon: "h-8 w-8 rounded-[2px] flex items-center justify-center flex-shrink-0",
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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#071A49]/30 focus-visible:ring-offset-1",
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

