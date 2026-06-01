import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "@/store/authStore";

const resolveRoleHomePath = (role) => {
  if (["SUPER_ADMIN", "ADMIN", "HOSPITAL_ADMIN", "BRANCH_ADMIN"].includes(role)) return "/admin/users";
  if (["CASHIER_SUPERVISOR", "CASHIER", "ACCOUNTANT"].includes(role)) return "/cash-management";
  if (["FINANCE_MANAGER", "CREDIT_CONTROLLER", "AUDITOR", "CLAIMS_OFFICER", "BILLING_OFFICER"].includes(role)) return "/finance/dashboard";
  if (["PHARMACY_MANAGER", "PHARMACIST", "PHARMACY_CASHIER"].includes(role)) return "/pharmacy/dashboard";
  if (["NURSE", "DOCTOR", "CLINICIAN", "RECEPTIONIST", "CLINIC_MANAGER"].includes(role)) return "/appointments";

  return "/auth/profile";
};

const ProtectedRoute = ({ children, roles = [] }) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = localStorage.getItem("accessToken");

  if (!isAuthenticated && !accessToken) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  const role = user?.role?.name || user?.role || user?.roleName;
  const isSuperAdmin = role === "SUPER_ADMIN";

  if (roles.length > 0 && !isSuperAdmin && (!role || !roles.includes(role))) {
    return <Navigate to={resolveRoleHomePath(role)} replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
