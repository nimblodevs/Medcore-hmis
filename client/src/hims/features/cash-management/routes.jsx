import { Routes, Route, Navigate } from "react-router-dom";
import CashManagementDashboardPage from "../cash/pages/CashDashboard";
import CashCountersPage from "../cash/pages/CashCountersPage";
import CashierProfilesPage from "../cash/pages/CashierProfilesPage";
import CashSessionsPage from "../cash/pages/CashSessionsPage";
import CashSessionDetailsPage from "../cash/pages/CashSessionDetailsPage";

export default function CashManagementRoutes() {
  return (
    <Routes>
      <Route index element={<CashManagementDashboardPage />} />
      <Route path="counters" element={<CashCountersPage />} />
      <Route path="counters/:id" element={<CashCountersPage />} />
      <Route path="cashiers" element={<CashierProfilesPage />} />
      <Route path="cashiers/:id" element={<CashierProfilesPage />} />
      <Route path="sessions" element={<CashSessionsPage />} />
      <Route path="sessions/new" element={<CashSessionsPage />} />
      <Route path="sessions/:id" element={<CashSessionDetailsPage />} />
      <Route path="sessions/:id/payments/new" element={<CashSessionDetailsPage />} />
      <Route path="*" element={<Navigate to="/cash-management" replace />} />
    </Routes>
  );
}
