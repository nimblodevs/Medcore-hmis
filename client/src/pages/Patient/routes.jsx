import { Routes, Route, Navigate } from "react-router-dom";
import PatientRegistration from "./RegistrationForm";
import PatientList from "./PatientList";

export default function PatientRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<PatientRegistration />} />
      <Route path="/list" element={<PatientList />} />
      <Route path="*" element={<Navigate to="/patients/register" replace />} />
    </Routes>
  );
}
