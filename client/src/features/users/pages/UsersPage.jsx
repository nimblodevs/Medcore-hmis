import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MoreVertical, Eye, Edit, Lock, Unlock, UserX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage hospital staff accounts and permissions</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage all user accounts in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="CASHIER_SUPERVISOR">Supervisor</SelectItem>
                <SelectItem value="CASHIER">Cashier</SelectItem>
                <SelectItem value="FINANCE_MANAGER">Finance Manager</SelectItem>
                <SelectItem value="AUDITOR">Auditor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
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
                        <TableCell>
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
        </CardContent>
      </Card>

      <CreateUserForm open={showCreateForm} onOpenChange={setShowCreateForm} />
    </div>
  );
};

export default UsersPage;
