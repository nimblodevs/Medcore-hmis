import { Routes, Route, Navigate } from "react-router-dom";
import {
  AppointmentsDashboardPage,
  BookAppointmentPage,
  AppointmentCheckInPage,
  AppointmentDetailsPage,
  AppointmentCalendarPage,
  AppointmentReportsPage
} from ".";

const AppointmentRoutes = () => {
  return (
    <Routes>
      <Route index element={<AppointmentsDashboardPage />} />
      <Route path="book" element={<BookAppointmentPage />} />
      <Route path="check-in" element={<AppointmentCheckInPage />} />
      <Route path="calendar" element={<AppointmentCalendarPage />} />
      <Route path="reports" element={<AppointmentReportsPage />} />
      <Route path=":id" element={<AppointmentDetailsPage />} />
      <Route path="*" element={<Navigate to="/appointments" replace />} />
    </Routes>
  );
};

export default AppointmentRoutes;
