import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send, FileText, CheckCircle2, Clock, DollarSign, AlertTriangle,
  Plus, X, ChevronDown, Search, Eye, Trash2, SquareCheckBig,
  Square, Printer, Building2, ShieldCheck, Landmark,
  ArrowRight, CheckCheck, ReceiptText, ChevronRight,
} from "lucide-react";
import { useInvoiceStore } from "../../store/invoiceStore";
import { useDispatchStore, generateDispatchId } from "../../store/dispatchStore";
import { mockProviders, mockSchemes } from "../../constants/mockDebtors";
import { generateClaimReferenceNo } from "../../services/referenceApi";

const FACILITY = {
  name: "MediCore General Hospital",
  mfl: "MFL 13104",
  address: "P.O. Box 12345-00100, Nairobi, Kenya",
  phone: "+254 722 000 111",
  email: "billing@medicore.co.ke",
  subtitle: "General Outpatient Facility",
};

const CREDIT_TYPES = ["Corporate", "Insurance", "Government"];
const DISPATCH_METHODS = ["Email", "Courier", "Hand Delivery", "Provider Portal", "Post"];

const STATUS_CFG = {
  Draft:        { label: "Draft",        color: "bg-slate-100 text-slate-600 border-slate-200",    dot: "bg-slate-400",    icon: Clock,         step: 1 },
  Dispatched:   { label: "Dispatched",   color: "bg-blue-100 text-blue-700 border-blue-200",       dot: "bg-blue-500",     icon: Send,          step: 2 },
  Acknowledged: { label: "Acknowledged", color: "bg-violet-100 text-violet-700 border-violet-200", dot: "bg-violet-500",   icon: CheckCheck,    step: 3 },
  Settled:      { label: "Settled",      color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle2, step: 4 },
  Disputed:     { label: "Disputed",     color: "bg-red-100 text-red-600 border-red-200",           dot: "bg-red-500",      icon: AlertTriangle, step: null },
};

const TYPE_CFG = {
  Insurance:  { color: "bg-blue-100 text-blue-700 border-blue-200",    icon: ShieldCheck },
  Corporate:  { color: "bg-violet-100 text-violet-700 border-violet-200", icon: Building2 },
  Government: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Landmark },
};

const METHOD_COLOR = {
  Email:             "bg-cyan-100 text-cyan-700",
  Courier:           "bg-indigo-100 text-indigo-700",
  "Hand Delivery":   "bg-slate-100 text-slate-600",
  "Provider Portal": "bg-violet-100 text-violet-700",
  Post:              "bg-amber-100 text-amber-700",
};

const TABS = ["All", "Draft", "Dispatched", "Acknowledged", "Settled", "Disputed"];
const INVOICES_PER_DISPATCH_PAGE = 25;

const formatKES = (v) => `KES ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
};
const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-KE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const getInvoiceSchemeName = (invoice, providerAccount) => {
  const patient = invoice.patient || {};
  if (invoice.schemeName) return invoice.schemeName;
  if (patient.insuranceSchemeName) return patient.insuranceSchemeName;
  if (patient.schemeName) return patient.schemeName;

  const provider = mockProviders.find((p) => p.accountNumber === (invoice.providerAccount || providerAccount));
  const scheme = mockSchemes.find((s) => s.id === provider?.schemes?.[0]);
  return scheme?.schemeName || "—";
};

const getInvoiceMemberNo = (invoice) => {
  const patient = invoice.patient || {};
  return (
    invoice.memberNo ||
    patient.insuranceMemberNumber ||
    patient.corporateAccountNumber ||
    patient.memberNo ||
    "—"
  );
};

const getDispatchSchemeSummary = (dispatch) => {
  const schemes = [...new Set((dispatch.invoiceSnapshots || [])
    .map((invoice) => getInvoiceSchemeName(invoice, dispatch.providerAccount))
    .filter((value) => value && value !== "â€”"))];
  if (!schemes.length) return "â€”";
  if (schemes.length === 1) return schemes[0];
  return `${schemes[0]} +${schemes.length - 1}`;
};

const getDispatchMemberSummary = (dispatch) => {
  const members = [...new Set((dispatch.invoiceSnapshots || [])
    .map(getInvoiceMemberNo)
    .filter((value) => value && value !== "â€”"))];
  if (!members.length) return "â€”";
  if (members.length === 1) return members[0];
  return `${members.length} members`;
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.Draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
      <Icon size={9} strokeWidth={2.5} /> {cfg.label}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CFG[type] || TYPE_CFG.Corporate;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${cfg.color}`}>
      <Icon size={8} strokeWidth={2.5} /> {type}
    </span>
  );
};

