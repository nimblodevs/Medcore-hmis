export const CASE_STATUSES = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  PROMISED_TO_PAY: 'PROMISED_TO_PAY',
  DISPUTED: 'DISPUTED',
  ESCALATED: 'ESCALATED',
  ON_HOLD: 'ON_HOLD',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
};

export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const AGING_BUCKETS = {
  CURRENT: 'CURRENT',
  DAYS_1_30: 'DAYS_1_30',
  DAYS_31_60: 'DAYS_31_60',
  DAYS_61_90: 'DAYS_61_90',
  DAYS_91_120: 'DAYS_91_120',
  OVER_120: 'OVER_120',
};

export const FOLLOW_UP_ACTION_TYPES = {
  PHONE_CALL: 'PHONE_CALL',
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  LETTER: 'LETTER',
  IN_PERSON_VISIT: 'IN_PERSON_VISIT',
  INTERNAL_NOTE: 'INTERNAL_NOTE',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  DISPUTE_DISCUSSION: 'DISPUTE_DISCUSSION',
  ESCALATION: 'ESCALATION',
  OTHER: 'OTHER',
};

export const FOLLOW_UP_OUTCOMES = {
  NO_ANSWER: 'NO_ANSWER',
  PROMISED_TO_PAY: 'PROMISED_TO_PAY',
  PAYMENT_MADE: 'PAYMENT_MADE',
  DISPUTED: 'DISPUTED',
  REQUESTED_STATEMENT: 'REQUESTED_STATEMENT',
  ESCALATE: 'ESCALATE',
  FOLLOW_UP_REQUIRED: 'FOLLOW_UP_REQUIRED',
  RESOLVED: 'RESOLVED',
  OTHER: 'OTHER',
};

export const HOLD_STATUSES = {
  NONE: 'NONE',
  RECOMMENDED: 'RECOMMENDED',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  RELEASE_REQUESTED: 'RELEASE_REQUESTED',
  RELEASED: 'RELEASED',
  REJECTED: 'REJECTED',
};

export const DISPUTE_STATUSES = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED',
};

export const WRITE_OFF_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  POSTED: 'POSTED',
  CANCELLED: 'CANCELLED',
};

// Status display labels
export const getStatusLabel = (status) => {
  const labels = {
    // Case statuses
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    PROMISED_TO_PAY: 'Promised to Pay',
    DISPUTED: 'Disputed',
    ESCALATED: 'Escalated',
    ON_HOLD: 'On Hold',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    CANCELLED: 'Cancelled',
    // Hold statuses
    RECOMMENDED: 'Recommended',
    APPROVED: 'Approved',
    ACTIVE: 'Active',
    RELEASE_REQUESTED: 'Release Requested',
    RELEASED: 'Released',
    REJECTED: 'Rejected',
    // Dispute statuses
    UNDER_REVIEW: 'Under Review',
    ACCEPTED: 'Accepted',
    // Write-off statuses
    PENDING: 'Pending',
    POSTED: 'Posted',
  };
  return labels[status] || status;
};

// Risk level color mapping
export const getRiskColor = (riskLevel) => {
  const colors = {
    LOW: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    CRITICAL: 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return colors[riskLevel] || 'bg-slate-100 text-slate-800 border-slate-200';
};

// Aging bucket color mapping
export const getAgingBucketColor = (bucket) => {
  const colors = {
    CURRENT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    DAYS_1_30: 'bg-blue-100 text-blue-800 border-blue-200',
    DAYS_31_60: 'bg-amber-100 text-amber-800 border-amber-200',
    DAYS_61_90: 'bg-orange-100 text-orange-800 border-orange-200',
    DAYS_91_120: 'bg-red-100 text-red-800 border-red-200',
    OVER_120: 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return colors[bucket] || 'bg-slate-100 text-slate-800 border-slate-200';
};

// Format aging bucket label
export const getAgingBucketLabel = (bucket) => {
  const labels = {
    CURRENT: 'Current',
    DAYS_1_30: '1-30 Days',
    DAYS_31_60: '31-60 Days',
    DAYS_61_90: '61-90 Days',
    DAYS_91_120: '91-120 Days',
    OVER_120: 'Over 120 Days',
  };
  return labels[bucket] || bucket;
};

// Format follow-up action type label
export const getFollowUpActionLabel = (actionType) => {
  const labels = {
    PHONE_CALL: 'Phone Call',
    EMAIL: 'Email',
    SMS: 'SMS',
    LETTER: 'Letter',
    IN_PERSON_VISIT: 'In-Person Visit',
    INTERNAL_NOTE: 'Internal Note',
    PAYMENT_RECEIVED: 'Payment Received',
    DISPUTE_DISCUSSION: 'Dispute Discussion',
    ESCALATION: 'Escalation',
    OTHER: 'Other',
  };
  return labels[actionType] || actionType;
};

// Format follow-up outcome label
export const getFollowUpOutcomeLabel = (outcome) => {
  const labels = {
    NO_ANSWER: 'No Answer',
    PROMISED_TO_PAY: 'Promised to Pay',
    PAYMENT_MADE: 'Payment Made',
    DISPUTED: 'Disputed',
    REQUESTED_STATEMENT: 'Requested Statement',
    ESCALATE: 'Escalate',
    FOLLOW_UP_REQUIRED: 'Follow-Up Required',
    RESOLVED: 'Resolved',
    OTHER: 'Other',
  };
  return labels[outcome] || outcome;
};
