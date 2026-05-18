import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Search, Eye, CheckCircle2, Ban, AlertCircle,
  Clock, X, Printer, ArrowUpRight, DollarSign, TrendingUp,
  CreditCard, Hash, ChevronRight, User,
} from "lucide-react";
import { useInvoiceStore } from "../../store/invoiceStore";

const formatKES = (v) =>
  `KES ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-KE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_CONFIG = {
  Interim:   { color: "bg-amber-100 text-amber-700 border-amber-200",   icon: Clock,         dot: "bg-amber-500" },
  Final:     { color: "bg-blue-100 text-blue-700 border-blue-200",      icon: FileText,      dot: "bg-blue-500" },
  Paid:      { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2, dot: "bg-emerald-500" },
  Cancelled: { color: "bg-red-100 text-red-600 border-red-200",         icon: Ban,           dot: "bg-red-400" },
};

const PAYMENT_COLOR = {
  Cash: "bg-slate-100 text-slate-600",
  NHIF: "bg-green-100 text-green-700",
  Insurance: "bg-blue-100 text-blue-700",
  Corporate: "bg-violet-100 text-violet-700",
  Government: "bg-amber-100 text-amber-700",
};

const TABS = ["All", "Interim", "Final", "Paid", "Cancelled"];

const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Interim;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
      <Icon size={9} strokeWidth={2.5} />
      {status}
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
      className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-6 rounded-t-3xl">
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

const InfoRow = ({ label, value, highlight }) => (
  <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${highlight ? "border border-cyan-100 bg-cyan-50" : "border border-slate-100 bg-slate-50"}`}>
    <span className="text-xs text-slate-500">{label}</span>
    <span className={`text-xs font-bold ${highlight ? "text-cyan-800" : "text-slate-900"}`}>{value || "—"}</span>
  </div>
);

