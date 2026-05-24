import { Link } from 'react-router-dom';
import { getStatusLabel, getRiskColor, getAgingBucketColor, getAgingBucketLabel } from '../utils/creditControlConstants';

export function CaseStatusBadge({ status }) {
  const statusColors = {
    OPEN: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    PROMISED_TO_PAY: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    DISPUTED: 'bg-amber-100 text-amber-800 border-amber-200',
    ESCALATED: 'bg-orange-100 text-orange-800 border-orange-200',
    ON_HOLD: 'bg-red-100 text-red-800 border-red-200',
    RESOLVED: 'bg-slate-100 text-slate-800 border-slate-200',
    CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
    CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const colorClass = statusColors[status] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide border ${colorClass}`}>
      {getStatusLabel(status)}
    </span>
  );
}

export function RiskLevelBadge({ riskLevel }) {
  const colorClass = getRiskColor(riskLevel);

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide border ${colorClass}`}>
      {riskLevel}
    </span>
  );
}

export function AgingBucketBadge({ bucket }) {
  const colorClass = getAgingBucketColor(bucket);

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${colorClass}`}>
      {getAgingBucketLabel(bucket)}
    </span>
  );
}

export function HoldStatusBadge({ status }) {
  const statusColors = {
    NONE: 'bg-slate-100 text-slate-600 border-slate-200',
    RECOMMENDED: 'bg-amber-100 text-amber-800 border-amber-200',
    APPROVED: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    ACTIVE: 'bg-rose-100 text-rose-800 border-rose-200',
    RELEASE_REQUESTED: 'bg-blue-100 text-blue-800 border-blue-200',
    RELEASED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    REJECTED: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const colorClass = statusColors[status] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide border ${colorClass}`}>
      {getStatusLabel(status)}
    </span>
  );
}

export function DisputeStatusBadge({ status }) {
  const statusColors = {
    OPEN: 'bg-blue-100 text-blue-800 border-blue-200',
    UNDER_REVIEW: 'bg-amber-100 text-amber-800 border-amber-200',
    ACCEPTED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    RESOLVED: 'bg-slate-100 text-slate-800 border-slate-200',
    CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const colorClass = statusColors[status] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide border ${colorClass}`}>
      {getStatusLabel(status)}
    </span>
  );
}

export function WriteOffStatusBadge({ status }) {
  const statusColors = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    APPROVED: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    POSTED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const colorClass = statusColors[status] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide border ${colorClass}`}>
      {getStatusLabel(status)}
    </span>
  );
}

export function StatCard({ title, value, subtitle, icon, trend, trendUp }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {icon && (
            <div className="rounded-xl bg-cyan-50 p-3">
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
            <span className="ml-2 text-sm text-slate-500">vs last week</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function DataTable({ columns, data, onRowClick, emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/70">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-cyan-50/60' : ''}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-sm text-slate-900">
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder, icon }) {
  return (
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {icon}
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10 ${icon ? 'pl-10' : ''}`}
      />
    </div>
  );
}

export function FilterSelect({ value, onChange, options, placeholder, label }) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-semibold text-slate-800">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-xs focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
