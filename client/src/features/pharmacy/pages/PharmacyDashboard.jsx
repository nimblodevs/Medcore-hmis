import { useQuery } from '@tanstack/react-query';
import { drugApi, storeApi, batchApi } from '../services/pharmacy.api';
import { motion } from 'motion/react';
import { 
  AlertTriangle, Package, Clock, 
  Building2, ChevronRight,
  Activity, ThermometerSnowflake
} from 'lucide-react';

/**
 * Pharmacy Dashboard Component
 * 
 * Displays key metrics and alerts for pharmacy operations
 * Following MedCore HMIS theme: rounded-3xl, shadow-sm, clean typography
 */
const PharmacyDashboard = () => {
  // Fetch low stock drugs
  const { data: lowStockData, isLoading: lowStockLoading } = useQuery({
    queryKey: ['drugs', 'low-stock'],
    queryFn: () => drugApi.getLowStock().then(res => res.data),
  });
  
  // Fetch expiring drugs
  const { data: expiringData, isLoading: expiringLoading } = useQuery({
    queryKey: ['drugs', 'expiring'],
    queryFn: () => batchApi.getExpiring().then(res => res.data),
  });
  
  // Fetch all drugs for total count
  const { data: allDrugsData, isLoading: allDrugsLoading } = useQuery({
    queryKey: ['drugs'],
    queryFn: () => drugApi.getAll({ limit: 1 }).then(res => res.data),
  });
  
  // Fetch stores
  const { data: storesData, isLoading: storesLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storeApi.getAll().then(res => res.data),
  });

  const allDrugs = Array.isArray(allDrugsData?.data) ? allDrugsData.data : Array.isArray(allDrugsData) ? allDrugsData : [];
  const lowStockItems = Array.isArray(lowStockData?.data) ? lowStockData.data : Array.isArray(lowStockData) ? lowStockData : [];
  const expiringBatches = Array.isArray(expiringData?.data) ? expiringData.data : Array.isArray(expiringData) ? expiringData : [];
  const stores = Array.isArray(storesData?.data) ? storesData.data : Array.isArray(storesData) ? storesData : [];

  // Calculate metrics
  const totalDrugs = allDrugsData?.meta?.total || allDrugs.length;
  const lowStockCount = lowStockItems.length;
  const expiringCount = expiringBatches.length;
  const totalStores = stores.length;

  // Format helpers
  const fmtDate = (iso) => !iso ? '—' : new Date(iso).toLocaleDateString('en-KE', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });

  if (lowStockLoading || expiringLoading || storesLoading || allDrugsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading pharmacy data...</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pharmacy Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time inventory & dispensing overview</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Drugs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
              <Package size={17} />
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
              Inventory
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Drugs</p>
            <p className="text-xl font-black leading-tight text-slate-900">{totalDrugs}</p>
            <p className="text-[10px] text-slate-400 mt-1">Across all stores</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={`rounded-3xl border ${lowStockCount > 0 ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'} bg-white p-5 shadow-sm flex flex-col gap-3`}>
          <div className="flex items-center justify-between">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
              <AlertTriangle size={17} />
            </div>
            {lowStockCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600">
                Action Needed
              </span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Low Stock Alerts</p>
            <p className={`text-xl font-black leading-tight ${lowStockCount > 0 ? 'text-red-700' : 'text-slate-900'}`}>
              {lowStockCount}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Drugs below minimum level</p>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className={`rounded-3xl border ${expiringCount > 0 ? 'border-orange-200 ring-1 ring-orange-100' : 'border-slate-200'} bg-white p-5 shadow-sm flex flex-col gap-3`}>
          <div className="flex items-center justify-between">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <Clock size={17} />
            </div>
            {expiringCount > 0 && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-orange-600">
                Review Soon
              </span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Expiring Soon</p>
            <p className={`text-xl font-black leading-tight ${expiringCount > 0 ? 'text-orange-700' : 'text-slate-900'}`}>
              {expiringCount}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Next 30 days</p>
          </div>
        </div>

        {/* Active Stores */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Building2 size={17} />
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
              Locations
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Active Stores</p>
            <p className="text-xl font-black leading-tight text-slate-900">{totalStores}</p>
            <p className="text-[10px] text-slate-400 mt-1">Pharmacy locations</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts Table */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-slate-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Low Stock Alerts</h2>
              </div>
              {lowStockCount > 0 && (
                <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-cyan-600 hover:bg-cyan-50 transition-colors">
                  View All <ChevronRight size={10} />
                </button>
              )}
            </div>
          </div>
          
          {lowStockCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Package size={28} className="mb-2 opacity-20" />
              <p className="text-sm font-semibold">All stock levels adequate</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50">
                    {['Drug Name', 'Current Stock', 'Min Level', 'Store'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-slate-900 leading-tight">
                          {item.drug?.name || 'Unknown'}
                        </p>
                        {item.drug?.genericName && (
                          <p className="text-[9px] text-slate-400">{item.drug.genericName}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-black text-red-700">{item.currentStock}</span>
                        <span className="text-[9px] text-slate-400 ml-1">{item.unit || 'units'}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{item.minimumStockLevel}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                          {item.store?.name || 'Main'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expiring Soon Table */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ThermometerSnowflake size={14} className="text-slate-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Expiring Soon</h2>
              </div>
              {expiringCount > 0 && (
                <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-cyan-600 hover:bg-cyan-50 transition-colors">
                  View All <ChevronRight size={10} />
                </button>
              )}
            </div>
          </div>
          
          {expiringCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Activity size={28} className="mb-2 opacity-20" />
              <p className="text-sm font-semibold">No drugs expiring soon</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50">
                    {['Drug Name', 'Batch Number', 'Expiry Date', 'Quantity'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {expiringBatches.slice(0, 5).map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-slate-900 leading-tight">
                          {batch.drug?.name || 'Unknown'}
                        </p>
                        {batch.drug?.strength && (
                          <p className="text-[9px] text-slate-400">{batch.drug.strength}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] font-semibold text-slate-700">
                          {batch.batchNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-black text-orange-700">
                          {fmtDate(batch.expiryDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-slate-900">
                          {batch.quantity} {batch.unit || 'units'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PharmacyDashboard;
