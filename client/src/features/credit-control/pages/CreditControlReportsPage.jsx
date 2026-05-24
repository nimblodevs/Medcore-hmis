import { useState } from 'react';
import { useAgingReport, useCollectorWorkload, usePromisesReport, useHoldsReport, useDisputesReport, useWriteOffsReport } from '../hooks/useCreditControl';
import { Loader2, AlertCircle, FileDown } from 'lucide-react';
import { getAgingBucketLabel } from '../utils/creditControlConstants';

export default function CreditControlReportsPage() {
  const [activeReport, setActiveReport] = useState('aging');
  const [dateRange, setDateRange] = useState('month');

  const { data: agingData, isLoading: agingLoading } = useAgingReport({ period: dateRange });
  const { data: workloadData, isLoading: workloadLoading } = useCollectorWorkload({ period: dateRange });
  const { data: promisesData, isLoading: promisesLoading } = usePromisesReport({ period: dateRange });
  const { data: holdsData, isLoading: holdsLoading } = useHoldsReport({ period: dateRange });
  const { data: disputesData, isLoading: disputesLoading } = useDisputesReport({ period: dateRange });
  const { data: writeOffsData, isLoading: writeOffsLoading } = useWriteOffsReport({ period: dateRange });

  const isLoading = {
    aging: agingLoading,
    workload: workloadLoading,
    promises: promisesLoading,
    holds: holdsLoading,
    disputes: disputesLoading,
    writeOffs: writeOffsLoading,
  }[activeReport];

  const reports = [
    { id: 'aging', label: 'Aging Report' },
    { id: 'workload', label: 'Collector Workload' },
    { id: 'promises', label: 'Payment Promises' },
    { id: 'holds', label: 'Credit Holds' },
    { id: 'disputes', label: 'Disputes' },
    { id: 'writeOffs', label: 'Write-Offs' },
  ];

  const handleExport = () => {
    // In production, this would trigger a CSV download
    console.log(`Exporting ${activeReport} report...`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Credit Control Reports</h1>
            <p className="mt-1 text-sm text-slate-600">
              Generate and export credit control analytics and summaries
            </p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              activeReport === report.id
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {report.label}
          </button>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-1.5 block text-sm font-semibold text-slate-800">Date Range</label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="h-10 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Report Content */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-700" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {activeReport === 'aging' && (
            <div className="p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Aging Summary Report</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {agingData?.buckets?.map((bucket) => (
                  <div key={bucket.bucket} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-center">
                    <p className="text-xs font-medium text-slate-600">{getAgingBucketLabel(bucket.bucket)}</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{bucket.count || 0}</p>
                    <p className="text-xs text-slate-500">KES {(bucket.amount || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700">By Account</h3>
                <table className="mt-2 w-full">
                  <thead className="bg-slate-50/70">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600">Account</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-600">Current</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-600">1-30 Days</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-600">31-60 Days</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-600">61-90 Days</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-600">91-120 Days</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-600">Over 120</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {agingData?.accounts?.slice(0, 10).map((account) => (
                      <tr key={account.id}>
                        <td className="px-4 py-2 text-sm text-slate-900">{account.name}</td>
                        <td className="px-4 py-2 text-right text-sm text-slate-700">{account.current?.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-sm text-slate-700">{account.days1_30?.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-sm text-slate-700">{account.days31_60?.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-sm text-slate-700">{account.days61_90?.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-sm text-slate-700">{account.days91_120?.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-sm text-slate-700">{account.over120?.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right font-semibold text-slate-900">{account.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'workload' && (
            <div className="p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Collector Workload Report</h2>
              <table className="w-full">
                <thead className="bg-slate-50/70">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600">Collector</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-600">Assigned Cases</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-600">Open Cases</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-600">Follow-Ups Due</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-600">Total Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {workloadData?.collectors?.map((collector) => (
                    <tr key={collector.id}>
                      <td className="px-4 py-2 text-sm text-slate-900">{collector.name}</td>
                      <td className="px-4 py-2 text-right text-sm text-slate-700">{collector.assignedCases}</td>
                      <td className="px-4 py-2 text-right text-sm text-slate-700">{collector.openCases}</td>
                      <td className="px-4 py-2 text-right text-sm text-slate-700">{collector.followUpsDue}</td>
                      <td className="px-4 py-2 text-right font-semibold text-slate-900">KES {(collector.totalOutstanding || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReport === 'promises' && (
            <div className="p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Payment Promises Report</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-emerald-50 p-4 text-center">
                  <p className="text-sm text-slate-600">Fulfilled</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-700">{promisesData?.fulfilled || 0}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-amber-50 p-4 text-center">
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="mt-2 text-2xl font-bold text-amber-700">{promisesData?.pending || 0}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-rose-50 p-4 text-center">
                  <p className="text-sm text-slate-600">Overdue</p>
                  <p className="mt-2 text-2xl font-bold text-rose-700">{promisesData?.overdue || 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'holds' && (
            <div className="p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Credit Holds Report</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-amber-50 p-4 text-center">
                  <p className="text-sm text-slate-600">Recommended</p>
                  <p className="mt-2 text-2xl font-bold text-amber-700">{holdsData?.recommended || 0}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-rose-50 p-4 text-center">
                  <p className="text-sm text-slate-600">Active</p>
                  <p className="mt-2 text-2xl font-bold text-rose-700">{holdsData?.active || 0}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-emerald-50 p-4 text-center">
                  <p className="text-sm text-slate-600">Released</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-700">{holdsData?.released || 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'disputes' && (
            <div className="p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Disputes Report</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-blue-50 p-4 text-center">
                  <p className="text-sm text-slate-600">Open</p>
                  <p className="mt-2 text-2xl font-bold text-blue-700">{disputesData?.open || 0}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-amber-50 p-4 text-center">
                  <p className="text-sm text-slate-600">Under Review</p>
                  <p className="mt-2 text-2xl font-bold text-amber-700">{disputesData?.underReview || 0}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-emerald-50 p-4 text-center">
                  <p className="text-sm text-slate-600">Resolved</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-700">{disputesData?.resolved || 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'writeOffs' && (
            <div className="p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Write-Offs Report</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-200 bg-amber-50 p-4 text-center">
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="mt-2 text-2xl font-bold text-amber-700">{writeOffsData?.pending || 0}</p>
                  <p className="text-xs text-slate-500">KES {(writeOffsData?.pendingAmount || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-cyan-50 p-4 text-center">
                  <p className="text-sm text-slate-600">Approved</p>
                  <p className="mt-2 text-2xl font-bold text-cyan-700">{writeOffsData?.approved || 0}</p>
                  <p className="text-xs text-slate-500">KES {(writeOffsData?.approvedAmount || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-emerald-50 p-4 text-center">
                  <p className="text-sm text-slate-600">Posted</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-700">{writeOffsData?.posted || 0}</p>
                  <p className="text-xs text-slate-500">KES {(writeOffsData?.postedAmount || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-rose-50 p-4 text-center">
                  <p className="text-sm text-slate-600">Rejected</p>
                  <p className="mt-2 text-2xl font-bold text-rose-700">{writeOffsData?.rejected || 0}</p>
                  <p className="text-xs text-slate-500">KES {(writeOffsData?.rejectedAmount || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
