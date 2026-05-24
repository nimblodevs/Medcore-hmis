/**
 * Calculate aging bucket based on days overdue
 * @param {number} daysOverdue - Number of days past due date
 * @returns {string} AgingBucket enum value
 */
export function calculateAgingBucket(daysOverdue) {
  if (daysOverdue <= 0) {
    return "CURRENT";
  } else if (daysOverdue <= 30) {
    return "DAYS_1_30";
  } else if (daysOverdue <= 60) {
    return "DAYS_31_60";
  } else if (daysOverdue <= 90) {
    return "DAYS_61_90";
  } else if (daysOverdue <= 120) {
    return "DAYS_91_120";
  } else {
    return "OVER_120";
  }
}

/**
 * Calculate risk level based on days overdue and credit utilization
 * @param {number} daysOverdue - Number of days past due date
 * @param {number} outstandingAmount - Current outstanding balance
 * @param {number} creditLimit - Account credit limit
 * @returns {string} CreditRiskLevel enum value
 */
export function calculateRiskLevel(daysOverdue, outstandingAmount, creditLimit) {
  // Calculate credit utilization percentage
  const utilization = creditLimit > 0 ? (outstandingAmount / creditLimit) * 100 : 0;

  // CRITICAL: over credit limit OR overdue > 90 days
  if (outstandingAmount > creditLimit || daysOverdue > 90) {
    return "CRITICAL";
  }

  // HIGH: overdue 61–90 days OR balance >= 90% of credit limit
  if ((daysOverdue >= 61 && daysOverdue <= 90) || utilization >= 90) {
    return "HIGH";
  }

  // MEDIUM: overdue 31–60 days OR balance >= 75% of credit limit
  if ((daysOverdue >= 31 && daysOverdue <= 60) || utilization >= 75) {
    return "MEDIUM";
  }

  // LOW: current or overdue <= 30 days
  return "LOW";
}

/**
 * Calculate days overdue from due date
 * @param {Date|string} dueDate - Invoice due date
 * @param {Date|string} [asOfDate] - Optional date to calculate from (defaults to now)
 * @returns {number} Number of days overdue (0 if not overdue)
 */
export function calculateDaysOverdue(dueDate, asOfDate = new Date()) {
  const due = new Date(dueDate);
  const now = new Date(asOfDate);
  const diffTime = now.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculate total outstanding amount from invoices
 * @param {Array} invoices - Array of invoice objects with outstandingAmount
 * @returns {number} Total outstanding amount
 */
export function calculateOutstandingAmount(invoices) {
  return invoices.reduce((total, invoice) => {
    return total + (parseFloat(invoice.outstandingAmount) || 0);
  }, 0);
}

/**
 * Calculate total overdue amount from invoices
 * @param {Array} invoices - Array of invoice objects with outstandingAmount and dueDate
 * @param {Date|string} [asOfDate] - Optional date to calculate from (defaults to now)
 * @returns {number} Total overdue amount
 */
export function calculateOverdueAmount(invoices, asOfDate = new Date()) {
  return invoices.reduce((total, invoice) => {
    const daysOverdue = calculateDaysOverdue(invoice.dueDate, asOfDate);
    if (daysOverdue > 0) {
      return total + (parseFloat(invoice.outstandingAmount) || 0);
    }
    return total;
  }, 0);
}

/**
 * Get aging summary for a set of invoices
 * @param {Array} invoices - Array of invoice objects with outstandingAmount and dueDate
 * @param {Date|string} [asOfDate] - Optional date to calculate from (defaults to now)
 * @returns {Object} Aging summary by bucket
 */
export function getAgingSummary(invoices, asOfDate = new Date()) {
  const summary = {
    CURRENT: 0,
    DAYS_1_30: 0,
    DAYS_31_60: 0,
    DAYS_61_90: 0,
    DAYS_91_120: 0,
    OVER_120: 0,
  };

  invoices.forEach((invoice) => {
    const amount = parseFloat(invoice.outstandingAmount) || 0;
    if (amount <= 0) return;

    const daysOverdue = calculateDaysOverdue(invoice.dueDate, asOfDate);
    const bucket = calculateAgingBucket(daysOverdue);
    summary[bucket] += amount;
  });

  return summary;
}

/**
 * Check if a promise to pay is overdue
 * @param {Date|string} promisedDate - Promised payment date
 * @param {boolean} isFulfilled - Whether the promise has been fulfilled
 * @param {Date|string} [asOfDate] - Optional date to check against (defaults to now)
 * @returns {boolean} True if promise is overdue
 */
export function isPromiseOverdue(promisedDate, isFulfilled, asOfDate = new Date()) {
  if (isFulfilled) return false;
  const promised = new Date(promisedDate);
  const now = new Date(asOfDate);
  return promised < now;
}
