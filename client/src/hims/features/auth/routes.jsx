import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

export default function AuthRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route 
        path="profile" 
        element={<ProfilePage />} 
      />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}
