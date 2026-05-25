import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck, Plus, Search, X, Eye, Edit2, ChevronDown, ChevronUp,
  Percent, Hash, Minus, AlertCircle, CheckCircle2, Layers,
  Info, Trash2, BookOpen, BarChart2,
} from "lucide-react";
import { mockSchemes, mockProviders, SERVICE_POINTS } from "../../constants/mockDebtors";

const COPAYMENT_TYPES = ["Fixed", "Percentage", "None"];
const COPAYMENT_SCOPES = ["Per Service Point", "On Consultation", "Both"];
const STATUS_OPTIONS = ["Active", "Inactive"];
const BIOMETRIC_TYPES = ["Smart", "Slade", "Mtiba", "SHA"];

const statusStyle = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-500",
};

const copayIcon = { Fixed: Hash, Percentage: Percent, None: Minus };

const copayColor = {
  Fixed: "bg-blue-50 text-blue-700 border-blue-100",
  Percentage: "bg-violet-50 text-violet-700 border-violet-100",
  None: "bg-slate-50 text-slate-500 border-slate-100",
};

const formatKES = (val) =>
  val == null || val === "" ? "—" : `KES ${Number(val).toLocaleString()}`;

const EMPTY_CATEGORY = { name: "", copayAmount: "", copayPercent: "" };
const EMPTY_SERVICE_POINT = { point: SERVICE_POINTS[0], copayOverride: "", limit: "", guidelines: "" };

const EMPTY_FORM = {
  schemeName: "",
  providerId: "",
  biometricType: "Smart",
  copaymentType: "Fixed",
  copaymentScope: "Per Service Point",
  categories: [{ ...EMPTY_CATEGORY }],
  servicePoints: [{ ...EMPTY_SERVICE_POINT }],
  overallLimit: "",
  hasOverallLimit: false,
  hasServicePointLimits: false,
  status: "Active",
  effectiveDate: "",
  expiryDate: "",
  notes: "",
};

const Modal = ({ title, subtitle, onClose, wide, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.18 }}
      className={`w-full ${wide ? "max-w-4xl" : "max-w-2xl"} max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl`}
    >
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-6 rounded-t-3xl">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-4">
    <p className="text-sm font-bold text-slate-800">{title}</p>
    {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
  </div>
);

