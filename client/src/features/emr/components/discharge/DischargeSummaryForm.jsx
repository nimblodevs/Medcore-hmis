import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { useCreateDischargeSummary, useSignDischargeSummary } from '../../hooks/useEmr';
import { StatusBadge } from '../shared/EmrComponents';

export const DischargeSummaryForm = ({ encounterId, dischargeSummary }) => {
  const [showForm, setShowForm] = useState(!dischargeSummary);
  const createDischarge = useCreateDischargeSummary(encounterId);
  const signDischarge = useSignDischargeSummary();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      finalDiagnosis: dischargeSummary?.finalDiagnosis || '',
      treatmentGiven: dischargeSummary?.treatmentGiven || '',
      proceduresDone: dischargeSummary?.proceduresDone || '',
      dischargeCondition: dischargeSummary?.dischargeCondition || '',
      dischargeMedications: dischargeSummary?.dischargeMedications || '',
      followUpInstructions: dischargeSummary?.followUpInstructions || '',
    },
  });

  const onSubmit = async (data) => {
    if (dischargeSummary) {
      // Update existing - would need update mutation
      console.log('Update not implemented yet');
    } else {
      await createDischarge.mutateAsync(data);
      setShowForm(false);
    }
  };

  const handleSign = async () => {
    if (confirm('Sign this discharge summary? This action cannot be undone.')) {
      await signDischarge.mutateAsync(dischargeSummary.id);
    }
  };

  if (!showForm && dischargeSummary) {
    return (
      <div>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle>Discharge Summary</CardTitle>
              <div className="flex gap-2">
                <StatusBadge status={dischargeSummary.status} />
                {dischargeSummary.status === 'DRAFT' && (
                  <Button size="sm" onClick={handleSign} disabled={signDischarge.isPending}>
                    {signDischarge.isPending ? 'Signing...' : 'Sign & Discharge'}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                  Edit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {dischargeSummary.finalDiagnosis && (
              <div>
                <Label className="text-gray-500">Final Diagnosis</Label>
                <p className="mt-1">{dischargeSummary.finalDiagnosis}</p>
              </div>
            )}
            {dischargeSummary.treatmentGiven && (
              <div>
                <Label className="text-gray-500">Treatment Given</Label>
                <p className="mt-1 whitespace-pre-wrap">{dischargeSummary.treatmentGiven}</p>
              </div>
            )}
            {dischargeSummary.proceduresDone && (
              <div>
                <Label className="text-gray-500">Procedures Done</Label>
                <p className="mt-1 whitespace-pre-wrap">{dischargeSummary.proceduresDone}</p>
              </div>
            )}
            {dischargeSummary.dischargeCondition && (
              <div>
                <Label className="text-gray-500">Condition at Discharge</Label>
                <p className="mt-1">{dischargeSummary.dischargeCondition}</p>
              </div>
            )}
            {dischargeSummary.dischargeMedications && (
              <div>
                <Label className="text-gray-500">Discharge Medications</Label>
                <p className="mt-1 whitespace-pre-wrap">{dischargeSummary.dischargeMedications}</p>
              </div>
            )}
            {dischargeSummary.followUpInstructions && (
              <div>
                <Label className="text-gray-500">Follow-up Instructions</Label>
                <p className="mt-1 whitespace-pre-wrap">{dischargeSummary.followUpInstructions}</p>
              </div>
            )}
            {dischargeSummary.signedAt && (
              <div className="pt-4 border-t text-sm text-gray-500">
                Signed by: {dischargeSummary.signedBy?.name || 'Unknown'} at{' '}
                {new Date(dischargeSummary.signedAt).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            {dischargeSummary ? 'Edit Discharge Summary' : 'Create Discharge Summary'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Final Diagnosis *</Label>
              <Textarea
                {...register('finalDiagnosis', { required: 'Final diagnosis is required' })}
                rows={2}
                placeholder="Primary and secondary diagnoses..."
              />
              {errors.finalDiagnosis && (
                <p className="text-red-500 text-sm">{errors.finalDiagnosis.message}</p>
              )}
            </div>

            <div>
              <Label>Treatment Given</Label>
              <Textarea
                {...register('treatmentGiven')}
                rows={3}
                placeholder="Summary of treatment provided during admission/visit..."
              />
            </div>

            <div>
              <Label>Procedures Done</Label>
              <Textarea
                {...register('proceduresDone')}
                rows={2}
                placeholder="Any procedures performed..."
              />
            </div>

            <div>
              <Label>Condition at Discharge</Label>
              <Textarea
                {...register('dischargeCondition')}
                rows={2}
                placeholder="Patient's condition at time of discharge..."
              />
            </div>

            <div>
              <Label>Discharge Medications</Label>
              <Textarea
                {...register('dischargeMedications')}
                rows={3}
                placeholder="Medications to continue after discharge..."
              />
            </div>

            <div>
              <Label>Follow-up Instructions</Label>
              <Textarea
                {...register('followUpInstructions', { required: 'Follow-up instructions are required' })}
                rows={3}
                placeholder="When to return, warning signs, lifestyle advice..."
              />
              {errors.followUpInstructions && (
                <p className="text-red-500 text-sm">{errors.followUpInstructions.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createDischarge.isPending}>
                {createDischarge.isPending ? 'Saving...' : dischargeSummary ? 'Update' : 'Save Summary'}
              </Button>
              {dischargeSummary && (
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
