import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Banknote, CheckCircle2 } from "lucide-react";
import { useInvoiceStore } from "../../store/invoiceStore";
import { PageHeader, SearchBar } from "../../components/layout/PageHeader";
import { StatsCard, StatsGrid } from "../../components/layout/StatsCard";

const formatKES = (value) =>
  `KES ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const formatDateTime = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CashierTransactions = () => {
  const { invoices, updateInvoice } = useInvoiceStore();
  const [search, setSearch] = useState("");

  const pendingCashBills = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.status === "Cash Pending")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [invoices]
  );

  const filteredBills = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return pendingCashBills;
    return pendingCashBills.filter((invoice) =>
      invoice.id.toLowerCase().includes(query) ||
      invoice.patient?.name?.toLowerCase().includes(query) ||
      invoice.patient?.uhid?.toLowerCase().includes(query) ||
      (invoice.items || []).some((item) => item.billId?.toLowerCase().includes(query))
    );
  }, [pendingCashBills, search]);

  const totalPending = useMemo(
    () => pendingCashBills.reduce((sum, invoice) => sum + Number(invoice.grandTotal || 0), 0),
    [pendingCashBills]
  );

  const markPaid = (invoice) => {
    updateInvoice(invoice.id, {
      status: "Paid",
      finalizedAt: invoice.finalizedAt || new Date().toISOString(),
      paidAt: new Date().toISOString(),
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumbs="Finance"
        title="Cashier Transactions"
        subtitle="Cash bills awaiting cashier collection."
      />

      {/* Stats Cards */}
      <StatsGrid columns="dual">
        <StatsCard
          title="Pending Cash Bills"
          value={pendingCashBills.length}
          icon={Banknote}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-700"
        />
        <StatsCard
          title="Pending Amount"
          value={formatKES(totalPending)}
          icon={CheckCircle2}
          iconBg="bg-cyan-100"
          iconColor="text-cyan-700"
        />
      </StatsGrid>

      {/* Search Bar */}
      <SearchBar
        placeholder="Search invoice, patient, UHID, bill ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filteredBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Banknote size={36} className="mb-2 opacity-20" />
            <p className="font-semibold text-slate-500">No pending cash transactions</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Date", "Invoice", "Bill IDs", "Patient", "Items", "Amount", ""].map((head) => (
                    <th key={head} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBills.map((invoice) => (
                  <tr key={invoice.id} className="transition-colors hover:bg-cyan-50/30">
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(invoice.createdAt)}</td>
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-700">{invoice.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="max-w-[220px] truncate font-mono text-[10px] font-semibold text-slate-600">
                        {[...new Set((invoice.items || []).map((item) => item.billId).filter(Boolean))].join(", ")}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-semibold text-slate-900">{invoice.patient?.name}</p>
                      <p className="text-[10px] text-slate-400">{invoice.patient?.uhid}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{(invoice.items || []).length}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-900">{formatKES(invoice.grandTotal)}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => markPaid(invoice)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                      >
                        <CheckCircle2 size={12} />
                        Receive
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

export default CashierTransactions;
