import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { drugApi, drugCategoryApi } from '../services/pharmacy.api';
import { usePharmacyStore } from '../store/pharmacy.store';
import { motion } from 'motion/react';
import {
  Search, Plus, Filter, AlertTriangle, Clock, Package,
  Edit, Trash2, Pill, Tag
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsGrid, StatsCard } from '@/components/layout/StatsCard';
import { SectionCard } from '@/components/layout/SectionCard';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

/**
 * Drugs Management Page
 *
 * Displays all drugs with filtering, search, and CRUD operations
 * Following MedCore HMIS theme: rounded-2xl, slate/cyan palette, clean typography
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

  const drugs = Array.isArray(drugsData?.data) ? drugsData.data : Array.isArray(drugsData) ? drugsData : [];
  const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : Array.isArray(categoriesData) ? categoriesData : [];

  const lowStockCount = drugs.filter(d => d.currentStock <= d.minimumStockLevel).length;
  const expiringCount = drugs.filter(d => d.expiryWarning).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <PageHeader
        title="Drug Master"
        subtitle="Manage medicines, pricing, and stock levels"
        breadcrumbs={[{ label: 'Pharmacy', href: '/pharmacy' }, { label: 'Drugs' }]}
        action={
          <Button onClick={() => openModal('createDrug')}>
            <Plus size={14} className="mr-2" /> Add New Drug
          </Button>
        }
      />

      {/* Filters */}
      <SectionCard>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search by name, generic name, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory || ''} onValueChange={(v) => setSelectedCategory(v || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" variant="secondary">
            <Filter size={14} className="mr-2" /> Filter
          </Button>
        </form>
      </SectionCard>

      {/* Stats Summary */}
      <StatsGrid columns="triple">
        <StatsCard
          icon={Package}
          iconColor="cyan"
          title="Total Drugs"
          value={drugs.length.toString()}
        />
        <StatsCard
          icon={AlertTriangle}
          iconColor="rose"
          title="Low Stock"
          value={lowStockCount.toString()}
          valueColor={lowStockCount > 0 ? 'rose' : undefined}
        />
        <StatsCard
          icon={Clock}
          iconColor="amber"
          title="Expiring Soon"
          value={expiringCount.toString()}
          valueColor={expiringCount > 0 ? 'amber' : undefined}
        />
      </StatsGrid>

      {/* Drugs Table */}
      <SectionCard className="overflow-hidden">
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
                    <tr key={drug.id} className="hover:bg-cyan-50/30 transition-colors">
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
                          <Badge variant="outline" className="rounded-full">
                            <Tag size={8} className="mr-1" />
                            {drug.category.name}
                          </Badge>
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
                          <p className={`text-xs font-black ${isLowStock ? 'text-rose-700' : 'text-slate-900'}`}>
                            {drug.currentStock || 0}
                          </p>
                          <p className="text-[8px] text-slate-400">Min: {drug.minimumStockLevel}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant={isLowStock ? 'destructive' : 'default'} 
                          className="rounded-full"
                        >
                          {isLowStock && <AlertTriangle size={8} className="mr-1" />}
                          {stockStatus}
                        </Badge>
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
      </SectionCard>
    </motion.div>
  );
};

export default DrugsPage;
