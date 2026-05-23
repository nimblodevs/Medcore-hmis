import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useCreateDiagnosis, useUpdateDiagnosis, useDeleteDiagnosis } from '../../hooks/useEmr';

export const DiagnosisForm = ({ encounterId, existingDiagnoses }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const createDiagnosis = useCreateDiagnosis(encounterId);
  const updateDiagnosis = useUpdateDiagnosis();
  const deleteDiagnosis = useDeleteDiagnosis();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      diagnosisType: 'PROVISIONAL',
      code: '',
      description: '',
      notes: '',
    },
  });

  const onSubmit = async (data) => {
    if (editingId) {
      await updateDiagnosis.mutateAsync({ id: editingId, data });
      setEditingId(null);
    } else {
      await createDiagnosis.mutateAsync(data);
    }
    reset();
    setShowForm(false);
  };

  const handleEdit = (diagnosis) => {
    setEditingId(diagnosis.id);
    reset({
      diagnosisType: diagnosis.diagnosisType,
      code: diagnosis.code || '',
      description: diagnosis.description,
      notes: diagnosis.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this diagnosis?')) {
      await deleteDiagnosis.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Diagnoses</h2>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); reset(); }}>
          {showForm ? 'Cancel' : 'Add Diagnosis'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Diagnosis' : 'Add Diagnosis'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select {...register('diagnosisType')}>
                  <option value="PROVISIONAL">Provisional</option>
                  <option value="FINAL">Final</option>
                  <option value="DIFFERENTIAL">Differential</option>
                </Select>
              </div>

              <div>
                <Label>ICD-10 Code (optional)</Label>
                <Input {...register('code')} placeholder="e.g., A01.0" />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Diagnosis description"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea {...register('notes')} rows={2} placeholder="Additional notes..." />
              </div>

              <Button type="submit" disabled={createDiagnosis.isPending || updateDiagnosis.isPending}>
                {createDiagnosis.isPending || updateDiagnosis.isPending ? 'Saving...' : 'Save Diagnosis'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {existingDiagnoses?.map((diagnosis) => (
          <Card key={diagnosis.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      diagnosis.diagnosisType === 'FINAL' ? 'bg-green-100 text-green-800' :
                      diagnosis.diagnosisType === 'PROVISIONAL' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {diagnosis.diagnosisType}
                    </span>
                    {diagnosis.code && (
                      <span className="text-sm text-gray-500">{diagnosis.code}</span>
                    )}
                  </div>
                  <p className="font-medium">{diagnosis.description}</p>
                  {diagnosis.notes && (
                    <p className="text-sm text-gray-600 mt-1">{diagnosis.notes}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(diagnosis.recordedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(diagnosis)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(diagnosis.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!existingDiagnoses || existingDiagnoses.length === 0) && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-center">No diagnoses recorded yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
