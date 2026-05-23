const pad = (v, n = 4) => String(v).padStart(n, "0");

export const invoiceNo = (count) => `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
export const receiptNo = (count) => `RCP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
export const claimNo = (count) => `CLM-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
export const prescriptionNo = (count) => `RX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
export const sessionNo = (count) => `CS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
export const refundNo = (count) => `REF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
export const handoverNo = (count) => `HO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
