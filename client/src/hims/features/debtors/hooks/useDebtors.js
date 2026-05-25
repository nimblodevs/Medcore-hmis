import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debtorsApi } from "../api/debtors.api";

// Query keys
export const debtorKeys = {
  all: ['debtors'],
  accounts: () => [...debtorKeys.all, 'accounts'],
  account: (id) => [...debtorKeys.accounts(), id],
  contacts: (accountId) => [...debtorKeys.account(accountId), 'contacts'],
  contracts: (accountId) => [...debtorKeys.account(accountId), 'contracts'],
  statements: (accountId) => [...debtorKeys.account(accountId), 'statements'],
  reconciliations: (accountId) => [...debtorKeys.account(accountId), 'reconciliations'],
  documents: (accountId) => [...debtorKeys.account(accountId), 'documents'],
  balance: (accountId) => [...debtorKeys.account(accountId), 'balance'],
  aging: (accountId) => [...debtorKeys.account(accountId), 'aging'],
  reports: {
    all: [...debtorKeys.all, 'reports'],
    summary: (params) => [...debtorKeys.reports.all, 'summary', params],
    byType: (params) => [...debtorKeys.reports.all, 'by-type', params],
    outstanding: (params) => [...debtorKeys.reports.all, 'outstanding', params],
    aging: (params) => [...debtorKeys.reports.all, 'aging', params],
    creditLimits: (params) => [...debtorKeys.reports.all, 'credit-limits', params]
  }
};

// Account hooks
export function useDebtorAccounts(filters = {}, pagination = {}) {
  return useQuery({
    queryKey: [...debtorKeys.accounts(), filters, pagination],
    queryFn: () => debtorsApi.getAccounts({ ...filters, ...pagination }),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export function useDebtorAccount(id) {
  return useQuery({
    queryKey: debtorKeys.account(id),
    queryFn: () => debtorsApi.getAccountById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
}

export function useCreateDebtorAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => debtorsApi.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: debtorKeys.accounts() });
    }
  });
}

export function useUpdateDebtorAccount(id) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => debtorsApi.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: debtorKeys.account(id) });
      queryClient.invalidateQueries({ queryKey: debtorKeys.accounts() });
    }
  });
}

export function useActivateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }) => debtorsApi.activateAccount(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: debtorKeys.account(id) });
      queryClient.invalidateQueries({ queryKey: debtorKeys.accounts() });
    }
  });
}

export function useHoldAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }) => debtorsApi.holdAccount(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: debtorKeys.account(id) });
      queryClient.invalidateQueries({ queryKey: debtorKeys.accounts() });
    }
  });
}

export function useReleaseHold() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => debtorsApi.releaseHold(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: debtorKeys.account(id) });
      queryClient.invalidateQueries({ queryKey: debtorKeys.accounts() });
    }
  });
}

export function useSuspendAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }) => debtorsApi.suspendAccount(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: debtorKeys.account(id) });
      queryClient.invalidateQueries({ queryKey: debtorKeys.accounts() });
    }
  });
}

export function useCloseAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }) => debtorsApi.closeAccount(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: debtorKeys.account(id) });
      queryClient.invalidateQueries({ queryKey: debtorKeys.accounts() });
    }
  });
}

export function useArchiveAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => debtorsApi.archiveAccount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: debtorKeys.account(id) });
      queryClient.invalidateQueries({ queryKey: debtorKeys.accounts() });
    }
  });
}

// Balance and Aging hooks
export function useDebtorBalance(accountId) {
  return useQuery({
    queryKey: debtorKeys.balance(accountId),
    queryFn: () => debtorsApi.getBalance(accountId),
    enabled: !!accountId,
    staleTime: 1 * 60 * 1000 // 1 minute
  });
}

export function useDebtorAging(accountId) {
  return useQuery({
    queryKey: debtorKeys.aging(accountId),
    queryFn: () => debtorsApi.getAging(accountId),
    enabled: !!accountId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
}

export function useAgingSummary() {
  return useQuery({
    queryKey: [...debtorKeys.all, 'aging-summary'],
    queryFn: () => debtorsApi.getAgingSummary(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

// Report hooks
export function useDebtorSummaryReport(params = {}) {
  return useQuery({
    queryKey: debtorKeys.reports.summary(params),
    queryFn: () => debtorsApi.getSummaryReport(params),
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
}

export function useOutstandingReport(params = {}) {
  return useQuery({
    queryKey: debtorKeys.reports.outstanding(params),
    queryFn: () => debtorsApi.getOutstandingReport(params),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export function useCreditLimitsReport(params = {}) {
  return useQuery({
    queryKey: debtorKeys.reports.creditLimits(params),
    queryFn: () => debtorsApi.getCreditLimitsReport(params),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export default {
  useDebtorAccounts,
  useDebtorAccount,
  useCreateDebtorAccount,
  useUpdateDebtorAccount,
  useActivateAccount,
  useHoldAccount,
  useReleaseHold,
  useSuspendAccount,
  useCloseAccount,
  useArchiveAccount,
  useDebtorBalance,
  useDebtorAging,
  useAgingSummary,
  useDebtorSummaryReport,
  useOutstandingReport,
  useCreditLimitsReport
};
