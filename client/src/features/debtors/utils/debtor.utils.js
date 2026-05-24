/**
 * Format currency value to KES
 */
export const formatKES = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "—";
  }
  return `KES ${Number(value).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Get debtor type display label
 */
export const getDebtorTypeLabel = (type) => {
  const labels = {
    INSURANCE: "Insurance",
    CORPORATE: "Corporate",
    DIRECT_CORPORATE: "Direct Corporate",
    SHA: "SHA",
    NGO: "NGO",
    EMBASSY: "Embassy",
    GOVERNMENT: "Government",
    OTHER: "Other"
  };
  return labels[type] || type;
};

/**
 * Get debtor status display label
 */
export const getDebtorStatusLabel = (status) => {
  const labels = {
    DRAFT: "Draft",
    ACTIVE: "Active",
    ON_HOLD: "On Hold",
    SUSPENDED: "Suspended",
    CLOSED: "Closed",
    ARCHIVED: "Archived"
  };
  return labels[status] || status;
};

/**
 * Get status badge styling
 */
export const getStatusStyle = (status) => {
  const styles = {
    DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ON_HOLD: "bg-amber-50 text-amber-700 border-amber-200",
    SUSPENDED: "bg-red-50 text-red-700 border-red-200",
    CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
    ARCHIVED: "bg-slate-50 text-slate-400 border-slate-100"
  };
  return styles[status] || "bg-slate-100 text-slate-600";
};

/**
 * Get debtor type badge styling
 */
export const getTypeStyle = (type) => {
  const styles = {
    INSURANCE: "bg-blue-50 text-blue-700 border-blue-200",
    CORPORATE: "bg-violet-50 text-violet-700 border-violet-200",
    DIRECT_CORPORATE: "bg-indigo-50 text-indigo-700 border-indigo-200",
    SHA: "bg-cyan-50 text-cyan-700 border-cyan-200",
    NGO: "bg-teal-50 text-teal-700 border-teal-200",
    EMBASSY: "bg-purple-50 text-purple-700 border-purple-200",
    GOVERNMENT: "bg-amber-50 text-amber-700 border-amber-200",
    OTHER: "bg-slate-50 text-slate-600 border-slate-200"
  };
  return styles[type] || "bg-slate-50 text-slate-600";
};

/**
 * Calculate available credit
 */
export const calculateAvailableCredit = (creditLimit, currentBalance) => {
  const limit = parseFloat(creditLimit) || 0;
  const balance = parseFloat(currentBalance) || 0;
  return Math.max(0, limit - balance);
};

/**
 * Check if account is billable
 */
export const isAccountBillable = (status) => {
  return status === "ACTIVE";
};

/**
 * Check if account requires override for billing
 */
export const requiresOverride = (account, proposedAmount = 0) => {
  if (!isAccountBillable(account.status)) {
    return { requiresOverride: true, reason: `Account is ${getDebtorStatusLabel(account.status)}` };
  }
  
  const availableCredit = calculateAvailableCredit(account.creditLimit, account.currentBalance);
  if (proposedAmount > availableCredit) {
    return { 
      requiresOverride: true, 
      reason: `Proposed amount exceeds available credit (Available: ${formatKES(availableCredit)})`
    };
  }
  
  return { requiresOverride: false };
};

/**
 * Generate debtor code prefix based on type
 */
export const getDebtorCodePrefix = (type) => {
  const prefixes = {
    INSURANCE: "INS",
    CORPORATE: "CORP",
    DIRECT_CORPORATE: "DCORP",
    SHA: "SHA",
    NGO: "NGO",
    EMBASSY: "EMB",
    GOVERNMENT: "GOV",
    OTHER: "OTH"
  };
  return prefixes[type] || "OTH";
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format datetime for display
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate aging bucket for a date
 */
export const getAgingBucket = (dueDate, currentDate = new Date()) => {
  const due = new Date(dueDate);
  const now = new Date(currentDate);
  const daysOverdue = Math.floor((now - due) / (1000 * 60 * 60 * 24));
  
  if (daysOverdue < 0) {
    return { bucket: "Not Due", days: daysOverdue, class: "text-emerald-600" };
  } else if (daysOverdue <= 30) {
    return { bucket: "1-30 Days", days: daysOverdue, class: "text-amber-600" };
  } else if (daysOverdue <= 60) {
    return { bucket: "31-60 Days", days: daysOverdue, class: "text-orange-600" };
  } else if (daysOverdue <= 90) {
    return { bucket: "61-90 Days", days: daysOverdue, class: "text-red-500" };
  } else {
    return { bucket: "90+ Days", days: daysOverdue, class: "text-red-700 font-semibold" };
  }
};

export default {
  formatKES,
  getDebtorTypeLabel,
  getDebtorStatusLabel,
  getStatusStyle,
  getTypeStyle,
  calculateAvailableCredit,
  isAccountBillable,
  requiresOverride,
  getDebtorCodePrefix,
  formatDate,
  formatDateTime,
  getAgingBucket
};
