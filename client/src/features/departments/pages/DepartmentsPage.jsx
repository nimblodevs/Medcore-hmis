import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Plus, Search, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { Label } from "@/components/ui/Label";
import { useDepartments, useCreateDepartment } from "../hooks/useDepartments";
import { DepartmentStatusBadge, DepartmentTypeBadge } from "../components/DepartmentStatusBadge";
import { DepartmentSummaryCards } from "../components/DepartmentSummaryCards";

export function DepartmentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [departmentType, setDepartmentType] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: departmentsData, isLoading } = useDepartments({
    search,
    status: status || undefined,
    departmentType: departmentType || undefined,
    page: 1,
    limit: 50
  });

  const createMutation = useCreateDepartment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    await createMutation.mutateAsync(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
      }
    });
  };

  const departments = departmentsData?.data || [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Departments"
        description="Manage hospital departments and organizational structure"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Departments' }]}
        action={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Department</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input name="name" required minLength={2} maxLength={160} />
                </div>
                <div>
                  <Label>Code</Label>
                  <Input name="code" required minLength={2} maxLength={30} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input name="description" maxLength={1000} />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select name="departmentType" defaultValue="OTHER">
                    <option value="CLINICAL">Clinical</option>
                    <option value="DIAGNOSTIC">Diagnostic</option>
                    <option value="PHARMACY">Pharmacy</option>
                    <option value="ADMINISTRATIVE">Administrative</option>
                    <option value="FINANCE">Finance</option>
                    <option value="SUPPORT">Support</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input name="location" maxLength={160} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input name="phone" maxLength={30} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input name="email" type="email" />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DepartmentSummaryCards />

      <SectionCard>
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-44">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </div>
          <div className="w-44">
            <Label>Type</Label>
            <Select value={departmentType} onValueChange={setDepartmentType}>
              <option value="">All Types</option>
              <option value="CLINICAL">Clinical</option>
              <option value="DIAGNOSTIC">Diagnostic</option>
              <option value="PHARMACY">Pharmacy</option>
              <option value="ADMINISTRATIVE">Administrative</option>
              <option value="FINANCE">Finance</option>
              <option value="SUPPORT">Support</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Service Units</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No departments found
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id} className="hover:bg-cyan-50/30">
                  <TableCell className="font-medium text-slate-900">{dept.name}</TableCell>
                  <TableCell className="font-mono text-sm text-slate-700">{dept.code}</TableCell>
                  <TableCell>
                    <DepartmentTypeBadge type={dept.departmentType} />
                  </TableCell>
                  <TableCell>
                    <DepartmentStatusBadge status={dept.status} />
                  </TableCell>
                  <TableCell className="text-slate-700">{dept.managerId ? "Assigned" : "Not assigned"}</TableCell>
                  <TableCell className="text-slate-700">{dept.serviceUnits?.length || 0}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/departments/${dept.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  );
}

export default DepartmentsPage;
