import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { drugApi, drugCategoryApi, storeApi } from '../services/pharmacy.api';
import { usePharmacyStore } from '../store/pharmacy.store';
import { motion } from 'motion/react';
import {
  Search, Plus, Filter, AlertTriangle, Clock, Package,
  Edit, Trash2, ChevronRight, Pill, Tag, TrendingUp
} from 'lucide-react';

/**
 * Drugs Management Page
 *
 * Displays all drugs with filtering, search, and CRUD operations
 * Following MedCore HMIS theme: rounded-3xl, shadow-sm, clean typography
 */
const DrugsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { openModal, setSelectedDrug, setDrugFilters } = usePharmacyStore();

  // Fetch drugs with filters
  const { data: drugsData, isLoading: drugsLoading, refetch } = useQuery({
    queryKey: ['drugs', { search: searchTerm, categoryId: selectedCategory }],
    queryFn: () => drugApi.getAll({ search: searchTerm, categoryId: selectedCategory }).then(res => res.data),
  });

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['drug-categories'],
    queryFn: () => drugCategoryApi.getAll().then(res => res.data),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setDrugFilters({ search: searchTerm });
    refetch();
  };

  const handleEdit = (drug) => {
    setSelectedDrug(drug);
    openModal('editDrug');
  };

  const handleDelete = async (drugId) => {
    if (window.confirm('Are you sure you want to delete this drug?')) {
      try {
        await drugApi.delete(drugId);
        refetch();
      } catch (error) {
        console.error('Failed to delete drug:', error);
      }
    }
  };

  const fmtCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (drugsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading drugs...</div>
      </div>
    );
  }

  const drugs = drugsData?.data || [];
  const categories = categoriesData?.data || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Drug Master</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage medicines, pricing, and stock levels</p>
        </div>
        <button
          onClick={() => openModal('createDrug')}
          className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-700 transition-colors"
        >
          <Plus size={14} /> Add New Drug
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, generic name, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
            />
          </div>
          
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="h-10 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            <Filter size={14} /> Filter
          </button>
        </form>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
              <Package size={17} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Drugs</p>
              <p className="text-xl font-black text-slate-900">{drugs.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
              <AlertTriangle size={17} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Low Stock</p>
              <p className="text-xl font-black text-red-700">
                {drugs.filter(d => d.currentStock <= d.minimumStockLevel).length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <Clock size={17} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expiring Soon</p>
              <p className="text-xl font-black text-orange-700">
                {drugs.filter(d => d.expiryWarning).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drugs Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[
                  { label: 'Drug Name', width: 'w-64' },
                  { label: 'Category', width: 'w-40' },
                  { label: 'Strength', width: 'w-32' },
                  { label: 'Unit', width: 'w-24' },
                  { label: 'Price (KES)', width: 'w-32' },
                  { label: 'Stock Level', width: 'w-32' },
                  { label: 'Status', width: 'w-28' },
                  { label: 'Actions', width: 'w-32' },
                ].map((col) => (
                  <th 
                    key={col.label} 
                    className={`${col.width} px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {drugs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center text-slate-400">
                      <Pill size={32} className="mb-2 opacity-20" />
                      <p className="text-sm font-semibold">No drugs found</p>
                      <p className="text-xs mt-1">Add your first drug to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                drugs.map((drug) => {
                  const isLowStock = drug.currentStock <= drug.minimumStockLevel;
                  const stockStatus = isLowStock ? 'Low Stock' : 'In Stock';
                  
                  return (
                    <tr key={drug.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-900 leading-tight">
                            {drug.name}
                          </p>
                          {drug.genericName && (
                            <p className="text-[9px] text-slate-400">{drug.genericName}</p>
                          )}
                          {drug.code && (
                            <p className="text-[8px] font-mono text-slate-400 mt-0.5">{drug.code}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {drug.category ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                            <Tag size={8} />
                            {drug.category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {drug.strength || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {drug.unit || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-slate-900">
                          {fmtCurrency(drug.sellingPrice || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className={`text-xs font-black ${isLowStock ? 'text-red-700' : 'text-slate-900'}`}>
                            {drug.currentStock || 0}
                          </p>
                          <p className="text-[8px] text-slate-400">Min: {drug.minimumStockLevel}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          isLowStock 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isLowStock && <AlertTriangle size={8} />}
                          {stockStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(drug)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(drug.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default DrugsPage;
