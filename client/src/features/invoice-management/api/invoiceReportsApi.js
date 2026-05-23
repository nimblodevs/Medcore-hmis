import { api } from "@/lib/axios";

export const invoiceReportsApi = {
  getOutstandingSummary: async (params) => {
    const { data } = await api.get("/invoice-management/reports/outstanding", { params });
    return data.data;
  },

  getAgingReport: async (params) => {
    const { data } = await api.get("/invoice-management/reports/aging", { params });
    return data.data;
  },

  getWriteOffReport: async (params) => {
    const { data } = await api.get("/invoice-management/reports/write-offs", { params });
    return data.data;
  },
  
  exportOutstanding: async (params) => {
    const response = await api.get("/invoice-management/reports/outstanding/export", { 
      params,
      responseType: 'blob' 
    });
    return response.data;
  }
};
