import apiClient from "../../../services/apiClient";

const BASE_URL = "/debtors";

export const debtorsApi = {
  // Account endpoints
  getAccounts: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.debtorType) queryParams.append('debtorType', params.debtorType);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.minCreditLimit) queryParams.append('minCreditLimit', params.minCreditLimit);
    if (params.maxCreditLimit) queryParams.append('maxCreditLimit', params.maxCreditLimit);

    const response = await apiClient.get(`${BASE_URL}/accounts?${queryParams.toString()}`);
    return response.data;
  },

  getAccountById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/accounts/${id}`);
    return response.data;
  },

  createAccount: async (data) => {
    const response = await apiClient.post(`${BASE_URL}/accounts`, data);
    return response.data;
  },

  updateAccount: async (id, data) => {
    const response = await apiClient.patch(`${BASE_URL}/accounts/${id}`, data);
    return response.data;
  },

  activateAccount: async (id, reason = '') => {
    const response = await apiClient.post(`${BASE_URL}/accounts/${id}/activate`, { reason });
    return response.data;
  },

  holdAccount: async (id, reason) => {
    const response = await apiClient.post(`${BASE_URL}/accounts/${id}/hold`, { reason });
    return response.data;
  },

  releaseHold: async (id) => {
    const response = await apiClient.post(`${BASE_URL}/accounts/${id}/release-hold`);
    return response.data;
  },

  suspendAccount: async (id, reason) => {
    const response = await apiClient.post(`${BASE_URL}/accounts/${id}/suspend`, { reason });
    return response.data;
  },

  closeAccount: async (id, reason) => {
    const response = await apiClient.post(`${BASE_URL}/accounts/${id}/close`, { reason });
    return response.data;
  },

  archiveAccount: async (id) => {
    const response = await apiClient.post(`${BASE_URL}/accounts/${id}/archive`);
    return response.data;
  },

  // Contacts endpoints
  getContacts: async (accountId) => {
    const response = await apiClient.get(`${BASE_URL}/accounts/${accountId}/contacts`);
    return response.data;
  },

  createContact: async (accountId, data) => {
    const response = await apiClient.post(`${BASE_URL}/accounts/${accountId}/contacts`, data);
    return response.data;
  },

  updateContact: async (contactId, data) => {
    const response = await apiClient.patch(`${BASE_URL}/contacts/${contactId}`, data);
    return response.data;
  },

  deactivateContact: async (contactId) => {
    const response = await apiClient.post(`${BASE_URL}/contacts/${contactId}/deactivate`);
    return response.data;
  },

  // Contracts endpoints
  getContracts: async (accountId) => {
    const response = await apiClient.get(`${BASE_URL}/accounts/${accountId}/contracts`);
    return response.data;
  },

  createContract: async (accountId, data) => {
    const response = await apiClient.post(`${BASE_URL}/accounts/${accountId}/contracts`, data);
    return response.data;
  },

  updateContract: async (contractId, data) => {
    const response = await apiClient.patch(`${BASE_URL}/contracts/${contractId}`, data);
    return response.data;
  },

  activateContract: async (contractId) => {
    const response = await apiClient.post(`${BASE_URL}/contracts/${contractId}/activate`);
    return response.data;
  },

  deactivateContract: async (contractId) => {
    const response = await apiClient.post(`${BASE_URL}/contracts/${contractId}/deactivate`);
    return response.data;
  },

  // Statements endpoints
  getStatements: async (accountId) => {
    const response = await apiClient.get(`${BASE_URL}/accounts/${accountId}/statements`);
    return response.data;
  },

  generateStatement: async (accountId, data) => {
    const response = await apiClient.post(`${BASE_URL}/accounts/${accountId}/statements/generate`, data);
    return response.data;
  },

  getStatement: async (statementId) => {
    const response = await apiClient.get(`${BASE_URL}/statements/${statementId}`);
    return response.data;
  },

  markStatementSent: async (statementId) => {
    const response = await apiClient.post(`${BASE_URL}/statements/${statementId}/mark-sent`);
    return response.data;
  },

  acknowledgeStatement: async (statementId) => {
    const response = await apiClient.post(`${BASE_URL}/statements/${statementId}/acknowledge`);
    return response.data;
  },

  disputeStatement: async (statementId, reason) => {
    const response = await apiClient.post(`${BASE_URL}/statements/${statementId}/dispute`, { reason });
    return response.data;
  },

  // Reconciliation endpoints
  getReconciliations: async (accountId) => {
    const response = await apiClient.get(`${BASE_URL}/accounts/${accountId}/reconciliations`);
    return response.data;
  },

  createReconciliation: async (accountId, data) => {
    const response = await apiClient.post(`${BASE_URL}/accounts/${accountId}/reconciliations`, data);
    return response.data;
  },

  getReconciliation: async (reconciliationId) => {
    const response = await apiClient.get(`${BASE_URL}/reconciliations/${reconciliationId}`);
    return response.data;
  },

  updateReconciliation: async (reconciliationId, data) => {
    const response = await apiClient.patch(`${BASE_URL}/reconciliations/${reconciliationId}`, data);
    return response.data;
  },

  closeReconciliation: async (reconciliationId) => {
    const response = await apiClient.post(`${BASE_URL}/reconciliations/${reconciliationId}/close`);
    return response.data;
  },

  // Balance and Aging endpoints
  getBalance: async (accountId) => {
    const response = await apiClient.get(`${BASE_URL}/accounts/${accountId}/balance`);
    return response.data;
  },

  recalculateBalance: async (accountId) => {
    const response = await apiClient.post(`${BASE_URL}/accounts/${accountId}/recalculate-balance`);
    return response.data;
  },

  getAging: async (accountId) => {
    const response = await apiClient.get(`${BASE_URL}/accounts/${accountId}/aging`);
    return response.data;
  },

  getAgingSummary: async () => {
    const response = await apiClient.get(`${BASE_URL}/aging/summary`);
    return response.data;
  },

  // Documents endpoints
  getDocuments: async (accountId) => {
    const response = await apiClient.get(`${BASE_URL}/accounts/${accountId}/documents`);
    return response.data;
  },

  uploadDocument: async (accountId, formData) => {
    const response = await apiClient.post(`${BASE_URL}/accounts/${accountId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await apiClient.delete(`${BASE_URL}/documents/${documentId}`);
    return response.data;
  },

  // Reports endpoints
  getSummaryReport: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`${BASE_URL}/reports/summary?${queryParams.toString()}`);
    return response.data;
  },

  getByTypeReport: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`${BASE_URL}/reports/by-type?${queryParams.toString()}`);
    return response.data;
  },

  getOutstandingReport: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`${BASE_URL}/reports/outstanding?${queryParams.toString()}`);
    return response.data;
  },

  getAgingReport: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`${BASE_URL}/reports/aging?${queryParams.toString()}`);
    return response.data;
  },

  getCreditLimitsReport: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`${BASE_URL}/reports/credit-limits?${queryParams.toString()}`);
    return response.data;
  },

  getStatementsReport: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`${BASE_URL}/reports/statements?${queryParams.toString()}`);
    return response.data;
  },

  getReconciliationsReport: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`${BASE_URL}/reports/reconciliations?${queryParams.toString()}`);
    return response.data;
  },

  getShaReport: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`${BASE_URL}/reports/sha?${queryParams.toString()}`);
    return response.data;
  },

  getInsuranceReport: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`${BASE_URL}/reports/insurance?${queryParams.toString()}`);
    return response.data;
  },

  getCorporatesReport: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`${BASE_URL}/reports/corporates?${queryParams.toString()}`);
    return response.data;
  }
};

export default debtorsApi;
