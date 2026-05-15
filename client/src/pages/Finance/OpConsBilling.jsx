import { motion } from "motion/react";

const samplePatient = {
  uhid: "UHID-000231",
  patientId: "PID-10045",
  title: "Ms",
  firstName: "Amina",
  middleName: "Wanjiku",
  lastName: "Otieno",
  gender: "Female",
  dob: "1994-08-12",
  phoneNumber: "0712345678",
  paymentCategory: "NHIF",
  nationality: "Kenyan",
  county: "Nairobi",
  patientCategory: "General",
};

const formatDate = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

const calculateAge = (dateString) => {
  const [year, month, day] = dateString.split("-");
  const dob = new Date(Number(year), Number(month) - 1, Number(day));
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
};

const getAgeGroup = (age) => {
  if (age < 1) return "Infant";
  if (age < 5) return "Toddler";
  if (age < 13) return "Child";
  if (age < 18) return "Adolescent";
  if (age < 65) return "Adult";
  return "Senior";
};

const OpConsBilling = () => {
  const fullName = `${samplePatient.title} ${samplePatient.firstName} ${samplePatient.middleName} ${samplePatient.lastName}`;
  const age = calculateAge(samplePatient.dob);
  const ageGroup = getAgeGroup(age);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">OP Cons Billing</h1>
          <p className="text-sm font-medium text-slate-500">
            Manage outpatient consultation billing records and collect service fees.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Patient Details</h2>
            <p className="text-sm text-slate-500">Review the selected outpatient before posting billing items.</p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Unique Health ID</p>
            <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-slate-900">
              {samplePatient.uhid}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Patient Name</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 leading-tight">{fullName}</p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Patient ID</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{samplePatient.patientId}</p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">DOB</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(samplePatient.dob)}</p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Age</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{age} yrs</p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Age Group</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{ageGroup}</p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Gender</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{samplePatient.gender}</p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Payment</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{samplePatient.paymentCategory}</p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Phone</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{samplePatient.phoneNumber}</p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">County</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{samplePatient.county}</p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Nationality</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{samplePatient.nationality}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">
          This page is ready for financial workflow integration. Add billing tables,
          payment posts, and summary cards here.
        </p>
      </div>
    </motion.div>
  );
};

export default OpConsBilling;
