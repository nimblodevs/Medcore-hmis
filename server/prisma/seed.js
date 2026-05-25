import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, ROLES } from "../src/config/rbac.js";

const prisma = new PrismaClient();

const now = () => new Date();
const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const money = (value) => value.toFixed(2);

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

const getPasswordHash = async () =>
  bcrypt.hash(process.env.SEED_SUPER_ADMIN_PASSWORD || "Admin@123", Number(process.env.BCRYPT_SALT_ROUNDS || 12));

const upsertById = async (model, where, create, update = create) => {
  const existing = await model.findFirst({ where });
  if (existing) {
    return model.update({ where: { id: existing.id }, data: update });
  }
  return model.create({ data: create });
};

async function seedPermissions() {
  for (const code of Object.values(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { code },
      update: {
        name: SYSTEM_PERMISSION_LABELS[code],
        description: SYSTEM_PERMISSION_LABELS[code]
      },
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
  const permissionsByCode = new Map(permissions.map((permission) => [permission.code, permission]));

  for (const roleCode of Object.values(ROLES)) {
    const role = await prisma.role.upsert({
      where: { code: roleCode },
      update: { name: ROLE_LABELS[roleCode], isSystem: true },
      create: { code: roleCode, name: ROLE_LABELS[roleCode], isSystem: true }
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    for (const permissionCode of DEFAULT_ROLE_PERMISSIONS[roleCode] || []) {
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

async function seedFacility() {
  const tenant = await prisma.tenant.upsert({
    where: { code: "MEDCORE" },
    update: {
      name: "MediCore General Hospital",
      legalName: "MediCore General Hospital Ltd",
      phone: "+254722000111",
      email: "info@medcore.local",
      city: "Nairobi",
      country: "Kenya",
      timezone: "Africa/Nairobi",
      isActive: true
    },
    create: {
      name: "MediCore General Hospital",
      code: "MEDCORE",
      legalName: "MediCore General Hospital Ltd",
      registrationNo: "MFL-13104",
      taxPin: "P000000001M",
      phone: "+254722000111",
      email: "info@medcore.local",
      addressLine1: "MediCore Plaza, Upper Hill",
      city: "Nairobi",
      country: "Kenya",
      timezone: "Africa/Nairobi"
    }
  });

  const mainBranch = await prisma.branch.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "MAIN" } },
    update: {
      name: "Main Hospital Branch",
      branchType: "HOSPITAL",
      phone: "+254722000111",
      email: "main@medcore.local",
      city: "Nairobi",
      country: "Kenya",
      isActive: true
    },
    create: {
      tenantId: tenant.id,
      name: "Main Hospital Branch",
      code: "MAIN",
      branchType: "HOSPITAL",
      phone: "+254722000111",
      email: "main@medcore.local",
      addressLine1: "MediCore Plaza, Upper Hill",
      city: "Nairobi",
      country: "Kenya"
    }
  });

  const westBranch = await prisma.branch.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "WEST" } },
    update: {
      name: "Westlands Clinic",
      branchType: "CLINIC",
      phone: "+254722000222",
      isActive: true
    },
    create: {
      tenantId: tenant.id,
      name: "Westlands Clinic",
      code: "WEST",
      branchType: "CLINIC",
      phone: "+254722000222",
      email: "westlands@medcore.local",
      addressLine1: "Westlands Medical Centre",
      city: "Nairobi",
      country: "Kenya"
    }
  });

  return { tenant, mainBranch, westBranch };
}

async function seedDepartments({ tenant, mainBranch }) {
  const fixtures = [
    { code: "OPD", name: "Outpatient Department", isClinical: true },
    { code: "EMR", name: "Clinical Services", isClinical: true },
    { code: "PHARM", name: "Pharmacy", isClinical: true },
    { code: "FIN", name: "Finance and Billing", isClinical: false },
    { code: "CASH", name: "Cash Office", isClinical: false },
    { code: "CREDIT", name: "Credit Control", isClinical: false }
  ];

  const departments = {};
  for (const fixture of fixtures) {
    departments[fixture.code] = await prisma.department.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: fixture.code } },
      update: {
        branchId: mainBranch.id,
        name: fixture.name,
        isClinical: fixture.isClinical,
        isActive: true
      },
      create: {
        tenantId: tenant.id,
        branchId: mainBranch.id,
        code: fixture.code,
        name: fixture.name,
        description: `${fixture.name} seed department`,
        isClinical: fixture.isClinical
      }
    });
  }

  return departments;
}

