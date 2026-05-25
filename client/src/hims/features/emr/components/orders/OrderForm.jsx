import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useCreateOrder, useSubmitOrder, useCancelOrder } from '../../hooks/useEmr';

const orderTypeColors = {
  LAB: 'bg-blue-100 text-blue-800',
  RADIOLOGY: 'bg-purple-100 text-purple-800',
  PHARMACY: 'bg-green-100 text-green-800',
  PROCEDURE: 'bg-orange-100 text-orange-800',
  REFERRAL: 'bg-pink-100 text-pink-800',
};

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ORDERED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const OrderForm = ({ encounterId, existingOrders }) => {
  const [showForm, setShowForm] = useState(false);
  const createOrder = useCreateOrder(encounterId);
  const submitOrder = useSubmitOrder();
  const cancelOrder = useCancelOrder();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      orderType: 'LAB',
      itemCode: '',
      description: '',
      priority: 'ROUTINE',
      notes: '',
    },
  });

  const onSubmit = async (data) => {
    await createOrder.mutateAsync(data);
    reset();
    setShowForm(false);
  };

  const handleSubmitOrder = async (id) => {
    await submitOrder.mutateAsync(id);
  };

  const handleCancel = async (order) => {
    const reason = prompt('Enter cancellation reason:');
    if (reason) {
      await cancelOrder.mutateAsync({ id: order.id, reason });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Orders</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Order'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Order Type</Label>
                <Select {...register('orderType')}>
                  <option value="LAB">Laboratory</option>
                  <option value="RADIOLOGY">Radiology</option>
                  <option value="PHARMACY">Pharmacy</option>
                  <option value="PROCEDURE">Procedure</option>
                  <option value="REFERRAL">Referral</option>
                </Select>
              </div>

              <div>
                <Label>Item Code (optional)</Label>
                <Input {...register('itemCode')} placeholder="e.g., CBC, XRAY-CHEST" />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Describe the order..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label>Priority</Label>
                <Select {...register('priority')}>
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="STAT">STAT (Immediate)</option>
                </Select>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea {...register('notes')} rows={2} placeholder="Additional instructions..." />
              </div>

              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Saving...' : 'Create Order'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {existingOrders?.map((order) => (
          <Card key={order.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={orderTypeColors[order.orderType]}>
                      {order.orderType}
                    </Badge>
                    <Badge className={statusColors[order.orderStatus]}>
                      {order.orderStatus.replace('_', ' ')}
                    </Badge>
                    {order.priority !== 'ROUTINE' && (
                      <Badge variant="destructive">{order.priority}</Badge>
                    )}
                  </div>
                  <p className="font-medium">{order.description}</p>
                  {order.itemCode && (
                    <p className="text-sm text-gray-500">Code: {order.itemCode}</p>
                  )}
                  {order.notes && (
                    <p className="text-sm text-gray-600 mt-1">{order.notes}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Ordered: {new Date(order.orderedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {order.orderStatus === 'DRAFT' && (
                    <Button size="sm" onClick={() => handleSubmitOrder(order.id)}>
                      Submit
                    </Button>
                  )}
                  {(order.orderStatus === 'DRAFT' || order.orderStatus === 'ORDERED') && (
                    <Button size="sm" variant="outline" onClick={() => handleCancel(order)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!existingOrders || existingOrders.length === 0) && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-center">No orders yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
