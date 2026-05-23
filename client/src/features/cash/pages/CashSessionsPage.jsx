import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Wallet, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useCashSessions, useMyOpenCashSession } from "../hooks/useCash";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../../components/ui/select";

const CashSessionsPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const { data: mySession } = useMyOpenCashSession();
  const { data: sessionsData, isLoading } = useCashSessions({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchTerm || undefined,
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined,
    page: 1,
    limit: 50
  });

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

  const getVarianceBadge = (varianceType) => {
    if (!varianceType || varianceType === "NONE") return null;
    const variants = {
      SHORTAGE: "bg-rose-100 text-rose-800 border-rose-300",
      SURPLUS: "bg-amber-100 text-amber-800 border-amber-300"
    };
    return (
      <Badge variant="outline" className={variants[varianceType] || ""}>
        {varianceType}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Sessions</h1>
          <p className="text-sm text-slate-500">
            Manage cash drawer sessions and reconciliations
          </p>
        </div>
        <div className="flex gap-2">
          {mySession?.data && (
            <Button
              variant="outline"
              onClick={() => navigate(`/cash/sessions/${mySession.data.id}`)}
            >
              <Wallet className="mr-2 size-4" />
              My Open Session
            </Button>
          )}
          <Button onClick={() => navigate("/cash/sessions/new")}>
            <Plus className="mr-2 size-4" />
            Open Session
          </Button>
        </div>
      </div>

      {/* My Open Session Alert */}
      {mySession?.data && (
        <Card className="border-emerald-300 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="size-6 text-emerald-600" />
                <div>
                  <p className="font-medium text-emerald-900">
                    You have an open session: {mySession.data.sessionNumber}
                  </p>
                  <p className="text-sm text-emerald-700">
                    Counter: {mySession.data.counter.name} | Opening Float: KES{" "}
                    {mySession.data.openingFloat.toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => navigate(`/cash/sessions/${mySession.data.id}`)}
              >
                Go to Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-2 top-2.5 size-4 text-slate-400" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="VOIDED">Voided</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-40"
              placeholder="Start date"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-40"
              placeholder="End date"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Cash Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="animate-spin rounded-full border-4 border-cyan-600 border-t-transparent size-8"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session #</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Counter</TableHead>
                  <TableHead>Opened At</TableHead>
                  <TableHead>Closed At</TableHead>
                  <TableHead>Opening Float</TableHead>
                  <TableHead>Total Collections</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionsData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                      No cash sessions found
                    </TableCell>
                  </TableRow>
                ) : (
                  sessionsData?.data?.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.sessionNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {session.cashierProfile?.user?.firstName}{" "}
                            {session.cashierProfile?.user?.lastName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {session.cashierProfile?.staffNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{session.counter?.name}</TableCell>
                      <TableCell>
                        {new Date(session.openedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {session.closedAt
                          ? new Date(session.closedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>KES {session.openingFloat?.toLocaleString() || "0"}</TableCell>
                      <TableCell>
                        KES {session.totalCollections?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        {getVarianceBadge(session.varianceType)}
                      </TableCell>
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/cash/sessions/${session.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashSessionsPage;
