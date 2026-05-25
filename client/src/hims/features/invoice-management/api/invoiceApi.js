import { api } from "@/lib/axios";

export const invoiceApi = {
  list: async (params) => {
    const { data } = await api.get("/invoice-management/invoices", { params });
    return data.data || [];
  },

  getById: async (id) => {
    const { data } = await api.get(`/invoice-management/invoices/${id}`);
    return data.data;
  },

  create: async (payload) => {
    const { data } = await api.post("/invoice-management/invoices", payload);
    return data.data;
  },

  update: async (id, payload) => {
    const { data } = await api.patch(`/invoice-management/invoices/${id}`, payload);
    return data.data;
  },

  approve: async (id) => {
    const { data } = await api.post(`/invoice-management/invoices/${id}/approve`);
    return data.data;
  },

  cancel: async (id, reason) => {
    const { data } = await api.post(`/invoice-management/invoices/${id}/cancel`, { reason });
    return data.data;
  },

  dispute: async (id, reason) => {
    const { data } = await api.post(`/invoice-management/invoices/${id}/dispute`, { reason });
    return data.data;
  },

  writeOff: async (id, payload) => {
    const { data } = await api.post(`/invoice-management/invoices/${id}/write-off`, payload);
    return data.data;
  },

  addLineItem: async (invoiceId, payload) => {
    const { data } = await api.post(`/invoice-management/invoices/${invoiceId}/line-items`, payload);
    return data.data;
  },

  updateLineItem: async (lineItemId, payload) => {
    const { data } = await api.patch(`/invoice-management/line-items/${lineItemId}`, payload);
    return data.data;
  },

  deleteLineItem: async (lineItemId) => {
    const { data } = await api.delete(`/invoice-management/line-items/${lineItemId}`);
    return data.data;
  },

  addAdjustment: async (invoiceId, payload) => {
    const { data } = await api.post(`/invoice-management/invoices/${invoiceId}/adjustments`, payload);
    return data.data;
  },
};
