import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useCreateTriage } from '../../hooks/useEmr';
import { StatusBadge } from '../shared/EmrComponents';

export const TriageForm = ({ encounterId, existingTriage }) => {
  const [showForm, setShowForm] = useState(false);
  const createTriage = useCreateTriage(encounterId);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      priority: 'UNKNOWN',
      complaint: '',
      notes: '',
    },
  });

  const onSubmit = async (data) => {
    await createTriage.mutateAsync(data);
    reset();
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Triage Records</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Record Triage'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Record Triage</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Priority</Label>
                <Select {...register('priority')}>
                  <option value="RED">RED - Immediate</option>
                  <option value="ORANGE">ORANGE - Emergency</option>
                  <option value="YELLOW">YELLOW - Urgent</option>
                  <option value="GREEN">GREEN - Non-urgent</option>
                  <option value="BLUE">BLUE - Minor</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                </Select>
              </div>

              <div>
                <Label>Chief Complaint</Label>
                <Textarea
                  {...register('complaint', { required: 'Complaint is required' })}
                  rows={3}
                  placeholder="Describe the chief complaint..."
                />
                {errors.complaint && (
                  <p className="text-red-500 text-sm">{errors.complaint.message}</p>
                )}
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Additional triage notes..."
                />
              </div>

              <Button type="submit" disabled={createTriage.isPending}>
                {createTriage.isPending ? 'Saving...' : 'Save Triage'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {existingTriage?.map((triage) => (
          <Card key={triage.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">
                  Triage - {new Date(triage.recordedAt).toLocaleString()}
                </CardTitle>
                <StatusBadge status={triage.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Priority:</span>
                  <div className="mt-1">
                    <StatusBadge status={triage.priority} />
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Recorded By:</span>
                  <p className="text-sm">{triage.recordedBy?.name || 'Unknown'}</p>
                </div>
              </div>
              {triage.complaint && (
                <div className="mt-3">
                  <span className="text-gray-500 text-sm">Chief Complaint:</span>
                  <p className="text-sm">{triage.complaint}</p>
                </div>
              )}
              {triage.notes && (
                <div className="mt-2">
                  <span className="text-gray-500 text-sm">Notes:</span>
                  <p className="text-sm">{triage.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {(!existingTriage || existingTriage.length === 0) && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-center">No triage records yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
