const pad = (v, n = 4) => String(v).padStart(n, "0");

export const invoiceNo = (count) => `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
export const receiptNo = (count) => `RCP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
export const claimNo = (count) => `CLM-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
export const prescriptionNo = (count) => `RX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
