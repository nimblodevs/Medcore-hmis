import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  encounterApi,
  triageApi,
  vitalsApi,
  allergyApi,
  noteApi,
  diagnosisApi,
  orderApi,
  prescriptionApi,
  dischargeApi,
  reportApi,
} from '../api/emr.api';

// Encounter Hooks
export const useEncounters = (params) => {
  return useQuery({
    queryKey: ['encounters', params],
    queryFn: () => encounterApi.list(params).then((res) => res.data),
  });
};

export const useEncounter = (id) => {
  return useQuery({
    queryKey: ['encounter', id],
    queryFn: () => encounterApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};

export const useEncounterByVisit = (visitId) => {
  return useQuery({
    queryKey: ['encounter-by-visit', visitId],
    queryFn: () => encounterApi.getByVisit(visitId).then((res) => res.data),
    enabled: !!visitId,
  });
};

export const useCreateEncounter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: encounterApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['encounters']);
    },
  });
};

export const useUpdateEncounter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => encounterApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(['encounter', id]);
    },
  });
};

export const useCloseEncounter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => encounterApi.close(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(['encounter', id]);
      queryClient.invalidateQueries(['encounters']);
    },
  });
};

export const useCancelEncounter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => encounterApi.cancel(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(['encounter', id]);
      queryClient.invalidateQueries(['encounters']);
    },
  });
};

// Triage Hooks
export const useTriage = (encounterId) => {
  return useQuery({
    queryKey: ['triage', encounterId],
    queryFn: () => triageApi.list(encounterId).then((res) => res.data),
    enabled: !!encounterId,
  });
};

export const useCreateTriage = (encounterId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => triageApi.create(encounterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['triage', encounterId]);
    },
  });
};

// Vitals Hooks
export const useVitals = (encounterId) => {
  return useQuery({
    queryKey: ['vitals', encounterId],
    queryFn: () => vitalsApi.list(encounterId).then((res) => res.data),
    enabled: !!encounterId,
  });
};

export const useCreateVitals = (encounterId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => vitalsApi.create(encounterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vitals', encounterId]);
    },
  });
};

// Allergy Hooks
export const useAllergies = (patientId) => {
  return useQuery({
    queryKey: ['allergies', patientId],
    queryFn: () => allergyApi.list(patientId).then((res) => res.data),
    enabled: !!patientId,
  });
};

export const useCreateAllergy = (encounterId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => allergyApi.create(encounterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allergies']);
    },
  });
};

export const useResolveAllergy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => allergyApi.resolve(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['allergies']);
    },
  });
};

// Clinical Note Hooks
export const useNotes = (encounterId) => {
  return useQuery({
    queryKey: ['notes', encounterId],
    queryFn: () => noteApi.list(encounterId).then((res) => res.data),
    enabled: !!encounterId,
  });
};

export const useNote = (id) => {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => noteApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};

export const useCreateNote = (encounterId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => noteApi.create(encounterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', encounterId]);
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => noteApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(['note', id]);
    },
  });
};

export const useSignNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => noteApi.sign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(['note', id]);
    },
  });
};

export const useAmendNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => noteApi.amend(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(['note', id]);
    },
  });
};

export const useVoidNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => noteApi.void(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(['note', id]);
    },
  });
};

// Diagnosis Hooks
export const useDiagnoses = (encounterId) => {
  return useQuery({
    queryKey: ['diagnoses', encounterId],
    queryFn: () => diagnosisApi.list(encounterId).then((res) => res.data),
    enabled: !!encounterId,
  });
};

export const useCreateDiagnosis = (encounterId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => diagnosisApi.create(encounterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['diagnoses', encounterId]);
    },
  });
};

export const useUpdateDiagnosis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => diagnosisApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['diagnoses']);
    },
  });
};

export const useDeleteDiagnosis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => diagnosisApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['diagnoses']);
    },
  });
};

// Order Hooks
export const useOrders = (encounterId) => {
  return useQuery({
    queryKey: ['orders', encounterId],
    queryFn: () => orderApi.list(encounterId).then((res) => res.data),
    enabled: !!encounterId,
  });
};

export const useCreateOrder = (encounterId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => orderApi.create(encounterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders', encounterId]);
    },
  });
};

export const useSubmitOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => orderApi.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => orderApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
};

// Prescription Hooks
export const usePrescriptions = (encounterId) => {
  return useQuery({
    queryKey: ['prescriptions', encounterId],
    queryFn: () => prescriptionApi.list(encounterId).then((res) => res.data),
    enabled: !!encounterId,
  });
};

export const useCreatePrescription = (encounterId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => prescriptionApi.create(encounterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['prescriptions', encounterId]);
    },
  });
};

export const useCancelPrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => prescriptionApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['prescriptions']);
    },
  });
};

export const useSendToPharmacy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => prescriptionApi.sendToPharmacy(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['prescriptions']);
    },
  });
};

// Discharge Summary Hooks
export const useDischargeSummary = (encounterId) => {
  return useQuery({
    queryKey: ['discharge-summary', encounterId],
    queryFn: () => dischargeApi.get(encounterId).then((res) => res.data),
    enabled: !!encounterId,
  });
};

export const useCreateDischargeSummary = (encounterId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => dischargeApi.create(encounterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discharge-summary', encounterId]);
    },
  });
};

export const useUpdateDischargeSummary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => dischargeApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(['discharge-summary']);
    },
  });
};

export const useSignDischargeSummary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => dischargeApi.sign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(['discharge-summary', id]);
    },
  });
};

// Report Hooks
export const useEncounterReport = (params) => {
  return useQuery({
    queryKey: ['report-encounters', params],
    queryFn: () => reportApi.encounters(params).then((res) => res.data),
    enabled: !!params,
  });
};

export const useDiagnosisReport = (params) => {
  return useQuery({
    queryKey: ['report-diagnoses', params],
    queryFn: () => reportApi.diagnoses(params).then((res) => res.data),
    enabled: !!params,
  });
};

export const useOrderReport = (params) => {
  return useQuery({
    queryKey: ['report-orders', params],
    queryFn: () => reportApi.orders(params).then((res) => res.data),
    enabled: !!params,
  });
};

export const useDischargeReport = (params) => {
  return useQuery({
    queryKey: ['report-discharges', params],
    queryFn: () => reportApi.discharges(params).then((res) => res.data),
    enabled: !!params,
  });
};
