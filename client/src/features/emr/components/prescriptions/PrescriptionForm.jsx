import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useCreatePrescription, useCancelPrescription, useSendToPharmacy } from '../../hooks/useEmr';

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ORDERED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const PrescriptionForm = ({ encounterId, existingPrescriptions }) => {
  const [showForm, setShowForm] = useState(false);
  const createPrescription = useCreatePrescription(encounterId);
  const cancelPrescription = useCancelPrescription();
  const sendToPharmacy = useSendToPharmacy();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      medicationName: '',
      genericName: '',
      dosage: '',
      frequency: '',
      duration: '',
      route: '',
      quantity: '',
      instructions: '',
    },
  });

  const onSubmit = async (data) => {
    await createPrescription.mutateAsync({
      ...data,
      quantity: data.quantity ? parseInt(data.quantity) : undefined,
    });
    reset();
    setShowForm(false);
  };

  const handleCancel = async (prescription) => {
    const reason = prompt('Enter cancellation reason:');
    if (reason) {
      await cancelPrescription.mutateAsync({ id: prescription.id, reason });
    }
  };

  const handleSendToPharmacy = async (id) => {
    if (confirm('Send this prescription to pharmacy?')) {
      await sendToPharmacy.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Prescriptions</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Prescription'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Prescription</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Medication Name *</Label>
                <Input
                  {...register('medicationName', { required: 'Medication name is required' })}
                  placeholder="e.g., Amoxicillin"
                />
                {errors.medicationName && (
                  <p className="text-red-500 text-sm">{errors.medicationName.message}</p>
                )}
              </div>

              <div>
                <Label>Generic Name</Label>
                <Input {...register('genericName')} placeholder="e.g., Amoxicillin trihydrate" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dosage</Label>
                  <Input {...register('dosage')} placeholder="e.g., 500mg" />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Input {...register('frequency')} placeholder="e.g., TDS, BD, OD" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration</Label>
                  <Input {...register('duration')} placeholder="e.g., 7 days" />
                </div>
                <div>
                  <Label>Route</Label>
                  <Input {...register('route')} placeholder="e.g., Oral, IV" />
                </div>
              </div>

              <div>
                <Label>Quantity</Label>
                <Input type="number" {...register('quantity')} placeholder="Number of units" />
              </div>

              <div>
                <Label>Instructions</Label>
                <Textarea
                  {...register('instructions')}
                  rows={2}
                  placeholder="e.g., Take after meals, Avoid alcohol..."
                />
              </div>

              <Button type="submit" disabled={createPrescription.isPending}>
                {createPrescription.isPending ? 'Saving...' : 'Create Prescription'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {existingPrescriptions?.map((prescription) => (
          <Card key={prescription.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={statusColors[prescription.status]}>
                      {prescription.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="font-medium text-lg">{prescription.medicationName}</p>
                  {prescription.genericName && (
                    <p className="text-sm text-gray-500">{prescription.genericName}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    {prescription.dosage && (
                      <div>
                        <span className="text-gray-500">Dosage:</span>{' '}
                        <span className="font-medium">{prescription.dosage}</span>
                      </div>
                    )}
                    {prescription.frequency && (
                      <div>
                        <span className="text-gray-500">Frequency:</span>{' '}
                        <span className="font-medium">{prescription.frequency}</span>
                      </div>
                    )}
                    {prescription.duration && (
                      <div>
                        <span className="text-gray-500">Duration:</span>{' '}
                        <span className="font-medium">{prescription.duration}</span>
                      </div>
                    )}
                    {prescription.route && (
                      <div>
                        <span className="text-gray-500">Route:</span>{' '}
                        <span className="font-medium">{prescription.route}</span>
                      </div>
                    )}
                    {prescription.quantity && (
                      <div>
                        <span className="text-gray-500">Quantity:</span>{' '}
                        <span className="font-medium">{prescription.quantity}</span>
                      </div>
                    )}
                  </div>

                  {prescription.instructions && (
                    <div className="mt-2">
                      <span className="text-gray-500 text-sm">Instructions:</span>
                      <p className="text-sm">{prescription.instructions}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-3">
                    Prescribed: {new Date(prescription.prescribedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2 flex-col">
                  {prescription.status === 'DRAFT' && (
                    <>
                      <Button size="sm" onClick={() => handleSendToPharmacy(prescription.id)}>
                        Send to Pharmacy
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleCancel(prescription)}>
                        Cancel
                      </Button>
                    </>
                  )}
                  {prescription.status === 'ORDERED' && (
                    <Button size="sm" variant="outline" onClick={() => handleCancel(prescription)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!existingPrescriptions || existingPrescriptions.length === 0) && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-center">No prescriptions yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
