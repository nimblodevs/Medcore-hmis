import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import { round2, toNumber } from "../utils/money.js";
import { prescriptionNo as generatePrescriptionNo } from "../utils/numbering.js";

const StockMovementType = {
  PURCHASE_RECEIPT: "PURCHASE_RECEIPT",
  SALE: "SALE",
  DISPENSE: "DISPENSE",
  RETURN: "RETURN",
  ADJUSTMENT: "ADJUSTMENT"
};

const PurchaseOrderStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  PARTIALLY_RECEIVED: "PARTIALLY_RECEIVED",
  FULLY_RECEIVED: "FULLY_RECEIVED",
  CANCELLED: "CANCELLED"
};

const BillingType = {
  CASH: "CASH",
  CREDIT: "CREDIT",
  INSURANCE: "INSURANCE"
};

const assertTenantBranchAccess = (record, context) => {
  if (context.tenantId && record.tenantId !== context.tenantId) {
    throw new ApiError(403, "Cross-tenant access denied");
  }
  if (context.branchId && record.branchId !== context.branchId) {
    throw new ApiError(403, "Branch access denied");
  }
};

// ==================== DRUG CATEGORY SERVICES ====================

export const listDrugCategories = async (context = {}) => {
  const where = {
    deletedAt: null,
    ...(context.tenantId ? { tenantId: context.tenantId } : {})
  };

  const categories = await prisma.drugCategory.findMany({
    where,
    include: {
      parent: true,
      _count: { select: { drugs: true } }
    },
    orderBy: { name: 'asc' }
  });

  return categories;
};

export const getDrugCategory = async (id, context = {}) => {
  const category = await prisma.drugCategory.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    },
    include: {
      parent: true,
      children: true,
      drugs: {
        where: { deletedAt: null },
        take: 10,
        select: {
          id: true,
          name: true,
          drugCode: true,
          isActive: true
        }
      }
    }
  });

  if (!category) throw new ApiError(404, "Drug category not found");
  assertTenantBranchAccess(category, context);

  return category;
};

export const createDrugCategory = async (data, auth, context = {}) => {
  const existing = await prisma.drugCategory.findFirst({
    where: {
      tenantId: context.tenantId,
      code: data.code,
      deletedAt: null
    }
  });

  if (existing) throw new ApiError(409, "Drug category code already exists");

  if (data.parentId) {
    const parent = await prisma.drugCategory.findFirst({
      where: {
        id: data.parentId,
        tenantId: context.tenantId,
        deletedAt: null
      }
    });
    if (!parent) throw new ApiError(404, "Parent category not found");
  }

  const category = await prisma.drugCategory.create({
    data: {
      tenantId: context.tenantId,
      name: data.name,
      code: data.code,
      description: data.description,
      parentId: data.parentId,
      isActive: data.isActive ?? true,
      createdById: auth.userId
    }
  });

  return category;
};

export const updateDrugCategory = async (id, data, auth, context = {}) => {
  const category = await prisma.drugCategory.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      deletedAt: null
    }
  });

  if (!category) throw new ApiError(404, "Drug category not found");
  assertTenantBranchAccess(category, context);

  if (data.code && data.code !== category.code) {
    const existing = await prisma.drugCategory.findFirst({
      where: {
        tenantId: context.tenantId,
        code: data.code,
        id: { not: id },
        deletedAt: null
      }
    });
    if (existing) throw new ApiError(409, "Drug category code already exists");
  }

  const updated = await prisma.drugCategory.update({
    where: { id },
    data: {
      name: data.name,
      code: data.code,
      description: data.description,
      parentId: data.parentId,
      isActive: data.isActive,
      updatedById: auth.userId
    }
  });

  return updated;
};

export const deleteDrugCategory = async (id, auth, context = {}) => {
  const category = await prisma.drugCategory.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      deletedAt: null
    },
    include: {
      drugs: { where: { deletedAt: null }, take: 1 }
    }
  });

  if (!category) throw new ApiError(404, "Drug category not found");
  assertTenantBranchAccess(category, context);

  if (category.drugs.length > 0) {
    throw new ApiError(400, "Cannot delete category with associated drugs");
  }

  const updated = await prisma.drugCategory.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      updatedById: auth.userId
    }
  });

  return updated;
};

// ==================== DRUG SERVICES ====================

