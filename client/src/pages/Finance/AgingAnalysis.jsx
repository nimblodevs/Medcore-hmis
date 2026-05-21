import { useState, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3, AlertTriangle, AlertCircle, CheckCircle2, Clock,
  TrendingDown, Building2, ShieldCheck, Landmark, X, ChevronDown,
  ChevronUp, Info, Siren,
} from "lucide-react";
import { useInvoiceStore } from "../../store/invoiceStore";
import { mockProviders } from "../../constants/mockDebtors";

const REPORT_DATE = new Date("2026-05-18");
const CREDIT_TYPES = ["Corporate", "Insurance", "Government"];

const formatKES = (v) =>
  v === 0 ? "—" : `KES ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const formatKESFull = (v) =>
  `KES ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
};

const calcAge = (finalizedAt) => {
  if (!finalizedAt) return 0;
  const diff = REPORT_DATE - new Date(finalizedAt);
  return Math.max(0, Math.floor(diff / 86400000));
};

const getBucket = (age, creditPeriod = 30) => {
  if (age <= creditPeriod) return "current";
  const daysOverdue = age - creditPeriod;
  if (daysOverdue <= 30) return "d31_60";
  if (daysOverdue <= 60) return "d61_90";
  return "d90plus";
};

const getDaysPastDue = (age, creditPeriod = 30) =>
  age > creditPeriod ? age - creditPeriod : 0;

const BUCKETS = [
  { key: "current", label: "Within Terms",       sublabel: "Within credit period", color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200", bar: "bg-emerald-500", cell: "text-emerald-700 bg-emerald-50",  dot: "bg-emerald-500" },
  { key: "d31_60", label: "1–30 Days Past Due",  sublabel: "Overdue",              color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200",   bar: "bg-amber-400",   cell: "text-amber-700 bg-amber-50",      dot: "bg-amber-400" },
  { key: "d61_90", label: "31–60 Days Past Due", sublabel: "Warning",              color: "text-orange-700",  bg: "bg-orange-50",   border: "border-orange-200",  bar: "bg-orange-500",  cell: "text-orange-700 bg-orange-50",    dot: "bg-orange-500" },
  { key: "d90plus",label: "60+ Days Past Due",   sublabel: "Critical",             color: "text-red-700",     bg: "bg-red-50",      border: "border-red-200",     bar: "bg-red-500",     cell: "text-red-700 bg-red-50",          dot: "bg-red-500" },
];

const TYPE_CFG = {
  Insurance:  { icon: ShieldCheck, color: "bg-blue-100 text-blue-700 border-blue-200" },
  Corporate:  { icon: Building2,   color: "bg-violet-100 text-violet-700 border-violet-200" },
  Government: { icon: Landmark,    color: "bg-amber-100 text-amber-700 border-amber-200" },
};

const ESCALATION_CFG = {
  critical: { icon: Siren,          color: "bg-red-100 text-red-700 border-red-200",          label: "Critical — 60+ days past due" },
  warning:  { icon: AlertTriangle,  color: "bg-orange-100 text-orange-700 border-orange-200", label: "Warning — 31–60 days past due" },
  overdue:  { icon: AlertCircle,    color: "bg-amber-100 text-amber-700 border-amber-200",    label: "Overdue — 1–30 days past due" },
};

const SORT_OPTIONS = [
  { key: "total_desc",   label: "Total (High → Low)" },
  { key: "total_asc",    label: "Total (Low → High)" },
  { key: "d90plus_desc", label: "60+ Days Past Due (Critical first)" },
  { key: "d61_90_desc",  label: "31–60 Days Past Due (Warning first)" },
  { key: "name_asc",     label: "Provider Name (A–Z)" },
];

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CFG[type] || TYPE_CFG.Corporate;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${cfg.color}`}>
      <Icon size={8} strokeWidth={2.5} /> {type}
    </span>
  );
};

const EscalationBadge = ({ level }) => {
  if (!level) return null;
  const cfg = ESCALATION_CFG[level];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${cfg.color}`}>
      <Icon size={8} strokeWidth={2.5} /> {cfg.label}
    </span>
  );
};

const Modal = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.15 }}
      className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-5 rounded-t-3xl">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="rounded-xl p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  </div>
);

