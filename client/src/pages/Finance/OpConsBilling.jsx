import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, Trash2, ChevronDown, CheckCircle2,
  User, FileText, Phone, CalendarDays,
  Save, ClipboardList,
} from "lucide-react";
import { mockPatients } from "../../constants/mockPatients";
import { SERVICE_CATALOG, SERVICE_POINTS, getItemsByServicePoint } from "../../constants/mockServiceItems";
import { mockProviders, mockSchemes } from "../../constants/mockDebtors";
import { useInvoiceStore, generateBillId, generateInvoiceId } from "../../store/invoiceStore";
import Input from "../../components/ui/Input";
import { searchPatients } from "../../services/patientApi";

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

const getAgeGroup = (dob) => {
  const age = Number(calcAge(dob));
  if (!Number.isFinite(age) || age < 0) return "";
  if (age <= 12) return "Child";
  if (age <= 17) return "Adolescent";
  if (age <= 59) return "Adult";
  return "Senior";
};

const shouldShowBabyPrefix = (patient) => {
  const prefix = (patient?.title || "").trim().toLowerCase();
  return prefix.includes("baby");
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

const resolveProviderForPatient = (paymentMethod, patient) => {
  if (!patient || paymentMethod === "Cash") return null;
  const namedProvider = mockProviders.find((provider) =>
    patient?.corporateName && provider.providerName.toLowerCase() === patient.corporateName.toLowerCase()
  );
  if (namedProvider) return namedProvider;
  return mockProviders.find((provider) =>
    provider.providerType.toLowerCase() === paymentMethod.toLowerCase()
  ) || null;
};

const resolveActiveSchemeForPatient = (patient) => {
  if (!patient) return null;
  const paymentMethod = patient.paymentCategory || "Cash";
  const provider = resolveProviderForPatient(paymentMethod, patient);
  if (!provider) return null;
  if (provider.schemes?.length) {
    const providerScheme = provider.schemes
      .map((schemeId) => mockSchemes.find((scheme) => scheme.id === schemeId))
      .find((scheme) => scheme?.status === "Active");
    if (providerScheme) return providerScheme;
  }
  return mockSchemes.find((scheme) => scheme.providerId === provider.id && scheme.status === "Active") || null;
};

const calculateCopaymentAmount = (scheme, items) => {
  if (!scheme || !items?.length || scheme.copaymentType === "None") return 0;

  const servicePointTotals = items.reduce((acc, item) => {
    const amount = Number(item.netAmount || 0);
    if (!item.servicePoint || amount <= 0) return acc;
    acc[item.servicePoint] = (acc[item.servicePoint] || 0) + amount;
    return acc;
  }, {});

  const consultationTotal = servicePointTotals["Consultation (OPD)"] || 0;
  const totalNet = items.reduce((sum, item) => sum + Number(item.netAmount || 0), 0);
  const baseFixed = Number(scheme.categories?.[0]?.copayAmount || 0);
  const basePercent = Number(scheme.categories?.[0]?.copayPercent || 0);

  const getServicePointOverride = (point) => {
    const config = scheme.servicePoints?.find((sp) => sp.point === point);
    return config?.copayOverride;
  };

  let amount = 0;
  if (scheme.copaymentType === "Fixed") {
    if (scheme.copaymentScope === "On Consultation") {
      const override = getServicePointOverride("Consultation (OPD)");
      amount = consultationTotal > 0 ? Number(override ?? baseFixed) : 0;
    } else {
      const points = Object.keys(servicePointTotals);
      amount = points.reduce((sum, point) => {
        const override = getServicePointOverride(point);
        return sum + Number(override ?? baseFixed);
      }, 0);
    }
  } else if (scheme.copaymentType === "Percentage") {
    if (scheme.copaymentScope === "On Consultation") {
      const overridePercent = Number(getServicePointOverride("Consultation (OPD)") ?? basePercent);
      amount = consultationTotal * (overridePercent / 100);
    } else {
      amount = Object.entries(servicePointTotals).reduce((sum, [point, pointTotal]) => {
        const percent = Number(getServicePointOverride(point) ?? basePercent);
        return sum + pointTotal * (percent / 100);
      }, 0);
    }
  }

  return Math.max(0, Math.min(totalNet, Number(amount.toFixed(2))));
};

const applyCopayToConsultationItems = (items, copayAmount) => {
  if (!copayAmount || copayAmount <= 0) return items;
  let remaining = Number(copayAmount);
  const updated = items.map((item) => ({ ...item }));

  const applyReduction = (item) => {
    if (remaining <= 0) return item;
    const current = Number(item.netAmount || 0);
    if (current <= 0) return item;
    const reduction = Math.min(current, remaining);
    remaining = Number((remaining - reduction).toFixed(2));
    return { ...item, netAmount: Number((current - reduction).toFixed(2)) };
  };

  for (let i = 0; i < updated.length; i += 1) {
    if (updated[i].servicePoint === "Consultation (OPD)" && remaining > 0) {
      updated[i] = applyReduction(updated[i]);
    }
  }
  for (let i = 0; i < updated.length; i += 1) {
    if (remaining <= 0) break;
    if (updated[i].servicePoint !== "Consultation (OPD)") {
      updated[i] = applyReduction(updated[i]);
    }
  }
  return updated;
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);
  const [highlightedPatientIndex, setHighlightedPatientIndex] = useState(-1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [servicePaymentCategory, setServicePaymentCategory] = useState("Cash");

  const [itemForm, setItemForm] = useState(() => getEmptyItemForm(["Consultation (OPD)"]));
  const [billingItems, setBillingItems] = useState([]);
  const [successInvoiceId, setSuccessInvoiceId] = useState(null);

  const paymentCategoryOptions = useMemo(() => {
    const dynamic = new Set(
      mockPatients
        .map((patient) => patient.paymentCategory)
        .filter(Boolean)
    );
    dynamic.add("Cash");
    return [...dynamic];
  }, []);

  useEffect(() => {
    if (activeDraft) {
      setSelectedPatient(activeDraft.patient);
      setBillingItems(activeDraft.items || []);
      setServicePaymentCategory(activeDraft.paymentMethod || activeDraft.patient?.paymentCategory || "Cash");
    }
  }, [activeDraft]);

  useEffect(() => {
    setItemForm(defaultItemForm);
  }, [defaultItemForm]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let active = true;
    const runSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        if (active) setPatientSuggestions([]);
        return;
      }
      const results = await searchPatients(debouncedSearchQuery);
      if (active) setPatientSuggestions(results.slice(0, 10));
    };
    runSearch();
    return () => {
      active = false;
    };
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (!showPatientDropdown || patientSuggestions.length === 0) {
      setHighlightedPatientIndex(-1);
      return;
    }
    setHighlightedPatientIndex(0);
  }, [patientSuggestions, showPatientDropdown]);

  const catalogItems = useMemo(() => getItemsByServicePoint(itemForm.servicePoint), [itemForm.servicePoint]);

  const handleSelectPatient = (p) => {
    const existing = useInvoiceStore.getState().invoices.find(
      (inv) => inv.patient.uhid === p.uhid && inv.status === "Interim"
    );
    const fullName = [p.title, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");
    setSelectedPatient(p);
    setSearchQuery(`${p.uhid} - ${fullName} - ${p.phoneNumber || ""}`);
    setShowPatientDropdown(false);
    setIsSearchInputFocused(false);
    setServicePaymentCategory(p.paymentCategory || "Cash");
    if (existing) {
      setBillingItems(existing.items);
    } else {
      setBillingItems([]);
    }
    setItemForm(defaultItemForm);
  };

  const handleSearchKeyDown = (event) => {
    if (!showPatientDropdown || patientSuggestions.length === 0) {
      if (event.key === "Escape") setShowPatientDropdown(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedPatientIndex((prev) => (prev + 1) % patientSuggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedPatientIndex((prev) => (prev <= 0 ? patientSuggestions.length - 1 : prev - 1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const target = patientSuggestions[Math.max(0, highlightedPatientIndex)];
      if (target) handleSelectPatient(target);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setShowPatientDropdown(false);
      setIsSearchInputFocused(false);
    }
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

  const handleAddItem = async () => {
    if (!selectedPatient || !itemForm.description.trim() || !itemForm.unitPrice || !itemForm.qty) return;
    const billId = await generateBillId(isConsultationMode ? "CONS" : "SERV");
    const newItem = {
      id: `item-${Date.now()}`,
      billId,
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

  const handleUpdateItemDiscount = (id, discountValue) => {
    const parsed = Number(discountValue);
    const safeDiscount = Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 0;
    setBillingItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const netAmount = Number((item.qty * item.unitPrice * (1 - safeDiscount / 100)).toFixed(2));
        return { ...item, discount: safeDiscount, netAmount };
      })
    );
  };

  const totals = useMemo(() => {
    const subtotal = billingItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const discountTotal = billingItems.reduce((s, i) => s + (i.qty * i.unitPrice * (i.discount / 100)), 0);
    const net = subtotal - discountTotal;
    return { subtotal, discountTotal, net };
  }, [billingItems]);

  const billingPaymentCategory = isConsultationMode
    ? (selectedPatient?.paymentCategory)
    : (servicePaymentCategory);
  const billingPatient = useMemo(() => (
    selectedPatient ? { ...selectedPatient, paymentCategory: billingPaymentCategory } : null
  ), [billingPaymentCategory, selectedPatient]);

  const activeScheme = useMemo(() => resolveActiveSchemeForPatient(billingPatient), [billingPatient]);
  const copayment = useMemo(() => calculateCopaymentAmount(activeScheme, billingItems), [activeScheme, billingItems]);
  const isCashBill = billingPaymentCategory === "Cash";
  const copaymentApplied = useMemo(
    () => (isCashBill ? 0 : Number(Math.max(0, Math.min(copayment, totals.net)).toFixed(2))),
    [copayment, isCashBill, totals.net]
  );
  const grandTotal = useMemo(
    () => Number(Math.max(0, totals.net - copaymentApplied).toFixed(2)),
    [copaymentApplied, totals.net]
  );

  const selectedPatientFields = useMemo(() => {
    const isBaby = shouldShowBabyPrefix(selectedPatient);
    const firstNameWithPrefix = selectedPatient
      ? `${isBaby ? `${selectedPatient.title || ""} ` : ""}${selectedPatient.firstName || ""}`.trim()
      : "";

    return [
      { label: "UHID", value: selectedPatient?.uhid || "", inputClassName: "sm:max-w-[180px]" },
      { label: "First Name", value: firstNameWithPrefix },
      { label: "Middle Name", value: selectedPatient?.middleName || "" },
      { label: "Last Name", value: selectedPatient?.lastName || "" },
      { label: "Patient ID", value: selectedPatient?.patientId || "", inputClassName: "sm:max-w-[180px]" },
      { label: "Patient Category", value: selectedPatient?.patientCategory || "", inputClassName: "sm:max-w-[160px]" },
      { label: "DOB", value: selectedPatient?.dob || "", inputClassName: "sm:max-w-[145px]" },
      { label: "Age", value: selectedPatient?.dob ? `${calcAge(selectedPatient.dob)} yrs` : "", inputClassName: "sm:max-w-[110px]" },
      { label: "Age Group", value: selectedPatient?.dob ? getAgeGroup(selectedPatient.dob) : "", inputClassName: "sm:max-w-[140px]" },
      { label: "Gender", value: selectedPatient?.gender || "", inputClassName: "sm:max-w-[130px]" },
      { label: "Phone Number", value: selectedPatient?.phoneNumber || selectedPatient?.alternatePhone || "", inputClassName: "sm:max-w-[170px]" },
      { label: "Email Address", value: selectedPatient?.email || "" },
      { label: "Payment Category", value: billingPaymentCategory || "", inputClassName: "sm:max-w-[170px]" },
      { label: "Member No.", value: selectedPatient?.corporateAccountNumber || selectedPatient?.insuranceMemberNumber || selectedPatient?.nhifNumber || "", inputClassName: "sm:max-w-[200px]" },    
      { label: "Payer / Corporate", value: selectedPatient?.corporateName || selectedPatient?.employer || "" },
      { label: "Scheme", value: activeScheme?.schemeName || "" },
      
    ];
  }, [activeScheme, billingPaymentCategory, selectedPatient]);


  const handleClearBill = () => {
    setBillingItems([]);
    setItemForm(defaultItemForm);
    setSelectedPatient(null);
    setServicePaymentCategory("Cash");
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setPatientSuggestions([]);
    setShowPatientDropdown(false);
    setIsSearchInputFocused(false);
  };

  const handleSendBilling = async () => {
    if (!selectedPatient || billingItems.length === 0) return;
    const paymentMethod = billingPaymentCategory;
    const isCashBill = paymentMethod === "Cash";
    const providerAccount = isCashBill ? null : resolveProviderAccount(paymentMethod, selectedPatient);
    const copayAmount = copaymentApplied;
    const shouldSplitCopay = !isCashBill && copayAmount > 0;
    const patientObj = {
      uhid: selectedPatient.uhid,
      name: [selectedPatient.title, selectedPatient.firstName, selectedPatient.middleName, selectedPatient.lastName].filter(Boolean).join(" "),
      patientId: selectedPatient.patientId,
      gender: selectedPatient.gender,
      dob: selectedPatient.dob,
      paymentCategory: paymentMethod,
      corporateName: selectedPatient.corporateName,
      phone: selectedPatient.phoneNumber,
    };

    if (shouldSplitCopay) {
      const creditAmount = Number((totals.net - copayAmount).toFixed(2));
      const interimItems = applyCopayToConsultationItems(billingItems, copayAmount);

      const interimInvoiceId = await generateInvoiceId();
      const interimInvoiceData = {
        id: interimInvoiceId,
        patient: patientObj,
        items: interimItems,
        subtotal: creditAmount,
        discountTotal: 0,
        copayment: 0,
        grandTotal: creditAmount,
        schemeId: activeScheme?.id || null,
        schemeName: activeScheme?.schemeName || null,
        paymentMethod,
        providerAccount,
        status: "Interim",
        createdAt: new Date().toISOString(),
        finalizedAt: null,
        paidAt: null,
        notes: `${isConsultationMode ? "Consultation billing" : "Service point billing"} - balance after copayment`,
      };

      const copayInvoiceId = await generateInvoiceId();
      const copayBillId = await generateBillId("COPAY");
      const copayInvoiceData = {
        id: copayInvoiceId,
        patient: { ...patientObj, paymentCategory: "Cash" },
        items: [
          {
            id: `item-copay-${Date.now()}`,
            billId: copayBillId,
            servicePoint: "Consultation (OPD)",
            description: `Copayment Collection${activeScheme?.schemeName ? ` - ${activeScheme.schemeName}` : ""}`,
            qty: 1,
            unitPrice: copayAmount,
            discount: 0,
            netAmount: copayAmount,
            notes: `Copayment collected against ${interimInvoiceData.id}`,
          },
        ],
        subtotal: copayAmount,
        discountTotal: 0,
        copayment: 0,
        grandTotal: copayAmount,
        schemeId: activeScheme?.id || null,
        schemeName: activeScheme?.schemeName || null,
        paymentMethod: "Cash",
        providerAccount: null,
        status: "Cash Pending",
        createdAt: new Date().toISOString(),
        finalizedAt: null,
        paidAt: null,
        notes: `Copayment receipting for ${interimInvoiceData.id}`,
      };

      addInvoice(interimInvoiceData);
      addInvoice(copayInvoiceData);
      clearDraft();
      setBillingItems([]);
      setSelectedPatient(null);
      setSuccessInvoiceId(interimInvoiceData.id);
      navigate("/finance/cashier-transactions");
      return;
    }

    const invoiceId = await generateInvoiceId();
    const invoiceData = {
      id: invoiceId,
      patient: patientObj,
      items: billingItems,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      copayment: isCashBill ? 0 : copayAmount,
      grandTotal,
      schemeId: activeScheme?.id || null,
      schemeName: activeScheme?.schemeName || null,
      paymentMethod,
      providerAccount,
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
        <div className="p-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
            <div className="relative">
              <Input
                label="Search Patient"
                placeholder="UHID, Name, Phone, or ID"
                autoComplete="off"
                value={searchQuery}
                onFocus={() => {
                  setShowPatientDropdown(true);
                  setIsSearchInputFocused(true);
                }}
                onBlur={() =>
                  setTimeout(() => {
                    setShowPatientDropdown(false);
                    setIsSearchInputFocused(false);
                  }, 150)
                }
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowPatientDropdown(true);
                  setIsSearchInputFocused(true);
                }}
                onKeyDown={handleSearchKeyDown}
                leftIcon={<Search className="size-4" />}
                containerClassName="w-full max-w-xl"
              />
              <AnimatePresence>
                {showPatientDropdown && isSearchInputFocused && debouncedSearchQuery.trim() && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5">
                    <div className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/90 px-4 py-2 backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Search Results</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {patientSuggestions.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                          {patientSuggestions.map((p, index) => {
                            const fullName = `${p.firstName || ""} ${p.middleName ? `${p.middleName} ` : ""}${p.lastName || ""}`.trim();
                            const initials = `${p.firstName?.charAt(0) || ""}${p.lastName?.charAt(0) || ""}`.toUpperCase();
                            const isHighlighted = highlightedPatientIndex === index;
                            return (
                              <li key={p.patientId || p.uhid}>
                                <button
                                  type="button"
                                  onMouseEnter={() => setHighlightedPatientIndex(index)}
                                  onMouseDown={() => handleSelectPatient(p)}
                                  className={`group w-full px-4 py-3 text-left transition-all focus:bg-cyan-50/60 focus:outline-none ${
                                    isHighlighted ? "bg-cyan-50/60" : "hover:bg-cyan-50/60"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 transition-colors group-hover:bg-cyan-100 group-hover:text-cyan-700 group-hover:ring-cyan-200">
                                      {initials || "PT"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="truncate text-sm font-bold text-slate-900 group-hover:text-cyan-700">
                                          {fullName || "Unnamed patient"}
                                        </p>
                                        <span
                                          className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                            p.status === "Active"
                                              ? "bg-emerald-100 text-emerald-700"
                                              : "bg-rose-100 text-rose-700"
                                          }`}
                                        >
                                          {p.status || "Unknown"}
                                        </span>
                                      </div>
                                      <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                                        UHID: <span className="font-semibold text-slate-700">{p.uhid || "-"}</span>
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600">
                                    <p className="flex items-center gap-1.5">
                                      <FileText className="size-3.5 text-slate-400 group-hover:text-cyan-500" />
                                      <span>{p.patientId || "-"}</span>
                                    </p>
                                    <p className="flex items-center gap-1.5">
                                      <Phone className="size-3.5 text-slate-400 group-hover:text-cyan-500" />
                                      <span>{p.phoneNumber || "-"}</span>
                                    </p>
                                    <p className="flex items-center gap-1.5">
                                      <CalendarDays className="size-3.5 text-slate-400 group-hover:text-cyan-500" />
                                      <span>{p.dob || "-"}</span>
                                    </p>
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                        <div className="mb-3 rounded-full bg-slate-100 p-3">
                          <Search className="size-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          No matching records
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          We couldn't find any patient with "{debouncedSearchQuery}"
                        </p>
                      </div>
                    )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
          <div className="mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Selected Patient</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
            {selectedPatientFields.map((field) => (
              <div key={field.label}>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{field.label}</label>
                <input
                  type="text"
                  value={field.value}
                  readOnly
                  className={`h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none ${field.inputClassName || ""}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing Area */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={15} className="text-cyan-600" />
            <p className="text-sm font-bold text-slate-800">Add Charge / Interim Bill</p>
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

        <div className="space-y-4 p-4">
          {!isConsultationMode && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Payment Category
              </label>
              <div className="relative max-w-xs">
                <select
                  value={servicePaymentCategory}
                  onChange={(e) => setServicePaymentCategory(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-900 outline-none transition-colors focus:border-cyan-400"
                >
                  {paymentCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                Routing: Cash goes to Cashier Transactions. Other categories go to Interim Invoice Billings.
              </p>
            </div>
          )}

          <div className="grid gap-3 xl:grid-cols-12">
            <div className="xl:col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Service Point</label>
              <div className="relative">
                <select value={itemForm.servicePoint} onChange={(e) => handleItemFormChange("servicePoint", e.target.value)}
                  disabled={isConsultationMode}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors disabled:cursor-not-allowed disabled:text-slate-500">
                  {availableServicePoints.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div className="xl:col-span-3">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Service / Item</label>
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
            <div className="xl:col-span-1">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Qty</label>
              <input type="number" min="1" value={itemForm.qty} onChange={(e) => handleItemFormChange("qty", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-center text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors" />
            </div>
            <div className="xl:col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Price</label>
              <input type="number" min="0" value={itemForm.unitPrice} onChange={(e) => handleItemFormChange("unitPrice", e.target.value)} placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors" />
            </div>
            <div className="xl:col-span-1">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Disc %</label>
              <input type="number" min="0" max="100" value={itemForm.discount} onChange={(e) => handleItemFormChange("discount", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-center text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors" />
            </div>
            <div className="xl:col-span-3">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Notes (optional)</label>
              <input value={itemForm.notes} onChange={(e) => handleItemFormChange("notes", e.target.value)}
                placeholder="e.g. requested by Dr. Omondi"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 focus:bg-white transition-colors" />
            </div>
            <div className="xl:col-span-12">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Preview Net Amount</span>
                  <p className="text-sm font-black text-slate-900">{formatKES(netAmount)}</p>
                </div>
                <button onClick={handleAddItem} disabled={!selectedPatient || !itemForm.description.trim() || !itemForm.unitPrice}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-700 transition-colors shadow-sm shadow-cyan-200 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Plus size={15} /> Add to Interim Bill
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            {billingItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                <FileText size={32} className="mb-2 opacity-30" />
                <p className="text-sm font-medium">No billing items yet</p>
                <p className="text-xs">Add services above to start the interim bill</p>
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
                          <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">{item.servicePoint}</span>
                        </td>
                        <td className="min-w-[160px] px-3 py-2.5">
                          <p className="text-xs font-semibold leading-tight text-slate-900">{item.description}</p>
                          {item.notes && <p className="mt-0.5 text-[9px] text-slate-400">{item.notes}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-center text-xs text-slate-700">{item.qty}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-700">{formatKES(item.unitPrice)}</td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) => handleUpdateItemDiscount(item.id, e.target.value)}
                            className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-xs text-slate-700 outline-none focus:border-cyan-400"
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs font-bold text-slate-900">{formatKES(item.netAmount)}</td>
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

          {billingItems.length > 0 && (
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm lg:ml-auto lg:max-w-md">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatKES(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span className="font-semibold">- {formatKES(totals.discountTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Net Before Copay</span>
                  <span className="font-semibold">{formatKES(totals.net)}</span>
                </div>
                <div className="flex justify-between text-sm text-amber-700">
                  <span>Copay</span>
                  <span className="font-semibold">- {formatKES(copaymentApplied)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-base font-black text-slate-900">Bill Total</span>
                  <span className="text-base font-black text-cyan-700">{formatKES(grandTotal)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleClearBill}
              disabled={billingItems.length === 0 && !selectedPatient && !searchQuery.trim()}
              className="inline-flex flex-1 items-center justify-center gap-2 h-11 sm:h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:flex-none"
            >
              <Trash2 className="size-4" /> Clear
            </button>
            <button onClick={handleSendBilling} disabled={!selectedPatient || billingItems.length === 0}
              className="relative inline-flex flex-1 items-center justify-center gap-2 h-11 sm:h-10 rounded-lg bg-cyan-700 px-6 text-sm font-semibold text-white hover:bg-cyan-800 active:bg-cyan-900 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:flex-none overflow-hidden">
              <Save className="size-4" /> Save
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OpConsBilling;
