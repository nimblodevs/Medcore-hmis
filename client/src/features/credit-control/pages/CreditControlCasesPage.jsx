import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCases, useCreateCase, useAssignCase, useCloseCase } from '../hooks/useCreditControl';
import { CaseStatusBadge, RiskLevelBadge, AgingBucketBadge, DataTable, SearchInput, FilterSelect } from '../components/CreditControlComponents';
import { Loader2, AlertCircle, Plus, User, CheckCircle, X } from 'lucide-react';
import { CASE_STATUSES, RISK_LEVELS, AGING_BUCKETS } from '../utils/creditControlConstants';

export default function CreditControlCasesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [collectorFilter, setCollectorFilter] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [assignData, setAssignData] = useState({ collectorId: '' });
  const [closeData, setCloseData] = useState({ reason: '' });

  const { data: casesData, isLoading, error } = useCases({
    search: searchTerm,
    status: statusFilter,
    riskLevel: riskFilter,
    assignedCollectorId: collectorFilter,
  });

  const createCaseMutation = useCreateCase();
  const assignCaseMutation = useAssignCase();
  const closeCaseMutation = useCloseCase();

  const columns = [
    {
      header: 'Case Number',
      cell: (row) => (
        <Link
          to={`/credit-control/cases/${row.id}`}
          className="font-semibold text-cyan-700 hover:text-cyan-800"
        >
          {row.caseNumber}
        </Link>
      ),
    },
    {
      header: 'Account',
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.creditAccountName || 'N/A'}</p>
          <p className="text-xs text-slate-500">{row.creditAccountId}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <CaseStatusBadge status={row.status} />,
    },
    {
      header: 'Risk Level',
      cell: (row) => <RiskLevelBadge riskLevel={row.riskLevel} />,
    },
    {
      header: 'Aging',
      cell: (row) => <AgingBucketBadge bucket={row.agingBucket} />,
    },
    {
      header: 'Outstanding',
      cell: (row) => (
        <span className="font-semibold text-slate-900">
          KES {(row.outstandingAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Overdue',
      cell: (row) => (
        <span className="font-semibold text-rose-600">
          KES {(row.overdueAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Days Overdue',
      cell: (row) => (
        <span className={row.daysOverdue > 90 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
          {row.daysOverdue} days
        </span>
      ),
    },
    {
      header: 'Assigned To',
      cell: (row) => (
        row.assignedCollectorId ? (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-700">Collector</span>
          </div>
        ) : (
          <span className="text-sm text-slate-400">Unassigned</span>
        )
      ),
    },
  ];

  const handleCreateCase = () => {
    // In production, this would open a modal or navigate to a create form
    navigate('/credit-control/cases/new');
  };

  const handleAssignCase = () => {
    if (!selectedCase || !assignData.collectorId) return;
    
    assignCaseMutation.mutate(
      { id: selectedCase.id, data: assignData },
      {
        onSuccess: () => {
          setShowAssignModal(false);
          setSelectedCase(null);
          setAssignData({ collectorId: '' });
        },
      }
    );
  };

  const handleCloseCase = () => {
    if (!selectedCase || !closeData.reason) return;
    
    closeCaseMutation.mutate(
      { id: selectedCase.id, data: closeData },
      {
        onSuccess: () => {
          setShowCloseModal(false);
          setSelectedCase(null);
          setCloseData({ reason: '' });
        },
      }
    );
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-rose-600" />
          <div>
            <h3 className="font-semibold text-rose-800">Error Loading Cases</h3>
            <p className="text-sm text-rose-600">Unable to load credit control cases.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Credit Control Cases</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage collection cases, assign collectors, and track follow-ups
            </p>
          </div>
          <button
            onClick={handleCreateCase}
            disabled={createCaseMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-800 active:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            New Case
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by case number or account..."
          />
        </div>
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Statuses"
          options={Object.entries(CASE_STATUSES).map(([key, value]) => ({
            value,
            label: key.replace(/_/g, ' '),
          }))}
        />
        <FilterSelect
          value={riskFilter}
          onChange={setRiskFilter}
          placeholder="All Risk Levels"
          options={Object.entries(RISK_LEVELS).map(([key, value]) => ({
            value,
            label: key,
          }))}
        />
        <FilterSelect
          value={collectorFilter}
          onChange={setCollectorFilter}
          placeholder="All Collectors"
          options={[
            { value: 'unassigned', label: 'Unassigned' },
            { value: 'assigned', label: 'Assigned' },
          ]}
        />
      </div>

      {/* Cases Table */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-700" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={casesData?.cases || []}
          onRowClick={(row) => navigate(`/credit-control/cases/${row.id}`)}
          emptyMessage="No cases found matching your filters"
        />
      )}

      {/* Quick Actions for Selected Case */}
      {selectedCase && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">{selectedCase.caseNumber}</p>
              <p className="text-sm text-slate-500">{selectedCase.creditAccountName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <User className="h-4 w-4" />
                Assign
              </button>
              <button
                onClick={() => setShowCloseModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
              >
                <CheckCircle className="h-4 w-4" />
                Close Case
              </button>
              <button
                onClick={() => setSelectedCase(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]">
            <h3 className="text-lg font-bold text-slate-900">Assign Collector</h3>
            <p className="mt-1 text-sm text-slate-600">{selectedCase?.caseNumber}</p>
            
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                Select Collector
              </label>
              <select
                value={assignData.collectorId}
                onChange={(e) => setAssignData({ collectorId: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
              >
                <option value="">Choose a collector...</option>
                <option value="collector1">John Doe</option>
                <option value="collector2">Jane Smith</option>
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedCase(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignCase}
                disabled={assignCaseMutation.isPending || !assignData.collectorId}
                className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assignCaseMutation.isPending ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]">
            <h3 className="text-lg font-bold text-slate-900">Close Case</h3>
            <p className="mt-1 text-sm text-slate-600">{selectedCase?.caseNumber}</p>
            
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                Closure Reason <span className="text-rose-600">*</span>
              </label>
              <textarea
                value={closeData.reason}
                onChange={(e) => setCloseData({ reason: e.target.value })}
                placeholder="Explain why this case is being closed..."
                rows={4}
                className="min-h-16 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  setSelectedCase(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseCase}
                disabled={closeCaseMutation.isPending || !closeData.reason}
                className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {closeCaseMutation.isPending ? 'Closing...' : 'Close Case'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
