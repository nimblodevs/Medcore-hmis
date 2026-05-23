import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as pharmacyService from "../services/pharmacy.service.js";

// ==================== DRUG CATEGORY CONTROLLERS ====================

export const listDrugCategories = asyncHandler(async (req, res) => {
  const data = await pharmacyService.listDrugCategories(req.context || {});
  ok(res, data, "Drug categories fetched");
});

export const getDrugCategory = asyncHandler(async (req, res) => {
  const data = await pharmacyService.getDrugCategory(req.params.id, req.context || {});
  ok(res, data, "Drug category fetched");
});

export const createDrugCategory = asyncHandler(async (req, res) => {
  const data = await pharmacyService.createDrugCategory(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.DRUG_CATEGORY_CREATED, entity: "DRUG_CATEGORY", entityId: data.id };
  ok(res, data, "Drug category created", 201);
});

export const updateDrugCategory = asyncHandler(async (req, res) => {
  const data = await pharmacyService.updateDrugCategory(req.params.id, req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.DRUG_CATEGORY_UPDATED, entity: "DRUG_CATEGORY", entityId: req.params.id };
  ok(res, data, "Drug category updated");
});

export const deleteDrugCategory = asyncHandler(async (req, res) => {
  const data = await pharmacyService.deleteDrugCategory(req.params.id, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.DRUG_CATEGORY_DELETED, entity: "DRUG_CATEGORY", entityId: req.params.id };
  ok(res, data, "Drug category deleted");
});

// ==================== DRUG CONTROLLERS ====================

export const listDrugs = asyncHandler(async (req, res) => {
  const data = await pharmacyService.listDrugs(req.query, req.context || {});
  ok(res, data, "Drugs fetched");
});

export const getDrug = asyncHandler(async (req, res) => {
  const data = await pharmacyService.getDrug(req.params.id, req.context || {});
  ok(res, data, "Drug fetched");
});

export const createDrug = asyncHandler(async (req, res) => {
  const data = await pharmacyService.createDrug(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.DRUG_CREATED, entity: "DRUG", entityId: data.id };
  ok(res, data, "Drug created", 201);
});

export const updateDrug = asyncHandler(async (req, res) => {
  const data = await pharmacyService.updateDrug(req.params.id, req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.DRUG_UPDATED, entity: "DRUG", entityId: req.params.id };
  ok(res, data, "Drug updated");
});

export const deleteDrug = asyncHandler(async (req, res) => {
  const data = await pharmacyService.deleteDrug(req.params.id, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.DRUG_DELETED, entity: "DRUG", entityId: req.params.id };
  ok(res, data, "Drug deleted");
});

export const getLowStockDrugs = asyncHandler(async (req, res) => {
  const data = await pharmacyService.getLowStockDrugs(req.context || {});
  ok(res, data, "Low stock drugs fetched");
});

export const getExpiringDrugs = asyncHandler(async (req, res) => {
  const daysThreshold = parseInt(req.query.days) || 30;
  const data = await pharmacyService.getExpiringDrugs(daysThreshold, req.context || {});
  ok(res, data, "Expiring drugs fetched");
});

// ==================== DRUG BATCH CONTROLLERS ====================

export const listDrugBatches = asyncHandler(async (req, res) => {
  const data = await pharmacyService.listDrugBatches(req.query, req.context || {});
  ok(res, data, "Drug batches fetched");
});

export const getDrugBatch = asyncHandler(async (req, res) => {
  const data = await pharmacyService.getDrugBatch(req.params.id, req.context || {});
  ok(res, data, "Drug batch fetched");
});

export const createDrugBatch = asyncHandler(async (req, res) => {
  const data = await pharmacyService.createDrugBatch(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.DRUG_BATCH_CREATED, entity: "DRUG_BATCH", entityId: data.id };
  ok(res, data, "Drug batch created", 201);
});

export const updateDrugBatch = asyncHandler(async (req, res) => {
  const data = await pharmacyService.updateDrugBatch(req.params.id, req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.DRUG_BATCH_UPDATED, entity: "DRUG_BATCH", entityId: req.params.id };
  ok(res, data, "Drug batch updated");
});

