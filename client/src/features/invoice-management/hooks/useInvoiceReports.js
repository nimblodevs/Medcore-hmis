import { useQuery } from "@tanstack/react-query";
import { invoiceReportsApi } from "../api/invoiceReportsApi";

export function useOutstandingSummary(filters) {
  return useQuery({
    queryKey: ["invoice-reports", "outstanding", filters],
    queryFn: () => invoiceReportsApi.getOutstandingSummary(filters),
  });
}

export function useAgingReport(filters) {
  return useQuery({
    queryKey: ["invoice-reports", "aging", filters],
    queryFn: () => invoiceReportsApi.getAgingReport(filters),
  });
}

export function useWriteOffReport(filters) {
  return useQuery({
    queryKey: ["invoice-reports", "write-offs", filters],
    queryFn: () => invoiceReportsApi.getWriteOffReport(filters),
  });
}
