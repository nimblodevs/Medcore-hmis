import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  History,
  Landmark,
  Printer,
  ReceiptText,
  RotateCcw,
  Save,
  Search,
  SquareCheckBig,
  Upload,
  X,
} from "lucide-react";
import { mockProviders, mockSchemes } from "../../constants/mockDebtors";
import { useDispatchStore } from "../../store/dispatchStore";

const BANK_ACCOUNTS = [
  "KCB Main Revenue Account - 1102456789",
  "Equity Claims Collection - 0140298765432",
  "Co-operative Hospital Collection - 01129876543200",
];

const PAYMENT_METHODS = ["Cheque", "Online Transfer"];
const CURRENCIES = ["KES", "USD", "EUR"];

const STATUS_STYLE = {
  Unpaid: "bg-slate-100 text-slate-600 border-slate-200",
  "Partially Paid": "bg-amber-100 text-amber-700 border-amber-200",
  "Fully Paid": "bg-emerald-100 text-emerald-700 border-emerald-200",
  Unallocated: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Reversed: "bg-red-100 text-red-600 border-red-200",
};

const formatKES = (value, currency = "KES") =>
  `${currency} ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const todayInput = () => new Date().toISOString().slice(0, 10);

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(`${value}`.includes("T") ? value : `${value}T00:00:00`).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const generateReceiptNo = () => {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `RCP-INS-${date}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
};

const getInvoiceSchemeName = (invoice, providerAccount) => {
  if (invoice.schemeName) return invoice.schemeName;
  const provider = mockProviders.find((item) => item.accountNumber === providerAccount);
  const scheme = mockSchemes.find((item) => item.id === provider?.schemes?.[0]);
  return scheme?.schemeName || "-";
};

