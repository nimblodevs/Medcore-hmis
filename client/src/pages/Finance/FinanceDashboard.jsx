import { useMemo } from "react";
import { motion } from "motion/react";
import {
  TrendingUp, Wallet, Send, Clock, Siren,
  CheckCircle2, AlertTriangle, Building2, ShieldCheck, Landmark,
  ReceiptText, ChevronRight, FileText, CheckCheck, DollarSign,
  BarChart3, Gauge,
} from "lucide-react";
import { useInvoiceStore } from "../../store/invoiceStore";
import { useCreditPaymentStore } from "../../store/creditPaymentStore";
import { useDispatchStore } from "../../store/dispatchStore";
import { mockProviders } from "../../constants/mockDebtors";

const REPORT_DATE = new Date("2026-05-18");
const CREDIT_TYPES = ["Corporate", "Insurance", "Government"];
const CASH_TYPES   = ["Cash", "NHIF"];

const fmtKES  = (v) => `KES ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const fmtDate = (iso) => !iso ? "—" : new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
const calcAge = (d) => !d ? 0 : Math.max(0, Math.floor((REPORT_DATE - new Date(d)) / 86400000));

const PAYER_CFG = {
  Cash:        { color: "bg-emerald-500", light: "bg-emerald-100 text-emerald-700", icon: Wallet },
  NHIF:        { color: "bg-cyan-500",    light: "bg-cyan-100 text-cyan-700",       icon: ShieldCheck },
  Insurance:   { color: "bg-blue-500",    light: "bg-blue-100 text-blue-700",       icon: ShieldCheck },
  Corporate:   { color: "bg-violet-500",  light: "bg-violet-100 text-violet-700",   icon: Building2 },
  Government:  { color: "bg-amber-500",   light: "bg-amber-100 text-amber-700",     icon: Landmark },
};

const DISPATCH_STATUS_CFG = {
  Draft:        { color: "bg-slate-100 text-slate-600 border-slate-200",    dot: "bg-slate-400",    icon: Clock },
  Dispatched:   { color: "bg-blue-100 text-blue-700 border-blue-200",       dot: "bg-blue-500",     icon: Send },
  Acknowledged: { color: "bg-violet-100 text-violet-700 border-violet-200", dot: "bg-violet-500",   icon: CheckCheck },
  Settled:      { color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle2 },
  Disputed:     { color: "bg-red-100 text-red-600 border-red-200",           dot: "bg-red-500",      icon: AlertTriangle },
};

const AGING_CFG = [
  { key: "current", label: "0–30 Days",  sub: "Current",  bar: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-50 border-emerald-200" },
  { key: "d31_60", label: "31–60 Days", sub: "Overdue",  bar: "bg-amber-400",   text: "text-amber-700",   light: "bg-amber-50 border-amber-200" },
  { key: "d61_90", label: "61–90 Days", sub: "Warning",  bar: "bg-orange-500",  text: "text-orange-700",  light: "bg-orange-50 border-orange-200" },
  { key: "d90plus",label: "90+ Days",   sub: "Critical", bar: "bg-red-500",     text: "text-red-700",     light: "bg-red-50 border-red-200" },
];

const INV_STATUS_CFG = {
  Draft:     { color: "bg-slate-100 text-slate-600",     label: "Draft" },
  Final:     { color: "bg-blue-100 text-blue-700",       label: "Final" },
  Paid:      { color: "bg-emerald-100 text-emerald-700", label: "Paid" },
  Cancelled: { color: "bg-red-100 text-red-600",         label: "Cancelled" },
};

const KpiCard = ({ label, value, sub, icon: Icon, iconBg, highlight, chip }) => (
  <div className={`rounded-3xl border bg-white p-5 shadow-sm flex flex-col gap-3 ${highlight ? "border-red-200 ring-1 ring-red-100" : "border-slate-200"}`}>
    <div className="flex items-center justify-between">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
        <Icon size={17} />
      </div>
      {chip && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">{chip}</span>
      )}
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-black leading-tight ${highlight ? "text-red-700" : "text-slate-900"}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const SectionTitle = ({ icon: Icon, title, action, onAction }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-slate-400" />
      <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">{title}</h2>
    </div>
    {action && (
      <button onClick={onAction}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-cyan-600 hover:bg-cyan-50 transition-colors">
        {action} <ChevronRight size={10} />
      </button>
    )}
  </div>
);

const FinanceDashboard = () => {
  const { invoices }   = useInvoiceStore();
  const { payments }   = useCreditPaymentStore();
  const { dispatches } = useDispatchStore();

  /* ── Core invoice splits ── */
  const billedInvoices = useMemo(
    () => invoices.filter((i) => ["Final", "Paid"].includes(i.status)),
    [invoices]
  );
  const paidCashInvoices = useMemo(
    () => invoices.filter((i) => i.status === "Paid" && CASH_TYPES.includes(i.paymentMethod)),
    [invoices]
  );
  const finalCreditInvoices = useMemo(
    () => invoices.filter((i) => i.status === "Final" && CREDIT_TYPES.includes(i.paymentMethod)),
    [invoices]
  );

  /* ── KPI Totals ── */
  const totalBilled      = useMemo(() => billedInvoices.reduce((s, i) => s + i.grandTotal, 0), [billedInvoices]);
  const cashCollected    = useMemo(() => paidCashInvoices.reduce((s, i) => s + i.grandTotal, 0), [paidCashInvoices]);
  const creditReceivable = useMemo(() => finalCreditInvoices.reduce((s, i) => s + i.grandTotal, 0), [finalCreditInvoices]);
  const creditReceived   = useMemo(() => payments.reduce((s, p) => s + (p.amount || 0), 0), [payments]);
  const netCreditOutstanding = Math.max(0, creditReceivable - creditReceived);
  const totalKnownClaims = cashCollected + creditReceived + creditReceivable;
  const collectionRate   = totalKnownClaims > 0 ? ((cashCollected + creditReceived) / totalKnownClaims) * 100 : 0;

  /* ── Aging buckets ── */
  const aging = useMemo(() => {
    const a = { current: 0, d31_60: 0, d61_90: 0, d90plus: 0 };
    finalCreditInvoices.forEach((inv) => {
      const age = calcAge(inv.finalizedAt);
      const k = age <= 30 ? "current" : age <= 60 ? "d31_60" : age <= 90 ? "d61_90" : "d90plus";
      a[k] += inv.grandTotal;
    });
    return a;
  }, [finalCreditInvoices]);

  /* ── Revenue by payer ── */
  const payerTotals = useMemo(() => {
    const m = {};
    billedInvoices.forEach((inv) => {
      const k = inv.paymentMethod;
      m[k] = (m[k] || 0) + inv.grandTotal;
    });
    const sorted = Object.entries(m).sort((a, b) => b[1] - a[1]);
    const max = sorted[0]?.[1] || 1;
    return sorted.map(([type, total]) => ({ type, total, pct: (total / max) * 100 }));
  }, [billedInvoices]);

  /* ── Dispatch stats ── */
  const dispatchStats = useMemo(() => {
    const m = { Draft: { count: 0, total: 0 }, Dispatched: { count: 0, total: 0 }, Acknowledged: { count: 0, total: 0 }, Settled: { count: 0, total: 0 }, Disputed: { count: 0, total: 0 } };
    dispatches.forEach((d) => {
      if (m[d.status]) { m[d.status].count++; m[d.status].total += d.totalAmount; }
    });
    return m;
  }, [dispatches]);
  const outstandingDispatches = dispatches.filter((d) => ["Dispatched", "Acknowledged"].includes(d.status)).length;

  /* ── Top providers by credit receivable ── */
  const topProviders = useMemo(() => {
    const map = {};
    finalCreditInvoices.forEach((inv) => {
      const acc = inv.providerAccount;
      if (!map[acc]) {
        const prov = mockProviders.find((p) => p.accountNumber === acc);
        map[acc] = { account: acc, name: prov?.providerName || "Unknown", type: prov?.providerType || "Corporate", total: 0, invoiceCount: 0 };
      }
      map[acc].total += inv.grandTotal;
      map[acc].invoiceCount++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [finalCreditInvoices]);
  const maxProvider = topProviders[0]?.total || 1;

  /* ── Recent invoices ── */
  const recentInvoices = useMemo(() =>
    [...billedInvoices]
      .sort((a, b) => new Date(b.finalizedAt || b.createdAt) - new Date(a.finalizedAt || a.createdAt))
      .slice(0, 6),
    [billedInvoices]
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Finance Dashboard</h1>
          <p className="text-sm font-medium text-slate-500">Executive overview across all Finance modules.</p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-600">As at:</span>
          <span className="font-mono text-xs font-semibold text-slate-800">18 May 2026</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Invoiced"         value={fmtKES(totalBilled)}          sub={`${billedInvoices.length} finalized invoices`}            icon={TrendingUp}   iconBg="bg-slate-100 text-slate-600"     chip="All time" />
        <KpiCard label="Cash Collected"          value={fmtKES(cashCollected)}         sub={`${paidCashInvoices.length} settled invoices`}             icon={Wallet}       iconBg="bg-emerald-100 text-emerald-600" />
        <KpiCard label="Credit Receivable"       value={fmtKES(creditReceivable)}      sub={`${finalCreditInvoices.length} open credit invoices`}      icon={FileText}     iconBg="bg-blue-100 text-blue-600"       />
        <KpiCard label="Credit Payments In"      value={fmtKES(creditReceived)}        sub={`${payments.length} payment${payments.length !== 1 ? "s" : ""} recorded`}           icon={DollarSign}   iconBg="bg-cyan-100 text-cyan-600"       />
        <KpiCard label="Active Dispatches"       value={outstandingDispatches}         sub="Dispatched or acknowledged"                               icon={Send}         iconBg="bg-violet-100 text-violet-600"   />
        <KpiCard label="90+ Day Critical"        value={fmtKES(aging.d90plus)}         sub="Urgent escalation required"                               icon={Siren}        iconBg="bg-red-100 text-red-600"         highlight={aging.d90plus > 0} />
      </div>

      {/* Collection Rate Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge size={14} className="text-slate-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Overall Collection Rate</span>
          </div>
          <span className={`text-2xl font-black ${collectionRate >= 70 ? "text-emerald-700" : collectionRate >= 40 ? "text-amber-700" : "text-red-700"}`}>
            {collectionRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${collectionRate >= 70 ? "bg-emerald-500" : collectionRate >= 40 ? "bg-amber-400" : "bg-red-500"}`}
            style={{ width: `${Math.min(100, collectionRate)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-slate-400 font-medium">
            {fmtKES(cashCollected + creditReceived)} collected out of {fmtKES(totalBilled)} total invoiced
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            {fmtKES(netCreditOutstanding)} net still outstanding
          </p>
        </div>
      </div>

      {/* Revenue Mix + Aging Snapshot */}
      <div className="grid gap-5 lg:grid-cols-5">

        {/* Revenue by Payer Type */}
        <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={BarChart3} title="Revenue by Payer Type" />
          <div className="space-y-3">
            {payerTotals.map(({ type, total, pct }) => {
              const cfg = PAYER_CFG[type] || { color: "bg-slate-400", light: "bg-slate-100 text-slate-600", icon: FileText };
              const Icon = cfg.icon;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${cfg.light}`}>
                        <Icon size={9} /> {type}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{fmtKES(total)}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${cfg.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aging Snapshot */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={Clock} title="Credit Aging Snapshot" />
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 mb-4">
            {AGING_CFG.map((b) => {
              const pct = creditReceivable > 0 ? (aging[b.key] / creditReceivable) * 100 : 0;
              return pct > 0 ? <div key={b.key} className={`h-full ${b.bar}`} style={{ width: `${pct}%` }} /> : null;
            })}
          </div>
          <div className="space-y-2">
            {AGING_CFG.map((b) => {
              const val  = aging[b.key];
              const pct  = creditReceivable > 0 ? ((val / creditReceivable) * 100).toFixed(1) : "0.0";
              return (
                <div key={b.key} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${b.light}`}>
                  <div className="flex items-center gap-2">
                    <div className={`size-2 rounded-full ${b.bar}`} />
                    <div>
                      <p className={`text-[10px] font-bold ${b.text}`}>{b.label}</p>
                      <p className="text-[9px] text-slate-400">{b.sub}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-black ${val > 0 ? b.text : "text-slate-300"}`}>{val > 0 ? fmtKES(val) : "—"}</p>
                    <p className="text-[9px] text-slate-400">{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dispatch Pipeline */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle icon={Send} title="Dispatch Pipeline" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(DISPATCH_STATUS_CFG).map(([status, cfg]) => {
            const Icon = cfg.icon;
            const stat = dispatchStats[status] || { count: 0, total: 0 };
            return (
              <div key={status} className={`flex flex-col items-center justify-center rounded-2xl border py-4 px-3 text-center ${cfg.color}`}>
                <div className={`size-2 rounded-full mb-2 ${cfg.dot}`} />
                <Icon size={16} className="mb-1.5 opacity-70" />
                <p className="text-lg font-black">{stat.count}</p>
                <p className="text-[9px] font-bold uppercase tracking-wide mt-0.5">{status}</p>
                {stat.total > 0 && (
                  <p className="text-[9px] font-semibold mt-1 opacity-75">{fmtKES(stat.total)}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Invoices + Top Providers */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Recent Invoices */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <SectionTitle icon={ReceiptText} title="Recent Invoices" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50">
                  {["Invoice", "Patient", "Type", "Amount", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentInvoices.map((inv) => {
                  const stCfg = INV_STATUS_CFG[inv.status] || INV_STATUS_CFG.Draft;
                  const pCfg  = PAYER_CFG[inv.paymentMethod];
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono text-[10px] font-semibold text-slate-700 whitespace-nowrap">{inv.id.slice(-8)}</td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-slate-900 leading-tight max-w-[140px] truncate">{inv.patient?.name}</p>
                        <p className="text-[10px] text-slate-400">{fmtDate(inv.finalizedAt || inv.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        {pCfg && (
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${pCfg.light}`}>{inv.paymentMethod}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-900 whitespace-nowrap">{fmtKES(inv.grandTotal)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${stCfg.color}`}>{stCfg.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Providers by Outstanding */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={Building2} title="Top Providers by Receivable" />
          <div className="space-y-3">
            {topProviders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <CheckCircle2 size={28} className="mb-2 opacity-20" />
                <p className="text-sm font-semibold">All credit invoices settled</p>
              </div>
            ) : (
              topProviders.map((prov, i) => {
                const cfg = PAYER_CFG[prov.type] || { color: "bg-slate-400", light: "bg-slate-100 text-slate-600", icon: Building2 };
                const pct = (prov.total / maxProvider) * 100;
                const hasEscalation = finalCreditInvoices
                  .filter((inv) => inv.providerAccount === prov.account)
                  .some((inv) => calcAge(inv.finalizedAt) > 60);
                return (
                  <div key={prov.account}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-black text-slate-500">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[180px]">{prov.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] font-bold rounded-full px-1.5 py-px ${cfg.light}`}>{prov.type}</span>
                            <span className="text-[9px] text-slate-400">{prov.invoiceCount} inv.</span>
                            {hasEscalation && (
                              <span className="text-[9px] font-bold text-red-600 flex items-center gap-0.5">
                                <Siren size={8} /> Escalate
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900 whitespace-nowrap ml-2">{fmtKES(prov.total)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${cfg.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Totals summary */}
          {topProviders.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Credit Receivable</p>
              <p className="text-sm font-black text-slate-900">{fmtKES(creditReceivable)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Credit Payments */}
      {payments.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <SectionTitle icon={DollarSign} title="Recent Credit Payments Received" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50">
                  {["Receipt No.", "Provider", "Method", "Amount", "Date"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[...payments]
                  .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
                  .slice(0, 5)
                  .map((pmt) => {
                    const prov = mockProviders.find((p) => p.accountNumber === pmt.providerAccount);
                    const provType = prov?.providerType || "Corporate";
                    const cfg = PAYER_CFG[provType] || { light: "bg-slate-100 text-slate-600" };
                    return (
                      <tr key={pmt.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono text-[10px] font-semibold text-slate-700">{pmt.receiptNumber || pmt.id}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-slate-900 leading-tight">{pmt.providerName || prov?.providerName}</p>
                          <span className={`text-[9px] font-bold rounded-full px-1.5 py-px ${cfg.light}`}>{provType}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{pmt.paymentMethod || pmt.method || "—"}</td>
                        <td className="px-4 py-3 text-sm font-black text-emerald-700">{fmtKES(pmt.amount)}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(pmt.date || pmt.createdAt)}</td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td colSpan={3} className="px-4 py-3 text-xs font-black text-right text-slate-700">Total Received</td>
                  <td className="px-4 py-3 text-sm font-black text-emerald-700">{fmtKES(creditReceived)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FinanceDashboard;
