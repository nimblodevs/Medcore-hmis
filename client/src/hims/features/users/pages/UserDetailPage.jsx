import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, Calendar, Shield, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useUser } from "../hooks/useUsers";

const ROLE_BADGES = {
  SUPER_ADMIN: { label: "Super Admin", variant: "destructive" },
  ADMIN: { label: "Admin", variant: "default" },
  CASHIER_SUPERVISOR: { label: "Supervisor", variant: "secondary" },
  CASHIER: { label: "Cashier", variant: "outline" },
  FINANCE_MANAGER: { label: "Finance", variant: "default" },
  AUDITOR: { label: "Auditor", variant: "secondary" }
};

const UserDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading } = useUser(id);
  const [now] = useState(() => Date.now());

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="text-slate-500">Loading user details...</div>
      </div>
    );
  }

  const user = data?.data;

  if (!user) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="text-slate-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-slate-500">User Details & Activity</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Basic user account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-500">Role</p>
                <Badge variant={ROLE_BADGES[user.role]?.variant || "outline"}>
                  {ROLE_BADGES[user.role]?.label || user.role}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-500">Email Address</p>
                <p className="text-slate-900">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Phone Number</p>
                  <p className="text-slate-900">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-500">Account Created</p>
                <p className="text-slate-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-500">Last Login</p>
                <p className="text-slate-900">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString()
                    : "Never"
                  }
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-500">Account Status:</p>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>User activity overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Days Since Last Login</p>
              <p className="text-2xl font-bold text-slate-900">
                {user.lastLoginAt
                  ? Math.floor((now - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24))
                  : "N/A"
                }
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Account Age</p>
              <p className="text-2xl font-bold text-slate-900">
                {Math.floor((now - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>User login and action history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                Activity log will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="permissions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Access rights for {user.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                Permission details will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetailPage;
