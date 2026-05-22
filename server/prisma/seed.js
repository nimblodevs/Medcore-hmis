import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, ROLES } from "../src/config/rbac.js";

const prisma = new PrismaClient();

const SYSTEM_PERMISSION_LABELS = {
  [PERMISSIONS.VIEW_INVOICES]: "View invoices",
  [PERMISSIONS.CREATE_INVOICES]: "Create invoices",
  [PERMISSIONS.EDIT_DRAFT_INVOICES]: "Edit draft invoices",
  [PERMISSIONS.APPROVE_INVOICES]: "Approve invoices",
  [PERMISSIONS.SUBMIT_TO_PAYER]: "Submit invoices to payer",
  [PERMISSIONS.GENERATE_CLAIMS]: "Generate claims",
  [PERMISSIONS.RECEIVE_PAYMENTS]: "Receive payments",
  [PERMISSIONS.REVERSE_INVOICES]: "Reverse invoices",
  [PERMISSIONS.VIEW_REPORTS]: "View reports",
  [PERMISSIONS.MANAGE_USERS]: "Manage users",
  [PERMISSIONS.MANAGE_BRANCHES]: "Manage branches",
  [PERMISSIONS.MANAGE_TENANTS]: "Manage tenants"
};

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.HOSPITAL_ADMIN]: "Hospital Admin",
  [ROLES.BRANCH_ADMIN]: "Branch Admin",
  [ROLES.BILLING_OFFICER]: "Billing Officer",
  [ROLES.CREDIT_CONTROLLER]: "Credit Controller",
  [ROLES.ACCOUNTANT]: "Accountant",
  [ROLES.CLAIMS_OFFICER]: "Claims Officer",
  [ROLES.DOCTOR]: "Doctor",
  [ROLES.RECEPTIONIST]: "Receptionist",
  [ROLES.AUDITOR]: "Auditor"
};

async function seedPermissions() {
  for (const code of Object.values(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { code },
      update: { name: SYSTEM_PERMISSION_LABELS[code], description: SYSTEM_PERMISSION_LABELS[code] },
      create: {
        code,
        name: SYSTEM_PERMISSION_LABELS[code],
        description: SYSTEM_PERMISSION_LABELS[code]
      }
    });
  }
}

async function seedRoles() {
  const permissions = await prisma.permission.findMany({
    where: { code: { in: Object.values(PERMISSIONS) } }
  });
  const permissionsByCode = new Map(permissions.map((p) => [p.code, p]));

  for (const roleCode of Object.values(ROLES)) {
    const role = await prisma.role.upsert({
      where: { code: roleCode },
      update: { name: ROLE_LABELS[roleCode], isSystem: true },
      create: {
        code: roleCode,
        name: ROLE_LABELS[roleCode],
        isSystem: true
      }
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[roleCode] || [];
    for (const permissionCode of rolePermissions) {
      const permission = permissionsByCode.get(permissionCode);
      if (!permission) continue;
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id
        }
      });
    }
  }
}

async function seedSuperAdmin() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL || "admin@medcore.local";
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD || "Admin@123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 12));
  const user = await prisma.user.create({
    data: {
      firstName: "System",
      lastName: "Administrator",
      email,
      passwordHash,
      isSuperAdmin: true
    }
  });

  return user;
}

async function seedFacility(adminUser) {
  const tenant = await prisma.tenant.upsert({
    where: { code: "MEDCORE" },
    update: {
      name: "MediCore General Hospital",
      legalName: "MediCore General Hospital Ltd",
      phone: "+254 722 000 111",
      email: "info@medcore.local",
      city: "Nairobi",
      country: "Kenya",
      timezone: "Africa/Nairobi",
      isActive: true,
      updatedById: adminUser.id
    },
    create: {
      name: "MediCore General Hospital",
      code: "MEDCORE",
      legalName: "MediCore General Hospital Ltd",
      registrationNo: "MFL-13104",
      phone: "+254 722 000 111",
      email: "info@medcore.local",
      addressLine1: "P.O. Box 12345-00100",
      city: "Nairobi",
      country: "Kenya",
      timezone: "Africa/Nairobi",
      createdById: adminUser.id
    }
  });

  const branch = await prisma.branch.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "MAIN" } },
    update: {
      name: "Main Outpatient Branch",
      phone: "+254 722 000 111",
      city: "Nairobi",
      country: "Kenya",
      isActive: true,
      updatedById: adminUser.id
    },
    create: {
      tenantId: tenant.id,
      name: "Main Outpatient Branch",
      code: "MAIN",
      branchType: "OUTPATIENT",
      phone: "+254 722 000 111",
      email: "main@medcore.local",
      addressLine1: "MediCore Plaza, Upper Hill",
      city: "Nairobi",
      country: "Kenya",
      createdById: adminUser.id
    }
  });

  if (!adminUser.tenantId) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        tenantId: tenant.id,
        staffId: "ADM-001",
        jobTitle: "System Administrator",
        updatedById: adminUser.id
      }
    });
  }

  return { tenant, branch };
}

