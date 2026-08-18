import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, checked, ...props }, ref) => {
    const inputId = id ?? `checkbox-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="flex items-center gap-2 select-none">
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            className={cn(
              "peer h-4 w-4 shrink-0 rounded-[2px] border border-[#DDE2D8] dark:border-[#1E3A7B] bg-white dark:bg-[#071A49] focus:outline-none focus:ring-2 focus:ring-[#071A49]/20 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-[#071A49] checked:border-[#071A49] dark:checked:bg-[#B7D600] dark:checked:border-[#B7D600] transition-colors cursor-pointer",
              className
            )}
            {...props}
          />
          <Check className="pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 text-[#B7D600] dark:text-[#071A49] opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#071A49] dark:text-[#F8F9F6] cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
