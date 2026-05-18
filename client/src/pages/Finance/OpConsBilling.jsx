import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Trash2, X, ChevronDown, CheckCircle2,
  User, FileText, Printer, AlertCircle, ArrowRight,
  Hash, ClipboardList,
} from "lucide-react";
import { mockPatients } from "../../constants/mockPatients";
import { SERVICE_CATALOG, SERVICE_POINTS, getItemsByServicePoint } from "../../constants/mockServiceItems";
import { mockProviders } from "../../constants/mockDebtors";
import { useInvoiceStore, generateInvoiceId } from "../../store/invoiceStore";

const formatKES = (v) => `KES ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const calcAge = (dob) => {
  if (!dob) return "—";
  const [y, m, d] = dob.split("-");
  const birth = new Date(+y, +m - 1, +d);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return age;
};

const PAYMENT_METHODS = ["Cash", "NHIF", "Insurance", "Corporate", "Government"];

const EMPTY_ITEM_FORM = { servicePoint: SERVICE_POINTS[0], catalogId: "", description: "", qty: "1", unitPrice: "", discount: "0", notes: "" };

const InfoChip = ({ label, value, highlight }) => (
  <div className={`rounded-2xl border px-3 py-2 ${highlight ? "border-cyan-100 bg-cyan-50" : "border-slate-100 bg-slate-50"}`}>
    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
    <p className={`mt-0.5 text-xs font-semibold leading-tight ${highlight ? "text-cyan-800" : "text-slate-900"}`}>{value || "—"}</p>
  </div>
);

const Modal = ({ title, subtitle, onClose, wide, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.15 }}
      className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl`}
    >
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5 rounded-t-3xl">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="rounded-xl p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  </div>
);

