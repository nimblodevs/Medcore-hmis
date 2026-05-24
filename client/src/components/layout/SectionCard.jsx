/**
 * MediCore HMIS Section Card Component
 * 
 * Consistent section container following theme.md "Section Cards" (lines 77-84)
 * Used for grouping related form fields or content sections
 */

import { motion } from "motion/react";

/**
 * Section Card - Main container for grouped content
 * Follows theme.md specification exactly:
 * - Container: overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm
 * - Header: border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5
 * - Header text: text-sm text-slate-600
 * - Body: p-4 sm:p-6
 */
export const SectionCard = ({ 
  title, 
  description,
  children, 
  className = "",
  headerAction 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}
  >
    {(title || headerAction) && (
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
        <div>
          {title && (
            <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
          )}
          {description && (
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {description}
            </p>
          )}
        </div>
        {headerAction && (
          <div>{headerAction}</div>
        )}
      </div>
    )}
    <div className="p-4 sm:p-6">
      {children}
    </div>
  </motion.div>
);

/**
 * Section Grid - Responsive grid layout for form fields
 * Follows theme.md "Form Layout" (lines 67-75):
 * - grid-cols-1 on mobile
 * - sm:grid-cols-2
 * - md:grid-cols-3
 * - xl:grid-cols-4
 * - 2xl:grid-cols-6
 * - gap-x-4 gap-y-5
 */
export const SectionGrid = ({ 
  children, 
  columns = "default",
  className = "" 
}) => {
  const columnClasses = {
    default: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
    wide: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    compact: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    dual: "grid-cols-1 md:grid-cols-2",
    single: "grid-cols-1",
  };

  return (
    <div className={`grid ${columnClasses[columns]} gap-x-4 gap-y-5 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Section Field Group - For grouping related fields within a grid
 * Use when conditional groups should flow inside parent grid (theme.md line 74)
 */
export const FieldGroup = ({ children, className = "" }) => (
  <div className={`contents ${className}`}>
    {children}
  </div>
);

export default { SectionCard, SectionGrid, FieldGroup };
