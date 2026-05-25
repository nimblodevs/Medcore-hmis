import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  X
} from "lucide-react";
import { useCashSession, useCloseCashSession } from "../hooks/useCash";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../../components/ui/dialog";
import OpenCashSessionForm from "../components/OpenCashSessionForm";
import CloseCashSessionForm from "../components/CloseCashSessionForm";

const CashSessionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

  const { data: sessionData, isLoading } = useCashSession(id);
  const closeMutation = useCloseCashSession();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-cyan-600 border-t-transparent size-10"></div>
      </div>
    );
  }

  if (!sessionData?.data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto size-12 text-slate-400" />
        <h2 className="mt-4 text-lg font-medium text-slate-900">Session not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/cash-management/sessions")}>
          Back to Sessions
        </Button>
      </div>
    );
  }

  const session = sessionData.data;

  const getStatusBadge = (status) => {
    const variants = {
      OPEN: "bg-emerald-100 text-emerald-800 border-emerald-300",
      CLOSED: "bg-blue-100 text-blue-800 border-blue-300",
      SUBMITTED: "bg-amber-100 text-amber-800 border-amber-300",
      APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-300",
      REJECTED: "bg-rose-100 text-rose-800 border-rose-300",
      REOPENED: "bg-purple-100 text-purple-800 border-purple-300",
      VOIDED: "bg-slate-100 text-slate-800 border-slate-300"
    };
    return (
      <Badge variant="outline" className={variants[status] || ""}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getVarianceInfo = () => {
    if (!session.cashDifference || session.cashDifference === 0) {
      return { type: "none", label: "No Variance", color: "text-slate-600" };
    }
    if (session.cashDifference > 0) {
      return { type: "surplus", label: `Surplus: KES ${session.cashDifference.toLocaleString()}`, color: "text-amber-600" };
    }
    return { type: "shortage", label: `Shortage: KES ${Math.abs(session.cashDifference).toLocaleString()}`, color: "text-rose-600" };
  };

  const varianceInfo = getVarianceInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/cash-management/sessions")}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{session.sessionNumber}</h1>
            <p className="text-sm text-slate-500">
              {session.counter?.name} • {session.cashierProfile?.user?.firstName}{" "}
              {session.cashierProfile?.user?.lastName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {session.status === "OPEN" && (
            <>
              <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Wallet className="mr-2 size-4" />
                    Close Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Close Cash Session</DialogTitle>
                  </DialogHeader>
                  <CloseCashSessionForm
                    sessionId={session.id}
                    onSuccess={() => {
                      setIsCloseDialogOpen(false);
                      navigate("/cash-management/sessions");
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={() => navigate(`/cash-management/sessions/${id}/payments/new`)}>
                <Plus className="mr-2 size-4" />
                Record Payment
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status and Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="size-4 text-slate-400" />
          </CardHeader>
          <CardContent>{getStatusBadge(session.status)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opening Float</CardTitle>
            <Wallet className="size-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {session.openingFloat?.toLocaleString() || "0"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
            <TrendingUp className="size-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {session.totalCollections?.toLocaleString() || "0"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
            <AlertCircle className="size-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${varianceInfo.color}`}>{varianceInfo.label}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4" />
              Session Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Opened At:</span>
              <span className="font-medium">
                {new Date(session.openedAt).toLocaleString()}
              </span>
            </div>
            {session.closedAt && (
              <div className="flex justify-between">
                <span className="text-slate-500">Closed At:</span>
                <span className="font-medium">
                  {new Date(session.closedAt).toLocaleString()}
                </span>
              </div>
            )}
            {session.submittedAt && (
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted At:</span>
                <span className="font-medium">
                  {new Date(session.submittedAt).toLocaleString()}
                </span>
              </div>
            )}
            {session.approvedAt && (
              <div className="flex justify-between">
                <span className="text-slate-500">Approved At:</span>
                <span className="font-medium">
                  {new Date(session.approvedAt).toLocaleString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Counter:</span>
              <span className="font-medium">{session.counter?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cashier:</span>
              <span className="font-medium">
                {session.cashierProfile?.user?.firstName}{" "}
                {session.cashierProfile?.user?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Staff Number:</span>
              <span className="font-medium">{session.cashierProfile?.staffNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Currency:</span>
              <span className="font-medium">{session.currency}</span>
            </div>
            {session.openingNotes && (
              <div>
                <span className="text-slate-500">Opening Notes:</span>
                <p className="mt-1 text-slate-700">{session.openingNotes}</p>
              </div>
            )}
            {session.closingNotes && (
              <div>
                <span className="text-slate-500">Closing Notes:</span>
                <p className="mt-1 text-slate-700">{session.closingNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payments and Refunds Tabs */}
      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payments ({session._count?.payments || 0})</TabsTrigger>
          <TabsTrigger value="refunds">Refunds ({session._count?.refunds || 0})</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        <TabsContent value="payments" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recorded Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {session.payments?.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No payments recorded</p>
              ) : (
                <div className="space-y-2">
                  {session.payments?.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{payment.receiptNumber || "No receipt"}</p>
                        <p className="text-sm text-slate-500">{payment.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">KES {payment.amount?.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(payment.recordedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="refunds" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              {session.refunds?.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No refunds recorded</p>
              ) : (
                <div className="space-y-2">
                  {session.refunds?.map((refund) => (
                    <div
                      key={refund.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{refund.receiptNumber || "No receipt"}</p>
                        <p className="text-sm text-slate-500">{refund.refundReason}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">KES {refund.refundAmount?.toLocaleString()}</p>
                        <Badge variant="outline" className="mt-1">
                          {refund.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="audit" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-slate-500">Audit log coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashSessionDetailsPage;
