export const userRows = [
  {
    name: "Amina Mwangi",
    email: "amina.mwangi@medicore.local",
    role: "Hospital Admin",
    department: "Administration",
    branch: "Main Outpatient Branch",
    status: "Active",
    lastActive: "Today, 08:42",
  },
  {
    name: "Brian Otieno",
    email: "brian.otieno@medicore.local",
    role: "Billing Officer",
    department: "Finance",
    branch: "Main Outpatient Branch",
    status: "Active",
    lastActive: "Today, 07:55",
  },
  {
    name: "Grace Njeri",
    email: "grace.njeri@medicore.local",
    role: "Receptionist",
    department: "Patient Registry",
    branch: "Westlands Clinic",
    status: "Active",
    lastActive: "Yesterday, 17:18",
  },
  {
    name: "Daniel Kariuki",
    email: "daniel.kariuki@medicore.local",
    role: "Doctor",
    department: "Outpatient",
    branch: "Main Outpatient Branch",
    status: "Invited",
    lastActive: "Pending invite",
  },
  {
    name: "Faith Wambui",
    email: "faith.wambui@medicore.local",
    role: "Auditor",
    department: "Compliance",
    branch: "Mombasa Satellite",
    status: "Suspended",
    lastActive: "18 May 2026",
  },
];

export const roleRows = [
  { name: "SUPER_ADMIN", users: 1, permissions: 48, scope: "Platform", status: "System" },
  { name: "HOSPITAL_ADMIN", users: 3, permissions: 42, scope: "Tenant", status: "Active" },
  { name: "BRANCH_ADMIN", users: 5, permissions: 36, scope: "Branch", status: "Active" },
  { name: "BILLING_OFFICER", users: 8, permissions: 21, scope: "Finance", status: "Active" },
  { name: "RECEPTIONIST", users: 6, permissions: 14, scope: "Front desk", status: "Active" },
  { name: "AUDITOR", users: 2, permissions: 9, scope: "Read only", status: "Active" },
];

export const departmentRows = [
  { name: "Outpatient", code: "OPD", head: "Daniel Kariuki", users: 12, branch: "Main Outpatient Branch" },
  { name: "Pharmacy", code: "PHARM", head: "Mary Atieno", users: 7, branch: "Main Outpatient Branch" },
  { name: "Finance", code: "FIN", head: "Brian Otieno", users: 10, branch: "All branches" },
  { name: "Patient Registry", code: "REG", head: "Grace Njeri", users: 6, branch: "All branches" },
  { name: "Compliance", code: "COMP", head: "Faith Wambui", users: 2, branch: "Main Outpatient Branch" },
];

export const branchRows = [
  {
    name: "Main Outpatient Branch",
    code: "MAIN",
    location: "Nairobi, Kenya",
    users: 31,
    departments: 8,
    status: "Online",
  },
  {
    name: "Westlands Clinic",
    code: "WEST",
    location: "Westlands, Nairobi",
    users: 12,
    departments: 5,
    status: "Online",
  },
  {
    name: "Mombasa Satellite",
    code: "MSA",
    location: "Mombasa, Kenya",
    users: 9,
    departments: 4,
    status: "Maintenance",
  },
];