const AgingAnalysis = () => {
  const { invoices } = useInvoiceStore();

  const [typeFilter, setTypeFilter] = useState("All");
  const [sortKey, setSortKey] = useState("total_desc");
  const [expandedRow, setExpandedRow] = useState(null);
  const [drillModal, setDrillModal] = useState(null);

  const creditInvoices = useMemo(() =>
    invoices.filter(
      (inv) => CREDIT_TYPES.includes(inv.paymentMethod) && inv.status === "Final" && inv.providerAccount
    ),
    [invoices]
  );

  const providerAging = useMemo(() => {
    const map = {};
    creditInvoices.forEach((inv) => {
      const acc = inv.providerAccount;
      const age = calcAge(inv.finalizedAt);
      const prov = mockProviders.find((p) => p.accountNumber === acc);
      const creditPeriod = prov?.creditPeriod ?? 30;
      const bucket = getBucket(age, creditPeriod);
      const daysPastDue = getDaysPastDue(age, creditPeriod);

      if (!map[acc]) {
        map[acc] = {
          account: acc,
          providerName: prov?.providerName || inv.patient?.corporateName || "Unknown",
          providerType: prov?.providerType || inv.paymentMethod,
          creditPeriod,
          maxDaysPastDue: 0,
          current:  { invoices: [], total: 0 },
          d31_60:   { invoices: [], total: 0 },
          d61_90:   { invoices: [], total: 0 },
          d90plus:  { invoices: [], total: 0 },
          total: 0,
        };
      }
      map[acc][bucket].invoices.push({ ...inv, age, daysPastDue });
      map[acc][bucket].total += inv.grandTotal;
      map[acc].total += inv.grandTotal;
      if (daysPastDue > map[acc].maxDaysPastDue) map[acc].maxDaysPastDue = daysPastDue;
    });
    return Object.values(map);
  }, [creditInvoices]);

  const summary = useMemo(() => {
    const s = { current: 0, d31_60: 0, d61_90: 0, d90plus: 0, total: 0, invoiceCount: 0, providerCount: 0 };
    providerAging.forEach((p) => {
      s.current  += p.current.total;
      s.d31_60   += p.d31_60.total;
      s.d61_90   += p.d61_90.total;
      s.d90plus  += p.d90plus.total;
      s.total    += p.total;
      s.invoiceCount += p.current.invoices.length + p.d31_60.invoices.length + p.d61_90.invoices.length + p.d90plus.invoices.length;
      s.providerCount++;
    });
    return s;
  }, [providerAging]);

  const getEscalation = (prov) => {
    if (prov.d90plus.total > 0) return "critical";
    if (prov.d61_90.total > 0) return "warning";
    if (prov.d31_60.total > 0) return "overdue";
    return null;
  };

  const escalatedProviders = useMemo(() =>
    providerAging.filter((p) => getEscalation(p) === "critical" || getEscalation(p) === "warning"),
    [providerAging]
  );

  const filtered = useMemo(() => {
    let rows = typeFilter === "All" ? providerAging : providerAging.filter((p) => p.providerType === typeFilter);
    rows = [...rows].sort((a, b) => {
      if (sortKey === "total_desc")   return b.total - a.total;
      if (sortKey === "total_asc")    return a.total - b.total;
      if (sortKey === "d90plus_desc") return b.d90plus.total - a.d90plus.total;
      if (sortKey === "d61_90_desc")  return b.d61_90.total - a.d61_90.total;
      if (sortKey === "name_asc")     return a.providerName.localeCompare(b.providerName);
      return 0;
    });
    return rows;
  }, [providerAging, typeFilter, sortKey]);

  const totalNonCurrent = summary.d31_60 + summary.d61_90 + summary.d90plus;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Aging Analysis</h1>
          <p className="text-sm font-medium text-slate-500">
            Outstanding credit invoices bucketed by days past each provider's agreed credit period.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm self-start">
          <div className="size-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-slate-600">Report Date:</span>
          <span className="text-xs font-mono font-semibold text-slate-800">18 May 2026</span>
        </div>
      </div>

      {/* Escalation Alerts */}
      <AnimatePresence>
        {escalatedProviders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-3xl border border-red-200 bg-red-50 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Siren size={16} className="text-red-600 shrink-0" />
              <p className="text-sm font-bold text-red-800">
                {escalatedProviders.length} provider{escalatedProviders.length !== 1 ? "s" : ""} require escalation
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {escalatedProviders.map((prov) => {
                const level = getEscalation(prov);
                const cfg = ESCALATION_CFG[level];
                const Icon = cfg.icon;
                return (
                  <div key={prov.account}
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${cfg.color}`}>
                    <Icon size={13} className="shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-tight">{prov.providerName}</p>
                      <p className="text-[10px] opacity-80">
                        {level === "critical"
                          ? `${formatKESFull(prov.d90plus.total)} — 60+ days past ${prov.creditPeriod}-day term`
                          : `${formatKESFull(prov.d61_90.total)} — 31–60 days past ${prov.creditPeriod}-day term`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-red-700 font-medium">
              Recommended action: Issue formal demand letters and escalate to management for accounts 60+ days past their agreed credit period.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stat Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total Outstanding",       value: formatKESFull(summary.total),    sub: `${summary.invoiceCount} invoices · ${summary.providerCount} providers`, icon: TrendingDown, iconColor: "bg-slate-100 text-slate-600",    highlight: false },
          { label: "Within Terms",            value: formatKESFull(summary.current),  sub: "Invoices within credit period",   icon: CheckCircle2, iconColor: "bg-emerald-100 text-emerald-600", highlight: false },
          { label: "1–30 Days Past Due",      value: formatKESFull(summary.d31_60),   sub: "Overdue — follow-up needed",      icon: Clock,        iconColor: "bg-amber-100 text-amber-600",     highlight: false },
          { label: "31–60 Days Past Due",     value: formatKESFull(summary.d61_90),   sub: "Warning — escalate soon",         icon: AlertCircle,  iconColor: "bg-orange-100 text-orange-600",   highlight: summary.d61_90 > 0 },
          { label: "60+ Days Past Due",       value: formatKESFull(summary.d90plus),  sub: "Critical — urgent action",        icon: Siren,        iconColor: "bg-red-100 text-red-600",         highlight: summary.d90plus > 0 },
        ].map(({ label, value, sub, icon: Icon, iconColor, highlight }) => (
          <div key={label}
            className={`rounded-3xl border bg-white p-4 shadow-sm ${highlight ? "border-red-200 ring-1 ring-red-100" : "border-slate-200"}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${iconColor}`}>
                <Icon size={14} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            </div>
            <p className={`text-base font-black leading-tight ${highlight ? "text-red-700" : "text-slate-900"}`}>{value}</p>
            <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Aggregate Aging Bar */}
      {summary.total > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Aging Distribution</p>
            <p className="text-xs text-slate-500 font-semibold">{formatKESFull(summary.total)} total</p>
          </div>
          <div className="flex h-6 w-full overflow-hidden rounded-full bg-slate-100">
            {BUCKETS.map((b) => {
              const pct = summary.total > 0 ? (summary[b.key] / summary.total) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div key={b.key} className={`h-full ${b.bar} transition-all`} style={{ width: `${pct}%` }}
                  title={`${b.label}: ${pct.toFixed(1)}%`} />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4">
            {BUCKETS.map((b) => {
              const pct = summary.total > 0 ? (summary[b.key] / summary.total) * 100 : 0;
              return (
                <div key={b.key} className="flex items-center gap-1.5">
                  <div className={`size-2.5 rounded-full ${b.dot}`} />
                  <span className="text-[10px] font-semibold text-slate-600">{b.label}</span>
                  <span className="text-[10px] font-bold text-slate-400">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
          {totalNonCurrent > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
              <Info size={12} className="text-amber-600 shrink-0" />
              <p className="text-[10px] font-semibold text-amber-700">
                {((totalNonCurrent / summary.total) * 100).toFixed(1)}% of outstanding balance ({formatKESFull(totalNonCurrent)}) exceeds each provider's agreed credit period.
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <Info size={12} className="text-slate-400 shrink-0" />
            <p className="text-[10px] font-semibold text-slate-500">
              Aging buckets are relative to each provider's agreed credit period (e.g. Jubilee: 90 days, AAR: 60 days, Kenya Airways: 30 days). An invoice is only "past due" once it exceeds that provider's term.
            </p>
          </div>
        </div>
      )}

      {/* Filters + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {["All", "Insurance", "Corporate", "Government"].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${typeFilter === t ? "bg-cyan-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}
            className="appearance-none rounded-2xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-sm outline-none focus:border-cyan-400 transition-colors">
            {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Provider Aging Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <BarChart3 size={40} className="mb-3 opacity-20" />
            <p className="font-semibold text-slate-500">No outstanding credit invoices</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Provider</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Flag</th>
                  {BUCKETS.map((b) => (
                    <th key={b.key} className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <div className={`size-2 rounded-full ${b.dot}`} />
                        {b.label}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Distribution</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((prov) => {
                  const escalation = getEscalation(prov);
                  const isExpanded = expandedRow === prov.account;
                  return (
                    <Fragment key={prov.account}>
                      <tr
                        className={`transition-colors ${isExpanded ? "bg-slate-50/80" : "hover:bg-slate-50/40"}`}>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">{prov.providerName}</p>
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <TypeBadge type={prov.providerType} />
                              <span className="font-mono text-[9px] text-slate-400">{prov.account}</span>
                              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                                <Clock size={7} strokeWidth={2.5} />
                                {prov.creditPeriod}d term
                              </span>
                              {prov.maxDaysPastDue > 0 && (
                                <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${
                                  prov.maxDaysPastDue > 60 ? "border-red-200 bg-red-50 text-red-700"
                                  : prov.maxDaysPastDue > 30 ? "border-orange-200 bg-orange-50 text-orange-700"
                                  : "border-amber-200 bg-amber-50 text-amber-700"
                                }`}>
                                  max {prov.maxDaysPastDue}d past due
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <EscalationBadge level={escalation} />
                        </td>

                        {/* Bucket cells — clickable to drill down */}
                        {BUCKETS.map((b) => {
                          const val = prov[b.key].total;
                          const count = prov[b.key].invoices.length;
                          const hasValue = val > 0;
                          return (
                            <td key={b.key} className="px-4 py-4 text-right">
                              {hasValue ? (
                                <button
                                  onClick={() => setDrillModal({ prov, bucket: b })}
                                  className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors hover:opacity-80 ${b.cell}`}>
                                  <span className="block">{formatKESFull(val)}</span>
                                  <span className="block text-[9px] font-semibold opacity-70">{count} inv.</span>
                                </button>
                              ) : (
                                <span className="text-xs text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-black text-slate-900">{formatKESFull(prov.total)}</span>
                        </td>

                        {/* Mini stacked bar */}
                        <td className="px-4 py-4 min-w-[100px]">
                          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                            {BUCKETS.map((b) => {
                              const pct = prov.total > 0 ? (prov[b.key].total / prov.total) * 100 : 0;
                              if (pct === 0) return null;
                              return <div key={b.key} className={`h-full ${b.bar}`} style={{ width: `${pct}%` }} />;
                            })}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <button onClick={() => setExpandedRow(isExpanded ? null : prov.account)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {isExpanded ? "Hide" : "Detail"}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row — invoice breakdown */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="px-4 pb-4 pt-0 bg-slate-50/80">
                            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  All outstanding invoices — {prov.providerName}
                                </p>
                                <span className="text-[10px] text-slate-400">{formatKESFull(prov.total)} total</span>
                              </div>
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-slate-100">
                                    {["Invoice No.", "Patient", "UHID", "Finalized", "Age", "Past Due", "Bucket", "Amount"].map((h) => (
                                      <th key={h} className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {BUCKETS.flatMap((b) =>
                                    prov[b.key].invoices.map((inv) => (
                                      <tr key={inv.id} className="hover:bg-slate-50/60">
                                        <td className="px-3 py-2.5 font-mono text-[10px] font-semibold text-slate-700">{inv.id}</td>
                                        <td className="px-3 py-2.5 text-xs font-medium text-slate-900">{inv.patient?.name}</td>
                                        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-400">{inv.patient?.uhid}</td>
                                        <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">{formatDate(inv.finalizedAt)}</td>
                                        <td className="px-3 py-2.5 text-[10px] text-slate-500 font-mono">{inv.age}d</td>
                                        <td className="px-3 py-2.5">
                                          {inv.daysPastDue > 0 ? (
                                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                              b.key === "d31_60" ? "bg-amber-100 text-amber-700"
                                              : b.key === "d61_90" ? "bg-orange-100 text-orange-700"
                                              : "bg-red-100 text-red-700"
                                            }`}>
                                              +{inv.daysPastDue}d
                                            </span>
                                          ) : (
                                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">on time</span>
                                          )}
                                        </td>
                                        <td className="px-3 py-2.5">
                                          <span className={`text-[9px] font-bold uppercase ${b.color}`}>{b.sublabel}</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-xs font-bold text-slate-900 whitespace-nowrap">{formatKESFull(inv.grandTotal)}</td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td className="px-4 py-3 text-xs font-black text-slate-700">TOTALS</td>
                  <td />
                  {BUCKETS.map((b) => (
                    <td key={b.key} className="px-4 py-3 text-right">
                      <span className={`text-xs font-black ${summary[b.key] > 0 ? b.color : "text-slate-300"}`}>
                        {summary[b.key] > 0 ? formatKESFull(summary[b.key]) : "—"}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right text-sm font-black text-slate-900">{formatKESFull(summary.total)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Drill-down Modal */}
      <AnimatePresence>
        {drillModal && (
          <Modal
            title={`${drillModal.bucket.label} — ${drillModal.prov.providerName}`}
            subtitle={`${drillModal.prov.account} · ${drillModal.bucket.sublabel} invoices`}
            onClose={() => setDrillModal(null)}
          >
            <div className="space-y-4">
              {/* Bucket Summary */}
              <div className={`flex items-center justify-between rounded-2xl border p-4 ${drillModal.bucket.border} ${drillModal.bucket.bg}`}>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wide ${drillModal.bucket.color}`}>{drillModal.bucket.label} — {drillModal.bucket.sublabel}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{drillModal.prov.providerName}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black ${drillModal.bucket.color}`}>
                    {formatKESFull(drillModal.prov[drillModal.bucket.key].total)}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {drillModal.prov[drillModal.bucket.key].invoices.length} invoice{drillModal.prov[drillModal.bucket.key].invoices.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Invoice List */}
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Invoice No.", "Patient", "Finalized", "Age", "Amount"].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {drillModal.prov[drillModal.bucket.key].invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60">
                        <td className="px-3 py-3 font-mono text-xs font-semibold text-slate-700">{inv.id}</td>
                        <td className="px-3 py-3">
                          <p className="text-xs font-semibold text-slate-900 leading-tight">{inv.patient?.name}</p>
                          <p className="text-[10px] text-slate-400">{inv.patient?.uhid}</p>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(inv.finalizedAt)}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${drillModal.bucket.cell}`}>
                            {inv.age} days
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs font-bold text-slate-900">{formatKESFull(inv.grandTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <td colSpan={4} className="px-3 py-2.5 text-xs font-black text-right text-slate-700">Subtotal</td>
                      <td className={`px-3 py-2.5 text-sm font-black ${drillModal.bucket.color}`}>
                        {formatKESFull(drillModal.prov[drillModal.bucket.key].total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Recommended Action */}
              {(drillModal.bucket.key === "d90plus" || drillModal.bucket.key === "d61_90") && (
                <div className={`flex items-start gap-3 rounded-2xl border p-4 ${drillModal.bucket.key === "d90plus" ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}`}>
                  <AlertTriangle size={14} className={`shrink-0 mt-0.5 ${drillModal.bucket.key === "d90plus" ? "text-red-600" : "text-orange-600"}`} />
                  <div>
                    <p className={`text-xs font-bold mb-0.5 ${drillModal.bucket.key === "d90plus" ? "text-red-800" : "text-orange-800"}`}>
                      {drillModal.bucket.key === "d90plus" ? "Urgent Action Required" : "Escalation Recommended"}
                    </p>
                    <p className={`text-xs ${drillModal.bucket.key === "d90plus" ? "text-red-700" : "text-orange-700"}`}>
                      {drillModal.bucket.key === "d90plus"
                        ? "These invoices are more than 90 days overdue. Issue formal demand letters and escalate to management. Consider involving the legal team if payment is not received within 14 days."
                        : "These invoices are 61–90 days overdue. Send a formal reminder to the provider and request a payment commitment date."}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={() => setDrillModal(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AgingAnalysis;
