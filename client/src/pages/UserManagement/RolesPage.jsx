import { KeyRound, ShieldCheck, Users } from "lucide-react";
import { roleRows } from "./userManagementData";
import { statusClass, UserManagementShell } from "./UserManagementShell";

const RolesPage = () => (
  <UserManagementShell
    title="Roles"
    subtitle="Review role scopes and permission coverage before assigning access to facility staff."
    actionLabel="Add Role"
    searchPlaceholder="Search roles"
    stats={[
      { label: "Role Groups", value: roleRows.length, note: "System and tenant roles", icon: ShieldCheck, iconBg: "bg-cyan-100 text-cyan-700" },
      { label: "Assigned Users", value: roleRows.reduce((sum, row) => sum + row.users, 0), note: "Users with mapped roles", icon: Users, iconBg: "bg-emerald-100 text-emerald-700" },
      { label: "Permissions", value: 48, note: "Highest permission bundle", icon: KeyRound, iconBg: "bg-amber-100 text-amber-700" },
    ]}
  >
    <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
      {roleRows.map((role) => (
        <div key={role.name} className="rounded-2xl border border-slate-200 p-4 transition-colors hover:border-cyan-200 hover:bg-cyan-50/30">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">{role.name}</h3>
              <p className="mt-1 text-xs font-medium text-slate-500">{role.scope} scope</p>
            </div>
            <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${statusClass(role.status)}`}>
              {role.status}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Users</p>
              <p className="mt-1 text-lg font-black text-slate-900">{role.users}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Permissions</p>
              <p className="mt-1 text-lg font-black text-slate-900">{role.permissions}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </UserManagementShell>
);

export default RolesPage;
