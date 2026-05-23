import { api } from "@/lib/axios";

export const invoiceDisputesApi = {
  list: async (params) => {
    const { data } = await api.get("/invoice-management/disputes", { params });
    return data.data;
  },

  create: async (invoiceId, payload) => {
    const { data } = await api.post(`/invoice-management/invoices/${invoiceId}/disputes`, payload);
    return data.data;
  },

  resolve: async (disputeId, payload) => {
    const { data } = await api.post(`/invoice-management/disputes/${disputeId}/resolve`, payload);
    return data.data;
  },
};
