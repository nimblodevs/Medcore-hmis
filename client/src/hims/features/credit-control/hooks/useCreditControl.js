import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditControlApi } from '../api/creditControlApi';

// Cases
export function useCases(params) {
  return useQuery({
    queryKey: ['credit-control-cases', params],
    queryFn: () => creditControlApi.getCases(params),
    select: (data) => data.data,
  });
}

export function useCase(id) {
  return useQuery({
    queryKey: ['credit-control-case', id],
    queryFn: () => creditControlApi.getCase(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: creditControlApi.createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-cases'] });
    },
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => creditControlApi.updateCase(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-case', id] });
      queryClient.invalidateQueries({ queryKey: ['credit-control-cases'] });
    },
  });
}

export function useAssignCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => creditControlApi.assignCase(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-case', id] });
      queryClient.invalidateQueries({ queryKey: ['credit-control-cases'] });
    },
  });
}

export function useCloseCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => creditControlApi.closeCase(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-case', id] });
      queryClient.invalidateQueries({ queryKey: ['credit-control-cases'] });
    },
  });
}

export function useReopenCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => creditControlApi.reopenCase(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-case', id] });
      queryClient.invalidateQueries({ queryKey: ['credit-control-cases'] });
    },
  });
}

// Follow-ups
export function useFollowUps(caseId, params) {
  return useQuery({
    queryKey: ['credit-control-follow-ups', caseId, params],
    queryFn: () => creditControlApi.getFollowUps(caseId, params),
    select: (data) => data.data,
    enabled: !!caseId,
  });
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }) => creditControlApi.createFollowUp(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-follow-ups', caseId] });
      queryClient.invalidateQueries({ queryKey: ['credit-control-case', caseId] });
    },
  });
}

export function useDueTodayFollowUps() {
  return useQuery({
    queryKey: ['credit-control-follow-ups-due-today'],
    queryFn: creditControlApi.getDueToday,
    select: (data) => data.data,
  });
}

export function useOverdueFollowUps() {
  return useQuery({
    queryKey: ['credit-control-follow-ups-overdue'],
    queryFn: creditControlApi.getOverdue,
    select: (data) => data.data,
  });
}

// Promises
export function usePromises(caseId, params) {
  return useQuery({
    queryKey: ['credit-control-promises', caseId, params],
    queryFn: () => creditControlApi.getPromises(caseId, params),
    select: (data) => data.data,
    enabled: !!caseId,
  });
}

export function useCreatePromise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }) => creditControlApi.createPromise(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-promises', caseId] });
      queryClient.invalidateQueries({ queryKey: ['credit-control-case', caseId] });
    },
  });
}

export function useUpdatePromise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => creditControlApi.updatePromise(id, data),
    onSuccess: (_, { id, caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-promises', caseId] });
    },
  });
}

export function useMarkFulfilled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => creditControlApi.markFulfilled(id, data),
    onSuccess: (_, { id, caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-promises', caseId] });
    },
  });
}

// Holds
export function useHolds(params) {
  return useQuery({
    queryKey: ['credit-control-holds', params],
    queryFn: () => creditControlApi.getHolds(params),
    select: (data) => data.data,
  });
}

export function useRecommendHold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }) => creditControlApi.recommendHold(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-holds'] });
      queryClient.invalidateQueries({ queryKey: ['credit-control-case', caseId] });
    },
  });
}

export function useApproveHold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => creditControlApi.approveHold(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-holds'] });
    },
  });
}

export function useRejectHold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => creditControlApi.rejectHold(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-holds'] });
    },
  });
}

export function useReleaseHold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => creditControlApi.releaseHold(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-holds'] });
    },
  });
}

// Disputes
export function useDisputes(params) {
  return useQuery({
    queryKey: ['credit-control-disputes', params],
    queryFn: () => creditControlApi.getDisputes(params),
    select: (data) => data.data,
  });
}

export function useCreateDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }) => creditControlApi.createDispute(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['credit-control-case', caseId] });
    },
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => creditControlApi.resolveDispute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-disputes'] });
    },
  });
}

export function useCancelDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => creditControlApi.cancelDispute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-disputes'] });
    },
  });
}

// Write-offs
export function useWriteOffs(params) {
  return useQuery({
    queryKey: ['credit-control-write-offs', params],
    queryFn: () => creditControlApi.getWriteOffs(params),
    select: (data) => data.data,
  });
}

export function useRecommendWriteOff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, data }) => creditControlApi.recommendWriteOff(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-write-offs'] });
      queryClient.invalidateQueries({ queryKey: ['credit-control-case', caseId] });
    },
  });
}

export function useApproveWriteOff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => creditControlApi.approveWriteOff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-write-offs'] });
    },
  });
}

export function useRejectWriteOff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => creditControlApi.rejectWriteOff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-write-offs'] });
    },
  });
}

export function usePostWriteOff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => creditControlApi.postWriteOff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-write-offs'] });
    },
  });
}

// Aging & Risk
export function useAgingAccounts(params) {
  return useQuery({
    queryKey: ['credit-control-aging-accounts', params],
    queryFn: () => creditControlApi.getAgingAccounts(params),
    select: (data) => data.data,
  });
}

export function useAgingInvoices(params) {
  return useQuery({
    queryKey: ['credit-control-aging-invoices', params],
    queryFn: () => creditControlApi.getAgingInvoices(params),
    select: (data) => data.data,
  });
}

export function useRecalculateAging() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: creditControlApi.recalculateAging,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-control-aging-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['credit-control-aging-invoices'] });
    },
  });
}

export function useRiskAccounts(params) {
  return useQuery({
    queryKey: ['credit-control-risk-accounts', params],
    queryFn: () => creditControlApi.getRiskAccounts(params),
    select: (data) => data.data,
  });
}

// Reports
export function useDashboard() {
  return useQuery({
    queryKey: ['credit-control-dashboard'],
    queryFn: creditControlApi.getDashboard,
    select: (data) => data.data,
  });
}

export function useAgingReport(params) {
  return useQuery({
    queryKey: ['credit-control-aging-report', params],
    queryFn: () => creditControlApi.getAgingReport(params),
    select: (data) => data.data,
  });
}

export function useCollectorWorkload(params) {
  return useQuery({
    queryKey: ['credit-control-collector-workload', params],
    queryFn: () => creditControlApi.getCollectorWorkload(params),
    select: (data) => data.data,
  });
}

export function usePromisesReport(params) {
  return useQuery({
    queryKey: ['credit-control-promises-report', params],
    queryFn: () => creditControlApi.getPromisesReport(params),
    select: (data) => data.data,
  });
}

export function useHoldsReport(params) {
  return useQuery({
    queryKey: ['credit-control-holds-report', params],
    queryFn: () => creditControlApi.getHoldsReport(params),
    select: (data) => data.data,
  });
}

export function useDisputesReport(params) {
  return useQuery({
    queryKey: ['credit-control-disputes-report', params],
    queryFn: () => creditControlApi.getDisputesReport(params),
    select: (data) => data.data,
  });
}

export function useWriteOffsReport(params) {
  return useQuery({
    queryKey: ['credit-control-write-offs-report', params],
    queryFn: () => creditControlApi.getWriteOffsReport(params),
    select: (data) => data.data,
  });
}

export function useOverdueAccounts(params) {
  return useQuery({
    queryKey: ['credit-control-overdue-accounts', params],
    queryFn: () => creditControlApi.getOverdueAccounts(params),
    select: (data) => data.data,
  });
}
