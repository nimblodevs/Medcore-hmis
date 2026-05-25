import { Building2, ShieldCheck, Users } from "lucide-react";
import { userRows } from "./userManagementData";
import { statusClass, UserManagementShell } from "./UserManagementShell";

const UsersPage = () => (
  <UserManagementShell
    title="Users"
    subtitle="Create accounts, review access status, and assign staff to roles, departments, and branches."
    actionLabel="Add User"
    searchPlaceholder="Search users"
    stats={[
      { label: "Active Users", value: 4, note: "Across three branches", icon: Users, iconBg: "bg-cyan-100 text-cyan-700" },
      { label: "Role Coverage", value: 8, note: "Configured role groups", icon: ShieldCheck, iconBg: "bg-emerald-100 text-emerald-700" },
      { label: "Branches", value: 3, note: "Assignable locations", icon: Building2, iconBg: "bg-violet-100 text-violet-700" },
    ]}
  >
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Branch</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Last Active</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {userRows.map((user) => (
            <tr key={user.email} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <p className="font-bold text-slate-900">{user.name}</p>
                <p className="text-xs font-medium text-slate-500">{user.email}</p>
              </td>
              <td className="px-4 py-3 font-semibold text-slate-700">{user.role}</td>
              <td className="px-4 py-3 text-slate-600">{user.department}</td>
              <td className="px-4 py-3 text-slate-600">{user.branch}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusClass(user.status)}`}>
                  {user.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">{user.lastActive}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </UserManagementShell>
);

export default UsersPage;
