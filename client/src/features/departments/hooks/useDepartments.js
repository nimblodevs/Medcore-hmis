import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import departmentsApi from "../api/departments.api.js";

// Department Queries
export const useDepartments = (filters = {}) => {
  return useQuery({
    queryKey: ["departments", filters],
    queryFn: () => departmentsApi.list(filters),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useDepartment = (id) => {
  return useQuery({
    queryKey: ["department", id],
    queryFn: () => departmentsApi.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["department-dashboard-stats"],
    queryFn: () => departmentsApi.getDashboardStats(),
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};

// Department Mutations
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => departmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
    }
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => departmentsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["departments"]);
      queryClient.invalidateQueries(["department", id]);
    }
  });
};

export const useActivateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => departmentsApi.activate(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["departments"]);
      queryClient.invalidateQueries(["department", id]);
    }
  });
};

export const useDeactivateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => departmentsApi.deactivate(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["departments"]);
      queryClient.invalidateQueries(["department", id]);
    }
  });
};

export const useArchiveDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => departmentsApi.archive(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["departments"]);
      queryClient.invalidateQueries(["department", id]);
    }
  });
};

export const useAssignManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, managerId }) => departmentsApi.assignManager(id, managerId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["departments"]);
      queryClient.invalidateQueries(["department", id]);
    }
  });
};

// Service Unit Queries
export const useServiceUnits = (departmentId, filters = {}) => {
  return useQuery({
    queryKey: ["service-units", departmentId, filters],
    queryFn: () => departmentsApi.listServiceUnits(departmentId, filters),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000
  });
};

export const useServiceUnit = (id) => {
  return useQuery({
    queryKey: ["service-unit", id],
    queryFn: () => departmentsApi.getServiceUnit(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  });
};

// Service Unit Mutations
export const useCreateServiceUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ departmentId, data }) => departmentsApi.createServiceUnit(departmentId, data),
    onSuccess: (_, { departmentId }) => {
      queryClient.invalidateQueries(["service-units", departmentId]);
      queryClient.invalidateQueries(["department", departmentId]);
    }
  });
};

export const useUpdateServiceUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => departmentsApi.updateServiceUnit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["service-unit", id]);
    }
  });
};

export const useActivateServiceUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => departmentsApi.activateServiceUnit(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["service-unit", id]);
    }
  });
};

export const useDeactivateServiceUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => departmentsApi.deactivateServiceUnit(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["service-unit", id]);
    }
  });
};

// User Assignment Queries
export const useDepartmentUsers = (departmentId, filters = {}) => {
  return useQuery({
    queryKey: ["department-users", departmentId, filters],
    queryFn: () => departmentsApi.getDepartmentUsers(departmentId, filters),
    enabled: !!departmentId,
    staleTime: 3 * 60 * 1000 // 3 minutes
  });
};

// User Assignment Mutations
export const useAssignUserToDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ departmentId, data }) => departmentsApi.assignUserToDepartment(departmentId, data),
    onSuccess: (_, { departmentId }) => {
      queryClient.invalidateQueries(["department-users", departmentId]);
      queryClient.invalidateQueries(["department", departmentId]);
    }
  });
};

export const useRemoveUserFromDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ departmentId, userId, serviceUnitId }) =>
      departmentsApi.removeUserFromDepartment(departmentId, userId, serviceUnitId),
    onSuccess: (_, { departmentId }) => {
      queryClient.invalidateQueries(["department-users", departmentId]);
      queryClient.invalidateQueries(["department", departmentId]);
    }
  });
};
