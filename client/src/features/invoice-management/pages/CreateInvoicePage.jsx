import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Plus, Trash2, Eye, CheckCircle, XCircle, AlertTriangle, DollarSign } from "lucide-react";
import { useInvoice, useAddLineItem, useDeleteLineItem, useApproveInvoice, useCancelInvoice, useDisputeInvoice, useAddAdjustment } from "../../hooks/useInvoices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatCurrency } from "../../utils/moneyFormat";
import { getInvoiceStatusColor, INVOICE_LINE_ITEM_TYPE, INVOICE_ADJUSTMENT_TYPE } from "../../utils/invoiceStatus";
import { createInvoiceLineItemSchema, adjustmentSchema } from "../../schemas/invoice.schema";
import InvoicePreview from "./InvoicePreview";

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const [lineItems, setLineItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    itemType: "CONSULTATION",
    description: "",
    quantity: 1,
    unitPrice: 0,
    serviceDate: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useCreateInvoice();
  const addLineItemMutation = useAddLineItem();

  const handleAddItem = () => {
    try {
      createInvoiceLineItemSchema.parse(currentItem);
      const newItem = {
        ...currentItem,
        totalAmount: Number(currentItem.quantity) * Number(currentItem.unitPrice),
        id: Date.now().toString(),
      };
      setLineItems([...lineItems, newItem]);
      setCurrentItem({
        itemType: "CONSULTATION",
        description: "",
        quantity: 1,
        unitPrice: 0,
        serviceDate: "",
        notes: "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const handleRemoveItem = (id) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const grossTotal = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);

  const handleSubmit = async () => {
    if (lineItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    setIsSubmitting(true);
    try {
      // First create the invoice
      const invoiceData = {
        invoiceType: "PATIENT_CREDIT", // Default, should be selectable
        creditAccountId: "uuid-here", // Should come from form
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Created via frontend",
      };

      const invoice = await createMutation.mutateAsync(invoiceData);

      // Then add line items
      for (const item of lineItems) {
        await addLineItemMutation.mutateAsync({
          invoiceId: invoice.id,
          payload: {
            itemType: item.itemType,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            serviceDate: item.serviceDate || undefined,
          },
        });
      }

      toast.success("Invoice created successfully");
      navigate(`/invoice-management/${invoice.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/invoice-management")}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Invoice</h1>
          <p className="text-sm text-slate-500">Add a new credit invoice with line items</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line Items Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Add Line Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Item Type</Label>
                <select
                  value={currentItem.itemType}
                  onChange={(e) => setCurrentItem({ ...currentItem, itemType: e.target.value })}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
                >
                  {Object.entries(INVOICE_LINE_ITEM_TYPE).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Input
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                  placeholder="Service description"
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Price (KES) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentItem.unitPrice}
                  onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Service Date</Label>
                <Input
                  type="date"
                  value={currentItem.serviceDate}
                  onChange={(e) => setCurrentItem({ ...currentItem, serviceDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <Input
                  value={formatCurrency(Number(currentItem.quantity) * Number(currentItem.unitPrice))}
                  disabled
                  className="bg-slate-50"
                />
              </div>
            </div>
            <Button onClick={handleAddItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Line Item
            </Button>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Line Items</span>
              <span className="font-medium">{lineItems.length}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Gross Total</span>
              <span>{formatCurrency(grossTotal)}</span>
            </div>
            <Button onClick={handleSubmit} disabled={isSubmitting || lineItems.length === 0} className="w-full">
              {isSubmitting ? "Creating..." : "Create Invoice"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Table */}
      {lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Line Items ({lineItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs">{item.itemType}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(item.totalAmount)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
