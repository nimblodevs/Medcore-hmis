import { postJson } from "./apiClient";

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
};

let localCounters = {
  invoice: 1,
  bill: 1,
  dispatch: 1,
  claim: 1,
  receipt: 1
};

const fallback = ({ type, prefix }) => {
  const dateKey = getTodayKey();
  const next = (k) => String(localCounters[k]++).padStart(4, "0");

  if (type === "INVOICE") return `INV-${dateKey}-${next("invoice")}`;
  if (type === "BILL") return `${prefix || "BILL"}-${dateKey}-${next("bill")}`;
  if (type === "DISPATCH_NOTE") return `DSP-${dateKey}-${next("dispatch")}`;
  if (type === "CLAIM_REFERENCE") return `CLM-${dateKey}-${next("claim")}`;
  if (type === "RECEIPT") return `RCP-${dateKey}-${next("receipt")}`;
  return `${type}-${dateKey}-${next("bill")}`;
};

export const getNextReference = async ({ type, tenantId, branchId, prefix }) => {
  try {
    const data = await postJson("/references/next", { type, tenantId, branchId, prefix });
    return data.code;
  } catch {
    return fallback({ type, prefix });
  }
};

export const generateInvoiceNo = async () => getNextReference({ type: "INVOICE" });
export const generateBillNo = async (prefix) => getNextReference({ type: "BILL", prefix });
export const generateDispatchNoteNo = async () => getNextReference({ type: "DISPATCH_NOTE" });
export const generateClaimReferenceNo = async () => getNextReference({ type: "CLAIM_REFERENCE" });