async function seedUsers({ tenant, mainBranch, departments }) {
  const passwordHash = await getPasswordHash();
  const fixtures = [
    {
      email: process.env.SEED_SUPER_ADMIN_EMAIL || "admin@medcore.local",
      firstName: "System",
      lastName: "Administrator",
      staffId: "ADM-001",
      jobTitle: "System Administrator",
      role: ROLES.SUPER_ADMIN,
      department: "FIN",
      isSuperAdmin: true
    },
    {
      email: "doctor@medcore.local",
      firstName: "Grace",
      lastName: "Wanjiku",
      staffId: "DOC-001",
      jobTitle: "Consultant Physician",
      role: ROLES.DOCTOR,
      department: "EMR"
    },
    {
      email: "billing@medcore.local",
      firstName: "Brian",
      lastName: "Otieno",
      staffId: "BIL-001",
      jobTitle: "Billing Officer",
      role: ROLES.BILLING_OFFICER,
      department: "FIN"
    },
    {
      email: "cashier@medcore.local",
      firstName: "Mary",
      lastName: "Njeri",
      staffId: "CAS-001",
      jobTitle: "Cashier",
      role: ROLES.ACCOUNTANT,
      department: "CASH"
    },
    {
      email: "credit@medcore.local",
      firstName: "Daniel",
      lastName: "Mwangi",
      staffId: "CRD-001",
      jobTitle: "Credit Controller",
      role: ROLES.CREDIT_CONTROLLER,
      department: "CREDIT"
    }
  ];

  const users = {};
  for (const fixture of fixtures) {
    const user = await prisma.user.upsert({
      where: { email: fixture.email },
      update: {
        tenantId: tenant.id,
        firstName: fixture.firstName,
        lastName: fixture.lastName,
        staffId: fixture.staffId,
        jobTitle: fixture.jobTitle,
        primaryDepartmentId: departments[fixture.department]?.id,
        isSuperAdmin: Boolean(fixture.isSuperAdmin),
        isActive: true
      },
      create: {
        tenantId: tenant.id,
        firstName: fixture.firstName,
        lastName: fixture.lastName,
        email: fixture.email,
        staffId: fixture.staffId,
        jobTitle: fixture.jobTitle,
        primaryDepartmentId: departments[fixture.department]?.id,
        passwordHash,
        isSuperAdmin: Boolean(fixture.isSuperAdmin),
        isActive: true
      }
    });

    const role = await prisma.role.findUnique({ where: { code: fixture.role } });
    if (role) {
      await prisma.userRole.upsert({
        where: { tenantId_userId_roleId: { tenantId: tenant.id, userId: user.id, roleId: role.id } },
        update: {},
        create: { tenantId: tenant.id, userId: user.id, roleId: role.id, createdById: user.id }
      });
    }

    await prisma.userBranch.upsert({
      where: { tenantId_userId_branchId: { tenantId: tenant.id, userId: user.id, branchId: mainBranch.id } },
      update: {},
      create: { tenantId: tenant.id, userId: user.id, branchId: mainBranch.id, createdById: user.id }
    });

    if (departments[fixture.department]) {
      await prisma.userDepartment.upsert({
        where: {
          tenantId_userId_departmentId: {
            tenantId: tenant.id,
            userId: user.id,
            departmentId: departments[fixture.department].id
          }
        },
        update: { branchId: mainBranch.id },
        create: {
          tenantId: tenant.id,
          branchId: mainBranch.id,
          userId: user.id,
          departmentId: departments[fixture.department].id,
          createdById: user.id
        }
      });
    }

    users[fixture.staffId] = user;
  }

  return users;
}

async function seedPatients({ tenant, mainBranch, users }) {
  const patient = await prisma.patient.upsert({
    where: { tenantId_hospitalNumber: { tenantId: tenant.id, hospitalNumber: "UHID-SEED-001" } },
    update: {
      firstName: "Amina",
      lastName: "Otieno",
      gender: "FEMALE",
      phone: "+254733456789",
      status: "ACTIVE"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      hospitalNumber: "UHID-SEED-001",
      firstName: "Amina",
      lastName: "Otieno",
      gender: "FEMALE",
      dateOfBirth: new Date("1991-04-12"),
      maritalStatus: "MARRIED",
      nationalId: "12345678",
      phone: "+254733456789",
      email: "amina.otieno@example.local",
      county: "Nairobi",
      city: "Nairobi",
      status: "ACTIVE",
      createdById: users["ADM-001"].id
    }
  });

  await prisma.patientContact.deleteMany({ where: { patientId: patient.id } });
  await prisma.patientPayerProfile.deleteMany({ where: { patientId: patient.id } });
  await prisma.patientDocument.deleteMany({ where: { patientId: patient.id } });
  await prisma.patientAlert.deleteMany({ where: { patientId: patient.id } });

  await prisma.patientContact.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      patientId: patient.id,
      fullName: "Peter Otieno",
      relationship: "Spouse",
      phone: "+254733456780",
      isEmergency: true,
      isPrimary: true,
      createdById: users["ADM-001"].id
    }
  });

  const payerProfile = await prisma.patientPayerProfile.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      patientId: patient.id,
      payerType: "CORPORATE",
      corporateAccountId: "CORP-SEED-001",
      creditAccountId: "DBT-SEED-001",
      isDefault: true,
      notes: "Seed corporate payer profile",
      createdById: users["ADM-001"].id
    }
  });

  await prisma.patientDocument.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      patientId: patient.id,
      documentType: "NATIONAL_ID",
      fileName: "seed-national-id.pdf",
      fileUrl: "https://example.local/documents/seed-national-id.pdf",
      mimeType: "application/pdf",
      fileSize: 128000,
      notes: "Seed document placeholder",
      uploadedById: users["ADM-001"].id
    }
  });

  await prisma.patientAlert.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      patientId: patient.id,
      alertType: "ALLERGY",
      title: "Penicillin allergy",
      description: "Patient reports rash after penicillin exposure.",
      isActive: true,
      createdById: users["DOC-001"].id
    }
  });

  const visit = await prisma.visit.upsert({
    where: { tenantId_visitNo: { tenantId: tenant.id, visitNo: "VISIT-SEED-001" } },
    update: {
      branchId: mainBranch.id,
      patientId: patient.id,
      visitDate: now(),
      visitType: "OUTPATIENT",
      doctorName: "Dr. Grace Wanjiku"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      patientId: patient.id,
      visitNo: "VISIT-SEED-001",
      visitDate: now(),
      visitType: "OUTPATIENT",
      doctorName: "Dr. Grace Wanjiku",
      createdById: users["REC-001"]?.id || users["ADM-001"].id
    }
  });

  const patientVisit = await prisma.patientVisit.upsert({
    where: { tenantId_visitNumber: { tenantId: tenant.id, visitNumber: "PV-SEED-001" } },
    update: {
      branchId: mainBranch.id,
      patientId: patient.id,
      payerType: "CORPORATE",
      payerProfileId: payerProfile.id,
      departmentName: "Outpatient Department",
      clinicName: "General OPD",
      attendingDoctorId: users["DOC-001"].id,
      status: "OPEN"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      patientId: patient.id,
      visitNumber: "PV-SEED-001",
      visitType: "OUTPATIENT",
      status: "OPEN",
      payerType: "CORPORATE",
      payerProfileId: payerProfile.id,
      departmentName: "Outpatient Department",
      clinicName: "General OPD",
      attendingDoctorId: users["DOC-001"].id,
      notes: "Seed patient visit",
      createdById: users["ADM-001"].id
    }
  });

  return { patient, visit, patientVisit, payerProfile };
}