export const listDrugs = async (filters = {}, context = {}) => {
  const { search, categoryId, isActive, requiresPrescription, isControlledSubstance } = filters;
  
  const where = {
    deletedAt: null,
    ...(context.tenantId ? { tenantId: context.tenantId } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { brandName: { contains: search, mode: 'insensitive' } },
        { drugCode: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } }
      ]
    } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
    ...(requiresPrescription !== undefined ? { requiresPrescription } : {}),
    ...(isControlledSubstance !== undefined ? { isControlledSubstance } : {})
  };

  const drugs = await prisma.drug.findMany({
    where,
    include: {
      category: true,
      batches: {
        where: { deletedAt: null },
        select: {
          id: true,
          batchNumber: true,
          expiryDate: true,
          currentStock: true,
          sellingPrice: true
        },
        orderBy: { expiryDate: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  return drugs;
};

export const getDrug = async (id, context = {}) => {
  const drug = await prisma.drug.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    },
    include: {
      category: true,
      batches: {
        where: { deletedAt: null },
        orderBy: { expiryDate: 'asc' }
      },
      _count: {
        select: {
          prescriptionItems: true,
          dispenseItems: true,
          purchaseOrderItems: true
        }
      }
    }
  });

  if (!drug) throw new ApiError(404, "Drug not found");
  assertTenantBranchAccess(drug, context);

  // Calculate total stock across all batches
  const totalStock = drug.batches.reduce((sum, batch) => sum + batch.currentStock, 0);
  
  return { ...drug, totalStock };
};

export const createDrug = async (data, auth, context = {}) => {
  const existing = await prisma.drug.findFirst({
    where: {
      tenantId: context.tenantId,
      drugCode: data.drugCode,
      deletedAt: null
    }
  });

  if (existing) throw new ApiError(409, "Drug code already exists");

  if (data.categoryId) {
    const category = await prisma.drugCategory.findFirst({
      where: {
        id: data.categoryId,
        tenantId: context.tenantId,
        deletedAt: null
      }
    });
    if (!category) throw new ApiError(404, "Drug category not found");
  }

  const drug = await prisma.drug.create({
    data: {
      tenantId: context.tenantId,
      categoryId: data.categoryId,
      name: data.name,
      genericName: data.genericName,
      brandName: data.brandName,
      drugCode: data.drugCode,
      barcode: data.barcode,
      dosageForm: data.dosageForm,
      strength: data.strength,
      unitOfMeasure: data.unitOfMeasure,
      packSize: data.packSize,
      manufacturer: data.manufacturer,
      requiresPrescription: data.requiresPrescription ?? false,
      isControlledSubstance: data.isControlledSubstance ?? false,
      storageConditions: data.storageConditions,
      shelfLife: data.shelfLife,
      reorderLevel: data.reorderLevel ?? 10,
      maxStockLevel: data.maxStockLevel,
      standardPrice: toNumber(data.standardPrice) || 0,
      sellingPrice: toNumber(data.sellingPrice) || 0,
      taxRate: toNumber(data.taxRate) || 0,
      isActive: data.isActive ?? true,
      notes: data.notes,
      createdById: auth.userId
    }
  });

  return drug;
};

export const updateDrug = async (id, data, auth, context = {}) => {
  const drug = await prisma.drug.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      deletedAt: null
    }
  });

  if (!drug) throw new ApiError(404, "Drug not found");
  assertTenantBranchAccess(drug, context);

  if (data.drugCode && data.drugCode !== drug.drugCode) {
    const existing = await prisma.drug.findFirst({
      where: {
        tenantId: context.tenantId,
        drugCode: data.drugCode,
        id: { not: id },
        deletedAt: null
      }
    });
    if (existing) throw new ApiError(409, "Drug code already exists");
  }

  const updated = await prisma.drug.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
      name: data.name,
      genericName: data.genericName,
      brandName: data.brandName,
      drugCode: data.drugCode,
      barcode: data.barcode,
      dosageForm: data.dosageForm,
      strength: data.strength,
      unitOfMeasure: data.unitOfMeasure,
      packSize: data.packSize,
      manufacturer: data.manufacturer,
      requiresPrescription: data.requiresPrescription,
      isControlledSubstance: data.isControlledSubstance,
      storageConditions: data.storageConditions,
      shelfLife: data.shelfLife,
      reorderLevel: data.reorderLevel,
      maxStockLevel: data.maxStockLevel,
      standardPrice: data.standardPrice !== undefined ? toNumber(data.standardPrice) : undefined,
      sellingPrice: data.sellingPrice !== undefined ? toNumber(data.sellingPrice) : undefined,
      taxRate: data.taxRate !== undefined ? toNumber(data.taxRate) : undefined,
      isActive: data.isActive,
      notes: data.notes,
      updatedById: auth.userId
    }
  });

  return updated;
};

export const deleteDrug = async (id, auth, context = {}) => {
  const drug = await prisma.drug.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      deletedAt: null
    },
    include: {
      batches: { where: { deletedAt: null }, take: 1 }
    }
  });

  if (!drug) throw new ApiError(404, "Drug not found");
  assertTenantBranchAccess(drug, context);

  if (drug.batches.length > 0) {
    throw new ApiError(400, "Cannot delete drug with existing batches. Deactivate instead.");
  }

  const updated = await prisma.drug.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      updatedById: auth.userId
    }
  });

  return updated;
};

// Get low stock drugs
export const getLowStockDrugs = async (context = {}) => {
  const drugs = await prisma.drug.findMany({
    where: {
      tenantId: context.tenantId,
      deletedAt: null,
      isActive: true
    },
    include: {
      batches: {
        where: { deletedAt: null },
        select: { currentStock: true }
      }
    }
  });

  const lowStockDrugs = drugs.filter(drug => {
    const totalStock = drug.batches.reduce((sum, batch) => sum + batch.currentStock, 0);
    return totalStock <= drug.reorderLevel;
  }).map(drug => {
    const totalStock = drug.batches.reduce((sum, batch) => sum + batch.currentStock, 0);
    return {
      ...drug,
      totalStock,
      stockDeficit: drug.reorderLevel - totalStock
    };
  });

  return lowStockDrugs;
};

// Get expiring drugs
export const getExpiringDrugs = async (daysThreshold = 30, context = {}) => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

  const batches = await prisma.drugBatch.findMany({
    where: {
      tenantId: context.tenantId,
      deletedAt: null,
      expiryDate: { lte: thresholdDate },
      currentStock: { gt: 0 }
    },
    include: {
      drug: {
        select: {
          id: true,
          name: true,
          drugCode: true,
          dosageForm: true,
          strength: true
        }
      }
    },
    orderBy: { expiryDate: 'asc' }
  });

  return batches.map(batch => ({
    ...batch,
    daysToExpiry: Math.ceil((batch.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
  }));
};

// ==================== DRUG BATCH SERVICES ====================

export const listDrugBatches = async (filters = {}, context = {}) => {
  const { drugId, storeId, expiryBefore, expiryAfter } = filters;

  const where = {
    deletedAt: null,
    ...(context.tenantId ? { tenantId: context.tenantId } : {}),
    ...(drugId ? { drugId } : {}),
    ...(storeId ? { storeId } : {}),
    ...(expiryBefore ? { expiryDate: { lte: new Date(expiryBefore) } } : {}),
    ...(expiryAfter ? { expiryDate: { gte: new Date(expiryAfter) } } : {})
  };

  const batches = await prisma.drugBatch.findMany({
    where,
    include: {
      drug: {
        select: {
          id: true,
          name: true,
          drugCode: true,
          dosageForm: true,
          strength: true
        }
      },
      store: true,
      supplier: {
        select: {
          id: true,
          name: true,
          code: true
        }
      }
    },
    orderBy: { expiryDate: 'asc' }
  });

  return batches;
};

export const getDrugBatch = async (id, context = {}) => {
  const batch = await prisma.drugBatch.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    },
    include: {
      drug: true,
      store: true,
      supplier: true,
      stockMovements: {
        take: 20,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!batch) throw new ApiError(404, "Drug batch not found");
  assertTenantBranchAccess(batch, context);

  return batch;
};

export const createDrugBatch = async (data, auth, context = {}) => {
  const drug = await prisma.drug.findFirst({
    where: {
      id: data.drugId,
      tenantId: context.tenantId,
      deletedAt: null
    }
  });

  if (!drug) throw new ApiError(404, "Drug not found");

  if (data.storeId) {
    const store = await prisma.pharmacyStore.findFirst({
      where: {
        id: data.storeId,
        tenantId: context.tenantId,
        deletedAt: null
      }
    });
    if (!store) throw new ApiError(404, "Pharmacy store not found");
  }

  if (data.supplierId) {
    const supplier = await prisma.supplier.findFirst({
      where: {
        id: data.supplierId,
        tenantId: context.tenantId,
        deletedAt: null
      }
    });
    if (!supplier) throw new ApiError(404, "Supplier not found");
  }

  const existing = await prisma.drugBatch.findFirst({
    where: {
      tenantId: context.tenantId,
      drugId: data.drugId,
      batchNumber: data.batchNumber,
      deletedAt: null
    }
  });

  if (existing) throw new ApiError(409, "Batch number already exists for this drug");

  const batch = await prisma.drugBatch.create({
    data: {
      tenantId: context.tenantId,
      drugId: data.drugId,
      batchNumber: data.batchNumber,
      supplierId: data.supplierId,
      storeId: data.storeId,
      manufactureDate: data.manufactureDate ? new Date(data.manufactureDate) : null,
      expiryDate: new Date(data.expiryDate),
      quantityReceived: data.quantityReceived ?? 0,
      currentStock: data.currentStock ?? data.quantityReceived ?? 0,
      costPrice: toNumber(data.costPrice) || 0,
      sellingPrice: toNumber(data.sellingPrice) || drug.sellingPrice || 0,
      isLocked: data.isLocked ?? false,
      notes: data.notes,
      createdById: auth.userId
    }
  });

  return batch;
};

export const updateDrugBatch = async (id, data, auth, context = {}) => {
  const batch = await prisma.drugBatch.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      deletedAt: null
    }
  });

  if (!batch) throw new ApiError(404, "Drug batch not found");
  assertTenantBranchAccess(batch, context);

  const updated = await prisma.drugBatch.update({
    where: { id },
    data: {
      batchNumber: data.batchNumber,
      supplierId: data.supplierId,
      storeId: data.storeId,
      manufactureDate: data.manufactureDate ? new Date(data.manufactureDate) : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      costPrice: data.costPrice !== undefined ? toNumber(data.costPrice) : undefined,
      sellingPrice: data.sellingPrice !== undefined ? toNumber(data.sellingPrice) : undefined,
      isLocked: data.isLocked,
      notes: data.notes,
      updatedById: auth.userId
    }
  });

  return updated;
};

