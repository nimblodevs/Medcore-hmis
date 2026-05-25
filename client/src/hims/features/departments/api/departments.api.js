import apiClient from "@/services/apiClient";

const BASE_URL = "/api/departments";

export const departmentsApi = {
  // Departments
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

  activate: async (id, reason) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/activate`, { reason });
    return response.data;
  },

  deactivate: async (id, reason) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/deactivate`, { reason });
    return response.data;
  },

  archive: async (id, reason) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/archive`, { reason });
    return response.data;
  },

  assignManager: async (id, managerId) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/manager`, { managerId });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await apiClient.get(`${BASE_URL}/dashboard-stats`);
    return response.data;
  },

  // Service Units
  listServiceUnits: async (departmentId, params = {}) => {
    const response = await apiClient.get(`${BASE_URL}/${departmentId}/service-units`, { params });
    return response.data;
  },

  getServiceUnit: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/service-units/${id}`);
    return response.data;
  },

  createServiceUnit: async (departmentId, data) => {
    const response = await apiClient.post(`${BASE_URL}/${departmentId}/service-units`, data);
    return response.data;
  },

  updateServiceUnit: async (id, data) => {
    const response = await apiClient.patch(`${BASE_URL}/service-units/${id}`, data);
    return response.data;
  },

  activateServiceUnit: async (id, reason) => {
    const response = await apiClient.post(`${BASE_URL}/service-units/${id}/activate`, { reason });
    return response.data;
  },

  deactivateServiceUnit: async (id, reason) => {
    const response = await apiClient.post(`${BASE_URL}/service-units/${id}/deactivate`, { reason });
    return response.data;
  },

  // User Assignments
  getDepartmentUsers: async (departmentId, params = {}) => {
    const response = await apiClient.get(`${BASE_URL}/${departmentId}/users`, { params });
    return response.data;
  },

  assignUserToDepartment: async (departmentId, data) => {
    const response = await apiClient.post(`${BASE_URL}/${departmentId}/users`, data);
    return response.data;
  },

  removeUserFromDepartment: async (departmentId, userId, serviceUnitId) => {
    const response = await apiClient.post(
      `${BASE_URL}/${departmentId}/users/${userId}/remove`,
      {},
      { params: { serviceUnitId } }
    );
    return response.data;
  }
};

export default departmentsApi;
