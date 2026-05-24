import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Search, Eye, CheckCircle2 } from "lucide-react";
import { useInvoiceStore } from "../../store/invoiceStore";
import { PageHeader, SearchBar } from "../../components/layout/PageHeader";
import { StatsCard, StatsGrid } from "../../components/layout/StatsCard";

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
      {/* Header */}
      <PageHeader
        breadcrumbs="Finance"
        title="OP Invoices"
        subtitle="View finalized invoices and create an invoice from interim billings."
      >
        <button
          onClick={() => navigate("/finance/invoices/interim")}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-cyan-700/20 transition-all hover:bg-cyan-800 active:bg-cyan-900"
        >
          <Plus size={15} />
          Add Invoice
        </button>
      </PageHeader>

      {/* Stats Cards */}
      <StatsGrid columns="dual">
        <StatsCard
          title="Finalized Invoices"
          value={finalizedInvoices.length}
          icon={FileText}
          iconBg="bg-cyan-100"
          iconColor="text-cyan-700"
        />
        <StatsCard
          title="Finalized Value"
          value={formatKES(totalFinalizedAmount)}
          icon={CheckCircle2}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-700"
        />
      </StatsGrid>

      {/* Search Bar */}
      <SearchBar
        placeholder="Search invoice, patient, UHID, payment type, service point..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                  <tr key={inv.id} className="transition-colors hover:bg-cyan-50/30">
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
