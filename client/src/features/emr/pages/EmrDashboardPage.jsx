import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsGrid, StatsCard } from '@/components/layout/StatsCard';
import { SectionCard } from '@/components/layout/SectionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useEncounters, useCreateEncounter } from '../hooks/useEmr';
import { PatientHeader } from './components/shared/EmrComponents';

const statusColors = {
  OPEN: 'bg-cyan-100 text-cyan-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  READY_FOR_DISCHARGE: 'bg-purple-100 text-purple-800',
  CLOSED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
};

export const EmrDashboardPage = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const { data: encountersData, isLoading } = useEncounters({
    status: filterStatus !== 'ALL' ? filterStatus : undefined,
  });

  const encounters = encountersData?.data || [];

  const stats = {
    total: encounters.length,
    open: encounters.filter((e) => e.status === 'OPEN').length,
    inProgress: encounters.filter((e) => e.status === 'IN_PROGRESS').length,
    readyForDischarge: encounters.filter((e) => e.status === 'READY_FOR_DISCHARGE').length,
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="EMR Dashboard"
        description="Manage patient encounters and clinical workflows"
        breadcrumbs={[{ label: 'EMR', href: '/emr' }, { label: 'Dashboard' }]}
        action={
          <Button onClick={() => navigate('/emr/triage')}>
            New Triage
          </Button>
        }
      />

      {/* Stats Cards */}
      <StatsGrid columns="quad">
        <StatsCard
          title="Total Encounters"
          value={stats.total}
          icon="users"
          trend={stats.total > 0 ? 'positive' : 'neutral'}
        />
        <StatsCard
          title="Open"
          value={stats.open}
          icon="activity"
          variant="cyan"
          trend="neutral"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon="clock"
          variant="amber"
          trend="neutral"
        />
        <StatsCard
          title="Ready for Discharge"
          value={stats.readyForDischarge}
          icon="check-circle"
          variant="purple"
          trend="neutral"
        />
      </StatsGrid>

      {/* Filter */}
      <SectionCard>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label>Filter by Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <option value="ALL">All</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="READY_FOR_DISCHARGE">Ready for Discharge</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
        </div>
      </SectionCard>

      {/* Encounters Table */}
      <SectionCard title="Active Encounters">
        {isLoading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Visit Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Chief Complaint</TableHead>
                <TableHead>Started At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encounters.map((encounter) => (
                <TableRow key={encounter.id} className="hover:bg-cyan-50/30">
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-900">
                        {encounter.patient?.firstName} {encounter.patient?.lastName}
                      </div>
                      <div className="text-sm text-slate-500">
                        {encounter.patient?.hospitalNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700">{encounter.visit?.visitNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[encounter.status]}>
                      {encounter.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-slate-700">
                    {encounter.chiefComplaint || '-'}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {new Date(encounter.startedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/emr/encounters/${encounter.id}`)}
                    >
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {encounters.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    No encounters found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
};