// FEFO: Get batches for dispensing (First Expiry First Out)
export const getBatchesForDispensing = async (drugId, quantity, context = {}) => {
  const batches = await prisma.drugBatch.findMany({
    where: {
      tenantId: context.tenantId,
      drugId,
      deletedAt: null,
      currentStock: { gt: 0 },
      expiryDate: { gt: new Date() }, // Exclude expired batches
      isLocked: false
    },
    orderBy: { expiryDate: 'asc' } // FEFO: First Expiry First Out
  });

  const allocatedBatches = [];
  let remainingQuantity = quantity;

  for (const batch of batches) {
    if (remainingQuantity <= 0) break;

    const allocateFromBatch = Math.min(batch.currentStock, remainingQuantity);
    allocatedBatches.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      quantity: allocateFromBatch,
      sellingPrice: batch.sellingPrice
    });

    remainingQuantity -= allocateFromBatch;
  }

  if (remainingQuantity > 0) {
    throw new ApiError(400, `Insufficient stock. Available: ${quantity - remainingQuantity}, Required: ${quantity}`);
  }

  return allocatedBatches;
};

// ==================== PHARMACY STORE SERVICES ====================

export const listPharmacyStores = async (context = {}) => {
  const stores = await prisma.pharmacyStore.findMany({
    where: {
      tenantId: context.tenantId,
      branchId: context.branchId,
      deletedAt: null
    },
    include: {
      branch: true,
      _count: {
        select: {
          batches: { where: { deletedAt: null } },
          transfersFrom: true,
          transfersTo: true,
          adjustments: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  return stores;
};

export const getPharmacyStore = async (id, context = {}) => {
  const store = await prisma.pharmacyStore.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      branchId: context.branchId,
      deletedAt: null
    },
    include: {
      branch: true,
      batches: {
        where: { deletedAt: null, currentStock: { gt: 0 } },
        include: {
          drug: {
            select: {
              id: true,
              name: true,
              drugCode: true,
              dosageForm: true,
              strength: true
            }
          }
        },
        orderBy: { drug: { name: 'asc' } }
      }
    }
  });

  if (!store) throw new ApiError(404, "Pharmacy store not found");
  assertTenantBranchAccess(store, context);

  return store;
};

export const createPharmacyStore = async (data, auth, context = {}) => {
  const existing = await prisma.pharmacyStore.findFirst({
    where: {
      tenantId: context.tenantId,
      branchId: context.branchId,
      code: data.code,
      deletedAt: null
    }
  });

  if (existing) throw new ApiError(409, "Store code already exists in this branch");

  const store = await prisma.pharmacyStore.create({
    data: {
      tenantId: context.tenantId,
      branchId: context.branchId,
      name: data.name,
      code: data.code,
      description: data.description,
      storeType: data.storeType ?? 'MAIN',
      isActive: data.isActive ?? true,
      createdById: auth.userId
    }
  });

  return store;
};

export const updatePharmacyStore = async (id, data, auth, context = {}) => {
  const store = await prisma.pharmacyStore.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      branchId: context.branchId,
      deletedAt: null
    }
  });

  if (!store) throw new ApiError(404, "Pharmacy store not found");
  assertTenantBranchAccess(store, context);

  if (data.code && data.code !== store.code) {
    const existing = await prisma.pharmacyStore.findFirst({
      where: {
        tenantId: context.tenantId,
        branchId: context.branchId,
        code: data.code,
        id: { not: id },
        deletedAt: null
      }
    });
    if (existing) throw new ApiError(409, "Store code already exists in this branch");
  }

  const updated = await prisma.pharmacyStore.update({
    where: { id },
    data: {
      name: data.name,
      code: data.code,
      description: data.description,
      storeType: data.storeType,
      isActive: data.isActive,
      updatedById: auth.userId
    }
  });

  return updated;
};

export const deletePharmacyStore = async (id, auth, context = {}) => {
  const store = await prisma.pharmacyStore.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      branchId: context.branchId,
      deletedAt: null
    },
    include: {
      batches: { where: { deletedAt: null, currentStock: { gt: 0 } }, take: 1 }
    }
  });

  if (!store) throw new ApiError(404, "Pharmacy store not found");
  assertTenantBranchAccess(store, context);

  if (store.batches.length > 0) {
    throw new ApiError(400, "Cannot delete store with existing stock. Transfer stock first.");
  }

  const updated = await prisma.pharmacyStore.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      updatedById: auth.userId
    }
  });

  return updated;
};