const getInvoiceMemberNo = (invoice) => invoice.memberNo || invoice.insuranceMemberNumber || invoice.corporateAccountNumber || "-";

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLE[status] || STATUS_STYLE.Unpaid}`}>
    {status}
  </span>
);

const Field = ({ label, required, children, error }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold text-slate-700">
      {label}
      {required ? <span className="ml-0.5 text-red-500">*</span> : null}
    </label>
    {children}
    {error ? <p className="mt-1 text-xs font-semibold text-red-600">{error}</p> : null}
  </div>
);

const inputClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10 disabled:bg-slate-100 disabled:text-slate-500";

const selectClass =
  "h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-900 outline-none transition-colors focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10 disabled:bg-slate-100 disabled:text-slate-500";

const Card = ({ children, className = "" }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>
);

const InsuranceClaimPayments = () => {
  const { dispatches } = useDispatchStore();
  const [header, setHeader] = useState({
    providerAccount: "",
    paymentReference: "",
    paymentDate: todayInput(),
    bankAccount: BANK_ACCOUNTS[0],
    amountReceived: "",
    method: "Cheque",
    currency: "KES",
    remarks: "",
  });
  const [methodDetails, setMethodDetails] = useState({
    chequeNumber: "",
    chequeDate: todayInput(),
    issuingBank: "",
    bankBranch: "",
    drawerName: "",
    chequeAmount: "",
    chequeFileName: "",
    transactionReference: "",
    transferDate: todayInput(),
    senderBank: "",
    receivingBankAccount: BANK_ACCOUNTS[0],
    transferAmount: "",
    transferFileName: "",
  });
  const [allocations, setAllocations] = useState({});
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [receiptHistory, setReceiptHistory] = useState([]);
  const [confirmedPayment, setConfirmedPayment] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [claimSearch, setClaimSearch] = useState("");

  const insuranceProviders = useMemo(
    () => mockProviders.filter((provider) => provider.providerType === "Insurance"),
    []
  );

  const insuranceClaims = useMemo(() => {
    return dispatches
      .filter(
        (dispatch) =>
          dispatch.providerType === "Insurance" &&
          ["Dispatched", "Acknowledged", "Settled"].includes(dispatch.status)
      )
      .flatMap((dispatch) =>
        dispatch.invoiceSnapshots.map((invoice, index) => {
          const approvedAmount = invoice.approvedAmount ?? invoice.grandTotal;
          return {
            id: `${dispatch.id}-${invoice.id}`,
            dispatchId: dispatch.id,
            providerAccount: dispatch.providerAccount,
            providerName: dispatch.providerName,
            claimNumber: dispatch.referenceNumber || dispatch.id,
            paymentReference: dispatch.referenceNumber || dispatch.id,
            patientName: invoice.patientName,
            uhid: invoice.uhid,
            visitNumber: `VIS-${String(index + 1).padStart(3, "0")}-${invoice.uhid?.replace(/\D/g, "").slice(-4) || "0000"}`,
            invoiceNumber: invoice.id,
            schemeName: getInvoiceSchemeName(invoice, dispatch.providerAccount),
            memberNo: getInvoiceMemberNo(invoice),
            claimDate: invoice.finalizedAt || dispatch.createdAt,
            claimAmount: invoice.grandTotal,
            approvedAmount,
          };
        })
      );
  }, [dispatches]);

  const matchedDispatch = useMemo(() => {
    const reference = header.paymentReference.trim().toLowerCase();
    if (!reference) return null;
    return dispatches.find((dispatch) =>
      dispatch.providerType === "Insurance" &&
      [dispatch.referenceNumber, dispatch.id]
        .filter(Boolean)
        .some((value) => value.toLowerCase() === reference)
    ) || null;
  }, [dispatches, header.paymentReference]);

  const paidByClaim = useMemo(() => {
    return paymentRecords
      .filter((record) => record.status === "Confirmed")
      .reduce((map, record) => {
        record.allocations.forEach((allocation) => {
          map[allocation.claimId] = (map[allocation.claimId] || 0) + allocation.amount;
        });
        return map;
      }, {});
  }, [paymentRecords]);

  const selectedClaims = useMemo(() => {
    const q = claimSearch.trim().toLowerCase();
    return insuranceClaims
      .filter((claim) => !matchedDispatch || claim.dispatchId === matchedDispatch.id)
      .filter((claim) => !header.providerAccount || claim.providerAccount === header.providerAccount)
      .map((claim) => {
        const alreadyPaid = paidByClaim[claim.id] || 0;
        const outstanding = Math.max(0, claim.approvedAmount - alreadyPaid);
        const allocated = Number(allocations[claim.id] || 0);
        const balanceAfter = Math.max(0, outstanding - allocated);
        const status =
          outstanding <= 0
            ? "Fully Paid"
            : allocated > 0 && balanceAfter === 0
              ? "Fully Paid"
              : alreadyPaid + allocated > 0
                ? "Partially Paid"
                : "Unpaid";
        return { ...claim, alreadyPaid, outstanding, allocated, balanceAfter, status };
      })
      .filter((claim) => claim.outstanding > 0 || claim.allocated > 0)
      .filter(
        (claim) =>
          !q ||
          claim.claimNumber.toLowerCase().includes(q) ||
          claim.patientName.toLowerCase().includes(q) ||
          claim.invoiceNumber.toLowerCase().includes(q) ||
          claim.schemeName.toLowerCase().includes(q) ||
          claim.memberNo.toLowerCase().includes(q) ||
          claim.uhid.toLowerCase().includes(q)
      );
  }, [allocations, claimSearch, header.providerAccount, insuranceClaims, matchedDispatch, paidByClaim]);

  const totals = useMemo(() => {
    const amountReceived = Number(header.amountReceived || 0);
    const allocated = selectedClaims.reduce((sum, claim) => sum + Number(claim.allocated || 0), 0);
    const paid = selectedClaims.filter((claim) => claim.allocated > 0 && claim.balanceAfter === 0).length;
    const partial = selectedClaims.filter((claim) => claim.allocated > 0 && claim.balanceAfter > 0).length;
    return {
      amountReceived,
      allocated,
      unallocated: amountReceived - allocated,
      paid,
      partial,
      overAllocated: allocated > amountReceived,
    };
  }, [header.amountReceived, selectedClaims]);

  const updateHeader = (field, value) => {
    setHeader((current) => {
      const next = { ...current, [field]: value };
      if (field === "paymentReference") {
        const reference = value.trim().toLowerCase();
        const dispatch = dispatches.find((item) =>
          item.providerType === "Insurance" &&
          [item.referenceNumber, item.id]
            .filter(Boolean)
            .some((candidate) => candidate.toLowerCase() === reference)
        );
        if (dispatch) next.providerAccount = dispatch.providerAccount;
      }
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
    if (field === "providerAccount" || field === "paymentReference") {
      setAllocations({});
      setConfirmedPayment(null);
      setReceipt(null);
    }
  };

  const updateMethod = (field, value) => {
    setMethodDetails((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const updateAllocation = (claimId, rawValue) => {
    const claim = selectedClaims.find((item) => item.id === claimId);
    const next = Math.max(0, Number(rawValue || 0));
    const capped = Math.min(next, claim?.outstanding || 0);
    setAllocations((current) => ({ ...current, [claimId]: capped ? String(capped) : "" }));
  };

  const autoAllocate = () => {
    let remaining = Number(header.amountReceived || 0);
    const next = {};
    selectedClaims
      .slice()
      .sort((a, b) => new Date(a.claimDate) - new Date(b.claimDate))
      .forEach((claim) => {
        const amount = Math.min(claim.outstanding, remaining);
        if (amount > 0) {
          next[claim.id] = String(amount);
          remaining -= amount;
        }
      });
    setAllocations(next);
  };

  const clearAllocations = () => setAllocations({});

  const validate = (mode) => {
    const nextErrors = {};
    if (!header.providerAccount) nextErrors.providerAccount = "Insurance company is required.";
    if (!header.paymentReference.trim()) nextErrors.paymentReference = "Payment reference number is required.";
    if (!header.paymentDate) nextErrors.paymentDate = "Payment date is required.";
    if (!header.bankAccount) nextErrors.bankAccount = "Bank account is required.";
    if (!header.amountReceived || Number(header.amountReceived) <= 0) nextErrors.amountReceived = "Enter the received amount.";
    if (!header.method) nextErrors.method = "Payment method is required.";
    if (totals.overAllocated) nextErrors.allocation = "Total allocated cannot exceed amount received.";

    selectedClaims.forEach((claim) => {
      if (claim.allocated > claim.outstanding) {
        nextErrors.allocation = "Amount allocated cannot exceed claim outstanding balance.";
      }
    });

    if (mode !== "draft" && totals.allocated <= 0) {
      nextErrors.allocation = "Allocate payment to at least one claim before confirmation.";
    }

    if (header.method === "Cheque") {
      if (!methodDetails.chequeNumber.trim()) nextErrors.chequeNumber = "Cheque number is required.";
      if (!methodDetails.chequeDate) nextErrors.chequeDate = "Cheque date is required.";
      if (!methodDetails.issuingBank.trim()) nextErrors.issuingBank = "Issuing bank is required.";
      if (!methodDetails.bankBranch.trim()) nextErrors.bankBranch = "Bank branch is required.";
      if (!methodDetails.drawerName.trim()) nextErrors.drawerName = "Drawer name is required.";
      if (!methodDetails.chequeAmount || Number(methodDetails.chequeAmount) <= 0) nextErrors.chequeAmount = "Cheque amount is required.";
    } else {
      if (!methodDetails.transactionReference.trim()) nextErrors.transactionReference = "Transaction reference is required.";
      if (!methodDetails.transferDate) nextErrors.transferDate = "Transfer date is required.";
      if (!methodDetails.senderBank.trim()) nextErrors.senderBank = "Sender bank is required.";
      if (!methodDetails.receivingBankAccount) nextErrors.receivingBankAccount = "Receiving bank account is required.";
      if (!methodDetails.transferAmount || Number(methodDetails.transferAmount) <= 0) nextErrors.transferAmount = "Transfer amount is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPaymentRecord = (status) => {
    const provider = insuranceProviders.find((item) => item.accountNumber === header.providerAccount);
    const confirmedAllocations = selectedClaims
      .filter((claim) => claim.allocated > 0)
      .map((claim) => ({
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        patientName: claim.patientName,
        invoiceNumber: claim.invoiceNumber,
        schemeName: claim.schemeName,
        memberNo: claim.memberNo,
        amount: Number(claim.allocated),
      }));

    return {
      id: `PAY-INS-${Date.now()}`,
      status,
      providerAccount: header.providerAccount,
      providerName: provider?.providerName || "",
      paymentReference: header.paymentReference.trim(),
      paymentDate: header.paymentDate,
      bankAccount: header.bankAccount,
      amountReceived: Number(header.amountReceived || 0),
      method: header.method,
      currency: header.currency,
      remarks: header.remarks.trim(),
      methodDetails: { ...methodDetails },
      allocations: confirmedAllocations,
      recordedAt: new Date().toISOString(),
    };
  };

  const saveDraft = () => {
    if (!validate("draft")) return;
    const record = buildPaymentRecord("Draft");
    setPaymentRecords((current) => [record, ...current]);
    setSuccessMsg("Draft allocation saved.");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const confirmAllocation = () => {
    if (!validate("confirm")) return;
    const record = buildPaymentRecord("Confirmed");
    setPaymentRecords((current) => [record, ...current]);
    setConfirmedPayment(record);
    setSuccessMsg("Allocation confirmed. Claims are locked until reversed.");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const generateReceipt = () => {
    const sourcePayment = confirmedPayment || buildPaymentRecord("Confirmed");
    if (!confirmedPayment && !validate("confirm")) return;
    const receiptRecord = {
      receiptNo: generateReceiptNo(),
      receiptDate: todayInput(),
      payment: sourcePayment,
      allocatedAmount: sourcePayment.allocations.reduce((sum, item) => sum + item.amount, 0),
    };
    setReceipt(receiptRecord);
    setShowReceipt(true);
    setReceiptHistory((current) => [receiptRecord, ...current]);
    if (!confirmedPayment) {
      setConfirmedPayment(sourcePayment);
      setPaymentRecords((current) => [sourcePayment, ...current]);
    }
  };

  const reverseAllocation = () => {
    if (!confirmedPayment) return;
    setPaymentRecords((current) =>
      current.map((record) =>
        record.id === confirmedPayment.id ? { ...record, status: "Reversed" } : record
      )
    );
    setConfirmedPayment((current) => current ? { ...current, status: "Reversed" } : null);
    setAllocations({});
    setReceipt(null);
    setSuccessMsg("Allocation reversed. The claims can be reallocated.");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const cancelForm = () => {
    setHeader({
      providerAccount: "",
      paymentReference: "",
      paymentDate: todayInput(),
      bankAccount: BANK_ACCOUNTS[0],
      amountReceived: "",
      method: "Cheque",
      currency: "KES",
      remarks: "",
    });
    setMethodDetails({
      chequeNumber: "",
      chequeDate: todayInput(),
      issuingBank: "",
      bankBranch: "",
      drawerName: "",
      chequeAmount: "",
      chequeFileName: "",
      transactionReference: "",
      transferDate: todayInput(),
      senderBank: "",
      receivingBankAccount: BANK_ACCOUNTS[0],
      transferAmount: "",
      transferFileName: "",
    });
    setAllocations({});
    setConfirmedPayment(null);
    setReceipt(null);
    setErrors({});
  };

  const isLocked = confirmedPayment?.status === "Confirmed";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Insurance Claim Payment Allocation</h1>
          <p className="text-sm font-medium text-slate-500">
            Record insurer payments, allocate approved claims, and generate official receipts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowHistory(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
            <History size={14} /> Receipt History
          </button>
          <button onClick={saveDraft} disabled={isLocked} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
            <Save size={14} /> Save Draft
          </button>
          <button onClick={confirmAllocation} disabled={isLocked} className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-800 disabled:opacity-40">
            <SquareCheckBig size={14} /> Confirm Allocation
          </button>
        </div>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total Payment Received", value: formatKES(totals.amountReceived, header.currency), icon: Banknote, color: "bg-cyan-100 text-cyan-700" },
          { label: "Total Allocated", value: formatKES(totals.allocated, header.currency), icon: SquareCheckBig, color: "bg-emerald-100 text-emerald-700" },
          { label: "Unallocated Balance", value: formatKES(totals.unallocated, header.currency), icon: Landmark, color: totals.unallocated < 0 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600" },
          { label: "Claims Paid", value: totals.paid, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
          { label: "Partially Paid", value: totals.partial, icon: AlertCircle, color: "bg-amber-100 text-amber-700" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-xl ${color}`}><Icon size={17} /></div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">{label}</p>
                <p className="mt-0.5 truncate text-base font-black text-slate-900">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totals.overAllocated && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={16} />
          <p className="text-sm font-semibold text-red-700">Total allocated exceeds the payment received. Reduce allocations before confirming.</p>
        </div>
      )}

      <Card>
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">Payment Header</h2>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Insurance Company" required error={errors.providerAccount}>
            <div className="relative">
              <select disabled={isLocked} value={header.providerAccount} onChange={(e) => updateHeader("providerAccount", e.target.value)} className={selectClass}>
                <option value="">Select insurer</option>
                {insuranceProviders.map((provider) => (
                  <option key={provider.accountNumber} value={provider.accountNumber}>{provider.providerName}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </div>
          </Field>
          <Field label="Payment Reference Number" required error={errors.paymentReference}>
            <input disabled={isLocked} value={header.paymentReference} onChange={(e) => updateHeader("paymentReference", e.target.value)} placeholder="e.g. AAR-CLM-2026-0089" className={inputClass} />
            {matchedDispatch ? (
              <p className="mt-1 text-[11px] font-semibold text-cyan-700">
                Matched {matchedDispatch.id}: {matchedDispatch.invoiceCount} dispatched invoice{matchedDispatch.invoiceCount === 1 ? "" : "s"} loaded.
              </p>
            ) : null}
          </Field>
          <Field label="Payment Date" required error={errors.paymentDate}>
            <input disabled={isLocked} type="date" value={header.paymentDate} onChange={(e) => updateHeader("paymentDate", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Bank Account Received Into" required error={errors.bankAccount}>
            <select disabled={isLocked} value={header.bankAccount} onChange={(e) => updateHeader("bankAccount", e.target.value)} className={selectClass}>
              {BANK_ACCOUNTS.map((account) => <option key={account}>{account}</option>)}
            </select>
          </Field>
          <Field label="Total Amount Received" required error={errors.amountReceived}>
            <input disabled={isLocked} type="number" min="0" value={header.amountReceived} onChange={(e) => updateHeader("amountReceived", e.target.value)} placeholder="0.00" className={inputClass} />
          </Field>
          <Field label="Payment Method" required error={errors.method}>
            <select disabled={isLocked} value={header.method} onChange={(e) => updateHeader("method", e.target.value)} className={selectClass}>
              {PAYMENT_METHODS.map((method) => <option key={method}>{method}</option>)}
            </select>
          </Field>
          <Field label="Currency">
            <select disabled={isLocked} value={header.currency} onChange={(e) => updateHeader("currency", e.target.value)} className={selectClass}>
              {CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}
            </select>
          </Field>
          <Field label="Remarks / Narration">
            <input disabled={isLocked} value={header.remarks} onChange={(e) => updateHeader("remarks", e.target.value)} placeholder="Narration from bank statement" className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">Payment Method Details</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{header.method}</span>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {header.method === "Cheque" ? (
            <>
              <Field label="Cheque Number" required error={errors.chequeNumber}><input disabled={isLocked} value={methodDetails.chequeNumber} onChange={(e) => updateMethod("chequeNumber", e.target.value)} className={inputClass} /></Field>
              <Field label="Cheque Date" required error={errors.chequeDate}><input disabled={isLocked} type="date" value={methodDetails.chequeDate} onChange={(e) => updateMethod("chequeDate", e.target.value)} className={inputClass} /></Field>
              <Field label="Issuing Bank" required error={errors.issuingBank}><input disabled={isLocked} value={methodDetails.issuingBank} onChange={(e) => updateMethod("issuingBank", e.target.value)} className={inputClass} /></Field>
              <Field label="Bank Branch" required error={errors.bankBranch}><input disabled={isLocked} value={methodDetails.bankBranch} onChange={(e) => updateMethod("bankBranch", e.target.value)} className={inputClass} /></Field>
              <Field label="Drawer Name" required error={errors.drawerName}><input disabled={isLocked} value={methodDetails.drawerName} onChange={(e) => updateMethod("drawerName", e.target.value)} className={inputClass} /></Field>
              <Field label="Cheque Amount" required error={errors.chequeAmount}><input disabled={isLocked} type="number" min="0" value={methodDetails.chequeAmount} onChange={(e) => updateMethod("chequeAmount", e.target.value)} className={inputClass} /></Field>
              <Field label="Upload Cheque Image / Slip">
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-500 hover:bg-slate-100">
                  <Upload size={14} />
                  {methodDetails.chequeFileName || "Choose file"}
                  <input disabled={isLocked} type="file" className="hidden" onChange={(e) => updateMethod("chequeFileName", e.target.files?.[0]?.name || "")} />
                </label>
              </Field>
            </>
          ) : (
            <>
              <Field label="Transaction Reference Number" required error={errors.transactionReference}><input disabled={isLocked} value={methodDetails.transactionReference} onChange={(e) => updateMethod("transactionReference", e.target.value)} className={inputClass} /></Field>
              <Field label="Transfer Date" required error={errors.transferDate}><input disabled={isLocked} type="date" value={methodDetails.transferDate} onChange={(e) => updateMethod("transferDate", e.target.value)} className={inputClass} /></Field>
              <Field label="Sender Bank" required error={errors.senderBank}><input disabled={isLocked} value={methodDetails.senderBank} onChange={(e) => updateMethod("senderBank", e.target.value)} className={inputClass} /></Field>
              <Field label="Receiving Bank Account" required error={errors.receivingBankAccount}>
                <select disabled={isLocked} value={methodDetails.receivingBankAccount} onChange={(e) => updateMethod("receivingBankAccount", e.target.value)} className={selectClass}>
                  {BANK_ACCOUNTS.map((account) => <option key={account}>{account}</option>)}
                </select>
              </Field>
              <Field label="Transfer Amount" required error={errors.transferAmount}><input disabled={isLocked} type="number" min="0" value={methodDetails.transferAmount} onChange={(e) => updateMethod("transferAmount", e.target.value)} className={inputClass} /></Field>
              <Field label="Upload Bank Transfer Slip / Proof">
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-500 hover:bg-slate-100">
                  <Upload size={14} />
                  {methodDetails.transferFileName || "Choose file"}
                  <input disabled={isLocked} type="file" className="hidden" onChange={(e) => updateMethod("transferFileName", e.target.files?.[0]?.name || "")} />
                </label>
              </Field>
            </>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">Claim Allocation Table</h2>
            <p className="mt-1 text-xs text-slate-500">Approved unpaid or partially paid claims for the selected insurance company.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={claimSearch} onChange={(e) => setClaimSearch(e.target.value)} placeholder="Search claims..." className="h-9 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-cyan-400" />
            </div>
            <button disabled={isLocked || !header.amountReceived} onClick={autoAllocate} className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-800 disabled:opacity-40">
              <ArrowRight size={13} /> Auto Allocate
            </button>
            <button disabled={isLocked} onClick={clearAllocations} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <RotateCcw size={13} /> Clear
            </button>
          </div>
        </div>

        {errors.allocation ? (
          <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            <AlertCircle size={14} /> {errors.allocation}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[
                  "Claim Number", "Patient Name", "UHID / Patient No.", "Visit Number", "Invoice Number",
                  "Scheme", "Member No.", "Claim Date", "Claim Amount", "Amount Approved", "Amount Already Paid", "Outstanding Balance",
                  "Amount Allocated", "Balance After Allocation", "Status",
                ].map((head) => (
                  <th key={head} className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {selectedClaims.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-4 py-12 text-center text-sm font-semibold text-slate-400">
                    {matchedDispatch
                      ? "No unpaid or partially paid claims found for this payment reference."
                      : "Select an insurance company to load approved unpaid or partially paid claims."}
                  </td>
                </tr>
              ) : (
                selectedClaims.map((claim) => (
                  <tr key={claim.id} className={claim.allocated > 0 ? "bg-cyan-50/40" : "hover:bg-slate-50"}>
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-slate-700">{claim.claimNumber}</td>
                    <td className="px-3 py-3 text-xs font-semibold text-slate-900">{claim.patientName}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-500">{claim.uhid}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-500">{claim.visitNumber}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-700">{claim.invoiceNumber}</td>
                    <td className="px-3 py-3 text-xs font-semibold text-slate-700 whitespace-nowrap">{claim.schemeName}</td>
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-slate-600 whitespace-nowrap">{claim.memberNo}</td>
                    <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(claim.claimDate)}</td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-800 whitespace-nowrap">{formatKES(claim.claimAmount, header.currency)}</td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-800 whitespace-nowrap">{formatKES(claim.approvedAmount, header.currency)}</td>
                    <td className="px-3 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{formatKES(claim.alreadyPaid, header.currency)}</td>
                    <td className="px-3 py-3 text-xs font-bold text-amber-700 whitespace-nowrap">{formatKES(claim.outstanding, header.currency)}</td>
                    <td className="px-3 py-3">
                      <input
                        disabled={isLocked}
                        type="number"
                        min="0"
                        max={claim.outstanding}
                        value={allocations[claim.id] || ""}
                        onChange={(e) => updateAllocation(claim.id, e.target.value)}
                        className="h-9 w-28 rounded-lg border border-slate-200 px-2 text-right text-xs font-bold outline-none focus:border-cyan-400 disabled:bg-slate-100"
                      />
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-900 whitespace-nowrap">{formatKES(claim.balanceAfter, header.currency)}</td>
                    <td className="px-3 py-3"><StatusBadge status={claim.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">Receipt Section</h2>
            <p className="mt-1 text-xs text-slate-500">
              {receipt ? `Receipt ${receipt.receiptNo} generated on ${formatDate(receipt.receiptDate)}.` : "Confirm an allocation, then generate an official receipt."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={generateReceipt} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700">
              <ReceiptText size={14} /> Generate Receipt
            </button>
            <button disabled={!receipt} onClick={() => setShowReceipt(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <FileText size={14} /> View Receipt
            </button>
            <button disabled={!receipt} onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <Printer size={14} /> Print Receipt
            </button>
            <button disabled={!receipt} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <Download size={14} /> Download PDF Receipt
            </button>
            <button disabled={!confirmedPayment} onClick={reverseAllocation} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-40">
              <RotateCcw size={14} /> Reverse Allocation
            </button>
            <button onClick={cancelForm} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {showReceipt && receipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }}
              className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Official Receipt</p>
                  <h3 className="text-lg font-black text-slate-900">{receipt.receiptNo}</h3>
                </div>
                <button onClick={() => setShowReceipt(false)} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={16} /></button>
              </div>
              <div className="space-y-4 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Received From</p>
                    <p className="mt-1 font-bold text-slate-900">{receipt.payment.providerName}</p>
                    <p className="text-xs text-slate-500">{receipt.payment.paymentReference}</p>
                  </div>
                  <div className="rounded-2xl bg-cyan-50 p-4 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">Amount Allocated</p>
                    <p className="mt-1 text-xl font-black text-cyan-800">{formatKES(receipt.allocatedAmount, receipt.payment.currency)}</p>
                    <p className="text-xs text-slate-500">{formatDate(receipt.receiptDate)}</p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Claim</th>
                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient</th>
                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoice</th>
                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Scheme</th>
                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Member No</th>
                        <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {receipt.payment.allocations.map((allocation) => (
                        <tr key={`${allocation.claimId}-${allocation.invoiceNumber}`}>
                          <td className="px-3 py-2 font-mono text-xs text-slate-700">{allocation.claimNumber}</td>
                          <td className="px-3 py-2 text-xs font-semibold text-slate-900">{allocation.patientName}</td>
                          <td className="px-3 py-2 font-mono text-xs text-slate-500">{allocation.invoiceNumber}</td>
                          <td className="px-3 py-2 text-xs font-semibold text-slate-700">{allocation.schemeName}</td>
                          <td className="px-3 py-2 font-mono text-xs text-slate-500">{allocation.memberNo}</td>
                          <td className="px-3 py-2 text-right text-xs font-bold text-slate-900">{formatKES(allocation.amount, receipt.payment.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-800">
                    <Printer size={14} /> Print Receipt
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }}
              className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Receipt History</p>
                  <h3 className="text-lg font-black text-slate-900">Insurance Claim Receipts</h3>
                </div>
                <button onClick={() => setShowHistory(false)} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={16} /></button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-5">
                {receiptHistory.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm font-semibold text-slate-400">
                    No receipts generated yet.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          {["Receipt No", "Date", "Insurance Company", "Reference", "Amount", "Actions"].map((head) => (
                            <th key={head} className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{head}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {receiptHistory.map((item) => (
                          <tr key={item.receiptNo}>
                            <td className="px-3 py-3 font-mono text-xs font-bold text-cyan-700">{item.receiptNo}</td>
                            <td className="px-3 py-3 text-xs text-slate-500">{formatDate(item.receiptDate)}</td>
                            <td className="px-3 py-3 text-xs font-semibold text-slate-900">{item.payment.providerName}</td>
                            <td className="px-3 py-3 font-mono text-xs text-slate-500">{item.payment.paymentReference}</td>
                            <td className="px-3 py-3 text-xs font-bold text-slate-900">{formatKES(item.allocatedAmount, item.payment.currency)}</td>
                            <td className="px-3 py-3">
                              <button onClick={() => { setReceipt(item); setShowReceipt(true); }} className="rounded-lg px-2 py-1 text-[10px] font-bold text-cyan-700 hover:bg-cyan-50">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InsuranceClaimPayments;
