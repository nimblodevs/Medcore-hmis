import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Filter, 
  MoreVertical, 
  Download, 
  Plus, 
  Phone, 
  Calendar,
  ExternalLink,
  Loader2,
  Table as TableIcon
} from "lucide-react";
import { getAllPatients } from "../../services/patientApi";
import { motion } from "motion/react";

const StatusBadge = ({ status }) => {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    Suspended: "bg-rose-50 text-rose-700 ring-rose-600/10",
    Inactive: "bg-slate-50 text-slate-700 ring-slate-600/10",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${styles[status] || styles.Inactive}`}>
      {status}
    </span>
  );
};

const PatientList = ({ onRegisterClick }) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterNationality, setFilterNationality] = useState("Kenyan");
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterCounty, setFilterCounty] = useState("all");
  const [filterSubCounty, setFilterSubCounty] = useState("all");
  const [filterWard, setFilterWard] = useState("all");
  const [dateRange, setDateRange] = useState("all"); // Today, 7Days, ThisMonth

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients-list"],
    queryFn: getAllPatients,
  });

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // Basic Info matching
      const matchesStatus = filterStatus === "all" || p.status === filterStatus;
      
      // Nationality Filter (default Kenyan)
      // Note: mapping nationality to patientType or nationality field
      const pNationality = p.nationality || p.patientType || "Kenyan";
      const matchesNationality = filterNationality === "all" || pNationality === filterNationality;

      // Payment Category
      const matchesPayment = filterPayment === "all" || p.paymentCategory === filterPayment;

      // Location Filters
      const matchesCounty = filterCounty === "all" || p.county === filterCounty;
      const matchesSubCounty = filterSubCounty === "all" || p.subCounty === filterSubCounty;
      const matchesWard = filterWard === "all" || p.ward === filterWard;

      // Date Filters
      let matchesDate = true;
      if (dateRange !== "all") {
        const regDate = p.registrationDate ? new Date(p.registrationDate) : new Date();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (dateRange === "Today") {
          matchesDate = regDate >= today;
        } else if (dateRange === "7Days") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchesDate = regDate >= sevenDaysAgo;
        } else if (dateRange === "ThisMonth") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          matchesDate = regDate >= startOfMonth;
        }
      }
      
      return matchesStatus && matchesNationality && matchesPayment && matchesCounty && matchesSubCounty && matchesWard && matchesDate;
    });
  }, [patients, filterStatus, filterNationality, filterPayment, filterCounty, filterSubCounty, filterWard, dateRange]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="size-10 animate-spin text-cyan-600" />
        <p className="font-medium animate-pulse">Loading patient database...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Patient Directory</h1>
          <p className="text-sm font-medium text-slate-500">Manage and view all registered medical records</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50">
            <Download size={18} />
            Export Data
          </button>
          <button 
            onClick={onRegisterClick}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-700/20 transition-all hover:bg-cyan-800 active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
            New Registration
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
              <Filter size={16} />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Advanced Filters</h2>
          </div>
          <button 
            onClick={() => {
              setFilterStatus("all");
              setFilterNationality("Kenyan");
              setFilterPayment("all");
              setFilterCounty("all");
              setFilterSubCounty("all");
              setFilterWard("all");
              setDateRange("all");
            }}
            className="text-xs font-bold text-cyan-700 hover:underline"
          >
            Reset All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {/* Nationality */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Nationality</label>
            <select
              value={filterNationality}
              onChange={(e) => setFilterNationality(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2 text-xs font-bold text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-600"
            >
              <option value="all">All Types</option>
              <option value="Kenyan">Kenyan</option>
              <option value="Foreigner">Foreigner</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2 text-xs font-bold text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-600"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Payment */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment</label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2 text-xs font-bold text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-600"
            >
              <option value="all">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Insurance">Insurance</option>
              <option value="NHIF">NHIF</option>
              <option value="Corporate">Corporate</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Reg. Date</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2 text-xs font-bold text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-600"
            >
              <option value="all">All Time</option>
              <option value="Today">Today</option>
              <option value="7Days">Last 7 Days</option>
              <option value="ThisMonth">This Month</option>
            </select>
          </div>

          {/* Location Expandable / Flow */}
          <div className="lg:col-span-2 xl:col-span-3">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">County</label>
                <select
                  value={filterCounty}
                  onChange={(e) => setFilterCounty(e.target.value)}
                  className="w-full rounded-xl border-none bg-slate-50 py-2 text-xs font-bold text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-600"
                >
                  <option value="all">All Counties</option>
                  <option value="Nairobi">Nairobi</option>
                  <option value="Mombasa">Mombasa</option>
                  <option value="Kiambu">Kiambu</option>
                  <option value="Uasin Gishu">Uasin Gishu</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Sub-County</label>
                <select
                  value={filterSubCounty}
                  onChange={(e) => setFilterSubCounty(e.target.value)}
                  className="w-full rounded-xl border-none bg-slate-50 py-2 text-xs font-bold text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-600"
                >
                  <option value="all">All Sub-Counties</option>
                  <option value="Westlands">Westlands</option>
                  <option value="Dagoretti">Dagoretti</option>
                  <option value="Eldoret North">Eldoret North</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Ward</label>
                <select
                  value={filterWard}
                  onChange={(e) => setFilterWard(e.target.value)}
                  className="w-full rounded-xl border-none bg-slate-50 py-2 text-xs font-bold text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-600"
                >
                  <option value="all">All Wards</option>
                  <option value="Parklands">Parklands</option>
                  <option value="Kileleshwa">Kileleshwa</option>
                  <option value="Huruma">Huruma</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Patient Details</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">UHID Number</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact Info</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Last Visit</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const initials = `${patient.firstName?.charAt(0) || ""}${patient.lastName?.charAt(0) || ""}`.toUpperCase();
                  const fullName = `${patient.firstName} ${patient.middleName ? patient.middleName + " " : ""}${patient.lastName}`;
                  
                  return (
                    <tr key={patient.uhid} className="group transition-colors hover:bg-cyan-50/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 transition-colors group-hover:bg-cyan-100 group-hover:text-cyan-700">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{fullName}</p>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">{patient.gender} • {patient.dob}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-700">{patient.uhid}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <Phone size={12} className="text-slate-400" />
                            {patient.phoneNumber}
                          </p>
                          {patient.email && (
                            <p className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              {patient.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          <Calendar size={12} className="text-slate-400" />
                          {patient.lastVisitDate || "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={patient.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-cyan-600 hover:shadow-sm transition-all">
                            <ExternalLink size={16} />
                          </button>
                          <button className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm transition-all">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="rounded-full bg-slate-50 p-4">
                        <TableIcon size={32} strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-medium">No medical records found matching your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex items-center justify-between px-2 text-xs font-medium text-slate-500">
        <p>Showing {filteredPatients.length} of {patients.length} patients</p>
        <div className="flex items-center gap-2">
          <span>Page 1 of 1</span>
          <div className="flex gap-1">
            <button disabled className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 opacity-50">Prev</button>
            <button disabled className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 opacity-50">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PatientList;