async function seedEmr({ tenant, mainBranch, users, patient, patientVisit }) {
  const encounter = await prisma.emrEncounter.upsert({
    where: { visitId: patientVisit.id },
    update: {
      patientId: patient.id,
      status: "IN_PROGRESS",
      chiefComplaint: "Cough and fever",
      presentingHistory: "Three days of cough, fever, and fatigue.",
      assignedDoctorId: users["DOC-001"].id
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      patientId: patient.id,
      visitId: patientVisit.id,
      status: "IN_PROGRESS",
      chiefComplaint: "Cough and fever",
      presentingHistory: "Three days of cough, fever, and fatigue.",
      assignedDoctorId: users["DOC-001"].id,
      createdById: users["DOC-001"].id
    }
  });

  await prisma.emrTriage.deleteMany({ where: { encounterId: encounter.id } });
  await prisma.emrVitalSign.deleteMany({ where: { encounterId: encounter.id } });
  await prisma.emrAllergy.deleteMany({ where: { encounterId: encounter.id } });
  await prisma.emrClinicalNote.deleteMany({ where: { encounterId: encounter.id } });
  await prisma.emrDiagnosis.deleteMany({ where: { encounterId: encounter.id } });
  await prisma.emrOrder.deleteMany({ where: { encounterId: encounter.id } });
  await prisma.emrPrescription.deleteMany({ where: { encounterId: encounter.id } });
  await prisma.emrDischargeSummary.deleteMany({ where: { encounterId: encounter.id } });

  await prisma.emrTriage.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      encounterId: encounter.id,
      priority: "MODERATE",
      complaint: "Fever and productive cough",
      notes: "Seed triage record",
      recordedById: users["DOC-001"].id,
      status: "SIGNED"
    }
  });

  await prisma.emrVitalSign.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      encounterId: encounter.id,
      temperatureCelsius: "38.20",
      systolicBp: 122,
      diastolicBp: 78,
      pulseRate: 92,
      respiratoryRate: 18,
      oxygenSaturation: 97,
      weightKg: "68.40",
      heightCm: "166.00",
      bmi: "24.82",
      recordedById: users["DOC-001"].id,
      status: "SIGNED"
    }
  });

  await prisma.emrAllergy.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      encounterId: encounter.id,
      patientId: patient.id,
      allergen: "Penicillin",
      reaction: "Rash",
      severity: "MODERATE",
      recordedById: users["DOC-001"].id
    }
  });

  await prisma.emrClinicalNote.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      encounterId: encounter.id,
      subjective: "Fever and cough for three days.",
      objective: "Febrile, stable oxygen saturation.",
      assessment: "Suspected upper respiratory tract infection.",
      plan: "Medication, hydration, review if symptoms worsen.",
      status: "SIGNED",
      signedById: users["DOC-001"].id,
      signedAt: now(),
      createdById: users["DOC-001"].id
    }
  });

  await prisma.emrDiagnosis.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      encounterId: encounter.id,
      diagnosisType: "PROVISIONAL",
      code: "J06.9",
      description: "Acute upper respiratory infection, unspecified",
      recordedById: users["DOC-001"].id
    }
  });

  await prisma.emrOrder.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      encounterId: encounter.id,
      orderType: "LAB",
      orderStatus: "ORDERED",
      itemCode: "CBC",
      description: "Complete blood count",
      priority: "ROUTINE",
      targetModule: "LAB",
      orderedById: users["DOC-001"].id,
      orderedAt: now()
    }
  });

  await prisma.emrPrescription.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      encounterId: encounter.id,
      medicationName: "Cetirizine 10mg",
      genericName: "Cetirizine",
      dosage: "10mg",
      frequency: "OD",
      duration: "5 days",
      route: "Oral",
      quantity: 5,
      instructions: "Take at night",
      status: "ORDERED",
      prescribedById: users["DOC-001"].id
    }
  });

  await prisma.emrDischargeSummary.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      encounterId: encounter.id,
      finalDiagnosis: "Upper respiratory tract infection",
      treatmentGiven: "Symptomatic treatment and antihistamine",
      dischargeCondition: "Stable",
      followUpInstructions: "Return if fever persists beyond 48 hours",
      status: "DRAFT",
      createdById: users["DOC-001"].id
    }
  });

  return { encounter };
}