const WorkflowStepper = ({ status }) => {
  const steps = [
    { label: "Draft", step: 1 },
    { label: "Dispatched", step: 2 },
    { label: "Acknowledged", step: 3 },
    { label: "Settled", step: 4 },
  ];
  const current = STATUS_CFG[status]?.step || 0;
  const isDisputed = status === "Disputed";
  return (
    <div className="flex items-center gap-0.5">
      {steps.map((s, i) => {
        const done = current >= s.step;
        const active = current === s.step;
        return (
          <div key={s.step} className="flex items-center gap-0.5">
            <div className={`size-2 rounded-full transition-colors ${isDisputed && active ? "bg-red-500" : done ? "bg-cyan-500" : "bg-slate-200"}`} />
            {i < steps.length - 1 && (
              <div className={`w-4 h-0.5 ${current > s.step ? "bg-cyan-500" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
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

const DispatchNote = ({ dispatch, onClose }) => {
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const today = new Date().toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" });
  const dispatchDate = dispatch.dispatchedAt ? formatDate(dispatch.dispatchedAt) : formatDate(dispatch.createdAt);
  const invoicePages = [];
  for (let i = 0; i < dispatch.invoiceSnapshots.length; i += INVOICES_PER_DISPATCH_PAGE) {
    invoicePages.push(dispatch.invoiceSnapshots.slice(i, i + INVOICES_PER_DISPATCH_PAGE));
  }
  const totalPrintPages = 1 + invoicePages.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm print:static print:block print:bg-white print:p-0 print:backdrop-blur-none">
      <style>
        {`
          @page {
            size: A4;
            margin: 0;
          }

          @media print {
            html,
            body {
              width: 210mm;
              min-height: 297mm;
              overflow: visible;
              background: white !important;
            }

            body * {
              visibility: hidden;
            }

            .dispatch-note-print-area,
            .dispatch-note-print-area * {
              visibility: visible;
            }

            .dispatch-note-print-area {
              position: absolute !important;
              inset: 0 auto auto 0 !important;
              width: 210mm !important;
            }

            .dispatch-note-page {
              box-shadow: none !important;
              break-after: page;
              page-break-after: always;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .dispatch-note-page:last-child {
              break-after: auto;
              page-break-after: auto;
            }
          }
        `}
      </style>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl print:contents"
      >
        {/* Controls */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <ReceiptText size={16} className="text-cyan-600" />
            <span className="text-sm font-bold text-slate-900">Dispatch Note — {dispatch.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrintPreview(true)}
              className="flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-100"
            >
              <Eye size={13} /> Print Preview
            </button>
            <button onClick={onClose} className="rounded-xl p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5 print:hidden">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dispatch Reference</p>
            <p className="mt-1 font-mono text-lg font-black text-cyan-700">{dispatch.id}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{dispatch.providerName}</p>
            <p className="text-xs text-slate-500">{dispatch.contactPerson} · {dispatch.email}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Invoices", value: dispatch.invoiceCount },
              { label: "Pages", value: totalPrintPages },
              { label: "Total", value: formatKES(dispatch.totalAmount) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-white px-3 py-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
            <p className="text-sm font-bold text-cyan-800">Print preview is ready</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              The printable packet has the dispatch letter on page 1 and invoice schedule pages from page 2 onward.
              Each invoice schedule page holds up to {INVOICES_PER_DISPATCH_PAGE} invoices.
            </p>
            <button
              type="button"
              onClick={() => setShowPrintPreview(true)}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-cyan-800"
            >
              <Eye size={13} /> Open Print Preview
            </button>
          </div>
        </div>

        {showPrintPreview && (
          <div className="fixed inset-0 z-[60] bg-slate-950/70 p-3 backdrop-blur-sm print:static print:bg-white print:p-0 print:backdrop-blur-none">
            <div className="mx-auto flex h-full w-[min(100%,calc(210mm+32px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-2xl print:block print:h-auto print:w-[210mm] print:overflow-visible print:rounded-none print:border-0 print:bg-white print:shadow-none">
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 print:hidden">
                <div>
                  <p className="text-sm font-bold text-slate-900">Print Preview</p>
                  <p className="text-xs text-slate-500">{dispatch.id} · {totalPrintPages} A4 pages</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-cyan-800"
                  >
                    <Printer size={13} /> Print
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPrintPreview(false)}
                    className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-4 print:overflow-visible print:p-0">
        <div className="dispatch-note-print-area mx-auto space-y-4 print:space-y-0">
        <div className="dispatch-note-page relative mx-auto h-[297mm] w-[210mm] max-w-full overflow-hidden bg-white p-[11mm] font-[system-ui] text-slate-800 shadow-xl print:m-0 print:h-[297mm] print:w-[210mm] print:max-w-none print:p-[10mm] print:shadow-none">
          {showPrintPreview && (
            <div className="absolute right-4 top-3 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 print:hidden">
              Page 1 of {totalPrintPages}
            </div>
          )}

          {/* Letterhead */}
          <div className="border-b-2 border-cyan-600 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-600 text-sm font-black text-white">M</div>
                  <div>
                    <p className="text-base font-black leading-tight text-slate-900">{FACILITY.name}</p>
                    <p className="text-xs text-slate-500">{FACILITY.subtitle} · {FACILITY.mfl}</p>
                  </div>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">{FACILITY.address}</p>
                <p className="text-xs text-slate-500">Tel: {FACILITY.phone} · Email: {FACILITY.email}</p>
              </div>
              <div className="text-right">
                <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Dispatch Reference</p>
                  <p className="font-mono text-sm font-bold text-cyan-700">{dispatch.id}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Date: {dispatchDate}</p>
                </div>
                <div className="mt-1.5">
                  <StatusBadge status={dispatch.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Addressee */}
          <div className="mt-4 space-y-0.5">
            <p className="text-xs font-bold text-slate-900">{dispatch.contactPerson}</p>
            <p className="text-xs text-slate-700">{dispatch.providerName}</p>
            <p className="text-xs text-slate-600">{dispatch.address}</p>
            <p className="text-xs text-slate-600">Email: {dispatch.email}</p>
            {dispatch.phone && <p className="text-xs text-slate-600">Tel: {dispatch.phone}</p>}
          </div>

          {/* Subject line */}
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-900">
              RE: INVOICE DISPATCH NOTE — {dispatch.invoiceCount} INVOICE{dispatch.invoiceCount !== 1 ? "S" : ""} TOTALLING {formatKES(dispatch.totalAmount)}
            </p>
          </div>

          {/* Salutation + Opening */}
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700">
            <p>Dear {dispatch.contactPerson},</p>
            <p>
              Please find below a formal dispatch of <strong>{dispatch.invoiceCount} invoice{dispatch.invoiceCount !== 1 ? "s" : ""}</strong> for medical
              services rendered to your {dispatch.providerType === "Insurance" ? "insured members" : "staff members"} at{" "}
              {FACILITY.name}. Kindly process the enclosed claims at your earliest convenience and remit payment to our
              account within <strong>30 days</strong> of receipt of this notice.
            </p>
          </div>

          {/* Invoice Schedule Summary */}
          <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">
              Invoice schedule attached
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-700">
              The detailed list of all dispatched invoices starts on page 2. This dispatch includes{" "}
              <strong>{dispatch.invoiceCount} invoice{dispatch.invoiceCount !== 1 ? "s" : ""}</strong> with a total claimed amount of{" "}
              <strong>{formatKES(dispatch.totalAmount)}</strong>.
            </p>
          </div>

          {/* Dispatch Metadata */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Dispatch Method", value: dispatch.dispatchMethod },
              { label: "Provider Reference", value: dispatch.referenceNumber || "Pending" },
              { label: "Dispatched By", value: dispatch.dispatchedBy },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
                <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{value || "—"}</p>
              </div>
            ))}
          </div>

          {dispatch.notes && (
            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
              <p className="mb-0.5 text-[10px] font-bold text-amber-700">Notes</p>
              <p className="text-xs text-amber-800">{dispatch.notes}</p>
            </div>
          )}

          {/* Closing + Signature */}
          <div className="mt-4 space-y-2 text-xs text-slate-700">
            <p>
              For any queries regarding this dispatch, please contact our billing department at{" "}
              <span className="font-semibold">{FACILITY.email}</span> or call{" "}
              <span className="font-semibold">{FACILITY.phone}</span>.
            </p>
            <p>Yours faithfully,</p>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="mb-1.5 h-9 border-b border-slate-400" />
                <p className="text-xs font-bold text-slate-700">{dispatch.dispatchedBy}</p>
                <p className="text-[10px] text-slate-500">Administrator / Authorized Signatory</p>
                <p className="text-[10px] text-slate-500">{FACILITY.name}</p>
              </div>
              <div>
                <div className="mb-1.5 h-9 border-b border-slate-400" />
                <p className="text-xs font-bold text-slate-700">For: {dispatch.providerName}</p>
                <p className="text-[10px] text-slate-500">Acknowledgement Signature & Stamp</p>
                <p className="text-[10px] text-slate-500">Date: ___________________</p>
              </div>
            </div>
          </div>

          <p className="mt-4 border-t border-slate-100 pt-2 text-center text-[9px] text-slate-400">
            This is a computer-generated document. · {FACILITY.name} · {FACILITY.mfl} · {today}
          </p>
        </div>

        {invoicePages.map((pageInvoices, pageIndex) => {
          const firstInvoiceNumber = pageIndex * INVOICES_PER_DISPATCH_PAGE + 1;
          const printPageNumber = pageIndex + 2;
          const isLastInvoicePage = pageIndex === invoicePages.length - 1;

          return (
            <div
              key={`invoice-page-${pageIndex}`}
              className="dispatch-note-page relative mx-auto h-[297mm] w-[210mm] max-w-full overflow-hidden bg-white p-[10mm] font-[system-ui] text-slate-800 shadow-xl print:m-0 print:h-[297mm] print:w-[210mm] print:max-w-none print:shadow-none"
            >
              {showPrintPreview && (
                <div className="absolute right-4 top-3 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 print:hidden">
                  Page {printPageNumber} of {totalPrintPages}
                </div>
              )}

              <div className="border-b-2 border-cyan-600 pb-3">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-base font-black leading-tight text-slate-900">{FACILITY.name}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {FACILITY.subtitle} Â· {FACILITY.mfl} Â· {FACILITY.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Dispatch Reference</p>
                    <p className="font-mono text-sm font-bold text-cyan-700">{dispatch.id}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-slate-900">Invoice Schedule</p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {dispatch.providerName} Â· {dispatch.invoiceCount} invoice{dispatch.invoiceCount !== 1 ? "s" : ""} dispatched
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-right">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Schedule Page</p>
                  <p className="text-xs font-bold text-slate-800">
                    {pageIndex + 1} of {invoicePages.length}
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full table-fixed text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="w-[10%] px-2 py-2 text-left text-[8px] font-bold uppercase tracking-wider text-slate-500">Date</th>
                      <th className="w-[5%] px-2 py-2 text-left text-[8px] font-bold uppercase tracking-wider text-slate-500">#</th>
                      <th className="w-[14%] px-2 py-2 text-left text-[8px] font-bold uppercase tracking-wider text-slate-500">Invoice No.</th>
                      <th className="w-[20%] px-2 py-2 text-left text-[8px] font-bold uppercase tracking-wider text-slate-500">Patient Name</th>
                      <th className="w-[11%] px-2 py-2 text-left text-[8px] font-bold uppercase tracking-wider text-slate-500">UHID</th>
                      <th className="w-[18%] px-2 py-2 text-left text-[8px] font-bold uppercase tracking-wider text-slate-500">Scheme</th>
                      <th className="w-[12%] px-2 py-2 text-left text-[8px] font-bold uppercase tracking-wider text-slate-500">Member No</th>
                      <th className="w-[10%] px-2 py-2 text-right text-[8px] font-bold uppercase tracking-wider text-slate-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageInvoices.map((inv, i) => (
                      <tr key={inv.id}>
                        <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{formatDate(inv.finalizedAt)}</td>
                        <td className="px-2 py-1.5 text-slate-500">{firstInvoiceNumber + i}</td>
                        <td className="truncate px-2 py-1.5 font-mono font-semibold text-slate-700">{inv.id}</td>
                        <td className="truncate px-2 py-1.5 font-medium text-slate-900">{inv.patientName}</td>
                        <td className="truncate px-2 py-1.5 font-mono text-[9px] text-slate-500">{inv.uhid}</td>
                        <td className="truncate px-2 py-1.5 font-semibold text-slate-700">{getInvoiceSchemeName(inv, dispatch.providerAccount)}</td>
                        <td className="truncate px-2 py-1.5 font-mono text-[9px] font-semibold text-slate-600">{getInvoiceMemberNo(inv)}</td>
                        <td className="px-2 py-1.5 text-right font-bold text-slate-900">
                          {Number(inv.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {isLastInvoicePage && (
                    <tfoot>
                      <tr className="border-t-2 border-slate-300 bg-slate-50">
                        <td colSpan={7} className="px-2 py-2 text-right text-[10px] font-black uppercase tracking-wide text-slate-700">
                          Total Amount Claimed
                        </td>
                        <td className="px-2 py-2 text-right text-xs font-black text-cyan-700">
                          {Number(dispatch.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              <div className="absolute bottom-[10mm] left-[10mm] right-[10mm] border-t border-slate-100 pt-2 text-center text-[9px] text-slate-400">
                Invoice schedule for dispatch {dispatch.id} Â· Page {printPageNumber} of {totalPrintPages}
              </div>
            </div>
          );
        })}
        </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const Dispatches = () => {
  const { invoices } = useInvoiceStore();
  const { dispatches, addDispatch, updateDispatch, deleteDispatch } = useDispatchStore();

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [viewNote, setViewNote] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [actionInput, setActionInput] = useState("");
  const [successMsg, setSuccessMsg] = useState(null);

  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [createForm, setCreateForm] = useState({ method: "Email", reference: "", notes: "" });

  const dispatchedInvoiceIds = useMemo(() => {
    const active = dispatches.filter((d) => ["Draft", "Dispatched", "Acknowledged"].includes(d.status));
    return new Set(active.flatMap((d) => d.invoiceIds));
  }, [dispatches]);

  const availableCreditInvoices = useMemo(() =>
    invoices.filter(
      (inv) =>
        CREDIT_TYPES.includes(inv.paymentMethod) &&
        inv.status === "Final" &&
        inv.providerAccount &&
        !dispatchedInvoiceIds.has(inv.id)
    ),
    [invoices, dispatchedInvoiceIds]
  );

  const providerOptions = useMemo(() => {
    const map = {};
    availableCreditInvoices.forEach((inv) => {
      const acc = inv.providerAccount;
      if (!map[acc]) {
        const prov = mockProviders.find((p) => p.accountNumber === acc);
        map[acc] = {
          account: acc,
          providerName: prov?.providerName || inv.patient?.corporateName || "Unknown",
          providerType: prov?.providerType || inv.paymentMethod,
          contactPerson: prov?.contactPerson || "—",
          email: prov?.email || "—",
          address: prov?.address || "—",
          phone: prov?.phone || "—",
          invoices: [],
          total: 0,
        };
      }
      map[acc].invoices.push(inv);
      map[acc].total += inv.grandTotal;
    });
    return Object.values(map);
  }, [availableCreditInvoices]);

  const selectedProviderInvoices = useMemo(
    () => providerOptions.find((p) => p.account === selectedProvider?.account)?.invoices || [],
    [providerOptions, selectedProvider]
  );

  const selectedTotal = useMemo(
    () => selectedProviderInvoices.filter((i) => selectedInvoiceIds.includes(i.id)).reduce((s, i) => s + i.grandTotal, 0),
    [selectedProviderInvoices, selectedInvoiceIds]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return dispatches.filter((d) => {
      const matchTab = activeTab === "All" || d.status === activeTab;
      const matchSearch =
        !q ||
        d.id.toLowerCase().includes(q) ||
        d.providerName.toLowerCase().includes(q) ||
        d.referenceNumber?.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [dispatches, activeTab, search]);

  const counts = useMemo(() => {
    const c = { All: dispatches.length, Draft: 0, Dispatched: 0, Acknowledged: 0, Settled: 0, Disputed: 0 };
    dispatches.forEach((d) => { if (c[d.status] !== undefined) c[d.status]++; });
    return c;
  }, [dispatches]);

  const stats = useMemo(() => {
    const outstanding = dispatches
      .filter((d) => ["Dispatched", "Acknowledged"].includes(d.status))
      .reduce((s, d) => s + d.totalAmount, 0);
    const settled = dispatches.filter((d) => d.status === "Settled").reduce((s, d) => s + d.totalAmount, 0);
    const pending = dispatches.filter((d) => d.status === "Dispatched").length;
    return { outstanding, settled, pending };
  }, [dispatches]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleAction = (type, dispatch) => setActionModal({ type, dispatch });

  const executeAction = () => {
    const d = actionModal.dispatch;
    const now = new Date().toISOString();
    if (actionModal.type === "send") {
      updateDispatch(d.id, { status: "Dispatched", dispatchedAt: now });
      showSuccess(`${d.id} marked as Dispatched.`);
    } else if (actionModal.type === "acknowledge") {
      updateDispatch(d.id, { status: "Acknowledged", acknowledgedAt: now, referenceNumber: actionInput.trim() || d.referenceNumber });
      showSuccess(`${d.id} acknowledged.`);
    } else if (actionModal.type === "settle") {
      updateDispatch(d.id, { status: "Settled", settledAt: now });
      showSuccess(`${d.id} marked as Settled.`);
    } else if (actionModal.type === "dispute") {
      updateDispatch(d.id, { status: "Disputed", disputedAt: now, notes: actionInput.trim() ? `[DISPUTED]: ${actionInput.trim()}` : d.notes });
      showSuccess(`${d.id} marked as Disputed.`);
    } else if (actionModal.type === "redispatch") {
      updateDispatch(d.id, { status: "Dispatched", dispatchedAt: now, disputedAt: null });
      showSuccess(`${d.id} re-dispatched.`);
    } else if (actionModal.type === "delete") {
      deleteDispatch(d.id);
      showSuccess(`${d.id} deleted.`);
    }
    setActionModal(null);
    setActionInput("");
  };

  const startCreate = () => {
    setStep(1);
    setSelectedProvider(null);
    setSelectedInvoiceIds([]);
    setCreateForm({ method: "Email", reference: "", notes: "" });
    setCreating(true);
  };

  const goStep2 = () => {
    if (!selectedProvider) return;
    setSelectedInvoiceIds(selectedProvider.invoices.map((i) => i.id));
    setStep(2);
  };

  const toggleInv = (id) =>
    setSelectedInvoiceIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAllInv = () => {
    const allIds = selectedProviderInvoices.map((i) => i.id);
    setSelectedInvoiceIds(selectedInvoiceIds.length === allIds.length ? [] : allIds);
  };

  const handleCreate = async () => {
    if (!selectedProvider || selectedInvoiceIds.length === 0) return;
    const chosen = selectedProviderInvoices.filter((inv) => selectedInvoiceIds.includes(inv.id));
    const snapshots = chosen.map((inv) => ({
      id: inv.id,
      patientName: inv.patient?.name || "—",
      uhid: inv.patient?.uhid || "—",
      finalizedAt: inv.finalizedAt || inv.createdAt,
      grandTotal: inv.grandTotal,
      itemCount: inv.items?.length || 0,
      paymentMethod: inv.paymentMethod,
      schemeName: getInvoiceSchemeName(inv),
      memberNo: getInvoiceMemberNo(inv),
      notes: inv.notes || "",
    }));
    const dispatchId = await generateDispatchId();
    const providerReference = createForm.reference.trim() || await generateClaimReferenceNo();

    const dispatch = {
      id: dispatchId,
      providerAccount: selectedProvider.account,
      providerName: selectedProvider.providerName,
      providerType: selectedProvider.providerType,
      contactPerson: selectedProvider.contactPerson,
      email: selectedProvider.email,
      address: selectedProvider.address,
      phone: selectedProvider.phone,
      invoiceIds: chosen.map((i) => i.id),
      invoiceSnapshots: snapshots,
      totalAmount: selectedTotal,
      invoiceCount: chosen.length,
      dispatchMethod: createForm.method,
      referenceNumber: providerReference,
      status: "Draft",
      createdAt: new Date().toISOString(),
      dispatchedAt: null,
      acknowledgedAt: null,
      settledAt: null,
      disputedAt: null,
      notes: createForm.notes.trim(),
      dispatchedBy: "Dr. Smith",
    };
    addDispatch(dispatch);
    setCreating(false);
    showSuccess(`Dispatch ${dispatch.id} created as Draft. Open the dispatch note or send immediately.`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Invoice Dispatches</h1>
          <p className="text-sm font-medium text-slate-500">
            Batch and dispatch credit invoices to insurers, corporates, and government accounts.
          </p>
        </div>
        <button onClick={creating ? () => setCreating(false) : startCreate}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm ${
            creating
              ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              : "bg-cyan-600 text-white shadow-cyan-200 hover:bg-cyan-700"
          }`}>
          {creating ? <X size={15} /> : <Plus size={15} />}
          {creating ? "Back to Dispatches" : "New Dispatch"}
        </button>
      </div>

      {/* Success */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-emerald-800">{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${creating ? "hidden" : ""}`}>
        {[
          { label: "Total Dispatches",     value: dispatches.length,         icon: ReceiptText,  color: "bg-slate-100 text-slate-600" },
          { label: "Awaiting Payment",     value: stats.pending,             icon: Send,         color: "bg-blue-100 text-blue-600" },
          { label: "Outstanding Value",    value: formatKES(stats.outstanding), icon: FileText,   color: "bg-amber-100 text-amber-600" },
          { label: "Total Settled",        value: formatKES(stats.settled),  icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${color}`}><Icon size={17} /></div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
                <p className="text-base font-black text-slate-900 leading-tight mt-0.5">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Status Legend */}
      <div className={`flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm ${creating ? "hidden" : ""}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Workflow:</span>
        {["Draft", "Dispatched", "Acknowledged", "Settled"].map((s, i, arr) => (
          <span key={s} className="flex items-center gap-1.5">
            <StatusBadge status={s} />
            {i < arr.length - 1 && <ArrowRight size={10} className="text-slate-300" />}
          </span>
        ))}
        <span className="ml-2 flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="text-slate-300">|</span>
          <StatusBadge status="Disputed" />
          <span className="text-slate-400">(side-branch)</span>
        </span>
      </div>

      {/* Tabs + Search */}
      <div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${creating ? "hidden" : ""}`}>
        <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {TABS.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${activeTab === t ? "bg-cyan-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
              {t}
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${activeTab === t ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, provider, reference..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-cyan-400 transition-colors" />
        </div>
      </div>

      {/* Dispatch Table */}
      <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden ${creating ? "hidden" : ""}`}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ReceiptText size={40} className="mb-3 opacity-20" />
            <p className="font-semibold text-slate-500">No dispatches found</p>
            <p className="text-sm">Create a new dispatch to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Dispatch ID", "Provider", "Scheme", "Member No.", "Method", "Invoices", "Total", "Progress", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-semibold text-slate-700">{d.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-900 leading-tight max-w-[160px] truncate">{d.providerName}</p>
                        <div className="mt-0.5"><TypeBadge type={d.providerType} /></div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="max-w-[150px] truncate text-xs font-semibold text-slate-700">{getDispatchSchemeSummary(d)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="max-w-[110px] truncate font-mono text-xs font-semibold text-slate-600">{getDispatchMemberSummary(d)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${METHOD_COLOR[d.dispatchMethod] || "bg-slate-100 text-slate-600"}`}>
                        {d.dispatchMethod}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {d.invoiceCount} inv.
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-slate-900 whitespace-nowrap">{formatKES(d.totalAmount)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <WorkflowStepper status={d.status} />
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">{formatDate(d.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button onClick={() => setViewNote(d)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors whitespace-nowrap">
                          <Eye size={11} /> Note
                        </button>
                        {d.status === "Draft" && (
                          <>
                            <button onClick={() => handleAction("send", d)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap">
                              <Send size={11} /> Send
                            </button>
                            <button onClick={() => handleAction("delete", d)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 size={11} />
                            </button>
                          </>
                        )}
                        {d.status === "Dispatched" && (
                          <>
                            <button onClick={() => handleAction("acknowledge", d)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-violet-600 hover:bg-violet-50 transition-colors whitespace-nowrap">
                              <CheckCheck size={11} /> Ack.
                            </button>
                            <button onClick={() => handleAction("dispute", d)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap">
                              <AlertTriangle size={11} /> Dispute
                            </button>
                          </>
                        )}
                        {d.status === "Acknowledged" && (
                          <>
                            <button onClick={() => handleAction("settle", d)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors whitespace-nowrap">
                              <DollarSign size={11} /> Settle
                            </button>
                            <button onClick={() => handleAction("dispute", d)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap">
                              <AlertTriangle size={11} /> Dispute
                            </button>
                          </>
                        )}
                        {d.status === "Disputed" && (
                          <button onClick={() => handleAction("redispatch", d)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap">
                            <Send size={11} /> Re-send
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

      {/* ─── CREATE DISPATCH WIZARD ─────────────────────────────────────────── */}
      <AnimatePresence>
        {creating && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">New Dispatch</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                  {step === 1 ? "Select Provider" : "Invoice Selection & Details"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {step === 2 && selectedProvider
                    ? `Provider: ${selectedProvider.providerName} · ${selectedProvider.account}`
                    : "Choose a provider with eligible final credit invoices."}
                </p>
              </div>
              <button onClick={() => setCreating(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                <X size={14} /> Cancel
              </button>
            </div>
            <div className="p-5">
            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${step >= s ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-400"}`}>{s}</div>
                  <span className={`text-xs font-semibold ${step >= s ? "text-slate-700" : "text-slate-400"}`}>
                    {s === 1 ? "Select Provider" : "Invoices & Details"}
                  </span>
                  {s < 2 && <ChevronRight size={13} className="text-slate-300" />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                {providerOptions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-slate-400">
                    <CheckCircle2 size={32} className="mb-2 opacity-20" />
                    <p className="font-semibold">No eligible invoices available</p>
                    <p className="text-sm text-center max-w-xs mt-1">All Final credit invoices are either already dispatched or there are none to dispatch.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="w-10 px-4 py-3" />
                          <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Provider</th>
                          <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</th>
                          <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact</th>
                          <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoices</th>
                          <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {providerOptions.map((prov) => {
                          const selected = selectedProvider?.account === prov.account;
                          return (
                            <tr key={prov.account} onClick={() => setSelectedProvider(prov)}
                              className={`cursor-pointer transition-colors ${selected ? "bg-cyan-50" : "hover:bg-slate-50"}`}>
                              <td className="px-4 py-4">
                                <div className={`flex size-5 items-center justify-center rounded-full border-2 ${selected ? "border-cyan-600 bg-cyan-600 text-white" : "border-slate-300 bg-white"}`}>
                                  {selected && <CheckCircle2 size={13} strokeWidth={3} />}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <p className="text-sm font-bold text-slate-900">{prov.providerName}</p>
                                <p className="mt-0.5 font-mono text-[10px] text-slate-400">{prov.account}</p>
                              </td>
                              <td className="px-4 py-4"><TypeBadge type={prov.providerType} /></td>
                              <td className="px-4 py-4">
                                <p className="max-w-[220px] truncate text-xs font-semibold text-slate-700">{prov.contactPerson}</p>
                                <p className="max-w-[220px] truncate text-[10px] text-slate-400">{prov.email}</p>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                                  {prov.invoices.length} ready
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right text-sm font-black text-slate-900">{formatKES(prov.total)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setCreating(false)}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                  <button onClick={goStep2} disabled={!selectedProvider}
                    className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-cyan-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                {/* Invoice Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Invoices to Include ({selectedInvoiceIds.length} of {selectedProviderInvoices.length})
                    </p>
                    <button onClick={toggleAllInv} className="flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">
                      {selectedInvoiceIds.length === selectedProviderInvoices.length ? <><SquareCheckBig size={12} /> Deselect All</> : <><Square size={12} /> Select All</>}
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="w-10 px-3 py-2.5" />
                          <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">Date</th>
                          <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">Invoice No.</th>
                          <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">Patient</th>
                          <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">Scheme Name</th>
                          <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">Member No</th>
                          <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-slate-400">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedProviderInvoices.map((inv) => {
                          const checked = selectedInvoiceIds.includes(inv.id);
                          return (
                            <tr key={inv.id} onClick={() => toggleInv(inv.id)}
                              className={`cursor-pointer transition-colors ${checked ? "bg-cyan-50/50" : "hover:bg-slate-50"}`}>
                              <td className="px-3 py-3 text-center">
                                <div className={`mx-auto size-4 rounded flex items-center justify-center border-2 transition-colors ${checked ? "border-cyan-600 bg-cyan-600" : "border-slate-300"}`}>
                                  {checked && <CheckCircle2 size={10} className="text-white" strokeWidth={3} />}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(inv.finalizedAt)}</td>
                              <td className="px-3 py-3 font-mono text-xs font-semibold text-slate-700">{inv.id}</td>
                              <td className="px-3 py-3">
                                <p className="text-xs font-semibold text-slate-900 leading-tight">{inv.patient?.name}</p>
                                <p className="text-[10px] text-slate-400">{inv.patient?.uhid}</p>
                              </td>
                              <td className="px-3 py-3">
                                <p className="max-w-[180px] truncate text-xs font-semibold text-slate-700">{getInvoiceSchemeName(inv)}</p>
                              </td>
                              <td className="px-3 py-3">
                                <p className="font-mono text-xs font-semibold text-slate-600">{getInvoiceMemberNo(inv)}</p>
                              </td>
                              <td className="px-3 py-3 text-right">
                                <span className={`text-sm font-bold ${checked ? "text-cyan-700" : "text-slate-700"}`}>{formatKES(inv.grandTotal)}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Dispatch Details */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Dispatch Details</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Dispatch Method</label>
                      <div className="relative">
                        <select value={createForm.method} onChange={(e) => setCreateForm((p) => ({ ...p, method: e.target.value }))}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors">
                          {DISPATCH_METHODS.map((m) => <option key={m}>{m}</option>)}
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Reference No. (optional)</label>
                      <input value={createForm.reference} onChange={(e) => setCreateForm((p) => ({ ...p, reference: e.target.value }))}
                        placeholder="e.g. Pre-auth or batch ref"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 focus:bg-white transition-colors" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes (optional)</label>
                      <input value={createForm.notes} onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="e.g. May 2026 claims batch — specialist referrals"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 focus:bg-white transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 space-y-1.5">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Provider</span>
                    <span className="font-semibold">{selectedProvider?.providerName}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Invoices Selected</span>
                    <span className="font-semibold">{selectedInvoiceIds.length}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Method</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${METHOD_COLOR[createForm.method] || "bg-slate-100 text-slate-600"}`}>{createForm.method}</span>
                  </div>
                  <div className="border-t border-cyan-200 pt-2 flex justify-between">
                    <span className="font-black text-slate-900">Total Being Dispatched</span>
                    <span className="text-xl font-black text-cyan-700">{formatKES(selectedTotal)}</span>
                  </div>
                </div>

                <div className="flex justify-between gap-3">
                  <button onClick={() => setStep(1)}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">← Back</button>
                  <div className="flex gap-2">
                    <button onClick={() => setCreating(false)}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={handleCreate} disabled={selectedInvoiceIds.length === 0}
                      className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-cyan-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      <ReceiptText size={14} /> Create Dispatch
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── ACTION CONFIRM MODALS ────────────────────────────────────────────── */}
      <AnimatePresence>
        {actionModal && (
          <Modal
            title={{
              send:       "Mark as Dispatched?",
              acknowledge:"Mark as Acknowledged?",
              settle:     "Mark as Settled?",
              dispute:    "Mark as Disputed?",
              redispatch: "Re-dispatch?",
              delete:     "Delete Draft?",
            }[actionModal.type]}
            subtitle={actionModal.dispatch.id}
            onClose={() => { setActionModal(null); setActionInput(""); }}
          >
            <div className="space-y-4">
              {actionModal.type === "send" && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-800">
                    This will mark <strong>{actionModal.dispatch.id}</strong> as officially dispatched to{" "}
                    <strong>{actionModal.dispatch.providerName}</strong> via{" "}
                    <strong>{actionModal.dispatch.dispatchMethod}</strong>. The dispatch timestamp will be recorded.
                  </p>
                </div>
              )}
              {actionModal.type === "acknowledge" && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                    <p className="text-sm font-semibold text-violet-800">
                      Confirm that <strong>{actionModal.dispatch.providerName}</strong> has acknowledged receipt of this dispatch.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Provider Reference No. (optional)</label>
                    <input value={actionInput} onChange={(e) => setActionInput(e.target.value)}
                      placeholder="Enter provider's acknowledgement or claim reference"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 transition-colors" />
                  </div>
                </div>
              )}
              {actionModal.type === "settle" && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-800">
                    You are marking this dispatch as fully settled. The total amount of{" "}
                    <strong>{formatKES(actionModal.dispatch.totalAmount)}</strong> is considered received from{" "}
                    <strong>{actionModal.dispatch.providerName}</strong>.
                  </p>
                </div>
              )}
              {actionModal.type === "dispute" && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4 flex items-start gap-3">
                    <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-red-800">
                      Mark <strong>{actionModal.dispatch.id}</strong> as disputed. This will flag it for review and stop the normal settlement workflow.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Dispute Reason</label>
                    <input value={actionInput} onChange={(e) => setActionInput(e.target.value)}
                      placeholder="e.g. Provider rejected claim, missing pre-auth"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 transition-colors" />
                  </div>
                </div>
              )}
              {actionModal.type === "redispatch" && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-800">
                    Re-dispatch <strong>{actionModal.dispatch.id}</strong>. The status will be reset to Dispatched and a new dispatch timestamp will be recorded.
                  </p>
                </div>
              )}
              {actionModal.type === "delete" && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                  <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-red-800">
                    Permanently delete draft <strong>{actionModal.dispatch.id}</strong>. The invoices will become available for new dispatches.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setActionModal(null); setActionInput(""); }}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={executeAction}
                  className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-colors ${
                    actionModal.type === "delete" || actionModal.type === "dispute" ? "bg-red-600 hover:bg-red-700"
                    : actionModal.type === "settle" ? "bg-emerald-600 hover:bg-emerald-700"
                    : actionModal.type === "acknowledge" ? "bg-violet-600 hover:bg-violet-700"
                    : "bg-cyan-600 hover:bg-cyan-700"
                  }`}>
                  {actionModal.type === "send" && <><Send size={14} /> Confirm Dispatch</>}
                  {actionModal.type === "acknowledge" && <><CheckCheck size={14} /> Confirm Acknowledged</>}
                  {actionModal.type === "settle" && <><DollarSign size={14} /> Mark Settled</>}
                  {actionModal.type === "dispute" && <><AlertTriangle size={14} /> Mark Disputed</>}
                  {actionModal.type === "redispatch" && <><Send size={14} /> Re-Dispatch</>}
                  {actionModal.type === "delete" && <><Trash2 size={14} /> Delete</>}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ─── DISPATCH NOTE VIEWER ─────────────────────────────────────────── */}
      <AnimatePresence>
        {viewNote && <DispatchNote dispatch={viewNote} onClose={() => setViewNote(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dispatches;
