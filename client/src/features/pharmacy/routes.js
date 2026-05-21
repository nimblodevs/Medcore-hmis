import { lazy } from 'react';

/**
 * Pharmacy Module Routes
 * 
 * Per AGENTS.md: Use lazy loading and Suspense for code splitting
 */

const PharmacyDashboard = lazy(() => import('./pages/PharmacyDashboard'));
const DrugsPage = lazy(() => import('./pages/DrugsPage'));
const StockPage = lazy(() => import('./pages/StockPage'));
const DispensingPage = lazy(() => import('./pages/DispensingPage'));
const PurchasesPage = lazy(() => import('./pages/PurchasesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

export {
  PharmacyDashboard,
  DrugsPage,
  StockPage,
  DispensingPage,
  PurchasesPage,
  ReportsPage,
};