async function seedPharmacyData({ tenant, branch, adminUser }) {
  const stores = {};
  for (const store of [
    { code: "MAIN-PHARM", name: "Main Pharmacy", storeType: "MAIN" },
    { code: "OPD-PHARM", name: "OPD Dispensing Store", storeType: "DISPENSARY" },
    { code: "WARD-PHARM", name: "Ward Pharmacy", storeType: "WARD" }
  ]) {
    stores[store.code] = await prisma.pharmacyStore.upsert({
      where: { tenantId_branchId_code: { tenantId: tenant.id, branchId: branch.id, code: store.code } },
      update: {
        name: store.name,
        storeType: store.storeType,
        isActive: true,
        updatedById: adminUser.id
      },
      create: {
        tenantId: tenant.id,
        branchId: branch.id,
        name: store.name,
        code: store.code,
        description: `${store.name} seed location`,
        storeType: store.storeType,
        createdById: adminUser.id
      }
    });
  }

  const categories = {};
  for (const category of [
    { code: "ANALG", name: "Analgesics", description: "Pain and fever medicines" },
    { code: "ANTIB", name: "Antibiotics", description: "Antibacterial medicines" },
    { code: "RESP", name: "Respiratory", description: "Respiratory and allergy medicines" },
    { code: "GI", name: "Gastrointestinal", description: "Digestive system medicines" }
  ]) {
    categories[category.code] = await prisma.drugCategory.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: category.code } },
      update: {
        name: category.name,
        description: category.description,
        isActive: true,
        updatedById: adminUser.id
      },
      create: {
        tenantId: tenant.id,
        name: category.name,
        code: category.code,
        description: category.description,
        createdById: adminUser.id
      }
    });
  }

  const suppliers = {};
  for (const supplier of [
    {
      code: "SUP-MED-001",
      name: "Kenya Medical Supplies Authority",
      contactPerson: "Procurement Desk",
      phone: "+254 700 100 200",
      email: "orders@kemsa.local",
      paymentTerms: 30,
      creditLimit: "2500000",
      rating: "A"
    },
    {
      code: "SUP-PHARMA-002",
      name: "Nairobi Pharma Distributors",
      contactPerson: "Grace Wanjiku",
      phone: "+254 711 234 567",
      email: "sales@nairobipharma.local",
      paymentTerms: 14,
      creditLimit: "750000",
      rating: "B"
    }
  ]) {
    suppliers[supplier.code] = await prisma.supplier.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: supplier.code } },
      update: {
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        paymentTerms: supplier.paymentTerms,
        creditLimit: supplier.creditLimit,
        rating: supplier.rating,
        isActive: true,
        updatedById: adminUser.id
      },
      create: {
        tenantId: tenant.id,
        name: supplier.name,
        code: supplier.code,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        address: "Nairobi, Kenya",
        city: "Nairobi",
        country: "Kenya",
        paymentTerms: supplier.paymentTerms,
        creditLimit: supplier.creditLimit,
        rating: supplier.rating,
        createdById: adminUser.id
      }
    });
  }

  const drugFixtures = [
    {
      code: "PCM-500-TAB",
      name: "Paracetamol 500mg Tablets",
      genericName: "Paracetamol",
      category: "ANALG",
      dosageForm: "Tablet",
      strength: "500mg",
      unitOfMeasure: "Tablet",
      packSize: 100,
      reorderLevel: 200,
      maxStockLevel: 5000,
      standardPrice: "1.20",
      sellingPrice: "3.00",
      requiresPrescription: false
    },
    {
      code: "AMX-500-CAP",
      name: "Amoxicillin 500mg Capsules",
      genericName: "Amoxicillin",
      category: "ANTIB",
      dosageForm: "Capsule",
      strength: "500mg",
      unitOfMeasure: "Capsule",
      packSize: 100,
      reorderLevel: 150,
      maxStockLevel: 3000,
      standardPrice: "6.50",
      sellingPrice: "12.00",
      requiresPrescription: true
    },
    {
      code: "CET-10-TAB",
      name: "Cetirizine 10mg Tablets",
      genericName: "Cetirizine",
      category: "RESP",
      dosageForm: "Tablet",
      strength: "10mg",
      unitOfMeasure: "Tablet",
      packSize: 30,
      reorderLevel: 120,
      maxStockLevel: 1500,
      standardPrice: "2.00",
      sellingPrice: "5.00",
      requiresPrescription: false
    },
    {
      code: "ORS-SACHET",
      name: "Oral Rehydration Salts Sachet",
      genericName: "Oral Rehydration Salts",
      category: "GI",
      dosageForm: "Sachet",
      strength: "20.5g",
      unitOfMeasure: "Sachet",
      packSize: 100,
      reorderLevel: 100,
      maxStockLevel: 2000,
      standardPrice: "8.00",
      sellingPrice: "15.00",
      requiresPrescription: false
    }
  ];

  const drugs = {};
  for (const drug of drugFixtures) {
    drugs[drug.code] = await prisma.drug.upsert({
      where: { tenantId_drugCode: { tenantId: tenant.id, drugCode: drug.code } },
      update: {
        categoryId: categories[drug.category].id,
        name: drug.name,
        genericName: drug.genericName,
        dosageForm: drug.dosageForm,
        strength: drug.strength,
        unitOfMeasure: drug.unitOfMeasure,
        packSize: drug.packSize,
        reorderLevel: drug.reorderLevel,
        maxStockLevel: drug.maxStockLevel,
        standardPrice: drug.standardPrice,
        sellingPrice: drug.sellingPrice,
        requiresPrescription: drug.requiresPrescription,
        isActive: true,
        updatedById: adminUser.id
      },
      create: {
        tenantId: tenant.id,
        categoryId: categories[drug.category].id,
        name: drug.name,
        genericName: drug.genericName,
        drugCode: drug.code,
        dosageForm: drug.dosageForm,
        strength: drug.strength,
        unitOfMeasure: drug.unitOfMeasure,
        packSize: drug.packSize,
        manufacturer: "MediCore Seed Manufacturer",
        requiresPrescription: drug.requiresPrescription,
        storageConditions: "Room temperature",
        shelfLife: 24,
        reorderLevel: drug.reorderLevel,
        maxStockLevel: drug.maxStockLevel,
        standardPrice: drug.standardPrice,
        sellingPrice: drug.sellingPrice,
        createdById: adminUser.id
      }
    });
  }

  const batchFixtures = [
    { drug: "PCM-500-TAB", batch: "PCM2401A", supplier: "SUP-MED-001", store: "MAIN-PHARM", qty: 1200, cost: "1.20", price: "3.00", expiryMonths: 18 },
    { drug: "AMX-500-CAP", batch: "AMX2402B", supplier: "SUP-PHARMA-002", store: "MAIN-PHARM", qty: 650, cost: "6.50", price: "12.00", expiryMonths: 10 },
    { drug: "CET-10-TAB", batch: "CET2403C", supplier: "SUP-PHARMA-002", store: "OPD-PHARM", qty: 480, cost: "2.00", price: "5.00", expiryMonths: 8 },
    { drug: "ORS-SACHET", batch: "ORS2404D", supplier: "SUP-MED-001", store: "OPD-PHARM", qty: 900, cost: "8.00", price: "15.00", expiryMonths: 14 }
  ];

  const batches = {};
  const now = new Date();
  for (const item of batchFixtures) {
    const expiryDate = new Date(now);
    expiryDate.setMonth(expiryDate.getMonth() + item.expiryMonths);
    const manufactureDate = new Date(now);
    manufactureDate.setMonth(manufactureDate.getMonth() - 2);

    const drug = drugs[item.drug];
    const key = `${item.drug}:${item.batch}`;
    batches[key] = await prisma.drugBatch.upsert({
      where: { tenantId_drugId_batchNumber: { tenantId: tenant.id, drugId: drug.id, batchNumber: item.batch } },
      update: {
        supplierId: suppliers[item.supplier].id,
        storeId: stores[item.store].id,
        manufactureDate,
        expiryDate,
        quantityReceived: item.qty,
        currentStock: item.qty,
        costPrice: item.cost,
        sellingPrice: item.price,
        updatedById: adminUser.id
      },
      create: {
        tenantId: tenant.id,
        drugId: drug.id,
        batchNumber: item.batch,
        supplierId: suppliers[item.supplier].id,
        storeId: stores[item.store].id,
        manufactureDate,
        expiryDate,
        quantityReceived: item.qty,
        currentStock: item.qty,
        costPrice: item.cost,
        sellingPrice: item.price,
        createdById: adminUser.id
      }
    });
  }

  await prisma.stockMovement.deleteMany({
    where: {
      tenantId: tenant.id,
      branchId: branch.id,
      referenceType: "SEED"
    }
  });

  for (const item of batchFixtures) {
    const drug = drugs[item.drug];
    const batch = batches[`${item.drug}:${item.batch}`];
    await prisma.stockMovement.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        storeId: stores[item.store].id,
        drugId: drug.id,
        batchId: batch.id,
        movementType: "PURCHASE_RECEIPT",
        quantity: item.qty,
        quantityBefore: 0,
        quantityAfter: item.qty,
        costAmount: (Number(item.cost) * item.qty).toFixed(2),
        referenceType: "SEED",
        notes: "Opening pharmacy seed stock",
        createdById: adminUser.id
      }
    });
  }

  const purchaseOrder = await prisma.purchaseOrder.upsert({
    where: { tenantId_orderNo: { tenantId: tenant.id, orderNo: "PO-SEED-0001" } },
    update: {
      supplierId: suppliers["SUP-PHARMA-002"].id,
      status: "SUBMITTED",
      subtotal: "9650.00",
      totalAmount: "9650.00",
      submittedById: adminUser.id,
      submittedAt: now,
      updatedById: adminUser.id
    },
    create: {
      tenantId: tenant.id,
      branchId: branch.id,
      supplierId: suppliers["SUP-PHARMA-002"].id,
      orderNo: "PO-SEED-0001",
      orderDate: now,
      expectedDeliveryDate: new Date(now.getTime() + 7 * 86400000),
      status: "SUBMITTED",
      subtotal: "9650.00",
      discountAmount: "0.00",
      taxAmount: "0.00",
      totalAmount: "9650.00",
      notes: "Seed purchase order awaiting approval",
      submittedById: adminUser.id,
      submittedAt: now,
      createdById: adminUser.id
    }
  });

  await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: purchaseOrder.id } });
  await prisma.purchaseOrderItem.createMany({
    data: [
      {
        tenantId: tenant.id,
        purchaseOrderId: purchaseOrder.id,
        drugId: drugs["AMX-500-CAP"].id,
        quantityOrdered: 500,
        unitCost: "6.50",
        taxAmount: "0.00",
        totalAmount: "3250.00",
        createdById: adminUser.id
      },
      {
        tenantId: tenant.id,
        purchaseOrderId: purchaseOrder.id,
        drugId: drugs["ORS-SACHET"].id,
        quantityOrdered: 800,
        unitCost: "8.00",
        taxAmount: "0.00",
        totalAmount: "6400.00",
        createdById: adminUser.id
      }
    ]
  });

  const patient = await prisma.patient.upsert({
    where: { tenantId_uhid: { tenantId: tenant.id, uhid: "UHID-SEED-001" } },
    update: {
      firstName: "Amina",
      lastName: "Otieno",
      phone: "+254 733 456 789",
      updatedById: adminUser.id
    },
    create: {
      tenantId: tenant.id,
      branchId: branch.id,
      uhid: "UHID-SEED-001",
      firstName: "Amina",
      lastName: "Otieno",
      dateOfBirth: new Date("1991-04-12"),
      gender: "Female",
      phone: "+254 733 456 789",
      createdById: adminUser.id
    }
  });

  const visit = await prisma.visit.upsert({
    where: { tenantId_visitNo: { tenantId: tenant.id, visitNo: "VISIT-SEED-001" } },
    update: {
      patientId: patient.id,
      visitDate: now,
      doctorName: "Dr. Seed Clinician",
      updatedById: adminUser.id
    },
    create: {
      tenantId: tenant.id,
      branchId: branch.id,
      patientId: patient.id,
      visitNo: "VISIT-SEED-001",
      visitDate: now,
      visitType: "OUTPATIENT",
      doctorName: "Dr. Seed Clinician",
      createdById: adminUser.id
    }
  });

  const prescription = await prisma.prescription.upsert({
    where: { tenantId_prescriptionNo: { tenantId: tenant.id, prescriptionNo: "RX-SEED-0001" } },
    update: {
      patientId: patient.id,
      visitId: visit.id,
      prescriptionDate: now,
      prescriberName: "Dr. Seed Clinician",
      diagnosis: "Upper respiratory tract infection",
      status: "PENDING",
      updatedById: adminUser.id
    },
    create: {
      tenantId: tenant.id,
      branchId: branch.id,
      patientId: patient.id,
      visitId: visit.id,
      prescriptionNo: "RX-SEED-0001",
      prescriptionDate: now,
      prescriberName: "Dr. Seed Clinician",
      diagnosis: "Upper respiratory tract infection",
      notes: "Seed prescription for pharmacy dispensing workflow",
      status: "PENDING",
      createdById: adminUser.id
    }
  });

  await prisma.prescriptionItem.deleteMany({ where: { prescriptionId: prescription.id } });
  await prisma.prescriptionItem.createMany({
    data: [
      {
        tenantId: tenant.id,
        prescriptionId: prescription.id,
        drugId: drugs["AMX-500-CAP"].id,
        dosage: "1 capsule",
        frequency: "TDS",
        duration: 5,
        durationUnit: "DAYS",
        instructions: "Take after meals",
        quantityPrescribed: 15,
        unitPrice: "12.00",
        totalAmount: "180.00",
        createdById: adminUser.id
      },
      {
        tenantId: tenant.id,
        prescriptionId: prescription.id,
        drugId: drugs["CET-10-TAB"].id,
        dosage: "1 tablet",
        frequency: "OD",
        duration: 5,
        durationUnit: "DAYS",
        instructions: "Take at night",
        quantityPrescribed: 5,
        unitPrice: "5.00",
        totalAmount: "25.00",
        createdById: adminUser.id
      }
    ]
  });

  console.log("Pharmacy seed data completed.");
}

