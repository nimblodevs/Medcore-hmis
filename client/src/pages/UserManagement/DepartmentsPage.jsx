import { Building2, Network, Users } from "lucide-react";
import { departmentRows } from "./userManagementData";
import { UserManagementShell } from "./UserManagementShell";

const DepartmentsPage = () => (
  <UserManagementShell
    title="Departments"
    subtitle="Maintain clinical and operational departments used when assigning staff and branch access."
    actionLabel="Add Department"
    searchPlaceholder="Search departments"
    stats={[
      { label: "Departments", value: departmentRows.length, note: "Configured service units", icon: Network, iconBg: "bg-cyan-100 text-cyan-700" },
      { label: "Staff", value: departmentRows.reduce((sum, row) => sum + row.users, 0), note: "Mapped to departments", icon: Users, iconBg: "bg-emerald-100 text-emerald-700" },
      { label: "Branch Links", value: 3, note: "Locations using departments", icon: Building2, iconBg: "bg-violet-100 text-violet-700" },
    ]}
  >
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Head</th>
            <th className="px-4 py-3">Users</th>
            <th className="px-4 py-3">Branch Coverage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {departmentRows.map((department) => (
            <tr key={department.code} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-bold text-slate-900">{department.name}</td>
              <td className="px-4 py-3">
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
                  {department.code}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{department.head}</td>
              <td className="px-4 py-3 font-semibold text-slate-700">{department.users}</td>
              <td className="px-4 py-3 text-slate-600">{department.branch}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </UserManagementShell>
);

export default DepartmentsPage;