// ==================== PHARMACY STORE CONTROLLERS ====================

export const listPharmacyStores = asyncHandler(async (req, res) => {
  const data = await pharmacyService.listPharmacyStores(req.context || {});
  ok(res, data, "Pharmacy stores fetched");
});

export const getPharmacyStore = asyncHandler(async (req, res) => {
  const data = await pharmacyService.getPharmacyStore(req.params.id, req.context || {});
  ok(res, data, "Pharmacy store fetched");
});

export const createPharmacyStore = asyncHandler(async (req, res) => {
  const data = await pharmacyService.createPharmacyStore(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PHARMACY_STORE_CREATED, entity: "PHARMACY_STORE", entityId: data.id };
  ok(res, data, "Pharmacy store created", 201);
});

export const updatePharmacyStore = asyncHandler(async (req, res) => {
  const data = await pharmacyService.updatePharmacyStore(req.params.id, req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PHARMACY_STORE_UPDATED, entity: "PHARMACY_STORE", entityId: req.params.id };
  ok(res, data, "Pharmacy store updated");
});

export const deletePharmacyStore = asyncHandler(async (req, res) => {
  const data = await pharmacyService.deletePharmacyStore(req.params.id, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PHARMACY_STORE_DELETED, entity: "PHARMACY_STORE", entityId: req.params.id };
  ok(res, data, "Pharmacy store deleted");
});

// ==================== PRESCRIPTION CONTROLLERS ====================

export const listPrescriptions = asyncHandler(async (req, res) => {
  const data = await pharmacyService.listPrescriptions(req.query, req.context || {});
  ok(res, data, "Prescriptions fetched");
});

export const getPrescription = asyncHandler(async (req, res) => {
  const data = await pharmacyService.getPrescription(req.params.id, req.context || {});
  ok(res, data, "Prescription fetched");
});

export const createPrescription = asyncHandler(async (req, res) => {
  const data = await pharmacyService.createPrescription(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PRESCRIPTION_CREATED, entity: "PRESCRIPTION", entityId: data.id };
  ok(res, data, "Prescription created", 201);
});

export const updatePrescription = asyncHandler(async (req, res) => {
  const data = await pharmacyService.updatePrescription(req.params.id, req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PRESCRIPTION_UPDATED, entity: "PRESCRIPTION", entityId: req.params.id };
  ok(res, data, "Prescription updated");
});

export const cancelPrescription = asyncHandler(async (req, res) => {
  const data = await pharmacyService.cancelPrescription(req.params.id, req.body.comments, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PRESCRIPTION_CANCELLED, entity: "PRESCRIPTION", entityId: req.params.id };
  ok(res, data, "Prescription cancelled");
});

// ==================== DISPENSE CONTROLLERS ====================

export const listDispenses = asyncHandler(async (req, res) => {
  const data = await pharmacyService.listDispenses(req.query, req.context || {});
  ok(res, data, "Dispenses fetched");
});

export const getDispense = asyncHandler(async (req, res) => {
  const data = await pharmacyService.getDispense(req.params.id, req.context || {});
  ok(res, data, "Dispense fetched");
});

export const createDispense = asyncHandler(async (req, res) => {
  const data = await pharmacyService.createDispense(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.DISPENSE_CREATED, entity: "DISPENSE", entityId: data.id };
  ok(res, data, "Dispense created", 201);
});

export const cancelDispense = asyncHandler(async (req, res) => {
  const data = await pharmacyService.cancelDispense(req.params.id, req.body.comments, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.DISPENSE_CANCELLED, entity: "DISPENSE", entityId: req.params.id };
  ok(res, data, "Dispense cancelled");
});

// ==================== SUPPLIER CONTROLLERS ====================

export const listSuppliers = asyncHandler(async (req, res) => {
  const data = await pharmacyService.listSuppliers(req.query, req.context || {});
  ok(res, data, "Suppliers fetched");
});

