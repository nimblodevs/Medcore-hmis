import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, User, Pencil, Trash2, Building2 } from "lucide-react";
import { useCashierProfiles, useDeleteCashierProfile } from "../hooks/useCash";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../../components/ui/dialog";
import { CashierProfileForm } from "../components/CashierProfileForm";

const CashierProfilesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: profilesData, isLoading } = useCashierProfiles({
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter === "active" : undefined,
    page: 1,
    limit: 50
  });

  const deleteMutation = useDeleteCashierProfile();

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this cashier profile?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cashier Profiles</h1>
          <p className="text-sm text-slate-500">
            Manage cashier profiles and assignments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Add Cashier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Cashier Profile</DialogTitle>
            </DialogHeader>
            <CashierProfileForm onSuccess={() => setIsDialogOpen(false)} />
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
                placeholder="Search cashiers..."
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
          <CardTitle>All Cashier Profiles</CardTitle>
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
                  <TableHead>Cashier</TableHead>
                  <TableHead>Staff Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Default Counter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profilesData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No cashier profiles found
                    </TableCell>
                  </TableRow>
                ) : (
                  profilesData?.data?.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-slate-400" />
                          <div>
                            <div className="font-medium">
                              {profile.user?.firstName} {profile.user?.lastName}
                            </div>
                            <div className="text-xs text-slate-500">{profile.user?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{profile.staffNumber}</TableCell>
                      <TableCell>{profile.user?.email || "-"}</TableCell>
                      <TableCell>{profile.department || "-"}</TableCell>
                      <TableCell>
                        {profile.defaultCounter ? (
                          <div className="flex items-center gap-1">
                            <Building2 className="size-3 text-slate-400" />
                            <span className="text-sm">{profile.defaultCounter.name}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            profile.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-slate-100 text-slate-800 border-slate-300"
                          }
                        >
                          {profile.status === "ACTIVE" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/cash-management/cashiers/${profile.id}`)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(profile.id)}
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

export default CashierProfilesPage;
