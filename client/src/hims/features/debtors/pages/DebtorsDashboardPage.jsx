import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { debtorsApi } from '../api/debtors.api';
import { debtorKeys } from '../hooks/useDebtors';
import { formatKES, getDebtorTypeLabel, getDebtorStatusLabel, getStatusStyle } from '../utils/debtor.utils';

export default function DebtorsDashboardPage() {
  const [filters] = useState({});

  // Fetch summary data
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: [...debtorKeys.reports.all, 'summary', filters],
    queryFn: () => debtorsApi.getSummaryReport(filters)
  });

  // Fetch outstanding by type
  const { data: byTypeData, isLoading: typeLoading } = useQuery({
    queryKey: [...debtorKeys.reports.all, 'by-type'],
    queryFn: () => debtorsApi.getByTypeReport()
  });

  // Fetch credit limits report
  const { data: creditLimitsData, isLoading: creditLoading } = useQuery({
    queryKey: [...debtorKeys.reports.all, 'credit-limits'],
    queryFn: () => debtorsApi.getCreditLimitsReport()
  });

  // Fetch accounts over limit
  const { data: overLimitData } = useQuery({
    queryKey: [...debtorKeys.reports.all, 'over-limit'],
    queryFn: () => debtorsApi.getOutstandingReport({ minOutstanding: 0 })
  });

  if (summaryLoading || typeLoading || creditLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const summary = summaryData?.data || {};
  const byType = byTypeData?.data || [];
  const creditLimits = creditLimitsData?.data || [];
  const overLimitAccounts = (overLimitData?.data || []).filter(a => a.utilizationPercentage > 100).slice(0, 5);

  const highRiskAccounts = creditLimits.filter(a => a.riskLevel === 'HIGH').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Debtors Dashboard</h1>
        <Link
          to="/debtors/accounts"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          View All Accounts
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Debtors</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{summary.totalAccounts || 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Outstanding</div>
          <div className="mt-2 text-3xl font-bold text-red-600">{formatKES(summary.totalOutstanding || 0)}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Credit Limit</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{formatKES(summary.totalCreditLimit || 0)}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Available Credit</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">{formatKES(summary.totalAvailableCredit || 0)}</div>
        </div>
      </div>

      {/* Outstanding by Type */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Outstanding by Debtor Type</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accounts</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Limit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {byType.map((type) => (
                <tr key={type.debtorType}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getDebtorTypeLabel(type.debtorType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{type.accountCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">{formatKES(type.totalOutstanding)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">{formatKES(type.totalCreditLimit)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{type.utilizationPercentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* High Risk Accounts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">High Risk Accounts (&gt;90% Utilization)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Limit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {highRiskAccounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <Link to={`/debtors/accounts/${account.id}`}>{account.debtorCode}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.debtorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getDebtorTypeLabel(account.debtorType)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">{formatKES(account.currentBalance)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">{formatKES(account.creditLimit)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.utilizationPercentage >= 100 ? 'bg-red-100 text-red-800' :
                      account.utilizationPercentage >= 90 ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {account.utilizationPercentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {highRiskAccounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    No high risk accounts
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Over Limit Accounts */}
      {overLimitAccounts.length > 0 && (
        <div className="bg-red-50 rounded-lg shadow border border-red-200">
          <div className="px-6 py-4 border-b border-red-200">
            <h2 className="text-lg font-semibold text-red-900">⚠️ Accounts Over Credit Limit</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-red-200">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase tracking-wider">Limit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase tracking-wider">Over By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-200">
                {overLimitAccounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-900">
                      <Link to={`/debtors/accounts/${account.id}`}>{account.debtorCode}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-900">{account.debtorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-700 text-right">{formatKES(account.currentBalance)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">{formatKES(account.creditLimit)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-800 text-right">{formatKES(account.overLimitAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
