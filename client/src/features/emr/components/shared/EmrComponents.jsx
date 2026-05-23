import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const priorityColors = {
  RED: 'bg-red-600 text-white',
  ORANGE: 'bg-orange-500 text-white',
  YELLOW: 'bg-yellow-500 text-black',
  GREEN: 'bg-green-500 text-white',
  BLUE: 'bg-blue-500 text-white',
  UNKNOWN: 'bg-gray-400 text-white',
};

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  READY_FOR_DISCHARGE: 'bg-purple-100 text-purple-800',
  CLOSED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const PatientHeader = ({ patient, visit, encounter }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">
              {patient?.firstName} {patient?.middleName || ''} {patient?.lastName}
            </CardTitle>
            <p className="text-sm text-gray-500">
              UHID: {patient?.hospitalNumber} | {patient?.gender} |{' '}
              {patient?.dateOfBirth
                ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years`
                : 'Age unknown'}
            </p>
          </div>
          <div className="flex gap-2">
            {encounter && (
              <Badge className={statusColors[encounter.status] || 'bg-gray-100'}>
                {encounter.status.replace('_', ' ')}
              </Badge>
            )}
            {visit && (
              <Badge variant="outline">{visit.visitType.replace('_', ' ')}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Visit Number:</span>
            <p className="font-medium">{visit?.visitNumber || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-500">Phone:</span>
            <p className="font-medium">{patient?.phone || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-500">Payer Type:</span>
            <p className="font-medium">{visit?.payerType || patient?.payerType || 'CASH'}</p>
          </div>
          <div>
            <span className="text-gray-500">Check-in:</span>
            <p className="font-medium">
              {visit?.checkInAt
                ? new Date(visit.checkInAt).toLocaleString()
                : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AllergyBanner = ({ allergies }) => {
  const activeAllergies = allergies?.filter((a) => a.isActive) || [];

  if (activeAllergies.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-red-500 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-semibold text-red-800">ALLERGY ALERT</span>
      </div>
      <div className="mt-2">
        {activeAllergies.map((allergy) => (
          <div key={allergy.id} className="text-sm text-red-700">
            <span className="font-medium">{allergy.allergen}</span>
            {allergy.reaction && <span> - {allergy.reaction}</span>}
            {allergy.severity !== 'UNKNOWN' && (
              <Badge className={`ml-2 ${priorityColors[allergy.severity]}`}>
                {allergy.severity}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const TriageSummary = ({ triage }) => {
  if (!triage || triage.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <p className="text-gray-500 text-sm">No triage recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  const latestTriage = triage[triage.length - 1];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          Latest Triage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-gray-500 text-sm">Priority:</span>
            <Badge className={`ml-2 ${priorityColors[latestTriage.priority]}`}>
              {latestTriage.priority}
            </Badge>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Recorded:</span>
            <p className="text-sm">
              {new Date(latestTriage.recordedAt).toLocaleString()}
            </p>
          </div>
        </div>
        {latestTriage.complaint && (
          <div className="mt-3">
            <span className="text-gray-500 text-sm">Chief Complaint:</span>
            <p className="text-sm">{latestTriage.complaint}</p>
          </div>
        )}
        {latestTriage.notes && (
          <div className="mt-2">
            <span className="text-gray-500 text-sm">Notes:</span>
            <p className="text-sm">{latestTriage.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const VitalsTimeline = ({ vitals }) => {
  if (!vitals || vitals.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <p className="text-gray-500 text-sm">No vitals recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  const latestVitals = vitals[vitals.length - 1];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
          Latest Vitals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {latestVitals.temperatureCelsius && (
            <div>
              <span className="text-gray-500 text-xs">Temp (°C)</span>
              <p className="text-lg font-semibold">
                {latestVitals.temperatureCelsius}
              </p>
            </div>
          )}
          {latestVitals.systolicBp && latestVitals.diastolicBp && (
            <div>
              <span className="text-gray-500 text-xs">BP (mmHg)</span>
              <p className="text-lg font-semibold">
                {latestVitals.systolicBp}/{latestVitals.diastolicBp}
              </p>
            </div>
          )}
          {latestVitals.pulseRate && (
            <div>
              <span className="text-gray-500 text-xs">Pulse (bpm)</span>
              <p className="text-lg font-semibold">{latestVitals.pulseRate}</p>
            </div>
          )}
          {latestVitals.respiratoryRate && (
            <div>
              <span className="text-gray-500 text-xs">RR (/min)</span>
              <p className="text-lg font-semibold">
                {latestVitals.respiratoryRate}
              </p>
            </div>
          )}
          {latestVitals.oxygenSaturation && (
            <div>
              <span className="text-gray-500 text-xs">SpO₂ (%)</span>
              <p className="text-lg font-semibold">
                {latestVitals.oxygenSaturation}
              </p>
            </div>
          )}
          {latestVitals.weightKg && (
            <div>
              <span className="text-gray-500 text-xs">Weight (kg)</span>
              <p className="text-lg font-semibold">{latestVitals.weightKg}</p>
            </div>
          )}
          {latestVitals.heightCm && (
            <div>
              <span className="text-gray-500 text-xs">Height (cm)</span>
              <p className="text-lg font-semibold">{latestVitals.heightCm}</p>
            </div>
          )}
          {latestVitals.bmi && (
            <div>
              <span className="text-gray-500 text-xs">BMI</span>
              <p className="text-lg font-semibold">{latestVitals.bmi}</p>
            </div>
          )}
          {latestVitals.painScore !== undefined && (
            <div>
              <span className="text-gray-500 text-xs">Pain (0-10)</span>
              <p className="text-lg font-semibold">{latestVitals.painScore}</p>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500">
            Recorded:{' '}
            {new Date(latestVitals.recordedAt).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export const StatusBadge = ({ status }) => {
  const colors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SIGNED: 'bg-blue-100 text-blue-800',
    AMENDED: 'bg-yellow-100 text-yellow-800',
    VOIDED: 'bg-red-100 text-red-800',
    ORDERED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <Badge className={colors[status] || 'bg-gray-100'}>
      {status.replace('_', ' ')}
    </Badge>
  );
};
