/*
  Warnings:

  - The `gender` column on the `Patient` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Prescription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `dosage` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `drugId` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `durationUnit` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `instructions` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `isSubstituted` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantityDispensed` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantityPrescribed` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `substitutedDrugId` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `amountPaid` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `authorizationNo` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `billingType` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceSchemeId` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `outstandingAmount` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `saleDate` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `saleNo` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `soldById` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `taxAmount` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Sale` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uhid]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,saleNumber]` on the table `Sale` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pharmacyItemId` to the `PrescriptionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prescribedQuantity` to the `PrescriptionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saleNumber` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PayerType" AS ENUM ('CASH', 'INSURANCE', 'CORPORATE', 'PATIENT_CREDIT', 'SHA');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('PENDING', 'APPROVED', 'PARTIALLY_DISPENSED', 'DISPENSED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PrescriptionItemStatus" AS ENUM ('PENDING', 'APPROVED', 'DISPENSED', 'PARTIALLY_DISPENSED', 'UNAVAILABLE', 'SUBSTITUTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PharmacySaleStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'PAID', 'CREDIT_APPROVED', 'DISPENSED', 'PARTIALLY_DISPENSED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PharmacyPaymentStatus" AS ENUM ('UNPAID', 'PAID', 'PARTIALLY_PAID', 'CREDIT_BILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PharmacyReturnStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PharmacyAuditAction" AS ENUM ('ITEM_CREATED', 'ITEM_UPDATED', 'PRICE_UPDATED', 'STOCK_RECEIVED', 'STOCK_ADJUSTED', 'STOCK_DISPENSED', 'PRESCRIPTION_CREATED', 'PRESCRIPTION_APPROVED', 'SALE_CREATED', 'SALE_PAID', 'SALE_CREDIT_BILLED', 'SALE_DISPENSED', 'RETURN_CREATED', 'RETURN_APPROVED');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED', 'DECEASED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PatientAuditAction" AS ENUM ('PATIENT_CREATED', 'PATIENT_UPDATED', 'PATIENT_STATUS_CHANGED', 'VISIT_CREATED', 'VISIT_UPDATED', 'VISIT_CANCELLED', 'DOCUMENT_UPLOADED', 'ALERT_CREATED', 'ALERT_RESOLVED');

-- CreateEnum
CREATE TYPE "PatientDocumentType" AS ENUM ('NATIONAL_ID', 'PASSPORT', 'BIRTH_CERTIFICATE', 'DRIVING_LICENSE', 'OTHER');

-- CreateEnum
CREATE TYPE "PatientAlertType" AS ENUM ('ALLERGY', 'FALL_RISK', 'VIP', 'SECURITY', 'PAYMENT_REQUIRED', 'CLINICAL_WARNING', 'OTHER');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmrEncounterStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'READY_FOR_DISCHARGE', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClinicalRecordStatus" AS ENUM ('DRAFT', 'SIGNED', 'AMENDED', 'VOIDED');

-- CreateEnum
CREATE TYPE "TriagePriority" AS ENUM ('RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DiagnosisType" AS ENUM ('PROVISIONAL', 'FINAL', 'DIFFERENTIAL');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('LAB', 'RADIOLOGY', 'PHARMACY', 'PROCEDURE', 'REFERRAL');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AllergySeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "EmrAuditAction" AS ENUM ('ENCOUNTER_CREATED', 'ENCOUNTER_UPDATED', 'ENCOUNTER_CLOSED', 'VITALS_RECORDED', 'TRIAGE_RECORDED', 'NOTE_CREATED', 'NOTE_SIGNED', 'NOTE_AMENDED', 'NOTE_VOIDED', 'DIAGNOSIS_ADDED', 'ORDER_CREATED', 'ORDER_CANCELLED', 'PRESCRIPTION_CREATED', 'PRESCRIPTION_CANCELLED', 'DISCHARGE_SUMMARY_CREATED', 'DISCHARGE_SUMMARY_SIGNED', 'ALLERGY_CREATED', 'ALLERGY_RESOLVED');

-- CreateEnum
CREATE TYPE "CashSessionStatus" AS ENUM ('OPEN', 'CLOSED', 'VOIDED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RoleCode" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'PHARMACY_CASHIER', 'FINANCE_MANAGER', 'CREDIT_OFFICER', 'SENIOR_CREDIT_OFFICER', 'AUDITOR');

-- CreateEnum
CREATE TYPE "CreditControlCaseStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PROMISED_TO_PAY', 'DISPUTED', 'ESCALATED', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CreditRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AgingBucket" AS ENUM ('CURRENT', 'DAYS_1_30', 'DAYS_31_60', 'DAYS_61_90', 'DAYS_91_120', 'OVER_120');

-- CreateEnum
CREATE TYPE "FollowUpActionType" AS ENUM ('PHONE_CALL', 'EMAIL', 'SMS', 'LETTER', 'IN_PERSON_VISIT', 'INTERNAL_NOTE', 'PAYMENT_RECEIVED', 'DISPUTE_DISCUSSION', 'ESCALATION', 'OTHER');

-- CreateEnum
CREATE TYPE "FollowUpOutcome" AS ENUM ('NO_ANSWER', 'PROMISED_TO_PAY', 'PAYMENT_MADE', 'DISPUTED', 'REQUESTED_STATEMENT', 'ESCALATE', 'FOLLOW_UP_REQUIRED', 'RESOLVED', 'OTHER');

-- CreateEnum
CREATE TYPE "CreditHoldStatus" AS ENUM ('NONE', 'RECOMMENDED', 'APPROVED', 'ACTIVE', 'RELEASE_REQUESTED', 'RELEASED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WriteOffRecommendationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'POSTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CreditControlAuditAction" AS ENUM ('CASE_CREATED', 'CASE_UPDATED', 'CASE_ASSIGNED', 'FOLLOW_UP_RECORDED', 'PROMISE_TO_PAY_CREATED', 'PROMISE_TO_PAY_UPDATED', 'CREDIT_HOLD_RECOMMENDED', 'CREDIT_HOLD_APPROVED', 'CREDIT_HOLD_RELEASED', 'DISPUTE_CREATED', 'DISPUTE_RESOLVED', 'WRITE_OFF_RECOMMENDED', 'WRITE_OFF_APPROVED', 'CASE_CLOSED');

-- CreateEnum
CREATE TYPE "DebtorType" AS ENUM ('INSURANCE', 'CORPORATE', 'DIRECT_CORPORATE', 'SHA', 'NGO', 'EMBASSY', 'GOVERNMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "DebtorAccountStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ON_HOLD', 'SUSPENDED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DebtorContactType" AS ENUM ('BILLING', 'CLAIMS', 'FINANCE', 'AUTHORIZATION', 'GENERAL');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StatementStatus" AS ENUM ('GENERATED', 'SENT', 'ACKNOWLEDGED', 'DISPUTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'MATCHED', 'PARTIALLY_MATCHED', 'DISPUTED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DebtorDocumentType" AS ENUM ('CONTRACT', 'CREDIT_AGREEMENT', 'TAX_CERTIFICATE', 'CONTACT_LIST', 'SHA_DOCUMENT', 'INSURANCE_PANEL_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "DebtorAuditAction" AS ENUM ('ACCOUNT_CREATED', 'ACCOUNT_UPDATED', 'ACCOUNT_ACTIVATED', 'ACCOUNT_ON_HOLD', 'ACCOUNT_SUSPENDED', 'ACCOUNT_CLOSED', 'ACCOUNT_ARCHIVED', 'CREDIT_LIMIT_UPDATED', 'CONTACT_CREATED', 'CONTACT_UPDATED', 'CONTRACT_CREATED', 'CONTRACT_UPDATED', 'STATEMENT_GENERATED', 'STATEMENT_SENT', 'RECONCILIATION_CREATED', 'RECONCILIATION_UPDATED', 'DOCUMENT_UPLOADED');

-- CreateEnum
CREATE TYPE "CopaymentType" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE', 'CONSULTATION_ONLY', 'SERVICE_POINT_BASED');

-- CreateEnum
CREATE TYPE "CopaymentCategory" AS ENUM ('CONSULTATION', 'PHARMACY', 'LABORATORY', 'RADIOLOGY', 'DENTAL', 'OPTICAL', 'PHYSIOTHERAPY', 'PROCEDURES', 'MATERNITY', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "LimitType" AS ENUM ('PER_VISIT', 'PER_DAY', 'PER_MONTH', 'PER_YEAR', 'LIFETIME');

-- CreateEnum
CREATE TYPE "OverLimitHandling" AS ENUM ('BLOCK_SERVICE', 'ALLOW_CASH_TOPUP', 'REQUIRE_OVERRIDE', 'ALLOW_WITH_APPROVAL');

-- CreateEnum
CREATE TYPE "DebtorSchemeStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SchemeType" AS ENUM ('OUTPATIENT', 'INPATIENT', 'COMPREHENSIVE', 'MATERNITY', 'DENTAL', 'OPTICAL', 'CHRONIC_CARE', 'EMERGENCY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OverLimitAction" AS ENUM ('BLOCK_SERVICE', 'ALLOW_CASH_TOPUP', 'REQUIRE_OVERRIDE', 'ALLOW_WITH_APPROVAL');

-- CreateEnum
CREATE TYPE "SchemeServiceCategory" AS ENUM ('CONSULTATION', 'PHARMACY', 'LABORATORY', 'RADIOLOGY', 'DENTAL', 'OPTICAL', 'PHYSIOTHERAPY', 'PROCEDURE', 'MATERNITY', 'EMERGENCY', 'INPATIENT', 'THEATRE', 'OTHER');

-- CreateEnum
CREATE TYPE "SchemeAuditAction" AS ENUM ('SCHEME_CREATED', 'SCHEME_UPDATED', 'SCHEME_ACTIVATED', 'SCHEME_DEACTIVATED', 'SCHEME_SUSPENDED', 'SCHEME_EXPIRED', 'SCHEME_ARCHIVED', 'DEPARTMENT_RULE_CREATED', 'DEPARTMENT_RULE_UPDATED', 'SERVICE_POINT_RULE_CREATED', 'SERVICE_POINT_RULE_UPDATED', 'OUTPATIENT_LIMIT_CREATED', 'OUTPATIENT_LIMIT_UPDATED', 'VISIT_LIMIT_CREATED', 'VISIT_LIMIT_UPDATED', 'COPAYMENT_CATEGORY_CREATED', 'COPAYMENT_CATEGORY_UPDATED', 'COPAYMENT_RULE_CREATED', 'COPAYMENT_RULE_UPDATED', 'AUTHORIZATION_RULE_CREATED', 'AUTHORIZATION_RULE_UPDATED');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('DRAFT', 'OPEN', 'PARTIALLY_PAID', 'PAID', 'POSTED_TO_CREDIT', 'CANCELLED', 'REVERSED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "BillItemStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'POSTED_TO_CREDIT', 'REVERSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingPayerType" AS ENUM ('CASH', 'INSURANCE', 'CORPORATE', 'DIRECT_CORPORATE', 'SHA', 'PATIENT_CREDIT');

-- CreateEnum
CREATE TYPE "BillingSourceType" AS ENUM ('MANUAL', 'CONSULTATION', 'EMR_ORDER', 'PHARMACY', 'LABORATORY', 'RADIOLOGY', 'PROCEDURE', 'INPATIENT', 'THEATRE', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'CREDIT_POSTED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BillingAdjustmentType" AS ENUM ('DISCOUNT', 'WAIVER', 'PRICE_OVERRIDE', 'REVERSAL', 'CORRECTION');

-- CreateEnum
CREATE TYPE "BillingAuditAction" AS ENUM ('BILL_CREATED', 'BILL_UPDATED', 'BILL_CANCELLED', 'BILL_ITEM_ADDED', 'BILL_ITEM_UPDATED', 'BILL_ITEM_REVERSED', 'DISCOUNT_APPLIED', 'WAIVER_APPLIED', 'PRICE_OVERRIDE_APPLIED', 'SCHEME_VALIDATED', 'CASH_PAYMENT_LINKED', 'CREDIT_POSTED', 'BILL_MARKED_PAID');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VisitType" ADD VALUE 'EMERGENCY';
ALTER TYPE "VisitType" ADD VALUE 'DAYCARE';
ALTER TYPE "VisitType" ADD VALUE 'WALKIN';
ALTER TYPE "VisitType" ADD VALUE 'REFERRAL';
ALTER TYPE "VisitType" ADD VALUE 'REVIEW';
ALTER TYPE "VisitType" ADD VALUE 'FOLLOW_UP';

-- DropForeignKey
ALTER TABLE "PrescriptionItem" DROP CONSTRAINT "PrescriptionItem_drugId_fkey";

-- DropIndex
DROP INDEX "PrescriptionItem_drugId_idx";

-- DropIndex
DROP INDEX "Sale_saleDate_idx";

-- DropIndex
DROP INDEX "Sale_tenantId_saleNo_key";

-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "patientVisitId" UUID;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "patientVisitId" UUID;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "address" TEXT,
ADD COLUMN     "alternativePhone" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "county" TEXT,
ADD COLUMN     "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "nationalId" TEXT,
ADD COLUMN     "passportNumber" TEXT,
ADD COLUMN     "status" "PatientStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'UNKNOWN';

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "creditAccountId" UUID,
ADD COLUMN     "patientVisitId" UUID,
ADD COLUMN     "payerType" "PayerType",
DROP COLUMN "status",
ADD COLUMN     "status" "PrescriptionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "PrescriptionItem" DROP COLUMN "dosage",
DROP COLUMN "drugId",
DROP COLUMN "duration",
DROP COLUMN "durationUnit",
DROP COLUMN "frequency",
DROP COLUMN "instructions",
DROP COLUMN "isSubstituted",
DROP COLUMN "quantityDispensed",
DROP COLUMN "quantityPrescribed",
DROP COLUMN "substitutedDrugId",
DROP COLUMN "totalAmount",
DROP COLUMN "unitPrice",
ADD COLUMN     "approvedQuantity" INTEGER,
ADD COLUMN     "dispensedQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dosageInstructions" TEXT,
ADD COLUMN     "pharmacyItemId" UUID NOT NULL,
ADD COLUMN     "prescribedQuantity" INTEGER NOT NULL,
ADD COLUMN     "status" "PrescriptionItemStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "substitutionItemId" TEXT,
ADD COLUMN     "substitutionReason" TEXT;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "amountPaid",
DROP COLUMN "authorizationNo",
DROP COLUMN "billingType",
DROP COLUMN "customerId",
DROP COLUMN "insuranceSchemeId",
DROP COLUMN "notes",
DROP COLUMN "outstandingAmount",
DROP COLUMN "paymentStatus",
DROP COLUMN "saleDate",
DROP COLUMN "saleNo",
DROP COLUMN "soldById",
DROP COLUMN "subtotal",
DROP COLUMN "taxAmount",
DROP COLUMN "totalAmount",
ADD COLUMN     "grossAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN     "netAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN     "patientId" UUID,
ADD COLUMN     "saleNumber" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "pharmacySaleId" UUID;

-- CreateTable
CREATE TABLE "PatientVisit" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "visitNo" TEXT NOT NULL,
    "visitType" "VisitType" NOT NULL DEFAULT 'OUTPATIENT',
    "status" "VisitStatus" NOT NULL DEFAULT 'OPEN',
    "payerType" "PayerType" NOT NULL DEFAULT 'CASH',
    "payerProfileId" TEXT,
    "departmentName" TEXT,
    "clinicName" TEXT,
    "attendingDoctorId" TEXT,
    "checkInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "notes" TEXT,
    "createdById" UUID,
    "updatedById" UUID,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientContact" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdById" UUID,
    "updatedById" UUID,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientPayerProfile" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "payerType" "PayerType" NOT NULL,
    "insuranceProvider" TEXT,
    "policyNumber" TEXT,
    "memberNumber" TEXT,
    "corporateAccountId" TEXT,
    "creditAccountId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdById" UUID,
    "updatedById" UUID,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientPayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientDocument" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "documentType" "PatientDocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "notes" TEXT,
    "uploadedById" UUID,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PatientDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientAlert" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "alertType" "PatientAlertType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID,
    "resolvedById" UUID,
    "resolvedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientAuditLog" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "patientId" UUID,
    "actorId" UUID,
    "action" "PatientAuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmrEncounter" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "visitId" UUID NOT NULL,
    "status" "EmrEncounterStatus" NOT NULL DEFAULT 'OPEN',
    "chiefComplaint" TEXT,
    "presentingHistory" TEXT,
    "assignedDoctorId" TEXT,
    "assignedNurseId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmrEncounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmrTriage" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "encounterId" UUID NOT NULL,
    "priority" "TriagePriority" NOT NULL DEFAULT 'UNKNOWN',
    "complaint" TEXT,
    "notes" TEXT,
    "recordedById" UUID,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ClinicalRecordStatus" NOT NULL DEFAULT 'SIGNED',

    CONSTRAINT "EmrTriage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmrVitalSign" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "encounterId" UUID NOT NULL,
    "temperatureCelsius" DECIMAL(5,2),
    "systolicBp" INTEGER,
    "diastolicBp" INTEGER,
    "pulseRate" INTEGER,
    "respiratoryRate" INTEGER,
    "oxygenSaturation" INTEGER,
    "weightKg" DECIMAL(6,2),
    "heightCm" DECIMAL(6,2),
    "bmi" DECIMAL(6,2),
    "painScore" INTEGER,
    "notes" TEXT,
    "recordedById" UUID,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ClinicalRecordStatus" NOT NULL DEFAULT 'SIGNED',

    CONSTRAINT "EmrVitalSign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmrAllergy" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "encounterId" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "allergen" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" "AllergySeverity" NOT NULL DEFAULT 'UNKNOWN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "recordedById" UUID,
    "resolvedById" UUID,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmrAllergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmrClinicalNote" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "encounterId" UUID NOT NULL,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "noteText" TEXT,
    "status" "ClinicalRecordStatus" NOT NULL DEFAULT 'DRAFT',
    "signedById" UUID,
    "signedAt" TIMESTAMP(3),
    "amendedFromId" UUID,
    "amendmentReason" TEXT,
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmrClinicalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmrDiagnosis" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "encounterId" UUID NOT NULL,
    "diagnosisType" "DiagnosisType" NOT NULL,
    "code" TEXT,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "recordedById" UUID,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmrDiagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmrOrder" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "encounterId" UUID NOT NULL,
    "orderType" "OrderType" NOT NULL,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "itemCode" TEXT,
    "description" TEXT NOT NULL,
    "priority" TEXT,
    "targetModule" TEXT,
    "targetRecordId" TEXT,
    "notes" TEXT,
    "orderedById" UUID,
    "orderedAt" TIMESTAMP(3),
    "cancelledById" UUID,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmrOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmrPrescription" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "encounterId" UUID NOT NULL,
    "pharmacySaleId" UUID,
    "medicationName" TEXT NOT NULL,
    "genericName" TEXT,
    "dosage" TEXT,
    "frequency" TEXT,
    "duration" TEXT,
    "route" TEXT,
    "quantity" INTEGER,
    "instructions" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'ORDERED',
    "prescribedById" UUID,
    "prescribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledById" UUID,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,

    CONSTRAINT "EmrPrescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmrDischargeSummary" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "encounterId" UUID NOT NULL,
    "finalDiagnosis" TEXT,
    "treatmentGiven" TEXT,
    "proceduresDone" TEXT,
    "dischargeCondition" TEXT,
    "dischargeMedications" TEXT,
    "followUpInstructions" TEXT,
    "status" "ClinicalRecordStatus" NOT NULL DEFAULT 'DRAFT',
    "signedById" UUID,
    "signedAt" TIMESTAMP(3),
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmrDischargeSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmrAuditLog" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "encounterId" UUID,
    "patientId" UUID,
    "actorId" UUID,
    "action" "EmrAuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousValues" JSONB,
    "newValues" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmrAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashCounterAudit" (
    "id" UUID NOT NULL,
    "cashCounterId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashCounterAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashierProfileAudit" (
    "id" UUID NOT NULL,
    "cashierProfileId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashierProfileAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashSessionAudit" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashSessionAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashPaymentAudit" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashPaymentAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashRefundAudit" (
    "id" UUID NOT NULL,
    "refundId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashRefundAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashHandoverAudit" (
    "id" UUID NOT NULL,
    "handoverId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashHandoverAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacySale" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "saleNumber" TEXT NOT NULL,
    "prescriptionId" UUID,
    "patientName" TEXT,
    "patientNumber" TEXT,
    "encounterNumber" TEXT,
    "payerType" "PayerType" NOT NULL,
    "creditAccountId" UUID,
    "invoiceId" UUID,
    "cashSessionId" UUID,
    "grossAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "outstandingAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paymentStatus" "PharmacyPaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "saleStatus" "PharmacySaleStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdById" UUID,
    "approvedById" UUID,
    "dispensedById" UUID,
    "paidAt" TIMESTAMP(3),
    "dispensedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacySale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacySaleItem" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "pharmacyItemId" UUID NOT NULL,
    "batchId" UUID,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "dispensedQuantity" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PharmacySaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyReturn" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "saleItemId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "isRestockable" BOOLEAN NOT NULL DEFAULT false,
    "status" "PharmacyReturnStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedById" UUID,
    "approvedById" UUID,
    "completedById" UUID,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "refundRequired" BOOLEAN NOT NULL DEFAULT false,
    "creditNoteRequired" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacyReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashCounter" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "department" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'KES',
    "supervisorId" UUID,
    "createdById" UUID,
    "updatedById" UUID,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashierProfile" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "staffNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "department" TEXT,
    "defaultCounterId" UUID,
    "supervisorId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID,
    "updatedById" UUID,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashierProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashSession" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "counterId" UUID NOT NULL,
    "cashierId" UUID NOT NULL,
    "sessionNumber" TEXT NOT NULL,
    "status" "CashSessionStatus" NOT NULL DEFAULT 'OPEN',
    "openingFloat" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "openingNotes" TEXT,
    "expectedCash" DECIMAL(14,2),
    "actualCash" DECIMAL(14,2),
    "variance" DECIMAL(14,2),
    "closingNotes" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedById" UUID,
    "closedAt" TIMESTAMP(3),
    "closedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "approvedById" UUID,
    "rejectedAt" TIMESTAMP(3),
    "rejectedById" UUID,
    "rejectionReason" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashPayment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "referenceNo" TEXT,
    "payerName" TEXT,
    "payerDetails" TEXT,
    "invoiceNo" TEXT,
    "receiptNo" TEXT,
    "notes" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashRefund" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "refundNumber" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "originalPaymentId" UUID,
    "originalReceiptNo" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "refundMethod" "PaymentMethod" NOT NULL,
    "referenceNo" TEXT,
    "requestedById" UUID,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "rejectedById" UUID,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "processedById" UUID,
    "processedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashRefund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashHandover" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "handoverNumber" TEXT NOT NULL,
    "totalCashCollected" DECIMAL(14,2) NOT NULL,
    "totalRefunds" DECIMAL(14,2) NOT NULL,
    "netCash" DECIMAL(14,2) NOT NULL,
    "openingFloat" DECIMAL(14,2) NOT NULL,
    "expectedClosing" DECIMAL(14,2) NOT NULL,
    "actualCounted" DECIMAL(14,2) NOT NULL,
    "variance" DECIMAL(14,2) NOT NULL,
    "varianceReason" TEXT,
    "submittedById" UUID,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMP(3),
    "reviewStatus" TEXT,
    "reviewNotes" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashHandover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditControlCase" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "creditAccountId" TEXT NOT NULL,
    "primaryInvoiceId" TEXT,
    "status" "CreditControlCaseStatus" NOT NULL DEFAULT 'OPEN',
    "riskLevel" "CreditRiskLevel" NOT NULL DEFAULT 'LOW',
    "agingBucket" "AgingBucket" NOT NULL DEFAULT 'CURRENT',
    "outstandingAmount" DECIMAL(12,2) NOT NULL,
    "overdueAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "daysOverdue" INTEGER NOT NULL DEFAULT 0,
    "assignedCollectorId" TEXT,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "closureReason" TEXT,
    "nextFollowUpAt" TIMESTAMP(3),
    "summary" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditControlCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditControlFollowUp" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "caseId" TEXT NOT NULL,
    "actionType" "FollowUpActionType" NOT NULL,
    "outcome" "FollowUpOutcome" NOT NULL,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT NOT NULL,
    "nextFollowUpAt" TIMESTAMP(3),
    "recordedById" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditControlFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromiseToPay" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "caseId" TEXT NOT NULL,
    "promisedAmount" DECIMAL(12,2) NOT NULL,
    "promisedDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "isFulfilled" BOOLEAN NOT NULL DEFAULT false,
    "fulfilledAt" TIMESTAMP(3),
    "fulfilledAmount" DECIMAL(12,2),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromiseToPay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditHold" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "caseId" TEXT NOT NULL,
    "creditAccountId" TEXT NOT NULL,
    "status" "CreditHoldStatus" NOT NULL DEFAULT 'RECOMMENDED',
    "reason" TEXT NOT NULL,
    "recommendedById" TEXT,
    "recommendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "releasedById" TEXT,
    "releasedAt" TIMESTAMP(3),
    "releaseReason" TEXT,

    CONSTRAINT "CreditHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditDispute" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "caseId" TEXT NOT NULL,
    "creditAccountId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "disputeReason" TEXT NOT NULL,
    "disputedAmount" DECIMAL(12,2),
    "openedById" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,

    CONSTRAINT "CreditDispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WriteOffRecommendation" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "caseId" TEXT NOT NULL,
    "creditAccountId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "WriteOffRecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "recommendedById" TEXT,
    "recommendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "postedAt" TIMESTAMP(3),
    "postedAdjustmentId" TEXT,

    CONSTRAINT "WriteOffRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditControlAuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "caseId" TEXT,
    "creditAccountId" TEXT,
    "actorId" TEXT,
    "action" "CreditControlAuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousValues" JSONB,
    "newValues" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditControlAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtorAccount" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "debtorCode" TEXT NOT NULL,
    "debtorName" TEXT NOT NULL,
    "debtorType" "DebtorType" NOT NULL,
    "status" "DebtorAccountStatus" NOT NULL DEFAULT 'DRAFT',
    "legalName" TEXT,
    "taxPin" TEXT,
    "registrationNumber" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "physicalAddress" TEXT,
    "postalAddress" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'Kenya',
    "creditLimit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currentBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "availableCredit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "requiresPreAuthorization" BOOLEAN NOT NULL DEFAULT false,
    "allowsOutpatientBilling" BOOLEAN NOT NULL DEFAULT true,
    "allowsInpatientBilling" BOOLEAN NOT NULL DEFAULT true,
    "allowsPharmacyBilling" BOOLEAN NOT NULL DEFAULT true,
    "allowsLabBilling" BOOLEAN NOT NULL DEFAULT true,
    "allowsRadiologyBilling" BOOLEAN NOT NULL DEFAULT true,
    "accountManagerId" TEXT,
    "claimsOfficerId" TEXT,
    "notes" TEXT,
    "activatedAt" TIMESTAMP(3),
    "activatedById" TEXT,
    "heldAt" TIMESTAMP(3),
    "heldById" TEXT,
    "holdReason" TEXT,
    "suspendedAt" TIMESTAMP(3),
    "suspendedById" TEXT,
    "suspensionReason" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "closureReason" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebtorAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtorContact" (
    "id" TEXT NOT NULL,
    "debtorAccountId" TEXT NOT NULL,
    "contactType" "DebtorContactType" NOT NULL DEFAULT 'GENERAL',
    "fullName" TEXT NOT NULL,
    "jobTitle" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebtorContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtorContract" (
    "id" TEXT NOT NULL,
    "debtorAccountId" TEXT NOT NULL,
    "contractNumber" TEXT,
    "contractName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "creditLimit" DECIMAL(14,2),
    "requiresPreAuthorization" BOOLEAN NOT NULL DEFAULT false,
    "outpatientAllowed" BOOLEAN NOT NULL DEFAULT true,
    "inpatientAllowed" BOOLEAN NOT NULL DEFAULT true,
    "pharmacyAllowed" BOOLEAN NOT NULL DEFAULT true,
    "laboratoryAllowed" BOOLEAN NOT NULL DEFAULT true,
    "radiologyAllowed" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebtorContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtorStatement" (
    "id" TEXT NOT NULL,
    "statementNumber" TEXT NOT NULL,
    "debtorAccountId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "openingBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "invoiceTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "paymentTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "adjustmentTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "closingBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "StatementStatus" NOT NULL DEFAULT 'GENERATED',
    "generatedById" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentById" TEXT,
    "sentAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "disputedAt" TIMESTAMP(3),
    "disputeReason" TEXT,
    "fileUrl" TEXT,

    CONSTRAINT "DebtorStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtorReconciliation" (
    "id" TEXT NOT NULL,
    "reconciliationNumber" TEXT NOT NULL,
    "debtorAccountId" TEXT NOT NULL,
    "statementId" TEXT,
    "paymentReference" TEXT,
    "remittanceReference" TEXT,
    "remittanceAmount" DECIMAL(14,2),
    "matchedAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "unmatchedAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "ReconciliationStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "startedById" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedById" TEXT,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "DebtorReconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtorDocument" (
    "id" TEXT NOT NULL,
    "debtorAccountId" TEXT NOT NULL,
    "documentType" "DebtorDocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "notes" TEXT,
    "uploadedById" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebtorDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtorAuditLog" (
    "id" TEXT NOT NULL,
    "debtorAccountId" TEXT,
    "actorId" TEXT,
    "action" "DebtorAuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousValues" JSONB,
    "newValues" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebtorAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtorScheme" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "debtorAccountId" TEXT NOT NULL,
    "schemeCode" TEXT NOT NULL,
    "schemeName" TEXT NOT NULL,
    "schemeType" "SchemeType" NOT NULL DEFAULT 'COMPREHENSIVE',
    "status" "DebtorSchemeStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "creditLimit" DECIMAL(14,2),
    "currentBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "availableCredit" DECIMAL(14,2),
    "paymentTermsDays" INTEGER,
    "billingCycle" TEXT,
    "requiresPreAuthorization" BOOLEAN NOT NULL DEFAULT false,
    "allowsOutpatientBilling" BOOLEAN NOT NULL DEFAULT true,
    "allowsInpatientBilling" BOOLEAN NOT NULL DEFAULT true,
    "allowsPharmacyBilling" BOOLEAN NOT NULL DEFAULT true,
    "allowsLabBilling" BOOLEAN NOT NULL DEFAULT true,
    "allowsRadiologyBilling" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebtorScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeDepartmentRule" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "debtorSchemeId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "requiresAuthorization" BOOLEAN NOT NULL DEFAULT false,
    "allowsCashTopup" BOOLEAN NOT NULL DEFAULT true,
    "overLimitAction" "OverLimitAction" NOT NULL DEFAULT 'ALLOW_CASH_TOPUP',
    "notes" TEXT,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "debtorAccountId" TEXT,

    CONSTRAINT "SchemeDepartmentRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeServicePointRule" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "debtorSchemeId" TEXT NOT NULL,
    "departmentId" TEXT,
    "servicePointId" TEXT,
    "serviceCategory" "SchemeServiceCategory" NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "requiresAuthorization" BOOLEAN NOT NULL DEFAULT false,
    "allowsCashTopup" BOOLEAN NOT NULL DEFAULT true,
    "overLimitAction" "OverLimitAction" NOT NULL DEFAULT 'ALLOW_CASH_TOPUP',
    "notes" TEXT,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemeServicePointRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeOutpatientLimit" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "debtorSchemeId" TEXT NOT NULL,
    "departmentId" TEXT,
    "servicePointId" TEXT,
    "serviceCategory" "SchemeServiceCategory",
    "limitType" "LimitType" NOT NULL,
    "limitAmount" DECIMAL(14,2) NOT NULL,
    "overLimitAction" "OverLimitAction" NOT NULL DEFAULT 'ALLOW_CASH_TOPUP',
    "requiresAuthorization" BOOLEAN NOT NULL DEFAULT false,
    "allowsCashTopup" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "debtorAccountId" TEXT,

    CONSTRAINT "SchemeOutpatientLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeVisitLimit" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "debtorSchemeId" TEXT NOT NULL,
    "departmentId" TEXT,
    "visitType" TEXT,
    "visitLimitAmount" DECIMAL(14,2) NOT NULL,
    "overLimitAction" "OverLimitAction" NOT NULL DEFAULT 'ALLOW_CASH_TOPUP',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "debtorAccountId" TEXT,

    CONSTRAINT "SchemeVisitLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeCopaymentCategory" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "debtorSchemeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceCategory" "SchemeServiceCategory" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemeCopaymentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeCopaymentRule" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "debtorSchemeId" TEXT NOT NULL,
    "copaymentCategoryId" TEXT,
    "departmentId" TEXT,
    "servicePointId" TEXT,
    "serviceCategory" "SchemeServiceCategory",
    "copaymentType" "CopaymentType" NOT NULL,
    "percentageValue" DECIMAL(5,2),
    "fixedAmount" DECIMAL(14,2),
    "minimumAmount" DECIMAL(14,2),
    "maximumAmount" DECIMAL(14,2),
    "appliesToConsultation" BOOLEAN NOT NULL DEFAULT false,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "debtorAccountId" TEXT,

    CONSTRAINT "SchemeCopaymentRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeAuthorizationRule" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "debtorSchemeId" TEXT NOT NULL,
    "departmentId" TEXT,
    "servicePointId" TEXT,
    "serviceCategory" "SchemeServiceCategory",
    "requiresAuthorization" BOOLEAN NOT NULL DEFAULT true,
    "thresholdAmount" DECIMAL(14,2),
    "notes" TEXT,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemeAuthorizationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeAuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "debtorSchemeId" TEXT,
    "actorId" TEXT,
    "action" "SchemeAuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousValues" JSONB,
    "newValues" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchemeAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientBill" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "billNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientVisitId" TEXT,
    "payerType" "BillingPayerType" NOT NULL,
    "debtorAccountId" TEXT,
    "debtorSchemeId" TEXT,
    "patientPayerProfileId" TEXT,
    "status" "BillStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "grossAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "waiverAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "patientPayableAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "debtorPayableAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "outstandingAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "creditInvoiceId" TEXT,
    "cashSessionId" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "cancelledById" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "postedToCreditById" TEXT,
    "postedToCreditAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientBillItem" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "billId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientVisitId" TEXT,
    "sourceType" "BillingSourceType" NOT NULL,
    "sourceRecordId" TEXT,
    "departmentId" TEXT,
    "servicePointId" TEXT,
    "serviceCategory" TEXT,
    "serviceCode" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "grossAmount" DECIMAL(14,2) NOT NULL,
    "discountAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "waiverAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(14,2) NOT NULL,
    "patientPayableAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "debtorPayableAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "copaymentAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cashTopupAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "schemeCoveredAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "BillItemStatus" NOT NULL DEFAULT 'PENDING',
    "requiresAuthorization" BOOLEAN NOT NULL DEFAULT false,
    "authorizationNumber" TEXT,
    "createdById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "reversedById" TEXT,
    "reversedAt" TIMESTAMP(3),
    "reversalReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientBillItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingAdjustment" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "billId" TEXT NOT NULL,
    "billItemId" TEXT,
    "adjustmentType" "BillingAdjustmentType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPaymentLink" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "branchId" UUID,
    "billId" TEXT NOT NULL,
    "cashPaymentId" TEXT,
    "cashSessionId" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "linkedById" TEXT,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingPaymentLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingAuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "billId" TEXT,
    "patientId" TEXT,
    "actorId" TEXT,
    "action" "BillingAuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousValues" JSONB,
    "newValues" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientVisit_visitNo_key" ON "PatientVisit"("visitNo");

-- CreateIndex
CREATE INDEX "PatientVisit_patientId_idx" ON "PatientVisit"("patientId");

-- CreateIndex
CREATE INDEX "PatientVisit_status_idx" ON "PatientVisit"("status");

-- CreateIndex
CREATE INDEX "PatientVisit_tenantId_branchId_patientId_idx" ON "PatientVisit"("tenantId", "branchId", "patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientVisit_tenantId_visitNo_key" ON "PatientVisit"("tenantId", "visitNo");

-- CreateIndex
CREATE INDEX "PatientContact_patientId_idx" ON "PatientContact"("patientId");

-- CreateIndex
CREATE INDEX "PatientContact_tenantId_branchId_idx" ON "PatientContact"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "PatientPayerProfile_patientId_idx" ON "PatientPayerProfile"("patientId");

-- CreateIndex
CREATE INDEX "PatientPayerProfile_payerType_idx" ON "PatientPayerProfile"("payerType");

-- CreateIndex
CREATE INDEX "PatientPayerProfile_tenantId_branchId_idx" ON "PatientPayerProfile"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "PatientDocument_patientId_idx" ON "PatientDocument"("patientId");

-- CreateIndex
CREATE INDEX "PatientDocument_tenantId_branchId_idx" ON "PatientDocument"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "PatientAlert_patientId_idx" ON "PatientAlert"("patientId");

-- CreateIndex
CREATE INDEX "PatientAlert_isActive_idx" ON "PatientAlert"("isActive");

-- CreateIndex
CREATE INDEX "PatientAlert_tenantId_branchId_idx" ON "PatientAlert"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "PatientAuditLog_patientId_idx" ON "PatientAuditLog"("patientId");

-- CreateIndex
CREATE INDEX "PatientAuditLog_actorId_idx" ON "PatientAuditLog"("actorId");

-- CreateIndex
CREATE INDEX "PatientAuditLog_action_idx" ON "PatientAuditLog"("action");

-- CreateIndex
CREATE INDEX "PatientAuditLog_tenantId_branchId_idx" ON "PatientAuditLog"("tenantId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "EmrEncounter_visitId_key" ON "EmrEncounter"("visitId");

-- CreateIndex
CREATE INDEX "EmrEncounter_patientId_idx" ON "EmrEncounter"("patientId");

-- CreateIndex
CREATE INDEX "EmrEncounter_visitId_idx" ON "EmrEncounter"("visitId");

-- CreateIndex
CREATE INDEX "EmrEncounter_status_idx" ON "EmrEncounter"("status");

-- CreateIndex
CREATE INDEX "EmrEncounter_tenantId_branchId_idx" ON "EmrEncounter"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "EmrTriage_encounterId_idx" ON "EmrTriage"("encounterId");

-- CreateIndex
CREATE INDEX "EmrTriage_priority_idx" ON "EmrTriage"("priority");

-- CreateIndex
CREATE INDEX "EmrTriage_tenantId_branchId_idx" ON "EmrTriage"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "EmrVitalSign_encounterId_idx" ON "EmrVitalSign"("encounterId");

-- CreateIndex
CREATE INDEX "EmrVitalSign_recordedAt_idx" ON "EmrVitalSign"("recordedAt");

-- CreateIndex
CREATE INDEX "EmrVitalSign_tenantId_branchId_idx" ON "EmrVitalSign"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "EmrAllergy_patientId_idx" ON "EmrAllergy"("patientId");

-- CreateIndex
CREATE INDEX "EmrAllergy_encounterId_idx" ON "EmrAllergy"("encounterId");

-- CreateIndex
CREATE INDEX "EmrAllergy_isActive_idx" ON "EmrAllergy"("isActive");

-- CreateIndex
CREATE INDEX "EmrAllergy_tenantId_branchId_idx" ON "EmrAllergy"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "EmrClinicalNote_encounterId_idx" ON "EmrClinicalNote"("encounterId");

-- CreateIndex
CREATE INDEX "EmrClinicalNote_status_idx" ON "EmrClinicalNote"("status");

-- CreateIndex
CREATE INDEX "EmrClinicalNote_tenantId_branchId_idx" ON "EmrClinicalNote"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "EmrDiagnosis_encounterId_idx" ON "EmrDiagnosis"("encounterId");

-- CreateIndex
CREATE INDEX "EmrDiagnosis_code_idx" ON "EmrDiagnosis"("code");

-- CreateIndex
CREATE INDEX "EmrDiagnosis_tenantId_branchId_idx" ON "EmrDiagnosis"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "EmrOrder_encounterId_idx" ON "EmrOrder"("encounterId");

-- CreateIndex
CREATE INDEX "EmrOrder_orderType_idx" ON "EmrOrder"("orderType");

-- CreateIndex
CREATE INDEX "EmrOrder_orderStatus_idx" ON "EmrOrder"("orderStatus");

-- CreateIndex
CREATE INDEX "EmrOrder_tenantId_branchId_idx" ON "EmrOrder"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "EmrPrescription_encounterId_idx" ON "EmrPrescription"("encounterId");

-- CreateIndex
CREATE INDEX "EmrPrescription_status_idx" ON "EmrPrescription"("status");

-- CreateIndex
CREATE INDEX "EmrPrescription_tenantId_branchId_idx" ON "EmrPrescription"("tenantId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "EmrDischargeSummary_encounterId_key" ON "EmrDischargeSummary"("encounterId");

-- CreateIndex
CREATE INDEX "EmrAuditLog_encounterId_idx" ON "EmrAuditLog"("encounterId");

-- CreateIndex
CREATE INDEX "EmrAuditLog_patientId_idx" ON "EmrAuditLog"("patientId");

-- CreateIndex
CREATE INDEX "EmrAuditLog_actorId_idx" ON "EmrAuditLog"("actorId");

-- CreateIndex
CREATE INDEX "EmrAuditLog_action_idx" ON "EmrAuditLog"("action");

-- CreateIndex
CREATE INDEX "EmrAuditLog_tenantId_branchId_idx" ON "EmrAuditLog"("tenantId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacySale_prescriptionId_key" ON "PharmacySale"("prescriptionId");

-- CreateIndex
CREATE INDEX "PharmacySale_tenantId_branchId_idx" ON "PharmacySale"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "PharmacySale_payerType_idx" ON "PharmacySale"("payerType");

-- CreateIndex
CREATE INDEX "PharmacySale_creditAccountId_idx" ON "PharmacySale"("creditAccountId");

-- CreateIndex
CREATE INDEX "PharmacySale_invoiceId_idx" ON "PharmacySale"("invoiceId");

-- CreateIndex
CREATE INDEX "PharmacySale_saleStatus_idx" ON "PharmacySale"("saleStatus");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacySale_tenantId_saleNumber_key" ON "PharmacySale"("tenantId", "saleNumber");

-- CreateIndex
CREATE INDEX "PharmacySaleItem_saleId_idx" ON "PharmacySaleItem"("saleId");

-- CreateIndex
CREATE INDEX "PharmacySaleItem_pharmacyItemId_idx" ON "PharmacySaleItem"("pharmacyItemId");

-- CreateIndex
CREATE INDEX "PharmacySaleItem_batchId_idx" ON "PharmacySaleItem"("batchId");

-- CreateIndex
CREATE INDEX "PharmacyReturn_saleId_idx" ON "PharmacyReturn"("saleId");

-- CreateIndex
CREATE INDEX "PharmacyReturn_status_idx" ON "PharmacyReturn"("status");

-- CreateIndex
CREATE INDEX "PharmacyReturn_tenantId_branchId_idx" ON "PharmacyReturn"("tenantId", "branchId");

-- CreateIndex
CREATE INDEX "CashCounter_tenantId_branchId_idx" ON "CashCounter"("tenantId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "CashCounter_tenantId_branchId_code_key" ON "CashCounter"("tenantId", "branchId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "CashierProfile_userId_key" ON "CashierProfile"("userId");

-- CreateIndex
CREATE INDEX "CashierProfile_tenantId_branchId_idx" ON "CashierProfile"("tenantId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "CashierProfile_tenantId_staffNumber_key" ON "CashierProfile"("tenantId", "staffNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CashierProfile_tenantId_userId_key" ON "CashierProfile"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "CashSession_tenantId_branchId_cashierId_status_idx" ON "CashSession"("tenantId", "branchId", "cashierId", "status");

-- CreateIndex
CREATE INDEX "CashSession_tenantId_branchId_counterId_status_idx" ON "CashSession"("tenantId", "branchId", "counterId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CashSession_tenantId_sessionNumber_key" ON "CashSession"("tenantId", "sessionNumber");

-- CreateIndex
CREATE INDEX "CashPayment_tenantId_sessionId_idx" ON "CashPayment"("tenantId", "sessionId");

-- CreateIndex
CREATE INDEX "CashPayment_tenantId_branchId_createdAt_idx" ON "CashPayment"("tenantId", "branchId", "createdAt");

-- CreateIndex
CREATE INDEX "CashRefund_tenantId_sessionId_status_idx" ON "CashRefund"("tenantId", "sessionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CashRefund_tenantId_refundNumber_key" ON "CashRefund"("tenantId", "refundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CashHandover_sessionId_key" ON "CashHandover"("sessionId");

-- CreateIndex
CREATE INDEX "CashHandover_tenantId_sessionId_idx" ON "CashHandover"("tenantId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "CashHandover_tenantId_handoverNumber_key" ON "CashHandover"("tenantId", "handoverNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CreditControlCase_caseNumber_key" ON "CreditControlCase"("caseNumber");

-- CreateIndex
CREATE INDEX "CreditControlCase_tenantId_idx" ON "CreditControlCase"("tenantId");

-- CreateIndex
CREATE INDEX "CreditControlCase_branchId_idx" ON "CreditControlCase"("branchId");

-- CreateIndex
CREATE INDEX "CreditControlCase_creditAccountId_idx" ON "CreditControlCase"("creditAccountId");

-- CreateIndex
CREATE INDEX "CreditControlCase_status_idx" ON "CreditControlCase"("status");

-- CreateIndex
CREATE INDEX "CreditControlCase_riskLevel_idx" ON "CreditControlCase"("riskLevel");

-- CreateIndex
CREATE INDEX "CreditControlCase_agingBucket_idx" ON "CreditControlCase"("agingBucket");

-- CreateIndex
CREATE INDEX "CreditControlCase_assignedCollectorId_idx" ON "CreditControlCase"("assignedCollectorId");

-- CreateIndex
CREATE INDEX "CreditControlCase_nextFollowUpAt_idx" ON "CreditControlCase"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "CreditControlFollowUp_tenantId_idx" ON "CreditControlFollowUp"("tenantId");

-- CreateIndex
CREATE INDEX "CreditControlFollowUp_branchId_idx" ON "CreditControlFollowUp"("branchId");

-- CreateIndex
CREATE INDEX "CreditControlFollowUp_caseId_idx" ON "CreditControlFollowUp"("caseId");

-- CreateIndex
CREATE INDEX "CreditControlFollowUp_actionType_idx" ON "CreditControlFollowUp"("actionType");

-- CreateIndex
CREATE INDEX "CreditControlFollowUp_outcome_idx" ON "CreditControlFollowUp"("outcome");

-- CreateIndex
CREATE INDEX "CreditControlFollowUp_nextFollowUpAt_idx" ON "CreditControlFollowUp"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "PromiseToPay_tenantId_idx" ON "PromiseToPay"("tenantId");

-- CreateIndex
CREATE INDEX "PromiseToPay_branchId_idx" ON "PromiseToPay"("branchId");

-- CreateIndex
CREATE INDEX "PromiseToPay_caseId_idx" ON "PromiseToPay"("caseId");

-- CreateIndex
CREATE INDEX "PromiseToPay_promisedDate_idx" ON "PromiseToPay"("promisedDate");

-- CreateIndex
CREATE INDEX "PromiseToPay_isFulfilled_idx" ON "PromiseToPay"("isFulfilled");

-- CreateIndex
CREATE INDEX "CreditHold_tenantId_idx" ON "CreditHold"("tenantId");

-- CreateIndex
CREATE INDEX "CreditHold_branchId_idx" ON "CreditHold"("branchId");

-- CreateIndex
CREATE INDEX "CreditHold_caseId_idx" ON "CreditHold"("caseId");

-- CreateIndex
CREATE INDEX "CreditHold_creditAccountId_idx" ON "CreditHold"("creditAccountId");

-- CreateIndex
CREATE INDEX "CreditHold_status_idx" ON "CreditHold"("status");

-- CreateIndex
CREATE INDEX "CreditDispute_tenantId_idx" ON "CreditDispute"("tenantId");

-- CreateIndex
CREATE INDEX "CreditDispute_branchId_idx" ON "CreditDispute"("branchId");

-- CreateIndex
CREATE INDEX "CreditDispute_caseId_idx" ON "CreditDispute"("caseId");

-- CreateIndex
CREATE INDEX "CreditDispute_creditAccountId_idx" ON "CreditDispute"("creditAccountId");

-- CreateIndex
CREATE INDEX "CreditDispute_invoiceId_idx" ON "CreditDispute"("invoiceId");

-- CreateIndex
CREATE INDEX "CreditDispute_status_idx" ON "CreditDispute"("status");

-- CreateIndex
CREATE INDEX "WriteOffRecommendation_tenantId_idx" ON "WriteOffRecommendation"("tenantId");

-- CreateIndex
CREATE INDEX "WriteOffRecommendation_branchId_idx" ON "WriteOffRecommendation"("branchId");

-- CreateIndex
CREATE INDEX "WriteOffRecommendation_caseId_idx" ON "WriteOffRecommendation"("caseId");

-- CreateIndex
CREATE INDEX "WriteOffRecommendation_creditAccountId_idx" ON "WriteOffRecommendation"("creditAccountId");

-- CreateIndex
CREATE INDEX "WriteOffRecommendation_invoiceId_idx" ON "WriteOffRecommendation"("invoiceId");

-- CreateIndex
CREATE INDEX "WriteOffRecommendation_status_idx" ON "WriteOffRecommendation"("status");

-- CreateIndex
CREATE INDEX "CreditControlAuditLog_tenantId_idx" ON "CreditControlAuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "CreditControlAuditLog_branchId_idx" ON "CreditControlAuditLog"("branchId");

-- CreateIndex
CREATE INDEX "CreditControlAuditLog_caseId_idx" ON "CreditControlAuditLog"("caseId");

-- CreateIndex
CREATE INDEX "CreditControlAuditLog_creditAccountId_idx" ON "CreditControlAuditLog"("creditAccountId");

-- CreateIndex
CREATE INDEX "CreditControlAuditLog_actorId_idx" ON "CreditControlAuditLog"("actorId");

-- CreateIndex
CREATE INDEX "CreditControlAuditLog_action_idx" ON "CreditControlAuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "DebtorAccount_debtorCode_key" ON "DebtorAccount"("debtorCode");

-- CreateIndex
CREATE INDEX "DebtorAccount_debtorName_idx" ON "DebtorAccount"("debtorName");

-- CreateIndex
CREATE INDEX "DebtorAccount_debtorCode_idx" ON "DebtorAccount"("debtorCode");

-- CreateIndex
CREATE INDEX "DebtorAccount_debtorType_idx" ON "DebtorAccount"("debtorType");

-- CreateIndex
CREATE INDEX "DebtorAccount_status_idx" ON "DebtorAccount"("status");

-- CreateIndex
CREATE INDEX "DebtorAccount_tenantId_idx" ON "DebtorAccount"("tenantId");

-- CreateIndex
CREATE INDEX "DebtorAccount_branchId_idx" ON "DebtorAccount"("branchId");

-- CreateIndex
CREATE INDEX "DebtorContact_debtorAccountId_idx" ON "DebtorContact"("debtorAccountId");

-- CreateIndex
CREATE INDEX "DebtorContact_contactType_idx" ON "DebtorContact"("contactType");

-- CreateIndex
CREATE INDEX "DebtorContact_isActive_idx" ON "DebtorContact"("isActive");

-- CreateIndex
CREATE INDEX "DebtorContract_debtorAccountId_idx" ON "DebtorContract"("debtorAccountId");

-- CreateIndex
CREATE INDEX "DebtorContract_isActive_idx" ON "DebtorContract"("isActive");

-- CreateIndex
CREATE INDEX "DebtorContract_startDate_idx" ON "DebtorContract"("startDate");

-- CreateIndex
CREATE INDEX "DebtorContract_endDate_idx" ON "DebtorContract"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "DebtorStatement_statementNumber_key" ON "DebtorStatement"("statementNumber");

-- CreateIndex
CREATE INDEX "DebtorStatement_debtorAccountId_idx" ON "DebtorStatement"("debtorAccountId");

-- CreateIndex
CREATE INDEX "DebtorStatement_periodStart_idx" ON "DebtorStatement"("periodStart");

-- CreateIndex
CREATE INDEX "DebtorStatement_periodEnd_idx" ON "DebtorStatement"("periodEnd");

-- CreateIndex
CREATE INDEX "DebtorStatement_status_idx" ON "DebtorStatement"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DebtorReconciliation_reconciliationNumber_key" ON "DebtorReconciliation"("reconciliationNumber");

-- CreateIndex
CREATE INDEX "DebtorReconciliation_debtorAccountId_idx" ON "DebtorReconciliation"("debtorAccountId");

-- CreateIndex
CREATE INDEX "DebtorReconciliation_status_idx" ON "DebtorReconciliation"("status");

-- CreateIndex
CREATE INDEX "DebtorDocument_debtorAccountId_idx" ON "DebtorDocument"("debtorAccountId");

-- CreateIndex
CREATE INDEX "DebtorDocument_documentType_idx" ON "DebtorDocument"("documentType");

-- CreateIndex
CREATE INDEX "DebtorAuditLog_debtorAccountId_idx" ON "DebtorAuditLog"("debtorAccountId");

-- CreateIndex
CREATE INDEX "DebtorAuditLog_actorId_idx" ON "DebtorAuditLog"("actorId");

-- CreateIndex
CREATE INDEX "DebtorAuditLog_action_idx" ON "DebtorAuditLog"("action");

-- CreateIndex
CREATE INDEX "DebtorScheme_debtorAccountId_idx" ON "DebtorScheme"("debtorAccountId");

-- CreateIndex
CREATE INDEX "DebtorScheme_schemeName_idx" ON "DebtorScheme"("schemeName");

-- CreateIndex
CREATE INDEX "DebtorScheme_schemeType_idx" ON "DebtorScheme"("schemeType");

-- CreateIndex
CREATE INDEX "DebtorScheme_status_idx" ON "DebtorScheme"("status");

-- CreateIndex
CREATE INDEX "DebtorScheme_tenantId_idx" ON "DebtorScheme"("tenantId");

-- CreateIndex
CREATE INDEX "DebtorScheme_branchId_idx" ON "DebtorScheme"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "DebtorScheme_debtorAccountId_schemeCode_key" ON "DebtorScheme"("debtorAccountId", "schemeCode");

-- CreateIndex
CREATE INDEX "SchemeDepartmentRule_debtorSchemeId_idx" ON "SchemeDepartmentRule"("debtorSchemeId");

-- CreateIndex
CREATE INDEX "SchemeDepartmentRule_departmentId_idx" ON "SchemeDepartmentRule"("departmentId");

-- CreateIndex
CREATE INDEX "SchemeDepartmentRule_isActive_idx" ON "SchemeDepartmentRule"("isActive");

-- CreateIndex
CREATE INDEX "SchemeDepartmentRule_tenantId_idx" ON "SchemeDepartmentRule"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeDepartmentRule_debtorSchemeId_departmentId_key" ON "SchemeDepartmentRule"("debtorSchemeId", "departmentId");

-- CreateIndex
CREATE INDEX "SchemeServicePointRule_debtorSchemeId_idx" ON "SchemeServicePointRule"("debtorSchemeId");

-- CreateIndex
CREATE INDEX "SchemeServicePointRule_departmentId_idx" ON "SchemeServicePointRule"("departmentId");

-- CreateIndex
CREATE INDEX "SchemeServicePointRule_servicePointId_idx" ON "SchemeServicePointRule"("servicePointId");

-- CreateIndex
CREATE INDEX "SchemeServicePointRule_serviceCategory_idx" ON "SchemeServicePointRule"("serviceCategory");

-- CreateIndex
CREATE INDEX "SchemeServicePointRule_isActive_idx" ON "SchemeServicePointRule"("isActive");

-- CreateIndex
CREATE INDEX "SchemeServicePointRule_tenantId_idx" ON "SchemeServicePointRule"("tenantId");

-- CreateIndex
CREATE INDEX "SchemeOutpatientLimit_debtorSchemeId_idx" ON "SchemeOutpatientLimit"("debtorSchemeId");

-- CreateIndex
CREATE INDEX "SchemeOutpatientLimit_departmentId_idx" ON "SchemeOutpatientLimit"("departmentId");

-- CreateIndex
CREATE INDEX "SchemeOutpatientLimit_servicePointId_idx" ON "SchemeOutpatientLimit"("servicePointId");

-- CreateIndex
CREATE INDEX "SchemeOutpatientLimit_serviceCategory_idx" ON "SchemeOutpatientLimit"("serviceCategory");

-- CreateIndex
CREATE INDEX "SchemeOutpatientLimit_limitType_idx" ON "SchemeOutpatientLimit"("limitType");

-- CreateIndex
CREATE INDEX "SchemeOutpatientLimit_isActive_idx" ON "SchemeOutpatientLimit"("isActive");

-- CreateIndex
CREATE INDEX "SchemeOutpatientLimit_tenantId_idx" ON "SchemeOutpatientLimit"("tenantId");

-- CreateIndex
CREATE INDEX "SchemeVisitLimit_debtorSchemeId_idx" ON "SchemeVisitLimit"("debtorSchemeId");

-- CreateIndex
CREATE INDEX "SchemeVisitLimit_departmentId_idx" ON "SchemeVisitLimit"("departmentId");

-- CreateIndex
CREATE INDEX "SchemeVisitLimit_visitType_idx" ON "SchemeVisitLimit"("visitType");

-- CreateIndex
CREATE INDEX "SchemeVisitLimit_isActive_idx" ON "SchemeVisitLimit"("isActive");

-- CreateIndex
CREATE INDEX "SchemeVisitLimit_tenantId_idx" ON "SchemeVisitLimit"("tenantId");

-- CreateIndex
CREATE INDEX "SchemeCopaymentCategory_debtorSchemeId_idx" ON "SchemeCopaymentCategory"("debtorSchemeId");

-- CreateIndex
CREATE INDEX "SchemeCopaymentCategory_serviceCategory_idx" ON "SchemeCopaymentCategory"("serviceCategory");

-- CreateIndex
CREATE INDEX "SchemeCopaymentCategory_isActive_idx" ON "SchemeCopaymentCategory"("isActive");

-- CreateIndex
CREATE INDEX "SchemeCopaymentCategory_tenantId_idx" ON "SchemeCopaymentCategory"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeCopaymentCategory_debtorSchemeId_code_key" ON "SchemeCopaymentCategory"("debtorSchemeId", "code");

-- CreateIndex
CREATE INDEX "SchemeCopaymentRule_debtorSchemeId_idx" ON "SchemeCopaymentRule"("debtorSchemeId");

-- CreateIndex
CREATE INDEX "SchemeCopaymentRule_copaymentCategoryId_idx" ON "SchemeCopaymentRule"("copaymentCategoryId");

-- CreateIndex
CREATE INDEX "SchemeCopaymentRule_departmentId_idx" ON "SchemeCopaymentRule"("departmentId");

-- CreateIndex
CREATE INDEX "SchemeCopaymentRule_servicePointId_idx" ON "SchemeCopaymentRule"("servicePointId");

-- CreateIndex
CREATE INDEX "SchemeCopaymentRule_serviceCategory_idx" ON "SchemeCopaymentRule"("serviceCategory");

-- CreateIndex
CREATE INDEX "SchemeCopaymentRule_isActive_idx" ON "SchemeCopaymentRule"("isActive");

-- CreateIndex
CREATE INDEX "SchemeCopaymentRule_tenantId_idx" ON "SchemeCopaymentRule"("tenantId");

-- CreateIndex
CREATE INDEX "SchemeAuthorizationRule_debtorSchemeId_idx" ON "SchemeAuthorizationRule"("debtorSchemeId");

-- CreateIndex
CREATE INDEX "SchemeAuthorizationRule_departmentId_idx" ON "SchemeAuthorizationRule"("departmentId");

-- CreateIndex
CREATE INDEX "SchemeAuthorizationRule_servicePointId_idx" ON "SchemeAuthorizationRule"("servicePointId");

-- CreateIndex
CREATE INDEX "SchemeAuthorizationRule_serviceCategory_idx" ON "SchemeAuthorizationRule"("serviceCategory");

-- CreateIndex
CREATE INDEX "SchemeAuthorizationRule_isActive_idx" ON "SchemeAuthorizationRule"("isActive");

-- CreateIndex
CREATE INDEX "SchemeAuthorizationRule_tenantId_idx" ON "SchemeAuthorizationRule"("tenantId");

-- CreateIndex
CREATE INDEX "SchemeAuditLog_debtorSchemeId_idx" ON "SchemeAuditLog"("debtorSchemeId");

-- CreateIndex
CREATE INDEX "SchemeAuditLog_actorId_idx" ON "SchemeAuditLog"("actorId");

-- CreateIndex
CREATE INDEX "SchemeAuditLog_action_idx" ON "SchemeAuditLog"("action");

-- CreateIndex
CREATE INDEX "SchemeAuditLog_tenantId_idx" ON "SchemeAuditLog"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientBill_billNumber_key" ON "PatientBill"("billNumber");

-- CreateIndex
CREATE INDEX "PatientBill_patientId_idx" ON "PatientBill"("patientId");

-- CreateIndex
CREATE INDEX "PatientBill_patientVisitId_idx" ON "PatientBill"("patientVisitId");

-- CreateIndex
CREATE INDEX "PatientBill_payerType_idx" ON "PatientBill"("payerType");

-- CreateIndex
CREATE INDEX "PatientBill_status_idx" ON "PatientBill"("status");

-- CreateIndex
CREATE INDEX "PatientBill_paymentStatus_idx" ON "PatientBill"("paymentStatus");

-- CreateIndex
CREATE INDEX "PatientBill_debtorAccountId_idx" ON "PatientBill"("debtorAccountId");

-- CreateIndex
CREATE INDEX "PatientBill_debtorSchemeId_idx" ON "PatientBill"("debtorSchemeId");

-- CreateIndex
CREATE INDEX "PatientBill_tenantId_idx" ON "PatientBill"("tenantId");

-- CreateIndex
CREATE INDEX "PatientBillItem_billId_idx" ON "PatientBillItem"("billId");

-- CreateIndex
CREATE INDEX "PatientBillItem_patientId_idx" ON "PatientBillItem"("patientId");

-- CreateIndex
CREATE INDEX "PatientBillItem_patientVisitId_idx" ON "PatientBillItem"("patientVisitId");

-- CreateIndex
CREATE INDEX "PatientBillItem_sourceType_idx" ON "PatientBillItem"("sourceType");

-- CreateIndex
CREATE INDEX "PatientBillItem_sourceRecordId_idx" ON "PatientBillItem"("sourceRecordId");

-- CreateIndex
CREATE INDEX "PatientBillItem_departmentId_idx" ON "PatientBillItem"("departmentId");

-- CreateIndex
CREATE INDEX "PatientBillItem_servicePointId_idx" ON "PatientBillItem"("servicePointId");

-- CreateIndex
CREATE INDEX "PatientBillItem_status_idx" ON "PatientBillItem"("status");

-- CreateIndex
CREATE INDEX "PatientBillItem_tenantId_idx" ON "PatientBillItem"("tenantId");

-- CreateIndex
CREATE INDEX "BillingAdjustment_billId_idx" ON "BillingAdjustment"("billId");

-- CreateIndex
CREATE INDEX "BillingAdjustment_billItemId_idx" ON "BillingAdjustment"("billItemId");

-- CreateIndex
CREATE INDEX "BillingAdjustment_adjustmentType_idx" ON "BillingAdjustment"("adjustmentType");

-- CreateIndex
CREATE INDEX "BillingAdjustment_tenantId_idx" ON "BillingAdjustment"("tenantId");

-- CreateIndex
CREATE INDEX "BillingPaymentLink_billId_idx" ON "BillingPaymentLink"("billId");

-- CreateIndex
CREATE INDEX "BillingPaymentLink_cashPaymentId_idx" ON "BillingPaymentLink"("cashPaymentId");

-- CreateIndex
CREATE INDEX "BillingPaymentLink_cashSessionId_idx" ON "BillingPaymentLink"("cashSessionId");

-- CreateIndex
CREATE INDEX "BillingPaymentLink_tenantId_idx" ON "BillingPaymentLink"("tenantId");

-- CreateIndex
CREATE INDEX "BillingAuditLog_billId_idx" ON "BillingAuditLog"("billId");

-- CreateIndex
CREATE INDEX "BillingAuditLog_patientId_idx" ON "BillingAuditLog"("patientId");

-- CreateIndex
CREATE INDEX "BillingAuditLog_actorId_idx" ON "BillingAuditLog"("actorId");

-- CreateIndex
CREATE INDEX "BillingAuditLog_action_idx" ON "BillingAuditLog"("action");

-- CreateIndex
CREATE INDEX "BillingAuditLog_tenantId_idx" ON "BillingAuditLog"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_uhid_key" ON "Patient"("uhid");

-- CreateIndex
CREATE INDEX "Patient_firstName_idx" ON "Patient"("firstName");

-- CreateIndex
CREATE INDEX "Patient_lastName_idx" ON "Patient"("lastName");

-- CreateIndex
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");

-- CreateIndex
CREATE INDEX "Patient_nationalId_idx" ON "Patient"("nationalId");

-- CreateIndex
CREATE INDEX "Prescription_status_idx" ON "Prescription"("status");

-- CreateIndex
CREATE INDEX "PrescriptionItem_pharmacyItemId_idx" ON "PrescriptionItem"("pharmacyItemId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_status_idx" ON "PrescriptionItem"("status");

-- CreateIndex
CREATE INDEX "Sale_patientId_idx" ON "Sale"("patientId");

-- CreateIndex
CREATE INDEX "Sale_status_idx" ON "Sale"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_tenantId_saleNumber_key" ON "Sale"("tenantId", "saleNumber");

-- AddForeignKey
ALTER TABLE "PatientVisit" ADD CONSTRAINT "PatientVisit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientVisit" ADD CONSTRAINT "PatientVisit_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientVisit" ADD CONSTRAINT "PatientVisit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientContact" ADD CONSTRAINT "PatientContact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientContact" ADD CONSTRAINT "PatientContact_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientContact" ADD CONSTRAINT "PatientContact_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPayerProfile" ADD CONSTRAINT "PatientPayerProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPayerProfile" ADD CONSTRAINT "PatientPayerProfile_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPayerProfile" ADD CONSTRAINT "PatientPayerProfile_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDocument" ADD CONSTRAINT "PatientDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDocument" ADD CONSTRAINT "PatientDocument_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDocument" ADD CONSTRAINT "PatientDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAlert" ADD CONSTRAINT "PatientAlert_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAlert" ADD CONSTRAINT "PatientAlert_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAlert" ADD CONSTRAINT "PatientAlert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAuditLog" ADD CONSTRAINT "PatientAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAuditLog" ADD CONSTRAINT "PatientAuditLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAuditLog" ADD CONSTRAINT "PatientAuditLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrEncounter" ADD CONSTRAINT "EmrEncounter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrEncounter" ADD CONSTRAINT "EmrEncounter_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrEncounter" ADD CONSTRAINT "EmrEncounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrTriage" ADD CONSTRAINT "EmrTriage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrTriage" ADD CONSTRAINT "EmrTriage_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrTriage" ADD CONSTRAINT "EmrTriage_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "EmrEncounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrVitalSign" ADD CONSTRAINT "EmrVitalSign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrVitalSign" ADD CONSTRAINT "EmrVitalSign_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrVitalSign" ADD CONSTRAINT "EmrVitalSign_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "EmrEncounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrAllergy" ADD CONSTRAINT "EmrAllergy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrAllergy" ADD CONSTRAINT "EmrAllergy_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrAllergy" ADD CONSTRAINT "EmrAllergy_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "EmrEncounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrClinicalNote" ADD CONSTRAINT "EmrClinicalNote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrClinicalNote" ADD CONSTRAINT "EmrClinicalNote_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrClinicalNote" ADD CONSTRAINT "EmrClinicalNote_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "EmrEncounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrDiagnosis" ADD CONSTRAINT "EmrDiagnosis_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrDiagnosis" ADD CONSTRAINT "EmrDiagnosis_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrDiagnosis" ADD CONSTRAINT "EmrDiagnosis_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "EmrEncounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrOrder" ADD CONSTRAINT "EmrOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrOrder" ADD CONSTRAINT "EmrOrder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrOrder" ADD CONSTRAINT "EmrOrder_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "EmrEncounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrPrescription" ADD CONSTRAINT "EmrPrescription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrPrescription" ADD CONSTRAINT "EmrPrescription_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrPrescription" ADD CONSTRAINT "EmrPrescription_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "EmrEncounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrDischargeSummary" ADD CONSTRAINT "EmrDischargeSummary_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrDischargeSummary" ADD CONSTRAINT "EmrDischargeSummary_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrDischargeSummary" ADD CONSTRAINT "EmrDischargeSummary_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "EmrEncounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrAuditLog" ADD CONSTRAINT "EmrAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrAuditLog" ADD CONSTRAINT "EmrAuditLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmrAuditLog" ADD CONSTRAINT "EmrAuditLog_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "EmrEncounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_patientVisitId_fkey" FOREIGN KEY ("patientVisitId") REFERENCES "PatientVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_patientVisitId_fkey" FOREIGN KEY ("patientVisitId") REFERENCES "PatientVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashCounterAudit" ADD CONSTRAINT "CashCounterAudit_cashCounterId_fkey" FOREIGN KEY ("cashCounterId") REFERENCES "CashCounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashierProfileAudit" ADD CONSTRAINT "CashierProfileAudit_cashierProfileId_fkey" FOREIGN KEY ("cashierProfileId") REFERENCES "CashierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashSessionAudit" ADD CONSTRAINT "CashSessionAudit_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CashSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashPaymentAudit" ADD CONSTRAINT "CashPaymentAudit_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "CashPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashRefundAudit" ADD CONSTRAINT "CashRefundAudit_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "CashRefund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashHandoverAudit" ADD CONSTRAINT "CashHandoverAudit_handoverId_fkey" FOREIGN KEY ("handoverId") REFERENCES "CashHandover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_pharmacySaleId_fkey" FOREIGN KEY ("pharmacySaleId") REFERENCES "PharmacySale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientVisitId_fkey" FOREIGN KEY ("patientVisitId") REFERENCES "PatientVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_pharmacyItemId_fkey" FOREIGN KEY ("pharmacyItemId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacySale" ADD CONSTRAINT "PharmacySale_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacySale" ADD CONSTRAINT "PharmacySale_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacySale" ADD CONSTRAINT "PharmacySale_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacySaleItem" ADD CONSTRAINT "PharmacySaleItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacySaleItem" ADD CONSTRAINT "PharmacySaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "PharmacySale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacySaleItem" ADD CONSTRAINT "PharmacySaleItem_pharmacyItemId_fkey" FOREIGN KEY ("pharmacyItemId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacySaleItem" ADD CONSTRAINT "PharmacySaleItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "DrugBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyReturn" ADD CONSTRAINT "PharmacyReturn_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyReturn" ADD CONSTRAINT "PharmacyReturn_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyReturn" ADD CONSTRAINT "PharmacyReturn_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "PharmacySale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashCounter" ADD CONSTRAINT "CashCounter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashCounter" ADD CONSTRAINT "CashCounter_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashierProfile" ADD CONSTRAINT "CashierProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashierProfile" ADD CONSTRAINT "CashierProfile_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashierProfile" ADD CONSTRAINT "CashierProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashierProfile" ADD CONSTRAINT "CashierProfile_defaultCounterId_fkey" FOREIGN KEY ("defaultCounterId") REFERENCES "CashCounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "CashCounter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "CashierProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashPayment" ADD CONSTRAINT "CashPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashPayment" ADD CONSTRAINT "CashPayment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashPayment" ADD CONSTRAINT "CashPayment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CashSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashRefund" ADD CONSTRAINT "CashRefund_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashRefund" ADD CONSTRAINT "CashRefund_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashRefund" ADD CONSTRAINT "CashRefund_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CashSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashHandover" ADD CONSTRAINT "CashHandover_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashHandover" ADD CONSTRAINT "CashHandover_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashHandover" ADD CONSTRAINT "CashHandover_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CashSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditControlCase" ADD CONSTRAINT "CreditControlCase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditControlCase" ADD CONSTRAINT "CreditControlCase_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditControlFollowUp" ADD CONSTRAINT "CreditControlFollowUp_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditControlFollowUp" ADD CONSTRAINT "CreditControlFollowUp_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditControlFollowUp" ADD CONSTRAINT "CreditControlFollowUp_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CreditControlCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromiseToPay" ADD CONSTRAINT "PromiseToPay_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromiseToPay" ADD CONSTRAINT "PromiseToPay_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromiseToPay" ADD CONSTRAINT "PromiseToPay_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CreditControlCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditHold" ADD CONSTRAINT "CreditHold_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditHold" ADD CONSTRAINT "CreditHold_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditHold" ADD CONSTRAINT "CreditHold_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CreditControlCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditDispute" ADD CONSTRAINT "CreditDispute_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditDispute" ADD CONSTRAINT "CreditDispute_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditDispute" ADD CONSTRAINT "CreditDispute_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CreditControlCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteOffRecommendation" ADD CONSTRAINT "WriteOffRecommendation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteOffRecommendation" ADD CONSTRAINT "WriteOffRecommendation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteOffRecommendation" ADD CONSTRAINT "WriteOffRecommendation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CreditControlCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditControlAuditLog" ADD CONSTRAINT "CreditControlAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditControlAuditLog" ADD CONSTRAINT "CreditControlAuditLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditControlAuditLog" ADD CONSTRAINT "CreditControlAuditLog_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CreditControlCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtorAccount" ADD CONSTRAINT "DebtorAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtorAccount" ADD CONSTRAINT "DebtorAccount_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtorContact" ADD CONSTRAINT "DebtorContact_debtorAccountId_fkey" FOREIGN KEY ("debtorAccountId") REFERENCES "DebtorAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtorContract" ADD CONSTRAINT "DebtorContract_debtorAccountId_fkey" FOREIGN KEY ("debtorAccountId") REFERENCES "DebtorAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtorStatement" ADD CONSTRAINT "DebtorStatement_debtorAccountId_fkey" FOREIGN KEY ("debtorAccountId") REFERENCES "DebtorAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtorReconciliation" ADD CONSTRAINT "DebtorReconciliation_debtorAccountId_fkey" FOREIGN KEY ("debtorAccountId") REFERENCES "DebtorAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtorDocument" ADD CONSTRAINT "DebtorDocument_debtorAccountId_fkey" FOREIGN KEY ("debtorAccountId") REFERENCES "DebtorAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtorAuditLog" ADD CONSTRAINT "DebtorAuditLog_debtorAccountId_fkey" FOREIGN KEY ("debtorAccountId") REFERENCES "DebtorAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtorScheme" ADD CONSTRAINT "DebtorScheme_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtorScheme" ADD CONSTRAINT "DebtorScheme_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtorScheme" ADD CONSTRAINT "DebtorScheme_debtorAccountId_fkey" FOREIGN KEY ("debtorAccountId") REFERENCES "DebtorAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeDepartmentRule" ADD CONSTRAINT "SchemeDepartmentRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeDepartmentRule" ADD CONSTRAINT "SchemeDepartmentRule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeDepartmentRule" ADD CONSTRAINT "SchemeDepartmentRule_debtorSchemeId_fkey" FOREIGN KEY ("debtorSchemeId") REFERENCES "DebtorScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeDepartmentRule" ADD CONSTRAINT "SchemeDepartmentRule_debtorAccountId_fkey" FOREIGN KEY ("debtorAccountId") REFERENCES "DebtorAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeServicePointRule" ADD CONSTRAINT "SchemeServicePointRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeServicePointRule" ADD CONSTRAINT "SchemeServicePointRule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeServicePointRule" ADD CONSTRAINT "SchemeServicePointRule_debtorSchemeId_fkey" FOREIGN KEY ("debtorSchemeId") REFERENCES "DebtorScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeOutpatientLimit" ADD CONSTRAINT "SchemeOutpatientLimit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeOutpatientLimit" ADD CONSTRAINT "SchemeOutpatientLimit_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeOutpatientLimit" ADD CONSTRAINT "SchemeOutpatientLimit_debtorSchemeId_fkey" FOREIGN KEY ("debtorSchemeId") REFERENCES "DebtorScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeOutpatientLimit" ADD CONSTRAINT "SchemeOutpatientLimit_debtorAccountId_fkey" FOREIGN KEY ("debtorAccountId") REFERENCES "DebtorAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeVisitLimit" ADD CONSTRAINT "SchemeVisitLimit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeVisitLimit" ADD CONSTRAINT "SchemeVisitLimit_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeVisitLimit" ADD CONSTRAINT "SchemeVisitLimit_debtorSchemeId_fkey" FOREIGN KEY ("debtorSchemeId") REFERENCES "DebtorScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeVisitLimit" ADD CONSTRAINT "SchemeVisitLimit_debtorAccountId_fkey" FOREIGN KEY ("debtorAccountId") REFERENCES "DebtorAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeCopaymentCategory" ADD CONSTRAINT "SchemeCopaymentCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeCopaymentCategory" ADD CONSTRAINT "SchemeCopaymentCategory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeCopaymentCategory" ADD CONSTRAINT "SchemeCopaymentCategory_debtorSchemeId_fkey" FOREIGN KEY ("debtorSchemeId") REFERENCES "DebtorScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeCopaymentRule" ADD CONSTRAINT "SchemeCopaymentRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeCopaymentRule" ADD CONSTRAINT "SchemeCopaymentRule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeCopaymentRule" ADD CONSTRAINT "SchemeCopaymentRule_debtorSchemeId_fkey" FOREIGN KEY ("debtorSchemeId") REFERENCES "DebtorScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeCopaymentRule" ADD CONSTRAINT "SchemeCopaymentRule_copaymentCategoryId_fkey" FOREIGN KEY ("copaymentCategoryId") REFERENCES "SchemeCopaymentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeCopaymentRule" ADD CONSTRAINT "SchemeCopaymentRule_debtorAccountId_fkey" FOREIGN KEY ("debtorAccountId") REFERENCES "DebtorAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeAuthorizationRule" ADD CONSTRAINT "SchemeAuthorizationRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeAuthorizationRule" ADD CONSTRAINT "SchemeAuthorizationRule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeAuthorizationRule" ADD CONSTRAINT "SchemeAuthorizationRule_debtorSchemeId_fkey" FOREIGN KEY ("debtorSchemeId") REFERENCES "DebtorScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeAuditLog" ADD CONSTRAINT "SchemeAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeAuditLog" ADD CONSTRAINT "SchemeAuditLog_debtorSchemeId_fkey" FOREIGN KEY ("debtorSchemeId") REFERENCES "DebtorScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientBillItem" ADD CONSTRAINT "PatientBillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "PatientBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingAdjustment" ADD CONSTRAINT "BillingAdjustment_billId_fkey" FOREIGN KEY ("billId") REFERENCES "PatientBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPaymentLink" ADD CONSTRAINT "BillingPaymentLink_billId_fkey" FOREIGN KEY ("billId") REFERENCES "PatientBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingAuditLog" ADD CONSTRAINT "BillingAuditLog_billId_fkey" FOREIGN KEY ("billId") REFERENCES "PatientBill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
