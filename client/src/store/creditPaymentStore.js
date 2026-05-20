import { create } from "zustand";

const seedPayments = [
  {
    id: "PAY-20260415-0001",
    providerAccount: "ACC-2024-0001",
    providerName: "Jubilee Health Insurance",
    providerType: "Insurance",
    amount: 85000,
    method: "EFT",
    referenceNumber: "EFT-JBL-04150001",
    providerReference: "JBL-DSP-2026-0034",
    dispatchReference: "DSP-20260410-0001",
    invoiceIds: ["INV-20260301-HIST1", "INV-20260310-HIST2", "INV-20260318-HIST3"],
    invoiceAllocations: [
      { invoiceId: "INV-20260301-HIST1", patientName: "Mr Peter Njoroge Kamau", uhid: "UHID-000180", invoiceDate: "2026-03-01T10:00:00", amount: 28000 },
      { invoiceId: "INV-20260310-HIST2", patientName: "Ms Jane Wanjiru Mwangi", uhid: "UHID-000190", invoiceDate: "2026-03-10T09:00:00", amount: 35000 },
      { invoiceId: "INV-20260318-HIST3", patientName: "Mr Ali Hassan Osman", uhid: "UHID-000195", invoiceDate: "2026-03-18T11:00:00", amount: 22000 },
    ],
    invoiceCount: 3,
    notes: "April 2026 claims batch settlement.",
    recordedAt: "2026-04-15T10:30:00",
  },
  {
    id: "PAY-20260420-0002",
    providerAccount: "ACC-2024-0002",
    providerName: "AAR Healthcare",
    providerType: "Insurance",
    amount: 42500,
    method: "Cheque",
    referenceNumber: "CHQ-AAR-0042890",
    providerReference: "AAR-CLM-2026-0089",
    dispatchReference: "DSP-20260418-0002",
    invoiceIds: ["INV-20260312-HIST4", "INV-20260325-HIST5"],
    invoiceAllocations: [
      { invoiceId: "INV-20260312-HIST4", patientName: "Ms Mary Auma Odhiambo", uhid: "UHID-000210", invoiceDate: "2026-03-12T13:00:00", amount: 18500 },
      { invoiceId: "INV-20260325-HIST5", patientName: "Mr John Mwenda Kithinji", uhid: "UHID-000218", invoiceDate: "2026-03-25T10:30:00", amount: 24000 },
    ],
    invoiceCount: 2,
    notes: "Q1 2026 partial settlement.",
    recordedAt: "2026-04-20T14:00:00",
  },
  {
    id: "PAY-20260502-0003",
    providerAccount: "ACC-2024-0004",
    providerName: "Safaricom PLC",
    providerType: "Corporate",
    amount: 125000,
    method: "RTGS",
    referenceNumber: "RTGS-SCOM-20260502",
    providerReference: "SCOM-MED-2026-0501",
    dispatchReference: "DSP-20260503-0003",
    invoiceIds: ["INV-20260401-HIST6", "INV-20260412-HIST7"],
    invoiceAllocations: [
      { invoiceId: "INV-20260401-HIST6", patientName: "Mr David Njoroge Wachira", uhid: "UHID-000241", invoiceDate: "2026-04-01T09:30:00", amount: 55000 },
      { invoiceId: "INV-20260412-HIST7", patientName: "Ms Ann Waithera Gichuki", uhid: "UHID-000255", invoiceDate: "2026-04-12T11:00:00", amount: 70000 },
    ],
    invoiceCount: 2,
    notes: "May staff medical remittance.",
    recordedAt: "2026-05-02T09:15:00",
  },
  {
    id: "PAY-20260510-0004",
    providerAccount: "ACC-2024-0003",
    providerName: "Kenya Airways Staff Union",
    providerType: "Corporate",
    amount: 38200,
    method: "EFT",
    referenceNumber: "EFT-KQ-20260510",
    providerReference: "—",
    dispatchReference: "DSP-20260512-0004",
    invoiceIds: ["INV-20260404-HIST8"],
    invoiceAllocations: [
      { invoiceId: "INV-20260404-HIST8", patientName: "Capt. Martin Oloo Adera", uhid: "UHID-000265", invoiceDate: "2026-04-04T14:00:00", amount: 38200 },
    ],
    invoiceCount: 1,
    notes: "",
    recordedAt: "2026-05-10T11:45:00",
  },
];

let paymentCounter = seedPayments.length + 1;

export const generatePaymentId = () => {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const seq = String(paymentCounter++).padStart(4, "0");
  return `PAY-${dateStr}-${seq}`;
};

export const useCreditPaymentStore = create((set) => ({
  payments: seedPayments,

  addPayment: (payment) =>
    set((state) => ({ payments: [payment, ...state.payments] })),
}));
