import { useState } from 'react';
import { useWriteOffs, useApproveWriteOff, useRejectWriteOff, usePostWriteOff } from '../hooks/useCreditControl';
import { WriteOffStatusBadge, DataTable, SearchInput, FilterSelect } from '../components/CreditControlComponents';
import { Loader2, AlertCircle, CheckCircle, X, FileCheck } from 'lucide-react';
import { WRITE_OFF_STATUSES } from '../utils/creditControlConstants';

export default function WriteOffRecommendationsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWriteOff, setSelectedWriteOff] = useState(null);
  const [showActionModal, setShowActionModal] = useState(null);

  const { data: writeOffsData, isLoading, error } = useWriteOffs({ status: statusFilter, search: searchTerm });
  
  const approveMutation = useApproveWriteOff();
  const rejectMutation = useRejectWriteOff();
  const postMutation = usePostWriteOff();

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
      cell: (row) => <WriteOffStatusBadge status={row.status} />,
    },
    {
      header: 'Amount',
      cell: (row) => (
        <span className="font-semibold text-slate-900">
          KES {(row.amount || 0).toLocaleString()}
        </span>
      ),
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
          {row.status === 'PENDING' && (
            <>
              <button
                onClick={() => {
                  setSelectedWriteOff(row);
                  setShowActionModal('approve');
                }}
                className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                title="Approve Write-Off"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedWriteOff(row);
                  setShowActionModal('reject');
                }}
                className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                title="Reject Write-Off"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
          {row.status === 'APPROVED' && (
            <button
              onClick={() => {
                setSelectedWriteOff(row);
                setShowActionModal('post');
              }}
              className="rounded-lg p-1.5 text-cyan-600 hover:bg-cyan-50"
              title="Post Write-Off"
            >
              <FileCheck className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleAction = () => {
    if (!selectedWriteOff) return;

    if (showActionModal === 'approve') {
      approveMutation.mutate(selectedWriteOff.id, {
        onSuccess: () => {
          setShowActionModal(null);
          setSelectedWriteOff(null);
        },
      });
    } else if (showActionModal === 'reject') {
      rejectMutation.mutate({ id: selectedWriteOff.id, data: { reason: 'Reviewed and not approved' } }, {
        onSuccess: () => {
          setShowActionModal(null);
          setSelectedWriteOff(null);
        },
      });
    } else if (showActionModal === 'post') {
      postMutation.mutate(selectedWriteOff.id, {
        onSuccess: () => {
          setShowActionModal(null);
          setSelectedWriteOff(null);
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
            <h3 className="font-semibold text-rose-800">Error Loading Write-Offs</h3>
            <p className="text-sm text-rose-600">Unable to load write-off recommendations.</p>
          </div>
        </div>
      </div>
    );
  }

  const getModalTitle = () => {
    switch (showActionModal) {
      case 'approve': return 'Approve Write-Off';
      case 'reject': return 'Reject Write-Off';
      case 'post': return 'Post Write-Off to Adjustments';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Write-Off Recommendations</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review and manage bad debt write-off recommendations
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
          options={Object.entries(WRITE_OFF_STATUSES).map(([key, value]) => ({
            value,
            label: key.replace(/_/g, ' '),
          }))}
        />
      </div>

      {/* Write-Offs Table */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-700" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={writeOffsData?.writeOffs || []}
          emptyMessage="No write-off recommendations found"
        />
      )}

      {/* Action Modal */}
      {showActionModal && selectedWriteOff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]">
            <h3 className="text-lg font-bold text-slate-900">{getModalTitle()}</h3>
            <p className="mt-1 text-sm text-slate-600">{selectedWriteOff.caseNumber}</p>
            
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-lg font-bold text-slate-900">
                  KES {(selectedWriteOff.amount || 0).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-semibold">Reason:</span> {selectedWriteOff.reason}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-semibold">Recommended:</span> {new Date(selectedWriteOff.recommendedAt).toLocaleString()}
                </p>
              </div>

              {showActionModal === 'reject' && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                    Rejection Reason
                  </label>
                  <textarea
                    placeholder="Explain why this write-off is being rejected..."
                    rows={3}
                    className="min-h-16 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
                  />
                </div>
              )}

              {showActionModal === 'post' && (
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Posting this write-off will create an adjustment in the Credit/Invoice module and cannot be undone.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  setSelectedWriteOff(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={approveMutation.isPending || rejectMutation.isPending || postMutation.isPending}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  showActionModal === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  showActionModal === 'reject' ? 'bg-rose-600 hover:bg-rose-700' :
                  'bg-cyan-700 hover:bg-cyan-800'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {showActionModal === 'approve' ? 'Approve' :
                 showActionModal === 'reject' ? 'Reject' :
                 'Post Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
