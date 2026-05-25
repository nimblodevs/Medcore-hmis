import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus,
  User,
  ChevronDown,
  Calendar, 
  ClipboardList, 
  Settings, 
  HelpCircle,
  Activity,
  HeartPulse,
  Database,
  Building2,
  ShieldCheck,
  Receipt,
  FileText,
  CreditCard,
  Send,
  BarChart3,
  Package,
  Pill,
  ShoppingCart,
  Syringe,
  UserCog,
  Wallet,
  AlertCircle,
  Network,
  KeyRound,
} from "lucide-react";

const PAGE_ROUTES = {
  dashboard: "/dashboard",
  patients: "/patients/register",
  patient_list: "/patients/list",
  finance_dashboard: "/finance/dashboard",
  op_cons_billing: "/finance/op-cons-billing",
  op_service_billing: "/finance/op-service-billing",
  cashier_transactions: "/finance/cashier-transactions",
  debtors: "/finance/debtors",
  schemes: "/finance/schemes",
  invoices: "/finance/invoices",
  interim_invoices: "/finance/invoices/interim",
  credit_payments: "/finance/credit-payments",
  dispatches: "/finance/dispatches",
  insurance_claim_allocation: "/finance/insurance-claim-allocation",
  aging_analysis: "/finance/aging-analysis",
  pharmacy_dashboard: "/pharmacy/dashboard",
  pharmacy_drugs: "/pharmacy/drugs",
  pharmacy_stock: "/pharmacy/stock",
  pharmacy_dispensing: "/pharmacy/dispensing",
  pharmacy_purchases: "/pharmacy/purchases",
  pharmacy_reports: "/pharmacy/reports",
  user_management_users: "/admin/users",
  user_management_roles: "/admin/users/roles",
  user_management_departments: "/admin/users/departments",
  user_management_branches: "/admin/users/branches",
  appointments: "/appointments",
  prescriptions: "/emr",
  cash_dashboard: "/cash-management",
  cash_counters: "/cash-management/counters",
  cash_cashiers: "/cash-management/cashiers",
  cash_sessions: "/cash-management/sessions",
  analytics: "/dashboard",
  profile: "/auth/profile",
  reports: "/finance/dashboard",
  settings: "/dashboard",
};

const getActivePageFromPath = (pathname) => {
  if (pathname.startsWith("/patients/list")) return "patient_list";
  if (pathname.startsWith("/patients")) return "patients";
  if (pathname.startsWith("/finance/op-cons-billing")) return "op_cons_billing";
  if (pathname.startsWith("/finance/op-service-billing")) return "op_service_billing";
  if (pathname.startsWith("/finance/cashier-transactions")) return "cashier_transactions";
  if (pathname.startsWith("/finance/debtors")) return "debtors";
  if (pathname.startsWith("/finance/schemes")) return "schemes";
  if (pathname.startsWith("/finance/invoices/interim")) return "interim_invoices";
  if (pathname.startsWith("/finance/invoices")) return "invoices";
  if (pathname.startsWith("/finance/credit-payments")) return "credit_payments";
  if (pathname.startsWith("/finance/dispatches")) return "dispatches";
  if (pathname.startsWith("/finance/insurance-claim-allocation")) return "insurance_claim_allocation";
  if (pathname.startsWith("/finance/aging-analysis")) return "aging_analysis";
  if (pathname.startsWith("/finance")) return "finance_dashboard";
  if (pathname.startsWith("/pharmacy/drugs")) return "pharmacy_drugs";
  if (pathname.startsWith("/pharmacy/stock")) return "pharmacy_stock";
  if (pathname.startsWith("/pharmacy/dispensing")) return "pharmacy_dispensing";
  if (pathname.startsWith("/pharmacy/purchases")) return "pharmacy_purchases";
  if (pathname.startsWith("/pharmacy/reports")) return "pharmacy_reports";
  if (pathname.startsWith("/pharmacy")) return "pharmacy_dashboard";
  if (pathname.startsWith("/admin/users")) return "user_management_users";
  if (pathname.startsWith("/appointments")) return "appointments";
  if (pathname.startsWith("/cash-management/counters")) return "cash_counters";
  if (pathname.startsWith("/cash-management/cashiers")) return "cash_cashiers";
  if (pathname.startsWith("/cash-management/sessions")) return "cash_sessions";
  if (pathname.startsWith("/cash-management")) return "cash_dashboard";
  if (pathname.startsWith("/auth/profile")) return "profile";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  return "appointments";
};

