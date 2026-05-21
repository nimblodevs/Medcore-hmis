import { motion } from "motion/react";
import { Search, Plus, Download } from "lucide-react";

export const statusClass = (status) => {
  if (["Active", "Online", "System"].includes(status)) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (["Invited", "Maintenance"].includes(status)) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  return "bg-slate-100 text-slate-600 border-slate-200";
};

export const UserManagementShell = ({
  title,
  subtitle,
  actionLabel,
  children,
  stats,
  searchPlaceholder = "Search records",
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
          User Management
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
          {subtitle}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
          <Download size={15} />
          Export
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-cyan-600/20 transition-colors hover:bg-cyan-700">
          <Plus size={15} />
          {actionLabel}
        </button>
      </div>
    </div>

    <div className="grid gap-3 md:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
            <div className={`flex size-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
              <stat.icon size={18} />
            </div>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-500">{stat.note}</p>
        </div>
      ))}
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-900">{title} Directory</h2>
          <p className="text-xs font-medium text-slate-500">
            Manage access records synchronized with the server admin module.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
            placeholder={searchPlaceholder}
          />
        </div>
      </div>
      {children}
    </div>
  </motion.div>
);
