import apiClient from '../../../services/apiClient';

const BASE_URL = '/api/credit-control';

export const creditControlApi = {
  // Cases
  getCases: (params) => apiClient.get(`${BASE_URL}/cases`, { params }),
  getCase: (id) => apiClient.get(`${BASE_URL}/cases/${id}`),
  createCase: (data) => apiClient.post(`${BASE_URL}/cases`, data),
  updateCase: (id, data) => apiClient.patch(`${BASE_URL}/cases/${id}`, data),
  assignCase: (id, data) => apiClient.post(`${BASE_URL}/cases/${id}/assign`, data),
  closeCase: (id, data) => apiClient.post(`${BASE_URL}/cases/${id}/close`, data),
  reopenCase: (id) => apiClient.post(`${BASE_URL}/cases/${id}/reopen`),

  // Follow-ups
  getFollowUps: (caseId, params) => apiClient.get(`${BASE_URL}/cases/${caseId}/follow-ups`, { params }),
  createFollowUp: (caseId, data) => apiClient.post(`${BASE_URL}/cases/${caseId}/follow-ups`, data),
  getDueToday: () => apiClient.get(`${BASE_URL}/follow-ups/due-today`),
  getOverdue: () => apiClient.get(`${BASE_URL}/follow-ups/overdue`),

  // Promises
  getPromises: (caseId, params) => apiClient.get(`${BASE_URL}/cases/${caseId}/promises`, { params }),
  createPromise: (caseId, data) => apiClient.post(`${BASE_URL}/cases/${caseId}/promises`, data),
  updatePromise: (id, data) => apiClient.patch(`${BASE_URL}/promises/${id}`, data),
  markFulfilled: (id, data) => apiClient.post(`${BASE_URL}/promises/${id}/mark-fulfilled`, data),

  // Holds
  getHolds: (params) => apiClient.get(`${BASE_URL}/holds`, { params }),
  recommendHold: (caseId, data) => apiClient.post(`${BASE_URL}/cases/${caseId}/holds/recommend`, data),
  approveHold: (id) => apiClient.post(`${BASE_URL}/holds/${id}/approve`),
  rejectHold: (id, data) => apiClient.post(`${BASE_URL}/holds/${id}/reject`, data),
  releaseHold: (id, data) => apiClient.post(`${BASE_URL}/holds/${id}/release`, data),

  // Disputes
  getDisputes: (params) => apiClient.get(`${BASE_URL}/disputes`, { params }),
  createDispute: (caseId, data) => apiClient.post(`${BASE_URL}/cases/${caseId}/disputes`, data),
  resolveDispute: (id, data) => apiClient.post(`${BASE_URL}/disputes/${id}/resolve`, data),
  cancelDispute: (id) => apiClient.post(`${BASE_URL}/disputes/${id}/cancel`),

  // Write-offs
  getWriteOffs: (params) => apiClient.get(`${BASE_URL}/write-offs`, { params }),
  recommendWriteOff: (caseId, data) => apiClient.post(`${BASE_URL}/cases/${caseId}/write-offs/recommend`, data),
  approveWriteOff: (id) => apiClient.post(`${BASE_URL}/write-offs/${id}/approve`),
  rejectWriteOff: (id, data) => apiClient.post(`${BASE_URL}/write-offs/${id}/reject`, data),
  postWriteOff: (id) => apiClient.post(`${BASE_URL}/write-offs/${id}/post`),

  // Aging & Risk
  getAgingAccounts: (params) => apiClient.get(`${BASE_URL}/aging/accounts`, { params }),
  getAgingInvoices: (params) => apiClient.get(`${BASE_URL}/aging/invoices`, { params }),
  recalculateAging: () => apiClient.post(`${BASE_URL}/aging/recalculate`),
  getRiskAccounts: (params) => apiClient.get(`${BASE_URL}/risk/accounts`, { params }),

  // Reports
  getDashboard: () => apiClient.get(`${BASE_URL}/reports/dashboard`),
  getAgingReport: (params) => apiClient.get(`${BASE_URL}/reports/aging`, { params }),
  getCollectorWorkload: (params) => apiClient.get(`${BASE_URL}/reports/collector-workload`, { params }),
  getPromisesReport: (params) => apiClient.get(`${BASE_URL}/reports/promises`, { params }),
  getHoldsReport: (params) => apiClient.get(`${BASE_URL}/reports/holds`, { params }),
  getDisputesReport: (params) => apiClient.get(`${BASE_URL}/reports/disputes`, { params }),
  getWriteOffsReport: (params) => apiClient.get(`${BASE_URL}/reports/write-offs`, { params }),
  getOverdueAccounts: (params) => apiClient.get(`${BASE_URL}/reports/overdue-accounts`, { params }),
};
