import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import AuthRoutes from "../features/auth/routes";
import UserRoutes from "../features/users/routes";
import CashManagementRoutes from "../features/cash-management/routes";
import InvoiceManagementRoutes from "../features/invoice-management/routes";
import PatientRoutes from "./Patient/routes";
import FinanceRoutes from "./Finance/routes";
import PharmacyRoutes from "../features/pharmacy/routes.jsx";
import AppointmentRoutes from "../features/appointment-management/routes";
import { EmrDashboardPage, EmrEncounterWorkspacePage } from "../features/emr";
import CreditControlDashboardPage from "../features/credit-control/pages/CreditControlDashboardPage";
import CreditControlCasesPage from "../features/credit-control/pages/CreditControlCasesPage";
import CreditControlCaseDetailsPage from "../features/credit-control/pages/CreditControlCaseDetailsPage";
import FollowUpWorklistPage from "../features/credit-control/pages/FollowUpWorklistPage";
import CreditHoldsPage from "../features/credit-control/pages/CreditHoldsPage";
import CreditDisputesPage from "../features/credit-control/pages/CreditDisputesPage";
import WriteOffRecommendationsPage from "../features/credit-control/pages/WriteOffRecommendationsPage";
import CreditControlReportsPage from "../features/credit-control/pages/CreditControlReportsPage";

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
                <Route path="/auth/*" element={<AuthRoutes />} />

                <Route path="/admin/users/*" element={<UserRoutes />} />
                <Route path="/cash-management/*" element={<CashManagementRoutes />} />
                <Route path="/invoice-management/*" element={<InvoiceManagementRoutes />} />

                <Route path="/credit-control/*">
                  <Route index element={<CreditControlDashboardPage />} />
                  <Route path="cases" element={<CreditControlCasesPage />} />
                  <Route path="cases/:id" element={<CreditControlCaseDetailsPage />} />
                  <Route path="follow-ups" element={<FollowUpWorklistPage />} />
                  <Route path="holds" element={<CreditHoldsPage />} />
                  <Route path="disputes" element={<CreditDisputesPage />} />
                  <Route path="write-offs" element={<WriteOffRecommendationsPage />} />
                  <Route path="reports" element={<CreditControlReportsPage />} />
                  <Route path="*" element={<Navigate to="/credit-control" replace />} />
                </Route>

                <Route path="/patients/*" element={<PatientRoutes />} />
                <Route path="/finance/*" element={<FinanceRoutes />} />
                <Route path="/pharmacy/*" element={<PharmacyRoutes />} />

                <Route path="/emr" element={<EmrDashboardPage />} />
                <Route path="/emr/triage" element={<EmrDashboardPage />} />
                <Route path="/emr/encounters/:id" element={<EmrEncounterWorkspacePage />} />

                <Route path="/appointments/*" element={<AppointmentRoutes />} />

                <Route
                  path="/dashboard"
                  element={
                    <div className="flex h-full items-center justify-center py-20">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900 capitalize">Dashboard</h2>
                        <p className="text-slate-500">This module is part of the restore point and will be fully available soon.</p>
                      </div>
                    </div>
                  }
                />

                <Route path="/" element={<Navigate to="/appointments" replace />} />
                <Route path="*" element={<Navigate to="/appointments" replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HMS;
