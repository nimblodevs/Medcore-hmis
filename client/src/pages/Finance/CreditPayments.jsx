import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CreditCard, Building2, ShieldCheck, Landmark, TrendingDown,
  CheckCircle2, Clock, Search, X, ChevronDown, AlertCircle,
  ReceiptText, ArrowRight, DollarSign, Hash, FileText,
  SquareCheckBig, Square, ChevronRight, Banknote, Send,
} from "lucide-react";
import { useInvoiceStore } from "../../store/invoiceStore";
import { useCreditPaymentStore, generatePaymentId } from "../../store/creditPaymentStore";
import { useDispatchStore } from "../../store/dispatchStore";
import { mockProviders, mockSchemes } from "../../constants/mockDebtors";

const formatKES = (v) =>
  `KES ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-KE", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const CREDIT_TYPES = ["Corporate", "Insurance", "Government"];
const PAYMENT_METHODS = ["EFT", "Cheque", "RTGS", "Direct Debit", "M-Pesa"];

const TYPE_CONFIG = {
  Insurance:   { color: "bg-blue-100 text-blue-700 border-blue-200",    icon: ShieldCheck,  bar: "bg-blue-500" },
  Corporate:   { color: "bg-violet-100 text-violet-700 border-violet-200", icon: Building2,  bar: "bg-violet-500" },
  Government:  { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Landmark,     bar: "bg-amber-500" },
};

const METHOD_COLOR = {
  EFT:           "bg-cyan-100 text-cyan-700",
  Cheque:        "bg-slate-100 text-slate-600",
  RTGS:          "bg-indigo-100 text-indigo-700",
  "Direct Debit":"bg-rose-100 text-rose-700",
  "M-Pesa":      "bg-emerald-100 text-emerald-700",
};

const getPaymentInvoiceAllocations = (payment) => {
  if (payment.invoiceAllocations?.length) return payment.invoiceAllocations;
  return (payment.invoiceIds || []).map((invoiceId) => ({
    invoiceId,
    patientName: "Historical invoice",
    uhid: "—",
    invoiceDate: payment.recordedAt,
    amount: payment.invoiceCount ? payment.amount / payment.invoiceCount : payment.amount,
  }));
};

const getProviderSchemeSummary = (providerAccount) => {
  const provider = mockProviders.find((item) => item.accountNumber === providerAccount);
  const schemes = (provider?.schemes || [])
    .map((schemeId) => mockSchemes.find((scheme) => scheme.id === schemeId)?.schemeName)
    .filter(Boolean);
  if (!schemes.length) return "No scheme assigned";
  if (schemes.length === 1) return schemes[0];
  return `${schemes[0]} +${schemes.length - 1}`;
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.Corporate;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
      <Icon size={9} strokeWidth={2.5} /> {type}
    </span>
  );
};

const CreditBar = ({ used, limit, type }) => {
  if (!limit) return null;
  const pct = Math.min(100, (used / limit) * 100);
  const barColor = pct > 85 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : (TYPE_CONFIG[type]?.bar || "bg-cyan-500");
  return (
    <div>
      <div className="flex justify-between text-[9px] font-semibold text-slate-400 mb-1">
        <span>Credit Utilisation</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
        <span>{formatKES(used)} outstanding</span>
        <span>Limit: {formatKES(limit)}</span>
      </div>
    </div>
  );
};

const Modal = ({ title, subtitle, onClose, wide, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.15 }}
      className={`w-full ${wide ? "max-w-4xl" : "max-w-lg"} max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl`}
    >
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-5 rounded-t-3xl">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
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

const CreditPayments = () => {
  const { invoices, updateInvoice } = useInvoiceStore();
  const { payments, addPayment } = useCreditPaymentStore();
  const { dispatches } = useDispatchStore();

  const [activeTab, setActiveTab] = useState("outstanding");
  const [historySearch, setHistorySearch] = useState("");
  const [settleModal, setSettleModal] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [payForm, setPayForm] = useState({ method: "EFT", reference: "", notes: "" });
  const [successMsg, setSuccessMsg] = useState(null);
  const [viewPayment, setViewPayment] = useState(null);

  const creditInvoices = useMemo(() =>
    invoices.filter(
      (inv) => CREDIT_TYPES.includes(inv.paymentMethod) && inv.status === "Final" && inv.providerAccount
    ),
    [invoices]
  );

  const providerBalances = useMemo(() => {
    const map = {};
    creditInvoices.forEach((inv) => {
      const acc = inv.providerAccount;
      if (!map[acc]) {
        const prov = mockProviders.find((p) => p.accountNumber === acc);
        map[acc] = {
          account: acc,
          providerName: prov?.providerName || inv.patient?.corporateName || "Unknown Provider",
          providerType: prov?.providerType || inv.paymentMethod,
          schemeName: getProviderSchemeSummary(acc),
          creditLimit: prov?.creditLimit || 0,
          contactPerson: prov?.contactPerson || "—",
          email: prov?.email || "—",
          invoices: [],
          total: 0,
        };
      }
      map[acc].invoices.push(inv);
      map[acc].total += inv.grandTotal;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [creditInvoices]);

  const stats = useMemo(() => {
    const totalOutstanding = creditInvoices.reduce((s, i) => s + i.grandTotal, 0);
    const providersWithDebt = providerBalances.length;
    const pendingInvoices = creditInvoices.length;
    const now = new Date();
    const paidThisMonth = payments
      .filter((p) => {
        const d = new Date(p.recordedAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, p) => s + p.amount, 0);
    return { totalOutstanding, providersWithDebt, pendingInvoices, paidThisMonth };
  }, [creditInvoices, providerBalances, payments]);

  const dispatchByInvoiceId = useMemo(() => {
    const map = {};
    dispatches.forEach((dispatch) => {
      (dispatch.invoiceIds || []).forEach((invoiceId) => {
        map[invoiceId] = dispatch;
      });
      (dispatch.invoiceSnapshots || []).forEach((invoice) => {
        map[invoice.id] = dispatch;
      });
    });
    return map;
  }, [dispatches]);

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return payments;
    const q = historySearch.toLowerCase();
    return payments.filter((payment) =>
      payment.id.toLowerCase().includes(q) ||
      payment.providerName.toLowerCase().includes(q) ||
      (payment.referenceNumber || "").toLowerCase().includes(q) ||
      payment.method.toLowerCase().includes(q)
    );
  }, [payments, historySearch]);

  const allocationRows = useMemo(() => {
    const rows = payments.flatMap((payment) =>
      getPaymentInvoiceAllocations(payment).map((allocation) => ({
        ...allocation,
        paymentId: payment.id,
        providerAccount: payment.providerAccount,
        providerName: payment.providerName,
        providerType: payment.providerType,
        method: payment.method,
        referenceNumber: payment.referenceNumber || "—",
        providerReference: dispatchByInvoiceId[allocation.invoiceId]?.referenceNumber || payment.providerReference || "—",
        dispatchReference: dispatchByInvoiceId[allocation.invoiceId]?.id || payment.dispatchReference || "—",
        schemeName: getProviderSchemeSummary(payment.providerAccount),
        paidAt: payment.recordedAt,
      }))
    );
    if (!historySearch.trim()) return rows;
    const q = historySearch.toLowerCase();
    return rows.filter((row) =>
      row.paymentId.toLowerCase().includes(q) ||
      row.providerName.toLowerCase().includes(q) ||
      row.schemeName.toLowerCase().includes(q) ||
      row.referenceNumber.toLowerCase().includes(q) ||
      row.providerReference.toLowerCase().includes(q) ||
      row.dispatchReference.toLowerCase().includes(q) ||
      row.invoiceId.toLowerCase().includes(q) ||
      row.patientName.toLowerCase().includes(q) ||
      row.uhid.toLowerCase().includes(q)
    );
  }, [dispatchByInvoiceId, payments, historySearch]);

  const allocationStats = useMemo(() => {
    const totalPaidInvoices = allocationRows.length;
    const totalAllocated = allocationRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const providersPaid = new Set(allocationRows.map((row) => row.providerAccount)).size;
    const averageInvoicePaid = totalPaidInvoices ? totalAllocated / totalPaidInvoices : 0;
    return { totalPaidInvoices, totalAllocated, providersPaid, averageInvoicePaid };
  }, [allocationRows]);

  const handleOpenSettle = (provider) => {
    setSettleModal(provider);
    setSelectedIds(provider.invoices.map((i) => i.id));
    setPayForm({ method: "EFT", reference: "", notes: "" });
  };

  const toggleInvoice = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (!settleModal) return;
    const allIds = settleModal.invoices.map((i) => i.id);
    setSelectedIds(
      selectedIds.length === allIds.length ? [] : allIds
    );
  };

  const selectedTotal = useMemo(() => {
    if (!settleModal) return 0;
    return settleModal.invoices
      .filter((inv) => selectedIds.includes(inv.id))
      .reduce((s, inv) => s + inv.grandTotal, 0);
  }, [settleModal, selectedIds]);

  const handleRecordPayment = () => {
    if (!settleModal || selectedIds.length === 0) return;
    const settled = settleModal.invoices.filter((inv) => selectedIds.includes(inv.id));
    settled.forEach((inv) => {
      updateInvoice(inv.id, { status: "Paid", paidAt: new Date().toISOString() });
    });
    const paymentRecord = {
      id: generatePaymentId(),
      providerAccount: settleModal.account,
      providerName: settleModal.providerName,
      providerType: settleModal.providerType,
      amount: selectedTotal,
      method: payForm.method,
      referenceNumber: payForm.reference.trim() || "—",
      providerReference: payForm.reference.trim() || "—",
      dispatchReference: "—",
      invoiceIds: settled.map((i) => i.id),
      invoiceAllocations: settled.map((invoice) => ({
        invoiceId: invoice.id,
        patientName: invoice.patient?.name || "—",
        uhid: invoice.patient?.uhid || "—",
        invoiceDate: invoice.finalizedAt || invoice.createdAt,
        amount: invoice.grandTotal,
      })),
      invoiceCount: settled.length,
      notes: payForm.notes.trim(),
      recordedAt: new Date().toISOString(),
    };
    addPayment(paymentRecord);
    setSuccessMsg(
      `Payment of ${formatKES(selectedTotal)} from ${settleModal.providerName} recorded. ${settled.length} invoice${settled.length !== 1 ? "s" : ""} settled.`
    );
    setSettleModal(null);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Credit Payments</h1>
        <p className="text-sm font-medium text-slate-500">
          Manage outstanding credit invoices and record payments from insurance, corporate, and government accounts.
        </p>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-emerald-800">{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Outstanding",
            value: formatKES(stats.totalOutstanding),
            icon: TrendingDown,
            color: "bg-red-100 text-red-600",
            highlight: true,
          },
          {
            label: "Providers with Debt",
            value: stats.providersWithDebt,
            icon: Building2,
            color: "bg-violet-100 text-violet-600",
          },
          {
            label: "Pending Invoices",
            value: stats.pendingInvoices,
            icon: FileText,
            color: "bg-amber-100 text-amber-600",
          },
          {
            label: "Collected This Month",
            value: formatKES(stats.paidThisMonth),
            icon: CheckCircle2,
            color: "bg-emerald-100 text-emerald-600",
          },
        ].map(({ label, value, icon: Icon, color, highlight }) => (
          <div key={label} className={`rounded-3xl border bg-white p-5 shadow-sm ${highlight ? "border-red-100" : "border-slate-200"}`}>
            <div className="flex items-center gap-3">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                <Icon size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
                <p className={`text-base font-black leading-tight mt-0.5 ${highlight ? "text-red-600" : "text-slate-900"}`}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
        {[
          { key: "outstanding", label: "Outstanding Accounts", count: stats.providersWithDebt },
          { key: "reports", label: "Allocation Reports", count: allocationStats.totalPaidInvoices },
        ].map(({ key, label, count }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${activeTab === key ? "bg-cyan-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}>
            {label}
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${activeTab === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* OUTSTANDING TAB */}
      {activeTab === "outstanding" && (
        <AnimatePresence mode="wait">
          <motion.div key="outstanding" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {providerBalances.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-slate-400">
                <CheckCircle2 size={40} className="mb-3 opacity-20" />
                <p className="font-semibold text-slate-500">All accounts settled</p>
                <p className="text-sm">No outstanding credit invoices at this time</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {["Provider", "Type", "Pending Invoices", "Oldest Invoice", "Outstanding Balance", "Credit Utilisation", "Action"].map((head) => (
                          <th key={head} className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {providerBalances.map((prov) => {
                        const oldestInvoice = [...prov.invoices].sort((a, b) => new Date(a.finalizedAt || a.createdAt) - new Date(b.finalizedAt || b.createdAt))[0];
                        return (
                          <tr key={prov.account} className="transition-colors hover:bg-slate-50/70">
                            <td className="px-4 py-4">
                              <p className="text-xs font-bold text-slate-900">{prov.providerName}</p>
                              <p className="mt-0.5 max-w-[220px] truncate text-[10px] font-semibold text-cyan-700">{prov.schemeName}</p>
                            </td>
                            <td className="px-4 py-4"><TypeBadge type={prov.providerType} /></td>
                            <td className="px-4 py-4">
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                                {prov.invoices.length} invoice{prov.invoices.length !== 1 ? "s" : ""}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-mono text-xs font-semibold text-slate-700">{oldestInvoice?.id}</p>
                              <p className="text-[10px] text-slate-400">{formatDate(oldestInvoice?.finalizedAt || oldestInvoice?.createdAt)}</p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-sm font-black text-red-600">{formatKES(prov.total)}</td>
                            <td className="min-w-[180px] px-4 py-4">
                              <CreditBar used={prov.total} limit={prov.creditLimit} type={prov.providerType} />
                            </td>
                            <td className="px-4 py-4">
                              <button onClick={() => handleOpenSettle(prov)}
                                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-cyan-200 transition-colors hover:bg-cyan-700">
                                <Banknote size={13} /> Record Payment
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* HISTORY TAB */}
      {activeTab === "history" && (
        <AnimatePresence mode="wait">
          <motion.div key="history" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by provider, ref, method..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <ReceiptText size={36} className="mb-2 opacity-20" />
                  <p className="font-semibold text-slate-500">No payment records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {["Payment ID", "Provider", "Method", "Reference", "Invoices", "Amount", "Date", ""].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredHistory.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-xs font-semibold text-slate-700">{pay.id}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div>
                              <p className="text-xs font-semibold text-slate-900">{pay.providerName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{pay.providerAccount}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${METHOD_COLOR[pay.method] || "bg-slate-100 text-slate-600"}`}>
                              {pay.method}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-xs text-slate-600">{pay.referenceNumber}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              {pay.invoiceCount} invoice{pay.invoiceCount !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm font-bold text-emerald-700">{formatKES(pay.amount)}</span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(pay.recordedAt)}
                          </td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => setViewPayment(pay)}
                              className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 transition-colors">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ─── SETTLE MODAL ─────────────────────────────────────────────────── */}
      {/* ALLOCATION REPORTS TAB */}
      {activeTab === "reports" && (
        <AnimatePresence mode="wait">
          <motion.div key="reports" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Paid Invoices", value: allocationStats.totalPaidInvoices, icon: FileText, color: "bg-cyan-100 text-cyan-700" },
                { label: "Allocated Amount", value: formatKES(allocationStats.totalAllocated), icon: DollarSign, color: "bg-emerald-100 text-emerald-700" },
                { label: "Providers Paid", value: allocationStats.providersPaid, icon: Building2, color: "bg-violet-100 text-violet-700" },
                { label: "Average Per Invoice", value: formatKES(allocationStats.averageInvoicePaid), icon: Hash, color: "bg-amber-100 text-amber-700" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                      <Icon size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-500">{label}</p>
                      <p className="mt-0.5 text-base font-black leading-tight text-slate-900">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">Invoice Allocation History</h2>
                <p className="mt-1 text-xs text-slate-500">Every paid credit invoice linked to its payment reference and provider.</p>
              </div>
              <div className="relative w-full sm:max-w-sm">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoice, patient, provider, ref..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-colors focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {allocationRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <ReceiptText size={36} className="mb-2 opacity-20" />
                  <p className="font-semibold text-slate-500">No paid invoice allocations found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {["Paid Date", "Invoice No.", "Patient", "UHID", "Provider", "Provider Reference", "Dispatch Reference", "Payment Reference Number", "Method", "Allocated Amount", "Payment ID"].map((h) => (
                          <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {allocationRows.map((row) => (
                        <tr key={`${row.paymentId}-${row.invoiceId}`} className="transition-colors hover:bg-slate-50/60">
                          <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">{formatDate(row.paidAt)}</td>
                          <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-700">{row.invoiceId}</td>
                          <td className="px-4 py-3.5 text-xs font-semibold text-slate-900">{row.patientName}</td>
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{row.uhid}</td>
                          <td className="px-4 py-3.5">
                            <p className="text-xs font-semibold text-slate-900">{row.providerName}</p>
                            <p className="max-w-[180px] truncate text-[10px] font-semibold text-cyan-700">{row.schemeName}</p>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{row.providerReference}</td>
                          <td className="px-4 py-3.5 font-mono text-xs font-semibold text-cyan-700">{row.dispatchReference}</td>
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{row.referenceNumber}</td>
                          <td className="px-4 py-3.5">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${METHOD_COLOR[row.method] || "bg-slate-100 text-slate-600"}`}>
                              {row.method}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-xs font-black text-emerald-700">{formatKES(row.amount)}</td>
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{row.paymentId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {settleModal && (
          <Modal
            title={`Settle Account — ${settleModal.providerName}`}
            subtitle={`${settleModal.account} · ${settleModal.providerType}`}
            wide
            onClose={() => setSettleModal(null)}
          >
            <div className="space-y-6">

              {/* Provider Summary */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex size-10 items-center justify-center rounded-2xl ${(TYPE_CONFIG[settleModal.providerType] || TYPE_CONFIG.Corporate).color}`}>
                    {(() => { const Icon = (TYPE_CONFIG[settleModal.providerType] || TYPE_CONFIG.Corporate).icon; return <Icon size={17} />; })()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{settleModal.providerName}</p>
                    <p className="text-xs text-slate-500">{settleModal.contactPerson} · {settleModal.email}</p>
                  </div>
                </div>
                <CreditBar used={settleModal.total} limit={settleModal.creditLimit} type={settleModal.providerType} />
              </div>

              {/* Invoice Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Select Invoices to Settle ({selectedIds.length} of {settleModal.invoices.length})
                  </p>
                  <button onClick={toggleAll}
                    className="flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">
                    {selectedIds.length === settleModal.invoices.length ? (
                      <><SquareCheckBig size={13} /> Deselect All</>
                    ) : (
                      <><Square size={13} /> Select All</>
                    )}
                  </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="w-10 px-3 py-2.5" />
                        <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">Invoice No.</th>
                        <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">Patient</th>
                        <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">Finalized</th>
                        <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">Items</th>
                        <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-slate-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {settleModal.invoices.map((inv) => {
                        const checked = selectedIds.includes(inv.id);
                        return (
                          <tr key={inv.id}
                            onClick={() => toggleInvoice(inv.id)}
                            className={`cursor-pointer transition-colors ${checked ? "bg-cyan-50/60" : "hover:bg-slate-50"}`}>
                            <td className="px-3 py-3 text-center">
                              <div className={`mx-auto size-4 rounded flex items-center justify-center border-2 transition-colors ${checked ? "border-cyan-600 bg-cyan-600" : "border-slate-300"}`}>
                                {checked && <CheckCircle2 size={10} className="text-white" strokeWidth={3} />}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className="font-mono text-xs font-semibold text-slate-700">{inv.id}</span>
                            </td>
                            <td className="px-3 py-3">
                              <p className="text-xs font-semibold text-slate-900 leading-tight">{inv.patient?.name}</p>
                              <p className="text-[10px] text-slate-400">{inv.patient?.uhid}</p>
                            </td>
                            <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">
                              {formatDate(inv.finalizedAt)}
                            </td>
                            <td className="px-3 py-3">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {inv.items?.length || 0} items
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <span className={`text-sm font-bold ${checked ? "text-cyan-700" : "text-slate-700"}`}>
                                {formatKES(inv.grandTotal)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {selectedIds.length === 0 && (
                  <div className="flex items-center gap-2 mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <AlertCircle size={14} className="text-amber-600 shrink-0" />
                    <p className="text-xs font-semibold text-amber-700">Select at least one invoice to record a payment.</p>
                  </div>
                )}
              </div>

              {/* Payment Form */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Payment Details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method</label>
                    <div className="relative">
                      <select value={payForm.method} onChange={(e) => setPayForm((p) => ({ ...p, method: e.target.value }))}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors">
                        {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Reference / Cheque No.</label>
                    <input
                      value={payForm.reference}
                      onChange={(e) => setPayForm((p) => ({ ...p, reference: e.target.value }))}
                      placeholder="e.g. EFT-JBL-12345"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes (optional)</label>
                    <input
                      value={payForm.notes}
                      onChange={(e) => setPayForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="e.g. May 2026 claims batch"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Invoices Selected</span>
                  <span className="font-semibold">{selectedIds.length} of {settleModal.invoices.length}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Payment Method</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${METHOD_COLOR[payForm.method] || "bg-slate-100 text-slate-600"}`}>
                    {payForm.method}
                  </span>
                </div>
                {payForm.reference && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Reference</span>
                    <span className="font-mono text-xs font-semibold text-slate-700">{payForm.reference}</span>
                  </div>
                )}
                <div className="border-t border-cyan-200 pt-2 flex justify-between items-center">
                  <span className="font-black text-slate-900">Total Being Settled</span>
                  <span className="text-xl font-black text-cyan-700">{formatKES(selectedTotal)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button onClick={() => setSettleModal(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleRecordPayment} disabled={selectedIds.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-cyan-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <Send size={14} /> Record Payment
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ─── PAYMENT DETAIL MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {viewPayment && (
          <Modal
            title={viewPayment.id}
            subtitle={`${viewPayment.providerName} · ${viewPayment.providerAccount}`}
            onClose={() => setViewPayment(null)}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={viewPayment.providerType} />
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${METHOD_COLOR[viewPayment.method] || "bg-slate-100 text-slate-600"}`}>
                  {viewPayment.method}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Reference No.", value: viewPayment.referenceNumber },
                  { label: "Invoices Settled", value: `${viewPayment.invoiceCount} invoice${viewPayment.invoiceCount !== 1 ? "s" : ""}` },
                  { label: "Recorded", value: formatDateTime(viewPayment.recordedAt) },
                  { label: "Provider Account", value: viewPayment.providerAccount },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="text-xs font-semibold text-slate-900 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      {["Invoice", "Patient", "UHID", "Invoice Date", "Allocated"].map((head) => (
                        <th key={head} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {getPaymentInvoiceAllocations(viewPayment).map((allocation) => (
                      <tr key={allocation.invoiceId}>
                        <td className="px-3 py-2 font-mono text-xs font-semibold text-slate-700">{allocation.invoiceId}</td>
                        <td className="px-3 py-2 text-xs font-semibold text-slate-900">{allocation.patientName}</td>
                        <td className="px-3 py-2 font-mono text-xs text-slate-500">{allocation.uhid}</td>
                        <td className="px-3 py-2 text-xs text-slate-500">{formatDate(allocation.invoiceDate)}</td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-emerald-700">{formatKES(allocation.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {viewPayment.notes && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-bold text-amber-700 mb-0.5">Notes</p>
                  <p className="text-sm text-amber-800">{viewPayment.notes}</p>
                </div>
              )}

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 flex justify-between items-center">
                <span className="font-bold text-slate-700">Total Received</span>
                <span className="text-xl font-black text-emerald-700">{formatKES(viewPayment.amount)}</span>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setViewPayment(null)}
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

export default CreditPayments;
