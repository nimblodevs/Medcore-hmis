import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceApi } from "../api/invoiceApi";
import { toast } from "sonner";

export function useInvoices(filters) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => invoiceApi.list(filters),
  });
}

export function useInvoice(id) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoiceApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create invoice");
    },
  });
}

export function useApproveInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      toast.success("Invoice approved successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to approve invoice");
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => invoiceApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      toast.success("Invoice cancelled successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to cancel invoice");
    },
  });
}

export function useDisputeInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => invoiceApi.dispute(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      toast.success("Invoice disputed successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to dispute invoice");
    },
  });
}

export function useAddLineItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, payload }) => invoiceApi.addLineItem(invoiceId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.invoiceId] });
      toast.success("Line item added successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add line item");
    },
  });
}

export function useDeleteLineItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lineItemId) => invoiceApi.deleteLineItem(lineItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      toast.success("Line item deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete line item");
    },
  });
}

export function useAddAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, payload }) => invoiceApi.addAdjustment(invoiceId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.invoiceId] });
      toast.success("Adjustment added successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add adjustment");
    },
  });
}
