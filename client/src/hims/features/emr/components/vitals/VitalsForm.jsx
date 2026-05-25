import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useCreateVitals } from '../../hooks/useEmr';

export const VitalsForm = ({ encounterId, existingVitals }) => {
  const [showForm, setShowForm] = useState(false);
  const createVitals = useCreateVitals(encounterId);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      temperatureCelsius: '',
      systolicBp: '',
      diastolicBp: '',
      pulseRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      weightKg: '',
      heightCm: '',
      painScore: '',
      notes: '',
    },
  });

  const onSubmit = async (data) => {
    const vitalsData = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        vitalsData[key] = key === 'notes' ? value : Number(value);
      }
    });
    
    await createVitals.mutateAsync(vitalsData);
    reset();
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Vital Signs</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Record Vitals'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Record Vital Signs</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Temperature (°C)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="25"
                    max="45"
                    {...register('temperatureCelsius', {
                      min: { value: 25, message: 'Min 25°C' },
                      max: { value: 45, message: 'Max 45°C' },
                    })}
                  />
                  {errors.temperatureCelsius && (
                    <p className="text-red-500 text-sm">{errors.temperatureCelsius.message}</p>
                  )}
                </div>

                <div>
                  <Label>Systolic BP (mmHg)</Label>
                  <Input
                    type="number"
                    min="40"
                    max="300"
                    {...register('systolicBp', {
                      min: { value: 40, message: 'Min 40' },
                      max: { value: 300, message: 'Max 300' },
                    })}
                  />
                </div>

                <div>
                  <Label>Diastolic BP (mmHg)</Label>
                  <Input
                    type="number"
                    min="20"
                    max="200"
                    {...register('diastolicBp', {
                      min: { value: 20, message: 'Min 20' },
                      max: { value: 200, message: 'Max 200' },
                    })}
                  />
                </div>

                <div>
                  <Label>Pulse Rate (bpm)</Label>
                  <Input
                    type="number"
                    min="20"
                    max="250"
                    {...register('pulseRate', {
                      min: { value: 20, message: 'Min 20' },
                      max: { value: 250, message: 'Max 250' },
                    })}
                  />
                </div>

                <div>
                  <Label>Resp. Rate (/min)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="80"
                    {...register('respiratoryRate', {
                      min: { value: 5, message: 'Min 5' },
                      max: { value: 80, message: 'Max 80' },
                    })}
                  />
                </div>

                <div>
                  <Label>SpO₂ (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    {...register('oxygenSaturation', {
                      min: { value: 0, message: 'Min 0' },
                      max: { value: 100, message: 'Max 100' },
                    })}
                  />
                </div>

                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="500"
                    {...register('weightKg')}
                  />
                </div>

                <div>
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="20"
                    max="250"
                    {...register('heightCm')}
                  />
                </div>

                <div>
                  <Label>Pain Score (0-10)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    {...register('painScore', {
                      min: { value: 0, message: 'Min 0' },
                      max: { value: 10, message: 'Max 10' },
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              <Button type="submit" disabled={createVitals.isPending}>
                {createVitals.isPending ? 'Saving...' : 'Save Vitals'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {existingVitals?.map((vital) => (
          <Card key={vital.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Vitals - {new Date(vital.recordedAt).toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-sm">
                {vital.temperatureCelsius && (
                  <div>
                    <span className="text-gray-500">Temp:</span>{' '}
                    <span className="font-medium">{vital.temperatureCelsius}°C</span>
                  </div>
                )}
                {vital.systolicBp && vital.diastolicBp && (
                  <div>
                    <span className="text-gray-500">BP:</span>{' '}
                    <span className="font-medium">{vital.systolicBp}/{vital.diastolicBp}</span>
                  </div>
                )}
                {vital.pulseRate && (
                  <div>
                    <span className="text-gray-500">Pulse:</span>{' '}
                    <span className="font-medium">{vital.pulseRate} bpm</span>
                  </div>
                )}
                {vital.respiratoryRate && (
                  <div>
                    <span className="text-gray-500">RR:</span>{' '}
                    <span className="font-medium">{vital.respiratoryRate}/min</span>
                  </div>
                )}
                {vital.oxygenSaturation && (
                  <div>
                    <span className="text-gray-500">SpO₂:</span>{' '}
                    <span className="font-medium">{vital.oxygenSaturation}%</span>
                  </div>
                )}
                {vital.weightKg && (
                  <div>
                    <span className="text-gray-500">Weight:</span>{' '}
                    <span className="font-medium">{vital.weightKg} kg</span>
                  </div>
                )}
                {vital.heightCm && (
                  <div>
                    <span className="text-gray-500">Height:</span>{' '}
                    <span className="font-medium">{vital.heightCm} cm</span>
                  </div>
                )}
                {vital.bmi && (
                  <div>
                    <span className="text-gray-500">BMI:</span>{' '}
                    <span className="font-medium">{vital.bmi}</span>
                  </div>
                )}
                {vital.painScore !== undefined && (
                  <div>
                    <span className="text-gray-500">Pain:</span>{' '}
                    <span className="font-medium">{vital.painScore}/10</span>
                  </div>
                )}
              </div>
              {vital.notes && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-gray-500 text-sm">Notes:</span>
                  <p className="text-sm">{vital.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {(!existingVitals || existingVitals.length === 0) && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-center">No vital signs recorded yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
