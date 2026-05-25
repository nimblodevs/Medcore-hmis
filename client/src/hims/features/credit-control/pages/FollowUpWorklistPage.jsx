import { useState } from 'react';
import { useDueTodayFollowUps, useOverdueFollowUps, useCreateFollowUp } from '../hooks/useCreditControl';
import { DataTable, SearchInput, FilterSelect } from '../components/CreditControlComponents';
import { Loader2, AlertCircle, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { FOLLOW_UP_ACTION_TYPES, FOLLOW_UP_OUTCOMES } from '../utils/creditControlConstants';

export default function FollowUpWorklistPage() {
  const [filter, setFilter] = useState('due-today');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  const { data: dueTodayData, isLoading: dueTodayLoading } = useDueTodayFollowUps();
  const { data: overdueData, isLoading: overdueLoading } = useOverdueFollowUps();

  const isLoading = dueTodayLoading || overdueLoading;
  const data = filter === 'due-today' ? dueTodayData?.followUps : overdueData?.followUps;

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
      header: 'Action Type',
      cell: (row) => (
        <span className="text-sm font-medium text-slate-900">{row.actionType}</span>
      ),
    },
    {
      header: 'Outcome',
      cell: (row) => (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {row.outcome}
        </span>
      ),
    },
    {
      header: 'Contact',
      cell: (row) => (
        row.contactPerson ? (
          <div>
            <p className="text-sm text-slate-900">{row.contactPerson}</p>
            {row.contactPhone && <p className="text-xs text-slate-500">{row.contactPhone}</p>}
          </div>
        ) : (
          <span className="text-sm text-slate-400">-</span>
        )
      ),
    },
    {
      header: 'Due Date',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Clock className={`h-4 w-4 ${filter === 'overdue' ? 'text-rose-600' : 'text-amber-600'}`} />
          <span className={filter === 'overdue' ? 'text-rose-600 font-semibold' : 'text-slate-700'}>
            {new Date(row.nextFollowUpAt).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Notes',
      cell: (row) => (
        <p className="max-w-md truncate text-sm text-slate-600">{row.notes}</p>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Follow-Up Worklist</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage scheduled follow-ups and record collection actions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('due-today')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                filter === 'due-today'
                  ? 'bg-cyan-700 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Due Today ({dueTodayData?.followUps?.length || 0})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                filter === 'overdue'
                  ? 'bg-cyan-700 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Overdue ({overdueData?.followUps?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by case number or contact..."
        />
      </div>

      {/* Follow-Ups Table */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-700" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data || []}
          onRowClick={(row) => {
            setSelectedFollowUp(row);
            setShowRecordModal(true);
          }}
          emptyMessage={`No ${filter === 'due-today' ? 'follow-ups due today' : 'overdue follow-ups'}`}
        />
      )}

      {/* Record Follow-Up Modal */}
      {showRecordModal && selectedFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]">
            <h3 className="text-lg font-bold text-slate-900">Record Follow-Up Action</h3>
            <p className="mt-1 text-sm text-slate-600">{selectedFollowUp.caseNumber}</p>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Scheduled:</span> {selectedFollowUp.actionType}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-semibold">Contact:</span> {selectedFollowUp.contactPerson || 'N/A'}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Actual Outcome <span className="text-rose-600">*</span>
                </label>
                <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10">
                  {Object.entries(FOLLOW_UP_OUTCOMES).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Notes <span className="text-rose-600">*</span>
                </label>
                <textarea
                  placeholder="Document what happened during this follow-up..."
                  rows={4}
                  className="min-h-16 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Next Follow-Up Date
                </label>
                <input
                  type="datetime-local"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowRecordModal(false);
                  setSelectedFollowUp(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
                <MessageSquare className="h-4 w-4" />
                Record Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
