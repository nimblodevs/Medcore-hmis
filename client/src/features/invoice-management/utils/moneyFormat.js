export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "KES 0.00";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateInvoiceTotals(lineItems) {
  if (!lineItems || lineItems.length === 0) {
    return {
      grossAmount: 0,
      discountAmount: 0,
      adjustmentAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
    };
  }

  const grossAmount = lineItems.reduce(
    (sum, item) => sum + Number(item.totalAmount || 0),
    0
  );

  return {
    grossAmount,
    discountAmount: 0,
    adjustmentAmount: 0,
    paidAmount: 0,
    outstandingAmount: grossAmount,
  };
}
