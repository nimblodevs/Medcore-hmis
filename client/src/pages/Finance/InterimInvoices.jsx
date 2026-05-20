import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Search } from "lucide-react";
import { useInvoiceStore } from "../../store/invoiceStore";
import { mockProviders, mockSchemes } from "../../constants/mockDebtors";

const formatKES = (value) =>
  `KES ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const formatDateTime = (iso) => {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getProviderName = (invoice) => {
  if (!invoice?.providerAccount) return invoice?.patient?.corporateName || "-";
  const provider = mockProviders.find((item) => item.accountNumber === invoice.providerAccount);
  return provider?.providerName || invoice?.patient?.corporateName || invoice.providerAccount;
};

const getSchemeName = (invoice) => {
  if (invoice?.schemeId) {
    const direct = mockSchemes.find((scheme) => scheme.id === invoice.schemeId);
    if (direct?.schemeName) return direct.schemeName;
  }
  if (invoice?.providerAccount) {
    const provider = mockProviders.find((item) => item.accountNumber === invoice.providerAccount);
    const fallbackScheme = mockSchemes.find((scheme) => scheme.providerId === provider?.id);
    if (fallbackScheme?.schemeName) return fallbackScheme.schemeName;
  }
  return invoice?.patient?.paymentCategory || invoice?.paymentMethod || "-";
};

const InterimInvoices = () => {
  const navigate = useNavigate();
  const { invoices } = useInvoiceStore();
  const [search, setSearch] = useState("");

  const interimInvoices = useMemo(
    () =>
      invoices
        .filter((inv) => inv.status === "Interim")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [invoices]
  );

  const filteredInterim = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return interimInvoices;
    return interimInvoices.filter((inv) => {
      const servicePoints = [...new Set((inv.items || []).map((item) => item.servicePoint))]
        .join(" ")
        .toLowerCase();
      const providerName = getProviderName(inv).toLowerCase();
      const schemeName = getSchemeName(inv).toLowerCase();
      return (
        inv.id?.toLowerCase().includes(query) ||
        inv.patient?.name?.toLowerCase().includes(query) ||
        inv.patient?.uhid?.toLowerCase().includes(query) ||
        providerName.includes(query) ||
        schemeName.includes(query) ||
        servicePoints.includes(query)
      );
    });
  }, [interimInvoices, search]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Interim Invoice Billings</h1>
          <p className="text-sm font-medium text-slate-500">
            All interim billings from service points. Click any row to open invoice preview.
          </p>
        </div>
        <button
          onClick={() => navigate("/finance/invoices")}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <ArrowLeft size={14} />
          Back to OP Invoices
        </button>
      </div>

      <div className="relative min-w-[220px]">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search interim invoice, patient, UHID, service point..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder-slate-400 focus:border-cyan-400"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filteredInterim.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText size={36} className="mb-2 opacity-20" />
            <p className="font-semibold text-slate-500">No interim billings available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Date", "Patient Name", "UHID No.", "Provider", "Scheme", "Service Points", "Amount"].map((head) => (
                    <th key={head} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInterim.map((inv) => {
                  const provider = getProviderName(inv);
                  const scheme = getSchemeName(inv);
                  const servicePoints = [...new Set((inv.items || []).map((item) => item.servicePoint).filter(Boolean))];
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => navigate(`/finance/invoices/preview/${encodeURIComponent(inv.id)}`)}
                      className="cursor-pointer transition-colors hover:bg-cyan-50/60"
                    >
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(inv.createdAt)}</td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-900">{inv.patient?.name || "-"}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{inv.patient?.uhid || "-"}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{provider}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{scheme}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        <p className="max-w-[260px] truncate">{servicePoints.join(", ") || "-"}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-bold text-slate-900">{formatKES(inv.grandTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InterimInvoices;
