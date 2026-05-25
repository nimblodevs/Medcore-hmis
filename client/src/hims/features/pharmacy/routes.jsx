import { Routes, Route, Navigate } from "react-router-dom";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import DrugsPage from "./pages/DrugsPage";
import StockPage from "./pages/StockPage";
import DispensingPage from "./pages/DispensingPage";
import PurchasesPage from "./pages/PurchasesPage";
import ReportsPage from "./pages/ReportsPage";

export default function PharmacyRoutes() {
  return (
    <Routes>
      <Route index element={<PharmacyDashboard />} />
      <Route path="dashboard" element={<PharmacyDashboard />} />
      <Route path="drugs" element={<DrugsPage />} />
      <Route path="stock" element={<StockPage />} />
      <Route path="dispensing" element={<DispensingPage />} />
      <Route path="purchases" element={<PurchasesPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="*" element={<Navigate to="/pharmacy/dashboard" replace />} />
    </Routes>
  );
}
