import React from "react";

const Input = ({
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  readOnly = false,
  error,
  leftIcon,
  rightIcon,
  containerClassName = "",
  inputClassName = "",
  helperText,
  autoComplete,
  maxLength,
  max,
}) => {
  const id = React.useId();
  const describedBy = error ? `${id}-error` : helperText ? `${id}-helper` : undefined;

  return (
    <div className={["w-full", containerClassName].join(" ")}>
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
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          max={max}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={[
            "h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors focus:outline-none focus:ring-4",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
              : "border-slate-200 focus:border-cyan-400 focus:ring-cyan-600/10",
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            disabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : "",
            readOnly ? "cursor-default" : "",
            inputClassName,
          ].join(" ")}
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
};

export default Input;
