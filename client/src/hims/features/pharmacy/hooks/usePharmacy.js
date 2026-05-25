import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  drugApi,
  drugCategoryApi,
  batchApi,
  storeApi,
  prescriptionApi,
  dispenseApi,
  supplierApi,
  purchaseOrderApi,
  grnApi,
  stockMovementApi,
} from '../services/pharmacy.api';

/**
 * Drug Category Hooks
 */
export const useDrugCategories = (params = {}) => {
  return useQuery({
    queryKey: ['drug-categories', params],
    queryFn: () => drugCategoryApi.getAll(params).then(res => res.data),
  });
};

export const useDrugCategory = (id) => {
  return useQuery({
    queryKey: ['drug-category', id],
    queryFn: () => drugCategoryApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateDrugCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => drugCategoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['drug-categories']);
    },
  });
};

export const useUpdateDrugCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => drugCategoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['drug-categories']);
      queryClient.invalidateQueries(['drug-category']);
    },
  });
};

/**
 * Drug Hooks
 */
export const useDrugs = (params = {}) => {
  return useQuery({
    queryKey: ['drugs', params],
    queryFn: () => drugApi.getAll(params).then(res => res.data),
  });
};

export const useDrug = (id) => {
  return useQuery({
    queryKey: ['drug', id],
    queryFn: () => drugApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useLowStockDrugs = (params = {}) => {
  return useQuery({
    queryKey: ['drugs', 'low-stock', params],
    queryFn: () => drugApi.getLowStock(params).then(res => res.data),
  });
};

export const useExpiringDrugs = (params = {}) => {
  return useQuery({
    queryKey: ['drugs', 'expiring', params],
    queryFn: () => drugApi.getExpiring(params).then(res => res.data),
  });
};

export const useSearchDrugs = (query) => {
  return useQuery({
    queryKey: ['drugs', 'search', query],
    queryFn: () => drugApi.search(query).then(res => res.data),
    enabled: !!query,
  });
};

export const useCreateDrug = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => drugApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['drugs']);
    },
  });
};

export const useUpdateDrug = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => drugApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['drugs']);
      queryClient.invalidateQueries(['drug']);
    },
  });
};

/**
 * Drug Batch Hooks
 */
export const useBatches = (params = {}) => {
  return useQuery({
    queryKey: ['batches', params],
    queryFn: () => batchApi.getAll(params).then(res => res.data),
  });
};

export const useBatchesByDrug = (drugId, params = {}) => {
  return useQuery({
    queryKey: ['batches', 'drug', drugId, params],
    queryFn: () => batchApi.getByDrug(drugId, params).then(res => res.data),
    enabled: !!drugId,
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => batchApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['batches']);
      queryClient.invalidateQueries(['drugs']);
    },
  });
};

/**
 * Pharmacy Store Hooks
 */
export const useStores = (params = {}) => {
  return useQuery({
    queryKey: ['stores', params],
    queryFn: () => storeApi.getAll(params).then(res => res.data),
  });
};

export const useStore = (id) => {
  return useQuery({
    queryKey: ['store', id],
    queryFn: () => storeApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useStoreStock = (storeId, params = {}) => {
  return useQuery({
    queryKey: ['stores', storeId, 'stock', params],
    queryFn: () => storeApi.getStock(storeId, params).then(res => res.data),
    enabled: !!storeId,
  });
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => storeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['stores']);
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => storeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['stores']);
      queryClient.invalidateQueries(['store']);
    },
  });
};

/**
 * Prescription Hooks
 */
export const usePrescriptions = (params = {}) => {
  return useQuery({
    queryKey: ['prescriptions', params],
    queryFn: () => prescriptionApi.getAll(params).then(res => res.data),
  });
};

export const usePrescription = (id) => {
  return useQuery({
    queryKey: ['prescription', id],
    queryFn: () => prescriptionApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const usePrescriptionsByPatient = (patientId, params = {}) => {
  return useQuery({
    queryKey: ['prescriptions', 'patient', patientId, params],
    queryFn: () => prescriptionApi.getByPatient(patientId, params).then(res => res.data),
    enabled: !!patientId,
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => prescriptionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['prescriptions']);
    },
  });
};

export const useUpdatePrescription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => prescriptionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['prescriptions']);
      queryClient.invalidateQueries(['prescription']);
    },
  });
};

export const useCancelPrescription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => prescriptionApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['prescriptions']);
      queryClient.invalidateQueries(['prescription']);
    },
  });
};

/**
 * Dispense Hooks
 */
export const useDispenses = (params = {}) => {
  return useQuery({
    queryKey: ['dispenses', params],
    queryFn: () => dispenseApi.getAll(params).then(res => res.data),
  });
};

export const useDispense = (id) => {
  return useQuery({
    queryKey: ['dispense', id],
    queryFn: () => dispenseApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useDispensesByPrescription = (prescriptionId) => {
  return useQuery({
    queryKey: ['dispenses', 'prescription', prescriptionId],
    queryFn: () => dispenseApi.getByPrescription(prescriptionId).then(res => res.data),
    enabled: !!prescriptionId,
  });
};

export const useDispensesByPatient = (patientId, params = {}) => {
  return useQuery({
    queryKey: ['dispenses', 'patient', patientId, params],
    queryFn: () => dispenseApi.getByPatient(patientId, params).then(res => res.data),
    enabled: !!patientId,
  });
};

export const useCreateDispense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => dispenseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['dispenses']);
      queryClient.invalidateQueries(['prescriptions']);
      queryClient.invalidateQueries(['drugs']);
    },
  });
};

/**
 * Supplier Hooks
 */
export const useSuppliers = (params = {}) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => supplierApi.getAll(params).then(res => res.data),
  });
};

export const useSupplier = (id) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => supplierApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => supplierApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => supplierApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      queryClient.invalidateQueries(['supplier']);
    },
  });
};

/**
 * Purchase Order Hooks
 */
export const usePurchaseOrders = (params = {}) => {
  return useQuery({
    queryKey: ['purchase-orders', params],
    queryFn: () => purchaseOrderApi.getAll(params).then(res => res.data),
  });
};

export const usePurchaseOrder = (id) => {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => purchaseOrderApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => purchaseOrderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
    },
  });
};

export const useSubmitPurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => purchaseOrderApi.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      queryClient.invalidateQueries(['purchase-order']);
    },
  });
};

export const useApprovePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => purchaseOrderApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      queryClient.invalidateQueries(['purchase-order']);
    },
  });
};

export const useCancelPurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => purchaseOrderApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      queryClient.invalidateQueries(['purchase-order']);
    },
  });
};

/**
 * Goods Received Note Hooks
 */
export const useCreateGRN = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => grnApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      queryClient.invalidateQueries(['batches']);
      queryClient.invalidateQueries(['drugs']);
    },
  });
};

/**
 * Stock Movement Hooks
 */
export const useStockMovements = (params = {}) => {
  return useQuery({
    queryKey: ['stock-movements', params],
    queryFn: () => stockMovementApi.getAll(params).then(res => res.data),
  });
};

export const useStockMovementsByDrug = (drugId, params = {}) => {
  return useQuery({
    queryKey: ['stock-movements', 'drug', drugId, params],
    queryFn: () => stockMovementApi.getByDrug(drugId, params).then(res => res.data),
    enabled: !!drugId,
  });
};

export const useStockMovementsByStore = (storeId, params = {}) => {
  return useQuery({
    queryKey: ['stock-movements', 'store', storeId, params],
    queryFn: () => stockMovementApi.getByStore(storeId, params).then(res => res.data),
    enabled: !!storeId,
  });
};
