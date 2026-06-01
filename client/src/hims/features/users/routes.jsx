import { Routes, Route, Navigate } from "react-router-dom";
import UsersPage from "./pages/UsersPage";
import UserDetailPage from "./pages/UserDetailPage";
import RolesPage from "../../pages/UserManagement/RolesPage";
import DepartmentsPage from "../../pages/UserManagement/DepartmentsPage";
import BranchesPage from "../../pages/UserManagement/BranchesPage";

export default function UserRoutes() {
  return (
    <Routes>
      <Route index element={<UsersPage />} />
      <Route path="roles" element={<RolesPage />} />
      <Route path="departments" element={<DepartmentsPage />} />
      <Route path="branches" element={<BranchesPage />} />
      <Route path=":id" element={<UserDetailPage />} />
      <Route path="*" element={<Navigate to="/admin/users" replace />} />
    </Routes>
  );
}
