import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AuthRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "CASHIER_SUPERVISOR", "CASHIER", "FINANCE_MANAGER", "AUDITOR"]}>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}
