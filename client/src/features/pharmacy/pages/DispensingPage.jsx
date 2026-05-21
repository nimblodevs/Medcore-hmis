import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { prescriptionApi, dispenseApi, drugApi } from '../services/pharmacy.api';
import { usePharmacyStore } from '../store/pharmacy.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Syringe,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
} from 'lucide-react';

/**
 * Dispensing Page
 * 
 * Handles prescription dispensing workflow with FEFO batch selection
 */
const DispensingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  
  const { openModal, setSelectedPrescription, dispensingCart, clearDispensingCart } = usePharmacyStore();

  // Fetch prescriptions
  const { data: prescriptionsData, isLoading: prescriptionsLoading, refetch } = useQuery({
    queryKey: ['prescriptions', { status: statusFilter }],
    queryFn: () => prescriptionApi.getAll({ status: statusFilter }).then(res => res.data),
  });

  // Fetch recent dispenses
  const { data: dispensesData } = useQuery({
    queryKey: ['dispenses'],
    queryFn: () => dispenseApi.getAll({ limit: 10 }).then(res => res.data),
  });

  const handleDispense = (prescription) => {
    setSelectedPrescription(prescription);
    openModal('dispenseForm');
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: <Badge variant="warning">Pending</Badge>,
      PARTIALLY_DISPENSED: <Badge variant="info">Partially Dispensed</Badge>,
      DISPENSED: <Badge variant="success">Dispensed</Badge>,
      CANCELLED: <Badge variant="destructive">Cancelled</Badge>,
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dispensing</h1>
        <Button onClick={() => openModal('prescriptionForm')}>
          <Plus className="h-4 w-4 mr-2" />
          New Prescription
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="PENDING">Pending</option>
              <option value="PARTIALLY_DISPENSED">Partially Dispensed</option>
              <option value="DISPENSED">Dispensed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prescriptionsLoading ? (
            <div className="flex items-center justify-center py-8">Loading...</div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Reference</th>
                    <th className="p-3 text-left font-medium">Patient</th>
                    <th className="p-3 text-left font-medium">Prescriber</th>
                    <th className="p-3 text-left font-medium">Date</th>
                    <th className="p-3 text-left font-medium">Items</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptionsData?.data?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No prescriptions found
                      </td>
                    </tr>
                  ) : (
                    prescriptionsData?.data?.map((prescription) => (
                      <tr key={prescription.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono text-sm">{prescription.referenceNumber}</td>
                        <td className="p-3 font-medium">
                          {prescription.patient?.firstName} {prescription.patient?.lastName}
                        </td>
                        <td className="p-3">
                          Dr. {prescription.prescriber?.firstName} {prescription.prescriber?.lastName}
                        </td>
                        <td className="p-3">
                          {new Date(prescription.prescriptionDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">
                            {prescription.items?.length || 0} items
                          </Badge>
                        </td>
                        <td className="p-3">{getStatusBadge(prescription.status)}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDispense(prescription)}
                              disabled={prescription.status === 'DISPENSED' || prescription.status === 'CANCELLED'}
                            >
                              <Syringe className="h-4 w-4 mr-1" />
                              Dispense
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Dispenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Recent Dispenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dispensesData?.data?.length === 0 ? (
            <p className="text-muted-foreground">No recent dispenses</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Reference</th>
                    <th className="p-3 text-left font-medium">Patient</th>
                    <th className="p-3 text-left font-medium">Items</th>
                    <th className="p-3 text-left font-medium">Total</th>
                    <th className="p-3 text-left font-medium">Dispensed By</th>
                    <th className="p-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dispensesData?.data?.map((dispense) => (
                    <tr key={dispense.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-sm">{dispense.referenceNumber}</td>
                      <td className="p-3">
                        {dispense.patient?.firstName} {dispense.patient?.lastName}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {dispense.items?.length || 0} items
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">
                        KES {dispense.totalAmount?.toFixed(2)}
                      </td>
                      <td className="p-3">
                        {dispense.dispensedBy?.firstName} {dispense.dispensedBy?.lastName}
                      </td>
                      <td className="p-3">
                        {new Date(dispense.dispenseDate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {prescriptionsData?.data?.filter(p => p.status === 'PENDING').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Partially Dispensed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {prescriptionsData?.data?.filter(p => p.status === 'PARTIALLY_DISPENSED').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Dispensed Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {dispensesData?.data?.filter(d => {
                    const today = new Date().toDateString();
                    return new Date(d.dispenseDate).toDateString() === today;
                  }).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Syringe className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">In Cart</p>
                <p className="text-2xl font-bold">
                  {dispensingCart.items.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DispensingPage;
