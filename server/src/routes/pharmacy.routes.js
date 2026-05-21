import { Router } from "express";
import * as pharmacyController from "../controllers/pharmacy.controller.js";
import requireRole from "../middlewares/requireRole.js";

const router = Router();

// ==================== DRUG CATEGORY ROUTES ====================
router.get("/drug-categories", pharmacyController.listDrugCategories);
router.get("/drug-categories/:id", pharmacyController.getDrugCategory);
router.post("/drug-categories", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.createDrugCategory);
router.patch("/drug-categories/:id", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.updateDrugCategory);
router.delete("/drug-categories/:id", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.deleteDrugCategory);

// ==================== DRUG ROUTES ====================
router.get("/drugs", pharmacyController.listDrugs);
router.get("/drugs/low-stock", pharmacyController.getLowStockDrugs);
router.get("/drugs/expiring", pharmacyController.getExpiringDrugs);
router.get("/drugs/:id", pharmacyController.getDrug);
router.post("/drugs", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.createDrug);
router.patch("/drugs/:id", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.updateDrug);
router.delete("/drugs/:id", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.deleteDrug);

// ==================== DRUG BATCH ROUTES ====================
router.get("/batches", pharmacyController.listDrugBatches);
router.get("/batches/:id", pharmacyController.getDrugBatch);
router.post("/batches", requireRole(["PHARMACY_MANAGER", "PHARMACIST"]), pharmacyController.createDrugBatch);
router.patch("/batches/:id", requireRole(["PHARMACY_MANAGER", "PHARMACIST"]), pharmacyController.updateDrugBatch);

// ==================== PHARMACY STORE ROUTES ====================
router.get("/stores", pharmacyController.listPharmacyStores);
router.get("/stores/:id", pharmacyController.getPharmacyStore);
router.post("/stores", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.createPharmacyStore);
router.patch("/stores/:id", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.updatePharmacyStore);
router.delete("/stores/:id", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.deletePharmacyStore);

// ==================== PRESCRIPTION ROUTES ====================
router.get("/prescriptions", pharmacyController.listPrescriptions);
router.get("/prescriptions/:id", pharmacyController.getPrescription);
router.post("/prescriptions", requireRole(["DOCTOR", "PHARMACIST"]), pharmacyController.createPrescription);
router.patch("/prescriptions/:id", requireRole(["DOCTOR", "PHARMACIST"]), pharmacyController.updatePrescription);
router.post("/prescriptions/:id/cancel", requireRole(["DOCTOR", "PHARMACY_MANAGER"]), pharmacyController.cancelPrescription);

// ==================== DISPENSE ROUTES ====================
router.get("/dispenses", pharmacyController.listDispenses);
router.get("/dispenses/:id", pharmacyController.getDispense);
router.post("/dispenses", requireRole(["PHARMACIST"]), pharmacyController.createDispense);
router.post("/dispenses/:id/cancel", requireRole(["PHARMACIST", "PHARMACY_MANAGER"]), pharmacyController.cancelDispense);

// ==================== SUPPLIER ROUTES ====================
router.get("/suppliers", pharmacyController.listSuppliers);
router.get("/suppliers/:id", pharmacyController.getSupplier);
router.post("/suppliers", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.createSupplier);
router.patch("/suppliers/:id", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.updateSupplier);
router.delete("/suppliers/:id", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.deleteSupplier);

// ==================== PURCHASE ORDER ROUTES ====================
router.get("/purchase-orders", pharmacyController.listPurchaseOrders);
router.get("/purchase-orders/:id", pharmacyController.getPurchaseOrder);
router.post("/purchase-orders", requireRole(["PHARMACY_MANAGER", "PHARMACIST"]), pharmacyController.createPurchaseOrder);
router.post("/purchase-orders/:id/submit", requireRole(["PHARMACY_MANAGER", "PHARMACIST"]), pharmacyController.submitPurchaseOrder);
router.post("/purchase-orders/:id/approve", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.approvePurchaseOrder);
router.post("/purchase-orders/:id/cancel", requireRole(["PHARMACY_MANAGER", "SUPER_ADMIN"]), pharmacyController.cancelPurchaseOrder);

// ==================== GOODS RECEIVED NOTE ROUTES ====================
router.post("/grn", requireRole(["PHARMACY_MANAGER", "PHARMACIST"]), pharmacyController.createGoodsReceivedNote);

export default router;
