import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import AuthRoutes from "../features/auth/routes";
import UserRoutes from "../features/users/routes";
import CashManagementRoutes from "../features/cash-management/routes";
import InvoiceManagementRoutes from "../features/invoice-management/routes";
import PatientRoutes from "./Patient/routes";
import FinanceRoutes from "./Finance/routes";
import PharmacyRoutes from "../features/pharmacy/routes";
import ProtectedRoute from "../components/ProtectedRoute";

const PageLoader = () => (
  <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-slate-500">
    <Loader2 className="size-10 animate-spin text-cyan-600" />
    <p className="font-medium animate-pulse">Loading experience...</p>
  </div>
);

const HMS = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth/*" element={<AuthRoutes />} />
                
                {/* User Management Routes */}
                <Route path="/admin/users/*" element={
                  <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN"]} />
                }>
                  <Route index element={<UserRoutes />} />
                </Route>
                
                {/* Cash Management Routes */}
                <Route path="/cash-management/*" element={
                  <ProtectedRoute roles={["ADMIN", "CASHIER_SUPERVISOR", "CASHIER", "FINANCE_MANAGER"]} />
                }>
                  <Route index element={<CashManagementRoutes />} />
                </Route>
                
                {/* Invoice Management Routes */}
                <Route path="/invoice-management/*" element={
                  <ProtectedRoute roles={["ADMIN", "FINANCE_MANAGER", "CREDIT_CONTROLLER", "AUDITOR"]} />
                }>
                  <Route index element={<InvoiceManagementRoutes />} />
                </Route>
                
                {/* Patient Routes */}
                <Route path="/patients/*" element={<PatientRoutes />} />
                
                {/* Finance Routes */}
                <Route path="/finance/*" element={<FinanceRoutes />} />
                
                {/* Pharmacy Routes */}
                <Route path="/pharmacy/*" element={<PharmacyRoutes />} />
                
                {/* Dashboard */}
                <Route path="/dashboard" element={
                  <div className="flex h-full items-center justify-center py-20">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-slate-900 capitalize">Dashboard</h2>
                      <p className="text-slate-500">This module is part of the restore point and will be fully available soon.</p>
                    </div>
                  </div>
                } />
                
                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/patients/register" replace />} />
                <Route path="*" element={<Navigate to="/patients/register" replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HMS;
