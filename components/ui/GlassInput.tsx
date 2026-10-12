import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Optional icon rendered on the left side of the input */
  leftIcon?: React.ReactNode;
}

/**
 * GlassInput — frosted glass text input with optional label and error state.
 */
export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, leftIcon, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "glass-input",
              leftIcon && "pl-9",
              error && "border-red-500/60 focus:border-red-500/60 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.25)]",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p
            id={`${id}-error`}
            className="mt-1.5 text-xs text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";
