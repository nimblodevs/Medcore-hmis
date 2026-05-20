import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, Trash2, X, ChevronDown, CheckCircle2,
  User, FileText,
  Hash, ClipboardList,
} from "lucide-react";
import { mockPatients } from "../../constants/mockPatients";
import { SERVICE_CATALOG, SERVICE_POINTS, getItemsByServicePoint } from "../../constants/mockServiceItems";
import { mockProviders } from "../../constants/mockDebtors";
import { useInvoiceStore, generateBillId, generateInvoiceId } from "../../store/invoiceStore";

const formatKES = (v) => `KES ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const calcAge = (dob) => {
  if (!dob) return "-";
  const [y, m, d] = dob.split("-");
  const birth = new Date(+y, +m - 1, +d);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return age;
};

const getEmptyItemForm = (servicePoints) => ({
  servicePoint: servicePoints[0],
  catalogId: "",
  description: "",
  qty: "1",
  unitPrice: "",
  discount: "0",
  notes: "",
});

const resolveProviderAccount = (paymentMethod, patient) => {
  if (paymentMethod === "Cash") return null;
  const namedProvider = mockProviders.find((provider) =>
    patient?.corporateName && provider.providerName.toLowerCase() === patient.corporateName.toLowerCase()
  );
  if (namedProvider) return namedProvider.accountNumber;
  const typeProvider = mockProviders.find((provider) =>
    provider.providerType.toLowerCase() === paymentMethod.toLowerCase()
  );
  return typeProvider?.accountNumber || null;
};

const OpConsBilling = ({ mode = "consultation" }) => {
  const navigate = useNavigate();
  const { activeDraft, clearDraft, addInvoice } = useInvoiceStore();
  const isConsultationMode = mode === "consultation";
  const availableServicePoints = useMemo(
    () => isConsultationMode ? ["Consultation (OPD)"] : SERVICE_POINTS.filter((point) => point !== "Consultation (OPD)"),
    [isConsultationMode]
  );
  const defaultItemForm = useMemo(() => getEmptyItemForm(availableServicePoints), [availableServicePoints]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [itemForm, setItemForm] = useState(() => getEmptyItemForm(["Consultation (OPD)"]));
  const [billingItems, setBillingItems] = useState([]);
  const [successInvoiceId, setSuccessInvoiceId] = useState(null);

  useEffect(() => {
    if (activeDraft) {
      setSelectedPatient(activeDraft.patient);
      setBillingItems(activeDraft.items || []);
    }
  }, [activeDraft]);

  useEffect(() => {
    setItemForm(defaultItemForm);
  }, [defaultItemForm]);

  const patientSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return mockPatients
      .filter((p) => {
        const searchable = [
          p.uhid,
          p.patientId,
          p.firstName,
          p.middleName,
          p.lastName,
          [p.title, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" "),
          p.phoneNumber,
          p.alternatePhone,
          p.documentNumber,
          p.paymentCategory,
          p.corporateName,
          p.employer,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(q);
      })
      .slice(0, 10);
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
    setItemForm(defaultItemForm);
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
    if (!selectedPatient || !itemForm.description.trim() || !itemForm.unitPrice || !itemForm.qty) return;
    const newItem = {
      id: `item-${Date.now()}`,
      billId: generateBillId(isConsultationMode ? "CONS" : "SERV"),
      servicePoint: itemForm.servicePoint,
      description: itemForm.description.trim(),
      qty: parseFloat(itemForm.qty) || 1,
      unitPrice: parseFloat(itemForm.unitPrice) || 0,
      discount: parseFloat(itemForm.discount) || 0,
      netAmount: parseFloat(netAmount.toFixed(2)),
      notes: itemForm.notes.trim(),
    };
    setBillingItems((prev) => [...prev, newItem]);
    setItemForm(defaultItemForm);
  };

  const handleRemoveItem = (id) => setBillingItems((prev) => prev.filter((i) => i.id !== id));

  const totals = useMemo(() => {
    const subtotal = billingItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const discountTotal = billingItems.reduce((s, i) => s + (i.qty * i.unitPrice * (i.discount / 100)), 0);
    const net = subtotal - discountTotal;
    return { subtotal, discountTotal, net };
  }, [billingItems]);


  const handleClearBill = () => {
    setBillingItems([]);
    setItemForm(defaultItemForm);
  };

  const handleSendBilling = () => {
    if (!selectedPatient || billingItems.length === 0) return;
    const paymentMethod = selectedPatient.paymentCategory || "Cash";
    const isCashBill = paymentMethod === "Cash";
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
    const invoiceData = {
      id: generateInvoiceId(),
      patient: patientObj,
      items: billingItems,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      copayment: 0,
      grandTotal: totals.net,
      paymentMethod,
      providerAccount: isCashBill ? null : resolveProviderAccount(paymentMethod, selectedPatient),
      status: isCashBill ? "Cash Pending" : "Interim",
      createdAt: new Date().toISOString(),
      finalizedAt: null,
      paidAt: null,
      notes: isConsultationMode ? "Consultation billing" : "Service point billing",
    };
    addInvoice(invoiceData);
    clearDraft();
    setBillingItems([]);
    setSelectedPatient(null);
    setSuccessInvoiceId(invoiceData.id);
    navigate(isCashBill ? "/finance/cashier-transactions" : "/finance/invoices/interim");
  };


  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          {isConsultationMode ? "OP Cons Billing" : "OP Service Billing"}
        </h1>
        <p className="text-sm font-medium text-slate-500">
          {isConsultationMode
            ? "Bill outpatient consultation related charges and route them by payer."
            : "Bill service-point charges and route them to cashier or interim invoices by payer."}
        </p>
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

      {/* Patient Details */}
      <div className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <User size={15} className="text-cyan-600" />
          <p className="text-sm font-bold text-slate-800">Patient Details</p>
        </div>
        <div className="relative p-4">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by UHID, name, or patient ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowPatientDropdown(true); }}
              onFocus={() => setShowPatientDropdown(true)}
              onBlur={() => setTimeout(() => setShowPatientDropdown(false), 150)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-cyan-400"
            />
          </div>
          <AnimatePresence>
            {showPatientDropdown && patientSuggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute left-4 right-4 top-full z-20 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                {patientSuggestions.map((p) => (
                  <button key={p.uhid} onMouseDown={() => handleSelectPatient(p)}
                    className="grid w-full grid-cols-[1.4fr_0.8fr_0.8fr] items-center gap-3 border-b border-slate-100 px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-cyan-50">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {[p.title, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ")}
                      </p>
                      <p className="text-[10px] text-slate-400">{p.patientId}</p>
                    </div>
                    <p className="font-mono text-[10px] font-semibold text-slate-600">{p.uhid}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-500">{p.paymentCategory}</p>
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
              <div className="border-t border-slate-100">
                <div className="grid grid-cols-[1.4fr_0.8fr_0.55fr_0.7fr_1fr_auto] items-center gap-3 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {[selectedPatient.title, selectedPatient.firstName, selectedPatient.middleName, selectedPatient.lastName].filter(Boolean).join(" ")}
                    </p>
                    <p className="text-[10px] text-slate-400">{selectedPatient.patientId}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">UHID</p>
                    <p className="font-mono text-[10px] font-semibold text-slate-700">{selectedPatient.uhid}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Age</p>
                    <p className="text-xs font-semibold text-slate-700">{calcAge(selectedPatient.dob)} yrs</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Payment</p>
                    <p className="text-xs font-semibold text-cyan-700">{selectedPatient.paymentCategory}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Payer / Phone</p>
                    <p className="truncate text-xs font-semibold text-slate-700">{selectedPatient.corporateName || selectedPatient.phoneNumber || "-"}</p>
                  </div>
                  <button onClick={() => { setSelectedPatient(null); setBillingItems([]); }} className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                    <X size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Billing Area */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">

            {/* Add Item Form */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Plus size={15} className="text-cyan-600" />
                <p className="text-sm font-bold text-slate-800">Add Charge / Add Billing Item</p>
              </div>

              {/* Service Point */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Service Point</label>
                <div className="relative">
                  <select value={itemForm.servicePoint} onChange={(e) => handleItemFormChange("servicePoint", e.target.value)}
                    disabled={isConsultationMode}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors disabled:cursor-not-allowed disabled:text-slate-500">
                    {availableServicePoints.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
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
                    <option value="">- Pick from catalog -</option>
                    {catalogItems.map((c) => <option key={c.id} value={c.id}>{c.name} - KES {c.defaultPrice.toLocaleString()}</option>)}
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

              <button onClick={handleAddItem} disabled={!selectedPatient || !itemForm.description.trim() || !itemForm.unitPrice}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 text-sm font-bold text-white hover:bg-cyan-700 transition-colors shadow-sm shadow-cyan-200 disabled:opacity-40 disabled:cursor-not-allowed">
                <Plus size={15} /> Add to Bill
              </button>
            </div>

            {/* Interim Items Table + Totals */}
            <div className="space-y-4 min-w-0">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                          {["Bill ID", "Service Point", "Description", "Qty", "Price", "Disc%", "Net", ""].map((h) => (
                            <th key={h} className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {billingItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2.5 font-mono text-[10px] font-semibold text-slate-600">{item.billId}</td>
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
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatKES(totals.subtotal)}</span>
                  </div>
                  {totals.discountTotal > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span className="font-semibold">- {formatKES(totals.discountTotal)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-2 flex justify-between">
                    <span className="text-base font-black text-slate-900">Bill Total</span>
                    <span className="text-base font-black text-cyan-700">{formatKES(totals.net)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">* Cash bills go to Cashier Transactions. Credit bills go to Interim Invoice Billings.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button onClick={handleClearBill} disabled={billingItems.length === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                  <Trash2 size={14} /> Clear
                </button>
                <button onClick={handleSendBilling} disabled={!selectedPatient || billingItems.length === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 text-sm font-bold text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40">
                  <Hash size={14} /> Save
                </button>
              </div>
            </div>
      </motion.div>
    </motion.div>
  );
};

export default OpConsBilling;