async function seedFinance({ tenant, mainBranch, users, patient, visit, patientVisit }) {
  const creditCustomer = await prisma.creditCustomer.upsert({
    where: { tenantId_customerCode: { tenantId: tenant.id, customerCode: "CORP-SEED-001" } },
    update: {
      branchId: mainBranch.id,
      name: "Acme Kenya Ltd",
      customerType: "CORPORATE",
      creditLimit: "250000.00",
      isActive: true
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      name: "Acme Kenya Ltd",
      customerCode: "CORP-SEED-001",
      customerType: "CORPORATE",
      creditLimit: "250000.00",
      createdById: users["ADM-001"].id
    }
  });

  const scheme = await prisma.insuranceScheme.upsert({
    where: { tenantId_schemeCode: { tenantId: tenant.id, schemeCode: "SCH-SEED-001" } },
    update: {
      branchId: mainBranch.id,
      name: "Acme Comprehensive Scheme",
      requiresAuthorization: false
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      name: "Acme Comprehensive Scheme",
      schemeCode: "SCH-SEED-001",
      requiresAuthorization: false,
      createdById: users["ADM-001"].id
    }
  });

  const invoice = await prisma.invoice.upsert({
    where: { tenantId_invoiceNo: { tenantId: tenant.id, invoiceNo: "INV-SEED-0001" } },
    update: {
      branchId: mainBranch.id,
      patientId: patient.id,
      visitId: visit.id,
      patientVisitId: patientVisit.id,
      creditCustomerId: creditCustomer.id,
      schemeId: scheme.id,
      status: "PARTIALLY_PAID",
      amountPaid: "1000.00",
      outstandingAmount: "2500.00"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      invoiceNo: "INV-SEED-0001",
      invoiceDate: now(),
      patientId: patient.id,
      visitId: visit.id,
      patientVisitId: patientVisit.id,
      creditCustomerId: creditCustomer.id,
      schemeId: scheme.id,
      billingType: "CREDIT",
      grossAmount: "3500.00",
      discountAmount: "0.00",
      netAmount: "3500.00",
      patientCopayAmount: "500.00",
      creditAmount: "3000.00",
      amountPaid: "1000.00",
      outstandingAmount: "2500.00",
      status: "PARTIALLY_PAID",
      notes: "Seed outpatient credit invoice",
      createdById: users["BIL-001"].id,
      approvedById: users["CRD-001"].id,
      approvedAt: now()
    }
  });

  await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
  await prisma.invoiceApproval.deleteMany({ where: { invoiceId: invoice.id } });
  await prisma.claim.deleteMany({ where: { invoiceId: invoice.id } });

  await prisma.invoiceItem.createMany({
    data: [
      {
        tenantId: tenant.id,
        branchId: mainBranch.id,
        invoiceId: invoice.id,
        servicePoint: "OPD",
        itemCode: "CONS-GEN",
        description: "General consultation",
        quantity: "1.00",
        unitPrice: "1500.00",
        netAmount: "1500.00",
        createdById: users["BIL-001"].id
      },
      {
        tenantId: tenant.id,
        branchId: mainBranch.id,
        invoiceId: invoice.id,
        servicePoint: "LAB",
        itemCode: "CBC",
        description: "Complete blood count",
        quantity: "1.00",
        unitPrice: "2000.00",
        netAmount: "2000.00",
        createdById: users["BIL-001"].id
      }
    ]
  });

  await prisma.invoiceApproval.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      invoiceId: invoice.id,
      action: "APPROVED",
      comments: "Seed approval",
      actedById: users["CRD-001"].id,
      createdById: users["CRD-001"].id
    }
  });

  const payment = await prisma.payment.upsert({
    where: { id: (await prisma.payment.findFirst({ where: { tenantId: tenant.id, referenceNo: "MPESA-SEED-001" } }))?.id || "" },
    update: {
      branchId: mainBranch.id,
      patientId: patient.id,
      amountReceived: "1000.00",
      unappliedAmount: "0.00"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      patientId: patient.id,
      paymentDate: now(),
      paymentMethod: "MOBILE_MONEY",
      referenceNo: "MPESA-SEED-001",
      amountReceived: "1000.00",
      unappliedAmount: "0.00",
      notes: "Seed payment",
      createdById: users["CAS-001"].id
    }
  });

  const allocation = await prisma.paymentAllocation.upsert({
    where: { paymentId_invoiceId: { paymentId: payment.id, invoiceId: invoice.id } },
    update: { allocatedAmount: "1000.00" },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      paymentId: payment.id,
      invoiceId: invoice.id,
      allocatedAmount: "1000.00",
      createdById: users["CAS-001"].id
    }
  });

  await prisma.receipt.upsert({
    where: { tenantId_receiptNo: { tenantId: tenant.id, receiptNo: "RCT-SEED-0001" } },
    update: {
      branchId: mainBranch.id,
      invoiceId: invoice.id,
      paymentId: payment.id,
      paymentAllocationId: allocation.id,
      patientId: patient.id,
      amount: "1000.00"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      receiptNo: "RCT-SEED-0001",
      receiptDate: now(),
      invoiceId: invoice.id,
      paymentId: payment.id,
      paymentAllocationId: allocation.id,
      patientId: patient.id,
      amount: "1000.00",
      createdById: users["CAS-001"].id
    }
  });

  const claim = await prisma.claim.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      claimNo: "CLM-SEED-0001",
      invoiceId: invoice.id,
      visitId: visit.id,
      patientVisitId: patientVisit.id,
      patientId: patient.id,
      creditCustomerId: creditCustomer.id,
      schemeId: scheme.id,
      claimDate: now(),
      claimAmount: "3000.00",
      status: "DRAFT",
      createdById: users["BIL-001"].id
    }
  }).catch(async () => prisma.claim.findUnique({ where: { invoiceId: invoice.id } }));

  return { creditCustomer, scheme, invoice, payment, allocation, claim };
}

