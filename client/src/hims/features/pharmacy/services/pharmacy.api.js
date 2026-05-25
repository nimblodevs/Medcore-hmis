import axios from 'axios';

const API_BASE = '/api/pharmacy';

/**
 * Drug Category API
 */
export const drugCategoryApi = {
  getAll: (params) => axios.get(`${API_BASE}/drug-categories`, { params }),
  getById: (id) => axios.get(`${API_BASE}/drug-categories/${id}`),
  create: (data) => axios.post(`${API_BASE}/drug-categories`, data),
  update: (id, data) => axios.patch(`${API_BASE}/drug-categories/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/drug-categories/${id}`),
};

/**
 * Drug API
 */
export const drugApi = {
  getAll: (params) => axios.get(`${API_BASE}/drugs`, { params }),
  getById: (id) => axios.get(`${API_BASE}/drugs/${id}`),
  create: (data) => axios.post(`${API_BASE}/drugs`, data),
  update: (id, data) => axios.patch(`${API_BASE}/drugs/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/drugs/${id}`),
  getLowStock: (params) => axios.get(`${API_BASE}/drugs/low-stock`, { params }),
  getExpiring: (params) => axios.get(`${API_BASE}/drugs/expiring`, { params }),
  search: (query) => axios.get(`${API_BASE}/drugs/search`, { params: { q: query } }),
};

/**
 * Drug Batch API
 */
export const batchApi = {
  getAll: (params) => axios.get(`${API_BASE}/batches`, { params }),
  getById: (id) => axios.get(`${API_BASE}/batches/${id}`),
  create: (data) => axios.post(`${API_BASE}/batches`, data),
  update: (id, data) => axios.patch(`${API_BASE}/batches/${id}`, data),
  getByDrug: (drugId, params) => axios.get(`${API_BASE}/drugs/${drugId}/batches`, { params }),
};

/**
 * Pharmacy Store API
 */
export const storeApi = {
  getAll: (params) => axios.get(`${API_BASE}/stores`, { params }),
  getById: (id) => axios.get(`${API_BASE}/stores/${id}`),
  create: (data) => axios.post(`${API_BASE}/stores`, data),
  update: (id, data) => axios.patch(`${API_BASE}/stores/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/stores/${id}`),
  getStock: (storeId, params) => axios.get(`${API_BASE}/stores/${storeId}/stock`, { params }),
};

/**
 * Prescription API
 */
export const prescriptionApi = {
  getAll: (params) => axios.get(`${API_BASE}/prescriptions`, { params }),
  getById: (id) => axios.get(`${API_BASE}/prescriptions/${id}`),
  create: (data) => axios.post(`${API_BASE}/prescriptions`, data),
  update: (id, data) => axios.patch(`${API_BASE}/prescriptions/${id}`, data),
  cancel: (id) => axios.patch(`${API_BASE}/prescriptions/${id}/cancel`),
  getByPatient: (patientId, params) => axios.get(`${API_BASE}/patients/${patientId}/prescriptions`, { params }),
};

/**
 * Dispense API
 */
export const dispenseApi = {
  getAll: (params) => axios.get(`${API_BASE}/dispenses`, { params }),
  getById: (id) => axios.get(`${API_BASE}/dispenses/${id}`),
  create: (data) => axios.post(`${API_BASE}/dispenses`, data),
  getByPrescription: (prescriptionId) => axios.get(`${API_BASE}/prescriptions/${prescriptionId}/dispenses`),
  getByPatient: (patientId, params) => axios.get(`${API_BASE}/patients/${patientId}/dispenses`, { params }),
};

/**
 * Supplier API
 */
export const supplierApi = {
  getAll: (params) => axios.get(`${API_BASE}/suppliers`, { params }),
  getById: (id) => axios.get(`${API_BASE}/suppliers/${id}`),
  create: (data) => axios.post(`${API_BASE}/suppliers`, data),
  update: (id, data) => axios.patch(`${API_BASE}/suppliers/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/suppliers/${id}`),
};

/**
 * Purchase Order API
 */
export const purchaseOrderApi = {
  getAll: (params) => axios.get(`${API_BASE}/purchase-orders`, { params }),
  getById: (id) => axios.get(`${API_BASE}/purchase-orders/${id}`),
  create: (data) => axios.post(`${API_BASE}/purchase-orders`, data),
  submit: (id) => axios.post(`${API_BASE}/purchase-orders/${id}/submit`),
  approve: (id) => axios.post(`${API_BASE}/purchase-orders/${id}/approve`),
  cancel: (id) => axios.post(`${API_BASE}/purchase-orders/${id}/cancel`),
};

/**
 * Goods Received Note API
 */
export const grnApi = {
  create: (data) => axios.post(`${API_BASE}/grn`, data),
  getById: (id) => axios.get(`${API_BASE}/grn/${id}`),
  getByPurchaseOrder: (poId) => axios.get(`${API_BASE}/purchase-orders/${poId}/grn`),
};

/**
 * Stock Movement API
 */
export const stockMovementApi = {
  getAll: (params) => axios.get(`${API_BASE}/stock-movements`, { params }),
  getByDrug: (drugId, params) => axios.get(`${API_BASE}/drugs/${drugId}/stock-movements`, { params }),
  getByStore: (storeId, params) => axios.get(`${API_BASE}/stores/${storeId}/stock-movements`, { params }),
};
