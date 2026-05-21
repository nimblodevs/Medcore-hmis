import { Building2, MapPin, Network } from "lucide-react";
import { branchRows } from "./userManagementData";
import { statusClass, UserManagementShell } from "./UserManagementShell";

const BranchesPage = () => (
  <UserManagementShell
    title="Branches"
    subtitle="Control branch-level access and review operating locations available for staff assignments."
    actionLabel="Add Branch"
    searchPlaceholder="Search branches"
    stats={[
      { label: "Branches", value: branchRows.length, note: "Facility access locations", icon: Building2, iconBg: "bg-cyan-100 text-cyan-700" },
      { label: "Departments", value: branchRows.reduce((sum, row) => sum + row.departments, 0), note: "Branch department links", icon: Network, iconBg: "bg-emerald-100 text-emerald-700" },
      { label: "Locations", value: 2, note: "Counties represented", icon: MapPin, iconBg: "bg-amber-100 text-amber-700" },
    ]}
  >
    <div className="grid gap-3 p-4 lg:grid-cols-3">
      {branchRows.map((branch) => (
        <div key={branch.code} className="rounded-2xl border border-slate-200 p-4 transition-colors hover:border-cyan-200 hover:bg-cyan-50/30">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">{branch.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                <MapPin size={13} />
                {branch.location}
              </p>
            </div>
            <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${statusClass(branch.status)}`}>
              {branch.status}
            </span>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Branch Code</p>
            <p className="mt-1 text-lg font-black text-slate-900">{branch.code}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Users</p>
              <p className="mt-1 font-black text-slate-900">{branch.users}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Departments</p>
              <p className="mt-1 font-black text-slate-900">{branch.departments}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </UserManagementShell>
);

export default BranchesPage;
