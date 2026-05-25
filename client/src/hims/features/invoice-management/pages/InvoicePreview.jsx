import { useInvoice } from "../hooks/useInvoices";
import { formatCurrency, formatDate } from "../utils/moneyFormat";
import { Loader2 } from "lucide-react";

export default function InvoicePreview({ invoiceId }) {
  const { data: invoice, isLoading } = useInvoice(invoiceId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center text-slate-500">
        Invoice not found
      </div>
    );
  }

  return (
    <div className="bg-white p-8 print:p-0">
      {/* Invoice Header */}
      <div className="mb-8 flex justify-between items-start border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">INVOICE</h1>
          <p className="text-sm text-slate-500 mt-1">{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">Hospital Name</div>
          <div className="text-xs text-slate-500">P.O. Box 12345</div>
          <div className="text-xs text-slate-500">Nairobi, Kenya</div>
          <div className="text-xs text-slate-500">Tel: +254 700 000 000</div>
        </div>
      </div>

      {/* Bill To & Invoice Details */}
      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Bill To:</h3>
          <div className="text-sm">
            <div className="font-medium">{invoice.creditAccount?.name}</div>
            {invoice.patientName && (
              <>
                <div className="text-slate-600">Patient: {invoice.patientName}</div>
                {invoice.patientNumber && (
                  <div className="text-slate-600">ID: {invoice.patientNumber}</div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="grid grid-cols-2 gap-x-4 justify-items-end">
            <div className="text-sm text-slate-500">Invoice Date:</div>
            <div className="text-sm font-medium">{formatDate(invoice.invoiceDate)}</div>
            
            <div className="text-sm text-slate-500">Due Date:</div>
            <div className="text-sm font-medium">{formatDate(invoice.dueDate)}</div>
            
            <div className="text-sm text-slate-500">Status:</div>
            <div className="text-sm font-medium">{invoice.status}</div>
            
            <div className="text-sm text-slate-500">Type:</div>
            <div className="text-sm font-medium">{invoice.invoiceType}</div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="py-2 text-left text-xs font-semibold text-slate-600 uppercase">Description</th>
              <th className="py-2 text-center text-xs font-semibold text-slate-600 uppercase">Qty</th>
              <th className="py-2 text-right text-xs font-semibold text-slate-600 uppercase">Unit Price</th>
              <th className="py-2 text-right text-xs font-semibold text-slate-600 uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems && invoice.lineItems.length > 0 ? (
              invoice.lineItems.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-3 text-sm">
                    <div className="font-medium">{item.description}</div>
                    <div className="text-xs text-slate-500">{item.itemType}</div>
                  </td>
                  <td className="py-3 text-sm text-center">{item.quantity}</td>
                  <td className="py-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 text-sm text-right font-medium">{formatCurrency(item.totalAmount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-slate-500">
                  No line items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="ml-auto w-64 space-y-2 border-t-2 border-slate-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Gross Amount:</span>
          <span className="font-medium">{formatCurrency(invoice.grossAmount)}</span>
        </div>
        {invoice.discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Discount:</span>
            <span className="text-green-600">-{formatCurrency(invoice.discountAmount)}</span>
          </div>
        )}
        {invoice.adjustmentAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Adjustments:</span>
            <span className="text-green-600">-{formatCurrency(invoice.adjustmentAmount)}</span>
          </div>
        )}
        {invoice.paidAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Paid:</span>
            <span className="text-blue-600">{formatCurrency(invoice.paidAmount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
          <span>Outstanding:</span>
          <span className="text-red-600">{formatCurrency(invoice.outstandingAmount)}</span>
        </div>
      </div>

      {/* Footer Notes */}
      {invoice.notes && (
        <div className="mt-8 border-t pt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Notes:</h3>
          <p className="text-sm text-slate-600">{invoice.notes}</p>
        </div>
      )}

      {/* Payment Terms */}
      <div className="mt-8 border-t pt-4 text-center text-xs text-slate-500">
        <p>Payment is due within 30 days. Please make checks payable to Hospital Name.</p>
        <p className="mt-1">For inquiries, contact our billing department at billing@hospital.com</p>
      </div>
    </div>
  );
}
