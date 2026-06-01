import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Search, Eye, AlertCircle, CheckCircle } from "lucide-react";
import { useInvoices } from "../hooks/useInvoices";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "../utils/moneyFormat";
import { getInvoiceStatusColor } from "../utils/invoiceStatus";

const formatDate = (iso) => {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: invoicesData, isLoading } = useInvoices({
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const invoices = invoicesData || [];

  const filteredInvoices = invoices.filter((inv) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      inv.invoiceNumber?.toLowerCase().includes(query) ||
      inv.patientName?.toLowerCase().includes(query) ||
      inv.patientNumber?.toLowerCase().includes(query) ||
      inv.creditAccount?.name?.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: invoices.length,
    outstanding: invoices.filter((i) => ["PENDING", "APPROVED", "PARTIALLY_PAID", "OVERDUE"].includes(i.status)).length,
    overdue: invoices.filter((i) => i.status === "OVERDUE").length,
    paid: invoices.filter((i) => i.status === "PAID").length,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Credit Invoices</h1>
          <p className="text-sm text-slate-500">Manage hospital credit invoices and billing</p>
        </div>
        <Button onClick={() => navigate("/invoice-management/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Invoices</p>
                <p className="text-lg font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Outstanding</p>
                <p className="text-lg font-bold text-slate-900">{stats.outstanding}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Overdue</p>
                <p className="text-lg font-bold text-slate-900">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                <CheckCircle size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Paid</p>
                <p className="text-lg font-bold text-slate-900">{stats.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by invoice #, patient, account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="DISPUTED">Disputed</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-slate-500">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-slate-400">
              <FileText size={48} className="mb-3 opacity-20" />
              <p className="font-medium">No invoices found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm font-semibold">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="text-xs">{invoice.invoiceType}</TableCell>
                    <TableCell className="text-sm">{invoice.creditAccount?.name || "-"}</TableCell>
                    <TableCell className="text-sm">{invoice.patientName || "-"}</TableCell>
                    <TableCell className="text-xs">{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell className="text-xs">{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(invoice.grossAmount)}</TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      {formatCurrency(invoice.outstandingAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getInvoiceStatusColor(invoice.status)} className="text-xs">
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/invoice-management/${invoice.id}`)}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
