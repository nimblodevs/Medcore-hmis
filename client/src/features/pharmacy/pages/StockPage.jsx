import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { storeApi, batchApi } from '../services/pharmacy.api';
import { Package, AlertTriangle, Clock, TrendingUp, Box } from 'lucide-react';

/**
 * Stock Management Page
 * 
 * Displays current stock levels across all stores with FEFO batch information
 */
const StockPage = () => {
  // Fetch all stores
  const { data: storesData, isLoading: storesLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storeApi.getAll().then(res => res.data),
  });
  
  // Fetch all batches
  const { data: batchesData, isLoading: batchesLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchApi.getAll().then(res => res.data),
  });
  
  if (storesLoading || batchesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Package className="size-12 text-cyan-600 mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-semibold text-slate-600">Loading stock data...</p>
        </div>
      </div>
    );
  }
  
  const stores = Array.isArray(storesData?.data) ? storesData.data : Array.isArray(storesData) ? storesData : [];
  const batches = Array.isArray(batchesData?.data) ? batchesData.data : Array.isArray(batchesData) ? batchesData : [];
  
  // Group batches by store
  const stockByStore = stores.map((store) => ({
    store,
    batches: batches.filter((b) => b.storeId === store.id),
    totalItems: batches.filter((b) => b.storeId === store.id).length,
    totalQuantity: batches
      .filter((b) => b.storeId === store.id)
      .reduce((sum, b) => sum + b.quantity, 0),
    lowStockCount: batches
      .filter((b) => b.storeId === store.id && b.quantity <= (b.drug?.minimumStockLevel || 10))
      .length,
    expiringCount: batches
      .filter((b) => {
        const expiryDate = new Date(b.expiryDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
      })
      .filter((b) => b.storeId === store.id).length,
  }));

  const totalStockValue = batches.reduce((sum, b) => sum + (b.unitPrice * b.quantity), 0);
  const expiringSoonCount = batches.filter((b) => {
    const expiryDate = new Date(b.expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
  }).length;
  const expiredCount = batches.filter((b) => new Date(b.expiryDate) < new Date()).length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Stock Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Monitor inventory levels, batch expiry, and stock movements across all stores
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
          <Box className="size-5 text-cyan-600 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-700">Total Items</p>
            <p className="text-lg font-black text-cyan-900">{batches.length}</p>
          </div>
        </div>
      </div>

      {/* Store Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stockByStore.map(({ store, totalItems, totalQuantity, lowStockCount, expiringCount }, idx) => (
          <motion.div
            key={store.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <Package size={15} className="text-cyan-600" />
              <p className="text-sm font-bold text-slate-800">{store.name}</p>
            </div>
            <div className="p-4">
              <p className="text-2xl font-black text-slate-900">{totalQuantity.toLocaleString()}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                  {totalItems} items
                </span>
                {lowStockCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-700">
                    <AlertTriangle className="size-2.5" />
                    {lowStockCount} low
                  </span>
                )}
                {expiringCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                    <Clock className="size-2.5" />
                    {expiringCount} expiring
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stock Tables by Store */}
      {stockByStore.map(({ store, batches: storeBatches }) => (
        <motion.div
          key={store.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
            <Package size={15} className="text-cyan-600" />
            <p className="text-sm font-bold text-slate-800">{store.name} - Current Stock</p>
          </div>
          <div className="p-4">
            {storeBatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 rounded-full bg-slate-100 p-3">
                  <Package className="size-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-900">No stock available</p>
                <p className="text-xs text-slate-500 mt-1">Stock items will appear here once received</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Drug Name</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Batch Number</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Expiry Date</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Quantity</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Unit Price</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Value</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeBatches
                      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
                      .map((batch) => {
                        const isExpired = new Date(batch.expiryDate) < new Date();
                        const isExpiringSoon = (() => {
                          const expiryDate = new Date(batch.expiryDate);
                          const thirtyDaysFromNow = new Date();
                          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                          return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
                        })();
                        const isLowStock = batch.quantity <= (batch.drug?.minimumStockLevel || 10);

                        return (
                          <tr key={batch.id} className="border-b border-slate-100 last:border-0 hover:bg-cyan-50/40 transition-colors">
                            <td className="px-4 py-3 text-sm font-bold text-slate-900">{batch.drug?.name}</td>
                            <td className="px-4 py-3 text-[11px] font-mono text-slate-600">{batch.batchNumber}</td>
                            <td className={`px-4 py-3 text-[11px] font-semibold ${isExpired ? 'text-rose-600' : isExpiringSoon ? 'text-amber-600' : 'text-slate-600'}`}>
                              {new Date(batch.expiryDate).toLocaleDateString()}
                            </td>
                            <td className={`px-4 py-3 text-sm font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                              {batch.quantity} <span className="text-[10px] font-medium text-slate-500">{batch.drug?.unit}</span>
                            </td>
                            <td className="px-4 py-3 text-[11px] font-medium text-slate-600">KES {batch.unitPrice?.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm font-bold text-slate-900">
                              KES {(batch.unitPrice * batch.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3">
                              {isExpired ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-700">
                                  Expired
                                </span>
                              ) : isExpiringSoon ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                                  <Clock className="size-2.5" />
                                  Expiring Soon
                                </span>
                              ) : isLowStock ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-700">
                                  <AlertTriangle className="size-2.5" />
                                  Low Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                                  OK
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <TrendingUp className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Stock Value</p>
              <p className="text-xl font-black text-slate-900">
                KES {totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Package className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Batches</p>
              <p className="text-xl font-black text-slate-900">{batches.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Expiring Soon</p>
              <p className="text-xl font-black text-amber-600">{expiringSoonCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5 text-rose-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Expired Batches</p>
              <p className="text-xl font-black text-rose-600">{expiredCount}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StockPage;
