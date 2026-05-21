import { useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const PatientRegistration = lazy(() => import("./Patient/RegistrationForm"));
const PatientList = lazy(() => import("./Patient/PatientList"));
const OpConsBilling = lazy(() => import("./Finance/OpConsBilling"));
const OpServiceBilling = lazy(() => import("./Finance/OpServiceBilling"));
const CashierTransactions = lazy(() => import("./Finance/CashierTransactions"));
const Debtors = lazy(() => import("./Finance/Debtors"));
const Schemes = lazy(() => import("./Finance/Schemes"));
const Invoices = lazy(() => import("./Finance/Invoices"));
const InterimInvoices = lazy(() => import("./Finance/InterimInvoices"));
const InvoicePreview = lazy(() => import("./Finance/InvoicePreview"));
const CreditPayments = lazy(() => import("./Finance/CreditPayments"));
const Dispatches = lazy(() => import("./Finance/Dispatches"));
const InsuranceClaimPayments = lazy(() => import("./Finance/InsuranceClaimPayments"));
const AgingAnalysis = lazy(() => import("./Finance/AgingAnalysis"));
const FinanceDashboard = lazy(() => import("./Finance/FinanceDashboard"));
const PharmacyDashboard = lazy(() => import("../features/pharmacy/pages/PharmacyDashboard"));
const DrugsPage = lazy(() => import("../features/pharmacy/pages/DrugsPage"));
const StockPage = lazy(() => import("../features/pharmacy/pages/StockPage"));
const DispensingPage = lazy(() => import("../features/pharmacy/pages/DispensingPage"));
const PurchasesPage = lazy(() => import("../features/pharmacy/pages/PurchasesPage"));
const PharmacyReportsPage = lazy(() => import("../features/pharmacy/pages/ReportsPage"));
const UsersPage = lazy(() => import("./UserManagement/UsersPage"));
const RolesPage = lazy(() => import("./UserManagement/RolesPage"));
const DepartmentsPage = lazy(() => import("./UserManagement/DepartmentsPage"));
const BranchesPage = lazy(() => import("./UserManagement/BranchesPage"));

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
    if (path === "/finance/op-service-billing") return "op_service_billing";
    if (path === "/finance/cashier-transactions") return "cashier_transactions";
    if (path === "/finance/debtors") return "debtors";
    if (path === "/finance/schemes") return "schemes";
    if (path === "/finance/invoices/interim") return "interim_invoices";
    if (path === "/finance/invoices" || path.startsWith("/finance/invoices/")) return "invoices";
    if (path === "/finance/credit-payments") return "credit_payments";
    if (path === "/finance/dispatches") return "dispatches";
    if (path === "/finance/insurance-claim-allocation") return "insurance_claim_allocation";
    if (path === "/finance/aging-analysis") return "aging_analysis";
    if (path === "/pharmacy/dashboard") return "pharmacy_dashboard";
    if (path === "/pharmacy/drugs") return "pharmacy_drugs";
    if (path === "/pharmacy/stock") return "pharmacy_stock";
    if (path === "/pharmacy/dispensing") return "pharmacy_dispensing";
    if (path === "/pharmacy/purchases") return "pharmacy_purchases";
    if (path === "/pharmacy/reports") return "pharmacy_reports";
    if (path === "/admin/users") return "user_management_users";
    if (path === "/admin/roles") return "user_management_roles";
    if (path === "/admin/departments") return "user_management_departments";
    if (path === "/admin/branches") return "user_management_branches";
    if (path === "/dashboard") return "dashboard";
    return "patients";
  };

  const handlePageChange = (page) => {
    if (page === "patients") navigate("/patients/register");
    else if (page === "patient_list") navigate("/patients/list");
    else if (page === "finance_dashboard") navigate("/finance/dashboard");
    else if (page === "op_cons_billing") navigate("/finance/op-cons-billing");
    else if (page === "op_service_billing") navigate("/finance/op-service-billing");
    else if (page === "cashier_transactions") navigate("/finance/cashier-transactions");
    else if (page === "debtors") navigate("/finance/debtors");
    else if (page === "schemes") navigate("/finance/schemes");
    else if (page === "invoices") navigate("/finance/invoices");
    else if (page === "interim_invoices") navigate("/finance/invoices/interim");
    else if (page === "credit_payments") navigate("/finance/credit-payments");
    else if (page === "dispatches") navigate("/finance/dispatches");
    else if (page === "insurance_claim_allocation") navigate("/finance/insurance-claim-allocation");
    else if (page === "aging_analysis") navigate("/finance/aging-analysis");
    else if (page === "pharmacy_dashboard") navigate("/pharmacy/dashboard");
    else if (page === "pharmacy_drugs") navigate("/pharmacy/drugs");
    else if (page === "pharmacy_stock") navigate("/pharmacy/stock");
    else if (page === "pharmacy_dispensing") navigate("/pharmacy/dispensing");
    else if (page === "pharmacy_purchases") navigate("/pharmacy/purchases");
    else if (page === "pharmacy_reports") navigate("/pharmacy/reports");
    else if (page === "user_management_users") navigate("/admin/users");
    else if (page === "user_management_roles") navigate("/admin/roles");
    else if (page === "user_management_departments") navigate("/admin/departments");
    else if (page === "user_management_branches") navigate("/admin/branches");
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
                <Route path="/finance/op-service-billing" element={<OpServiceBilling />} />
                <Route path="/finance/cashier-transactions" element={<CashierTransactions />} />
                <Route path="/finance/debtors" element={<Debtors />} />
                <Route path="/finance/schemes" element={<Schemes />} />
                <Route path="/finance/invoices" element={<Invoices />} />
                <Route path="/finance/invoices/interim" element={<InterimInvoices />} />
                <Route path="/finance/invoices/preview/:invoiceId" element={<InvoicePreview />} />
                <Route path="/finance/credit-payments" element={<CreditPayments />} />
                <Route path="/finance/dispatches" element={<Dispatches />} />
                <Route path="/finance/insurance-claim-allocation" element={<InsuranceClaimPayments />} />
                <Route path="/finance/aging-analysis" element={<AgingAnalysis />} />
                <Route path="/finance/dashboard" element={<FinanceDashboard />} />
                <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
                <Route path="/pharmacy/drugs" element={<DrugsPage />} />
                <Route path="/pharmacy/stock" element={<StockPage />} />
                <Route path="/pharmacy/dispensing" element={<DispensingPage />} />
                <Route path="/pharmacy/purchases" element={<PurchasesPage />} />
                <Route path="/pharmacy/reports" element={<PharmacyReportsPage />} />
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/roles" element={<RolesPage />} />
                <Route path="/admin/departments" element={<DepartmentsPage />} />
                <Route path="/admin/branches" element={<BranchesPage />} />
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