const SidebarItem = ({ icon: Icon, label, active, onClick, isSubItem = false }) => (
<button
  onClick={onClick}
  className={[
    `
    group relative flex w-full items-center gap-1.5
    overflow-hidden rounded-xl
    px-2.5 transition-all duration-200
    `,

    active
      ? `
        bg-gradient-to-r
        from-cyan-50
        via-sky-50
        to-white
        text-cyan-700
      `
      : `
        text-slate-500
        hover:bg-slate-100
        hover:text-slate-900
      `,

    isSubItem
      ? "ml-3 w-[calc(100%-0.75rem)] py-2"
      : "py-2.5",
  ].join(" ")}
>
  {/* Sub-item Connector */}
  {isSubItem && !active && (
    <div
      className="
        absolute -left-2 top-0
        h-full w-px bg-slate-200
      "
    />
  )}

  {/* Icon */}
  {Icon && (
    <div
      className={[
        `
        flex shrink-0 items-center justify-center
        rounded-lg transition-all duration-200
        `,

        isSubItem ? "size-7" : "size-8",

        active
          ? `
            bg-cyan-600
            text-white
          `
          : `
            bg-slate-100
            text-slate-500
            group-hover:bg-white
            group-hover:text-slate-900
          `,
      ].join(" ")}
    >
      <Icon
        size={isSubItem ? 14 : 17}
        strokeWidth={isSubItem ? 2.4 : 2.1}
      />
    </div>
  )}

  {/* Label */}
  <span
    className={[
      "truncate tracking-tight",

      isSubItem
        ? "text-xs font-semibold"
        : "text-sm font-medium",
    ].join(" ")}
  >
    {label}
  </span>

  {/* Soft Hover Overlay */}
  {!active && (
    <div
      className="
        absolute inset-0 opacity-0
        transition-opacity duration-200
        group-hover:opacity-100
        bg-gradient-to-r
        from-transparent
        via-white/10
        to-transparent
      "
    />
  )}
</button>
);

