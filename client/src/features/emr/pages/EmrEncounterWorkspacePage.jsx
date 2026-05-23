import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useEncounter, useCloseEncounter, useCancelEncounter } from '../hooks/useEmr';
import { PatientHeader, AllergyBanner, TriageSummary, VitalsTimeline, StatusBadge } from './components/shared/EmrComponents';
import { TriageForm } from './components/triage/TriageForm';
import { VitalsForm } from './components/vitals/VitalsForm';
import { SoapNoteForm } from './components/notes/SoapNoteForm';
import { DiagnosisForm } from './components/diagnoses/DiagnosisForm';
import { OrderForm } from './components/orders/OrderForm';
import { PrescriptionForm } from './components/prescriptions/PrescriptionForm';
import { DischargeSummaryForm } from './components/discharge/DischargeSummaryForm';

export const EmrEncounterWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: encounterData, isLoading } = useEncounter(id);
  const closeEncounter = useCloseEncounter();
  const cancelEncounter = useCancelEncounter();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  const encounter = encounterData?.data;
  if (!encounter) {
    return <div className="p-6">Encounter not found</div>;
  }

  const handleCancel = async () => {
    const reason = prompt('Enter cancellation reason:');
    if (reason) {
      await cancelEncounter.mutateAsync({ id, reason });
      navigate('/emr');
    }
  };

  const handleClose = async () => {
    const reason = prompt('Enter closing reason (optional):');
    await closeEncounter.mutateAsync({ id, reason: reason || undefined });
  };

  return (
    <div className="p-6">
      {/* Patient Header */}
      <PatientHeader
        patient={encounter.patient}
        visit={encounter.visit}
        encounter={encounter}
      />

      {/* Allergy Banner */}
      <AllergyBanner allergies={encounter.allergies} />

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        {encounter.status === 'OPEN' || encounter.status === 'IN_PROGRESS' ? (
          <>
            <Button onClick={handleClose} disabled={encounter.status !== 'READY_FOR_DISCHARGE'}>
              Close Encounter
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancel Encounter
            </Button>
          </>
        ) : null}
        <Button variant="outline" onClick={() => navigate('/emr')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="triage">Triage</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
          <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="discharge">Discharge</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TriageSummary triage={encounter.triageRecords} />
            <VitalsTimeline vitals={encounter.vitals} />
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Encounter Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">Chief Complaint:</span>
                  <p>{encounter.chiefComplaint || 'Not recorded'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Presenting History:</span>
                  <p className="whitespace-pre-wrap">{encounter.presentingHistory || 'Not recorded'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Assigned Doctor:</span>
                  <p>{encounter.assignedDoctor?.name || 'Not assigned'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Assigned Nurse:</span>
                  <p>{encounter.assignedNurse?.name || 'Not assigned'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triage">
          <TriageForm encounterId={id} existingTriage={encounter.triageRecords} />
        </TabsContent>

        <TabsContent value="vitals">
          <VitalsForm encounterId={id} existingVitals={encounter.vitals} />
        </TabsContent>

        <TabsContent value="notes">
          <SoapNoteForm encounterId={id} existingNotes={encounter.notes} />
        </TabsContent>

        <TabsContent value="diagnoses">
          <DiagnosisForm encounterId={id} existingDiagnoses={encounter.diagnoses} />
        </TabsContent>

        <TabsContent value="orders">
          <OrderForm encounterId={id} existingOrders={encounter.orders} />
        </TabsContent>

        <TabsContent value="prescriptions">
          <PrescriptionForm encounterId={id} existingPrescriptions={encounter.prescriptions} />
        </TabsContent>

        <TabsContent value="discharge">
          <DischargeSummaryForm encounterId={id} dischargeSummary={encounter.dischargeSummary} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
