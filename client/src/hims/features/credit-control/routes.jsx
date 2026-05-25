import { lazy } from 'react';

const CreditControlDashboardPage = lazy(() => import('../pages/CreditControlDashboardPage'));
const CreditControlCasesPage = lazy(() => import('../pages/CreditControlCasesPage'));
const CreditControlCaseDetailsPage = lazy(() => import('../pages/CreditControlCaseDetailsPage'));
const FollowUpWorklistPage = lazy(() => import('../pages/FollowUpWorklistPage'));
const CreditHoldsPage = lazy(() => import('../pages/CreditHoldsPage'));
const CreditDisputesPage = lazy(() => import('../pages/CreditDisputesPage'));
const WriteOffRecommendationsPage = lazy(() => import('../pages/WriteOffRecommendationsPage'));
const CreditControlReportsPage = lazy(() => import('../pages/CreditControlReportsPage'));

const creditControlRoutes = {
  path: '/credit-control',
  children: [
    { index: true, element: <CreditControlDashboardPage /> },
    { path: 'cases', element: <CreditControlCasesPage /> },
    { path: 'cases/:id', element: <CreditControlCaseDetailsPage /> },
    { path: 'follow-ups', element: <FollowUpWorklistPage /> },
    { path: 'holds', element: <CreditHoldsPage /> },
    { path: 'disputes', element: <CreditDisputesPage /> },
    { path: 'write-offs', element: <WriteOffRecommendationsPage /> },
    { path: 'reports', element: <CreditControlReportsPage /> },
  ],
};

export default creditControlRoutes;