const InputField = ({ label, name, value, onChange, type = "text", placeholder, prefix, required }) => (
  <div>
    {label && (
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <div className={`flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-cyan-400 focus-within:bg-white transition-colors ${prefix ? "pl-3" : ""}`}>
      {prefix && <span className="text-xs text-slate-400 font-medium shrink-0">{prefix}</span>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
      />
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required, optionObjects }) => (
  <div>
    {label && (
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors"
    >
      {optionObjects
        ? optionObjects.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)
        : options.map((o) => <option key={o} value={o}>{o}</option>)
      }
    </select>
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div
      onClick={onChange}
      className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${checked ? "bg-cyan-600" : "bg-slate-200"}`}
    >
      <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </div>
    {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
  </label>
);

const SchemeCard = ({ scheme, onView, onEdit }) => {
  const CopayIcon = copayIcon[scheme.copaymentType] || Minus;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-sky-100 text-cyan-700 shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">{scheme.schemeName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{scheme.providerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyle[scheme.status]}`}>
            {scheme.status === "Active" ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
            {scheme.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${copayColor[scheme.copaymentType]}`}>
          <CopayIcon size={13} />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider opacity-60">Copayment</p>
            <p className="text-xs font-bold">{scheme.copaymentType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <Layers size={13} className="text-slate-400" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Scope</p>
            <p className="text-xs font-semibold text-slate-700">{scheme.copaymentScope}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <BarChart2 size={13} className="text-slate-400" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Overall Limit</p>
            <p className="text-xs font-semibold text-slate-700">
              {scheme.hasOverallLimit ? formatKES(scheme.overallLimit) : "No Limit"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <BookOpen size={13} className="text-slate-400" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Categories</p>
            <p className="text-xs font-semibold text-slate-700">{scheme.categories?.length || 0} defined</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-400 font-medium">
          {scheme.effectiveDate} → {scheme.expiryDate || "Open"}
        </span>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={() => onView(scheme)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          <Eye size={13} /> View Details
        </button>
        <button onClick={() => onEdit(scheme)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-cyan-600 py-2 text-xs font-semibold text-white hover:bg-cyan-700 transition-colors">
          <Edit2 size={13} /> Edit Scheme
        </button>
      </div>
    </motion.div>
  );
};

const Schemes = () => {
  const [schemes, setSchemes] = useState(mockSchemes);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProvider, setFilterProvider] = useState("All");
  const [filterCopay, setFilterCopay] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewScheme, setViewScheme] = useState(null);
  const [editScheme, setEditScheme] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [expandedSection, setExpandedSection] = useState("basic");

  const filtered = schemes.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || s.schemeName.toLowerCase().includes(q) || s.providerName.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    const matchesProvider = filterProvider === "All" || s.providerId === filterProvider;
    const matchesCopay = filterCopay === "All" || s.copaymentType === filterCopay;
    return matchesSearch && matchesProvider && matchesCopay;
  });

  const handleFormChange = (e) => {
    const { name, value, type: t, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: t === "checkbox" ? checked : value }));
  };

  const handleCategoryChange = (idx, field, value) => {
    setForm((prev) => {
      const cats = [...prev.categories];
      cats[idx] = { ...cats[idx], [field]: value };
      return { ...prev, categories: cats };
    });
  };

  const addCategory = () => setForm((prev) => ({ ...prev, categories: [...prev.categories, { ...EMPTY_CATEGORY }] }));
  const removeCategory = (idx) => setForm((prev) => ({ ...prev, categories: prev.categories.filter((_, i) => i !== idx) }));

  const handleSPChange = (idx, field, value) => {
    setForm((prev) => {
      const sps = [...prev.servicePoints];
      sps[idx] = { ...sps[idx], [field]: value };
      return { ...prev, servicePoints: sps };
    });
  };

  const addServicePoint = () => setForm((prev) => ({ ...prev, servicePoints: [...prev.servicePoints, { ...EMPTY_SERVICE_POINT }] }));
  const removeServicePoint = (idx) => setForm((prev) => ({ ...prev, servicePoints: prev.servicePoints.filter((_, i) => i !== idx) }));

  const validateForm = () => {
    const errors = {};
    if (!form.schemeName.trim()) errors.schemeName = "Scheme name is required";
    if (!form.providerId) errors.providerId = "Provider is required";
    if (!form.effectiveDate) errors.effectiveDate = "Effective date is required";
    if (form.categories.some((c) => !c.name.trim())) errors.categories = "All category names are required";
    return errors;
  };

  const buildSchemeFromForm = (base) => {
    const provider = mockProviders.find((p) => p.id === form.providerId);
    return {
      ...base,
      schemeName: form.schemeName,
      providerId: form.providerId,
      providerName: provider?.providerName || "",
      biometricType: form.biometricType,
      copaymentType: form.copaymentType,
      copaymentScope: form.copaymentType === "None" ? "N/A" : form.copaymentScope,
      categories: form.categories.map((c) => ({
        name: c.name,
        ...(form.copaymentType === "Fixed" ? { copayAmount: Number(c.copayAmount) || 0 } : {}),
        ...(form.copaymentType === "Percentage" ? { copayPercent: Number(c.copayPercent) || 0 } : {}),
        ...(form.copaymentType === "None" ? { copayAmount: 0 } : {}),
      })),
      servicePoints: form.servicePoints.map((sp) => ({
        point: sp.point,
        copayOverride: sp.copayOverride !== "" ? Number(sp.copayOverride) : null,
        limit: sp.limit !== "" ? Number(sp.limit) : null,
        guidelines: sp.guidelines,
      })),
      overallLimit: form.hasOverallLimit && form.overallLimit !== "" ? Number(form.overallLimit) : null,
      hasOverallLimit: form.hasOverallLimit,
      hasServicePointLimits: form.hasServicePointLimits,
      status: form.status,
      effectiveDate: form.effectiveDate,
      expiryDate: form.expiryDate,
      notes: form.notes,
    };
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    const newScheme = buildSchemeFromForm({
      id: `SCH-${String(schemes.length + 1).padStart(3, "0")}`,
    });
    setSchemes((prev) => [newScheme, ...prev]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    const updated = buildSchemeFromForm({ id: editScheme.id });
    setSchemes((prev) => prev.map((s) => s.id === editScheme.id ? updated : s));
    setEditScheme(null);
    resetForm();
  };

  const openEdit = (scheme) => {
    setEditScheme(scheme);
    setForm({
      schemeName: scheme.schemeName,
      providerId: scheme.providerId,
      biometricType: scheme.biometricType || "Smart",
      copaymentType: scheme.copaymentType,
      copaymentScope: scheme.copaymentScope === "N/A" ? "Per Service Point" : scheme.copaymentScope,
      categories: scheme.categories.map((c) => ({
        name: c.name,
        copayAmount: c.copayAmount != null ? String(c.copayAmount) : "",
        copayPercent: c.copayPercent != null ? String(c.copayPercent) : "",
      })),
      servicePoints: scheme.servicePoints.map((sp) => ({
        point: sp.point,
        copayOverride: sp.copayOverride != null ? String(sp.copayOverride) : "",
        limit: sp.limit != null ? String(sp.limit) : "",
        guidelines: sp.guidelines || "",
      })),
      overallLimit: scheme.overallLimit != null ? String(scheme.overallLimit) : "",
      hasOverallLimit: scheme.hasOverallLimit,
      hasServicePointLimits: scheme.hasServicePointLimits,
      status: scheme.status,
      effectiveDate: scheme.effectiveDate || "",
      expiryDate: scheme.expiryDate || "",
      notes: scheme.notes || "",
    });
    setFormErrors({});
    setExpandedSection("basic");
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setExpandedSection("basic");
  };

  const SectionToggle = ({ id, label, icon: Icon }) => (
    <button type="button"
      onClick={() => setExpandedSection(expandedSection === id ? null : id)}
      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <Icon size={15} className="text-cyan-600" />
        {label}
      </div>
      {expandedSection === id ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
    </button>
  );

  const SchemeForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-3">

      {/* Basic Info */}
      <SectionToggle id="basic" label="Basic Information" icon={Info} />
      <AnimatePresence>
        {expandedSection === "basic" && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="grid gap-4 sm:grid-cols-2 pb-2">
              <div className="sm:col-span-2">
                <InputField label="Scheme Name" name="schemeName" value={form.schemeName} onChange={handleFormChange} required placeholder="e.g. Gold Executive Plan" />
                {formErrors.schemeName && <p className="mt-1 text-xs text-red-500">{formErrors.schemeName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Service Provider <span className="text-red-500">*</span></label>
                <select name="providerId" value={form.providerId} onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors">
                  <option value="">— Select Provider —</option>
                  {mockProviders.map((p) => <option key={p.id} value={p.id}>{p.providerName}</option>)}
                </select>
                {formErrors.providerId && <p className="mt-1 text-xs text-red-500">{formErrors.providerId}</p>}
              </div>
              <SelectField label="Biometric Type" name="biometricType" value={form.biometricType} onChange={handleFormChange} options={BIOMETRIC_TYPES} />
              <SelectField label="Status" name="status" value={form.status} onChange={handleFormChange} options={STATUS_OPTIONS} />
              <div>
                <InputField label="Effective Date" name="effectiveDate" type="date" value={form.effectiveDate} onChange={handleFormChange} required />
                {formErrors.effectiveDate && <p className="mt-1 text-xs text-red-500">{formErrors.effectiveDate}</p>}
              </div>
              <InputField label="Expiry Date" name="expiryDate" type="date" value={form.expiryDate} onChange={handleFormChange} />
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Scheme Notes / Exclusions</label>
                <textarea name="notes" value={form.notes} onChange={handleFormChange} rows={3} placeholder="Enter exclusions, special conditions, or general notes..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 focus:bg-white transition-colors resize-none" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copayment Settings */}
      <SectionToggle id="copay" label="Copayment Settings" icon={Percent} />
      <AnimatePresence>
        {expandedSection === "copay" && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="space-y-4 pb-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Copayment Type</label>
                  <div className="flex gap-2">
                    {COPAYMENT_TYPES.map((t) => {
                      const Icon = copayIcon[t];
                      return (
                        <button key={t} type="button"
                          onClick={() => setForm((prev) => ({ ...prev, copaymentType: t }))}
                          className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-semibold transition-colors ${form.copaymentType === t ? "border-cyan-300 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
                          <Icon size={14} />
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {form.copaymentType !== "None" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Copayment Scope</label>
                    <div className="flex flex-col gap-1.5">
                      {COPAYMENT_SCOPES.map((s) => (
                        <label key={s} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors ${form.copaymentScope === s ? "border-cyan-200 bg-cyan-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}>
                          <div className={`size-3.5 rounded-full border-2 transition-colors ${form.copaymentScope === s ? "border-cyan-600 bg-cyan-600" : "border-slate-300 bg-white"}`} />
                          <span className="text-xs font-semibold text-slate-700">{s}</span>
                          <input type="radio" name="copaymentScope" value={s} checked={form.copaymentScope === s} onChange={handleFormChange} className="hidden" />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      <SectionToggle id="categories" label="Copayment Categories" icon={Layers} />
      <AnimatePresence>
        {expandedSection === "categories" && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="space-y-3 pb-2">
              {formErrors.categories && <p className="text-xs text-red-500">{formErrors.categories}</p>}
              {form.categories.map((cat, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-600">Category {idx + 1}</p>
                    {form.categories.length > 1 && (
                      <button type="button" onClick={() => removeCategory(idx)} className="rounded-lg p-1 text-red-400 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Category Name</label>
                      <input value={cat.name} onChange={(e) => handleCategoryChange(idx, "name", e.target.value)} placeholder="e.g. Principal Member"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 transition-colors" />
                    </div>
                    {form.copaymentType === "Fixed" && (
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Copay Amount (KES)</label>
                        <input type="number" value={cat.copayAmount} onChange={(e) => handleCategoryChange(idx, "copayAmount", e.target.value)} placeholder="e.g. 300"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 transition-colors" />
                      </div>
                    )}
                    {form.copaymentType === "Percentage" && (
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Copay % (%)</label>
                        <input type="number" min="0" max="100" value={cat.copayPercent} onChange={(e) => handleCategoryChange(idx, "copayPercent", e.target.value)} placeholder="e.g. 20"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 transition-colors" />
                      </div>
                    )}
                    {form.copaymentType === "None" && (
                      <div className="flex items-center">
                        <span className="text-xs text-slate-400 italic">No copayment — full cover</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" onClick={addCategory}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-xs font-semibold text-slate-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors">
                <Plus size={14} /> Add Category
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Points */}
      <SectionToggle id="servicepoints" label="Service Points & Guidelines" icon={BookOpen} />
      <AnimatePresence>
        {expandedSection === "servicepoints" && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="space-y-3 pb-2">
              {form.servicePoints.map((sp, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-600">Service Point {idx + 1}</p>
                    {form.servicePoints.length > 1 && (
                      <button type="button" onClick={() => removeServicePoint(idx)} className="rounded-lg p-1 text-red-400 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Service Point</label>
                      <select value={sp.point} onChange={(e) => handleSPChange(idx, "point", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 transition-colors">
                        {SERVICE_POINTS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Copay Override {form.copaymentType === "Fixed" ? "(KES)" : form.copaymentType === "Percentage" ? "(%)" : ""}
                      </label>
                      <input type="number" value={sp.copayOverride} onChange={(e) => handleSPChange(idx, "copayOverride", e.target.value)}
                        placeholder={form.copaymentType === "None" ? "N/A" : "Leave blank to use category rate"}
                        disabled={form.copaymentType === "None"}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 transition-colors disabled:opacity-40" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Service Point Limit (KES)</label>
                      <input type="number" value={sp.limit} onChange={(e) => handleSPChange(idx, "limit", e.target.value)} placeholder="Leave blank for no limit"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Operation Guidelines</label>
                      <input value={sp.guidelines} onChange={(e) => handleSPChange(idx, "guidelines", e.target.value)} placeholder="e.g. Referral required..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-400 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addServicePoint}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-xs font-semibold text-slate-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors">
                <Plus size={14} /> Add Service Point
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Limits */}
      <SectionToggle id="limits" label="Scheme Limits" icon={BarChart2} />
      <AnimatePresence>
        {expandedSection === "limits" && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="space-y-4 pb-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <Toggle
                  checked={form.hasOverallLimit}
                  onChange={() => setForm((prev) => ({ ...prev, hasOverallLimit: !prev.hasOverallLimit }))}
                  label="Set overall annual limit for this scheme"
                />
                <AnimatePresence>
                  {form.hasOverallLimit && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <InputField name="overallLimit" type="number" value={form.overallLimit} onChange={handleFormChange} placeholder="e.g. 500000" prefix="KES" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Toggle
                  checked={form.hasServicePointLimits}
                  onChange={() => setForm((prev) => ({ ...prev, hasServicePointLimits: !prev.hasServicePointLimits }))}
                  label="Enable per-service-point limits (configured in Service Points section)"
                />
              </div>
              {!form.hasOverallLimit && !form.hasServicePointLimits && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <p className="text-xs font-semibold text-emerald-700">No limits — this scheme provides unlimited cover within the provider's credit ceiling.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <button type="button" onClick={() => { setShowAddModal(false); setEditScheme(null); resetForm(); }}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors shadow-sm shadow-cyan-200">
          {submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Schemes</h1>
          <p className="text-sm font-medium text-slate-500">
            Configure copayment schemes, categories, service point guidelines, and coverage limits.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors shadow-sm shadow-cyan-200"
        >
          <Plus size={16} /> New Scheme
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Schemes", value: schemes.length, color: "bg-slate-100 text-slate-600" },
          { label: "Active Schemes", value: schemes.filter((s) => s.status === "Active").length, color: "bg-emerald-100 text-emerald-600" },
          { label: "Fixed Copay", value: schemes.filter((s) => s.copaymentType === "Fixed").length, color: "bg-blue-100 text-blue-600" },
          { label: "No Copay (Full Cover)", value: schemes.filter((s) => s.copaymentType === "None").length, color: "bg-violet-100 text-violet-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search scheme name, provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterProvider} onChange={(e) => setFilterProvider(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 outline-none focus:border-cyan-400 transition-colors">
            <option value="All">All Providers</option>
            {mockProviders.map((p) => <option key={p.id} value={p.id}>{p.providerName}</option>)}
          </select>
          {["All", ...COPAYMENT_TYPES].map((t) => (
            <button key={t} onClick={() => setFilterCopay(t)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${filterCopay === t ? "bg-cyan-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Scheme Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 text-slate-400">
          <ShieldCheck size={40} className="mb-3 opacity-30" />
          <p className="font-semibold text-slate-500">No schemes found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} onView={setViewScheme} onEdit={(s) => { openEdit(s); }} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <Modal title="Create New Scheme" subtitle="Define copayment rules, categories, service points, and limits." wide onClose={() => { setShowAddModal(false); resetForm(); }}>
            <SchemeForm onSubmit={handleAddSubmit} submitLabel="Create Scheme" />
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editScheme && (
          <Modal title="Edit Scheme" subtitle={editScheme.schemeName} wide onClose={() => { setEditScheme(null); resetForm(); }}>
            <SchemeForm onSubmit={handleEditSubmit} submitLabel="Save Changes" />
          </Modal>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewScheme && (
          <Modal title="Scheme Details" subtitle={`${viewScheme.id} · ${viewScheme.providerName}`} wide onClose={() => setViewScheme(null)}>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-sm shadow-cyan-200 shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900">{viewScheme.schemeName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyle[viewScheme.status]}`}>{viewScheme.status}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{viewScheme.providerName}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Valid: {viewScheme.effectiveDate} → {viewScheme.expiryDate || "Open"}
                  </p>
                </div>
              </div>

              {/* Copayment Overview */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Copayment Configuration</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Biometric Type", value: viewScheme.biometricType || "Smart" },
                    { label: "Type", value: viewScheme.copaymentType },
                    { label: "Scope", value: viewScheme.copaymentScope },
                    { label: "Overall Limit", value: viewScheme.hasOverallLimit ? formatKES(viewScheme.overallLimit) : "No Limit" },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">{label}</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Copayment Categories ({viewScheme.categories?.length || 0})
                </p>
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {viewScheme.copaymentType === "Percentage" ? "Copay %" : viewScheme.copaymentType === "Fixed" ? "Copay Amount" : "Coverage"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {viewScheme.categories?.map((cat, i) => (
                        <tr key={i} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 text-sm font-semibold text-slate-900">{cat.name}</td>
                          <td className="px-4 py-2.5 text-sm font-semibold text-slate-700">
                            {viewScheme.copaymentType === "Fixed" ? formatKES(cat.copayAmount) :
                             viewScheme.copaymentType === "Percentage" ? `${cat.copayPercent}%` :
                             "Full Cover"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Service Points */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Service Points & Guidelines ({viewScheme.servicePoints?.length || 0})
                </p>
                <div className="space-y-2">
                  {viewScheme.servicePoints?.map((sp, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-bold text-slate-900">{sp.point}</p>
                        <div className="flex items-center gap-2">
                          {sp.copayOverride != null && (
                            <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                              Override: {viewScheme.copaymentType === "Percentage" ? `${sp.copayOverride}%` : formatKES(sp.copayOverride)}
                            </span>
                          )}
                          {sp.limit != null ? (
                            <span className="rounded-full bg-amber-50 border border-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                              Limit: {formatKES(sp.limit)}
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">No Limit</span>
                          )}
                        </div>
                      </div>
                      {sp.guidelines && (
                        <p className="text-xs text-slate-500 leading-relaxed">{sp.guidelines}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {viewScheme.notes && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertCircle size={14} className="text-amber-600" />
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Notes & Exclusions</p>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">{viewScheme.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button onClick={() => setViewScheme(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Close
                </button>
                <button onClick={() => { openEdit(viewScheme); setViewScheme(null); }}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors">
                  <Edit2 size={14} /> Edit Scheme
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Schemes;
