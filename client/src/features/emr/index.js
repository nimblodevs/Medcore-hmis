// EMR Module Exports

// API
export * from './api/emr.api';

// Hooks
export * from './hooks/useEmr';

// Pages
export { EmrDashboardPage } from './pages/EmrDashboardPage';
export { EmrEncounterWorkspacePage } from './pages/EmrEncounterWorkspacePage';

// Shared Components
export * from './components/shared/EmrComponents';

// Feature Components
export { TriageForm } from './components/triage/TriageForm';
export { VitalsForm } from './components/vitals/VitalsForm';
export { SoapNoteForm } from './components/notes/SoapNoteForm';
export { DiagnosisForm } from './components/diagnoses/DiagnosisForm';
export { OrderForm } from './components/orders/OrderForm';
export { PrescriptionForm } from './components/prescriptions/PrescriptionForm';
export { DischargeSummaryForm } from './components/discharge/DischargeSummaryForm';
