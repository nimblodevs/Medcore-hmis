import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { drugApi, batchApi, stockMovementApi } from '../services/pharmacy.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Download,
  TrendingUp,
  AlertTriangle,
  Clock,
  Package,
} from 'lucide-react';

/**
 * Pharmacy Reports Page
 * 
 * Provides various pharmacy reports and analytics
 */
const ReportsPage = () => {
  const [reportType, setReportType] = useState('stock-summary');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Fetch data for reports
  const { data: drugsData } = useQuery({
    queryKey: ['drugs'],
    queryFn: () => drugApi.getAll().then(res => res.data),
  });

  const { data: batchesData } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchApi.getAll().then(res => res.data),
  });

  const { data: movementsData } = useQuery({
    queryKey: ['stock-movements', dateRange],
    queryFn: () => stockMovementApi.getAll({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }).then(res => res.data),
  });

  const calculateStockValue = () => {
    if (!batchesData?.data) return 0;
    return batchesData.data.reduce((sum, batch) => {
      return sum + (batch.unitPrice * batch.quantity);
    }, 0);
  };

  const calculateExpiringSoon = () => {
    if (!batchesData?.data) return 0;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return batchesData.data.filter(batch => {
      const expiryDate = new Date(batch.expiryDate);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }).length;
  };

  const calculateExpired = () => {
    if (!batchesData?.data) return 0;
    return batchesData.data.filter(batch => {
      return new Date(batch.expiryDate) < new Date();
    }).length;
  };

  const calculateLowStock = () => {
    if (!drugsData?.data) return 0;
    return drugsData.data.filter(drug => drug.isLowStock).length;
  };

  const getMovementSummary = () => {
    if (!movementsData?.data) return { in: 0, out: 0, adjustments: 0 };
    
    return movementsData.data.reduce((acc, movement) => {
      if (['PURCHASE_RECEIPT', 'ADJUSTMENT_IN', 'RETURN_IN'].includes(movement.type)) {
        acc.in += movement.quantity;
      } else if (['DISPENSE', 'SALE', 'ADJUSTMENT_OUT', 'EXPIRY_WRITEOFF', 'RETURN_OUT'].includes(movement.type)) {
        acc.out += movement.quantity;
      }
      if (movement.type.includes('ADJUSTMENT')) {
        acc.adjustments++;
      }
      return acc;
    }, { in: 0, out: 0, adjustments: 0 });
  };

  const movementSummary = getMovementSummary();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pharmacy Reports</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Report Type Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="stock-summary">Stock Summary</option>
              <option value="expiry-report">Expiry Report</option>
              <option value="movement-report">Stock Movement</option>
              <option value="low-stock-report">Low Stock Report</option>
              <option value="consumption-report">Consumption Report</option>
              <option value="valuation-report">Stock Valuation</option>
            </select>

            <div className="flex gap-2 items-center">
              <label className="text-sm text-muted-foreground">From:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 border rounded-md bg-background"
              />
              <label className="text-sm text-muted-foreground">To:</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <Button>
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Stock Value</p>
                <p className="text-2xl font-bold">
                  KES {calculateStockValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Package className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Batches</p>
                <p className="text-2xl font-bold">{batchesData?.data?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{calculateExpiringSoon()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">{calculateLowStock()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Movement Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Stock Movement Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium">Stock In</p>
              <p className="text-3xl font-bold text-green-600">{movementSummary.in.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">Units received in period</p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 font-medium">Stock Out</p>
              <p className="text-3xl font-bold text-red-600">{movementSummary.out.toLocaleString()}</p>
              <p className="text-xs text-red-600 mt-1">Units dispensed/sold</p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700 font-medium">Adjustments</p>
              <p className="text-3xl font-bold text-yellow-600">{movementSummary.adjustments}</p>
              <p className="text-xs text-yellow-600 mt-1">Stock adjustments made</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expiry Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Expiry Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Count</th>
                  <th className="p-3 text-left font-medium">Estimated Loss</th>
                  <th className="p-3 text-left font-medium">Action Required</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge variant="success">Good</Badge>
                  </td>
                  <td className="p-3 font-medium">
                    {batchesData?.data?.filter(b => {
                      const expiryDate = new Date(b.expiryDate);
                      const ninetyDaysFromNow = new Date();
                      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
                      return expiryDate > ninetyDaysFromNow;
                    }).length || 0}
                  </td>
                  <td className="p-3">-</td>
                  <td className="p-3 text-muted-foreground">No action needed</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge variant="warning">Expiring Soon (30 days)</Badge>
                  </td>
                  <td className="p-3 font-medium">{calculateExpiringSoon()}</td>
                  <td className="p-3 font-medium">
                    KES {batchesData?.data
                      .filter(b => {
                        const expiryDate = new Date(b.expiryDate);
                        const thirtyDaysFromNow = new Date();
                        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                        return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
                      })
                      .reduce((sum, b) => sum + (b.unitPrice * b.quantity), 0)
                      .toFixed(2) || 0}
                  </td>
                  <td className="p-3 text-orange-600">Prioritize dispensing</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge variant="destructive">Expired</Badge>
                  </td>
                  <td className="p-3 font-medium">{calculateExpired()}</td>
                  <td className="p-3 font-medium text-red-600">
                    KES {batchesData?.data
                      .filter(b => new Date(b.expiryDate) < new Date())
                      .reduce((sum, b) => sum + (b.unitPrice * b.quantity), 0)
                      .toFixed(2) || 0}
                  </td>
                  <td className="p-3 text-red-600">Write-off required</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent Stock Movements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movementsData?.data?.length === 0 ? (
            <p className="text-muted-foreground">No stock movements in selected period</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Date</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Drug</th>
                    <th className="p-3 text-left font-medium">Batch</th>
                    <th className="p-3 text-left font-medium">Quantity</th>
                    <th className="p-3 text-left font-medium">Store</th>
                    <th className="p-3 text-left font-medium">By</th>
                  </tr>
                </thead>
                <tbody>
                  {movementsData?.data?.slice(0, 10).map((movement) => (
                    <tr key={movement.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        {new Date(movement.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Badge variant={movement.type.includes('IN') ? 'success' : 'destructive'}>
                          {movement.type.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">{movement.drug?.name}</td>
                      <td className="p-3 font-mono text-sm">{movement.batch?.batchNumber}</td>
                      <td className={`p-3 font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </td>
                      <td className="p-3">{movement.store?.name}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {movement.createdBy?.firstName} {movement.createdBy?.lastName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