async function seedPharmacy({ tenant, mainBranch, users, patient, visit, creditCustomer, invoice }) {
  const category = await prisma.drugCategory.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "ANTIB" } },
    update: { name: "Antibiotics", isActive: true },
    create: {
      tenantId: tenant.id,
      code: "ANTIB",
      name: "Antibiotics",
      description: "Antibacterial medicines",
      createdById: users["ADM-001"].id
    }
  });

  const store = await prisma.pharmacyStore.upsert({
    where: { tenantId_branchId_code: { tenantId: tenant.id, branchId: mainBranch.id, code: "MAIN-PHARM" } },
    update: { name: "Main Pharmacy", storeType: "MAIN", isActive: true },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      name: "Main Pharmacy",
      code: "MAIN-PHARM",
      storeType: "MAIN",
      description: "Seed pharmacy store",
      createdById: users["ADM-001"].id
    }
  });

  const supplier = await prisma.supplier.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "SUP-SEED-001" } },
    update: { name: "Nairobi Pharma Distributors", isActive: true },
    create: {
      tenantId: tenant.id,
      code: "SUP-SEED-001",
      name: "Nairobi Pharma Distributors",
      contactPerson: "Procurement Desk",
      phone: "+254711234567",
      email: "sales@nairobipharma.local",
      address: "Nairobi, Kenya",
      city: "Nairobi",
      country: "Kenya",
      paymentTerms: 30,
      creditLimit: "1000000.00",
      rating: "A",
      createdById: users["ADM-001"].id
    }
  });

  const drug = await prisma.drug.upsert({
    where: { tenantId_drugCode: { tenantId: tenant.id, drugCode: "AMX-500-CAP" } },
    update: {
      categoryId: category.id,
      name: "Amoxicillin 500mg Capsules",
      isActive: true
    },
    create: {
      tenantId: tenant.id,
      categoryId: category.id,
      drugCode: "AMX-500-CAP",
      name: "Amoxicillin 500mg Capsules",
      genericName: "Amoxicillin",
      dosageForm: "Capsule",
      strength: "500mg",
      unitOfMeasure: "Capsule",
      packSize: 100,
      manufacturer: "Seed Pharma",
      requiresPrescription: true,
      storageConditions: "Room temperature",
      shelfLife: 24,
      reorderLevel: 150,
      maxStockLevel: 5000,
      standardPrice: "6.50",
      sellingPrice: "12.00",
      createdById: users["ADM-001"].id
    }
  });

  const batch = await prisma.drugBatch.upsert({
    where: { tenantId_drugId_batchNumber: { tenantId: tenant.id, drugId: drug.id, batchNumber: "AMX-SEED-001" } },
    update: {
      supplierId: supplier.id,
      storeId: store.id,
      expiryDate: daysFromNow(365),
      currentStock: 650,
      costPrice: "6.50",
      sellingPrice: "12.00"
    },
    create: {
      tenantId: tenant.id,
      drugId: drug.id,
      batchNumber: "AMX-SEED-001",
      supplierId: supplier.id,
      storeId: store.id,
      manufactureDate: daysFromNow(-60),
      expiryDate: daysFromNow(365),
      quantityReceived: 650,
      currentStock: 650,
      costPrice: "6.50",
      sellingPrice: "12.00",
      createdById: users["ADM-001"].id
    }
  });

  await prisma.stockMovement.deleteMany({ where: { tenantId: tenant.id, referenceType: "SEED" } });
  await prisma.stockMovement.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      storeId: store.id,
      drugId: drug.id,
      batchId: batch.id,
      movementType: "PURCHASE_RECEIPT",
      quantity: 650,
      quantityBefore: 0,
      quantityAfter: 650,
      costAmount: money(650 * 6.5),
      referenceType: "SEED",
      notes: "Opening seed stock",
      createdById: users["ADM-001"].id
    }
  });

  const prescription = await prisma.prescription.upsert({
    where: { tenantId_prescriptionNo: { tenantId: tenant.id, prescriptionNo: "RX-SEED-0001" } },
    update: {
      branchId: mainBranch.id,
      patientId: patient.id,
      visitId: visit.id,
      status: "PENDING"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      patientId: patient.id,
      visitId: visit.id,
      prescriptionNo: "RX-SEED-0001",
      prescriptionDate: now(),
      prescriberName: "Dr. Grace Wanjiku",
      prescriberId: users["DOC-001"].id,
      diagnosis: "Upper respiratory tract infection",
      payerType: "CORPORATE",
      creditAccountId: creditCustomer.id,
      status: "PENDING",
      createdById: users["DOC-001"].id
    }
  });

  await prisma.prescriptionItem.deleteMany({ where: { prescriptionId: prescription.id } });
  await prisma.prescriptionItem.create({
    data: {
      tenantId: tenant.id,
      prescriptionId: prescription.id,
      drugId: drug.id,
      dosage: "1 capsule",
      frequency: "TDS",
      duration: 5,
      durationUnit: "DAYS",
      instructions: "Take after meals",
      quantityPrescribed: 15,
      unitPrice: "12.00",
      totalAmount: "180.00",
      createdById: users["DOC-001"].id
    }
  });

  const purchaseOrder = await prisma.purchaseOrder.upsert({
    where: { tenantId_orderNo: { tenantId: tenant.id, orderNo: "PO-SEED-0001" } },
    update: {
      branchId: mainBranch.id,
      supplierId: supplier.id,
      status: "SUBMITTED",
      totalAmount: "3250.00"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      supplierId: supplier.id,
      orderNo: "PO-SEED-0001",
      orderDate: now(),
      expectedDeliveryDate: daysFromNow(7),
      status: "SUBMITTED",
      subtotal: "3250.00",
      discountAmount: "0.00",
      taxAmount: "0.00",
      totalAmount: "3250.00",
      submittedById: users["ADM-001"].id,
      submittedAt: now(),
      createdById: users["ADM-001"].id
    }
  });

  await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: purchaseOrder.id } });
  await prisma.purchaseOrderItem.create({
    data: {
      tenantId: tenant.id,
      purchaseOrderId: purchaseOrder.id,
      drugId: drug.id,
      quantityOrdered: 500,
      unitCost: "6.50",
      taxAmount: "0.00",
      totalAmount: "3250.00",
      createdById: users["ADM-001"].id
    }
  });

  const sale = await prisma.pharmacySale.upsert({
    where: { tenantId_saleNumber: { tenantId: tenant.id, saleNumber: "PHS-SEED-0001" } },
    update: {
      branchId: mainBranch.id,
      prescriptionId: prescription.id,
      invoiceId: invoice.id,
      saleStatus: "APPROVED",
      paymentStatus: "UNPAID"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      saleNumber: "PHS-SEED-0001",
      prescriptionId: prescription.id,
      patientName: "Amina Otieno",
      patientNumber: patient.hospitalNumber,
      payerType: "CORPORATE",
      creditAccountId: creditCustomer.id,
      invoiceId: invoice.id,
      grossAmount: "180.00",
      netAmount: "180.00",
      outstandingAmount: "180.00",
      paymentStatus: "UNPAID",
      saleStatus: "APPROVED",
      createdById: users["ADM-001"].id,
      approvedById: users["ADM-001"].id
    }
  });

  await prisma.pharmacySaleItem.deleteMany({ where: { saleId: sale.id } });
  await prisma.pharmacySaleItem.create({
    data: {
      tenantId: tenant.id,
      saleId: sale.id,
      pharmacyItemId: drug.id,
      batchId: batch.id,
      quantity: 15,
      unitPrice: "12.00",
      totalAmount: "180.00",
      createdById: users["ADM-001"].id
    }
  });

  return { category, store, supplier, drug, batch, prescription, purchaseOrder, sale };
}