// ==================== PRESCRIPTION SERVICES ====================

export const listPrescriptions = async (filters = {}, context = {}) => {
  const { patientId, visitId, status, dateFrom, dateTo } = filters;

  const where = {
    deletedAt: null,
    tenantId: context.tenantId,
    branchId: context.branchId,
    ...(patientId ? { patientId } : {}),
    ...(visitId ? { visitId } : {}),
    ...(status ? { status } : {}),
    ...(dateFrom ? { prescriptionDate: { gte: new Date(dateFrom) } } : {}),
    ...(dateTo ? { prescriptionDate: { lte: new Date(dateTo) } } : {})
  };

  const prescriptions = await prisma.prescription.findMany({
    where,
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          mrn: true
        }
      },
      visit: {
        select: {
          id: true,
          visitNo: true,
          visitType: true
        }
      },
      items: {
        include: {
          drug: {
            select: {
              id: true,
              name: true,
              drugCode: true,
              dosageForm: true,
              strength: true
            }
          }
        }
      },
      dispenses: {
        select: {
          id: true,
          dispenseNo: true,
          dispenseDate: true,
          status: true
        }
      }
    },
    orderBy: { prescriptionDate: 'desc' }
  });

  return prescriptions;
};

export const getPrescription = async (id, context = {}) => {
  const prescription = await prisma.prescription.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      branchId: context.branchId,
      deletedAt: null
    },
    include: {
      patient: true,
      visit: true,
      items: {
        include: {
          drug: true,
          dispenseItems: {
            include: {
              batch: true,
              dispense: true
            }
          }
        }
      },
      dispenses: true
    }
  });

  if (!prescription) throw new ApiError(404, "Prescription not found");
  assertTenantBranchAccess(prescription, context);

  return prescription;
};

export const createPrescription = async (data, auth, context = {}) => {
  // Validate patient and visit
  const visit = await prisma.visit.findFirst({
    where: {
      id: data.visitId,
      tenantId: context.tenantId,
      branchId: context.branchId,
      deletedAt: null
    }
  });

  if (!visit) throw new ApiError(404, "Visit not found");

  if (visit.patientId !== data.patientId) {
    throw new ApiError(400, "Patient does not match visit");
  }

  // Generate prescription number
  const prescriptionCount = await prisma.prescription.count({
    where: {
      tenantId: context.tenantId,
      branchId: context.branchId
    }
  });
  const prescriptionNumber = generatePrescriptionNo(prescriptionCount);

  const prescription = await prisma.prescription.create({
    data: {
      tenantId: context.tenantId,
      branchId: context.branchId,
      patientId: data.patientId,
      visitId: data.visitId,
      prescriptionNo: prescriptionNumber,
      prescriptionDate: new Date(),
      prescriberName: data.prescriberName,
      prescriberId: data.prescriberId,
      diagnosis: data.diagnosis,
      notes: data.notes,
      status: 'PENDING',
      createdById: auth.userId,
      items: {
        create: data.items?.map(item => ({
          tenantId: context.tenantId,
          drugId: item.drugId,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          durationUnit: item.durationUnit,
          instructions: item.instructions,
          quantityPrescribed: item.quantityPrescribed,
          unitPrice: toNumber(item.unitPrice) || 0,
          totalAmount: toNumber(item.totalAmount) || 0
        })) || []
      }
    },
    include: {
      items: {
        include: {
          drug: true
        }
      }
    }
  });

  return prescription;
};

export const updatePrescription = async (id, data, auth, context = {}) => {
  const prescription = await prisma.prescription.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      branchId: context.branchId,
      deletedAt: null
    }
  });

  if (!prescription) throw new ApiError(404, "Prescription not found");
  assertTenantBranchAccess(prescription, context);

  if (prescription.status !== 'PENDING' && prescription.status !== 'PARTIALLY_DISPENSED') {
    throw new ApiError(400, "Cannot modify prescription that has been dispensed");
  }

  const updated = await prisma.prescription.update({
    where: { id },
    data: {
      prescriberName: data.prescriberName,
      prescriberId: data.prescriberId,
      diagnosis: data.diagnosis,
      notes: data.notes,
      updatedById: auth.userId,
      items: data.items ? {
        deleteMany: {},
        create: data.items.map(item => ({
          tenantId: context.tenantId,
          drugId: item.drugId,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          durationUnit: item.durationUnit,
          instructions: item.instructions,
          quantityPrescribed: item.quantityPrescribed,
          unitPrice: toNumber(item.unitPrice) || 0,
          totalAmount: toNumber(item.totalAmount) || 0
        }))
      } : undefined
    },
    include: {
      items: {
        include: {
          drug: true
        }
      }
    }
  });

  return updated;
};

export const cancelPrescription = async (id, comments, auth, context = {}) => {
  const prescription = await prisma.prescription.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      branchId: context.branchId,
      deletedAt: null
    }
  });

  if (!prescription) throw new ApiError(404, "Prescription not found");
  assertTenantBranchAccess(prescription, context);

  if (prescription.status === 'DISPENSED') {
    throw new ApiError(400, "Cannot cancel fully dispensed prescription");
  }

  const updated = await prisma.prescription.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      notes: comments ? `${prescription.notes || ''}\n[CANCELLED]: ${comments}` : prescription.notes,
      updatedById: auth.userId
    }
  });

  return updated;
};

// ==================== DISPENSE SERVICES ====================

export const listDispenses = async (filters = {}, context = {}) => {
  const { prescriptionId, saleId, billingType, paymentStatus, dateFrom, dateTo } = filters;

  const where = {
    tenantId: context.tenantId,
    branchId: context.branchId,
    ...(prescriptionId ? { prescriptionId } : {}),
    ...(saleId ? { saleId } : {}),
    ...(billingType ? { billingType } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(dateFrom ? { dispenseDate: { gte: new Date(dateFrom) } } : {}),
    ...(dateTo ? { dispenseDate: { lte: new Date(dateTo) } } : {})
  };

  const dispenses = await prisma.dispense.findMany({
    where,
    include: {
      prescription: {
        select: {
          id: true,
          prescriptionNo: true,
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              mrn: true
            }
          }
        }
      },
      items: {
        include: {
          drug: {
            select: {
              id: true,
              name: true,
              drugCode: true,
              dosageForm: true,
              strength: true
            }
          },
          batch: {
            select: {
              id: true,
              batchNumber: true,
              expiryDate: true
            }
          }
        }
      },
      insuranceScheme: {
        select: {
          id: true,
          name: true,
          code: true
        }
      }
    },
    orderBy: { dispenseDate: 'desc' }
  });

  return dispenses;
};