export const getSupplier = asyncHandler(async (req, res) => {
  const data = await pharmacyService.getSupplier(req.params.id, req.context || {});
  ok(res, data, "Supplier fetched");
});

export const createSupplier = asyncHandler(async (req, res) => {
  const data = await pharmacyService.createSupplier(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.SUPPLIER_CREATED, entity: "SUPPLIER", entityId: data.id };
  ok(res, data, "Supplier created", 201);
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const data = await pharmacyService.updateSupplier(req.params.id, req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.SUPPLIER_UPDATED, entity: "SUPPLIER", entityId: req.params.id };
  ok(res, data, "Supplier updated");
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  const data = await pharmacyService.deleteSupplier(req.params.id, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.SUPPLIER_DELETED, entity: "SUPPLIER", entityId: req.params.id };
  ok(res, data, "Supplier deleted");
});

// ==================== PURCHASE ORDER CONTROLLERS ====================

export const listPurchaseOrders = asyncHandler(async (req, res) => {
  const data = await pharmacyService.listPurchaseOrders(req.query, req.context || {});
  ok(res, data, "Purchase orders fetched");
});

export const getPurchaseOrder = asyncHandler(async (req, res) => {
  const data = await pharmacyService.getPurchaseOrder(req.params.id, req.context || {});
  ok(res, data, "Purchase order fetched");
});

export const createPurchaseOrder = asyncHandler(async (req, res) => {
  const data = await pharmacyService.createPurchaseOrder(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PURCHASE_ORDER_CREATED, entity: "PURCHASE_ORDER", entityId: data.id };
  ok(res, data, "Purchase order created", 201);
});

export const submitPurchaseOrder = asyncHandler(async (req, res) => {
  const data = await pharmacyService.submitPurchaseOrder(req.params.id, req.body.comments, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PURCHASE_ORDER_SUBMITTED, entity: "PURCHASE_ORDER", entityId: req.params.id };
  ok(res, data, "Purchase order submitted");
});

export const approvePurchaseOrder = asyncHandler(async (req, res) => {
  const data = await pharmacyService.approvePurchaseOrder(req.params.id, req.body.comments, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PURCHASE_ORDER_APPROVED, entity: "PURCHASE_ORDER", entityId: req.params.id };
  ok(res, data, "Purchase order approved");
});

export const cancelPurchaseOrder = asyncHandler(async (req, res) => {
  const data = await pharmacyService.cancelPurchaseOrder(req.params.id, req.body.comments, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PURCHASE_ORDER_CANCELLED, entity: "PURCHASE_ORDER", entityId: req.params.id };
  ok(res, data, "Purchase order cancelled");
});

// ==================== GOODS RECEIVED NOTE CONTROLLERS ====================

export const createGoodsReceivedNote = asyncHandler(async (req, res) => {
  const data = await pharmacyService.createGoodsReceivedNote(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.GRN_CREATED, entity: "GRN", entityId: data.id };
  ok(res, data, "Goods received note created", 201);
});

// ==================== PHARMACY SALE CONTROLLERS ====================

export const listPharmacySales = asyncHandler(async (req, res) => {
  const data = await pharmacyService.listPharmacySales(req.query, req.context || {});
  ok(res, data, "Pharmacy sales fetched");
});

export const getPharmacySale = asyncHandler(async (req, res) => {
  const data = await pharmacyService.getPharmacySale(req.params.id, req.context || {});
  ok(res, data, "Pharmacy sale fetched");
});

export const createPharmacySale = asyncHandler(async (req, res) => {
  const data = await pharmacyService.createPharmacySale(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PHARMACY_SALE_CREATED, entity: "PHARMACY_SALE", entityId: data.id };
  ok(res, data, "Pharmacy sale created", 201);
});

export const confirmCashPayment = asyncHandler(async (req, res) => {
  const data = await pharmacyService.confirmCashPayment(req.params.id, req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PHARMACY_SALE_PAID, entity: "PHARMACY_SALE", entityId: req.params.id };
  ok(res, data, "Cash payment confirmed");
});