const Invoices = () => {
  const navigate = useNavigate();
  const { invoices, updateInvoice, setActiveDraft } = useInvoiceStore();

  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewInvoice, setViewInvoice] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return invoices.filter((inv) => {
      const matchTab = activeTab === "All" || inv.status === activeTab;
      const matchSearch =
        !q ||
        inv.id.toLowerCase().includes(q) ||
        inv.patient?.name?.toLowerCase().includes(q) ||
        inv.patient?.uhid?.toLowerCase().includes(q) ||
        inv.paymentMethod?.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [invoices, activeTab, searchQuery]);

  const counts = useMemo(() => {
    const c = { All: invoices.length, Interim: 0, Final: 0, Paid: 0, Cancelled: 0 };
    invoices.forEach((inv) => { if (c[inv.status] !== undefined) c[inv.status]++; });
    return c;
  }, [invoices]);

  const stats = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.grandTotal, 0);
    const outstanding = invoices.filter((i) => i.status === "Final").reduce((s, i) => s + i.grandTotal, 0);
    const interim = invoices.filter((i) => i.status === "Interim").reduce((s, i) => s + i.grandTotal, 0);
    return { paid, outstanding, interim };
  }, [invoices]);

  const handleMarkPaid = (inv) => {
    updateInvoice(inv.id, { status: "Paid", paidAt: new Date().toISOString() });
    setViewInvoice(null);
    setConfirmAction(null);
  };

  const handleCancel = (inv) => {
    updateInvoice(inv.id, { status: "Cancelled" });
    setViewInvoice(null);
    setConfirmAction(null);
  };

  const handleContinueBilling = (inv) => {
    const patientMatch = { uhid: inv.patient.uhid, ...inv.patient };
    setActiveDraft({ patient: patientMatch, items: inv.items });
    navigate("/finance/op-cons-billing");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Invoices</h1>
          <p className="text-sm font-medium text-slate-500">
            Track all outpatient billing — interim, final, paid, and cancelled.
          </p>
        </div>
        <button onClick={() => navigate("/finance/op-cons-billing")}
          className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors shadow-sm shadow-cyan-200">
          <ArrowUpRight size={15} /> New Billing Session
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Invoices", value: invoices.length, icon: FileText, color: "bg-slate-100 text-slate-600" },
          { label: "Total Collected", value: formatKES(stats.paid), icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" },
          { label: "Outstanding (Final)", value: formatKES(stats.outstanding), icon: TrendingUp, color: "bg-blue-100 text-blue-600" },
          { label: "In Progress (Interim)", value: formatKES(stats.interim), icon: Clock, color: "bg-amber-100 text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-2xl ${color}`}>
                <Icon size={17} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-base font-black text-slate-900 leading-tight mt-0.5">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm flex-wrap">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${activeTab === tab ? "bg-cyan-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}>
              {tab}
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${activeTab === tab ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice, patient, UHID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText size={40} className="mb-3 opacity-20" />
            <p className="font-semibold text-slate-500">No invoices found</p>
            <p className="text-sm">Try a different tab or search term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Invoice No.", "Patient", "Date", "Items", "Payment", "Grand Total", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`size-2 rounded-full shrink-0 ${STATUS_CONFIG[inv.status]?.dot || "bg-slate-300"}`} />
                        <span className="font-mono text-xs font-semibold text-slate-700">{inv.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-100 to-sky-100 text-cyan-700 text-[10px] font-black">
                          {inv.patient?.name?.split(" ").filter(Boolean).slice(-2).map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 leading-tight">{inv.patient?.name}</p>
                          <p className="text-[10px] text-slate-400">{inv.patient?.uhid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{formatDate(inv.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{inv.items?.length || 0} items</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${PAYMENT_COLOR[inv.paymentMethod] || "bg-slate-100 text-slate-600"}`}>
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-bold text-slate-900">{formatKES(inv.grandTotal)}</span>
                    </td>
                    <td className="px-4 py-3.5"><Badge status={inv.status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewInvoice(inv)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 transition-colors">
                          <Eye size={12} /> View
                        </button>
                        {inv.status === "Interim" && (
                          <button onClick={() => handleContinueBilling(inv)}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-amber-600 hover:bg-amber-50 transition-colors">
                            <ArrowUpRight size={12} /> Continue
                          </button>
                        )}
                        {inv.status === "Final" && (
                          <button onClick={() => setConfirmAction({ type: "pay", inv })}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors">
                            <DollarSign size={12} /> Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {viewInvoice && (
          <Modal
            title={viewInvoice.id}
            subtitle={`${viewInvoice.patient?.name} · ${viewInvoice.patient?.uhid}`}
            onClose={() => setViewInvoice(null)}
          >
            <div className="space-y-5">
              {/* Status + Timestamps */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge status={viewInvoice.status} />
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${PAYMENT_COLOR[viewInvoice.paymentMethod] || "bg-slate-100 text-slate-600"}`}>
                  {viewInvoice.paymentMethod}
                </span>
                {viewInvoice.providerAccount && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">{viewInvoice.providerAccount}</span>
                )}
              </div>

              {/* Patient Info */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Patient</p>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-sky-100 text-cyan-700 font-black text-xs">
                    {viewInvoice.patient?.name?.split(" ").filter(Boolean).slice(-2).map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{viewInvoice.patient?.name}</p>
                    <p className="text-xs text-slate-400">{viewInvoice.patient?.uhid} · {viewInvoice.patient?.patientId} · {viewInvoice.patient?.paymentCategory}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="grid gap-2 sm:grid-cols-3">
                <InfoRow label="Created" value={formatDateTime(viewInvoice.createdAt)} />
                <InfoRow label="Finalized" value={formatDateTime(viewInvoice.finalizedAt)} />
                <InfoRow label="Paid" value={formatDateTime(viewInvoice.paidAt)} />
              </div>

              {/* Billing Items */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Billing Items ({viewInvoice.items?.length || 0})
                </p>
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">Service Point</th>
                        <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">Description</th>
                        <th className="px-3 py-2.5 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">Qty</th>
                        <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-slate-400">Unit</th>
                        <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-slate-400">Disc%</th>
                        <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-slate-400">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {viewInvoice.items?.map((item, i) => (
                        <tr key={item.id || i} className="hover:bg-slate-50/60">
                          <td className="px-3 py-2.5 text-[10px] text-slate-500 max-w-[100px] truncate">{item.servicePoint}</td>
                          <td className="px-3 py-2.5 text-xs font-semibold text-slate-900">{item.description}</td>
                          <td className="px-3 py-2.5 text-xs text-center text-slate-600">{item.qty}</td>
                          <td className="px-3 py-2.5 text-xs text-right text-slate-600 whitespace-nowrap">{formatKES(item.unitPrice)}</td>
                          <td className="px-3 py-2.5 text-xs text-center text-slate-500">{item.discount || 0}%</td>
                          <td className="px-3 py-2.5 text-xs font-bold text-right text-slate-900 whitespace-nowrap">{formatKES(item.netAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span className="font-semibold">{formatKES(viewInvoice.subtotal)}</span></div>
                {viewInvoice.discountTotal > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600"><span>Total Discount</span><span className="font-semibold">— {formatKES(viewInvoice.discountTotal)}</span></div>
                )}
                {viewInvoice.copayment > 0 && (
                  <div className="flex justify-between text-sm text-slate-600"><span>Copayment</span><span className="font-semibold">+ {formatKES(viewInvoice.copayment)}</span></div>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="font-black text-slate-900">Grand Total</span>
                  <span className="font-black text-cyan-700 text-base">{formatKES(viewInvoice.grandTotal)}</span>
                </div>
              </div>

              {viewInvoice.notes && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-bold text-amber-700 mb-0.5">Notes</p>
                  <p className="text-sm text-amber-800">{viewInvoice.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap justify-end gap-3 pt-1">
                <button onClick={() => setViewInvoice(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Close
                </button>
                {viewInvoice.status === "Interim" && (
                  <>
                    <button onClick={() => { handleContinueBilling(viewInvoice); setViewInvoice(null); }}
                      className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                      <ArrowUpRight size={14} /> Continue Billing
                    </button>
                    <button onClick={() => setConfirmAction({ type: "cancel", inv: viewInvoice })}
                      className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
                      <Ban size={14} /> Cancel
                    </button>
                  </>
                )}
                {viewInvoice.status === "Final" && (
                  <>
                    <button onClick={() => setConfirmAction({ type: "cancel", inv: viewInvoice })}
                      className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
                      <Ban size={14} /> Cancel Invoice
                    </button>
                    <button onClick={() => setConfirmAction({ type: "pay", inv: viewInvoice })}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                      <DollarSign size={14} /> Mark as Paid
                    </button>
                  </>
                )}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Confirm Action Modal */}
      <AnimatePresence>
        {confirmAction && (
          <Modal
            title={confirmAction.type === "pay" ? "Mark Invoice as Paid?" : "Cancel Invoice?"}
            subtitle={confirmAction.inv.id}
            onClose={() => setConfirmAction(null)}
          >
            <div className="space-y-5">
              {confirmAction.type === "pay" ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-800">
                    You are marking <strong>{confirmAction.inv.id}</strong> as fully paid.
                    The invoice total is <strong>{formatKES(confirmAction.inv.grandTotal)}</strong>.
                    This action cannot be undone.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-red-800">
                      You are cancelling invoice <strong>{confirmAction.inv.id}</strong> for {confirmAction.inv.patient?.name}.
                      This cannot be undone.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmAction(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Go Back
                </button>
                {confirmAction.type === "pay" ? (
                  <button onClick={() => handleMarkPaid(confirmAction.inv)}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                    <CheckCircle2 size={14} /> Confirm Payment
                  </button>
                ) : (
                  <button onClick={() => handleCancel(confirmAction.inv)}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors">
                    <Ban size={14} /> Cancel Invoice
                  </button>
                )}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Invoices;
