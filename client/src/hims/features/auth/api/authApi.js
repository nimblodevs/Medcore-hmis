import apiClient from "@/services/apiClient";

const BASE_URL = "/auth";

export const authApi = {
  login: (data) => apiClient.post(`${BASE_URL}/login`, data),
  logout: () => apiClient.post(`${BASE_URL}/logout`),
  refreshToken: (data) => apiClient.post(`${BASE_URL}/refresh-token`, data),
  changePassword: (data) => apiClient.post(`${BASE_URL}/change-password`, data),
  getCurrentUser: () => apiClient.get(`${BASE_URL}/me`)
};
