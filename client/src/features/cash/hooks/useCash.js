import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cashApi } from "../api/cashApi";

// ==================== Cash Counter Hooks ====================

export const useCashCounters = (params) => {
  return useQuery({
    queryKey: ["cashCounters", params],
    queryFn: () => cashApi.getCounters(params).then((res) => res.data),
    enabled: true
  });
};

export const useCashCounter = (id) => {
  return useQuery({
    queryKey: ["cashCounter", id],
    queryFn: () => cashApi.getCounter(id).then((res) => res.data),
    enabled: !!id
  });
};

export const useCreateCashCounter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => cashApi.createCounter(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashCounters"]);
      toast.success("Cash counter created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create cash counter");
    }
  });
};

export const useUpdateCashCounter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => cashApi.updateCounter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashCounters"]);
      toast.success("Cash counter updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update cash counter");
    }
  });
};

export const useDeleteCashCounter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => cashApi.deleteCounter(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashCounters"]);
      toast.success("Cash counter deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete cash counter");
    }
  });
};

// ==================== Cashier Profile Hooks ====================

export const useCashierProfiles = (params) => {
  return useQuery({
    queryKey: ["cashierProfiles", params],
    queryFn: () => cashApi.getCashierProfiles(params).then((res) => res.data),
    enabled: true
  });
};

export const useCashierProfile = (id) => {
  return useQuery({
    queryKey: ["cashierProfile", id],
    queryFn: () => cashApi.getCashierProfile(id).then((res) => res.data),
    enabled: !!id
  });
};

export const useMyCashierProfile = () => {
  return useQuery({
    queryKey: ["myCashierProfile"],
    queryFn: () => cashApi.getCashierProfileByUser().then((res) => res.data),
    retry: false
  });
};

export const useCreateCashierProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => cashApi.createCashierProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashierProfiles"]);
      toast.success("Cashier profile created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create cashier profile");
    }
  });
};

export const useUpdateCashierProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => cashApi.updateCashierProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashierProfiles"]);
      toast.success("Cashier profile updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update cashier profile");
    }
  });
};

export const useDeleteCashierProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => cashApi.deleteCashierProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashierProfiles"]);
      toast.success("Cashier profile deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete cashier profile");
    }
  });
};

// ==================== Cash Session Hooks ====================

export const useCashSessions = (params) => {
  return useQuery({
    queryKey: ["cashSessions", params],
    queryFn: () => cashApi.getCashSessions(params).then((res) => res.data),
    enabled: true
  });
};

export const useCashSession = (id) => {
  return useQuery({
    queryKey: ["cashSession", id],
    queryFn: () => cashApi.getCashSession(id).then((res) => res.data),
    enabled: !!id
  });
};

export const useOpenCashSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => cashApi.openCashSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashSessions"]);
      queryClient.invalidateQueries(["openCashSession"]);
      toast.success("Cash session opened successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to open cash session");
    }
  });
};

export const useCloseCashSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => cashApi.closeCashSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashSessions"]);
      queryClient.invalidateQueries(["openCashSession"]);
      toast.success("Cash session closed successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to close cash session");
    }
  });
};

export const useMyOpenCashSession = () => {
  return useQuery({
    queryKey: ["openCashSession"],
    queryFn: () => cashApi.getOpenCashSession().then((res) => res.data),
    retry: false
  });
};

// ==================== Payment Hooks ====================

export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => cashApi.recordPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashSessions"]);
      toast.success("Payment recorded successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to record payment");
    }
  });
};

// ==================== Refund Hooks ====================

export const useRequestRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => cashApi.requestRefund(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashSessions"]);
      toast.success("Refund request submitted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to request refund");
    }
  });
};

export const useApproveRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => cashApi.approveRefund(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashSessions"]);
      toast.success("Refund approved successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to approve refund");
    }
  });
};

export const useRejectRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => cashApi.rejectRefund(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashSessions"]);
      toast.success("Refund rejected");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to reject refund");
    }
  });
};

// ==================== Handover Hooks ====================

export const useSubmitHandover = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => cashApi.submitHandover(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashSessions"]);
      toast.success("Handover submitted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit handover");
    }
  });
};

export const useReviewHandover = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => cashApi.reviewHandover(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cashSessions"]);
      toast.success("Handover reviewed successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to review handover");
    }
  });
};

// ==================== Dashboard Stats Hook ====================

export const useCashDashboardStats = (params) => {
  return useQuery({
    queryKey: ["cashDashboardStats", params],
    queryFn: () => cashApi.getDashboardStats(params).then((res) => res.data),
    enabled: true
  });
};
