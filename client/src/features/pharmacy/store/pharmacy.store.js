import { create } from 'zustand';

/**
 * Pharmacy Store - UI State Only
 * 
 * Per AGENTS.md: Use Zustand ONLY for UI state, filters, modal state,
 * temporary selections, carts, and drafts.
 * 
 * Do NOT use as source of truth for invoices, balances, stock, receipts, payments.
 */

const initialState = {
  // Filters
  drugFilters: {
    search: '',
    categoryId: null,
    storeId: null,
    lowStockOnly: false,
    expiringOnly: false,
  },
  
  // Modal States
  modals: {
    drugForm: false,
    batchForm: false,
    dispenseForm: false,
    prescriptionForm: false,
    purchaseOrderForm: false,
    stockAdjustmentForm: false,
    transferForm: false,
  },
  
  // Temporary Selections
  selectedDrug: null,
  selectedBatch: null,
  selectedPrescription: null,
  selectedStore: null,
  
  // Dispensing Cart (temporary draft)
  dispensingCart: {
    prescriptionId: null,
    items: [],
    storeId: null,
    notes: '',
  },
  
  // Purchase Order Draft
  purchaseOrderDraft: {
    supplierId: null,
    items: [],
    notes: '',
  },
  
  // UI State
  activeTab: 'drugs',
  sidebarOpen: true,
};

export const usePharmacyStore = create((set, get) => ({
  ...initialState,
  
  // Filter Actions
  setDrugFilters: (filters) => set((state) => ({
    drugFilters: { ...state.drugFilters, ...filters }
  })),
  
  resetDrugFilters: () => set((state) => ({
    drugFilters: initialState.drugFilters
  })),
  
  // Modal Actions
  openModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: true }
  })),
  
  closeModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: false }
  })),
  
  toggleModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: !state.modals[modalName] }
  })),
  
  // Selection Actions
  setSelectedDrug: (drug) => set({ selectedDrug: drug }),
  clearSelectedDrug: () => set({ selectedDrug: null }),
  
  setSelectedBatch: (batch) => set({ selectedBatch: batch }),
  clearSelectedBatch: () => set({ selectedBatch: null }),
  
  setSelectedPrescription: (prescription) => set({ selectedPrescription: prescription }),
  clearSelectedPrescription: () => set({ selectedPrescription: null }),
  
  setSelectedStore: (store) => set({ selectedStore: store }),
  clearSelectedStore: () => set({ selectedStore: null }),
  
  // Dispensing Cart Actions
  addToDispensingCart: (item) => set((state) => ({
    dispensingCart: {
      ...state.dispensingCart,
      items: [...state.dispensingCart.items, item]
    }
  })),
  
  removeFromDispensingCart: (index) => set((state) => ({
    dispensingCart: {
      ...state.dispensingCart,
      items: state.dispensingCart.items.filter((_, i) => i !== index)
    }
  })),
  
  updateDispensingCartItem: (index, updates) => set((state) => ({
    dispensingCart: {
      ...state.dispensingCart,
      items: state.dispensingCart.items.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      )
    }
  })),
  
  setDispensingCartPrescription: (prescriptionId) => set((state) => ({
    dispensingCart: { ...state.dispensingCart, prescriptionId }
  })),
  
  setDispensingCartStore: (storeId) => set((state) => ({
    dispensingCart: { ...state.dispensingCart, storeId }
  })),
  
  setDispensingCartNotes: (notes) => set((state) => ({
    dispensingCart: { ...state.dispensingCart, notes }
  })),
  
  clearDispensingCart: () => set((state) => ({
    dispensingCart: initialState.dispensingCart
  })),
  
  // Purchase Order Draft Actions
  setPurchaseOrderSupplier: (supplierId) => set((state) => ({
    purchaseOrderDraft: { ...state.purchaseOrderDraft, supplierId }
  })),
  
  addToPurchaseOrderDraft: (item) => set((state) => ({
    purchaseOrderDraft: {
      ...state.purchaseOrderDraft,
      items: [...state.purchaseOrderDraft.items, item]
    }
  })),
  
  removeFromPurchaseOrderDraft: (index) => set((state) => ({
    purchaseOrderDraft: {
      ...state.purchaseOrderDraft,
      items: state.purchaseOrderDraft.items.filter((_, i) => i !== index)
    }
  })),
  
  clearPurchaseOrderDraft: () => set((state) => ({
    purchaseOrderDraft: initialState.purchaseOrderDraft
  })),
  
  // UI State Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  // Reset All
  reset: () => set(initialState),
}));