const SidebarDropdown = ({ icon: Icon, label, active, isOpen, onToggle, children }) => (
  <div className="space-y-1">
    <button
      onClick={onToggle}
      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
        active && !isOpen
          ? "bg-cyan-50 text-cyan-700 font-semibold"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={active ? "text-cyan-600" : "text-slate-400 group-hover:text-slate-900"} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ChevronDown 
        size={16} 
        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="mt-1 space-y-1">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Sidebar = ({ isOpen, activePage, onPageChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = activePage ?? getActivePageFromPath(location.pathname);
  const handlePageChange = (page) => {
    onPageChange?.(page);
    const route = PAGE_ROUTES[page];
    if (route) {
      navigate(route);
    }
  };

  const [patientsMenuOpen, setPatientsMenuOpen] = useState(true);
  const [financeMenuOpen, setFinanceMenuOpen] = useState(
    ["finance_dashboard", "op_cons_billing", "debtors", "schemes"].includes(currentPage)
  );
  const [pharmacyMenuOpen, setPharmacyMenuOpen] = useState(
    ["pharmacy_dashboard", "pharmacy_drugs", "pharmacy_stock", "pharmacy_dispensing", "pharmacy_purchases", "pharmacy_reports"].includes(currentPage)
  );
  const cashManagementPages = ["cash_dashboard", "cash_counters", "cash_cashiers", "cash_sessions", "cash_payments", "cash_refunds", "cash_handovers", "cash_reports"];
  const [cashMenuOpen, setCashMenuOpen] = useState(
    cashManagementPages.includes(currentPage)
  );
  const userManagementPages = ["user_management_users", "user_management_roles", "user_management_departments", "user_management_branches"];
  const [userManagementMenuOpen, setUserManagementMenuOpen] = useState(
    userManagementPages.includes(currentPage)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/30">
            <HeartPulse size={22} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Medi<span className="text-cyan-600">Core</span>
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              HMS v0.1
            </p>
          </span>
          
        </div>

        <div className="border-b border-slate-200 px-4 py-4">
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
              MFL 13104
            </p>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              Online
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            Nairobi, Kenya
          </p>
          <p className="mt-1 text-xs text-slate-500">
            General outpatient facility
          </p>
        </div>
      </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-4 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>
          <nav className="space-y-1">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={currentPage === "dashboard"}
              onClick={() => handlePageChange("dashboard")} 
            />
            
            <SidebarDropdown
              icon={Users}
              label="Patient"
              active={currentPage === "patients" || currentPage === "patient_list"}
              isOpen={patientsMenuOpen}
              onToggle={() => setPatientsMenuOpen(!patientsMenuOpen)}
            >
              <SidebarItem 
                icon={UserPlus}
                label="Register Patient" 
                active={currentPage === "patients"}
                isSubItem={true}
                onClick={() => handlePageChange("patients")} 
              />
              <SidebarItem 
                icon={ClipboardList}
                label="Patient Registry" 
                active={currentPage === "patient_list"}
                isSubItem={true}
                onClick={() => handlePageChange("patient_list")} 
              />
            </SidebarDropdown>

            <SidebarDropdown
              icon={Database}
              label="Finance"
              active={["finance_dashboard", "op_cons_billing", "op_service_billing", "cashier_transactions", "debtors", "schemes", "invoices", "interim_invoices", "credit_payments", "dispatches", "insurance_claim_allocation", "aging_analysis"].includes(currentPage)}
              isOpen={financeMenuOpen}
              onToggle={() => setFinanceMenuOpen(!financeMenuOpen)}
            >
              <SidebarItem
                icon={LayoutDashboard}
                label="Overview"
                active={currentPage === "finance_dashboard"}
                isSubItem={true}
                onClick={() => handlePageChange("finance_dashboard")}
              />
              <SidebarItem
                icon={Receipt}
                label="OP Cons Billing"
                active={currentPage === "op_cons_billing"}
                isSubItem={true}
                onClick={() => handlePageChange("op_cons_billing")}
              />
              <SidebarItem
                icon={Receipt}
                label="OP Service Billing"
                active={currentPage === "op_service_billing"}
                isSubItem={true}
                onClick={() => handlePageChange("op_service_billing")}
              />
              <SidebarItem
                icon={CreditCard}
                label="Cashier Transactions"
                active={currentPage === "cashier_transactions"}
                isSubItem={true}
                onClick={() => handlePageChange("cashier_transactions")}
              />
              <SidebarItem
                icon={Building2}
                label="Debtors"
                active={currentPage === "debtors"}
                isSubItem={true}
                onClick={() => handlePageChange("debtors")}
              />
              <SidebarItem
                icon={ShieldCheck}
                label="Schemes"
                active={currentPage === "schemes"}
                isSubItem={true}
                onClick={() => handlePageChange("schemes")}
              />
              <SidebarItem
                icon={FileText}
                label="Invoices"
                active={currentPage === "invoices"}
                isSubItem={true}
                onClick={() => handlePageChange("invoices")}
              />
              <SidebarItem
                icon={FileText}
                label="Interim Invoices"
                active={currentPage === "interim_invoices"}
                isSubItem={true}
                onClick={() => handlePageChange("interim_invoices")}
              />
              <SidebarItem
                icon={CreditCard}
                label="Credit Payments"
                active={currentPage === "credit_payments"}
                isSubItem={true}
                onClick={() => handlePageChange("credit_payments")}
              />
              <SidebarItem
                icon={Send}
                label="Dispatches"
                active={currentPage === "dispatches"}
                isSubItem={true}
                onClick={() => handlePageChange("dispatches")}
              />
              <SidebarItem
                icon={CreditCard}
                label="Claim Allocation"
                active={currentPage === "insurance_claim_allocation"}
                isSubItem={true}
                onClick={() => handlePageChange("insurance_claim_allocation")}
              />
              <SidebarItem
                icon={BarChart3}
                label="Aging Analysis"
                active={currentPage === "aging_analysis"}
                isSubItem={true}
                onClick={() => handlePageChange("aging_analysis")}
              />
            </SidebarDropdown>

            <SidebarDropdown
              icon={Package}
              label="Pharmacy"
              active={["pharmacy_dashboard", "pharmacy_drugs", "pharmacy_stock", "pharmacy_dispensing", "pharmacy_purchases", "pharmacy_reports"].includes(currentPage)}
              isOpen={pharmacyMenuOpen}
              onToggle={() => setPharmacyMenuOpen(!pharmacyMenuOpen)}
            >
              <SidebarItem
                icon={LayoutDashboard}
                label="Overview"
                active={currentPage === "pharmacy_dashboard"}
                isSubItem={true}
                onClick={() => handlePageChange("pharmacy_dashboard")}
              />
              <SidebarItem
                icon={Pill}
                label="Drugs"
                active={currentPage === "pharmacy_drugs"}
                isSubItem={true}
                onClick={() => handlePageChange("pharmacy_drugs")}
              />
              <SidebarItem
                icon={Package}
                label="Stock"
                active={currentPage === "pharmacy_stock"}
                isSubItem={true}
                onClick={() => handlePageChange("pharmacy_stock")}
              />
              <SidebarItem
                icon={Syringe}
                label="Dispensing"
                active={currentPage === "pharmacy_dispensing"}
                isSubItem={true}
                onClick={() => handlePageChange("pharmacy_dispensing")}
              />
              <SidebarItem
                icon={ShoppingCart}
                label="Purchases"
                active={currentPage === "pharmacy_purchases"}
                isSubItem={true}
                onClick={() => handlePageChange("pharmacy_purchases")}
              />
              <SidebarItem
                icon={BarChart3}
                label="Reports"
                active={currentPage === "pharmacy_reports"}
                isSubItem={true}
                onClick={() => handlePageChange("pharmacy_reports")}
              />
            </SidebarDropdown>

            <SidebarDropdown
              icon={UserCog}
              label="User Management"
              active={userManagementPages.includes(currentPage)}
              isOpen={userManagementMenuOpen}
              onToggle={() => setUserManagementMenuOpen(!userManagementMenuOpen)}
            >
              <SidebarItem
                icon={Users}
                label="Users"
                active={currentPage === "user_management_users"}
                isSubItem={true}
                onClick={() => handlePageChange("user_management_users")}
              />
              <SidebarItem
                icon={KeyRound}
                label="Roles"
                active={currentPage === "user_management_roles"}
                isSubItem={true}
                onClick={() => handlePageChange("user_management_roles")}
              />
              <SidebarItem
                icon={Network}
                label="Departments"
                active={currentPage === "user_management_departments"}
                isSubItem={true}
                onClick={() => handlePageChange("user_management_departments")}
              />
              <SidebarItem
                icon={Building2}
                label="Branches"
                active={currentPage === "user_management_branches"}
                isSubItem={true}
                onClick={() => handlePageChange("user_management_branches")}
              />
            </SidebarDropdown>

            <SidebarItem 
              icon={Calendar} 
              label="Appointments" 
              active={currentPage === "appointments"}
              onClick={() => handlePageChange("appointments")} 
            />
            <SidebarItem 
              icon={ClipboardList} 
              label="Prescriptions" 
              active={currentPage === "prescriptions"}
              onClick={() => handlePageChange("prescriptions")} 
            />
            <SidebarItem
              icon={Wallet}
              label="Cash Management"
              active={currentPage === "cash_dashboard" || currentPage.startsWith("cash_")}
              onClick={() => handlePageChange("cash_dashboard")}
            />
          </nav>

          <div className="mt-8 mb-4 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            System
          </div>
          <nav className="space-y-1">
            <SidebarItem 
              icon={Activity} 
              label="Analytics" 
              active={currentPage === "analytics"}
              onClick={() => handlePageChange("analytics")} 
            />
            <SidebarItem
              icon={User}
              label="My Profile"
              active={currentPage === "profile"}
              onClick={() => handlePageChange("profile")}
            />
            <SidebarItem 
              icon={Database} 
              label="Reports" 
              active={currentPage === "reports"}
              onClick={() => handlePageChange("reports")} 
            />
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              active={currentPage === "settings"}
              onClick={() => handlePageChange("settings")} 
            />
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                <HelpCircle size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-900">Need Help?</p>
                <p className="text-[10px] text-slate-500">Contact IT Support</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
