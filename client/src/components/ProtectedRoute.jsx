import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = localStorage.getItem("accessToken");

  if (!isAuthenticated && !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
