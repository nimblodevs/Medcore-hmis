import { useMemo } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Printer } from "lucide-react";
import { useInvoiceStore } from "../../store/invoiceStore";
import { mockProviders, mockSchemes } from "../../constants/mockDebtors";

const FACILITY = {
  name: "MediCore General Hospital",
  mfl: "MFL 13104",
  address: "P.O. Box 12345-00100, Nairobi, Kenya",
  phone: "+254 722 000 111",
  email: "billing@medicore.co.ke",
  subtitle: "General Outpatient Facility",
};

const BIOMETRIC_OPTIONS = ["Smart", "Slade", "Mtiba", "Off-Smart", "Off-Mtiba", "Off-Slade"];

const formatKES = (value) =>
  `KES ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const formatAmount = (value) =>
  Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

const formatDate = (iso) => {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatNumericDate = (iso) => {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("/");
};

const getProvider = (invoice) =>
  mockProviders.find((provider) => provider.accountNumber === invoice?.providerAccount);

const getProviderName = (invoice) =>
  getProvider(invoice)?.providerName || invoice?.patient?.corporateName || invoice?.providerAccount || "-";

const getScheme = (invoice) => {
  if (invoice?.schemeId) return mockSchemes.find((item) => item.id === invoice.schemeId);
  const provider = getProvider(invoice);
  return mockSchemes.find((item) => item.id === provider?.schemes?.[0]);
};

const getSchemeName = (invoice) => {
  if (invoice?.schemeName) return invoice.schemeName;
  if (invoice?.patient?.insuranceSchemeName) return invoice.patient.insuranceSchemeName;
  if (invoice?.patient?.schemeName) return invoice.patient.schemeName;
  const scheme = getScheme(invoice);
  return scheme?.schemeName || invoice?.patient?.paymentCategory || invoice?.paymentMethod || "-";
};

const getBiometricStatus = (invoice) => {
  const configured =
    invoice?.biometricStatus ||
    invoice?.patient?.biometricStatus ||
    invoice?.patient?.biometric;

  if (BIOMETRIC_OPTIONS.includes(configured)) return configured;

  const seed = String(invoice?.id || "")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return BIOMETRIC_OPTIONS[seed % BIOMETRIC_OPTIONS.length];
};

const getCoverEndDate = (invoice) => {
  const scheme = getScheme(invoice);
  return formatDate(
    invoice?.coverEndDate ||
    invoice?.patient?.coverEndDate ||
    invoice?.patient?.schemeExpiryDate ||
    invoice?.patient?.insuranceCoverEndDate ||
    scheme?.expiryDate
  );
};

const getMemberNo = (invoice) =>
  invoice?.memberNo ||
  invoice?.patient?.insuranceMemberNumber ||
  invoice?.patient?.corporateAccountNumber ||
  invoice?.patient?.memberNo ||
  "-";

const getAge = (dob) => {
  if (!dob) return "-";
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return "-";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return `${age} years`;
};

const InvoicePreview = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { invoices } = useInvoiceStore();

  const decodedId = decodeURIComponent(invoiceId || "");
  const invoice = useMemo(() => invoices.find((item) => item.id === decodedId), [invoices, decodedId]);

  const normalizedItems = useMemo(
    () =>
      (invoice?.items || []).map((item, index) => ({
        ...item,
        billId: item.billId || `BILL-${invoice?.id || "INV"}-${String(index + 1).padStart(3, "0")}`,
      })),
    [invoice]
  );

  const servicePointGroups = useMemo(() => {
    const groups = [];
    normalizedItems.forEach((item) => {
      const servicePoint = item.servicePoint || "-";
      const existingGroup = groups.find((group) => group.servicePoint === servicePoint);
      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        groups.push({ servicePoint, items: [item] });
      }
    });
    return groups;
  }, [normalizedItems]);

  const provider = getProvider(invoice);
  const providerName = getProviderName(invoice);
  const schemeName = getSchemeName(invoice);
  const coverEndDate = getCoverEndDate(invoice);
  const serviceDate = formatDate(invoice.finalizedAt || invoice.createdAt);
  const signatureDate = formatNumericDate(invoice.finalizedAt || invoice.createdAt);
  const isInterimInvoice = invoice.status === "Interim";
  const invoiceTitle = isInterimInvoice ? "Interim Invoice" : "Final Invoice";
  const today = formatDate(new Date().toISOString());

  if (!invoice) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-700">Invoice not found.</p>
        <button
          onClick={() => navigate("/finance/invoices")}
          className="mt-4 rounded-xl bg-cyan-700 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-800"
        >
          Back to OP Invoices
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <style>
        {`
          @page { size: A4; margin: 0; }
          @media print {
            body { background: white !important; }
            .print-hide { display: none !important; }
            .print-shell { padding: 0 !important; overflow: visible !important; }
            .invoice-page {
              width: 210mm !important;
              min-width: 210mm !important;
              max-width: 210mm !important;
              height: 297mm !important;
              min-height: 297mm !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
            }
          }
        `}
      </style>

      <div className="print-hide flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/finance/invoices/interim")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <ArrowLeft size={14} />
          Back to Interim Invoices
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-800"
        >
          <Printer size={14} />
          Print A4
        </button>
      </div>

      <div className="print-shell overflow-x-auto rounded-2xl bg-slate-100 p-4">
        <div className="invoice-page relative mx-auto h-[297mm] w-[210mm] max-w-full overflow-hidden bg-white p-[10mm] text-slate-800 shadow-xl">
          <div className="absolute right-4 top-3 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500 print:hidden">
            A4 Preview
          </div>

          <div className="border-b-2 border-cyan-600 pb-3">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="mb-1 flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-700 text-sm font-black text-white">M</div>
                  <div>
                    <p className="text-base font-black leading-tight text-slate-900">{FACILITY.name}</p>
                    <p className="text-xs text-slate-500">{FACILITY.subtitle} | {FACILITY.mfl}</p>
                  </div>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">{FACILITY.address}</p>
                <p className="text-xs text-slate-500">Tel: {FACILITY.phone} | Email: {FACILITY.email}</p>
              </div>
              <div className="text-right">
                <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Credit Invoice</p>
                  <p className="font-mono text-sm font-bold text-cyan-700">{invoice.id}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">Date: {serviceDate}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm font-black uppercase tracking-wide text-slate-900">{invoiceTitle}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Details</p>
              <p className="text-sm font-bold text-slate-900">{invoice.patient?.name || "-"}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                <p>UHID: <span className="font-semibold text-slate-800">{invoice.patient?.uhid || "-"}</span></p>
                <p>Patient No: <span className="font-semibold text-slate-800">{invoice.patient?.patientId || "-"}</span></p>
                <p>DOB: <span className="font-semibold text-slate-800">{formatDate(invoice.patient?.dob)}</span></p>
                <p>Gender: <span className="font-semibold text-slate-800">{invoice.patient?.gender || "-"}</span></p>
                <p>Age: <span className="font-semibold text-slate-800">{getAge(invoice.patient?.dob)}</span></p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Payer Details</p>
              <p className="text-sm font-bold text-slate-900">{providerName}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                <p>Type: <span className="font-semibold text-slate-800">{provider?.providerType || invoice.paymentMethod || "Credit"}</span></p>
                <p>Account: <span className="font-semibold text-slate-800">{invoice.providerAccount || "-"}</span></p>
                <p>Scheme: <span className="font-semibold text-slate-800">{schemeName}</span></p>
                <p>Member No: <span className="font-semibold text-slate-800">{getMemberNo(invoice)}</span></p>
                <p>Biometric: <span className="font-semibold text-slate-800">{getBiometricStatus(invoice)}</span></p>
                <p>Cover End Date: <span className="font-semibold text-slate-800">{coverEndDate}</span></p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <FileText size={13} className="text-cyan-700" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Billed Items Schedule</p>
              </div>
              <p className="text-[10px] font-semibold text-slate-500">{normalizedItems.length} item{normalizedItems.length === 1 ? "" : "s"}</p>
            </div>
            <div className="space-y-2 p-2">
              {servicePointGroups.map((group) => {
                const servicePointTotal = group.items.reduce((sum, item) => sum + Number(item.netAmount || 0), 0);
                return (
                  <div key={group.servicePoint} className="overflow-hidden rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-2.5 py-1.5">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-700">{group.servicePoint}</p>
                      <p className="text-[9px] font-bold text-slate-500">{formatAmount(servicePointTotal)}</p>
                    </div>
                    <table className="w-full table-fixed text-[10px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-white">
                          <th className="w-[18%] px-2 py-1.5 text-left text-[8px] font-bold uppercase tracking-wider text-slate-500">Bill ID</th>
                          <th className="w-[38%] px-2 py-1.5 text-left text-[8px] font-bold uppercase tracking-wider text-slate-500">Description</th>
                          <th className="w-[8%] px-2 py-1.5 text-center text-[8px] font-bold uppercase tracking-wider text-slate-500">Qty</th>
                          <th className="w-[12%] px-2 py-1.5 text-right text-[8px] font-bold uppercase tracking-wider text-slate-500">Unit</th>
                          <th className="w-[10%] px-2 py-1.5 text-right text-[8px] font-bold uppercase tracking-wider text-slate-500">Disc</th>
                          <th className="w-[14%] px-2 py-1.5 text-right text-[8px] font-bold uppercase tracking-wider text-slate-500">Net</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {group.items.map((item, idx) => (
                          <tr key={item.id || `${group.servicePoint}-${idx}`}>
                            <td className="truncate px-2 py-1.5 font-mono text-[9px] font-semibold text-slate-700">{item.billId}</td>
                            <td className="truncate px-2 py-1.5 font-medium text-slate-900">{item.description}</td>
                            <td className="px-2 py-1.5 text-center text-slate-600">{item.qty}</td>
                            <td className="px-2 py-1.5 text-right text-slate-600">{formatAmount(item.unitPrice)}</td>
                            <td className="px-2 py-1.5 text-right text-slate-600">{item.discount || 0}%</td>
                            <td className="px-2 py-1.5 text-right font-bold text-slate-900">{formatAmount(item.netAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 ml-auto w-[76mm] rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold">{formatKES(invoice.subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span>Discount</span>
              <span className="font-semibold">- {formatKES(invoice.discountTotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span>Copayment</span>
              <span className="font-semibold">+ {formatKES(invoice.copayment)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-xs font-black uppercase tracking-wide text-slate-900">Grand Total</span>
              <span className="text-sm font-black text-cyan-700">{formatKES(invoice.grandTotal)}</span>
            </div>
          </div>

          {!isInterimInvoice && (
            <div className="absolute bottom-[16mm] left-[10mm] right-[10mm] border-t border-slate-200 pt-3">
              <p className="mb-4 text-center text-xs font-semibold text-slate-800">
                I confirm that I have received the above services.
              </p>
              <div className="mx-auto flex max-w-[174mm] items-end gap-6 text-xs font-semibold text-slate-800">
                <span className="shrink-0">Name</span>
                <span className="h-5 flex-1 border-b border-slate-500" aria-label="Patient or guardian name" />
                <span className="shrink-0">Sign</span>
                <span className="h-5 flex-1 border-b border-slate-500" aria-label="Patient or guardian signature" />
                <span className="shrink-0">Date: {signatureDate}</span>
              </div>
            </div>
          )}

          <p className="absolute bottom-[8mm] left-[10mm] right-[10mm] border-t border-slate-100 pt-2 text-center text-[9px] text-slate-400">
            This is a computer-generated credit invoice. {FACILITY.name} | {FACILITY.mfl} | {today}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default InvoicePreview;
