import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(
  (
    {
      className,
      type,
      label,
      value,
      onChange,
      onBlur,
      onFocus,
      onKeyDown,
      placeholder,
      required = false,
      disabled = false,
      readOnly = false,
      error,
      leftIcon,
      rightIcon,
      helperText,
      autoComplete,
      maxLength,
      max,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const describedBy = error
      ? `${id}-error`
      : helperText
      ? `${id}-helper`
      : undefined;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-semibold text-slate-800"
          >
            {label}
            {required && <span className="ml-0.5 text-rose-600">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoComplete={autoComplete}
            maxLength={maxLength}
            max={max}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy}
            className={cn(
              "h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-4",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                : "border-slate-200 focus:border-cyan-400 focus:ring-cyan-600/10",
              disabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : "",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${id}-helper`} className="mt-1.5 text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
export { Input };
