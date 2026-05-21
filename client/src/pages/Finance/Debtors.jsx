import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, Plus, Search, X, Phone, Mail,
  MapPin, User, CreditCard, AlertCircle, CheckCircle2,
  Ban, Eye, Edit2, TrendingUp, Wallet, Clock,
} from "lucide-react";
import { mockProviders } from "../../constants/mockDebtors";

const PROVIDER_TYPES = ["Insurance", "Corporate", "Government"];
const STATUS_OPTIONS = ["Active", "Inactive", "Suspended"];

const statusStyle = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-500",
  Suspended: "bg-red-100 text-red-600",
};

const statusIcon = {
  Active: CheckCircle2,
  Inactive: AlertCircle,
  Suspended: Ban,
};

const typeStyle = {
  Insurance: "bg-blue-50 text-blue-700",
  Corporate: "bg-violet-50 text-violet-700",
  Government: "bg-amber-50 text-amber-700",
};

const formatKES = (val) =>
  val == null ? "—" : `KES ${Number(val).toLocaleString()}`;

const generateAccountNumber = () => {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `ACC-${year}-${seq}`;
};

const CREDIT_PERIOD_OPTIONS = [14, 30, 45, 60, 90, 120];

const creditPeriodStyle = (days) => {
  if (days <= 30)  return "bg-emerald-100 text-emerald-700";
  if (days <= 60)  return "bg-amber-100 text-amber-700";
  if (days <= 90)  return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-600";
};

const EMPTY_FORM = {
  providerName: "",
  providerType: "Insurance",
  registrationNumber: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  creditLimit: "",
  creditPeriod: "30",
  status: "Active",
};

const FieldBlock = ({ label, value, highlight = false }) => (
  <div className={`rounded-2xl border p-3 ${highlight ? "border-cyan-100 bg-cyan-50" : "border-slate-100 bg-slate-50"}`}>
    <p className="text-[9px] uppercase tracking-[0.22em] text-slate-400">{label}</p>
    <p className={`mt-1 text-sm font-semibold leading-tight ${highlight ? "text-cyan-800" : "text-slate-900"}`}>
      {value || "—"}
    </p>
  </div>
);

const Modal = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.18 }}
      className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="flex items-start justify-between border-b border-slate-100 p-6">
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