async function seedCash({ tenant, mainBranch, users, invoice }) {
  const counter = await prisma.cashCounter.upsert({
    where: { tenantId_branchId_code: { tenantId: tenant.id, branchId: mainBranch.id, code: "CASH-01" } },
    update: { name: "Main Cash Counter", isActive: true },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      name: "Main Cash Counter",
      code: "CASH-01",
      department: "Cash Office",
      description: "Seed cash counter",
      defaultCurrency: "KES",
      createdById: users["ADM-001"].id
    }
  });

  const cashier = await prisma.cashierProfile.upsert({
    where: { tenantId_staffNumber: { tenantId: tenant.id, staffNumber: "CAS-001" } },
    update: {
      branchId: mainBranch.id,
      userId: users["CAS-001"].id,
      defaultCounterId: counter.id,
      isActive: true
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      userId: users["CAS-001"].id,
      staffNumber: "CAS-001",
      firstName: "Mary",
      lastName: "Njeri",
      email: "cashier@medcore.local",
      phone: "+254722000333",
      department: "Cash Office",
      defaultCounterId: counter.id,
      createdById: users["ADM-001"].id
    }
  });

  const session = await prisma.cashSession.upsert({
    where: { tenantId_sessionNumber: { tenantId: tenant.id, sessionNumber: "CS-SEED-0001" } },
    update: {
      branchId: mainBranch.id,
      counterId: counter.id,
      cashierId: cashier.id,
      status: "OPEN"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      counterId: counter.id,
      cashierId: cashier.id,
      sessionNumber: "CS-SEED-0001",
      status: "OPEN",
      openingFloat: "5000.00",
      openingNotes: "Seed cash session",
      openedById: users["CAS-001"].id,
      createdById: users["CAS-001"].id
    }
  });

  await prisma.cashPayment.deleteMany({ where: { sessionId: session.id, referenceNo: "CASH-SEED-001" } });
  const cashPayment = await prisma.cashPayment.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      sessionId: session.id,
      paymentMethod: "CASH",
      amount: "500.00",
      referenceNo: "CASH-SEED-001",
      payerName: "Amina Otieno",
      invoiceNo: invoice.invoiceNo,
      receiptNo: "CASH-RCT-SEED-001",
      notes: "Seed cash co-pay",
      createdById: users["CAS-001"].id
    }
  });

  await prisma.cashRefund.deleteMany({ where: { sessionId: session.id, refundNumber: "REF-SEED-0001" } });
  await prisma.cashRefund.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      sessionId: session.id,
      refundNumber: "REF-SEED-0001",
      status: "PENDING",
      originalPaymentId: cashPayment.id,
      originalReceiptNo: "CASH-RCT-SEED-001",
      amount: "50.00",
      reason: "Seed refund request",
      refundMethod: "CASH",
      requestedById: users["CAS-001"].id,
      createdById: users["CAS-001"].id
    }
  });

  await prisma.cashHandover.upsert({
    where: { tenantId_handoverNumber: { tenantId: tenant.id, handoverNumber: "HO-SEED-0001" } },
    update: {
      sessionId: session.id,
      totalCashCollected: "500.00",
      actualCounted: "5500.00"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      sessionId: session.id,
      handoverNumber: "HO-SEED-0001",
      totalCashCollected: "500.00",
      totalRefunds: "0.00",
      netCash: "500.00",
      openingFloat: "5000.00",
      expectedClosing: "5500.00",
      actualCounted: "5500.00",
      variance: "0.00",
      submittedById: users["CAS-001"].id,
      createdById: users["CAS-001"].id
    }
  });

  return { counter, cashier, session, cashPayment };
}

