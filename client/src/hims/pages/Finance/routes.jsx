import { Routes, Route, Navigate } from "react-router-dom";
import FinanceDashboard from "./FinanceDashboard";
import OpConsBilling from "./OpConsBilling";
import OpServiceBilling from "./OpServiceBilling";
import CashierTransactions from "./CashierTransactions";
import Debtors from "./Debtors";
import Schemes from "./Schemes";
import Invoices from "./Invoices";
import InterimInvoices from "./InterimInvoices";
import InvoicePreview from "./InvoicePreview";
import CreditPayments from "./CreditPayments";
import Dispatches from "./Dispatches";
import InsuranceClaimPayments from "./InsuranceClaimPayments";
import AgingAnalysis from "./AgingAnalysis";

export default function FinanceRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<FinanceDashboard />} />
      <Route path="op-cons-billing" element={<OpConsBilling />} />
      <Route path="op-service-billing" element={<OpServiceBilling />} />
      <Route path="cashier-transactions" element={<CashierTransactions />} />
      <Route path="debtors" element={<Debtors />} />
      <Route path="schemes" element={<Schemes />} />
      <Route path="invoices" element={<Invoices />} />
      <Route path="invoices/interim" element={<InterimInvoices />} />
      <Route path="invoices/preview/:invoiceId" element={<InvoicePreview />} />
      <Route path="credit-payments" element={<CreditPayments />} />
      <Route path="dispatches" element={<Dispatches />} />
      <Route path="insurance-claim-allocation" element={<InsuranceClaimPayments />} />
      <Route path="aging-analysis" element={<AgingAnalysis />} />
      <Route path="*" element={<Navigate to="/finance/dashboard" replace />} />
    </Routes>
  );
}
