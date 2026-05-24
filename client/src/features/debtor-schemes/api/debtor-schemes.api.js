import api from "../api";

const DEBTOR_SCHEMES_BASE_URL = "/debtor-schemes/schemes";

export const debtorSchemesApi = {
  // List all schemes with filtering and pagination
  getAll(params = {}) {
    return api.get(DEBTOR_SCHEMES_BASE_URL, { params });
  },

  // Get schemes by debtor account
  getByDebtorAccount(debtorAccountId, params = {}) {
    return api.get(`${DEBTOR_SCHEMES_BASE_URL}/debtor-account/${debtorAccountId}`, { params });
  },

  // Get single scheme by ID
  getById(id) {
    return api.get(`${DEBTOR_SCHEMES_BASE_URL}/${id}`);
  },

  // Create new scheme
  create(data) {
    return api.post(DEBTOR_SCHEMES_BASE_URL, data);
  },

  // Update scheme
  update(id, data) {
    return api.patch(`${DEBTOR_SCHEMES_BASE_URL}/${id}`, data);
  },

  // Activate scheme
  activate(id, reason) {
    return api.post(`${DEBTOR_SCHEMES_BASE_URL}/${id}/activate`, { reason });
  },

  // Deactivate scheme
  deactivate(id, reason) {
    return api.post(`${DEBTOR_SCHEMES_BASE_URL}/${id}/deactivate`, { reason });
  },

  // Suspend scheme
  suspend(id, reason) {
    return api.post(`${DEBTOR_SCHEMES_BASE_URL}/${id}/suspend`, { reason });
  },

  // Archive scheme
  archive(id, reason) {
    return api.post(`${DEBTOR_SCHEMES_BASE_URL}/${id}/archive`, { reason });
  }
};

export default debtorSchemesApi;
