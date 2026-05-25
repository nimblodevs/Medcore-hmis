export const INVOICE_STATUS = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
  WRITTEN_OFF: "WRITTEN_OFF",
  DISPUTED: "DISPUTED",
};

export const INVOICE_TYPE = {
  INSURANCE: "INSURANCE",
  CORPORATE: "CORPORATE",
  SHA: "SHA",
  PATIENT_CREDIT: "PATIENT_CREDIT",
};

export const INVOICE_LINE_ITEM_TYPE = {
  CONSULTATION: "CONSULTATION",
  LABORATORY: "LABORATORY",
  RADIOLOGY: "RADIOLOGY",
  PHARMACY: "PHARMACY",
  PROCEDURE: "PROCEDURE",
  ROOM_CHARGE: "ROOM_CHARGE",
  SURGERY: "SURGERY",
  OTHER: "OTHER",
};

export const INVOICE_ADJUSTMENT_TYPE = {
  DISCOUNT: "DISCOUNT",
  CREDIT_NOTE: "CREDIT_NOTE",
  DEBIT_NOTE: "DEBIT_NOTE",
  WRITE_OFF: "WRITE_OFF",
};

export function getInvoiceStatusColor(status) {
  switch (status) {
    case INVOICE_STATUS.DRAFT:
      return "secondary";
    case INVOICE_STATUS.PENDING:
      return "warning";
    case INVOICE_STATUS.APPROVED:
      return "default";
    case INVOICE_STATUS.PARTIALLY_PAID:
      return "info";
    case INVOICE_STATUS.PAID:
      return "success";
    case INVOICE_STATUS.OVERDUE:
      return "destructive";
    case INVOICE_STATUS.CANCELLED:
      return "outline";
    case INVOICE_STATUS.WRITTEN_OFF:
      return "outline";
    case INVOICE_STATUS.DISPUTED:
      return "warning";
    default:
      return "secondary";
  }
}

export function getInvoiceTypeLabel(type) {
  switch (type) {
    case INVOICE_TYPE.INSURANCE:
      return "Insurance";
    case INVOICE_TYPE.CORPORATE:
      return "Corporate";
    case INVOICE_TYPE.SHA:
      return "SHA";
    case INVOICE_TYPE.PATIENT_CREDIT:
      return "Patient Credit";
    default:
      return type;
  }
}

export function getLineItemTypeLabel(type) {
  switch (type) {
    case INVOICE_LINE_ITEM_TYPE.CONSULTATION:
      return "Consultation";
    case INVOICE_LINE_ITEM_TYPE.LABORATORY:
      return "Laboratory";
    case INVOICE_LINE_ITEM_TYPE.RADIOLOGY:
      return "Radiology";
    case INVOICE_LINE_ITEM_TYPE.PHARMACY:
      return "Pharmacy";
    case INVOICE_LINE_ITEM_TYPE.PROCEDURE:
      return "Procedure";
    case INVOICE_LINE_ITEM_TYPE.ROOM_CHARGE:
      return "Room Charge";
    case INVOICE_LINE_ITEM_TYPE.SURGERY:
      return "Surgery";
    case INVOICE_LINE_ITEM_TYPE.OTHER:
      return "Other";
    default:
      return type;
  }
}
