import { useQuery } from '@tanstack/react-query';
import { drugApi, storeApi, batchApi } from '../services/pharmacy.api';
import { motion } from 'motion/react';
import { 
  AlertTriangle, Package, Clock, 
  Building2, ChevronRight,
  Activity, ThermometerSnowflake
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsGrid, StatsCard } from '@/components/layout/StatsCard';
import { SectionCard, SectionGrid } from '@/components/layout/SectionCard';

/**
 * Pharmacy Dashboard Component
 * 
 * Displays key metrics and alerts for pharmacy operations
 * Following MedCore HMIS theme: rounded-2xl, slate/cyan palette, clean typography
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
      className="space-y-6"
    >
      {/* Header */}
      <PageHeader
        title="Pharmacy Dashboard"
        subtitle="Real-time inventory & dispensing overview"
        breadcrumbs={[{ label: 'Pharmacy', href: '/pharmacy' }, { label: 'Dashboard' }]}
      />

      {/* Metrics Cards */}
      <StatsGrid columns="quad">
        <StatsCard
          icon={Package}
          iconColor="cyan"
          title="Total Drugs"
          value={totalDrugs.toString()}
          note="Across all stores"
          badge={{ label: 'Inventory', variant: 'slate' }}
        />
        <StatsCard
          icon={AlertTriangle}
          iconColor="rose"
          title="Low Stock Alerts"
          value={lowStockCount.toString()}
          note="Drugs below minimum level"
          badge={lowStockCount > 0 ? { label: 'Action Needed', variant: 'rose' } : undefined}
          valueColor={lowStockCount > 0 ? 'rose' : undefined}
        />
        <StatsCard
          icon={Clock}
          iconColor="amber"
          title="Expiring Soon"
          value={expiringCount.toString()}
          note="Next 30 days"
          badge={expiringCount > 0 ? { label: 'Review Soon', variant: 'amber' } : undefined}
          valueColor={expiringCount > 0 ? 'amber' : undefined}
        />
        <StatsCard
          icon={Building2}
          iconColor="blue"
          title="Active Stores"
          value={totalStores.toString()}
          note="Pharmacy locations"
          badge={{ label: 'Locations', variant: 'slate' }}
        />
      </StatsGrid>

      {/* Two Column Layout */}
      <SectionGrid columns="dual">
        {/* Low Stock Alerts Table */}
        <SectionCard
          title="Low Stock Alerts"
          icon={AlertTriangle}
          headerAction={lowStockCount > 0 ? (
            <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-cyan-600 hover:bg-cyan-50 transition-colors">
              View All <ChevronRight size={10} />
            </button>
          ) : null}
        >
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
                    <tr key={item.id} className="hover:bg-cyan-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-slate-900 leading-tight">
                          {item.drug?.name || 'Unknown'}
                        </p>
                        {item.drug?.genericName && (
                          <p className="text-[9px] text-slate-400">{item.drug.genericName}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-black text-rose-700">{item.currentStock}</span>
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
        </SectionCard>

        {/* Expiring Soon Table */}
        <SectionCard
          title="Expiring Soon"
          icon={ThermometerSnowflake}
          headerAction={expiringCount > 0 ? (
            <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-cyan-600 hover:bg-cyan-50 transition-colors">
              View All <ChevronRight size={10} />
            </button>
          ) : null}
        >
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
                    <tr key={batch.id} className="hover:bg-cyan-50/30 transition-colors">
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
                        <span className="text-xs font-black text-amber-700">
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
        </SectionCard>
      </SectionGrid>
    </motion.div>
  );
};

export default PharmacyDashboard;
