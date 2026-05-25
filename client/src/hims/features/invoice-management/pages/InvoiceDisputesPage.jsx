import { useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDisputes, useResolveDispute } from "../hooks/useInvoiceDisputes";
import { formatCurrency } from "../utils/moneyFormat";

export default function InvoiceDisputesPage() {
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);

  const { data: disputes, isLoading } = useDisputes({});
  const resolveMutation = useResolveDispute();

  const handleResolve = () => {
    if (!selectedDispute) return;
    resolveMutation.mutate(
      { disputeId: selectedDispute.id, resolutionNotes },
      {
        onSuccess: () => {
          setIsResolveDialogOpen(false);
          setResolutionNotes("");
          setSelectedDispute(null);
        },
      }
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoice Disputes</h1>
          <p className="text-sm text-slate-500">Manage and resolve invoice disputes</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Active Disputes Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-slate-500">Loading disputes...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Opened By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes?.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell>
                      <Badge variant={dispute.status === "OPEN" ? "destructive" : "secondary"}>
                        {dispute.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{dispute.invoice?.invoiceNumber}</TableCell>
                    <TableCell>{dispute.invoice?.creditAccount?.name || "-"}</TableCell>
                    <TableCell>{dispute.invoice?.patientName || "-"}</TableCell>
                    <TableCell>{formatCurrency(dispute.invoice?.outstandingAmount || 0)}</TableCell>
                    <TableCell className="max-w-xs truncate" title={dispute.disputeReason}>
                      {dispute.disputeReason}
                    </TableCell>
                    <TableCell>
                      {dispute.openedBy ? `${dispute.openedBy.firstName} ${dispute.openedBy.lastName}` : 'System'}
                    </TableCell>
                    <TableCell>{new Date(dispute.openedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {dispute.status === "OPEN" && (
                        <Dialog open={isResolveDialogOpen && selectedDispute?.id === dispute.id} onOpenChange={setIsResolveDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedDispute(dispute)}
                            >
                              Resolve
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Resolve Dispute</DialogTitle>
                              <DialogDescription>
                                Resolving this dispute will revert the invoice status to PENDING.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="notes">Resolution Notes</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Explain how the dispute was resolved..."
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>Cancel</Button>
                              <Button 
                                onClick={handleResolve} 
                                disabled={resolveMutation.isPending || !resolutionNotes}
                              >
                                {resolveMutation.isPending ? "Resolving..." : "Confirm Resolution"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      {dispute.status === "RESOLVED" && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle size={12} />
                          Resolved by {dispute.resolvedBy?.firstName}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!disputes || disputes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No disputes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
