import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import appointmentsApi from "../api/appointments.api.js";

// Appointment Queries
export const useAppointments = (filters = {}) => {
  return useQuery({
    queryKey: ["appointments", filters],
    queryFn: () => appointmentsApi.list(filters),
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};

export const useAppointment = (id) => {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => appointmentsApi.get(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000
  });
};

export const useTodaySummary = () => {
  return useQuery({
    queryKey: ["appointments-today-summary"],
    queryFn: () => appointmentsApi.getTodaySummary(),
    staleTime: 1 * 60 * 1000 // 1 minute
  });
};

// Appointment Mutations
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => appointmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["appointments-today-summary"]);
    }
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => appointmentsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["appointment", id]);
      queryClient.invalidateQueries(["appointments-today-summary"]);
    }
  });
};

export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => appointmentsApi.confirm(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["appointment", id]);
      queryClient.invalidateQueries(["appointments-today-summary"]);
    }
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => appointmentsApi.cancel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["appointment", id]);
      queryClient.invalidateQueries(["appointments-today-summary"]);
    }
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => appointmentsApi.reschedule(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["appointment", id]);
      queryClient.invalidateQueries(["appointments-today-summary"]);
    }
  });
};

export const useCheckInAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => appointmentsApi.checkIn(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["appointment", id]);
      queryClient.invalidateQueries(["appointments-today-summary"]);
    }
  });
};

export const useNoShowAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => appointmentsApi.noShow(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["appointment", id]);
      queryClient.invalidateQueries(["appointments-today-summary"]);
    }
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => appointmentsApi.complete(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["appointment", id]);
      queryClient.invalidateQueries(["appointments-today-summary"]);
    }
  });
};
