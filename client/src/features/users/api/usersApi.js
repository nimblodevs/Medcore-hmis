import apiClient from "@/services/apiClient";

const BASE_URL = "/api/users";

export const usersApi = {
  list: (params) => apiClient.get(BASE_URL, { params }),
  get: (id) => apiClient.get(`${BASE_URL}/${id}`),
  create: (data) => apiClient.post(BASE_URL, data),
  update: (id, data) => apiClient.patch(`${BASE_URL}/${id}`, data),
  deactivate: (id) => apiClient.post(`${BASE_URL}/${id}/deactivate`),
  activate: (id) => apiClient.post(`${BASE_URL}/${id}/activate`),
  resetPassword: (id, data) => apiClient.post(`${BASE_URL}/${id}/reset-password`, data)
};
