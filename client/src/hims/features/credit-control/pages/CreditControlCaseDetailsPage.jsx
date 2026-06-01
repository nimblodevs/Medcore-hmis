import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCase, useFollowUps, usePromises, useCreateFollowUp } from '../hooks/useCreditControl';
import { CaseStatusBadge, RiskLevelBadge, AgingBucketBadge, HoldStatusBadge, DisputeStatusBadge, WriteOffStatusBadge } from '../components/CreditControlComponents';
import { Loader2, AlertCircle, ArrowLeft, User, Clock, FileText, MessageSquare, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { FOLLOW_UP_ACTION_TYPES, FOLLOW_UP_OUTCOMES } from '../utils/creditControlConstants';

export default function CreditControlCaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpData, setFollowUpData] = useState({
    actionType: 'PHONE_CALL',
    outcome: 'FOLLOW_UP_REQUIRED',
    notes: '',
    contactPerson: '',
    contactPhone: '',
    nextFollowUpAt: '',
  });

  const { data: caseData, isLoading: caseLoading, error: caseError } = useCase(id);
  const { data: followUpsData } = useFollowUps(id);
  const { data: promisesData } = usePromises(id);
  const createFollowUpMutation = useCreateFollowUp();

  const handleCreateFollowUp = () => {
    createFollowUpMutation.mutate(
      { caseId: id, data: followUpData },
      {
        onSuccess: () => {
          setShowFollowUpModal(false);
          setFollowUpData({
            actionType: 'PHONE_CALL',
            outcome: 'FOLLOW_UP_REQUIRED',
            notes: '',
            contactPerson: '',
            contactPhone: '',
            nextFollowUpAt: '',
          });
        },
      }
    );
  };

  if (caseLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-700" />
      </div>
    );
  }

  if (caseError || !caseData) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-rose-600" />
          <div>
            <h3 className="font-semibold text-rose-800">Error Loading Case</h3>
            <p className="text-sm text-rose-600">Unable to load credit control case details.</p>
          </div>
        </div>
      </div>
    );
  }

  const case_ = caseData;
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'followups', label: 'Follow-Ups', icon: MessageSquare },
    { id: 'promises', label: 'Payment Promises', icon: Calendar },
    { id: 'holds', label: 'Credit Holds', icon: User },
    { id: 'disputes', label: 'Disputes', icon: AlertCircle },
    { id: 'writeoffs', label: 'Write-Offs', icon: DollarSign },
    { id: 'audit', label: 'Audit Log', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/credit-control/cases')}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{case_.caseNumber}</h1>
                <CaseStatusBadge status={case_.status} />
                <RiskLevelBadge riskLevel={case_.riskLevel} />
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Account: {case_.creditAccountName || case_.creditAccountId}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <AgingBucketBadge bucket={case_.agingBucket} />
                <span className="text-sm text-slate-600">
                  Outstanding: <span className="font-semibold">KES {(case_.outstandingAmount || 0).toLocaleString()}</span>
                </span>
                <span className="text-sm text-slate-600">
                  Overdue: <span className="font-semibold text-rose-600">KES {(case_.overdueAmount || 0).toLocaleString()}</span>
                </span>
                <span className="text-sm text-slate-600">
                  Days Overdue: <span className="font-semibold">{case_.daysOverdue}</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowFollowUpModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-800"
          >
            <MessageSquare className="h-4 w-4" />
            Record Follow-Up
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold ${
                activeTab === tab.id
                  ? 'bg-cyan-700 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Case Information */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold text-slate-700">Case Information</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Status</p>
                  <p className="mt-1"><CaseStatusBadge status={case_.status} /></p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Risk Level</p>
                  <p className="mt-1"><RiskLevelBadge riskLevel={case_.riskLevel} /></p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Aging Bucket</p>
                  <p className="mt-1"><AgingBucketBadge bucket={case_.agingBucket} /></p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Assigned To</p>
                  <p className="mt-1 text-sm text-slate-900">
                    {case_.assignedCollectorId ? 'Collector Assigned' : 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Opened</p>
                  <p className="mt-1 text-sm text-slate-900">
                    {new Date(case_.openedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Next Follow-Up</p>
                  <p className="mt-1 text-sm text-slate-900">
                    {case_.nextFollowUpAt ? new Date(case_.nextFollowUpAt).toLocaleDateString() : 'Not scheduled'}
                  </p>
                </div>
              </div>
              {case_.summary && (
                <div>
                  <p className="text-xs font-medium text-slate-500">Summary</p>
                  <p className="mt-1 text-sm text-slate-900">{case_.summary}</p>
                </div>
              )}
              {case_.notes && (
                <div>
                  <p className="text-xs font-medium text-slate-500">Notes</p>
                  <p className="mt-1 text-sm text-slate-900">{case_.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Follow-Ups */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold text-slate-700">Recent Follow-Ups</h2>
              <Link
                to="#"
                onClick={() => setActiveTab('followups')}
                className="text-sm font-semibold text-cyan-700 hover:text-cyan-800"
              >
                View All →
              </Link>
            </div>
            <div className="divide-y divide-slate-200">
              {followUpsData?.followUps?.slice(0, 5).map((followUp) => (
                <div key={followUp.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {followUp.actionType === 'PHONE_CALL' && <Phone className="h-4 w-4 text-slate-400" />}
                        {followUp.actionType === 'EMAIL' && <Mail className="h-4 w-4 text-slate-400" />}
                        <span className="text-sm font-medium text-slate-900">{followUp.actionType}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{followUp.notes}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(followUp.recordedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="p-8 text-center text-slate-500">No follow-ups recorded</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'followups' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-700">Follow-Up History</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {followUpsData?.followUps?.map((followUp) => (
              <div key={followUp.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{followUp.actionType}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{followUp.outcome}</span>
                    </div>
                    {followUp.contactPerson && (
                      <p className="mt-1 text-sm text-slate-600">Contact: {followUp.contactPerson}</p>
                    )}
                    <p className="mt-1 text-sm text-slate-900">{followUp.notes}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Recorded: {new Date(followUp.recordedAt).toLocaleString()}
                    </p>
                    {followUp.nextFollowUpAt && (
                      <p className="mt-1 text-xs text-amber-600">
                        Next Follow-Up: {new Date(followUp.nextFollowUpAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )) || (
              <div className="p-8 text-center text-slate-500">No follow-ups recorded</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'promises' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-700">Payment Promises</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {promisesData?.promises?.map((promise) => (
              <div key={promise.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <span className="text-lg font-bold text-slate-900">
                        KES {(promise.promisedAmount || 0).toLocaleString()}
                      </span>
                      {promise.isFulfilled && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          FULFILLED
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      Promised Date: {new Date(promise.promisedDate).toLocaleDateString()}
                    </p>
                    {promise.notes && (
                      <p className="mt-1 text-sm text-slate-900">{promise.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            )) || (
              <div className="p-8 text-center text-slate-500">No payment promises recorded</div>
            )}
          </div>
        </div>
      )}

      {/* Follow-Up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]">
            <h3 className="text-lg font-bold text-slate-900">Record Follow-Up</h3>
            <p className="mt-1 text-sm text-slate-600">{case_.caseNumber}</p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Action Type <span className="text-rose-600">*</span>
                </label>
                <select
                  value={followUpData.actionType}
                  onChange={(e) => setFollowUpData({ ...followUpData, actionType: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
                >
                  {Object.entries(FOLLOW_UP_ACTION_TYPES).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Outcome <span className="text-rose-600">*</span>
                </label>
                <select
                  value={followUpData.outcome}
                  onChange={(e) => setFollowUpData({ ...followUpData, outcome: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
                >
                  {Object.entries(FOLLOW_UP_OUTCOMES).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={followUpData.contactPerson}
                  onChange={(e) => setFollowUpData({ ...followUpData, contactPerson: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={followUpData.contactPhone}
                  onChange={(e) => setFollowUpData({ ...followUpData, contactPhone: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Next Follow-Up Date
                </label>
                <input
                  type="datetime-local"
                  value={followUpData.nextFollowUpAt}
                  onChange={(e) => setFollowUpData({ ...followUpData, nextFollowUpAt: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Notes <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={followUpData.notes}
                  onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                  placeholder="Describe the follow-up action..."
                  rows={4}
                  className="min-h-16 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFollowUp}
                disabled={createFollowUpMutation.isPending || !followUpData.notes}
                className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createFollowUpMutation.isPending ? 'Recording...' : 'Record Follow-Up'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
