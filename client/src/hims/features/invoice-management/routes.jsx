import { Routes, Route, Navigate } from "react-router-dom";
import InvoicesPage from "./pages/InvoicesPage";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import InvoiceDetailsPage from "./pages/InvoiceDetailsPage";
import InvoiceReportsPage from "./pages/InvoiceReportsPage";
import InvoiceDisputesPage from "./pages/InvoiceDisputesPage";

export default function InvoiceManagementRoutes() {
  return (
    <Routes>
      <Route index element={<InvoicesPage />} />
      <Route path="create" element={<CreateInvoicePage />} />
      <Route path="reports" element={<InvoiceReportsPage />} />
      <Route path="disputes" element={<InvoiceDisputesPage />} />
      <Route path=":id" element={<InvoiceDetailsPage />} />
      <Route path="*" element={<Navigate to="/invoice-management" replace />} />
    </Routes>
  );
}