async function seedDebtors({ tenant, mainBranch, users, departments }) {
  const account = await prisma.debtorAccount.upsert({
    where: { debtorCode: "DBT-SEED-001" },
    update: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      debtorName: "Acme Kenya Ltd",
      status: "ACTIVE",
      creditLimit: "250000.00",
      currentBalance: "2500.00",
      availableCredit: "247500.00"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      debtorCode: "DBT-SEED-001",
      debtorName: "Acme Kenya Ltd",
      debtorType: "CORPORATE",
      status: "ACTIVE",
      legalName: "Acme Kenya Limited",
      taxPin: "P051111111A",
      email: "accounts@acme.local",
      phone: "+254700111222",
      city: "Nairobi",
      creditLimit: "250000.00",
      currentBalance: "2500.00",
      availableCredit: "247500.00",
      paymentTermsDays: 30,
      billingCycle: "MONTHLY",
      activatedAt: now(),
      activatedById: users["CRD-001"].id,
      createdById: users["CRD-001"].id
    }
  });

  await prisma.debtorContact.deleteMany({ where: { debtorAccountId: account.id } });
  await prisma.debtorContract.deleteMany({ where: { debtorAccountId: account.id } });
  await prisma.debtorStatement.deleteMany({ where: { debtorAccountId: account.id } });
  await prisma.debtorReconciliation.deleteMany({ where: { debtorAccountId: account.id } });
  await prisma.debtorDocument.deleteMany({ where: { debtorAccountId: account.id } });

  await prisma.debtorContact.create({
    data: {
      debtorAccountId: account.id,
      contactType: "BILLING",
      fullName: "Jane Corporate",
      jobTitle: "Finance Manager",
      phone: "+254700111223",
      email: "jane.corporate@acme.local",
      isPrimary: true,
      createdById: users["CRD-001"].id
    }
  });

  await prisma.debtorContract.create({
    data: {
      debtorAccountId: account.id,
      contractNumber: "CNT-SEED-001",
      contractName: "Acme Staff Medical Cover",
      startDate: daysFromNow(-30),
      endDate: daysFromNow(335),
      billingCycle: "MONTHLY",
      paymentTermsDays: 30,
      creditLimit: "250000.00",
      outpatientAllowed: true,
      pharmacyAllowed: true,
      notes: "Seed debtor contract",
      createdById: users["CRD-001"].id
    }
  });

  await prisma.debtorStatement.create({
    data: {
      statementNumber: "DST-SEED-0001",
      debtorAccountId: account.id,
      periodStart: daysFromNow(-30),
      periodEnd: now(),
      openingBalance: "0.00",
      invoiceTotal: "3500.00",
      paymentTotal: "1000.00",
      closingBalance: "2500.00",
      status: "GENERATED",
      generatedById: users["CRD-001"].id
    }
  }).catch(() => undefined);

  await prisma.debtorReconciliation.create({
    data: {
      reconciliationNumber: "REC-SEED-0001",
      debtorAccountId: account.id,
      paymentReference: "MPESA-SEED-001",
      remittanceReference: "RMT-SEED-001",
      remittanceAmount: "1000.00",
      matchedAmount: "1000.00",
      unmatchedAmount: "0.00",
      status: "MATCHED",
      notes: "Seed reconciliation",
      startedById: users["CRD-001"].id
    }
  }).catch(() => undefined);

  await prisma.debtorDocument.create({
    data: {
      debtorAccountId: account.id,
      documentType: "CONTRACT",
      fileName: "acme-contract.pdf",
      fileUrl: "https://example.local/documents/acme-contract.pdf",
      mimeType: "application/pdf",
      fileSize: 256000,
      notes: "Seed debtor contract document",
      uploadedById: users["CRD-001"].id
    }
  });

  const scheme = await prisma.debtorScheme.upsert({
    where: { debtorAccountId_schemeCode: { debtorAccountId: account.id, schemeCode: "SCH-SEED-001" } },
    update: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      schemeName: "Acme Comprehensive Scheme",
      status: "ACTIVE",
      creditLimit: "250000.00"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      debtorAccountId: account.id,
      schemeCode: "SCH-SEED-001",
      schemeName: "Acme Comprehensive Scheme",
      schemeType: "COMPREHENSIVE",
      status: "ACTIVE",
      description: "Seed debtor scheme",
      startDate: daysFromNow(-30),
      endDate: daysFromNow(335),
      creditLimit: "250000.00",
      currentBalance: "2500.00",
      availableCredit: "247500.00",
      paymentTermsDays: 30,
      billingCycle: "MONTHLY",
      createdById: users["CRD-001"].id
    }
  });

  await prisma.schemeCopaymentRule.deleteMany({ where: { debtorSchemeId: scheme.id } });
  await prisma.schemeCopaymentCategory.deleteMany({ where: { debtorSchemeId: scheme.id } });
  await prisma.schemeAuthorizationRule.deleteMany({ where: { debtorSchemeId: scheme.id } });
  await prisma.schemeDepartmentRule.deleteMany({ where: { debtorSchemeId: scheme.id } });

  await prisma.schemeDepartmentRule.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      debtorSchemeId: scheme.id,
      departmentId: departments.OPD.id,
      isAllowed: true,
      requiresAuthorization: false,
      createdById: users["CRD-001"].id
    }
  });

  const category = await prisma.schemeCopaymentCategory.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      debtorSchemeId: scheme.id,
      code: "CONSULT",
      name: "Consultation Co-pay",
      serviceCategory: "CONSULTATION",
      isActive: true,
      createdById: users["CRD-001"].id
    }
  });

  await prisma.schemeCopaymentRule.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      debtorSchemeId: scheme.id,
      copaymentCategoryId: category.id,
      serviceCategory: "CONSULTATION",
      copaymentType: "FIXED_AMOUNT",
      fixedAmount: "500.00",
      appliesToConsultation: true,
      isActive: true,
      createdById: users["CRD-001"].id
    }
  });

  await prisma.schemeAuthorizationRule.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      debtorSchemeId: scheme.id,
      serviceCategory: "RADIOLOGY",
      requiresAuthorization: true,
      thresholdAmount: "10000.00",
      notes: "Seed authorization threshold",
      isActive: true,
      createdById: users["CRD-001"].id
    }
  });

  return { debtorAccount: account, debtorScheme: scheme };
}

async function seedCreditControl({ tenant, mainBranch, users, debtorAccount, invoice }) {
  const creditCase = await prisma.creditControlCase.upsert({
    where: { caseNumber: "CC-SEED-0001" },
    update: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      creditAccountId: debtorAccount.id,
      primaryInvoiceId: invoice.id,
      status: "IN_PROGRESS",
      outstandingAmount: "2500.00",
      overdueAmount: "500.00"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      caseNumber: "CC-SEED-0001",
      creditAccountId: debtorAccount.id,
      primaryInvoiceId: invoice.id,
      status: "IN_PROGRESS",
      riskLevel: "MEDIUM",
      agingBucket: "DAYS_1_30",
      outstandingAmount: "2500.00",
      overdueAmount: "500.00",
      daysOverdue: 12,
      assignedCollectorId: users["CRD-001"].id,
      assignedById: users["ADM-001"].id,
      assignedAt: now(),
      nextFollowUpAt: daysFromNow(3),
      summary: "Seed credit control case",
      createdById: users["CRD-001"].id
    }
  });

  await prisma.creditControlFollowUp.deleteMany({ where: { caseId: creditCase.id } });
  await prisma.promiseToPay.deleteMany({ where: { caseId: creditCase.id } });
  await prisma.creditHold.deleteMany({ where: { caseId: creditCase.id } });
  await prisma.creditDispute.deleteMany({ where: { caseId: creditCase.id } });
  await prisma.writeOffRecommendation.deleteMany({ where: { caseId: creditCase.id } });

  await prisma.creditControlFollowUp.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      caseId: creditCase.id,
      actionType: "PHONE_CALL",
      outcome: "PROMISED_TO_PAY",
      contactPerson: "Jane Corporate",
      contactPhone: "+254700111223",
      notes: "Client promised partial settlement.",
      nextFollowUpAt: daysFromNow(3),
      recordedById: users["CRD-001"].id
    }
  });

  await prisma.promiseToPay.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      caseId: creditCase.id,
      promisedAmount: "1500.00",
      promisedDate: daysFromNow(7),
      notes: "Seed promise to pay",
      createdById: users["CRD-001"].id
    }
  });

  await prisma.creditHold.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      caseId: creditCase.id,
      creditAccountId: debtorAccount.id,
      status: "RECOMMENDED",
      reason: "Seed hold recommendation for overdue balance",
      recommendedById: users["CRD-001"].id
    }
  });

  await prisma.creditDispute.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      caseId: creditCase.id,
      creditAccountId: debtorAccount.id,
      invoiceId: invoice.id,
      status: "OPEN",
      disputeReason: "Seed disputed line item",
      disputedAmount: "500.00",
      openedById: users["CRD-001"].id
    }
  });

  await prisma.writeOffRecommendation.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      caseId: creditCase.id,
      creditAccountId: debtorAccount.id,
      invoiceId: invoice.id,
      amount: "250.00",
      reason: "Seed write-off recommendation",
      status: "PENDING",
      recommendedById: users["CRD-001"].id
    }
  });

  return { creditCase };
}

