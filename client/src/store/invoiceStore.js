import { create } from "zustand";

const seed = [
  {
    id: "INV-20260501-0001",
    patient: {
      uhid: "UHID-000231",
      name: "Ms Amina Wanjiku Otieno",
      patientId: "PID-10045",
      gender: "Female",
      dob: "1994-08-12",
      paymentCategory: "NHIF",
      phone: "0712345678",
    },
    items: [
      { id: "i1", servicePoint: "Consultation (OPD)", description: "General Consultation", qty: 1, unitPrice: 1500, discount: 0, netAmount: 1500 },
      { id: "i2", servicePoint: "Laboratory", description: "Complete Blood Count (CBC)", qty: 1, unitPrice: 800, discount: 0, netAmount: 800 },
      { id: "i3", servicePoint: "Pharmacy", description: "Amoxicillin 500mg (14 caps)", qty: 1, unitPrice: 350, discount: 0, netAmount: 350 },
    ],
    subtotal: 2650,
    discountTotal: 0,
    copayment: 0,
    grandTotal: 2650,
    paymentMethod: "NHIF",
    providerAccount: null,
    status: "Paid",
    createdAt: "2026-05-01T09:30:00",
    finalizedAt: "2026-05-01T10:15:00",
    paidAt: "2026-05-01T10:20:00",
    notes: "",
  },
  {
    id: "INV-20260510-0002",
    patient: {
      uhid: "UHID-000271",
      name: "Mr Joshua Muturi Kamau",
      patientId: "PID-10075",
      gender: "Male",
      dob: "1980-01-15",
      paymentCategory: "Corporate",
      corporateName: "LOU Membership List",
      phone: "0713456789",
    },
    items: [
      { id: "i1", servicePoint: "Consultation (OPD)", description: "Specialist Consultation", qty: 1, unitPrice: 3500, discount: 0, netAmount: 3500 },
      { id: "i2", servicePoint: "Radiology / Imaging", description: "Chest X-Ray (PA)", qty: 1, unitPrice: 2500, discount: 0, netAmount: 2500 },
    ],
    subtotal: 6000,
    discountTotal: 0,
    copayment: 300,
    grandTotal: 6300,
    paymentMethod: "Corporate",
    providerAccount: "ACC-2024-0003",
    status: "Interim",
    createdAt: "2026-05-10T11:00:00",
    finalizedAt: null,
    paidAt: null,
    notes: "",
  },
  {
    id: "INV-20260512-0003",
    patient: {
      uhid: "UHID-000233",
      name: "Ms Caroline Atieno Achieng",
      patientId: "PID-10047",
      gender: "Female",
      dob: "1997-06-03",
      paymentCategory: "Cash",
      phone: "0733567890",
    },
    items: [
      { id: "i1", servicePoint: "Consultation (OPD)", description: "General Consultation", qty: 1, unitPrice: 1500, discount: 0, netAmount: 1500 },
      { id: "i2", servicePoint: "Laboratory", description: "Urinalysis", qty: 1, unitPrice: 500, discount: 0, netAmount: 500 },
      { id: "i3", servicePoint: "Pharmacy", description: "Metronidazole 400mg (21 tabs)", qty: 1, unitPrice: 280, discount: 0, netAmount: 280 },
      { id: "i4", servicePoint: "Pharmacy", description: "Paracetamol 500mg (24 tabs)", qty: 1, unitPrice: 120, discount: 0, netAmount: 120 },
    ],
    subtotal: 2400,
    discountTotal: 0,
    copayment: 0,
    grandTotal: 2400,
    paymentMethod: "Cash",
    providerAccount: null,
    status: "Final",
    createdAt: "2026-05-12T14:00:00",
    finalizedAt: "2026-05-12T15:30:00",
    paidAt: null,
    notes: "",
  },
  {
    id: "INV-20260515-0004",
    patient: {
      uhid: "UHID-000234",
      name: "Mr Daniel Mutua Kilonzo",
      patientId: "PID-10048",
      gender: "Male",
      dob: "1985-11-14",
      paymentCategory: "NHIF",
      phone: "0744678901",
    },
    items: [
      { id: "i1", servicePoint: "Consultation (OPD)", description: "General Consultation", qty: 1, unitPrice: 1500, discount: 0, netAmount: 1500 },
      { id: "i2", servicePoint: "Laboratory", description: "Blood Glucose (RBS/FBS)", qty: 1, unitPrice: 350, discount: 0, netAmount: 350 },
      { id: "i3", servicePoint: "Laboratory", description: "HBA1C", qty: 1, unitPrice: 1800, discount: 0, netAmount: 1800 },
      { id: "i4", servicePoint: "Pharmacy", description: "Omeprazole 20mg (30 caps)", qty: 1, unitPrice: 600, discount: 0, netAmount: 600 },
    ],
    subtotal: 4250,
    discountTotal: 0,
    copayment: 0,
    grandTotal: 4250,
    paymentMethod: "NHIF",
    providerAccount: null,
    status: "Paid",
    createdAt: "2026-05-15T08:45:00",
    finalizedAt: "2026-05-15T09:30:00",
    paidAt: "2026-05-15T09:35:00",
    notes: "Diabetic patient follow-up.",
  },
  {
    id: "INV-20260516-0005",
    patient: {
      uhid: "UHID-000232",
      name: "Mr Brian Kiptoo Mwangi",
      patientId: "PID-10046",
      gender: "Male",
      dob: "1989-03-21",
      paymentCategory: "Insurance",
      phone: "0722456789",
    },
    items: [
      { id: "i1", servicePoint: "Casualty / Emergency", description: "Emergency Consultation", qty: 1, unitPrice: 2500, discount: 0, netAmount: 2500 },
      { id: "i2", servicePoint: "Procedures / Theatre", description: "IV Cannula Insertion", qty: 1, unitPrice: 500, discount: 0, netAmount: 500 },
      { id: "i3", servicePoint: "Procedures / Theatre", description: "IV Fluids 500ml (Normal Saline)", qty: 2, unitPrice: 800, discount: 0, netAmount: 1600 },
    ],
    subtotal: 4600,
    discountTotal: 0,
    copayment: 0,
    grandTotal: 4600,
    paymentMethod: "Insurance",
    providerAccount: "ACC-2024-0002",
    status: "Cancelled",
    createdAt: "2026-05-16T16:00:00",
    finalizedAt: null,
    paidAt: null,
    notes: "Patient discharged AMA. Invoice cancelled.",
  },
];

let invoiceCounter = seed.length + 1;

export const generateInvoiceId = () => {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const seq = String(invoiceCounter++).padStart(4, "0");
  return `INV-${dateStr}-${seq}`;
};

export const useInvoiceStore = create((set) => ({
  invoices: seed,
  activeDraft: null,

  setActiveDraft: (draft) => set({ activeDraft: draft }),
  clearDraft: () => set({ activeDraft: null }),

  addInvoice: (invoice) =>
    set((state) => ({ invoices: [invoice, ...state.invoices], activeDraft: null })),

  updateInvoice: (id, updates) =>
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id ? { ...inv, ...updates } : inv
      ),
    })),
}));
