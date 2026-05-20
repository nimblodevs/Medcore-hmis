import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Search, Eye, CheckCircle2 } from "lucide-react";
import { useInvoiceStore } from "../../store/invoiceStore";

const formatKES = (value) =>
  `KES ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const formatDate = (iso) => {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
};

const Invoices = () => {
  const navigate = useNavigate();
  const { invoices } = useInvoiceStore();
  const [search, setSearch] = useState("");

  const finalizedInvoices = useMemo(
    () =>
      invoices
        .filter((inv) => inv.status === "Final")
        .sort((a, b) => new Date(b.finalizedAt || b.createdAt) - new Date(a.finalizedAt || a.createdAt)),
    [invoices]
  );

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return finalizedInvoices;
    return finalizedInvoices.filter((inv) => {
      const servicePoints = (inv.items || []).map((item) => item.servicePoint).join(" ").toLowerCase();
      return (
        inv.id?.toLowerCase().includes(query) ||
        inv.patient?.name?.toLowerCase().includes(query) ||
        inv.patient?.uhid?.toLowerCase().includes(query) ||
        inv.paymentMethod?.toLowerCase().includes(query) ||
        servicePoints.includes(query)
      );
    });
  }, [finalizedInvoices, search]);

  const totalFinalizedAmount = useMemo(
    () => finalizedInvoices.reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0),
    [finalizedInvoices]
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">OP Invoices</h1>
          <p className="text-sm font-medium text-slate-500">
            View finalized invoices and create an invoice from interim billings.
          </p>
        </div>
        <button
          onClick={() => navigate("/finance/invoices/interim")}
          className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-700 shadow-sm shadow-cyan-200"
        >
          <Plus size={15} />
          Add Invoice
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <FileText size={17} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Finalized Invoices</p>
              <p className="text-base font-black text-slate-900">{finalizedInvoices.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={17} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Finalized Value</p>
              <p className="text-base font-black text-slate-900">{formatKES(totalFinalizedAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative min-w-[220px]">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search invoice, patient, UHID, payment type, service point..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder-slate-400 focus:border-cyan-400"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText size={36} className="mb-2 opacity-20" />
            <p className="font-semibold text-slate-500">No finalized invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Invoice No.", "Patient", "Finalized Date", "Payment", "Items", "Amount", ""].map((head) => (
                    <th key={head} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-700">{inv.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-semibold text-slate-900">{inv.patient?.name}</p>
                      <p className="text-[10px] text-slate-400">{inv.patient?.uhid}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{formatDate(inv.finalizedAt || inv.createdAt)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{inv.paymentMethod}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{(inv.items || []).length}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-900">{formatKES(inv.grandTotal)}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => navigate(`/finance/invoices/preview/${encodeURIComponent(inv.id)}`)}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-cyan-700 transition-colors hover:bg-cyan-50"
                      >
                        <Eye size={12} />
                        Preview
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
  );
};

export default Invoices;