export const getDispense = async (id, context = {}) => {
  const dispense = await prisma.dispense.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      branchId: context.branchId
    },
    include: {
      prescription: true,
      items: {
        include: {
          drug: true,
          batch: true,
          prescriptionItem: true
        }
      },
      insuranceScheme: true
    }
  });

  if (!dispense) throw new ApiError(404, "Dispense record not found");
  assertTenantBranchAccess(dispense, context);

  return dispense;
};

export const createDispense = async (data, auth, context = {}) => {
  const { prescriptionId, items, billingType, insuranceSchemeId, authorizationNo, notes } = data;

  // Validate prescription if provided
  let prescription = null;
  if (prescriptionId) {
    prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        tenantId: context.tenantId,
        branchId: context.branchId,
        deletedAt: null
      },
      include: {
        items: true
      }
    });

    if (!prescription) throw new ApiError(404, "Prescription not found");

    if (prescription.status === 'DISPENSED') {
      throw new ApiError(400, "Prescription already fully dispensed");
    }

    if (prescription.status === 'CANCELLED') {
      throw new ApiError(400, "Cannot dispense cancelled prescription");
    }
  }

  // Validate insurance scheme if provided
  if (billingType === BillingType.INSURANCE && insuranceSchemeId) {
    const scheme = await prisma.insuranceScheme.findFirst({
      where: {
        id: insuranceSchemeId,
        tenantId: context.tenantId,
        deletedAt: null
      }
    });
    if (!scheme) throw new ApiError(404, "Insurance scheme not found");
    
    if (scheme.requiresAuthorization && !authorizationNo) {
      throw new ApiError(400, "Authorization number required for this insurance scheme");
    }
  }

  // Process items and validate stock using FEFO
  const processedItems = [];
  let grossAmount = 0;

  for (const item of items) {
    // Get batches using FEFO
    const batches = await getBatchesForDispensing(item.drugId, item.quantity, context);
    
    // Calculate item amount
    const drug = await prisma.drug.findFirst({
      where: { id: item.drugId, tenantId: context.tenantId }
    });
    
    if (!drug) throw new ApiError(404, `Drug not found: ${item.drugId}`);

    const unitPrice = item.unitPrice || drug.sellingPrice;
    const discountPercent = item.discountPercent || 0;
    const itemTotal = round2(toNumber(unitPrice) * item.quantity * (1 - toNumber(discountPercent) / 100));

    grossAmount = round2(grossAmount + itemTotal);

    processedItems.push({
      prescriptionItemId: item.prescriptionItemId,
      drugId: item.drugId,
      batchId: batches[0].batchId, // Primary batch
      quantity: item.quantity,
      unitPrice: toNumber(unitPrice),
      discountPercent: toNumber(discountPercent),
      totalAmount: itemTotal,
      batches // Store all batches used for FEFO
    });
  }

  // Calculate totals
  const discountAmount = toNumber(data.discountAmount) || 0;
  const netAmount = round2(grossAmount - discountAmount);
  const amountPaid = toNumber(data.amountPaid) || 0;
  const outstandingAmount = round2(netAmount - amountPaid);

  let paymentStatus = 'PENDING';
  if (amountPaid >= netAmount) {
    paymentStatus = 'PAID';
  } else if (amountPaid > 0) {
    paymentStatus = 'PARTIALLY_PAID';
  }

  // Generate dispense number
  const dispenseNumber = await generateDispenseNo(context.tenantId, context.branchId);

  const dispense = await prisma.$transaction(async (tx) => {
    // Create dispense record
    const createdDispense = await tx.dispense.create({
      data: {
        tenantId: context.tenantId,
        branchId: context.branchId,
        prescriptionId,
        dispenseNo: dispenseNumber,
        dispenseDate: new Date(),
        billingType,
        insuranceSchemeId,
        authorizationNo,
        grossAmount,
        discountAmount,
        netAmount,
        amountPaid,
        outstandingAmount,
        paymentStatus,
        notes,
        dispensedById: auth.userId,
        createdById: auth.userId
      }
    });

    // Create dispense items and update stock
    for (const item of processedItems) {
      await tx.dispenseItem.create({
        data: {
          tenantId: context.tenantId,
          dispenseId: createdDispense.id,
          prescriptionItemId: item.prescriptionItemId,
          drugId: item.drugId,
          batchId: item.batchId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          totalAmount: item.totalAmount
        }
      });

      // Update batch stock
      await tx.drugBatch.update({
        where: { id: item.batchId },
        data: {
          quantityDispensed: { increment: item.quantity },
          currentStock: { decrement: item.quantity }
        }
      });

      // Create stock movement record
      const batch = await tx.drugBatch.findFirst({
        where: { id: item.batchId },
        include: { store: true }
      });

      const stockBefore = batch.currentStock;
      const stockAfter = stockBefore - item.quantity;

      await tx.stockMovement.create({
        data: {
          tenantId: context.tenantId,
          branchId: context.branchId,
          storeId: batch.storeId,
          drugId: item.drugId,
          batchId: item.batchId,
          movementType: StockMovementType.DISPENSE,
          quantity: -item.quantity,
          quantityBefore: stockBefore,
          quantityAfter: stockAfter,
          costAmount: item.totalAmount,
          referenceType: 'DISPENSE',
          referenceId: createdDispense.id,
          createdById: auth.userId
        }
      });
    }

    // Update prescription status if linked
    if (prescription) {
      const allItemsDispensed = prescription.items.every(pi => {
        const dispensedQty = processedItems
          .filter(di => di.prescriptionItemId === pi.id)
          .reduce((sum, di) => sum + di.quantity, 0);
        return dispensedQty >= pi.quantityPrescribed;
      });

      const someItemsDispensed = prescription.items.some(pi => {
        const dispensedQty = processedItems
          .filter(di => di.prescriptionItemId === pi.id)
          .reduce((sum, di) => sum + di.quantity, 0);
        return dispensedQty > 0;
      });

      let newStatus = prescription.status;
      if (allItemsDispensed) {
        newStatus = 'DISPENSED';
      } else if (someItemsDispensed) {
        newStatus = 'PARTIALLY_DISPENSED';
      }

      await tx.prescription.update({
        where: { id: prescription.id },
        data: {
          status: newStatus,
          isDispened: allItemsDispensed,
          dispensedAt: allItemsDispensed ? new Date() : undefined,
          dispensedById: allItemsDispensed ? auth.userId : undefined,
          updatedById: auth.userId
        }
      });
    }

    return tx.dispense.findFirst({
      where: { id: createdDispense.id },
      include: {
        items: {
          include: {
            drug: true,
            batch: true
          }
        },
        prescription: true
      }
    });
  });

  return dispense;
};

