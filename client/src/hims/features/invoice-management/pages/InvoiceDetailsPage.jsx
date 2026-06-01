import { useState } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, CheckCircle, XCircle, AlertTriangle, FileText, Plus, Trash2 } from "lucide-react";
import { useInvoice, useApproveInvoice, useCancelInvoice, useDisputeInvoice, useAddLineItem, useDeleteLineItem } from "../hooks/useInvoices";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/Dialog";
import { toast } from "sonner";
import { formatCurrency } from "../utils/moneyFormat";
import { getInvoiceStatusColor, INVOICE_LINE_ITEM_TYPE } from "../utils/invoiceStatus";
import InvoicePreview from "./InvoicePreview";

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cancelReason, setCancelReason] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: invoice, isLoading } = useInvoice(id);
  const approveMutation = useApproveInvoice();
  const cancelMutation = useCancelInvoice();
  const disputeMutation = useDisputeInvoice();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-slate-400">
        <FileText size={48} className="mb-3 opacity-20" />
        <p className="font-medium">Invoice not found</p>
        <Button variant="link" onClick={() => navigate("/invoice-management")}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  const handleApprove = () => {
    approveMutation.mutate(id, {
      onSuccess: () => {},
    });
  };

  const handleCancel = () => {
    if (cancelReason.length < 10) {
      toast.error("Cancellation reason must be at least 10 characters");
      return;
    }
    cancelMutation.mutate({ id, reason: cancelReason }, {
      onSuccess: () => {
        setIsCancelDialogOpen(false);
        setCancelReason("");
      },
    });
  };

  const handleDispute = () => {
    if (disputeReason.length < 10) {
      toast.error("Dispute reason must be at least 10 characters");
      return;
    }
    disputeMutation.mutate({ id, reason: disputeReason }, {
      onSuccess: () => {
        setIsDisputeDialogOpen(false);
        setDisputeReason("");
      },
    });
  };

  const canApprove = ["DRAFT", "PENDING"].includes(invoice.status);
  const canCancel = !["CANCELLED", "PAID", "WRITTEN_OFF"].includes(invoice.status);
  const canDispute = !["DISPUTED", "CANCELLED", "PAID"].includes(invoice.status);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/invoice-management")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{invoice.invoiceNumber}</h1>
            <div className="flex items-center gap-2">
              <Badge variant={getInvoiceStatusColor(invoice.status)}>{invoice.status}</Badge>
              <span className="text-sm text-slate-500">{invoice.invoiceType}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          {canApprove && (
            <Button onClick={handleApprove} disabled={approveMutation.isPending}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {approveMutation.isPending ? "Approving..." : "Approve"}
            </Button>
          )}
          {canCancel && (
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Invoice</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Please provide a reason for cancellation.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reason">Cancellation Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Enter reason for cancellation..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                    No, Keep Invoice
                  </Button>
                  <Button variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending}>
                    {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel Invoice"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {canDispute && (
            <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Dispute
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dispute Invoice</DialogTitle>
                  <DialogDescription>
                    Open a formal dispute for this invoice.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dispute-reason">Dispute Reason</Label>
                    <Textarea
                      id="dispute-reason"
                      placeholder="Explain why you are disputing this invoice..."
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDisputeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleDispute} disabled={disputeMutation.isPending}>
                    {disputeMutation.isPending ? "Submitting..." : "Submit Dispute"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Invoice Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-slate-500">Credit Account</Label>
              <p className="font-medium">{invoice.creditAccount?.name || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Patient Name</Label>
              <p className="font-medium">{invoice.patientName || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Patient Number</Label>
              <p className="font-medium">{invoice.patientNumber || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Invoice Date</Label>
              <p className="font-medium">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Due Date</Label>
              <p className={`font-medium ${new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID' ? 'text-red-600' : ''}`}>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Notes</Label>
              <p className="font-medium">{invoice.notes || "-"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Gross Amount</span>
              <span className="font-medium">{formatCurrency(invoice.grossAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Discount</span>
              <span className="font-medium text-green-600">-{formatCurrency(invoice.discountAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Adjustments</span>
              <span className="font-medium">-{formatCurrency(invoice.adjustmentAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Paid Amount</span>
              <span className="font-medium text-blue-600">{formatCurrency(invoice.paidAmount)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Outstanding</span>
                <span className="text-red-600">{formatCurrency(invoice.outstandingAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invoice.lineItems && invoice.lineItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs">{item.itemType}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(item.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-32 items-center justify-center text-slate-400">
              <p>No line items</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Preview Modal */}
      {isPreviewOpen && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Invoice Preview - {invoice.invoiceNumber}</DialogTitle>
            </DialogHeader>
            <InvoicePreview invoiceId={id} />
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
