/**
 * MediCore HMIS Page Header Component
 * 
 * Two variants:
 * 1. Workflow pages (Registration-style): cyan-to-sky gradient header panel
 * 2. Standard pages: clean white header with stats
 * 
 * Follows theme.md section "Page Headers" (lines 53-60)
 */

import { motion } from "motion/react";
import { Search } from "lucide-react";

/**
 * Workflow Header - for forms like Registration, Patient Record, etc.
 * Uses cyan-to-sky gradient background as per theme.md
 */
export const WorkflowHeader = ({ 
  title, 
  subtitle, 
  children,
  lookupControl 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-6"
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex-1">
        <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-600">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
    
    {/* Optional inset lookup control panel */}
    {lookupControl && (
      <div className="mt-4 rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-cyan-100">
        {lookupControl}
      </div>
    )}
  </motion.div>
);

/**
 * Standard Page Header - for dashboards, lists, admin pages
 * Clean white background with optional actions
 */
export const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs,
  children 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
  >
    <div className="flex-1">
      {breadcrumbs && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
          {breadcrumbs}
        </p>
      )}
      <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
    {children && (
      <div className="flex flex-wrap items-center gap-2">
        {children}
      </div>
    )}
  </motion.div>
);

/**
 * Search Bar Component - consistent search input styling
 * Follows theme.md form controls specification
 */
export const SearchBar = ({ 
  placeholder = "Search...", 
  value, 
  onChange, 
  onSearch,
  className = "" 
}) => (
  <div className={`relative ${className}`}>
    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={(e) => e.key === 'Enter' && onSearch?.(value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-600/10"
    />
  </div>
);

export default { WorkflowHeader, PageHeader, SearchBar };
