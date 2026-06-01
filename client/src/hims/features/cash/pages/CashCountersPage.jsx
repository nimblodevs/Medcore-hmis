import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Building2, Pencil, Trash2 } from "lucide-react";
import { useCashCounters, useDeleteCashCounter } from "../hooks/useCash";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../../components/ui/Dialog";
import { CashCounterForm } from "../components/CashCounterForm";

const CashCountersPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: countersData, isLoading } = useCashCounters({
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter === "active" : undefined,
    page: 1,
    limit: 50
  });

  const deleteMutation = useDeleteCashCounter();

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this cash counter?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Counters</h1>
          <p className="text-sm text-slate-500">
            Manage payment counters across all branches
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Add Counter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Cash Counter</DialogTitle>
            </DialogHeader>
            <CashCounterForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 size-4 text-slate-400" />
              <Input
                placeholder="Search counters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Cash Counters</CardTitle>
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
                  <TableHead>Counter</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countersData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No cash counters found
                    </TableCell>
                  </TableRow>
                ) : (
                  countersData?.data?.map((counter) => (
                    <TableRow key={counter.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="size-4 text-slate-400" />
                          <span className="font-medium">{counter.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{counter.code}</TableCell>
                      <TableCell>{counter.department || "-"}</TableCell>
                      <TableCell>{counter.branch?.name || "-"}</TableCell>
                      <TableCell>{counter.defaultCurrency}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            counter.isActive
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-slate-100 text-slate-800 border-slate-300"
                          }
                        >
                          {counter.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/cash-management/counters/${counter.id}`)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(counter.id)}
                          >
                            <Trash2 className="size-4 text-rose-600" />
                          </Button>
                        </div>
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

export default CashCountersPage;