const InputField = ({ label, name, value, onChange, type = "text", required, placeholder, prefix }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
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

const SelectField = ({ label, name, value, onChange, options, required }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:bg-white transition-colors"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

const Debtors = () => {
  const [providers, setProviders] = useState(mockProviders);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewProvider, setViewProvider] = useState(null);
  const [editProvider, setEditProvider] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const filtered = providers.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.providerName.toLowerCase().includes(q) ||
      p.accountNumber.toLowerCase().includes(q) ||
      p.contactPerson.toLowerCase().includes(q) ||
      p.registrationNumber.toLowerCase().includes(q);
    const matchesType = filterType === "All" || p.providerType === filterType;
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.providerName.trim()) errors.providerName = "Provider name is required";
    if (!form.registrationNumber.trim()) errors.registrationNumber = "Registration number is required";
    if (!form.contactPerson.trim()) errors.contactPerson = "Contact person is required";
    if (!form.phone.trim()) errors.phone = "Phone number is required";
    if (!form.creditLimit || isNaN(Number(form.creditLimit))) errors.creditLimit = "Valid credit limit is required";
    return errors;
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    const newProvider = {
      ...form,
      id: `PRV-${String(providers.length + 1).padStart(3, "0")}`,
      accountNumber: generateAccountNumber(),
      creditLimit: Number(form.creditLimit),
      creditPeriod: Number(form.creditPeriod),
      outstandingBalance: 0,
      accountOpenDate: new Date().toISOString().split("T")[0],
      schemes: [],
    };
    setProviders((prev) => [newProvider, ...prev]);
    setForm(EMPTY_FORM);
    setShowAddModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setProviders((prev) =>
      prev.map((p) => p.id === editProvider.id
        ? { ...p, ...form, creditLimit: Number(form.creditLimit), creditPeriod: Number(form.creditPeriod) }
        : p)
    );
    setEditProvider(null);
    setForm(EMPTY_FORM);
  };

  const openEdit = (provider) => {
    setEditProvider(provider);
    setForm({
      providerName: provider.providerName,
      providerType: provider.providerType,
      registrationNumber: provider.registrationNumber,
      contactPerson: provider.contactPerson,
      phone: provider.phone,
      email: provider.email,
      address: provider.address,
      creditLimit: String(provider.creditLimit),
      creditPeriod: String(provider.creditPeriod ?? 30),
      status: provider.status,
    });
    setFormErrors({});
  };

  const totalOutstanding = providers.reduce((s, p) => s + (p.outstandingBalance || 0), 0);
  const totalCredit = providers.reduce((s, p) => s + (p.creditLimit || 0), 0);
  const activeCount = providers.filter((p) => p.status === "Active").length;

  const ProviderForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <InputField label="Provider / Organisation Name" name="providerName" value={form.providerName} onChange={handleFormChange} required placeholder="e.g. Jubilee Health Insurance" />
          {formErrors.providerName && <p className="mt-1 text-xs text-red-500">{formErrors.providerName}</p>}
        </div>
        <SelectField label="Provider Type" name="providerType" value={form.providerType} onChange={handleFormChange} options={PROVIDER_TYPES} required />
        <div>
          <InputField label="Registration / License No." name="registrationNumber" value={form.registrationNumber} onChange={handleFormChange} required placeholder="e.g. IRA/2005/0034" />
          {formErrors.registrationNumber && <p className="mt-1 text-xs text-red-500">{formErrors.registrationNumber}</p>}
        </div>
        <div>
          <InputField label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={handleFormChange} required placeholder="Full name" />
          {formErrors.contactPerson && <p className="mt-1 text-xs text-red-500">{formErrors.contactPerson}</p>}
        </div>
        <div>
          <InputField label="Phone Number" name="phone" value={form.phone} onChange={handleFormChange} required placeholder="e.g. 0722 100 200" />
          {formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
        </div>
        <InputField label="Email Address" name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="claims@provider.co.ke" />
        <div className="sm:col-span-2">
          <InputField label="Physical Address" name="address" value={form.address} onChange={handleFormChange} placeholder="Street, area, city" />
        </div>
        <div>
          <InputField label="Credit Limit (KES)" name="creditLimit" type="number" value={form.creditLimit} onChange={handleFormChange} required placeholder="e.g. 500000" prefix="KES" />
          {formErrors.creditLimit && <p className="mt-1 text-xs text-red-500">{formErrors.creditLimit}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Credit Period <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {CREDIT_PERIOD_OPTIONS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, creditPeriod: String(days) }))}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                  form.creditPeriod === String(days)
                    ? "border-cyan-400 bg-cyan-600 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <Clock size={10} />
                {days} days
              </button>
            ))}
          </div>
        </div>
        <SelectField label="Account Status" name="status" value={form.status} onChange={handleFormChange} options={STATUS_OPTIONS} required />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => { setShowAddModal(false); setEditProvider(null); setForm(EMPTY_FORM); setFormErrors({}); }}
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
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Debtors</h1>
          <p className="text-sm font-medium text-slate-500">
            Manage service provider accounts — insurance, corporate, and government.
          </p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setShowAddModal(true); }}
          className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors shadow-sm shadow-cyan-200"
        >
          <Plus size={16} /> Add Provider
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Providers", value: providers.length, icon: Building2, color: "text-slate-600", bg: "bg-slate-100" },
          { label: "Active Accounts", value: activeCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Total Credit Limit", value: formatKES(totalCredit), icon: CreditCard, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Total Outstanding", value: formatKES(totalOutstanding), icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-100" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-2xl ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-lg font-black text-slate-900 leading-tight">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search providers, account numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {["All", ...PROVIDER_TYPES].map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${filterType === t ? "bg-cyan-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["All", ...STATUS_OPTIONS].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${filterStatus === s ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Providers Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Building2 size={40} className="mb-3 opacity-30" />
            <p className="font-semibold text-slate-500">No providers found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Account No.", "Provider Name", "Type", "Contact Person", "Outstanding", "Credit Limit", "Credit Period", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((provider) => {
                  const StatusIcon = statusIcon[provider.status] || AlertCircle;
                  const utilisation = provider.creditLimit > 0 ? (provider.outstandingBalance / provider.creditLimit) * 100 : 0;
                  return (
                    <tr key={provider.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-semibold text-slate-600">{provider.accountNumber}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-sky-100 text-cyan-700">
                            <Building2 size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 leading-tight">{provider.providerName}</p>
                            <p className="text-[10px] text-slate-400">{provider.registrationNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${typeStyle[provider.providerType] || "bg-slate-100 text-slate-600"}`}>
                          {provider.providerType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{provider.contactPerson}</td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className={`text-sm font-bold ${provider.outstandingBalance > 0 ? "text-amber-600" : "text-slate-400"}`}>
                            {formatKES(provider.outstandingBalance)}
                          </p>
                          {provider.creditLimit > 0 && (
                            <div className="mt-1 h-1 w-20 rounded-full bg-slate-100">
                              <div className={`h-full rounded-full transition-all ${utilisation > 80 ? "bg-red-400" : utilisation > 50 ? "bg-amber-400" : "bg-emerald-400"}`}
                                style={{ width: `${Math.min(utilisation, 100)}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">{formatKES(provider.creditLimit)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${creditPeriodStyle(provider.creditPeriod ?? 30)}`}>
                          <Clock size={9} strokeWidth={2.5} />
                          {provider.creditPeriod ?? 30} days
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusStyle[provider.status]}`}>
                          <StatusIcon size={10} />
                          {provider.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewProvider(provider)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-cyan-50 hover:text-cyan-600 transition-colors" title="View">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => openEdit(provider)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Edit">
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <Modal title="Open Provider Account" subtitle="Register a new service provider and open a billing account." onClose={() => { setShowAddModal(false); setForm(EMPTY_FORM); setFormErrors({}); }}>
            <ProviderForm onSubmit={handleAddSubmit} submitLabel="Open Account" />
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editProvider && (
          <Modal title="Edit Provider Account" subtitle={`Editing: ${editProvider.providerName}`} onClose={() => { setEditProvider(null); setForm(EMPTY_FORM); setFormErrors({}); }}>
            <ProviderForm onSubmit={handleEditSubmit} submitLabel="Save Changes" />
          </Modal>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewProvider && (
          <Modal title="Provider Account Details" subtitle={viewProvider.accountNumber} onClose={() => setViewProvider(null)}>
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-sm shadow-cyan-200">
                  <Building2 size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{viewProvider.providerName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${typeStyle[viewProvider.providerType]}`}>{viewProvider.providerType}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyle[viewProvider.status]}`}>{viewProvider.status}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FieldBlock label="Account Number" value={viewProvider.accountNumber} highlight />
                <FieldBlock label="Registration Number" value={viewProvider.registrationNumber} />
                <FieldBlock label="Account Opened" value={viewProvider.accountOpenDate} />
                <FieldBlock label="Schemes Linked" value={viewProvider.schemes?.length || 0} />
                <FieldBlock label="Credit Limit" value={formatKES(viewProvider.creditLimit)} />
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[9px] uppercase tracking-[0.22em] text-slate-400">Credit Period</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${creditPeriodStyle(viewProvider.creditPeriod ?? 30)}`}>
                      <Clock size={11} strokeWidth={2.5} />
                      {viewProvider.creditPeriod ?? 30} days
                    </span>
                    <span className="text-xs text-slate-400">
                      payment due within {viewProvider.creditPeriod ?? 30} days of invoice
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Contact Information</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <User size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Contact Person</p>
                      <p className="text-sm font-semibold text-slate-900">{viewProvider.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Phone</p>
                      <p className="text-sm font-semibold text-slate-900">{viewProvider.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Email</p>
                      <p className="text-sm font-semibold text-slate-900">{viewProvider.email || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Address</p>
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{viewProvider.address || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Account Financials</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CreditCard size={12} className="text-blue-500" />
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Credit Limit</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{formatKES(viewProvider.creditLimit)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp size={12} className="text-amber-500" />
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Outstanding</p>
                    </div>
                    <p className={`text-sm font-bold ${viewProvider.outstandingBalance > 0 ? "text-amber-600" : "text-slate-400"}`}>
                      {formatKES(viewProvider.outstandingBalance)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wallet size={12} className="text-emerald-500" />
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Available</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-700">
                      {formatKES(viewProvider.creditLimit - viewProvider.outstandingBalance)}
                    </p>
                  </div>
                </div>
                {viewProvider.creditLimit > 0 && (
                  <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                      <span>Credit Utilisation</span>
                      <span>{Math.round((viewProvider.outstandingBalance / viewProvider.creditLimit) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div className={`h-full rounded-full transition-all ${(viewProvider.outstandingBalance / viewProvider.creditLimit) > 0.8 ? "bg-red-400" : (viewProvider.outstandingBalance / viewProvider.creditLimit) > 0.5 ? "bg-amber-400" : "bg-emerald-400"}`}
                        style={{ width: `${Math.min((viewProvider.outstandingBalance / viewProvider.creditLimit) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button onClick={() => setViewProvider(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Close
                </button>
                <button onClick={() => { openEdit(viewProvider); setViewProvider(null); }}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors">
                  <Edit2 size={14} /> Edit Account
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Debtors;
