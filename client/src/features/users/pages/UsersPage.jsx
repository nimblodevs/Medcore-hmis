import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MoreVertical, Eye, Edit, Lock, Unlock, UserX } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { useUsers, useDeactivateUser, useActivateUser } from "../hooks/useUsers";
import CreateUserForm from "../components/CreateUserForm";

const ROLE_BADGES = {
  SUPER_ADMIN: { label: "Super Admin", variant: "destructive" },
  ADMIN: { label: "Admin", variant: "default" },
  CASHIER_SUPERVISOR: { label: "Supervisor", variant: "secondary" },
  CASHIER: { label: "Cashier", variant: "outline" },
  FINANCE_MANAGER: { label: "Finance", variant: "default" },
  AUDITOR: { label: "Auditor", variant: "secondary" }
};

const UsersPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const deactivateMutation = useDeactivateUser();
  const activateMutation = useActivateUser();

  const filters = {
    search: searchTerm || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    isActive: statusFilter !== "all" ? statusFilter === "active" : undefined
  };

  const { data, isLoading } = useUsers(filters);
  const users = data?.data?.users || [];
  const totalUsers = data?.data?.total || 0;

  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeactivate = (userId) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      deactivateMutation.mutate(userId);
    }
  };

  const handleActivate = (userId) => {
    activateMutation.mutate(userId);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="User Management"
        description="Manage hospital staff accounts and permissions"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Users' }]}
        action={
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <SectionCard>
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-44">
              <Label>Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <option value="all">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="CASHIER_SUPERVISOR">Supervisor</option>
                <option value="CASHIER">Cashier</option>
                <option value="FINANCE_MANAGER">Finance Manager</option>
                <option value="AUDITOR">Auditor</option>
              </Select>
            </div>
            <div className="w-40">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-slate-500">Loading users...</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-cyan-50/30">
                        <TableCell className="font-medium text-slate-900">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="text-slate-700">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={ROLE_BADGES[user.role]?.variant || "outline"}>
                            {ROLE_BADGES[user.role]?.label || user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {user.lastLoginAt 
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : "Never"
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/users/${user.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {user.isActive ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeactivate(user.id)}
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleActivate(user.id)}
                              >
                                <Unlock className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SectionCard>

      <CreateUserForm open={showCreateForm} onOpenChange={setShowCreateForm} />
    </div>
  );
};

export default UsersPage;
