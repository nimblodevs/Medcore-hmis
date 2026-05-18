/**
 * Patient Registration Form Component
 * Handles new patient registration and existing patient updates
 * Features: UHID lookup, patient search, multi-tab form, date formatting,
 *           field-level validation with friendly error messages.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  ContactRound,
  FileText,
  IdCard,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  Search,
  Shield,
  User,
  Users,
  UserRound,
  BriefcaseBusiness,
  CircleCheck,
  NotebookTabs,
  CircleDollarSign,
  Copy,
} from "lucide-react";

// UI Components
import Input from "../../components/ui/Input";
import { getPatientByUhid, searchPatients } from "../../services/patientApi";
import {
  getCounties,
  getSubCounties,
  getWards,
} from "../../utils/kenyaLocations";

// ============================================
// VALIDATION SCHEMA
// ============================================

/** Kenyan phone numbers: optional +254 / 0 prefix, then 7 or 1 + 8 digits. */
const validateKePhone = (phone) =>
  /^(\+?254|0)[17]\d{8}$/.test(phone.replace(/\s/g, ""));
/** Loose ID number: 4-20 alphanumeric chars (covers National ID, Passport, etc.). */
const ID_NUMBER_REGEX = /^[A-Za-z0-9-]{4,20}$/;
/** Names: letters, spaces, hyphens, apostrophes. */
const NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]*$/;

const friendlyPhone = z
  .string()
  .trim()
  .refine(
    validateKePhone,
    "Please enter a valid Kenyan phone number (e.g., 0712 345 678)"
  );

const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === "" || validateKePhone(v), {
    message: "Please enter a valid phone number or leave the field empty",
  });

const optionalEmail = z
  .string()
  .trim()
  .refine((v) => v === "" || z.string().email().safeParse(v).success, {
    message: "Please enter a valid email address for the patient or leave blank",
  });

const optionalDetail = z
  .string()
  .trim()
  .max(100, "This field should not exceed 100 characters")
  .optional()
  .or(z.literal(""));

const nameField = (label) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required for registration`)
    .min(2, `The patient's ${label.toLowerCase()} must be at least 2 characters long`)
    .max(50, `${label} should not exceed 50 characters`)
    .regex(
      NAME_REGEX,
      `${label} can only contain letters, spaces, hyphens, or apostrophes`
    );

const requiredSelect = (label) =>
  z.string().trim().min(1, `Please select a ${label.toLowerCase()} for the patient record`);

const dobField = z
  .string()
  .min(1, "Patient's date of birth is required")
  .refine(
    (v) => {
      const d = new Date(`${v}T00:00:00`);
      if (Number.isNaN(d.getTime())) return false;
      const today = new Date();
      if (d > today) return false;
      const ageYears =
        (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return ageYears <= 130;
    },
    {
      message: "Please enter a valid date of birth (not in the future, age up to 130 years)",
    }
  );

const patientSchema = z.object({
  // Primary identifiers
  title: requiredSelect("Title"),
  surname: nameField("Surname"),
  firstName: nameField("First name"),
  middleName: z.string().trim().max(50).optional().or(z.literal("")),
  gender: requiredSelect("Gender"),
  dateOfBirth: dobField,
  primaryPhone: friendlyPhone,
  nationality: requiredSelect("Nationality"),

  // Demography & contact
  documentNumber: z
    .string()
    .trim()
    .min(1, "Identification document number is required for registration")
    .regex(ID_NUMBER_REGEX, "Enter a valid document number (4-20 characters, alphanumeric)"),
  alternatePhone: optionalPhone,
  email: z
    .string()
    .trim()
    .min(1, "Patient's email address is required for contact")
    .email("Please enter a valid email address for the patient")
    .max(255, "Email address should not exceed 255 characters"),
  religion: requiredSelect("Religion"),
  county: requiredSelect("County"),
  subCounty: requiredSelect("Sub-county"),
  ward: requiredSelect("Ward"),
  village: z
    .string()
    .trim()
    .min(2, "Village or Estate name must be at least 2 characters")
    .max(100, "Village or Estate name should not exceed 100 characters"),
  physicalAddress: z
    .string()
    .trim()
    .min(3, "Please provide a more detailed physical address (at least 3 characters)")
    .max(200, "Physical address should not exceed 200 characters"),
  patientCategory: requiredSelect("Patient category"),
  paymentCategory: requiredSelect("Payment category"),
  employer: z
    .string()
    .trim()
    .min(1, "Employer name is required (use 'N/A' or 'Self' if applicable)")
    .max(100, "Employer name should not exceed 100 characters"),
  cashPayerName: optionalDetail,
  cashReceiptNumber: optionalDetail,
  insuranceProviderName: optionalDetail,
  insuranceSchemeName: optionalDetail,
  insuranceMemberNumber: optionalDetail,
  insuranceCoverEndDate: optionalDetail,
  nhifNumber: optionalDetail,
  nhifEmployer: optionalDetail,
  nhifCoverType: optionalDetail,
  nhifExpiryDate: optionalDetail,
  corporateName: optionalDetail,
  corporateAccountNumber: optionalDetail,
  corporateContactPerson: optionalDetail,

  // NOK validation
  nokSurname: nameField("Next of kin surname"),
  nokFirstName: nameField("Next of kin first name"),
  nokOtherName: z.string().trim().max(50).optional().or(z.literal("")),
  nokRelationship: requiredSelect("Relationship to patient"),
  nokPhone: friendlyPhone,
  nokIdNumber: z
    .string()
    .trim()
    .min(1, "Next of kin identification number is required")
    .regex(
      ID_NUMBER_REGEX,
      "Enter a valid ID number (4-20 characters, alphanumeric)"
    ),
  nokAddress: z
    .string()
    .trim()
    .min(3, "Please provide the next of kin's physical address (at least 3 characters)")
    .max(200, "Address should not exceed 200 characters"),
  nokEmail: optionalEmail,
  nokEmployer: z
    .string()
    .trim()
    .min(1, "Next of kin employer is required (use 'N/A' or 'Self' if applicable)")
    .max(100, "Employer name should not exceed 100 characters"),

  // Emergency (required)
  emergencyName: z
    .string()
    .trim()
    .min(2, "Please provide the full name of the emergency contact (at least 2 characters)")
    .max(120, "Emergency contact name should not exceed 120 characters"),
  emergencyRelationship: requiredSelect("Relationship"),
  emergencyPhone: friendlyPhone,
  alternateEmergencyPhone: optionalPhone,
}).superRefine((values, ctx) => {
  if (values.paymentCategory === "Cash") {
    if (!values.cashPayerName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cashPayerName"],
        message: "Cash payer name is required for cash payments",
      });
    }
    if (!values.cashReceiptNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cashReceiptNumber"],
        message: "Phone number is required for cash payments",
      });
    }
  } else if (values.paymentCategory === "Insurance") {
    if (!values.insuranceProviderName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["insuranceProviderName"],
        message: "Insurance provider name is required for insurance payments",
      });
    }
    if (!values.insuranceSchemeName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["insuranceSchemeName"],
        message: "Scheme name is required for insurance payments",
      });
    }
    if (!values.insuranceMemberNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["insuranceMemberNumber"],
        message: "Member number is required for insurance payments",
      });
    }
    if (!values.insuranceCoverEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["insuranceCoverEndDate"],
        message: "Cover end date is required for insurance payments",
      });
    }
  } else if (values.paymentCategory === "NHIF") {
    if (!values.nhifNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nhifNumber"],
        message: "CR No. is required for SHA payments",
      });
    }
    if (!values.nhifCoverType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nhifCoverType"],
        message: "Cover type is required for SHA payments",
      });
    }
    if (!values.nhifExpiryDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nhifExpiryDate"],
        message: "Expiry date is required for SHA payments",
      });
    }
  } else if (values.paymentCategory === "Corporate") {
    if (!values.corporateName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["corporateName"],
        message: "Corporate account name is required for corporate payments",
      });
    }
    if (!values.corporateAccountNumber) {
      const corporateAccountNumberLabel = ["lou", "lpo", "membership"].some((token) =>
        values.corporateName?.trim().toLowerCase().includes(token)
      )
        ? "Staff ID"
        : "Member No";

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["corporateAccountNumber"],
        message: `${corporateAccountNumberLabel} is required for corporate payments`,
      });
    }
  }
});

