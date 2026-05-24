import { useState } from 'react';
import { useHolds, useApproveHold, useRejectHold, useReleaseHold } from '../hooks/useCreditControl';
import { HoldStatusBadge, DataTable, SearchInput, FilterSelect } from '../components/CreditControlComponents';
import { Loader2, AlertCircle, Shield, CheckCircle, X } from 'lucide-react';
import { HOLD_STATUSES } from '../utils/creditControlConstants';

export default function CreditHoldsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHold, setSelectedHold] = useState(null);
  const [showActionModal, setShowActionModal] = useState(null); // 'approve', 'reject', 'release'

  const { data: holdsData, isLoading, error } = useHolds({ status: statusFilter, search: searchTerm });
  
  const approveMutation = useApproveHold();
  const rejectMutation = useRejectHold();
  const releaseMutation = useReleaseHold();

  const columns = [
    {
      header: 'Case',
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.caseNumber}</p>
          <p className="text-xs text-slate-500">{row.creditAccountName}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <HoldStatusBadge status={row.status} />,
    },
    {
      header: 'Reason',
      cell: (row) => (
        <p className="max-w-md truncate text-sm text-slate-600">{row.reason}</p>
      ),
    },
    {
      header: 'Recommended',
      cell: (row) => (
        <span className="text-sm text-slate-700">
          {new Date(row.recommendedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'RECOMMENDED' && (
            <>
              <button
                onClick={() => {
                  setSelectedHold(row);
                  setShowActionModal('approve');
                }}
                className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                title="Approve Hold"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedHold(row);
                  setShowActionModal('reject');
                }}
                className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                title="Reject Hold"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
          {row.status === 'ACTIVE' && (
            <button
              onClick={() => {
                setSelectedHold(row);
                setShowActionModal('release');
              }}
              className="rounded-lg p-1.5 text-cyan-600 hover:bg-cyan-50"
              title="Release Hold"
            >
              <Shield className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleAction = () => {
    if (!selectedHold) return;

    if (showActionModal === 'approve') {
      approveMutation.mutate(selectedHold.id, {
        onSuccess: () => {
          setShowActionModal(null);
          setSelectedHold(null);
        },
      });
    } else if (showActionModal === 'reject') {
      rejectMutation.mutate({ id: selectedHold.id, data: { reason: 'Reviewed and not approved' } }, {
        onSuccess: () => {
          setShowActionModal(null);
          setSelectedHold(null);
        },
      });
    } else if (showActionModal === 'release') {
      releaseMutation.mutate({ id: selectedHold.id, data: { reason: 'Hold released after payment or review' } }, {
        onSuccess: () => {
          setShowActionModal(null);
          setSelectedHold(null);
        },
      });
    }
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-rose-600" />
          <div>
            <h3 className="font-semibold text-rose-800">Error Loading Holds</h3>
            <p className="text-sm text-rose-600">Unable to load credit holds.</p>
          </div>
        </div>
      </div>
    );
  }

  const getModalTitle = () => {
    switch (showActionModal) {
      case 'approve': return 'Approve Credit Hold';
      case 'reject': return 'Reject Credit Hold';
      case 'release': return 'Release Credit Hold';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Credit Holds</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review and manage credit hold recommendations and active holds
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <div className="sm:col-span-2">
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
          options={Object.entries(HOLD_STATUSES).map(([key, value]) => ({
            value,
            label: key.replace(/_/g, ' '),
          }))}
        />
      </div>

      {/* Holds Table */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-700" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={holdsData?.holds || []}
          emptyMessage="No credit holds found"
        />
      )}

      {/* Action Modal */}
      {showActionModal && selectedHold && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]">
            <h3 className="text-lg font-bold text-slate-900">{getModalTitle()}</h3>
            <p className="mt-1 text-sm text-slate-600">{selectedHold.caseNumber}</p>
            
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                <span className="font-semibold">Reason:</span> {selectedHold.reason}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-semibold">Recommended:</span> {new Date(selectedHold.recommendedAt).toLocaleString()}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  setSelectedHold(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={approveMutation.isPending || rejectMutation.isPending || releaseMutation.isPending}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  showActionModal === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  showActionModal === 'reject' ? 'bg-rose-600 hover:bg-rose-700' :
                  'bg-cyan-700 hover:bg-cyan-800'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {showActionModal === 'approve' ? 'Approve' :
                 showActionModal === 'reject' ? 'Reject' :
                 'Release'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
