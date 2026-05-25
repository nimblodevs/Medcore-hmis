import { SERVICE_POINTS } from "./mockDebtors";

export { SERVICE_POINTS };

export const SERVICE_CATALOG = [
  { id: "SC-001", servicePoint: "Consultation (OPD)", name: "General Consultation", defaultPrice: 1500 },
  { id: "SC-002", servicePoint: "Consultation (OPD)", name: "Specialist Consultation", defaultPrice: 3500 },
  { id: "SC-003", servicePoint: "Consultation (OPD)", name: "Follow-up Consultation", defaultPrice: 800 },
  { id: "SC-004", servicePoint: "Consultation (OPD)", name: "Triage Assessment", defaultPrice: 500 },

  { id: "SC-010", servicePoint: "Laboratory", name: "Complete Blood Count (CBC)", defaultPrice: 800 },
  { id: "SC-011", servicePoint: "Laboratory", name: "Blood Glucose (RBS/FBS)", defaultPrice: 350 },
  { id: "SC-012", servicePoint: "Laboratory", name: "Urinalysis", defaultPrice: 500 },
  { id: "SC-013", servicePoint: "Laboratory", name: "Malaria RDT", defaultPrice: 500 },
  { id: "SC-014", servicePoint: "Laboratory", name: "HIV Test (Rapid)", defaultPrice: 750 },
  { id: "SC-015", servicePoint: "Laboratory", name: "Liver Function Tests (LFT)", defaultPrice: 2200 },
  { id: "SC-016", servicePoint: "Laboratory", name: "Renal Function Tests (RFT)", defaultPrice: 2200 },
  { id: "SC-017", servicePoint: "Laboratory", name: "Thyroid Panel (TSH/T3/T4)", defaultPrice: 3500 },
  { id: "SC-018", servicePoint: "Laboratory", name: "Lipid Profile", defaultPrice: 2000 },
  { id: "SC-019", servicePoint: "Laboratory", name: "Widal Test", defaultPrice: 600 },
  { id: "SC-020", servicePoint: "Laboratory", name: "HBA1C", defaultPrice: 1800 },

  { id: "SC-030", servicePoint: "Radiology / Imaging", name: "Chest X-Ray (PA)", defaultPrice: 2500 },
  { id: "SC-031", servicePoint: "Radiology / Imaging", name: "Abdominal X-Ray", defaultPrice: 2500 },
  { id: "SC-032", servicePoint: "Radiology / Imaging", name: "Abdominal Ultrasound", defaultPrice: 3500 },
  { id: "SC-033", servicePoint: "Radiology / Imaging", name: "Pelvic Ultrasound", defaultPrice: 3500 },
  { id: "SC-034", servicePoint: "Radiology / Imaging", name: "Obstetric Ultrasound", defaultPrice: 3500 },
  { id: "SC-035", servicePoint: "Radiology / Imaging", name: "ECG (12-lead)", defaultPrice: 1200 },

  { id: "SC-040", servicePoint: "Pharmacy", name: "Amoxicillin 500mg (14 caps)", defaultPrice: 350 },
  { id: "SC-041", servicePoint: "Pharmacy", name: "Metronidazole 400mg (21 tabs)", defaultPrice: 280 },
  { id: "SC-042", servicePoint: "Pharmacy", name: "Paracetamol 500mg (24 tabs)", defaultPrice: 120 },
  { id: "SC-043", servicePoint: "Pharmacy", name: "Ibuprofen 400mg (30 tabs)", defaultPrice: 250 },
  { id: "SC-044", servicePoint: "Pharmacy", name: "Co-Artemether 80/480mg (24 tabs)", defaultPrice: 850 },
  { id: "SC-045", servicePoint: "Pharmacy", name: "ORS Sachet (x5)", defaultPrice: 150 },
  { id: "SC-046", servicePoint: "Pharmacy", name: "Omeprazole 20mg (30 caps)", defaultPrice: 600 },
  { id: "SC-047", servicePoint: "Pharmacy", name: "Vitamin C 1000mg (30 tabs)", defaultPrice: 450 },
  { id: "SC-048", servicePoint: "Pharmacy", name: "Azithromycin 500mg (3 tabs)", defaultPrice: 480 },
  { id: "SC-049", servicePoint: "Pharmacy", name: "Doxycycline 100mg (14 tabs)", defaultPrice: 320 },

  { id: "SC-050", servicePoint: "Procedures / Theatre", name: "IV Cannula Insertion", defaultPrice: 500 },
  { id: "SC-051", servicePoint: "Procedures / Theatre", name: "IV Fluids 500ml (Normal Saline)", defaultPrice: 800 },
  { id: "SC-052", servicePoint: "Procedures / Theatre", name: "Wound Dressing", defaultPrice: 600 },
  { id: "SC-053", servicePoint: "Procedures / Theatre", name: "Suturing (Simple, <3cm)", defaultPrice: 1500 },
  { id: "SC-054", servicePoint: "Procedures / Theatre", name: "IM Injection", defaultPrice: 300 },
  { id: "SC-055", servicePoint: "Procedures / Theatre", name: "Nebulisation", defaultPrice: 800 },

  { id: "SC-060", servicePoint: "Physiotherapy", name: "Initial Assessment", defaultPrice: 2000 },
  { id: "SC-061", servicePoint: "Physiotherapy", name: "Therapy Session", defaultPrice: 1500 },
  { id: "SC-062", servicePoint: "Physiotherapy", name: "TENS Therapy", defaultPrice: 1200 },

  { id: "SC-070", servicePoint: "Dental", name: "Dental Consultation", defaultPrice: 1000 },
  { id: "SC-071", servicePoint: "Dental", name: "Simple Extraction", defaultPrice: 2000 },
  { id: "SC-072", servicePoint: "Dental", name: "Surgical Extraction", defaultPrice: 5000 },
  { id: "SC-073", servicePoint: "Dental", name: "Scaling & Polishing", defaultPrice: 3000 },
  { id: "SC-074", servicePoint: "Dental", name: "Amalgam Filling", defaultPrice: 2500 },

  { id: "SC-080", servicePoint: "Optical", name: "Visual Acuity Test", defaultPrice: 500 },
  { id: "SC-081", servicePoint: "Optical", name: "Refraction Test", defaultPrice: 1000 },
  { id: "SC-082", servicePoint: "Optical", name: "Spectacles Prescription", defaultPrice: 500 },

  { id: "SC-090", servicePoint: "Casualty / Emergency", name: "Emergency Consultation", defaultPrice: 2500 },
  { id: "SC-091", servicePoint: "Casualty / Emergency", name: "Triage (Emergency)", defaultPrice: 500 },
  { id: "SC-092", servicePoint: "Casualty / Emergency", name: "Resuscitation", defaultPrice: 5000 },

  { id: "SC-100", servicePoint: "Inpatient (IPD)", name: "General Ward (per day)", defaultPrice: 5000 },
  { id: "SC-101", servicePoint: "Inpatient (IPD)", name: "Private Room (per day)", defaultPrice: 12000 },
  { id: "SC-102", servicePoint: "Inpatient (IPD)", name: "Nursing Care (per shift)", defaultPrice: 2000 },

  { id: "SC-110", servicePoint: "Maternity", name: "Antenatal Consultation", defaultPrice: 1500 },
  { id: "SC-111", servicePoint: "Maternity", name: "Normal Delivery", defaultPrice: 25000 },
  { id: "SC-112", servicePoint: "Maternity", name: "Caesarean Section", defaultPrice: 80000 },
];

export const getItemsByServicePoint = (point) =>
  SERVICE_CATALOG.filter((s) => s.servicePoint === point);
