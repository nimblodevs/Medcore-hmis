import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { purchaseOrderApi } from '../services/pharmacy.api';
import { usePharmacyStore } from '../store/pharmacy.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Plus,
  Package,
  CheckCircle,
  Clock,
  Eye,
  XCircle,
  FileText,
} from 'lucide-react';

/**
 * Purchases Page
 * 
 * Handles purchase order creation, approval, and goods receipt
 */
const PurchasesPage = () => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const { openModal, clearPurchaseOrderDraft, purchaseOrderDraft } = usePharmacyStore();

  // Fetch purchase orders
  const { data: poData, isLoading: poLoading, refetch } = useQuery({
    queryKey: ['purchase-orders', { status: statusFilter !== 'ALL' ? statusFilter : undefined }],
    queryFn: () => purchaseOrderApi.getAll(statusFilter !== 'ALL' ? { status: statusFilter } : {}).then(res => res.data),
  });
  const purchaseOrders = Array.isArray(poData?.data)
    ? poData.data
    : Array.isArray(poData)
      ? poData
      : [];
  const pendingApprovals = purchaseOrders.filter(po => po.status === 'SUBMITTED');

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: <Badge variant="secondary">Draft</Badge>,
      SUBMITTED: <Badge variant="warning">Submitted</Badge>,
      APPROVED: <Badge variant="success">Approved</Badge>,
      PARTIALLY_RECEIVED: <Badge variant="info">Partially Received</Badge>,
      FULLY_RECEIVED: <Badge variant="success">Fully Received</Badge>,
      CANCELLED: <Badge variant="destructive">Cancelled</Badge>,
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  const handleNewPO = () => {
    clearPurchaseOrderDraft();
    openModal('purchaseOrderForm');
  };

  const handleSubmit = async (id) => {
    try {
      await purchaseOrderApi.submit(id);
      refetch();
    } catch (error) {
      console.error('Failed to submit PO:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await purchaseOrderApi.approve(id);
      refetch();
    } catch (error) {
      console.error('Failed to approve PO:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Purchases</h1>
        <Button onClick={handleNewPO}>
          <Plus className="h-4 w-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="PARTIALLY_RECEIVED">Partially Received</option>
              <option value="FULLY_RECEIVED">Fully Received</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <div className="ml-auto text-sm text-muted-foreground">
              Draft POs in cart: <strong>{purchaseOrderDraft.items.length} items</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {poLoading ? (
            <div className="flex items-center justify-center py-8">Loading...</div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">PO Number</th>
                    <th className="p-3 text-left font-medium">Supplier</th>
                    <th className="p-3 text-left font-medium">Order Date</th>
                    <th className="p-3 text-left font-medium">Items</th>
                    <th className="p-3 text-left font-medium">Total Value</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No purchase orders found
                      </td>
                    </tr>
                  ) : (
                    purchaseOrders.map((po) => (
                      <tr key={po.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono text-sm">{po.orderNumber}</td>
                        <td className="p-3 font-medium">{po.supplier?.name}</td>
                        <td className="p-3">
                          {new Date(po.orderDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">
                            {po.items?.length || 0} items
                          </Badge>
                        </td>
                        <td className="p-3 font-medium">
                          KES {po.totalAmount?.toFixed(2)}
                        </td>
                        <td className="p-3">{getStatusBadge(po.status)}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {po.status === 'DRAFT' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSubmit(po.id)}
                              >
                                Submit
                              </Button>
                            )}
                            {po.status === 'SUBMITTED' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(po.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            {po.status === 'APPROVED' && (
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                Create GRN
                              </Button>
                            )}
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

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <p className="text-muted-foreground">No pending approvals</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">PO Number</th>
                    <th className="p-3 text-left font-medium">Supplier</th>
                    <th className="p-3 text-left font-medium">Total Value</th>
                    <th className="p-3 text-left font-medium">Submitted Date</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((po) => (
                      <tr key={po.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono text-sm">{po.orderNumber}</td>
                        <td className="p-3">{po.supplier?.name}</td>
                        <td className="p-3 font-medium">KES {po.totalAmount?.toFixed(2)}</td>
                        <td className="p-3">
                          {new Date(po.submittedAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(po.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
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
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Draft POs</p>
                <p className="text-2xl font-bold">
                  {purchaseOrders.filter(po => po.status === 'DRAFT').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-orange-600">
                  {pendingApprovals.length}
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
                <p className="text-sm text-muted-foreground">Received This Month</p>
                <p className="text-2xl font-bold text-green-600">
                  {purchaseOrders.filter(po => {
                    const now = new Date();
                    const receivedDate = new Date(po.receivedAt);
                    return po.status === 'FULLY_RECEIVED' && 
                           receivedDate.getMonth() === now.getMonth() &&
                           receivedDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {purchaseOrders.filter(po => po.status === 'CANCELLED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchasesPage;
