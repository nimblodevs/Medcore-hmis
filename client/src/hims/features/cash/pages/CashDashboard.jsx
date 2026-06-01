import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ClipboardCheck,
  AlertCircle,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { useCashDashboardStats, useCashSessions } from "../hooks/useCash";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../../components/ui/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../../components/ui/Select";

const CashDashboard = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stats, isLoading: statsLoading } = useCashDashboardStats();
  const { data: sessionsData, isLoading: sessionsLoading } = useCashSessions({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchTerm || undefined,
    page: 1,
    limit: 10
  });

  const statsCards = [
    {
      title: "Open Sessions",
      value: stats?.openSessions || 0,
      icon: Wallet,
      bgColor: "bg-cyan-100",
      textColor: "text-cyan-700"
    },
    {
      title: "Total Collected Today",
      value: `KES ${stats?.totalCollectedToday?.toLocaleString() || "0"}`,
      icon: TrendingUp,
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-700"
    },
    {
      title: "Pending Handovers",
      value: stats?.pendingHandovers || 0,
      icon: ClipboardCheck,
      bgColor: "bg-amber-100",
      textColor: "text-amber-700"
    },
    {
      title: "Variances Today",
      value: stats?.variancesToday || 0,
      icon: AlertCircle,
      bgColor: "bg-rose-100",
      textColor: "text-rose-700"
    }
  ];

  const getStatusBadge = (status) => {
    const variants = {
      OPEN: "bg-emerald-100 text-emerald-800 border-emerald-300",
      CLOSED: "bg-blue-100 text-blue-800 border-blue-300",
      PENDING_APPROVAL: "bg-amber-100 text-amber-800 border-amber-300",
      APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-300",
      REJECTED: "bg-rose-100 text-rose-800 border-rose-300",
      VOIDED: "bg-slate-100 text-slate-800 border-slate-300"
    };
    return (
      <Badge variant="outline" className={variants[status] || ""}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (statsLoading || sessionsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-cyan-600 border-t-transparent size-10"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Management</h1>
          <p className="text-sm text-slate-500">
            Manage cash sessions, payments, refunds, and handovers
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/cash-management/counters")}>
            Manage Counters
          </Button>
          <Button onClick={() => navigate("/cash-management/cashiers")}>
            Manage Cashiers
          </Button>
          <Button onClick={() => navigate("/cash-management/sessions/new")}>
            <Plus className="mr-2 size-4" />
            New Session
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`size-5 ${stat.textColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Sessions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Cash Sessions</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 size-4 text-slate-400" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 size-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session #</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Counter</TableHead>
                <TableHead>Opened At</TableHead>
                <TableHead>Opening Float</TableHead>
                <TableHead>Total Payments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionsData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
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
                          {session.cashier.firstName} {session.cashier.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{session.cashier.staffNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{session.counter.name}</TableCell>
                    <TableCell>
                      {new Date(session.openedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>KES {session.openingFloat.toLocaleString()}</TableCell>
                    <TableCell>{session._count?.payments || 0}</TableCell>
                    <TableCell>{getStatusBadge(session.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/cash-management/sessions/${session.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashDashboard;
