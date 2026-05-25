/**
 * MediCore HMIS Action Bar Component
 * 
 * Sticky bottom action bar for forms following theme.md "Action Bars" (lines 143-152)
 * Used for Save, Cancel, and other form-level actions
 */

import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

/**
 * Action Button - Consistent button styling for actions
 * Follows theme.md button specifications
 */
export const ActionButton = ({
  variant = "primary",
  children,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  icon: Icon
}) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60";
  
  const variants = {
    primary: "bg-cyan-700 text-white hover:bg-cyan-800 active:bg-cyan-900 focus:ring-cyan-600 shadow-sm shadow-cyan-700/20",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-400",
    danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500 shadow-sm shadow-rose-600/20",
    ghost: "text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-400",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'bg-slate-100 text-slate-400' : ''}`}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {!loading && Icon && <Icon className="size-4" />}
      {children}
    </button>
  );
};

/**
 * Action Bar - Sticky bottom bar for form actions
 * Follows theme.md sticky footer pattern:
 * - sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur
 * - Buttons stack on small screens, align right on larger screens
 */
export const ActionBar = ({
  children,
  className = "",
  sticky = true
}) => {
  const containerClasses = sticky
    ? "sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6"
    : "flex items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={containerClasses}
    >
      <div className="flex max-w-[1600px] flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end mx-auto w-full">
        {children}
      </div>
    </motion.div>
  );
};

/**
 * Action Group - Groups related actions together
 */
export const ActionGroup = ({ children, className = "" }) => (
  <div className={`flex flex-wrap items-center gap-2 ${className}`}>
    {children}
  </div>
);

export default { ActionBar, ActionButton, ActionGroup };