/** Map every validated field to the tab it lives on (for jump-to-error). */
const FIELD_TAB = {
  title: "Demography & Contact Details",
  surname: "Demography & Contact Details",
  firstName: "Demography & Contact Details",
  middleName: "Demography & Contact Details",
  gender: "Demography & Contact Details",
  dateOfBirth: "Demography & Contact Details",
  primaryPhone: "Demography & Contact Details",
  nationality: "Demography & Contact Details",
  documentNumber: "Demography & Contact Details",
  alternatePhone: "Demography & Contact Details",
  email: "Demography & Contact Details",
  religion: "Demography & Contact Details",
  county: "Demography & Contact Details",
  subCounty: "Demography & Contact Details",
  ward: "Demography & Contact Details",
  village: "Demography & Contact Details",
  physicalAddress: "Demography & Contact Details",
  patientCategory: "Demography & Contact Details",
  paymentCategory: "Payer Details",
  employer: "Demography & Contact Details",
  cashPayerName: "Payer Details",
  cashReceiptNumber: "Payer Details",
  insuranceProviderName: "Payer Details",
  insuranceSchemeName: "Payer Details",
  insuranceMemberNumber: "Payer Details",
  insuranceCoverEndDate: "Payer Details",
  nhifNumber: "Payer Details",
  nhifEmployer: "Payer Details",
  nhifCoverType: "Payer Details",
  nhifExpiryDate: "Payer Details",
  corporateName: "Payer Details",
  corporateAccountNumber: "Payer Details",
  corporateContactPerson: "Payer Details",
  nokSurname: "NOK & Emergency Contact",
  nokFirstName: "NOK & Emergency Contact",
  nokOtherName: "NOK & Emergency Contact",
  nokRelationship: "NOK & Emergency Contact",
  nokPhone: "NOK & Emergency Contact",
  nokIdNumber: "NOK & Emergency Contact",
  nokAddress: "NOK & Emergency Contact",
  nokEmail: "NOK & Emergency Contact",
  nokEmployer: "NOK & Emergency Contact",
  emergencyName: "NOK & Emergency Contact",
  emergencyRelationship: "NOK & Emergency Contact",
  emergencyPhone: "NOK & Emergency Contact",
  alternateEmergencyPhone: "NOK & Emergency Contact",
};

// ============================================
// STYLING & SHARED COMPONENTS
// ============================================

const fieldClasses =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-600/10";

const Section = ({ description, headerContent, children }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
    <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
      {headerContent ? <div className="mb-3">{headerContent}</div> : null}
      <p className="text-sm text-slate-600">{description}</p>
    </div>
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 p-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 sm:p-6">
      {children}
    </div>
  </section>
);

