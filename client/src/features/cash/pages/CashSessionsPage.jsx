import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Wallet, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { useCashSessions, useMyOpenCashSession } from "../hooks/useCash";

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
      OPEN: "bg-emerald-100 text-emerald-800",
      CLOSED: "bg-cyan-100 text-cyan-800",
      SUBMITTED: "bg-amber-100 text-amber-800",
      APPROVED: "bg-emerald-100 text-emerald-800",
      REJECTED: "bg-rose-100 text-rose-800",
      REOPENED: "bg-purple-100 text-purple-800",
      VOIDED: "bg-slate-100 text-slate-800"
    };
    return (
      <Badge className={variants[status] || ""}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getVarianceBadge = (varianceType) => {
    if (!varianceType || varianceType === "NONE") return null;
    const variants = {
      SHORTAGE: "bg-rose-100 text-rose-800",
      SURPLUS: "bg-amber-100 text-amber-800"
    };
    return (
      <Badge className={variants[varianceType] || ""}>
        {varianceType}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Cash Sessions"
        description="Manage cash drawer sessions and reconciliations"
        breadcrumbs={[{ label: 'Cash', href: '/cash' }, { label: 'Sessions' }]}
        action={
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
        }
      />

      {/* My Open Session Alert */}
      {mySession?.data && (
        <SectionCard className="border-emerald-300 bg-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-6 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-900">
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
        </SectionCard>
      )}

      {/* Filters */}
      <SectionCard>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-slate-400" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-40">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <option value="all">All Status</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="VOIDED">Voided</option>
            </Select>
          </div>
          <div className="w-40">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="w-40">
            <Label>End Date</Label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
      </SectionCard>

      {/* Table */}
      <SectionCard title="All Cash Sessions">
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
                  <TableRow key={session.id} className="hover:bg-cyan-50/30">
                    <TableCell className="font-medium text-slate-900">{session.sessionNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">
                          {session.cashierProfile?.user?.firstName}{" "}
                          {session.cashierProfile?.user?.lastName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {session.cashierProfile?.staffNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">{session.counter?.name}</TableCell>
                    <TableCell className="text-slate-700">
                      {new Date(session.openedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {session.closedAt
                        ? new Date(session.closedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-slate-700">KES {session.openingFloat?.toLocaleString() || "0"}</TableCell>
                    <TableCell className="text-slate-700">
                      KES {session.totalCollections?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell>
                      {getVarianceBadge(session.varianceType)}
                    </TableCell>
                    <TableCell>{getStatusBadge(session.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
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
      </SectionCard>
    </div>
  );
};

export default CashSessionsPage;
