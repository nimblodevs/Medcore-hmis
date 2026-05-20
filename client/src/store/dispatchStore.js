import { create } from "zustand";
import { generateDispatchNoteNo } from "../services/referenceApi";

const seedDispatches = [
  {
    id: "DSP-20260410-0001",
    providerAccount: "ACC-2024-0001",
    providerName: "Jubilee Health Insurance",
    providerType: "Insurance",
    contactPerson: "Grace Wanjiru",
    email: "claims@jubileehealth.co.ke",
    address: "Jubilee Insurance House, Wabera St, Nairobi",
    phone: "0722 100 200",
    invoiceIds: ["INV-20260301-HIST1", "INV-20260310-HIST2", "INV-20260318-HIST3"],
    invoiceSnapshots: [
      { id: "INV-20260301-HIST1", patientName: "Mr Peter Njoroge Kamau", uhid: "UHID-000180", schemeName: "Jubilee Gold Plan", memberNo: "JBL-180-G", finalizedAt: "2026-03-01T10:00:00", grandTotal: 28000, itemCount: 4, paymentMethod: "Insurance", notes: "" },
      { id: "INV-20260310-HIST2", patientName: "Ms Jane Wanjiru Mwangi", uhid: "UHID-000190", schemeName: "Jubilee Silver Plan", memberNo: "JBL-190-S", finalizedAt: "2026-03-10T09:00:00", grandTotal: 35000, itemCount: 6, paymentMethod: "Insurance", notes: "Pre-auth ref: JBL-PRE-00190" },
      { id: "INV-20260318-HIST3", patientName: "Mr Ali Hassan Osman",   uhid: "UHID-000195", schemeName: "Jubilee Gold Plan", memberNo: "JBL-195-G", finalizedAt: "2026-03-18T11:00:00", grandTotal: 22000, itemCount: 3, paymentMethod: "Insurance", notes: "" },
    ],
    totalAmount: 85000,
    invoiceCount: 3,
    dispatchMethod: "Email",
    referenceNumber: "JBL-DSP-2026-0034",
    status: "Settled",
    createdAt: "2026-04-10T09:00:00",
    dispatchedAt: "2026-04-10T10:00:00",
    acknowledgedAt: "2026-04-12T14:00:00",
    settledAt: "2026-04-15T10:30:00",
    disputedAt: null,
    notes: "Q1 2026 claims batch — March services. Three inpatient referral invoices.",
    dispatchedBy: "Dr. Smith",
  },
  {
    id: "DSP-20260418-0002",
    providerAccount: "ACC-2024-0002",
    providerName: "AAR Healthcare",
    providerType: "Insurance",
    contactPerson: "Martin Otieno",
    email: "providers@aar.co.ke",
    address: "AAR House, Upper Hill, Nairobi",
    phone: "0733 200 300",
    invoiceIds: ["INV-20260312-HIST4", "INV-20260325-HIST5"],
    invoiceSnapshots: [
      { id: "INV-20260312-HIST4", patientName: "Ms Mary Auma Odhiambo", uhid: "UHID-000210", schemeName: "AAR Executive Cover", memberNo: "AAR-210-EX", finalizedAt: "2026-03-12T13:00:00", grandTotal: 18500, itemCount: 3, paymentMethod: "Insurance", notes: "" },
      { id: "INV-20260325-HIST5", patientName: "Mr John Mwenda Kithinji", uhid: "UHID-000218", schemeName: "AAR Executive Cover", memberNo: "AAR-218-EX", finalizedAt: "2026-03-25T10:30:00", grandTotal: 24000, itemCount: 4, paymentMethod: "Insurance", notes: "Specialist referral" },
    ],
    totalAmount: 42500,
    invoiceCount: 2,
    dispatchMethod: "Email",
    referenceNumber: "AAR-CLM-2026-0089",
    status: "Acknowledged",
    createdAt: "2026-04-18T08:00:00",
    dispatchedAt: "2026-04-18T09:00:00",
    acknowledgedAt: "2026-04-22T11:00:00",
    settledAt: null,
    disputedAt: null,
    notes: "March 2026 claims. Payment expected within 30 days.",
    dispatchedBy: "Dr. Smith",
  },
  {
    id: "DSP-20260503-0003",
    providerAccount: "ACC-2024-0004",
    providerName: "Safaricom PLC",
    providerType: "Corporate",
    contactPerson: "James Mwangi",
    email: "medical@safaricom.co.ke",
    address: "Safaricom House, Westlands, Nairobi",
    phone: "0722 400 500",
    invoiceIds: ["INV-20260401-HIST6", "INV-20260412-HIST7"],
    invoiceSnapshots: [
      { id: "INV-20260401-HIST6", patientName: "Mr David Njoroge Wachira", uhid: "UHID-000241", schemeName: "Safaricom Staff Medical", memberNo: "SCOM-241", finalizedAt: "2026-04-01T09:30:00", grandTotal: 55000, itemCount: 5, paymentMethod: "Corporate", notes: "Executive health screening" },
      { id: "INV-20260412-HIST7", patientName: "Ms Ann Waithera Gichuki",  uhid: "UHID-000255", schemeName: "Safaricom Staff Medical", memberNo: "SCOM-255", finalizedAt: "2026-04-12T11:00:00", grandTotal: 70000, itemCount: 7, paymentMethod: "Corporate", notes: "" },
    ],
    totalAmount: 125000,
    invoiceCount: 2,
    dispatchMethod: "Courier",
    referenceNumber: "SCOM-MED-2026-0501",
    status: "Dispatched",
    createdAt: "2026-05-03T10:00:00",
    dispatchedAt: "2026-05-03T12:00:00",
    acknowledgedAt: null,
    settledAt: null,
    disputedAt: null,
    notes: "April staff medical invoices via courier. Waybill #: KE-2026-88120.",
    dispatchedBy: "Dr. Smith",
  },
  {
    id: "DSP-20260512-0004",
    providerAccount: "ACC-2024-0003",
    providerName: "Kenya Airways Staff Union",
    providerType: "Corporate",
    contactPerson: "Alice Kamau",
    email: "welfare@kenyaairways.com",
    address: "JKIA Terminal 2, Nairobi",
    phone: "0711 300 400",
    invoiceIds: ["INV-20260404-HIST8"],
    invoiceSnapshots: [
      { id: "INV-20260404-HIST8", patientName: "Capt. Martin Oloo Adera", uhid: "UHID-000265", schemeName: "KQ Staff Medical Scheme", memberNo: "KQ-265", finalizedAt: "2026-04-04T14:00:00", grandTotal: 38200, itemCount: 3, paymentMethod: "Corporate", notes: "Annual aviation medical" },
    ],
    totalAmount: 38200,
    invoiceCount: 1,
    dispatchMethod: "Hand Delivery",
    referenceNumber: "",
    status: "Draft",
    createdAt: "2026-05-12T15:00:00",
    dispatchedAt: null,
    acknowledgedAt: null,
    settledAt: null,
    disputedAt: null,
    notes: "",
    dispatchedBy: "Dr. Smith",
  },
];

export const generateDispatchId = () => {
  return generateDispatchNoteNo();
};

export const useDispatchStore = create((set) => ({
  dispatches: seedDispatches,

  addDispatch: (dispatch) =>
    set((state) => ({ dispatches: [dispatch, ...state.dispatches] })),

  updateDispatch: (id, updates) =>
    set((state) => ({
      dispatches: state.dispatches.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),

  deleteDispatch: (id) =>
    set((state) => ({
      dispatches: state.dispatches.filter((d) => d.id !== id),
    })),
}));
