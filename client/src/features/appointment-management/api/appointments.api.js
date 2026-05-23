import apiClient from "../../../services/api";

const BASE_URL = "/api/appointments";

export const appointmentsApi = {
  // Appointments
  list: async (params = {}) => {
    const response = await apiClient.get(BASE_URL, { params });
    return response.data;
  },

  get: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post(BASE_URL, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  confirm: async (id, data = {}) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/confirm`, data);
    return response.data;
  },

  cancel: async (id, data) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/cancel`, data);
    return response.data;
  },

  reschedule: async (id, data) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/reschedule`, data);
    return response.data;
  },

  checkIn: async (id, data = {}) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/check-in`, data);
    return response.data;
  },

  noShow: async (id, data = {}) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/no-show`, data);
    return response.data;
  },

  complete: async (id, data = {}) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/complete`, data);
    return response.data;
  },

  // Summary
  getTodaySummary: async () => {
    const response = await apiClient.get(`${BASE_URL}/today/summary`);
    return response.data;
  }
};

export default appointmentsApi;
