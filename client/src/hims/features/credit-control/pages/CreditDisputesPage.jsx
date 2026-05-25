import { useState } from 'react';
import { useDisputes, useResolveDispute, useCancelDispute } from '../hooks/useCreditControl';
import { DisputeStatusBadge, DataTable, SearchInput, FilterSelect } from '../components/CreditControlComponents';
import { Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { DISPUTE_STATUSES } from '../utils/creditControlConstants';

export default function CreditDisputesPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showActionModal, setShowActionModal] = useState(null);

  const { data: disputesData, isLoading, error } = useDisputes({ status: statusFilter, search: searchTerm });
  
  const resolveMutation = useResolveDispute();
  const cancelMutation = useCancelDispute();

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
      cell: (row) => <DisputeStatusBadge status={row.status} />,
    },
    {
      header: 'Reason',
      cell: (row) => (
        <p className="max-w-md truncate text-sm text-slate-600">{row.disputeReason}</p>
      ),
    },
    {
      header: 'Amount',
      cell: (row) => (
        row.disputedAmount ? (
          <span className="font-semibold text-slate-900">
            KES {(row.disputedAmount || 0).toLocaleString()}
          </span>
        ) : (
          <span className="text-sm text-slate-400">-</span>
        )
      ),
    },
    {
      header: 'Opened',
      cell: (row) => (
        <span className="text-sm text-slate-700">
          {new Date(row.openedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        row.status === 'OPEN' || row.status === 'UNDER_REVIEW' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedDispute(row);
                setShowActionModal('resolve');
              }}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
              title="Resolve Dispute"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setSelectedDispute(row);
                setShowActionModal('cancel');
              }}
              className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
              title="Cancel Dispute"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="text-sm text-slate-400">-</span>
        )
      ),
    },
  ];

  const handleAction = () => {
    if (!selectedDispute) return;

    if (showActionModal === 'resolve') {
      resolveMutation.mutate(
        { id: selectedDispute.id, data: { resolutionNotes: 'Dispute resolved', status: 'RESOLVED' } },
        {
          onSuccess: () => {
            setShowActionModal(null);
            setSelectedDispute(null);
          },
        }
      );
    } else if (showActionModal === 'cancel') {
      cancelMutation.mutate(selectedDispute.id, {
        onSuccess: () => {
          setShowActionModal(null);
          setSelectedDispute(null);
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
            <h3 className="font-semibold text-rose-800">Error Loading Disputes</h3>
            <p className="text-sm text-rose-600">Unable to load credit disputes.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Credit Disputes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track and resolve invoice disputes from credit accounts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <div className="sm:col-span-2">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by case number or reason..."
          />
        </div>
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Statuses"
          options={Object.entries(DISPUTE_STATUSES).map(([key, value]) => ({
            value,
            label: key.replace(/_/g, ' '),
          }))}
        />
      </div>

      {/* Disputes Table */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-700" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={disputesData?.disputes || []}
          emptyMessage="No disputes found"
        />
      )}

      {/* Action Modal */}
      {showActionModal && selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]">
            <h3 className="text-lg font-bold text-slate-900">
              {showActionModal === 'resolve' ? 'Resolve Dispute' : 'Cancel Dispute'}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{selectedDispute.caseNumber}</p>
            
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Reason:</span> {selectedDispute.disputeReason}
                </p>
                {selectedDispute.disputedAmount && (
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-semibold">Amount:</span> KES {(selectedDispute.disputedAmount || 0).toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Notes
                </label>
                <textarea
                  placeholder="Add resolution notes..."
                  rows={3}
                  className="min-h-16 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  setSelectedDispute(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={resolveMutation.isPending || cancelMutation.isPending}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  showActionModal === 'resolve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {showActionModal === 'resolve' ? 'Resolve' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
