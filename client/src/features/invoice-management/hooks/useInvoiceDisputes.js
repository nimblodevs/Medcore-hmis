import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceDisputesApi } from "../api/invoiceDisputesApi";
import { toast } from "sonner";

export function useDisputes(filters) {
  return useQuery({
    queryKey: ["invoice-disputes", filters],
    queryFn: () => invoiceDisputesApi.list(filters),
  });
}

export function useCreateDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, reason }) => invoiceDisputesApi.create(invoiceId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-disputes"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Dispute created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create dispute");
    },
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ disputeId, resolutionNotes }) => 
      invoiceDisputesApi.resolve(disputeId, { resolutionNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-disputes"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Dispute resolved successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to resolve dispute");
    },
  });
}
