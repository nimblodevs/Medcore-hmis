import { useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const PatientRegistration = lazy(() => import("./Patient/RegistrationForm"));
const PatientList = lazy(() => import("./Patient/PatientList"));
const OpConsBilling = lazy(() => import("./Finance/OpConsBilling"));
const Debtors = lazy(() => import("./Finance/Debtors"));
const Schemes = lazy(() => import("./Finance/Schemes"));
const Invoices = lazy(() => import("./Finance/Invoices"));
const CreditPayments = lazy(() => import("./Finance/CreditPayments"));
const Dispatches = lazy(() => import("./Finance/Dispatches"));
const InsuranceClaimPayments = lazy(() => import("./Finance/InsuranceClaimPayments"));
const AgingAnalysis = lazy(() => import("./Finance/AgingAnalysis"));
const FinanceDashboard = lazy(() => import("./Finance/FinanceDashboard"));

const PageLoader = () => (
  <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-slate-500">
    <Loader2 className="size-10 animate-spin text-cyan-600" />
    <p className="font-medium animate-pulse">Loading experience...</p>
  </div>
);

const HMS = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const getActivePage = () => {
    const path = location.pathname;
    if (path === "/patients/register") return "patients";
    if (path === "/patients/list") return "patient_list";
    if (path === "/finance/dashboard") return "finance_dashboard";
    if (path === "/finance/op-cons-billing") return "op_cons_billing";
    if (path === "/finance/debtors") return "debtors";
    if (path === "/finance/schemes") return "schemes";
    if (path === "/finance/invoices") return "invoices";
    if (path === "/finance/credit-payments") return "credit_payments";
    if (path === "/finance/dispatches") return "dispatches";
    if (path === "/finance/insurance-claim-payments") return "insurance_claim_payments";
    if (path === "/finance/aging-analysis") return "aging_analysis";
    if (path === "/dashboard") return "dashboard";
    return "patients";
  };

  const handlePageChange = (page) => {
    if (page === "patients") navigate("/patients/register");
    else if (page === "patient_list") navigate("/patients/list");
    else if (page === "finance_dashboard") navigate("/finance/dashboard");
    else if (page === "op_cons_billing") navigate("/finance/op-cons-billing");
    else if (page === "debtors") navigate("/finance/debtors");
    else if (page === "schemes") navigate("/finance/schemes");
    else if (page === "invoices") navigate("/finance/invoices");
    else if (page === "credit_payments") navigate("/finance/credit-payments");
    else if (page === "dispatches") navigate("/finance/dispatches");
    else if (page === "insurance_claim_payments") navigate("/finance/insurance-claim-payments");
    else if (page === "aging_analysis") navigate("/finance/aging-analysis");
    else if (page === "dashboard") navigate("/dashboard");
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        isOpen={isSidebarOpen}
        activePage={getActivePage()}
        onPageChange={handlePageChange}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onMenuClick={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/patients/register" element={<PatientRegistration />} />
                <Route path="/patients/list" element={<PatientList onRegisterClick={() => navigate("/patients/register")} />} />
                <Route path="/finance/op-cons-billing" element={<OpConsBilling />} />
                <Route path="/finance/debtors" element={<Debtors />} />
                <Route path="/finance/schemes" element={<Schemes />} />
                <Route path="/finance/invoices" element={<Invoices />} />
                <Route path="/finance/credit-payments" element={<CreditPayments />} />
                <Route path="/finance/dispatches" element={<Dispatches />} />
                <Route path="/finance/insurance-claim-payments" element={<InsuranceClaimPayments />} />
                <Route path="/finance/aging-analysis" element={<AgingAnalysis />} />
                <Route path="/finance/dashboard" element={<FinanceDashboard />} />
                <Route path="/dashboard" element={
                  <div className="flex h-full items-center justify-center py-20">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-slate-900 capitalize">Dashboard</h2>
                      <p className="text-slate-500">This module is part of the restore point and will be fully available soon.</p>
                    </div>
                  </div>
                } />
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