const OpConsBilling = () => {
  const { activeDraft, setActiveDraft, clearDraft, addInvoice } = useInvoiceStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [itemForm, setItemForm] = useState(EMPTY_ITEM_FORM);
  const [billingItems, setBillingItems] = useState([]);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeForm, setFinalizeForm] = useState({ paymentMethod: "Cash", providerAccount: "", copayment: "0", notes: "" });
  const [successInvoiceId, setSuccessInvoiceId] = useState(null);

  useEffect(() => {
    if (activeDraft) {
      setSelectedPatient(activeDraft.patient);
      setBillingItems(activeDraft.items || []);
    }
  }, [activeDraft]);

  const patientSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return mockPatients
      .filter((p) =>
        p.uhid?.toLowerCase().includes(q) ||
        p.firstName?.toLowerCase().includes(q) ||
        p.lastName?.toLowerCase().includes(q) ||
        p.patientId?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery]);

  const catalogItems = useMemo(() => getItemsByServicePoint(itemForm.servicePoint), [itemForm.servicePoint]);

  const handleSelectPatient = (p) => {
    const existing = useInvoiceStore.getState().invoices.find(
      (inv) => inv.patient.uhid === p.uhid && inv.status === "Interim"
    );
    setSelectedPatient(p);
    setSearchQuery("");
    setShowPatientDropdown(false);
    if (existing) {
      setBillingItems(existing.items);
    } else {
      setBillingItems([]);
    }
    setItemForm(EMPTY_ITEM_FORM);
  };

  const handleItemFormChange = (field, value) => {
    setItemForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "servicePoint") {
        next.catalogId = "";
        next.description = "";
        next.unitPrice = "";
      }
      if (field === "catalogId" && value) {
        const cat = SERVICE_CATALOG.find((c) => c.id === value);
        if (cat) { next.description = cat.name; next.unitPrice = String(cat.defaultPrice); }
      }
      return next;
    });
  };

  const netAmount = useMemo(() => {
    const qty = parseFloat(itemForm.qty) || 0;
    const price = parseFloat(itemForm.unitPrice) || 0;
    const disc = parseFloat(itemForm.discount) || 0;
    return qty * price * (1 - disc / 100);
  }, [itemForm.qty, itemForm.unitPrice, itemForm.discount]);

  const handleAddItem = () => {
    if (!itemForm.description.trim() || !itemForm.unitPrice || !itemForm.qty) return;
    const newItem = {
      id: `item-${Date.now()}`,
      servicePoint: itemForm.servicePoint,
      description: itemForm.description.trim(),
      qty: parseFloat(itemForm.qty) || 1,
      unitPrice: parseFloat(itemForm.unitPrice) || 0,
      discount: parseFloat(itemForm.discount) || 0,
      netAmount: parseFloat(netAmount.toFixed(2)),
      notes: itemForm.notes.trim(),
    };
    setBillingItems((prev) => [...prev, newItem]);
    setItemForm(EMPTY_ITEM_FORM);
  };

  const handleRemoveItem = (id) => setBillingItems((prev) => prev.filter((i) => i.id !== id));

  const totals = useMemo(() => {
    const subtotal = billingItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const discountTotal = billingItems.reduce((s, i) => s + (i.qty * i.unitPrice * (i.discount / 100)), 0);
    const net = subtotal - discountTotal;
    return { subtotal, discountTotal, net };
  }, [billingItems]);

  const handleSaveInterim = () => {
    if (!selectedPatient || billingItems.length === 0) return;
    const store = useInvoiceStore.getState();
    const existing = store.invoices.find(
      (inv) => inv.patient.uhid === selectedPatient.uhid && inv.status === "Interim"
    );
    const patientObj = {
      uhid: selectedPatient.uhid,
      name: [selectedPatient.title, selectedPatient.firstName, selectedPatient.middleName, selectedPatient.lastName].filter(Boolean).join(" "),
      patientId: selectedPatient.patientId,
      gender: selectedPatient.gender,
      dob: selectedPatient.dob,
      paymentCategory: selectedPatient.paymentCategory,
      corporateName: selectedPatient.corporateName,
      phone: selectedPatient.phoneNumber,
    };
    if (existing) {
      store.updateInvoice(existing.id, { items: billingItems, subtotal: totals.subtotal, grandTotal: totals.net });
    } else {
      store.addInvoice({
        id: generateInvoiceId(),
        patient: patientObj,
        items: billingItems,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        copayment: 0,
        grandTotal: totals.net,
        paymentMethod: selectedPatient.paymentCategory || "Cash",
        providerAccount: null,
        status: "Interim",
        createdAt: new Date().toISOString(),
        finalizedAt: null,
        paidAt: null,
        notes: "",
      });
    }
    setSuccessInvoiceId("interim-saved");
    setTimeout(() => setSuccessInvoiceId(null), 3000);
  };

  const handleOpenFinalize = () => {
    setFinalizeForm({
      paymentMethod: selectedPatient?.paymentCategory || "Cash",
      providerAccount: "",
      copayment: "0",
      notes: "",
    });
    setShowFinalizeModal(true);
  };

  const handleFinalize = () => {
    const copay = parseFloat(finalizeForm.copayment) || 0;
    const grandTotal = totals.net + copay;
    const patientObj = {
      uhid: selectedPatient.uhid,
      name: [selectedPatient.title, selectedPatient.firstName, selectedPatient.middleName, selectedPatient.lastName].filter(Boolean).join(" "),
      patientId: selectedPatient.patientId,
      gender: selectedPatient.gender,
      dob: selectedPatient.dob,
      paymentCategory: selectedPatient.paymentCategory,
      corporateName: selectedPatient.corporateName,
      phone: selectedPatient.phoneNumber,
    };
    const store = useInvoiceStore.getState();
    const existing = store.invoices.find(
      (inv) => inv.patient.uhid === selectedPatient.uhid && inv.status === "Interim"
    );
    const invoiceId = existing ? existing.id : generateInvoiceId();
    const invoiceData = {
      id: invoiceId,
      patient: patientObj,
      items: billingItems,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      copayment: copay,
      grandTotal,
      paymentMethod: finalizeForm.paymentMethod,
      providerAccount: finalizeForm.providerAccount || null,
      status: "Final",
      createdAt: existing?.createdAt || new Date().toISOString(),
      finalizedAt: new Date().toISOString(),
      paidAt: null,
      notes: finalizeForm.notes,
    };
    if (existing) {
      store.updateInvoice(existing.id, invoiceData);
    } else {
      addInvoice(invoiceData);
    }
    clearDraft();
    setSuccessInvoiceId(invoiceId);
    setShowFinalizeModal(false);
    setBillingItems([]);
    setSelectedPatient(null);
  };

  const handleClearBill = () => {
    setBillingItems([]);
    setItemForm(EMPTY_ITEM_FORM);
  };

  const isCorporateOrInsurance = ["Corporate", "Insurance", "Government"].includes(finalizeForm.paymentMethod);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">OP Cons Billing</h1>
        <p className="text-sm font-medium text-slate-500">Search for a patient, add services, and finalize the bill.</p>
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {successInvoiceId && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold text-emerald-800">
              {successInvoiceId === "interim-saved"
                ? "Interim bill saved successfully."
                : `Invoice ${successInvoiceId} finalized. Go to Invoices to view or mark as paid.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patient Search */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-cyan-600" />
          <p className="text-sm font-bold text-slate-800">Patient Lookup</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by UHID, name, or patient ID..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowPatientDropdown(true); }}
            onFocus={() => setShowPatientDropdown(true)}
            onBlur={() => setTimeout(() => setShowPatientDropdown(false), 150)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 focus:bg-white transition-colors"
          />
          <AnimatePresence>
            {showPatientDropdown && patientSuggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute left-0 right-0 top-full mt-2 z-20 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                {patientSuggestions.map((p) => (
                  <button key={p.uhid} onMouseDown={() => handleSelectPatient(p)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-cyan-50 transition-colors border-b border-slate-50 last:border-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-sky-100 text-cyan-700 font-bold text-xs">
                      {p.firstName?.[0]}{p.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {[p.title, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ")}
                      </p>
                      <p className="text-xs text-slate-400">{p.uhid} · {p.patientId} · {p.paymentCategory}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Patient Info Card */}
        <AnimatePresence>
          {selectedPatient && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-4 rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-600 text-white font-bold text-sm shadow-sm shadow-cyan-200">
                      {selectedPatient.firstName?.[0]}{selectedPatient.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {[selectedPatient.title, selectedPatient.firstName, selectedPatient.middleName, selectedPatient.lastName].filter(Boolean).join(" ")}
                      </p>
                      <p className="text-xs text-slate-500">{selectedPatient.uhid} · {selectedPatient.patientId}</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedPatient(null); setBillingItems([]); }} className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700 transition-colors">
                    <X size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <InfoChip label="Age" value={`${calcAge(selectedPatient.dob)} yrs`} />
                  <InfoChip label="Gender" value={selectedPatient.gender} />
                  <InfoChip label="Payment" value={selectedPatient.paymentCategory} highlight />
                  {selectedPatient.corporateName && <InfoChip label="Corporate" value={selectedPatient.corporateName} />}
                  <InfoChip label="Phone" value={selectedPatient.phoneNumber} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Billing Area */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 lg:grid-cols-5">

            {/* Add Item Form */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Plus size={15} className="text-cyan-600" />
                <p className="text-sm font-bold text-slate-800">Add Billing Item</p>
              </div>

              {/* Service Point */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Service Point</label>
                <div className="relative">
                  <select value={itemForm.servicePoint} onChange={(e) => handleItemFormChange("servicePoint", e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors">
                    {SERVICE_POINTS.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Service from catalog */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Service / Item
                </label>
                <div className="relative mb-2">
                  <select value={itemForm.catalogId} onChange={(e) => handleItemFormChange("catalogId", e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors">
                    <option value="">— Pick from catalog —</option>
                    {catalogItems.map((c) => <option key={c.id} value={c.id}>{c.name} — KES {c.defaultPrice.toLocaleString()}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <input
                  value={itemForm.description}
                  onChange={(e) => handleItemFormChange("description", e.target.value)}
                  placeholder="Or type description manually..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Qty / Price / Discount */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Qty</label>
                  <input type="number" min="1" value={itemForm.qty} onChange={(e) => handleItemFormChange("qty", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors text-center" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Unit Price</label>
                  <input type="number" min="0" value={itemForm.unitPrice} onChange={(e) => handleItemFormChange("unitPrice", e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Disc %</label>
                  <input type="number" min="0" max="100" value={itemForm.discount} onChange={(e) => handleItemFormChange("discount", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors text-center" />
                </div>
              </div>

              {/* Net preview */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                <span className="text-xs font-semibold text-slate-500">Net Amount</span>
                <span className="text-sm font-black text-slate-900">{formatKES(netAmount)}</span>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Notes (optional)</label>
                <input value={itemForm.notes} onChange={(e) => handleItemFormChange("notes", e.target.value)}
                  placeholder="e.g. requested by Dr. Omondi"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 focus:bg-white transition-colors" />
              </div>

              <button onClick={handleAddItem} disabled={!itemForm.description.trim() || !itemForm.unitPrice}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 text-sm font-bold text-white hover:bg-cyan-700 transition-colors shadow-sm shadow-cyan-200 disabled:opacity-40 disabled:cursor-not-allowed">
                <Plus size={15} /> Add to Bill
              </button>
            </div>

            {/* Interim Items Table + Totals */}
            <div className="lg:col-span-3 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={15} className="text-cyan-600" />
                    <p className="text-sm font-bold text-slate-800">Interim Bill</p>
                    {billingItems.length > 0 && (
                      <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-700">{billingItems.length} item{billingItems.length !== 1 ? "s" : ""}</span>
                    )}
                  </div>
                  {billingItems.length > 0 && (
                    <button onClick={handleClearBill} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={12} /> Clear All
                    </button>
                  )}
                </div>

                {billingItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                    <FileText size={32} className="mb-2 opacity-30" />
                    <p className="text-sm font-medium">No billing items yet</p>
                    <p className="text-xs">Add services from the form to the left</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          {["#", "Service Point", "Description", "Qty", "Price", "Disc%", "Net", ""].map((h) => (
                            <th key={h} className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {billingItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2.5 text-xs text-slate-400">{idx + 1}</td>
                            <td className="px-3 py-2.5">
                              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 whitespace-nowrap">{item.servicePoint}</span>
                            </td>
                            <td className="px-3 py-2.5 min-w-[140px]">
                              <p className="text-xs font-semibold text-slate-900 leading-tight">{item.description}</p>
                              {item.notes && <p className="text-[9px] text-slate-400 mt-0.5">{item.notes}</p>}
                            </td>
                            <td className="px-3 py-2.5 text-xs text-center text-slate-700">{item.qty}</td>
                            <td className="px-3 py-2.5 text-xs text-slate-700 whitespace-nowrap">{formatKES(item.unitPrice)}</td>
                            <td className="px-3 py-2.5 text-xs text-center text-slate-500">{item.discount}%</td>
                            <td className="px-3 py-2.5 text-xs font-bold text-slate-900 whitespace-nowrap">{formatKES(item.netAmount)}</td>
                            <td className="px-3 py-2.5">
                              <button onClick={() => handleRemoveItem(item.id)} className="rounded-lg p-1 text-red-400 hover:bg-red-50 transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Totals */}
              {billingItems.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatKES(totals.subtotal)}</span>
                  </div>
                  {totals.discountTotal > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span className="font-semibold">— {formatKES(totals.discountTotal)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-2 flex justify-between">
                    <span className="text-base font-black text-slate-900">Bill Total</span>
                    <span className="text-base font-black text-cyan-700">{formatKES(totals.net)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">* Copayment will be added at finalization if applicable.</p>
                </div>
              )}

              {/* Action Buttons */}
              {billingItems.length > 0 && (
                <div className="flex gap-3">
                  <button onClick={handleSaveInterim}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    <Hash size={14} /> Save as Interim
                  </button>
                  <button onClick={handleOpenFinalize}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 text-sm font-bold text-white hover:bg-cyan-700 transition-colors shadow-sm shadow-cyan-200">
                    Create Final Bill <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No patient selected placeholder */}
      {!selectedPatient && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-slate-400">
          <User size={40} className="mb-3 opacity-20" />
          <p className="font-semibold text-slate-500">No patient selected</p>
          <p className="text-sm">Search for a patient above to begin billing</p>
        </div>
      )}

      {/* Finalize Modal */}
      <AnimatePresence>
        {showFinalizeModal && (
          <Modal title="Create Final Bill" subtitle={`For ${[selectedPatient?.title, selectedPatient?.firstName, selectedPatient?.lastName].filter(Boolean).join(" ")} · ${selectedPatient?.uhid}`} wide onClose={() => setShowFinalizeModal(false)}>
            <div className="space-y-5">
              {/* Items Summary */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Bill Items ({billingItems.length})</p>
                <div className="rounded-2xl border border-slate-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">Service</th>
                        <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">Description</th>
                        <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-slate-400">Qty</th>
                        <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-slate-400">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {billingItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 text-[10px] text-slate-500 max-w-[100px] truncate">{item.servicePoint}</td>
                          <td className="px-3 py-2 text-xs font-semibold text-slate-800">{item.description}</td>
                          <td className="px-3 py-2 text-xs text-center text-slate-600">{item.qty}</td>
                          <td className="px-3 py-2 text-xs font-bold text-right text-slate-900">{formatKES(item.netAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method</label>
                  <select value={finalizeForm.paymentMethod} onChange={(e) => setFinalizeForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors">
                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Copayment (KES)</label>
                  <input type="number" min="0" value={finalizeForm.copayment}
                    onChange={(e) => setFinalizeForm((p) => ({ ...p, copayment: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors" />
                </div>
                {isCorporateOrInsurance && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Provider Account</label>
                    <select value={finalizeForm.providerAccount} onChange={(e) => setFinalizeForm((p) => ({ ...p, providerAccount: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors">
                      <option value="">— Select provider account —</option>
                      {mockProviders.filter((p) => p.status === "Active").map((prov) => (
                        <option key={prov.id} value={prov.accountNumber}>{prov.providerName} ({prov.accountNumber})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes</label>
                  <input value={finalizeForm.notes} onChange={(e) => setFinalizeForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Any billing notes..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 focus:bg-white transition-colors" />
                </div>
              </div>

              {/* Grand Total */}
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 space-y-1.5">
                <div className="flex justify-between text-sm text-slate-600"><span>Net Bill Amount</span><span className="font-semibold">{formatKES(totals.net)}</span></div>
                {parseFloat(finalizeForm.copayment) > 0 && (
                  <div className="flex justify-between text-sm text-slate-600"><span>Copayment</span><span className="font-semibold">+ {formatKES(finalizeForm.copayment)}</span></div>
                )}
                <div className="border-t border-cyan-200 pt-2 flex justify-between">
                  <span className="font-black text-slate-900">Grand Total</span>
                  <span className="font-black text-cyan-700 text-lg">{formatKES(totals.net + (parseFloat(finalizeForm.copayment) || 0))}</span>
                </div>
              </div>

              {billingItems.length === 0 && (
                <div className="flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <AlertCircle size={14} className="text-amber-600 shrink-0" />
                  <p className="text-xs font-semibold text-amber-700">No items on this bill. Add at least one billing item before finalizing.</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowFinalizeModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={handleFinalize} disabled={billingItems.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-cyan-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <Printer size={14} /> Finalize Invoice
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OpConsBilling;
