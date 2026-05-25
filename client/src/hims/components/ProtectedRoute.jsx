import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "@/store/authStore";

const ProtectedRoute = ({ children, roles = [] }) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = localStorage.getItem("accessToken");

  if (!isAuthenticated && !accessToken) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  const role = user?.role?.name || user?.role || user?.roleName;
  if (roles.length > 0 && role && !roles.includes(role)) {
    return <Navigate to="/appointments" replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