export const approveCreditSale = asyncHandler(async (req, res) => {
  const data = await pharmacyService.approveCreditSale(req.params.id, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PHARMACY_SALE_CREDIT_BILLED, entity: "PHARMACY_SALE", entityId: req.params.id };
  ok(res, data, "Credit sale approved");
});

export const dispensePharmacySale = asyncHandler(async (req, res) => {
  const data = await pharmacyService.dispensePharmacySale(req.params.id, req.body.items, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PHARMACY_SALE_DISPENSED, entity: "PHARMACY_SALE", entityId: req.params.id };
  ok(res, data, "Sale dispensed");
});

export const cancelPharmacySale = asyncHandler(async (req, res) => {
  const data = await pharmacyService.cancelPharmacySale(req.params.id, req.body.reason, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PHARMACY_SALE_CANCELLED, entity: "PHARMACY_SALE", entityId: req.params.id };
  ok(res, data, "Sale cancelled");
});

// ==================== PHARMACY RETURN CONTROLLERS ====================

export const listPharmacyReturns = asyncHandler(async (req, res) => {
  const data = await pharmacyService.listPharmacyReturns(req.query, req.context || {});
  ok(res, data, "Pharmacy returns fetched");
});

export const getPharmacyReturn = asyncHandler(async (req, res) => {
  const data = await pharmacyService.getPharmacyReturn(req.params.id, req.context || {});
  ok(res, data, "Pharmacy return fetched");
});

export const createPharmacyReturn = asyncHandler(async (req, res) => {
  const data = await pharmacyService.createPharmacyReturn(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PHARMACY_RETURN_CREATED, entity: "PHARMACY_RETURN", entityId: data.id };
  ok(res, data, "Pharmacy return created", 201);
});

export const approvePharmacyReturn = asyncHandler(async (req, res) => {
  const data = await pharmacyService.approvePharmacyReturn(req.params.id, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PHARMACY_RETURN_APPROVED, entity: "PHARMACY_RETURN", entityId: req.params.id };
  ok(res, data, "Pharmacy return approved");
});

export const rejectPharmacyReturn = asyncHandler(async (req, res) => {
  const data = await pharmacyService.rejectPharmacyReturn(req.params.id, req.body.reason, req.auth, req.context || {});
  ok(res, data, "Pharmacy return rejected");
});

export const completePharmacyReturn = asyncHandler(async (req, res) => {
  const data = await pharmacyService.completePharmacyReturn(req.params.id, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PHARMACY_RETURN_COMPLETED, entity: "PHARMACY_RETURN", entityId: req.params.id };
  ok(res, data, "Pharmacy return completed");
});

// ==================== PHARMACY REPORT EXPORT CONTROLLERS ====================

import { generatePharmacyReceiptPDF, generateSalesReportPDF, generateCSV } from "../utils/pdfExport.js";

export const downloadSaleReceipt = asyncHandler(async (req, res) => {
  const sale = await pharmacyService.getPharmacySale(req.params.id, req.context || {});
  
  const pdfBuffer = await generatePharmacyReceiptPDF(sale, sale.items);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="receipt_${sale.saleNumber}.pdf"`);
  res.send(pdfBuffer);
});

export const downloadSalesReport = asyncHandler(async (req, res) => {
  const format = req.query.format || 'pdf';
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    payerType: req.query.payerType
  };
  
  const result = await pharmacyService.listPharmacySales(filters, req.context || {});
  const sales = result.data;
  
  if (format === 'csv') {
    const fields = ['saleNumber', 'createdAt', 'patientName', 'payerType', 'grossAmount', 'discountAmount', 'netAmount', 'paymentStatus', 'saleStatus'];
    const csvData = generateCSV(sales, fields);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pharmacy_sales_report.csv"');
    res.send(csvData);
  } else {
    const pdfBuffer = await generateSalesReportPDF(filters, sales);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="pharmacy_sales_report.pdf"');
    res.send(pdfBuffer);
  }
});
