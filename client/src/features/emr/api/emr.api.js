import axios from 'axios';

const API_BASE = '/api/emr';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Encounter APIs
export const encounterApi = {
  list: (params) => api.get('/encounters', { params }),
  getById: (id) => api.get(`/encounters/${id}`),
  getByVisit: (visitId) => api.get(`/visits/${visitId}/encounter`),
  create: (data) => api.post('/encounters', data),
  update: (id, data) => api.patch(`/encounters/${id}`, data),
  close: (id, reason) => api.post(`/encounters/${id}/close`, { reason }),
  cancel: (id, reason) => api.post(`/encounters/${id}/cancel`, { reason }),
};

// Triage APIs
export const triageApi = {
  list: (encounterId) => api.get(`/encounters/${encounterId}/triage`),
  create: (encounterId, data) => api.post(`/encounters/${encounterId}/triage`, data),
};

// Vitals APIs
export const vitalsApi = {
  list: (encounterId) => api.get(`/encounters/${encounterId}/vitals`),
  create: (encounterId, data) => api.post(`/encounters/${encounterId}/vitals`, data),
};

// Allergy APIs
export const allergyApi = {
  list: (patientId) => api.get(`/patients/${patientId}/allergies`),
  create: (encounterId, data) => api.post(`/encounters/${encounterId}/allergies`, data),
  resolve: (id, reason) => api.post(`/allergies/${id}/resolve`, { reason }),
};

// Clinical Note APIs
export const noteApi = {
  list: (encounterId) => api.get(`/encounters/${encounterId}/notes`),
  getById: (id) => api.get(`/notes/${id}`),
  create: (encounterId, data) => api.post(`/encounters/${encounterId}/notes`, data),
  update: (id, data) => api.patch(`/notes/${id}`, data),
  sign: (id) => api.post(`/notes/${id}/sign`),
  amend: (id, reason) => api.post(`/notes/${id}/amend`, { reason }),
  void: (id, reason) => api.post(`/notes/${id}/void`, { reason }),
};

// Diagnosis APIs
export const diagnosisApi = {
  list: (encounterId) => api.get(`/encounters/${encounterId}/diagnoses`),
  create: (encounterId, data) => api.post(`/encounters/${encounterId}/diagnoses`, data),
  update: (id, data) => api.patch(`/diagnoses/${id}`, data),
  delete: (id) => api.delete(`/diagnoses/${id}`),
};

// Order APIs
export const orderApi = {
  list: (encounterId) => api.get(`/encounters/${encounterId}/orders`),
  create: (encounterId, data) => api.post(`/encounters/${encounterId}/orders`, data),
  submit: (id) => api.post(`/orders/${id}/submit`),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
};

// Prescription APIs
export const prescriptionApi = {
  list: (encounterId) => api.get(`/encounters/${encounterId}/prescriptions`),
  create: (encounterId, data) => api.post(`/encounters/${encounterId}/prescriptions`, data),
  cancel: (id, reason) => api.post(`/prescriptions/${id}/cancel`, { reason }),
  sendToPharmacy: (id) => api.post(`/prescriptions/${id}/send-to-pharmacy`),
};

// Discharge Summary APIs
export const dischargeApi = {
  get: (encounterId) => api.get(`/encounters/${encounterId}/discharge-summary`),
  create: (encounterId, data) => api.post(`/encounters/${encounterId}/discharge-summary`, data),
  update: (id, data) => api.patch(`/discharge-summaries/${id}`, data),
  sign: (id) => api.post(`/discharge-summaries/${id}/sign`),
};

// Report APIs
export const reportApi = {
  encounters: (params) => api.get('/reports/encounters', { params }),
  diagnoses: (params) => api.get('/reports/diagnoses', { params }),
  orders: (params) => api.get('/reports/orders', { params }),
  discharges: (params) => api.get('/reports/discharges', { params }),
};