export const cancelDispense = async (id, comments, auth, context = {}) => {
  const dispense = await prisma.dispense.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      branchId: context.branchId
    },
    include: {
      items: true
    }
  });

  if (!dispense) throw new ApiError(404, "Dispense record not found");
  assertTenantBranchAccess(dispense, context);

  if (dispense.cancelledAt) {
    throw new ApiError(400, "Dispense already cancelled");
  }

  await prisma.$transaction(async (tx) => {
    // Reverse stock for each item
    for (const item of dispense.items) {
      // Update batch stock
      await tx.drugBatch.update({
        where: { id: item.batchId },
        data: {
          quantityDispensed: { decrement: item.quantity },
          currentStock: { increment: item.quantity }
        }
      });

      // Create reverse stock movement
      const batch = await tx.drugBatch.findFirst({
        where: { id: item.batchId },
        include: { store: true }
      });

      const stockBefore = batch.currentStock;
      const stockAfter = stockBefore + item.quantity;

      await tx.stockMovement.create({
        data: {
          tenantId: context.tenantId,
          branchId: context.branchId,
          storeId: batch.storeId,
          drugId: item.drugId,
          batchId: item.batchId,
          movementType: StockMovementType.DISPENSE, // Same type but positive quantity
          quantity: item.quantity,
          quantityBefore: stockBefore,
          quantityAfter: stockAfter,
          costAmount: item.totalAmount,
          referenceType: 'DISPENSE_CANCEL',
          referenceId: id,
          notes: `Reversal of dispense ${dispense.dispenseNo}: ${comments}`,
          createdById: auth.userId
        }
      });
    }

    // Update dispense record
    await tx.dispense.update({
      where: { id },
      data: {
        cancelledById: auth.userId,
        cancelledAt: new Date(),
        paymentStatus: 'CANCELLED',
        notes: comments ? `${dispense.notes || ''}\n[CANCELLED]: ${comments}` : dispense.notes
      }
    });

    // Update prescription status if linked
    if (dispense.prescriptionId) {
      await tx.prescription.update({
        where: { id: dispense.prescriptionId },
        data: {
          status: 'PENDING',
          isDispened: false,
          dispensedAt: null,
          dispensedById: null,
          updatedById: auth.userId
        }
      });
    }
  });

  return getDispense(id, context);
};

// Helper function to generate dispense number
const generateDispenseNo = async (tenantId, branchId) => {
  const prefix = `DISP/${branchId.substring(0, 4).toUpperCase()}`;
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  const count = await prisma.dispense.count({
    where: {
      tenantId,
      branchId,
      dispenseDate: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lt: new Date(today.setHours(23, 59, 59, 999))
      }
    }
  });

  const seqNum = String(count + 1).padStart(4, '0');
  return `${prefix}/${dateStr}/${seqNum}`;
};

// ==================== SUPPLIER SERVICES ====================

export const listSuppliers = async (filters = {}, context = {}) => {
  const { search, isActive } = filters;

  const where = {
    tenantId: context.tenantId,
    deletedAt: null,
    ...(search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {}),
    ...(isActive !== undefined ? { isActive } : {})
  };

  const suppliers = await prisma.supplier.findMany({
    where,
    include: {
      _count: {
        select: {
          purchaseOrders: true,
          batches: { where: { deletedAt: null } }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  return suppliers;
};

export const getSupplier = async (id, context = {}) => {
  const supplier = await prisma.supplier.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      deletedAt: null
    },
    include: {
      purchaseOrders: {
        take: 10,
        orderBy: { orderDate: 'desc' }
      },
      batches: {
        where: { deletedAt: null },
        take: 10,
        include: {
          drug: {
            select: {
              id: true,
              name: true,
              drugCode: true
            }
          }
        }
      }
    }
  });

  if (!supplier) throw new ApiError(404, "Supplier not found");
  assertTenantBranchAccess(supplier, context);

  return supplier;
};

export const createSupplier = async (data, auth, context = {}) => {
  const existing = await prisma.supplier.findFirst({
    where: {
      tenantId: context.tenantId,
      code: data.code,
      deletedAt: null
    }
  });

  if (existing) throw new ApiError(409, "Supplier code already exists");

  const supplier = await prisma.supplier.create({
    data: {
      tenantId: context.tenantId,
      name: data.name,
      code: data.code,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      country: data.country,
      taxId: data.taxId,
      licenseNo: data.licenseNo,
      paymentTerms: data.paymentTerms,
      creditLimit: toNumber(data.creditLimit) || 0,
      rating: data.rating,
      isActive: data.isActive ?? true,
      notes: data.notes,
      createdById: auth.userId
    }
  });

  return supplier;
};

export const updateSupplier = async (id, data, auth, context = {}) => {
  const supplier = await prisma.supplier.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      deletedAt: null
    }
  });

  if (!supplier) throw new ApiError(404, "Supplier not found");
  assertTenantBranchAccess(supplier, context);

  if (data.code && data.code !== supplier.code) {
    const existing = await prisma.supplier.findFirst({
      where: {
        tenantId: context.tenantId,
        code: data.code,
        id: { not: id },
        deletedAt: null
      }
    });
    if (existing) throw new ApiError(409, "Supplier code already exists");
  }

  const updated = await prisma.supplier.update({
    where: { id },
    data: {
      name: data.name,
      code: data.code,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      country: data.country,
      taxId: data.taxId,
      licenseNo: data.licenseNo,
      paymentTerms: data.paymentTerms,
      creditLimit: data.creditLimit !== undefined ? toNumber(data.creditLimit) : undefined,
      rating: data.rating,
      isActive: data.isActive,
      notes: data.notes,
      updatedById: auth.userId
    }
  });

  return updated;
};

