/**
 * MediCore HMIS Stats Card Component
 * 
 * Dashboard statistics cards following theme.md visual tokens
 * Used for key metrics, counts, and summary information
 */

import { motion } from "motion/react";

/**
 * Stats Card - Single metric display card
 * Follows theme.md shape and color specifications:
 * - rounded-2xl or rounded-3xl for larger cards
 * - border-slate-200, bg-white, shadow-sm
 * - Icon with colored background (cyan, emerald, amber, rose)
 */
export const StatsCard = ({
  title,
  value,
  note,
  icon: Icon,
  iconBg = "bg-cyan-100",
  iconColor = "text-cyan-700",
  trend,
  trendValue,
  className = ""
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
        {note && (
          <p className="mt-1.5 text-xs font-medium text-slate-500">{note}</p>
        )}
        {trend && (
          <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500'
          }`}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
      {Icon && (
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon size={18} />
        </div>
      )}
    </div>
  </motion.div>
);

/**
 * Stats Grid - Responsive grid for multiple stats cards
 * Auto-adjusts columns based on screen size
 */
export const StatsGrid = ({ 
  children, 
  columns = "auto",
  className = "" 
}) => {
  const columnClasses = {
    auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    dual: "grid-cols-1 md:grid-cols-2",
    triple: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    quad: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid gap-4 ${columnClasses[columns]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Mini Stat - Compact inline stat for headers or tight spaces
 */
export const MiniStat = ({ label, value, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
      {label}
    </span>
    <span className="text-lg font-black text-slate-900">{value}</span>
  </div>
);

export default { StatsCard, StatsGrid, MiniStat };
