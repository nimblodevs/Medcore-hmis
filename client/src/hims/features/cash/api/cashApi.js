import apiClient from "@/services/apiClient";

const BASE_URL = "/api/cash";

export const cashApi = {
  // Cash Counter endpoints
  getCounters: (params) => apiClient.get(`${BASE_URL}/counters`, { params }),
  getCounter: (id) => apiClient.get(`${BASE_URL}/counters/${id}`),
  createCounter: (data) => apiClient.post(`${BASE_URL}/counters`, data),
  updateCounter: (id, data) => apiClient.put(`${BASE_URL}/counters/${id}`, data),
  deleteCounter: (id) => apiClient.delete(`${BASE_URL}/counters/${id}`),

  // Cashier Profile endpoints
  getCashierProfiles: (params) => apiClient.get(`${BASE_URL}/cashiers`, { params }),
  getCashierProfile: (id) => apiClient.get(`${BASE_URL}/cashiers/${id}`),
  getCashierProfileByUser: () => apiClient.get(`${BASE_URL}/cashiers/me`),
  createCashierProfile: (data) => apiClient.post(`${BASE_URL}/cashiers`, data),
  updateCashierProfile: (id, data) => apiClient.put(`${BASE_URL}/cashiers/${id}`, data),
  deleteCashierProfile: (id) => apiClient.delete(`${BASE_URL}/cashiers/${id}`),

  // Cash Session endpoints
  getCashSessions: (params) => apiClient.get(`${BASE_URL}/sessions`, { params }),
  getCashSession: (id) => apiClient.get(`${BASE_URL}/sessions/${id}`),
  getOpenCashSession: () => apiClient.get(`${BASE_URL}/sessions/me`),
  openCashSession: (data) => apiClient.post(`${BASE_URL}/sessions/open`, data),
  closeCashSession: (id, data) => apiClient.post(`${BASE_URL}/sessions/${id}/close`, data),

  // Payment endpoints
  recordPayment: (data) => apiClient.post(`${BASE_URL}/payments`, data),

  // Refund endpoints
  requestRefund: (data) => apiClient.post(`${BASE_URL}/refunds`, data),
  approveRefund: (id, data) => apiClient.post(`${BASE_URL}/refunds/${id}/approve`, data),
  rejectRefund: (id, data) => apiClient.post(`${BASE_URL}/refunds/${id}/reject`, data),

  // Handover endpoints
  submitHandover: (data) => apiClient.post(`${BASE_URL}/handovers`, data),
  reviewHandover: (id, data) => apiClient.post(`${BASE_URL}/handovers/${id}/review`, data),

  // Dashboard stats
  getDashboardStats: (params) => apiClient.get(`${BASE_URL}/dashboard/stats`, { params })
};