export const deleteSupplier = async (id, auth, context = {}) => {
  const supplier = await prisma.supplier.findFirst({
    where: {
      id,
      tenantId: context.tenantId,
      deletedAt: null
    },
    include: {
      purchaseOrders: { where: { deletedAt: null }, take: 1 }
    }
  });

  if (!supplier) throw new ApiError(404, "Supplier not found");
  assertTenantBranchAccess(supplier, context);

  if (supplier.purchaseOrders.length > 0) {
    throw new ApiError(400, "Cannot delete supplier with existing purchase orders. Deactivate instead.");
  }

  const updated = await prisma.supplier.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      updatedById: auth.userId
    }
  });

  return updated;
};

// ==================== PURCHASE ORDER SERVICES ====================

export const listPurchaseOrders = async (filters = {}, context = {}) => {
  const { supplierId, status, dateFrom, dateTo } = filters;

  const where = {
    tenantId: context.tenantId,
    branchId: context.branchId,
    deletedAt: null,
    ...(supplierId ? { supplierId } : {}),
    ...(status ? { status } : {}),
    ...(dateFrom ? { orderDate: { gte: new Date(dateFrom) } } : {}),
    ...(dateTo ? { orderDate: { lte: new Date(dateTo) } } : {})
  };

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where,
    include: {
      supplier: { select: { id: true, name: true, code: true } },
      items: { include: { drug: { select: { id: true, name: true, drugCode: true, dosageForm: true, strength: true } } } },
      goodsReceivedNotes: { select: { id: true, grnNo: true, grnDate: true } }
    },
    orderBy: { orderDate: 'desc' }
  });

  return purchaseOrders;
};

export const getPurchaseOrder = async (id, context = {}) => {
  const purchaseOrder = await prisma.purchaseOrder.findFirst({
    where: { id, tenantId: context.tenantId, branchId: context.branchId, deletedAt: null },
    include: {
      supplier: true,
      items: { include: { drug: true, grnItems: { include: { grn: true, batch: true } } } },
      goodsReceivedNotes: { include: { items: true } }
    }
  });

  if (!purchaseOrder) throw new ApiError(404, "Purchase order not found");
  assertTenantBranchAccess(purchaseOrder, context);

  return purchaseOrder;
};

export const createPurchaseOrder = async (data, auth, context = {}) => {
  const supplier = await prisma.supplier.findFirst({
    where: { id: data.supplierId, tenantId: context.tenantId, deletedAt: null }
  });

  if (!supplier) throw new ApiError(404, "Supplier not found");

  for (const item of data.items || []) {
    const drug = await prisma.drug.findFirst({
      where: { id: item.drugId, tenantId: context.tenantId, deletedAt: null }
    });
    if (!drug) throw new ApiError(404, `Drug not found: ${item.drugId}`);
  }

  let subtotal = 0;
  let taxAmount = 0;

  const itemsData = (data.items || []).map(item => {
    const itemSubtotal = toNumber(item.unitCost) * item.quantityOrdered;
    const itemTax = round2(itemSubtotal * toNumber(item.taxRate) / 100);
    const itemTotal = round2(itemSubtotal + itemTax);

    subtotal = round2(subtotal + itemSubtotal);
    taxAmount = round2(taxAmount + itemTax);

    return {
      tenantId: context.tenantId,
      drugId: item.drugId,
      quantityOrdered: item.quantityOrdered,
      unitCost: toNumber(item.unitCost),
      taxRate: toNumber(item.taxRate) || 0,
      taxAmount: itemTax,
      totalAmount: itemTotal,
      notes: item.notes
    };
  });

  const discountAmount = toNumber(data.discountAmount) || 0;
  const totalAmount = round2(subtotal - discountAmount + taxAmount);
  const orderNumber = await generatePurchaseOrderNo(context.tenantId, context.branchId);

  const purchaseOrder = await prisma.purchaseOrder.create({
    data: {
      tenantId: context.tenantId,
      branchId: context.branchId,
      supplierId: data.supplierId,
      orderNo: orderNumber,
      orderDate: new Date(),
      expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
      status: PurchaseOrderStatus.DRAFT,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      notes: data.notes,
      createdById: auth.userId,
      items: { create: itemsData }
    },
    include: { items: { include: { drug: true } } }
  });

  return purchaseOrder;
};

export const submitPurchaseOrder = async (id, comments, auth, context = {}) => {
  const purchaseOrder = await prisma.purchaseOrder.findFirst({
    where: { id, tenantId: context.tenantId, branchId: context.branchId, deletedAt: null }
  });

  if (!purchaseOrder) throw new ApiError(404, "Purchase order not found");
  assertTenantBranchAccess(purchaseOrder, context);

  if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
    throw new ApiError(400, "Only draft purchase orders can be submitted");
  }

  if (!purchaseOrder.items || purchaseOrder.items.length === 0) {
    throw new ApiError(400, "Cannot submit empty purchase order");
  }

  const updated = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status: PurchaseOrderStatus.SUBMITTED,
      submittedById: auth.userId,
      submittedAt: new Date(),
      notes: comments ? `${purchaseOrder.notes || ''}\n[SUBMITTED]: ${comments}` : purchaseOrder.notes
    }
  });

  return updated;
};

export const approvePurchaseOrder = async (id, comments, auth, context = {}) => {
  const purchaseOrder = await prisma.purchaseOrder.findFirst({
    where: { id, tenantId: context.tenantId, branchId: context.branchId, deletedAt: null }
  });

  if (!purchaseOrder) throw new ApiError(404, "Purchase order not found");
  assertTenantBranchAccess(purchaseOrder, context);

  if (purchaseOrder.status !== PurchaseOrderStatus.SUBMITTED) {
    throw new ApiError(400, "Only submitted purchase orders can be approved");
  }

  const updated = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status: PurchaseOrderStatus.APPROVED,
      approvedById: auth.userId,
      approvedAt: new Date(),
      notes: comments ? `${purchaseOrder.notes || ''}\n[APPROVED]: ${comments}` : purchaseOrder.notes
    }
  });

  return updated;
};

export const cancelPurchaseOrder = async (id, comments, auth, context = {}) => {
  const purchaseOrder = await prisma.purchaseOrder.findFirst({
    where: { id, tenantId: context.tenantId, branchId: context.branchId, deletedAt: null }
  });

  if (!purchaseOrder) throw new ApiError(404, "Purchase order not found");
  assertTenantBranchAccess(purchaseOrder, context);

  if ([PurchaseOrderStatus.FULLY_RECEIVED, PurchaseOrderStatus.CANCELLED].includes(purchaseOrder.status)) {
    throw new ApiError(400, "Cannot cancel this purchase order");
  }

  const updated = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status: PurchaseOrderStatus.CANCELLED,
      cancelledById: auth.userId,
      cancelledAt: new Date(),
      notes: comments ? `${purchaseOrder.notes || ''}\n[CANCELLED]: ${comments}` : purchaseOrder.notes
    }
  });

  return updated;
};

