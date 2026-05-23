import { Routes, Route, Navigate } from "react-router-dom";
import CashManagementDashboardPage from "./pages/CashManagementDashboardPage";
import CashCountersPage from "./pages/CashCountersPage";
import CashierProfilesPage from "./pages/CashierProfilesPage";
import CashSessionsPage from "./pages/CashSessionsPage";
import CashSessionDetailsPage from "./pages/CashSessionDetailsPage";

export default function CashManagementRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CashManagementDashboardPage />} />
      <Route path="/counters" element={<CashCountersPage />} />
      <Route path="/cashiers" element={<CashierProfilesPage />} />
      <Route path="/sessions" element={<CashSessionsPage />} />
      <Route path="/sessions/:id" element={<CashSessionDetailsPage />} />
      <Route path="*" element={<Navigate to="/cash-management" replace />} />
    </Routes>
  );
}
