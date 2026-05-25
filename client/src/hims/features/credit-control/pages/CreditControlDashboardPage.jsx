import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useCreditControl';
import { StatCard, CaseStatusBadge, RiskLevelBadge, AgingBucketBadge } from '../components/CreditControlComponents';
import { Loader2, AlertCircle, Clock, CheckCircle, TrendingUp, Users, FileText, Shield } from 'lucide-react';

export default function CreditControlDashboardPage() {
  const { data: dashboard, isLoading, error } = useDashboard();
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-rose-600" />
          <div>
            <h3 className="font-semibold text-rose-800">Error Loading Dashboard</h3>
            <p className="text-sm text-rose-600">Unable to load credit control dashboard data.</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Credit Control Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Monitor overdue accounts, collection cases, and credit risk across the hospital
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Outstanding"
          value={`KES ${stats.totalOutstanding?.toLocaleString() || '0'}`}
          subtitle="Across all credit accounts"
          icon={<FileText className="h-6 w-6 text-cyan-700" />}
        />
        <StatCard
          title="Overdue Amount"
          value={`KES ${stats.overdueAmount?.toLocaleString() || '0'}`}
          subtitle="Past due invoices"
          icon={<AlertCircle className="h-6 w-6 text-rose-600" />}
        />
        <StatCard
          title="Active Cases"
          value={stats.activeCases || 0}
          subtitle="Open collection cases"
          icon={<Users className="h-6 w-6 text-cyan-700" />}
        />
        <StatCard
          title="Credit Holds"
          value={stats.activeHolds || 0}
          subtitle="Accounts on hold"
          icon={<Shield className="h-6 w-6 text-amber-600" />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Due Today"
          value={stats.followUpsDueToday || 0}
          subtitle="Follow-ups scheduled"
          icon={<Clock className="h-6 w-6 text-cyan-700" />}
        />
        <StatCard
          title="Overdue Promises"
          value={stats.overduePromises || 0}
          subtitle="Unfulfilled payment promises"
          icon={<TrendingUp className="h-6 w-6 text-amber-600" />}
        />
        <StatCard
          title="High Risk Accounts"
          value={stats.highRiskAccounts || 0}
          subtitle="Critical or high risk level"
          icon={<AlertCircle className="h-6 w-6 text-rose-600" />}
        />
        <StatCard
          title="My Cases"
          value={stats.myCases || 0}
          subtitle="Assigned to you"
          icon={<CheckCircle className="h-6 w-6 text-emerald-600" />}
        />
      </div>

      {/* Aging Summary */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-slate-700">Aging Summary</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {dashboard?.agingSummary?.map((bucket) => (
              <div
                key={bucket.bucket}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-center"
              >
                <p className="text-xs font-medium text-slate-600">{bucket.label}</p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {bucket.count || 0}
                </p>
                <p className="text-xs text-slate-500">
                  KES {(bucket.amount || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-slate-700">Recent Cases</h2>
          <Link
            to="/credit-control/cases"
            className="text-sm font-semibold text-cyan-700 hover:text-cyan-800"
          >
            View All →
          </Link>
        </div>
        <div className="divide-y divide-slate-200">
          {dashboard?.recentCases?.length > 0 ? (
            dashboard.recentCases.slice(0, 5).map((case_) => (
              <Link
                key={case_.id}
                to={`/credit-control/cases/${case_.id}`}
                className="flex items-center justify-between p-4 hover:bg-cyan-50/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100">
                    <span className="text-sm font-bold text-cyan-700">
                      {case_.caseNumber?.slice(-2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{case_.caseNumber}</p>
                    <p className="text-sm text-slate-500">{case_.creditAccountName || 'Credit Account'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CaseStatusBadge status={case_.status} />
                  <RiskLevelBadge riskLevel={case_.riskLevel} />
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">No recent cases</div>
          )}
        </div>
      </div>

      {/* Action Required */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Follow-ups Due */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-700">Follow-Ups Due Today</h2>
            <Link
              to="/credit-control/follow-ups"
              className="text-sm font-semibold text-cyan-700 hover:text-cyan-800"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {dashboard?.followUpsDueToday?.length > 0 ? (
              dashboard.followUpsDueToday.slice(0, 5).map((followUp) => (
                <div key={followUp.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{followUp.caseNumber}</p>
                      <p className="text-sm text-slate-500">{followUp.actionType}</p>
                    </div>
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">No follow-ups due today</div>
            )}
          </div>
        </div>

        {/* Pending Holds */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-700">Pending Credit Holds</h2>
            <Link
              to="/credit-control/holds"
              className="text-sm font-semibold text-cyan-700 hover:text-cyan-800"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {dashboard?.pendingHolds?.length > 0 ? (
              dashboard.pendingHolds.slice(0, 5).map((hold) => (
                <div key={hold.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{hold.caseNumber}</p>
                      <p className="text-sm text-slate-500">{hold.reason}</p>
                    </div>
                    <Shield className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">No pending holds</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