// ==================== GOODS RECEIVED NOTE SERVICES ====================

export const createGoodsReceivedNote = async (data, auth, context = {}) => {
  const purchaseOrder = await prisma.purchaseOrder.findFirst({
    where: { id: data.purchaseOrderId, tenantId: context.tenantId, branchId: context.branchId, deletedAt: null },
    include: { items: { include: { drug: true } } }
  });

  if (!purchaseOrder) throw new ApiError(404, "Purchase order not found");

  if (![PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.PARTIALLY_RECEIVED].includes(purchaseOrder.status)) {
    throw new ApiError(400, "Can only receive approved or partially received purchase orders");
  }

  const grnNumber = await generateGRNNo(context.tenantId, context.branchId);

  const grn = await prisma.$transaction(async (tx) => {
    const createdGRN = await tx.goodsReceivedNote.create({
      data: {
        tenantId: context.tenantId,
        branchId: context.branchId,
        purchaseOrderId: data.purchaseOrderId,
        grnNo: grnNumber,
        grnDate: new Date(),
        supplierInvoiceNo: data.supplierInvoiceNo,
        supplierInvoiceDate: data.supplierInvoiceDate ? new Date(data.supplierInvoiceDate) : null,
        notes: data.notes,
        receivedById: auth.userId,
        createdById: auth.userId
      }
    });

    for (const itemData of data.items) {
      const poItem = purchaseOrder.items.find(i => i.id === itemData.purchaseOrderItemId);
      if (!poItem) throw new ApiError(404, `Purchase order item not found: ${itemData.purchaseOrderItemId}`);

      let batch = await tx.drugBatch.findFirst({
        where: { tenantId: context.tenantId, drugId: poItem.drugId, batchNumber: itemData.batchNumber, deletedAt: null }
      });

      if (!batch) {
        batch = await tx.drugBatch.create({
          data: {
            tenantId: context.tenantId,
            drugId: poItem.drugId,
            batchNumber: itemData.batchNumber,
            supplierId: purchaseOrder.supplierId,
            storeId: itemData.storeId,
            manufactureDate: itemData.manufacturingDate ? new Date(itemData.manufacturingDate) : null,
            expiryDate: new Date(itemData.expiryDate),
            quantityReceived: itemData.quantityAccepted,
            currentStock: itemData.quantityAccepted,
            costPrice: itemData.unitCost,
            sellingPrice: poItem.drug.sellingPrice,
            createdById: auth.userId
          }
        });
      } else {
        await tx.drugBatch.update({
          where: { id: batch.id },
          data: {
            quantityReceived: { increment: itemData.quantityAccepted },
            currentStock: { increment: itemData.quantityAccepted },
            costPrice: itemData.unitCost
          }
        });
      }

      await tx.goodsReceivedNoteItem.create({
        data: {
          tenantId: context.tenantId,
          grnId: createdGRN.id,
          purchaseOrderItemId: itemData.purchaseOrderItemId,
          drugId: poItem.drugId,
          batchId: batch.id,
          quantityReceived: itemData.quantityReceived,
          quantityAccepted: itemData.quantityAccepted,
          quantityRejected: itemData.quantityRejected || 0,
          unitCost: itemData.unitCost,
          expiryDate: new Date(itemData.expiryDate),
          manufacturingDate: itemData.manufacturingDate ? new Date(itemData.manufacturingDate) : null,
          notes: itemData.notes,
          createdById: auth.userId
        }
      });

      await tx.purchaseOrderItem.update({
        where: { id: poItem.id },
        data: { quantityReceived: { increment: itemData.quantityAccepted } }
      });

      if (itemData.quantityAccepted > 0 && itemData.storeId) {
        const stockBefore = batch.currentStock - itemData.quantityAccepted;
        const stockAfter = batch.currentStock;

        await tx.stockMovement.create({
          data: {
            tenantId: context.tenantId,
            branchId: context.branchId,
            storeId: itemData.storeId,
            drugId: poItem.drugId,
            batchId: batch.id,
            movementType: StockMovementType.PURCHASE_RECEIPT,
            quantity: itemData.quantityAccepted,
            quantityBefore: stockBefore,
            quantityAfter: stockAfter,
            costAmount: round2(itemData.unitCost * itemData.quantityAccepted),
            referenceType: 'GRN',
            referenceId: createdGRN.id,
            createdById: auth.userId
          }
        });
      }
    }

    const allItemsReceived = purchaseOrder.items.every(item => item.quantityReceived >= item.quantityOrdered);
    const someItemsReceived = purchaseOrder.items.some(item => item.quantityReceived > 0);

    let newStatus = purchaseOrder.status;
    if (allItemsReceived) newStatus = PurchaseOrderStatus.FULLY_RECEIVED;
    else if (someItemsReceived) newStatus = PurchaseOrderStatus.PARTIALLY_RECEIVED;

    await tx.purchaseOrder.update({
      where: { id: purchaseOrder.id },
      data: {
        status: newStatus,
        receivedById: allItemsReceived ? auth.userId : undefined,
        receivedAt: allItemsReceived ? new Date() : undefined
      }
    });

    return tx.goodsReceivedNote.findFirst({
      where: { id: createdGRN.id },
      include: { items: { include: { drug: true, batch: true } } }
    });
  });

  return grn;
};

const generatePurchaseOrderNo = async (tenantId, branchId) => {
  const prefix = `PO/${branchId.substring(0, 4).toUpperCase()}`;
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  const count = await prisma.purchaseOrder.count({
    where: {
      tenantId, branchId,
      orderDate: { gte: new Date(today.setHours(0, 0, 0, 0)), lt: new Date(today.setHours(23, 59, 59, 999)) }
    }
  });

  return `${prefix}/${dateStr}/${String(count + 1).padStart(4, '0')}`;
};

const generateGRNNo = async (tenantId, branchId) => {
  const prefix = `GRN/${branchId.substring(0, 4).toUpperCase()}`;
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  const count = await prisma.goodsReceivedNote.count({
    where: {
      tenantId, branchId,
      grnDate: { gte: new Date(today.setHours(0, 0, 0, 0)), lt: new Date(today.setHours(23, 59, 59, 999)) }
    }
  });

  return `${prefix}/${dateStr}/${String(count + 1).padStart(4, '0')}`;
};
// ==================== PHARMACY SALE SERVICES ====================