async function seedPatientBilling({ tenant, mainBranch, users, patient, patientVisit, debtorAccount, debtorScheme, cash }) {
  const bill = await prisma.patientBill.upsert({
    where: { billNumber: "BILL-SEED-0001" },
    update: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      patientId: patient.id,
      patientVisitId: patientVisit.id,
      debtorAccountId: debtorAccount.id,
      debtorSchemeId: debtorScheme.id,
      status: "PARTIALLY_PAID",
      paymentStatus: "PARTIALLY_PAID",
      paidAmount: "500.00",
      outstandingAmount: "3000.00"
    },
    create: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      billNumber: "BILL-SEED-0001",
      patientId: patient.id,
      patientVisitId: patientVisit.id,
      payerType: "CORPORATE",
      debtorAccountId: debtorAccount.id,
      debtorSchemeId: debtorScheme.id,
      status: "PARTIALLY_PAID",
      paymentStatus: "PARTIALLY_PAID",
      grossAmount: "3500.00",
      netAmount: "3500.00",
      patientPayableAmount: "500.00",
      debtorPayableAmount: "3000.00",
      paidAmount: "500.00",
      outstandingAmount: "3000.00",
      notes: "Seed patient bill",
      createdById: users["BIL-001"].id
    }
  });

  await prisma.patientBillItem.deleteMany({ where: { billId: bill.id } });
  await prisma.billingAdjustment.deleteMany({ where: { billId: bill.id } });
  await prisma.billingPaymentLink.deleteMany({ where: { billId: bill.id } });

  const item = await prisma.patientBillItem.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      billId: bill.id,
      patientId: patient.id,
      patientVisitId: patientVisit.id,
      sourceType: "CONSULTATION",
      serviceCategory: "CONSULTATION",
      serviceCode: "CONS-GEN",
      description: "General consultation",
      quantity: "1.00",
      unitPrice: "1500.00",
      grossAmount: "1500.00",
      netAmount: "1500.00",
      patientPayableAmount: "500.00",
      debtorPayableAmount: "1000.00",
      copaymentAmount: "500.00",
      schemeCoveredAmount: "1000.00",
      status: "APPROVED",
      createdById: users["BIL-001"].id
    }
  });

  await prisma.billingAdjustment.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      billId: bill.id,
      billItemId: item.id,
      adjustmentType: "DISCOUNT",
      amount: "0.00",
      reason: "Seed no-discount adjustment placeholder",
      createdById: users["BIL-001"].id
    }
  });

  await prisma.billingPaymentLink.create({
    data: {
      tenantId: tenant.id,
      branchId: mainBranch.id,
      billId: bill.id,
      cashPaymentId: cash.cashPayment.id,
      cashSessionId: cash.session.id,
      amount: "500.00",
      linkedById: users["CAS-001"].id
    }
  });

  return { bill };
}

async function seedAppointmentIfAvailable({ tenant, mainBranch, users, patient, departments }) {
  if (!prisma.appointment) {
    console.log("Appointment model is not in prisma/schema.prisma; skipping appointment seed.");
    return null;
  }

  const start = daysFromNow(1);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  return prisma.appointment.upsert({
    where: { appointmentNumber: "APT-SEED-0001" },
    update: {
      patientId: patient.id,
      departmentId: departments.OPD?.id,
      doctorId: users["DOC-001"].id,
      status: "CONFIRMED",
      scheduledStartAt: start,
      scheduledEndAt: end
    },
    create: {
      appointmentNumber: "APT-SEED-0001",
      patientId: patient.id,
      departmentId: departments.OPD?.id,
      doctorId: users["DOC-001"].id,
      appointmentType: "NEW_CONSULTATION",
      priority: "ROUTINE",
      source: "FRONT_DESK",
      status: "CONFIRMED",
      scheduledStartAt: start,
      scheduledEndAt: end,
      reason: "Seed appointment",
      createdById: users["ADM-001"].id
    }
  });
}

async function main() {
  console.log("Connecting to database...");
  await prisma.$connect();
  console.log("Database connected. Starting comprehensive seed...");

  await seedPermissions();
  await seedRoles();

  const facility = await seedFacility();
  const departments = await seedDepartments(facility);
  const users = await seedUsers({ ...facility, departments });
  const patientContext = await seedPatients({ ...facility, users });
  await seedAppointmentIfAvailable({ ...facility, users, departments, patient: patientContext.patient });
  await seedEmr({ ...facility, users, ...patientContext });
  const finance = await seedFinance({ ...facility, users, ...patientContext });
  const pharmacy = await seedPharmacy({ ...facility, users, ...patientContext, ...finance });
  const cash = await seedCash({ ...facility, users, invoice: finance.invoice });
  const debtors = await seedDebtors({ ...facility, users, departments });
  await seedCreditControl({ ...facility, users, ...debtors, invoice: finance.invoice });
  await seedPatientBilling({ ...facility, users, ...patientContext, ...debtors, cash });

  console.log("Seed completed successfully.");
  console.log(`Tenant: ${facility.tenant.name}`);
  console.log(`Branch: ${facility.mainBranch.name}`);
  console.log(`Patient: ${patientContext.patient.hospitalNumber}`);
  console.log(`Invoice: ${finance.invoice.invoiceNo}`);
  console.log(`Prescription: ${pharmacy.prescription.prescriptionNo}`);
  console.log("Default login: admin@medcore.local / Admin@123");
}

main()
  .catch((error) => {
    console.error("Seed failed.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