const SelectField = ({
  id,
  label,
  required = false,
  children,
  value,
  onChange,
  onBlur,
  disabled = false,
  leftIcon: Icon,
  containerClassName = "",
  error,
}) => {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div className={["w-full", containerClassName].join(" ")}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-slate-800"
      >
        {label}
        {required ? <span className="ml-0.5 text-rose-600">*</span> : null}
      </label>
      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        ) : null}
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={[
            "h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors focus:outline-none focus:ring-4",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
              : "border-slate-200 focus:border-cyan-400 focus:ring-cyan-600/10",
            Icon ? "pl-10" : "",
            disabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : "",
          ].join(" ")}
        >
          {children}
        </select>
      </div>
      {error ? (
        <p id={describedBy} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
};

const TextareaField = ({
  id,
  label,
  placeholder,
  className = "",
  rows = 2,
  leftIcon: LeftIcon,
  value,
  onChange,
  maxLength = 1000,
  error,
}) => {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>
      <div className="relative">
        {LeftIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-start pt-2.5 text-slate-400">
            <LeftIcon className="size-4" />
          </span>
        ) : null}
        <textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={`${fieldClasses} min-h-16 resize-y py-2 ${
            LeftIcon ? "pl-9" : ""
          } ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
              : ""
          }`}
        />
      </div>
      {error ? (
        <p id={describedBy} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const PatientRegistration = () => {
  const lastNotFoundUhid = useRef(null);

  // --- Tab navigation ---
  const [activeTab, setActiveTab] = useState("Demography & Contact Details");

  // --- Primary identifiers ---
  const [uihdNo, setUihdNo] = useState("");
  const [title, setTitle] = useState("");
  const [surname, setSurname] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [patienttype, setPatientType] = useState("Kenyan");
  const [nationality, setNationality] = useState("Kenyan");
  const [idType, setIdType] = useState("National ID");

  // --- Demography & contact ---
  const [religion, setReligion] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [email, setEmail] = useState("");
  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [ward, setWard] = useState("");
  const [village, setVillage] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [patientCategory, setPatientCategory] = useState("General");
  const [paymentCategory, setPaymentCategory] = useState("");
  const [employer, setEmployer] = useState("");
  const [cashPayerName, setCashPayerName] = useState("");
  const [cashReceiptNumber, setCashReceiptNumber] = useState("");
  const [insuranceProviderName, setInsuranceProviderName] = useState("");
  const [insuranceSchemeName, setInsuranceSchemeName] = useState("");
  const [insuranceMemberNumber, setInsuranceMemberNumber] = useState("");
  const [insuranceCoverEndDate, setInsuranceCoverEndDate] = useState("");
  const [nhifNumber, setNhifNumber] = useState("");
  const [nhifEmployer, setNhifEmployer] = useState("");
  const [nhifCoverType, setNhifCoverType] = useState("");
  const [nhifExpiryDate, setNhifExpiryDate] = useState("");
  const [corporateName, setCorporateName] = useState("");
  const [corporateAccountNumber, setCorporateAccountNumber] = useState("");
  const [corporateContactPerson, setCorporateContactPerson] = useState("");

  const isDebtorsCorporateAccount =
    ["lou", "lpo", "membership"].some((token) =>
      corporateName.trim().toLowerCase().includes(token)
    );
  const corporateAccountLabel = isDebtorsCorporateAccount ? "Staff ID" : "Member No";

  // --- Search ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);

  // --- NOK & Emergency ---
  const [sameAsNok, setSameAsNok] = useState(false);
  const [nokSurname, setNokSurname] = useState("");
  const [nokFirstName, setNokFirstName] = useState("");
  const [nokOtherName, setNokOtherName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [nokIdNumber, setNokIdNumber] = useState("");
  const [nokAddress, setNokAddress] = useState("");
  const [nokEmail, setNokEmail] = useState("");
  const [nokEmployer, setNokEmployer] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [alternateEmergencyPhone, setAlternateEmergencyPhone] = useState("");

  // --- Administrative ---
  const [isSuspended, setIsSuspended] = useState(false);
  const [adminComments, setAdminComments] = useState("");
  const [lastVisitDate, setLastVisitDate] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");

  // --- Form meta state ---
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ name: "", uhid: "" });

  // --- Validation state ---
  const [touched, setTouched] = useState({});

  /** Re-validate every time a value changes so visible error messages clear immediately. */
  const errors = useMemo(() => {
    const values = {
      title,
      surname,
      firstName,
      middleName,
      gender,
      dateOfBirth,
      primaryPhone,
      nationality,
      documentNumber,
      alternatePhone,
      email,
      religion,
      county,
      subCounty,
      ward,
      village,
      physicalAddress,
      patientCategory,
      paymentCategory,
      employer,
      cashPayerName,
      cashReceiptNumber,
      insuranceProviderName,
      insuranceSchemeName,
      insuranceMemberNumber,
      insuranceCoverEndDate,
      nhifNumber,
      nhifEmployer,
      nhifCoverType,
      nhifExpiryDate,
      nhifCoverType,
      nhifExpiryDate,
      corporateName,
      corporateAccountNumber,
      corporateContactPerson,
      nokSurname,
      nokFirstName,
      nokOtherName,
      nokRelationship,
      nokPhone,
      nokIdNumber,
      nokAddress,
      nokEmail,
      nokEmployer,
      emergencyName,
      emergencyRelationship,
      emergencyPhone,
      alternateEmergencyPhone,
    };
    const result = patientSchema.safeParse(values);
    if (result.success) return {};
    const flat = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (key && !flat[key]) flat[key] = issue.message;
    }
    return flat;
  }, [
    title,
    surname,
    firstName,
    middleName,
    gender,
    dateOfBirth,
    primaryPhone,
    nationality,
    documentNumber,
    alternatePhone,
    email,
    religion,
    county,
    subCounty,
    ward,
    village,
    physicalAddress,
    patientCategory,
    paymentCategory,
    employer,
    cashPayerName,
    cashReceiptNumber,
    insuranceProviderName,
    insuranceSchemeName,
    insuranceMemberNumber,
    insuranceCoverEndDate,
    nhifNumber,
    nhifEmployer,
    corporateName,
    corporateAccountNumber,
    corporateContactPerson,
    nokSurname,
    nokFirstName,
    nokOtherName,
    nokRelationship,
    nokPhone,
    nokIdNumber,
    nokAddress,
    nokEmail,
    nokEmployer,
    emergencyName,
    emergencyRelationship,
    emergencyPhone,
    alternateEmergencyPhone,
  ]);

  // ============================================
  // FORM CONFIGURATION
  // ============================================

  const sectionTabs = [
    "Demography & Contact Details",
    "Payer Details",
    "NOK & Emergency Contact",
    "Administrative Details",
  ];

  const sectionTabIcons = {
    "Demography & Contact Details": IdCard,
    "Payer Details": CircleDollarSign,
    "NOK & Emergency Contact": Users,
    "Administrative Details": Building2,
  };

  const sectionDescriptions = {
    "Demography & Contact Details":
      "Capture statutory identity attributes and patient communication channels used for matching, outreach, and follow-up.",
    "Payer Details":
      "Select the payment category and enter the correct payer details for cash, insurance, SHA, or corporate billing.",
    "NOK & Emergency Contact":
      "Record next of kin and emergency contacts for consent workflows, escalation paths, and urgent communication.",
    "Administrative Details":
      "Maintain registration metadata and account control details used for operational tracking and status management.",
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const approximateAge = useMemo(() => {
    if (!dateOfBirth) return "";
    const birthDate = new Date(`${dateOfBirth}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) return "";
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (today.getDate() < birthDate.getDate()) months -= 1;
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    years = Math.max(years, 0);
    months = Math.max(months, 0);
    return `${years} ${years === 1 ? "year" : "years"}, ${months} ${
      months === 1 ? "month" : "months"
    }`;
  }, [dateOfBirth]);

  const ageGroup = useMemo(() => {
    if (!dateOfBirth) return "";
    const birth = new Date(`${dateOfBirth}T00:00:00`);
    if (Number.isNaN(birth.getTime())) return "";
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const md = today.getMonth() - birth.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) years -= 1;
    years = Math.max(years, 0);
    if (years < 1) return "Neonate / Infant (<1 yr)";
    if (years < 5) return "Child (1–4 yrs)";
    if (years < 13) return "Child (5–12 yrs)";
    if (years < 18) return "Adolescent (13–17 yrs)";
    if (years < 35) return "Young Adult (18–34 yrs)";
    if (years < 60) return "Adult (35–59 yrs)";
    return "Senior (60+ yrs)";
  }, [dateOfBirth]);

  const isKenyan = patienttype === "Kenyan";
  const identificationOptions = isKenyan
    ? ["National ID", "Military ID", "Birth Certificate", "Passport No."]
    : ["Alien ID", "Passport No.", "UNHCR Registration Number"];
  const documentNumberLabel =
    idType === "Passport No."
      ? "Passport No."
      : idType === "UNHCR Registration Number"
      ? "UNHCR Registration Number"
      : idType === "Birth Certificate"
      ? "Birth Certificate Number"
      : `${idType} Number`;

  /** Show an error message only if the user has touched the field or attempted submit. */
  const errorFor = (field) => (touched[field] ? errors[field] : undefined);

  const markTouched = (field) => () =>
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));

  // ─────────────────────────────────────────────────────────
  // SIDE EFFECTS
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  /** Reactive NOK → Emergency sync */
  useEffect(() => {
    if (!sameAsNok) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmergencyName(
      [nokFirstName, nokOtherName, nokSurname].filter(Boolean).join(" ")
    );
    setEmergencyRelationship(nokRelationship);
    setEmergencyPhone(nokPhone);
    setAlternateEmergencyPhone("");
  }, [
    sameAsNok,
    nokFirstName,
    nokOtherName,
    nokSurname,
    nokRelationship,
    nokPhone,
  ]);

  // ─────────────────────────────────────────────────────────
  // API
  // ─────────────────────────────────────────────────────────

  /** Patient search – toast on query-level failure */
  const { data: searchResults = [] } = useQuery({
    queryKey: ["patient-search", debouncedSearchTerm],
    queryFn: () => searchPatients(debouncedSearchTerm),
    enabled: Boolean(debouncedSearchTerm.trim()),
    onError: (err) => {
      toast.error("Patient search failed", {
        description:
          err?.message ?? "Unable to reach the server. Please try again.",
      });
    },
  });

  /**
   * UHID lookup:
   *  • Found    → success toast + populate form
   *  • Not found → warning toast (suppressed on repeat of same UHID)
   *  • Error    → error toast
   */
  const uhidLookupMutation = useMutation({
    mutationFn: getPatientByUhid,
    onSuccess: (patient) => {
      if (patient) {
        populatePatientToForm(patient, false);
        toast.success("Patient found", {
          description: `${patient.firstName} ${patient.lastName} loaded successfully.`,
        });
        lastNotFoundUhid.current = null;
      } else {
        if (lastNotFoundUhid.current !== uihdNo) {
          toast.warning("No patient found", {
            description: `No record matches UHID "${uihdNo}". You may register a new patient.`,
          });
          lastNotFoundUhid.current = uihdNo;
        }
      }
    },
    onError: (err) => {
      toast.error("UHID lookup failed", {
        description:
          err?.message ?? "Unable to reach the server. Check your connection.",
      });
    },
  });

  // ─────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────

  const populatePatientToForm = (patient, isFromSearch = false) => {
    const fullName = `${patient.firstName} ${patient.middleName} ${patient.lastName}`;
    if (isFromSearch) {
      setSearchTerm(`${patient.uhid} - ${fullName} - ${patient.phoneNumber}`);
    }
    setUihdNo(patient.uhid);
    setPatientType(patient.patientType || (patient.nationality === "Kenyan" ? "Kenyan" : "Foreigner"));
    setTitle(patient.title || "");
    setSurname(patient.lastName || "");
    setFirstName(patient.firstName || "");
    setMiddleName(patient.middleName || "");
    setGender(patient.gender || "");
    setDateOfBirth(patient.dob || "");
    setPrimaryPhone(patient.phoneNumber || "");
    setNationality(patient.nationality || "Kenyan");
    setIdType(patient.idType || "National ID");
    setDocumentNumber(patient.documentNumber || "");
    setAlternatePhone(patient.alternatePhone || "");
    setEmail(patient.email || "");
    setCounty(patient.county || "");
    setSubCounty(patient.subCounty || "");
    setWard(patient.ward || "");
    setVillage(patient.village || "");
    setPhysicalAddress(patient.physicalAddress || "");
    setPatientCategory(patient.patientCategory || "General");
    setPaymentCategory(patient.paymentCategory || "");
    setEmployer(patient.employer || "");
    setCashPayerName(patient.payerDetails?.cashPayerName || "");
    setCashReceiptNumber(patient.payerDetails?.cashReceiptNumber || "");
    setInsuranceProviderName(patient.payerDetails?.insuranceProviderName || "");
    setInsuranceSchemeName(patient.payerDetails?.insuranceSchemeName || "");
    setInsuranceMemberNumber(patient.payerDetails?.insuranceMemberNumber || "");
    setInsuranceCoverEndDate(patient.payerDetails?.insuranceCoverEndDate || "");
    setNhifNumber(patient.payerDetails?.nhifNumber || "");
    setNhifEmployer(patient.payerDetails?.nhifEmployer || "");
    setNhifCoverType(patient.payerDetails?.nhifCoverType || "");
    setNhifExpiryDate(patient.payerDetails?.nhifExpiryDate || "");
    setCorporateName(patient.payerDetails?.corporateName || "");
    setCorporateAccountNumber(patient.payerDetails?.corporateAccountNumber || "");
    setCorporateContactPerson(patient.payerDetails?.corporateContactPerson || "");
    setReligion(patient.religion || "");
    
    if (patient.nok) {
      setNokSurname(patient.nok.surname || "");
      setNokFirstName(patient.nok.firstName || "");
      setNokOtherName(patient.nok.otherName || "");
      setNokRelationship(patient.nok.relationship || "");
      setNokPhone(patient.nok.phone || "");
      setNokIdNumber(patient.nok.idNumber || "");
      setNokAddress(patient.nok.address || "");
      setNokEmail(patient.nok.email || "");
      setNokEmployer(patient.nok.employer || "");
    }

    setEmergencyName(patient.emergency?.name || "");
    setEmergencyRelationship(patient.emergency?.relationship || "");
    setEmergencyPhone(patient.emergency?.phone || "");
    setAlternateEmergencyPhone(patient.emergency?.alternatePhone || "");
    
    setIsSuspended(patient.isSuspended || false);
    setAdminComments(patient.comments || "");
    setLastVisitDate(patient.lastVisitDate || "");
    setRegistrationDate(patient.registrationDate || "");

    // Mark required fields as touched if they are missing so they get highlighted
    const requiredFields = [
      "title",
      "surname",
      "firstName",
      "gender",
      "dateOfBirth",
      "primaryPhone",
      "nationality",
      "documentNumber",
      "religion",
      "county",
      "subCounty",
      "ward",
      "village",
      "physicalAddress",
      "patientCategory",
      "paymentCategory",
      "employer",
      "nokSurname",
      "nokFirstName",
      "nokRelationship",
      "nokPhone",
      "nokIdNumber",
      "nokAddress",
      "nokEmployer",
      "emergencyName",
      "emergencyRelationship",
      "emergencyPhone",
    ];

    const newTouched = {};
    requiredFields.forEach((field) => {
      // If we don't have a value for it, mark as touched to show validation error
      // Note: mapping patient keys to state keys is needed if different
      let val;
      if (field === "surname") val = patient.lastName;
      else if (field === "dateOfBirth") val = patient.dob;
      else if (field === "primaryPhone") val = patient.phoneNumber;
      else if (field === "paymentCategory") val = patient.paymentCategory;
      else if (field === "patientCategory") val = patient.patientCategory;
      else if (field === "nokSurname") val = patient.nok?.surname;
      else if (field === "nokFirstName") val = patient.nok?.firstName;
      else if (field === "nokRelationship") val = patient.nok?.relationship;
      else if (field === "nokPhone") val = patient.nok?.phone;
      else if (field === "nokIdNumber") val = patient.nok?.idNumber;
      else if (field === "nokAddress") val = patient.nok?.address;
      else if (field === "nokEmployer") val = patient.nok?.employer;
      else if (field === "emergencyName") val = patient.emergency?.name;
      else if (field === "emergencyRelationship") val = patient.emergency?.relationship;
      else if (field === "emergencyPhone") val = patient.emergency?.phone;
      else val = patient[field];

      if (!val) {
        newTouched[field] = true;
      }
    });
    setTouched(newTouched);

    setShowSearchResults(false);
    setIsEditingPatient(true);
  };

  const clearForm = () => {
    // Primary identifiers
    setUihdNo("");
    setTitle("");
    setSurname("");
    setFirstName("");
    setMiddleName("");
    setGender("");
    setDateOfBirth("");
    setPrimaryPhone("");
    setPatientType("Kenyan");
    setNationality("Kenyan");
    setIdType("National ID");

    // Demography & contact
    setReligion("");
    setDocumentNumber("");
    setAlternatePhone("");
    setEmail("");
    setCounty("");
    setSubCounty("");
    setWard("");
    setVillage("");
    setPhysicalAddress("");
    setPatientCategory("General");
    setPaymentCategory("");
    setEmployer("");
    setCashPayerName("");
    setCashReceiptNumber("");
    setInsuranceProviderName("");
    setInsuranceSchemeName("");
    setInsuranceMemberNumber("");
    setInsuranceCoverEndDate("");
    setNhifNumber("");
    setNhifEmployer("");
    setNhifCoverType("");
    setNhifExpiryDate("");
    setCorporateName("");
    setCorporateAccountNumber("");
    setCorporateContactPerson("");

    // Search
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setShowSearchResults(false);
    setIsSearchInputFocused(false);

    // NOK & Emergency
    setSameAsNok(false);
    setNokSurname("");
    setNokFirstName("");
    setNokOtherName("");
    setNokRelationship("");
    setNokPhone("");
    setNokIdNumber("");
    setNokAddress("");
    setNokEmail("");
    setNokEmployer("");
    setEmergencyName("");
    setEmergencyRelationship("");
    setEmergencyPhone("");
    setAlternateEmergencyPhone("");

    // Administrative
    setIsSuspended(false);
    setAdminComments("");
    setLastVisitDate("");
    setRegistrationDate("");

    // Form meta & validation
    setIsEditingPatient(false);
    setIsSubmitting(false);
    setTouched({});
    lastNotFoundUhid.current = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = { ...errors };

    if (Object.keys(validationErrors).length > 0) {
      // Mark every invalid field as touched so messages appear.
      const allTouched = Object.keys(validationErrors).reduce((acc, k) => {
        acc[k] = true;
        return acc;
      }, {});
      setTouched((prev) => ({ ...prev, ...allTouched }));

      // Jump to the first tab containing an error.
      const firstField = Object.keys(validationErrors)[0];
      const targetTab = FIELD_TAB[firstField];
      if (targetTab && targetTab !== activeTab) setActiveTab(targetTab);

      const count = Object.keys(validationErrors).length;
      toast.error(
        `Registration could not be completed`,
        {
          description:
            `Please resolve the ${count} highlighted ${count === 1 ? "issue" : "issues"} before saving the record.`,
        }
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const patientData = {
        uhid: uihdNo,
        patientType: patienttype,
        title,
        firstName,
        middleName,
        lastName: surname,
        gender,
        dob: dateOfBirth,
        phoneNumber: primaryPhone,
        alternatePhone,
        email,
        nationality,
        idType,
        documentNumber,
        religion,
        county,
        subCounty,
        ward,
        village,
        physicalAddress,
        patientCategory,
        paymentCategory,
        employer,
        payerDetails: {
          cashPayerName,
          cashReceiptNumber,
          insuranceProviderName,
          insuranceSchemeName,
          insuranceMemberNumber,
          insuranceCoverEndDate,
          nhifNumber,
          nhifEmployer,
          nhifCoverType,
          nhifExpiryDate,
          corporateName,
          corporateAccountNumber,
          corporateContactPerson,
        },
        nok: {
          surname: nokSurname,
          firstName: nokFirstName,
          otherName: nokOtherName,
          relationship: nokRelationship,
          phone: nokPhone,
          idNumber: nokIdNumber,
          address: nokAddress,
          email: nokEmail,
          employer: nokEmployer,
        },
        emergency: {
          name: emergencyName,
          relationship: emergencyRelationship,
          phone: emergencyPhone,
          alternatePhone: alternateEmergencyPhone,
        },
        isSuspended,
        comments: adminComments,
      };

      // Simulate API call processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const fullName = [title === "Baby" ? "Baby" : "", firstName, middleName, surname].filter(Boolean).join(" ");
      const finalUhid = uihdNo || `UHID-${Math.floor(100000 + Math.random() * 900000)}`;

      console.log(
        isEditingPatient ? "Updating patient record:" : "Registering new patient:",
        { ...patientData, uhid: finalUhid }
      );

      setSuccessData({
        name: fullName,
        initials: (firstName.charAt(0) + surname.charAt(0)).toUpperCase(),
        uhid: finalUhid,
        isUpdate: isEditingPatient
      });
      setShowSuccessModal(true);
      
      // clearForm() will be called when closing the modal or handled differently 
      // but for now let's clear it immediately but we need the data for the modal
      // so we set it in successData first.
      clearForm();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong", {
        description: "Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  /** Count how many errors live on each tab, for the badge in tab buttons. */
  const tabErrorCounts = useMemo(() => {
    const counts = {
      "Demography & Contact Details": 0,
      "Payer Details": 0,
      "NOK & Emergency Contact": 0,
      "Administrative Details": 0,
    };
    for (const field of Object.keys(errors)) {
      if (!touched[field]) continue;
      const tab = FIELD_TAB[field];
      if (tab) counts[tab] += 1;
    }
    return counts;
  }, [errors, touched]);

  const sectionTabsContent = (
    <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Registration sections">
      {sectionTabs.map((tab) => {
        const TabIcon = sectionTabIcons[tab];
        const errCount = tabErrorCounts[tab] || 0;
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.replace(/\s+/g, "-")}`}
            id={`tab-${tab.replace(/\s+/g, "-")}`}
            onClick={() => setActiveTab(tab)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all sm:shrink ${
              isActive
                ? "bg-cyan-700 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <TabIcon className="size-4" aria-hidden="true" />
            <span className="whitespace-nowrap">{tab}</span>
            {errCount > 0 ? (
              <span
                className={`inline-flex min-w-5 items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  isActive
                    ? "bg-white text-rose-600"
                    : "bg-rose-100 text-rose-700"
                }`}
                title={`${errCount} field${
                  errCount === 1 ? "" : "s"
                } need attention`}
              >
                <AlertCircle className="size-3" aria-hidden="true" />
                <span className="sr-only">Errors:</span>
                {errCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {isEditingPatient ? "Patient Record" : "New Registration"}
            </h1>
            <p className="mt-1 text-[13px] font-medium text-slate-600">
              {isEditingPatient ? "Update existing medical records" : "Register a new patient into the system"}
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-cyan-100 md:flex-row md:items-end lg:w-auto lg:max-w-4xl lg:flex-1">
            <div className="relative min-w-0 flex-1">
              <Input
                label="Search Patient"
                placeholder="UHID, Name, Phone, or ID"
                autoComplete="off"
                value={searchTerm}
                onFocus={() => {
                  setShowSearchResults(true);
                  setIsSearchInputFocused(true);
                }}
                onBlur={() =>
                  setTimeout(() => {
                    setShowSearchResults(false);
                    setIsSearchInputFocused(false);
                  }, 150)
                }
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchResults(true);
                  setIsSearchInputFocused(true);
                }}
                leftIcon={<Search className="size-4" />}
                containerClassName="w-full"
              />
              {showSearchResults &&
              isSearchInputFocused &&
              debouncedSearchTerm.trim() ? (
                <div
                  className="absolute z-20 mt-1 max-h-80 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5"
                  role="listbox"
                  aria-label="Search results"
                >
                  <div className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/90 px-4 py-2 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Search Results
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <ul className="divide-y divide-slate-100">
                        {searchResults.map((patient) => {
                          const fullName = `${patient.firstName} ${
                            patient.middleName ? patient.middleName + " " : ""
                          }${patient.lastName}`;
                          const initials = (
                            (patient.firstName?.charAt(0) || "") +
                            (patient.lastName?.charAt(0) || "")
                          ).toUpperCase();
                          return (
                            <li key={patient.patientId} role="option" aria-selected="false">
                              <button
                                type="button"
                                onMouseDown={() =>
                                  populatePatientToForm(patient, true)
                                }
                                className="group w-full px-4 py-3 text-left transition-all hover:bg-cyan-50/60 focus:bg-cyan-50/60 focus:outline-none"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 group-hover:bg-cyan-100 group-hover:text-cyan-700 group-hover:ring-cyan-200 transition-colors">
                                    {initials}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="truncate text-sm font-bold text-slate-900 group-hover:text-cyan-700">
                                        {fullName}
                                      </p>
                                      <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                          patient.status === "Active"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-rose-100 text-rose-700"
                                        }`}
                                      >
                                        {patient.status}
                                      </span>
                                    </div>
                                    <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                                      UHID: <span className="font-semibold text-slate-700">{patient.uhid}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600">
                                  <p className="flex items-center gap-1.5">
                                    <FileText className="size-3.5 text-slate-400 group-hover:text-cyan-500" />
                                    <span>{patient.patientId}</span>
                                  </p>
                                  <p className="flex items-center gap-1.5">
                                    <Phone className="size-3.5 text-slate-400 group-hover:text-cyan-500" />
                                    <span>{patient.phoneNumber}</span>
                                  </p>
                                  <p className="flex items-center gap-1.5">
                                    <CalendarDays className="size-3.5 text-slate-400 group-hover:text-cyan-500" />
                                    <span>{patient.dob}</span>
                                  </p>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                        <div className="mb-3 rounded-full bg-slate-100 p-3">
                          <Search className="size-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          No matching records
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          We couldn't find any patient with "{debouncedSearchTerm}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="w-full md:w-60 lg:w-52 md:shrink-0">
              <SelectField
                id="patient-type"
                label="Patient Type"
                value={patienttype}
                onChange={(e) => {
                  const next = e.target.value;
                  setPatientType(next);
                  setIdType(next === "Kenyan" ? "National ID" : "Alien ID");
                  setNationality(next === "Kenyan" ? "Kenyan" : "");
                }}
              >
                <option value="Kenyan">Kenyan</option>
                <option value="Foreigner">Foreigner</option>
              </SelectField>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Identifiers */}
      <Section description="Primary patient identifiers captured before section-specific details.">
        <Input
          label="UIHD No."
          placeholder="Patient No."
          autoComplete="patient-number"
          value={uihdNo}
          onFocus={() => {
            setShowSearchResults(false);
            setIsSearchInputFocused(false);
          }}
          onChange={(e) => {
            const v = e.target.value;
            setUihdNo(v);
            setShowSearchResults(false);
            setIsSearchInputFocused(false);
            if (v.trim()) uhidLookupMutation.mutate(v);
          }}
          onBlur={() => {
            if (uihdNo.trim()) uhidLookupMutation.mutate(uihdNo);
          }}
          leftIcon={<IdCard className="size-4" />}
        />
        <SelectField
          id="title"
          label="Name Prefix (Title)"
          leftIcon={UserRound}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={markTouched("title")}
          error={errorFor("title")}
        >
          <option value="">-- Select Title --</option>
          <option value="Mr">Mr.</option>
          <option value="Mrs">Mrs.</option>
          <option value="Miss">Miss.</option>
          <option value="Ms">Ms.</option>
          <option value="Dr">Dr.</option>
          <option value="Prof">Prof.</option>
          <option value="Rev">Rev.</option>
          <option value="Hon">Hon.</option>
          <option value="Eng">Eng.</option>
          <option value="Capt">Capt.</option>
          <option value="Major">Major</option>
          <option value="Col">Col.</option>
          <option value="Sir">Sir</option>
          <option value="Madam">Madam</option>
          <option value="Baby">Baby</option>
          <option value="Fr">Fr.</option>
          <option value="Sr">Sr.</option>
          <option value="Bishop">Bishop</option>
          <option value="Justice">Justice</option>
          <option value="Amb">Amb.</option>
        </SelectField>
        <Input
          label="Surname / Family Name"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          onBlur={markTouched("surname")}
          placeholder="e.g. Otieno"
          autoComplete="family-name"
          required
          maxLength={50}
          error={errorFor("surname")}
          leftIcon={<User className="size-4" />}
        />
        <Input
          label="First Name / Given Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onBlur={markTouched("firstName")}
          placeholder="e.g. Amina"
          autoComplete="given-name"
          required
          maxLength={50}
          error={errorFor("firstName")}
          leftIcon={<UserRound className="size-4" />}
        />
        <Input
          label="Middle Name / Other Names"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          onBlur={markTouched("middleName")}
          placeholder="e.g. Wanjiku"
          autoComplete="additional-name"
          maxLength={50}
          error={errorFor("middleName")}
          leftIcon={<User className="size-4" />}
        />
        <SelectField
          id="gender"
          label="Gender"
          required
          leftIcon={Users}
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          onBlur={markTouched("gender")}
          error={errorFor("gender")}
        >
          <option value="">-- Gender --</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Intersex">Intersex</option>
          <option value="Prefer Not to Say">Prefer Not to Say</option>
        </SelectField>
        <Input
          label="Date of Birth"
          placeholder="Select date of birth"
          type="date"
          required
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          onBlur={markTouched("dateOfBirth")}
          max={new Date().toISOString().split("T")[0]}
          error={errorFor("dateOfBirth")}
          leftIcon={<CalendarDays className="size-4" />}
        />
        <div className="flex flex-col gap-4 min-[500px]:flex-row lg:col-span-2">
          <Input
            label="Age"
            placeholder="Age"
            value={approximateAge}
            readOnly
            containerClassName="flex-1"
            inputClassName="bg-slate-50 font-semibold"
          />
          <Input
            label="Age Group"
            placeholder="Age group"
            value={ageGroup}
            readOnly
            containerClassName="flex-[1.5]"
            inputClassName="bg-slate-50 font-semibold"
          />
        </div>
        <Input
          label="Primary Phone"
          placeholder="e.g. 0712 345 678"
          value={primaryPhone}
          onChange={(e) => setPrimaryPhone(e.target.value)}
          onBlur={markTouched("primaryPhone")}
          type="tel"
          required
          maxLength={15}
          error={errorFor("primaryPhone")}
          leftIcon={<Phone className="size-4" />}
        />
        <SelectField
          id="nationality-secondary"
          label="Nationality"
          leftIcon={Landmark}
          required
          value={nationality}
          disabled={isKenyan}
          onChange={(e) => setNationality(e.target.value)}
          onBlur={markTouched("nationality")}
          error={errorFor("nationality")}
        >
          {isKenyan ? (
            <option value="Kenyan">Kenyan</option>
          ) : (
            <>
              <option value="">-- Nationality --</option>
              <option value="Kenyan">Kenyan</option>
              <option value="Ugandan">Ugandan</option>
              <option value="Tanzanian">Tanzanian</option>
              <option value="Rwandan">Rwandan</option>
              <option value="Burundian">Burundian</option>
              <option value="South Sudanese">South Sudanese</option>
              <option value="Somali">Somali</option>
              <option value="Ethiopian">Ethiopian</option>
              <option value="Eritrean">Eritrean</option>
              <option value="Djiboutian">Djiboutian</option>
              <option value="Congolese (DRC)">Congolese (DRC)</option>
              <option value="Congolese (Republic)">Congolese (Republic)</option>
              <option value="Cameroonian">Cameroonian</option>
              <option value="Central African">Central African</option>
              <option value="Chadian">Chadian</option>
              <option value="Gabonese">Gabonese</option>
              <option value="Equatorial Guinean">Equatorial Guinean</option>
              <option value="South African">South African</option>
              <option value="Zimbabwean">Zimbabwean</option>
              <option value="Zambian">Zambian</option>
              <option value="Botswanan">Botswanan</option>
              <option value="Namibian">Namibian</option>
              <option value="Mozambican">Mozambican</option>
              <option value="Malawian">Malawian</option>
              <option value="Lesotho">Lesotho</option>
              <option value="Eswatini">Eswatini</option>
              <option value="Angolan">Angolan</option>
              <option value="Nigerian">Nigerian</option>
              <option value="Ghanaian">Ghanaian</option>
              <option value="Ivorian">Ivorian</option>
              <option value="Senegalese">Senegalese</option>
              <option value="Malian">Malian</option>
              <option value="Burkinabe">Burkinabe</option>
              <option value="Liberian">Liberian</option>
              <option value="Sierra Leonean">Sierra Leonean</option>
              <option value="Gambian">Gambian</option>
              <option value="Beninese">Beninese</option>
              <option value="Togolese">Togolese</option>
              <option value="Guinean">Guinean</option>
              <option value="Egyptian">Egyptian</option>
              <option value="Sudanese">Sudanese</option>
              <option value="Libyan">Libyan</option>
              <option value="Tunisian">Tunisian</option>
              <option value="Algerian">Algerian</option>
              <option value="Moroccan">Moroccan</option>
              <option value="British">British</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="Spanish">Spanish</option>
              <option value="Dutch">Dutch</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Russian">Russian</option>
              <option value="Ukrainian">Ukrainian</option>
              <option value="Chinese">Chinese</option>
              <option value="Indian">Indian</option>
              <option value="Japanese">Japanese</option>
              <option value="Pakistani">Pakistani</option>
              <option value="Bangladeshi">Bangladeshi</option>
              <option value="Nepalese">Nepalese</option>
              <option value="Filipino">Filipino</option>
              <option value="Indonesian">Indonesian</option>
              <option value="Saudi Arabian">Saudi Arabian</option>
              <option value="Emirati">Emirati</option>
              <option value="American">American</option>
              <option value="Canadian">Canadian</option>
              <option value="Mexican">Mexican</option>
              <option value="Brazilian">Brazilian</option>
              <option value="Argentine">Argentine</option>
              <option value="Colombian">Colombian</option>
              <option value="Chilean">Chilean</option>
              <option value="Australian">Australian</option>
              <option value="New Zealander">New Zealander</option>
              <option value="Fijian">Fijian</option>
              <option value="Stateless">Stateless</option>
              <option value="Other">Other</option>
            </>
          )}
        </SelectField>
      </Section>

      {/* Tabbed sections */}
      <Section
        description={sectionDescriptions[activeTab]}
        headerContent={sectionTabsContent}
      >
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab.replace(/\s+/g, "-")}`}
          aria-labelledby={`tab-${activeTab.replace(/\s+/g, "-")}`}
          className="contents"
        >
          {activeTab === "Demography & Contact Details" ? (
          <>
            <SelectField
              id="religion"
              label="Religion"
              leftIcon={Shield}
              value={religion}
              required
              onChange={(e) => setReligion(e.target.value)}
              onBlur={markTouched("religion")}
              error={errorFor("religion")}
            >
              <option value="">-- Religion --</option>
              <option value="Christian-Catholic">Christian-Catholic</option>
              <option value="Christian">Christian</option>
              <option value="Muslim">Muslim</option>
              <option value="Hindu">Hindu</option>
              <option value="Buddhist">Buddhist</option>
              <option value="Sikh">Sikh</option>
              <option value="Jewish">Jewish</option>
              <option value="Atheist">Atheist</option>
            </SelectField>
            <SelectField
              id="id-type"
              label="Identification Type"
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              leftIcon={IdCard}
            >
              {identificationOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </SelectField>
            <Input
              label={documentNumberLabel}
              placeholder="Enter document number"
              required
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              onBlur={markTouched("documentNumber")}
              maxLength={20}
              error={errorFor("documentNumber")}
              leftIcon={<IdCard className="size-4" />}
            />
            <Input
              label="Alternate Phone"
              placeholder="e.g. 0712 345 678"
              type="tel"
              value={alternatePhone}
              onChange={(e) => setAlternatePhone(e.target.value)}
              onBlur={markTouched("alternatePhone")}
              maxLength={15}
              error={errorFor("alternatePhone")}
              leftIcon={<Phone className="size-4" />}
            />
            <Input
              label="Email Address"
              placeholder="e.g. patient@example.com"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              onBlur={markTouched("email")}
              maxLength={255}
              error={errorFor("email")}
              leftIcon={<Mail className="size-4" />}
            />
            <SelectField
              id="county"
              label="County"
              value={county}
              required
              onChange={(e) => {
                setCounty(e.target.value);
                setSubCounty("");
                setWard("");
              }}
              onBlur={markTouched("county")}
              error={errorFor("county")}
              leftIcon={MapPin}
            >
              <option value="">-- County --</option>
              {getCounties().map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>
            <SelectField
              id="sub-county"
              label="Sub-county"
              value={subCounty}
              required
              onChange={(e) => {
                setSubCounty(e.target.value);
                setWard("");
              }}
              onBlur={markTouched("subCounty")}
              error={errorFor("subCounty")}
              leftIcon={MapPin}
            >
              <option value="">-- Sub-county --</option>
              {getSubCounties(county).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectField>
            <SelectField
              id="ward"
              label="Ward"
              leftIcon={MapPin}
              required
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              onBlur={markTouched("ward")}
              error={errorFor("ward")}
            >
              <option value="">-- Ward --</option>
              {getWards(county, subCounty).map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </SelectField>

            <Input
              label="Village/Estate"
              required
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              onBlur={markTouched("village")}
              placeholder="e.g. Kileleshwa"
              maxLength={100}
              error={errorFor("village")}
              leftIcon={<Building2 className="size-4" />}
            />
            <Input
              label="Physical Address"
              placeholder="e.g. Rewa Apartment"
              required
              value={physicalAddress}
              onChange={(e) => setPhysicalAddress(e.target.value)}
              onBlur={markTouched("physicalAddress")}
              maxLength={200}
              error={errorFor("physicalAddress")}
              leftIcon={<MapPin className="size-4" />}
              containerClassName="sm:col-span-2 lg:col-span-2 shadow-xs"
            />
            <SelectField
              id="patient-category"
              label="Patient Category"
              leftIcon={NotebookTabs}
              required
              value={patientCategory}
              onChange={(e) => setPatientCategory(e.target.value)}
              error={errorFor("patientCategory")}
              onBlur={markTouched("patientCategory")}
            >
              <option value="General">General</option>
              <option value="Private">Private</option>
              <option value="Private-Hospital">Private-Hospital</option>
            </SelectField>
            <Input
              label="Employer"
              placeholder="Employer Name"
              value={employer}
              required
              onChange={(e) => setEmployer(e.target.value)}
              onBlur={markTouched("employer")}
              error={errorFor("employer")}
              maxLength={100}
              leftIcon={<BriefcaseBusiness className="size-4" />}
            />

            <Input
              label="Last Visit Date"
              placeholder="Last Visit Date"
              value={lastVisitDate}
              readOnly
              disabled
              leftIcon={<CalendarDays className="size-4" />}
            />
            <Input
              label="Registration Date"
              placeholder="Auto-generated at registration"
              value={registrationDate}
              readOnly
              disabled
              leftIcon={<CalendarDays className="size-4" />}
            />
          </>
        ) : null}

        {activeTab === "Payer Details" ? (
          <>
            <SelectField
              id="payment-category"
              label="Payment Category"
              leftIcon={CircleDollarSign}
              required
              value={paymentCategory}
              onChange={(e) => setPaymentCategory(e.target.value)}
              error={errorFor("paymentCategory")}
              onBlur={markTouched("paymentCategory")}
            >
              <option value="">-- Payment Category --</option>
              <option value="Cash">Cash</option>
              <option value="Insurance">Insurance</option>
              <option value="NHIF">SHA</option>
              <option value="Corporate">Corporate</option>
            </SelectField>

            {paymentCategory === "Cash" ? (
              <>
                <Input
                  label="Payer Name"
                  placeholder="Name of the payer"
                  value={cashPayerName}
                  onChange={(e) => setCashPayerName(e.target.value)}
                  onBlur={markTouched("cashPayerName")}
                  error={errorFor("cashPayerName")}
                  maxLength={100}
                  leftIcon={<User className="size-4" />}
                />
                <Input
                  label="Phone Number"
                  placeholder="Payer phone number"
                  value={cashReceiptNumber}
                  onChange={(e) => setCashReceiptNumber(e.target.value)}
                  onBlur={markTouched("cashReceiptNumber")}
                  error={errorFor("cashReceiptNumber")}
                  maxLength={100}
                  leftIcon={<Copy className="size-4" />}
                />
              </>
            ) : paymentCategory === "Insurance" ? (
              <>
                <Input
                  label="Insurance Provider Name"
                  placeholder="Insurance provider"
                  value={insuranceProviderName}
                  onChange={(e) => setInsuranceProviderName(e.target.value)}
                  onBlur={markTouched("insuranceProviderName")}
                  error={errorFor("insuranceProviderName")}
                  maxLength={100}
                  leftIcon={<Shield className="size-4" />}
                />
                <Input
                  label="Scheme Name"
                  placeholder="Insurance scheme name"
                  value={insuranceSchemeName}
                  onChange={(e) => setInsuranceSchemeName(e.target.value)}
                  onBlur={markTouched("insuranceSchemeName")}
                  error={errorFor("insuranceSchemeName")}
                  maxLength={100}
                  leftIcon={<Copy className="size-4" />}
                />
                <Input
                  label="Member Number"
                  placeholder="Insurance member number"
                  value={insuranceMemberNumber}
                  onChange={(e) => setInsuranceMemberNumber(e.target.value)}
                  onBlur={markTouched("insuranceMemberNumber")}
                  error={errorFor("insuranceMemberNumber")}
                  maxLength={100}
                  leftIcon={<User className="size-4" />}
                />
                <Input
                  label="Cover End Date"
                  type="date"
                  value={insuranceCoverEndDate}
                  onChange={(e) => setInsuranceCoverEndDate(e.target.value)}
                  onBlur={markTouched("insuranceCoverEndDate")}
                  error={errorFor("insuranceCoverEndDate")}
                  leftIcon={<CalendarDays className="size-4" />}
                />
              </>
            ) : paymentCategory === "NHIF" ? (
              <>
                <Input
                  label="CR No."
                  placeholder="SHA membership number"
                  value={nhifNumber}
                  onChange={(e) => setNhifNumber(e.target.value)}
                  onBlur={markTouched("nhifNumber")}
                  error={errorFor("nhifNumber")}
                  maxLength={100}
                  leftIcon={<Shield className="size-4" />}
                />
                <Input
                  label="Cover Type"
                  placeholder="Type of cover"
                  value={nhifCoverType}
                  onChange={(e) => setNhifCoverType(e.target.value)}
                  onBlur={markTouched("nhifCoverType")}
                  error={errorFor("nhifCoverType")}
                  maxLength={100}
                  leftIcon={<BriefcaseBusiness className="size-4" />}
                />
                <Input
                  label="Expiry Date"
                  type="date"
                  value={nhifExpiryDate}
                  onChange={(e) => setNhifExpiryDate(e.target.value)}
                  onBlur={markTouched("nhifExpiryDate")}
                  error={errorFor("nhifExpiryDate")}
                  leftIcon={<CalendarDays className="size-4" />}
                />
              </>
            ) : paymentCategory === "Corporate" ? (
              <>
                <Input
                  label="Corporate Account Name"
                  placeholder="Corporate payer name"
                  value={corporateName}
                  onChange={(e) => setCorporateName(e.target.value)}
                  onBlur={markTouched("corporateName")}
                  error={errorFor("corporateName")}
                  maxLength={100}
                  leftIcon={<Building2 className="size-4" />}
                />
                <Input
                  label={corporateAccountLabel}
                  placeholder={corporateAccountLabel}
                  value={corporateAccountNumber}
                  onChange={(e) => setCorporateAccountNumber(e.target.value)}
                  onBlur={markTouched("corporateAccountNumber")}
                  error={errorFor("corporateAccountNumber")}
                  maxLength={100}
                  leftIcon={<Copy className="size-4" />}
                />
                <Input
                  label="Corporate Contact Person"
                  placeholder="Contact person"
                  value={corporateContactPerson}
                  onChange={(e) => setCorporateContactPerson(e.target.value)}
                  onBlur={markTouched("corporateContactPerson")}
                  error={errorFor("corporateContactPerson")}
                  maxLength={100}
                  leftIcon={<UserRound className="size-4" />}
                />
              </>
            ) : (
              <div className="sm:col-span-2 xl:col-span-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Select a payment category to show the matching payer details fields.
              </div>
            )}
          </>
        ) : null}

        {activeTab === "NOK & Emergency Contact" ? (
          <div className="grid grid-cols-1 gap-6 sm:col-span-2 md:col-span-3 xl:col-span-4 2xl:col-span-6 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Users className="size-5 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Next of Kin Details
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Input
                  label="Surname"
                  placeholder="Surname"
                  required
                  value={nokSurname}
                  onChange={(e) => setNokSurname(e.target.value)}
                  onBlur={markTouched("nokSurname")}
                  error={errorFor("nokSurname")}
                  maxLength={50}
                  leftIcon={<User className="size-4" />}
                />
                <Input
                  label="First Name"
                  placeholder="First name"
                  value={nokFirstName}
                  required
                  onChange={(e) => setNokFirstName(e.target.value)}
                  onBlur={markTouched("nokFirstName")}
                  error={errorFor("nokFirstName")}
                  maxLength={50}
                  leftIcon={<UserRound className="size-4" />}
                />
                <Input
                  label="Other Name"
                  placeholder="Other name"
                  value={nokOtherName}
                  onChange={(e) => setNokOtherName(e.target.value)}
                  onBlur={markTouched("nokOtherName")}
                  error={errorFor("nokOtherName")}
                  maxLength={50}
                  leftIcon={<User className="size-4" />}
                />
                <SelectField
                  id="nok-rel"
                  label="Relationship to Patient"
                  value={nokRelationship}
                  required
                  onChange={(e) => setNokRelationship(e.target.value)}
                  onBlur={markTouched("nokRelationship")}
                  error={errorFor("nokRelationship")}
                  leftIcon={Users}
                >
                  <option value="">-- Relationship --</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Husband">Husband</option>
                  <option value="Wife">Wife</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Grandfather">Grandfather</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Cousin">Cousin</option>
                  <option value="Nephew">Nephew</option>
                  <option value="Niece">Niece</option>
                  <option value="Partner">Partner</option>
                  <option value="Fiancé">Fiancé</option>
                  <option value="Fiancée">Fiancée</option>
                  <option value="Friend">Friend</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Employer">Employer</option>
                  <option value="Employee">Employee</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Social Worker">Social Worker</option>
                  <option value="Religious Leader">Religious Leader</option>
                  <option value="Legal Representative">
                    Legal Representative
                  </option>
                  <option value="Other">Other</option>
                </SelectField>

                <Input
                  label="NOK Phone"
                  placeholder="e.g. 0712 345 678"
                  value={nokPhone}
                  required
                  onChange={(e) => setNokPhone(e.target.value)}
                  onBlur={markTouched("nokPhone")}
                  maxLength={15}
                  error={errorFor("nokPhone")}
                  leftIcon={<Phone className="size-4" />}
                />
                <Input
                  label="NOK ID Number"
                  placeholder="e.g. 12345678"
                  value={nokIdNumber}
                  required
                  onChange={(e) => setNokIdNumber(e.target.value)}
                  onBlur={markTouched("nokIdNumber")}
                  error={errorFor("nokIdNumber")}
                  maxLength={20}
                  leftIcon={<IdCard className="size-4" />}
                />
                <Input
                  label="NOK Email Address"
                  placeholder="e.g. nok@example.com"
                  type="email"
                  value={nokEmail}
                  onChange={(e) => setNokEmail(e.target.value)}
                  onBlur={markTouched("nokEmail")}
                  maxLength={255}
                  error={errorFor("nokEmail")}
                  leftIcon={<Mail className="size-4" />}
                />
                <Input
                  label="Employer"
                  placeholder="Employer Name"
                  value={nokEmployer}
                  required
                  onChange={(e) => setNokEmployer(e.target.value)}
                  onBlur={markTouched("nokEmployer")}
                  error={errorFor("nokEmployer")}
                  maxLength={100}
                  leftIcon={<BriefcaseBusiness className="size-4" />}
                />
                <Input
                  label="NOK Address"
                  placeholder="Physical address"
                  value={nokAddress}
                  required
                  onChange={(e) => setNokAddress(e.target.value)}
                  onBlur={markTouched("nokAddress")}
                  error={errorFor("nokAddress")}
                  maxLength={200}
                  leftIcon={<MapPin className="size-4" />}
                  containerClassName="sm:col-span-2 lg:col-span-2"
                />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 shadow-sm lg:col-span-1">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <ContactRound className="size-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Emergency Contact Details
                </h3>
              </div>
              <label className="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  id="same-as-nok"
                  checked={sameAsNok}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSameAsNok(checked);
                    if (checked) {
                      setEmergencyName(
                        [nokFirstName, nokOtherName, nokSurname]
                          .filter(Boolean)
                          .join(" ")
                      );
                      setEmergencyRelationship(nokRelationship);
                      setEmergencyPhone(nokPhone);
                      setAlternateEmergencyPhone("");
                      setTouched((p) => ({
                        ...p,
                        emergencyName: true,
                        emergencyRelationship: true,
                        emergencyPhone: true,
                      }));
                    }
                  }}
                  className="size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Same as NOK details
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Emergency Contact Name"
                  placeholder="Full name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  onBlur={markTouched("emergencyName")}
                  required
                  maxLength={120}
                  error={errorFor("emergencyName")}
                  leftIcon={<ContactRound className="size-4" />}
                  containerClassName="sm:col-span-2"
                />
                <SelectField
                  id="emg-rel"
                  label="Relationship"
                  required
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  onBlur={markTouched("emergencyRelationship")}
                  error={errorFor("emergencyRelationship")}
                  leftIcon={Users}
                >
                  <option value="">-- Relationship --</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Husband">Husband</option>
                  <option value="Wife">Wife</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Grandfather">Grandfather</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Cousin">Cousin</option>
                  <option value="Nephew">Nephew</option>
                  <option value="Niece">Niece</option>
                  <option value="Partner">Partner</option>
                  <option value="Fiancé">Fiancé</option>
                  <option value="Fiancée">Fiancée</option>
                  <option value="Friend">Friend</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Employer">Employer</option>
                  <option value="Employee">Employee</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Social Worker">Social Worker</option>
                  <option value="Religious Leader">Religious Leader</option>
                  <option value="Legal Representative">
                    Legal Representative
                  </option>
                  <option value="Other">Other</option>
                </SelectField>
                <Input
                  label="Emergency Phone"
                  placeholder="e.g. 0712 345 678"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  onBlur={markTouched("emergencyPhone")}
                  required
                  maxLength={15}
                  error={errorFor("emergencyPhone")}
                  leftIcon={<Phone className="size-4" />}
                />
                <Input
                  label="Alternate Emergency Phone"
                  placeholder="Optional alternate phone number"
                  value={alternateEmergencyPhone}
                  onChange={(e) => setAlternateEmergencyPhone(e.target.value)}
                  onBlur={markTouched("alternateEmergencyPhone")}
                  maxLength={15}
                  error={errorFor("alternateEmergencyPhone")}
                  helperText="Optional"
                  leftIcon={<Phone className="size-4" />}
                  containerClassName="sm:col-span-2"
                />
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "Administrative Details" ? (
          <>
            <div className="flex h-full flex-col justify-center sm:col-span-2 xl:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={isSuspended}
                  onChange={(e) => setIsSuspended(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Suspend patient
              </label>
            </div>
            <TextareaField
              id="administrative-comments"
              label="Comments"
              placeholder="Add relevant notes or special considerations"
              className="sm:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-6"
              leftIcon={FileText}
              value={adminComments}
              onChange={(e) => setAdminComments(e.target.value)}
              maxLength={1000}
            />
          </>
        ) : null}
        </div>
      </Section>

      {/* Footer Action Buttons */}
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto max-w-[1600px] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex flex-col gap-2 min-[370px]:flex-row sm:justify-end">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                if (surname || firstName || uihdNo) {
                  if (confirm("Are you sure you want to clear all entered patient details? This action cannot be undone.")) {
                    clearForm();
                  }
                } else {
                  clearForm();
                }
              }}
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center gap-2 h-11 sm:h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:flex-none"
            >
              <RotateCcw className="size-4" />
              Clear Details
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="relative inline-flex flex-1 items-center justify-center gap-2 h-11 sm:h-10 rounded-lg bg-cyan-700 px-6 text-sm font-semibold text-white hover:bg-cyan-800 active:bg-cyan-900 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:flex-none overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="size-4 animate-spin" />
                    Processing...
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <Save className="size-4" />
                    {isEditingPatient ? "Update Record" : "Save Registration"}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        data={successData}
      />
    </form>
  );
};

/**
 * Success Modal Component
 * Displays after successful registration or update
 */
const SuccessModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const handleCopyUhid = async () => {
    await navigator.clipboard.writeText(data.uhid);
    toast.success("UHID copied");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 22,
          }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]"
        >
          {/* Top Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-600 via-sky-500 to-emerald-500" />

          {/* Content */}
          <div className="p-5 sm:p-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.1,
                  type: "spring",
                  stiffness: 240,
                }}
                className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500"
              >
                <CircleCheck className="size-10 stroke-[2.2]" />
              </motion.div>
            </div>

            {/* Title */}
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {data.isUpdate
                  ? "Record Updated"
                  : "Registration Complete"}
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                Medical record has been saved successfully.
              </p>
            </div>

            {/* Patient Card */}
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-700">
                  {data.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Patient Name
                    </p>
                    <div className="rounded-lg bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      ACTIVE
                    </div>
                  </div>

                  <h3 className="mt-0.5 truncate text-base font-semibold leading-tight text-slate-900">
                    {data.name}
                  </h3>
                </div>
              </div>

              {/* UHID */}
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-center gap-8">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Unique Health ID
                    </p>

                    <div className="mt-0.5">
                      <span className="font-mono text-xl font-bold tracking-tight text-slate-950">
                        {data.uhid}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyUhid}
                    className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-95"
                    title="Copy UHID"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 flex-1 items-center justify-center rounded-xl bg-cyan-700 px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-cyan-800 active:scale-[0.98]"
              >
                New Registration
              </button>

              
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default PatientRegistration;
