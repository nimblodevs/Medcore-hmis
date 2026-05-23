import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useEncounters, useCreateEncounter } from '../hooks/useEmr';
import { PatientHeader } from './components/shared/EmrComponents';

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  READY_FOR_DISCHARGE: 'bg-purple-100 text-purple-800',
  CLOSED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">EMR Dashboard</h1>
        <Button onClick={() => navigate('/emr/triage')}>New Triage</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-gray-500">Total Encounters</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">{stats.open}</div>
            <p className="text-gray-500">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-gray-500">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600">{stats.readyForDischarge}</div>
            <p className="text-gray-500">Ready for Discharge</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="mb-4">
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

      {/* Encounters Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Encounters</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
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
                  <TableRow key={encounter.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {encounter.patient?.firstName} {encounter.patient?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {encounter.patient?.hospitalNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{encounter.visit?.visitNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[encounter.status]}>
                        {encounter.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {encounter.chiefComplaint || '-'}
                    </TableCell>
                    <TableCell>
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
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No encounters found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