async function seedInvoiceData({ tenant, branch, adminUser, patient, visit }) {
  const now = new Date();
  
  // Create credit customers for credit billing
  const insuranceCompany = await prisma.creditCustomer.upsert({
    where: { tenantId_customerCode: { tenantId: tenant.id, customerCode: "INS-NHIF-001" } },
    update: {
      name: "National Hospital Insurance Fund",
      customerType: "INSURANCE_COMPANY",
      creditLimit: "5000000.00",
      isActive: true,
      updatedById: adminUser.id
    },
    create: {
      tenantId: tenant.id,
      branchId: branch.id,
      name: "National Hospital Insurance Fund",
      customerCode: "INS-NHIF-001",
      customerType: "INSURANCE_COMPANY",
      creditLimit: "5000000.00",
      createdById: adminUser.id
    }
  });

  const corporateClient = await prisma.creditCustomer.upsert({
    where: { tenantId_customerCode: { tenantId: tenant.id, customerCode: "CORP-ABC-001" } },
    update: {
      name: "ABC Manufacturing Ltd",
      customerType: "CORPORATE_CLIENT",
      creditLimit: "2000000.00",
      isActive: true,
      updatedById: adminUser.id
    },
    create: {
      tenantId: tenant.id,
      branchId: branch.id,
      name: "ABC Manufacturing Ltd",
      customerCode: "CORP-ABC-001",
      customerType: "CORPORATE_CLIENT",
      creditLimit: "2000000.00",
      createdById: adminUser.id
    }
  });

  // Create insurance scheme
  const insuranceScheme = await prisma.insuranceScheme.upsert({
    where: { tenantId_schemeCode: { tenantId: tenant.id, schemeCode: "NHIF-SUPER" } },
    update: {
      name: "NHIF Super Cover",
      requiresAuthorization: true,
      isActive: true,
      updatedById: adminUser.id
    },
    create: {
      tenantId: tenant.id,
      branchId: branch.id,
      name: "NHIF Super Cover",
      schemeCode: "NHIF-SUPER",
      requiresAuthorization: true,
      createdById: adminUser.id
    }
  });

  // ========== CASH INVOICE - OUTPATIENT ==========
  const cashInvoice = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      invoiceNo: `INV-${branch.code}-${now.toISOString().slice(0,10).replace(/-/g,"")}-0001`,
      invoiceDate: now,
      invoiceType: "OUTPATIENT",
      patientId: patient.id,
      visitId: visit.id,
      billingType: "CASH",
      payerType: "SELF",
      grossAmount: "3500.00",
      discountAmount: "0.00",
      netAmount: "3500.00",
      patientCopayAmount: "3500.00",
      payerShareAmount: "0.00",
      creditAmount: "0.00",
      amountPaid: "3500.00",
      outstandingAmount: "0.00",
      status: "PAID",
      issuedAt: now,
      createdById: adminUser.id,
      items: {
        create: [
          {
            tenantId: tenant.id,
            branchId: branch.id,
            serviceType: "CONSULTATION",
            servicePoint: "OPD",
            itemCode: "CONS-001",
            description: "General Consultation",
            quantity: "1",
            unitPrice: "1500.00",
            grossAmount: "1500.00",
            discountAmount: "0.00",
            netAmount: "1500.00",
            createdById: adminUser.id
          },
          {
            tenantId: tenant.id,
            branchId: branch.id,
            serviceType: "LABORATORY",
            servicePoint: "LAB",
            itemCode: "LAB-CBC",
            description: "Complete Blood Count",
            quantity: "1",
            unitPrice: "2000.00",
            grossAmount: "2000.00",
            discountAmount: "0.00",
            netAmount: "2000.00",
            createdById: adminUser.id
          }
        ]
      }
    }
  });

  // Create payment for cash invoice
  const cashPayment = await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      patientId: patient.id,
      paymentDate: now,
      paymentMethod: "MPESA",
      referenceNo: "MPESA-REF-001",
      mpesaCode: "QKH123456",
      amountReceived: "3500.00",
      unappliedAmount: "0.00",
      createdById: adminUser.id
    }
  });

  // Allocate payment to invoice
  const cashAllocation = await prisma.paymentAllocation.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      paymentId: cashPayment.id,
      invoiceId: cashInvoice.id,
      allocatedAmount: "3500.00",
      createdById: adminUser.id
    }
  });

  // Create receipt for cash payment
  await prisma.receipt.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      receiptNo: `RCP-${branch.code}-${now.toISOString().slice(0,10).replace(/-/g,"")}-0001`,
      receiptDate: now,
      invoiceId: cashInvoice.id,
      paymentId: cashPayment.id,
      paymentAllocationId: cashAllocation.id,
      patientId: patient.id,
      amount: "3500.00",
      createdById: adminUser.id
    }
  });

  // ========== CREDIT INVOICE - INSURANCE ==========
  const creditInvoice = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      invoiceNo: `INV-${branch.code}-${now.toISOString().slice(0,10).replace(/-/g,"")}-0002`,
      invoiceDate: now,
      invoiceType: "OUTPATIENT",
      patientId: patient.id,
      visitId: visit.id,
      creditCustomerId: insuranceCompany.id,
      schemeId: insuranceScheme.id,
      billingType: "CREDIT",
      payerType: "INSURANCE_COMPANY",
      authorizationNo: "AUTH-2024-001",
      memberNumber: "NHIF-12345678",
      policyNumber: "POL-SUPER-001",
      grossAmount: "15000.00",
      discountAmount: "0.00",
      netAmount: "15000.00",
      patientCopayAmount: "3000.00",
      payerShareAmount: "12000.00",
      creditAmount: "12000.00",
      amountPaid: "3000.00",
      outstandingAmount: "12000.00",
      status: "PARTIALLY_PAID",
      issuedAt: now,
      approvedById: adminUser.id,
      approvedAt: now,
      createdById: adminUser.id,
      items: {
        create: [
          {
            tenantId: tenant.id,
            branchId: branch.id,
            serviceType: "CONSULTATION",
            servicePoint: "OPD",
            itemCode: "CONS-SPEC",
            description: "Specialist Consultation",
            quantity: "1",
            unitPrice: "3000.00",
            grossAmount: "3000.00",
            discountAmount: "0.00",
            netAmount: "3000.00",
            createdById: adminUser.id
          },
          {
            tenantId: tenant.id,
            branchId: branch.id,
            serviceType: "RADIOLOGY",
            servicePoint: "XRAY",
            itemCode: "XRAY-CHEST",
            description: "Chest X-Ray",
            quantity: "1",
            unitPrice: "5000.00",
            grossAmount: "5000.00",
            discountAmount: "0.00",
            netAmount: "5000.00",
            createdById: adminUser.id
          },
          {
            tenantId: tenant.id,
            branchId: branch.id,
            serviceType: "LABORATORY",
            servicePoint: "LAB",
            itemCode: "LAB-LIPID",
            description: "Lipid Profile",
            quantity: "1",
            unitPrice: "7000.00",
            grossAmount: "7000.00",
            discountAmount: "0.00",
            netAmount: "7000.00",
            createdById: adminUser.id
          }
        ]
      }
    }
  });

  // Create patient copay payment
  const copayPayment = await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      patientId: patient.id,
      paymentDate: now,
      paymentMethod: "CARD",
      referenceNo: "CARD-REF-001",
      amountReceived: "3000.00",
      unappliedAmount: "0.00",
      createdById: adminUser.id
    }
  });

  const copayAllocation = await prisma.paymentAllocation.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      paymentId: copayPayment.id,
      invoiceId: creditInvoice.id,
      allocatedAmount: "3000.00",
      createdById: adminUser.id
    }
  });

  await prisma.receipt.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      receiptNo: `RCP-${branch.code}-${now.toISOString().slice(0,10).replace(/-/g,"")}-0002`,
      receiptDate: now,
      invoiceId: creditInvoice.id,
      paymentId: copayPayment.id,
      paymentAllocationId: copayAllocation.id,
      patientId: patient.id,
      amount: "3000.00",
      createdById: adminUser.id
    }
  });

  // Create claim for insurance invoice
  await prisma.claim.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      claimNo: `CLM-${branch.code}-${now.toISOString().slice(0,10).replace(/-/g,"")}-0001`,
      invoiceId: creditInvoice.id,
      visitId: visit.id,
      creditCustomerId: insuranceCompany.id,
      schemeId: insuranceScheme.id,
      patientId: patient.id,
      claimDate: now,
      claimAmount: "12000.00",
      status: "SUBMITTED",
      submittedAt: now,
      createdById: adminUser.id
    }
  });

  // ========== INVOICE FOR REVERSAL DEMO ==========
  const reversalInvoice = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      invoiceNo: `INV-${branch.code}-${now.toISOString().slice(0,10).replace(/-/g,"")}-0003`,
      invoiceDate: now,
      invoiceType: "PHARMACY",
      patientId: patient.id,
      visitId: visit.id,
      billingType: "CASH",
      payerType: "SELF",
      grossAmount: "2500.00",
      discountAmount: "0.00",
      netAmount: "2500.00",
      patientCopayAmount: "2500.00",
      payerShareAmount: "0.00",
      creditAmount: "0.00",
      amountPaid: "2500.00",
      outstandingAmount: "0.00",
      status: "PAID",
      issuedAt: now,
      createdById: adminUser.id,
      items: {
        create: [
          {
            tenantId: tenant.id,
            branchId: branch.id,
            serviceType: "PHARMACY",
            servicePoint: "PHARMACY",
            itemCode: "DRG-001",
            description: "Paracetamol 500mg x 10 tabs",
            quantity: "2",
            unitPrice: "500.00",
            grossAmount: "1000.00",
            discountAmount: "0.00",
            netAmount: "1000.00",
            createdById: adminUser.id
          },
          {
            tenantId: tenant.id,
            branchId: branch.id,
            serviceType: "PHARMACY",
            servicePoint: "PHARMACY",
            itemCode: "DRG-002",
            description: "Amoxicillin 500mg x 20 caps",
            quantity: "1",
            unitPrice: "1500.00",
            grossAmount: "1500.00",
            discountAmount: "0.00",
            netAmount: "1500.00",
            createdById: adminUser.id
          }
        ]
      }
    }
  });

  const reversalPayment = await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      patientId: patient.id,
      paymentDate: now,
      paymentMethod: "CASH",
      referenceNo: "CASH-REF-001",
      amountReceived: "2500.00",
      unappliedAmount: "0.00",
      createdById: adminUser.id
    }
  });

  const reversalAllocation = await prisma.paymentAllocation.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      paymentId: reversalPayment.id,
      invoiceId: reversalInvoice.id,
      allocatedAmount: "2500.00",
      createdById: adminUser.id
    }
  });

  const reversalReceipt = await prisma.receipt.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      receiptNo: `RCP-${branch.code}-${now.toISOString().slice(0,10).replace(/-/g,"")}-0003`,
      receiptDate: now,
      invoiceId: reversalInvoice.id,
      paymentId: reversalPayment.id,
      paymentAllocationId: reversalAllocation.id,
      patientId: patient.id,
      amount: "2500.00",
      createdById: adminUser.id
    }
  });

  // Create reversal for the invoice
  await prisma.invoiceReversal.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      invoiceId: reversalInvoice.id,
      reason: "Patient returned medication - wrong prescription dispensed",
      reversalAmount: "2500.00",
      reversedPaymentIds: [reversalPayment.id],
      approvedById: adminUser.id,
      approvedAt: now,
      createdById: adminUser.id
    }
  });

  // Update reversal invoice status
  await prisma.invoice.update({
    where: { id: reversalInvoice.id },
    data: {
      status: "REVERSED",
      reversedAt: now,
      outstandingAmount: "0.00",
      amountPaid: "0.00",
      updatedById: adminUser.id
    }
  });

  // Reverse the payment
  await prisma.payment.update({
    where: { id: reversalPayment.id },
    data: {
      reversedById: adminUser.id,
      reversedAt: now,
      updatedById: adminUser.id
    }
  });

  // Mark allocation as deleted
  await prisma.paymentAllocation.update({
    where: { id: reversalAllocation.id },
    data: {
      deletedAt: now,
      updatedById: adminUser.id
    }
  });

  // Create status history entries
  await prisma.invoiceStatusHistory.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      invoiceId: reversalInvoice.id,
      previousStatus: "DRAFT",
      newStatus: "ISSUED",
      reason: "Invoice issued to patient",
      changedById: adminUser.id
    }
  });

  await prisma.invoiceStatusHistory.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      invoiceId: reversalInvoice.id,
      previousStatus: "ISSUED",
      newStatus: "PAID",
      reason: "Full payment received",
      changedById: adminUser.id
    }
  });

  await prisma.invoiceStatusHistory.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      invoiceId: reversalInvoice.id,
      previousStatus: "PAID",
      newStatus: "REVERSED",
      reason: "Patient returned medication - wrong prescription dispensed",
      changedById: adminUser.id
    }
  });

  // Create approval logs
  await prisma.invoiceApproval.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      invoiceId: creditInvoice.id,
      action: "SUBMITTED",
      comments: "Credit invoice submitted for approval",
      actedById: adminUser.id,
      createdById: adminUser.id
    }
  });

  await prisma.invoiceApproval.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      invoiceId: creditInvoice.id,
      action: "APPROVED",
      comments: "Approved - valid NHIF coverage",
      actedById: adminUser.id,
      createdById: adminUser.id
    }
  });

  console.log("Invoice management seed data completed.");
}

async function main() {
  console.log("Connecting to database...");
  await prisma.$connect();
  console.log("Database connected successfully. Starting seed...");

  await seedPermissions();
  await seedRoles();
  const adminUser = await seedSuperAdmin();
  const facility = await seedFacility(adminUser);
  await seedPharmacyData({ ...facility, adminUser });
  
  // Get patient and visit from pharmacy seed for invoice seeding
  const patient = await prisma.patient.findFirst({
    where: { tenantId: facility.tenant.id, uhid: "UHID-SEED-001" }
  });
  const visit = await prisma.visit.findFirst({
    where: { tenantId: facility.tenant.id, visitNo: "VISIT-SEED-001" }
  });
  
  if (patient && visit) {
    await seedInvoiceData({ ...facility, adminUser, patient, visit });
  }
  
  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed.");
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
