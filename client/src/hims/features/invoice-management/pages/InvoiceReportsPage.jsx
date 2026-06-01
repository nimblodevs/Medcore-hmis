import { useState } from "react";
import { motion } from "motion/react";
import { FileDown, TrendingUp, AlertCircle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useOutstandingSummary, useAgingReport, useWriteOffReport } from "../hooks/useInvoiceReports";
import { formatCurrency } from "../utils/moneyFormat";
import { toast } from "sonner";

export default function InvoiceReportsPage() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [activeTab, setActiveTab] = useState("outstanding");

  const { data: outstandingData, isLoading: loadingOutstanding } = useOutstandingSummary(dateRange);
  const { data: agingData, isLoading: loadingAging } = useAgingReport({});
  const { data: writeOffData, isLoading: loadingWriteOff } = useWriteOffReport(dateRange);

  const handleExport = () => {
    toast.success("Export functionality will be implemented with backend endpoint");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Reports</h1>
          <p className="text-sm text-slate-500">View outstanding balances, aging analysis, and write-offs</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <FileDown className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 flex gap-4 items-end flex-wrap">
          <div className="grid gap-2">
            <Label>Start Date</Label>
            <Input 
              type="date" 
              value={dateRange.start} 
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} 
            />
          </div>
          <div className="grid gap-2">
            <Label>End Date</Label>
            <Input 
              type="date" 
              value={dateRange.end} 
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} 
            />
          </div>
          <Button variant="secondary" onClick={() => setDateRange({ start: "", end: "" })}>
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button 
          variant={activeTab === "outstanding" ? "default" : "ghost"} 
          onClick={() => setActiveTab("outstanding")}
        >
          Outstanding Summary
        </Button>
        <Button 
          variant={activeTab === "aging" ? "default" : "ghost"} 
          onClick={() => setActiveTab("aging")}
        >
          Aging Analysis
        </Button>
        <Button 
          variant={activeTab === "write-offs" ? "default" : "ghost"} 
          onClick={() => setActiveTab("write-offs")}
        >
          Write-Offs
        </Button>
      </div>

      {/* Outstanding Summary Tab */}
      {activeTab === "outstanding" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Outstanding Invoices Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOutstanding ? (
              <div className="flex h-48 items-center justify-center text-slate-500">Loading...</div>
            ) : (
              <>
                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="text-sm text-blue-700">Total Outstanding</div>
                    <div className="text-2xl font-bold text-blue-900">{formatCurrency(outstandingData?.totalOutstanding || 0)}</div>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-4">
                    <div className="text-sm text-purple-700">Total Invoices</div>
                    <div className="text-2xl font-bold text-purple-900">{outstandingData?.count || 0}</div>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outstandingData?.invoices?.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-sm">{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.creditAccount?.name || "-"}</TableCell>
                        <TableCell>{inv.patientName || "-"}</TableCell>
                        <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(inv.outstandingAmount)}
                        </TableCell>
                        <TableCell>
                          <span className={`rounded-full px-2 py-1 text-xs ${
                            inv.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {inv.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!outstandingData?.invoices || outstandingData.invoices.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          No outstanding invoices found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Aging Analysis Tab */}
      {activeTab === "aging" && (
        <div>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { key: 'current', label: 'Current', color: 'bg-green-500' },
              { key: 'days30', label: '1-30 Days', color: 'bg-yellow-500' },
              { key: 'days60', label: '31-60 Days', color: 'bg-orange-500' },
              { key: 'days90', label: '61-90 Days', color: 'bg-red-500' },
              { key: 'over90', label: '> 90 Days', color: 'bg-red-700' },
            ].map((bucket) => (
              <Card key={bucket.key}>
                <CardHeader className={`pb-2 ${bucket.color} bg-opacity-10 rounded-t-lg`}>
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {bucket.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAging ? (
                    <div className="h-16 flex items-center justify-center">Loading...</div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{formatCurrency(agingData?.[bucket.key]?.amount || 0)}</div>
                      <p className="text-xs text-slate-500">{agingData?.[bucket.key]?.count || 0} Invoices</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Aging Analysis Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                The aging report categorizes outstanding invoices based on how long they have been overdue.
                This helps identify collection priorities and potential bad debts.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Write-Offs Tab */}
      {activeTab === "write-offs" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Write-Off History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingWriteOff ? (
              <div className="flex h-48 items-center justify-center text-slate-500">Loading...</div>
            ) : (
              <>
                <div className="mb-6 rounded-lg bg-red-50 p-4">
                  <div className="text-sm text-red-700">Total Written Off</div>
                  <div className="text-2xl font-bold text-red-900">{formatCurrency(writeOffData?.totalWrittenOff || 0)}</div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Approved By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {writeOffData?.adjustments?.map((adj) => (
                      <TableRow key={adj.id}>
                        <TableCell>{new Date(adj.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-sm">{adj.invoice?.invoiceNumber}</TableCell>
                        <TableCell>{adj.invoice?.creditAccount?.name || "-"}</TableCell>
                        <TableCell>{adj.invoice?.patientName || "-"}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(adj.amount)}
                        </TableCell>
                        <TableCell>
                          {adj.approvedBy ? `${adj.approvedBy.firstName} ${adj.approvedBy.lastName}` : 'Pending'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!writeOffData?.adjustments || writeOffData.adjustments.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          No write-offs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
