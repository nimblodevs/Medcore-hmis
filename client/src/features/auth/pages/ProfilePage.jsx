import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Phone, Shield, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useCurrentUser, useLogout } from "../hooks/useAuth";
import ChangePasswordForm from "../components/ChangePasswordForm";
import useAuthStore from "@/store/authStore";

const ROLE_BADGES = {
  SUPER_ADMIN: { label: "Super Admin", variant: "destructive" },
  ADMIN: { label: "Admin", variant: "default" },
  CASHIER_SUPERVISOR: { label: "Supervisor", variant: "secondary" },
  CASHIER: { label: "Cashier", variant: "outline" },
  FINANCE_MANAGER: { label: "Finance", variant: "default" },
  AUDITOR: { label: "Auditor", variant: "secondary" }
};

const ProfilePage = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const logoutMutation = useLogout();
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useCurrentUser();
  const currentUser = data?.data || user;

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="text-slate-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500">Manage your account settings</p>
        </div>
        <Button variant="outline" onClick={() => logoutMutation.mutate()}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-500">Full Name</p>
                <p className="text-slate-900">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-500">Email Address</p>
                <p className="text-slate-900">{currentUser?.email}</p>
              </div>
            </div>

            {currentUser?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Phone Number</p>
                  <p className="text-slate-900">{currentUser.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-500">Role</p>
                <Badge variant={ROLE_BADGES[currentUser?.role]?.variant || "outline"}>
                  {ROLE_BADGES[currentUser?.role]?.label || currentUser?.role}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-500">Account Status:</p>
                <Badge variant={currentUser?.isActive ? "default" : "secondary"}>
                  {currentUser?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your password and security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-slate-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">Password</p>
                <p className="text-slate-900">Last changed: Recently</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangePassword(true)}
              >
                Change
              </Button>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 mt-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Security Tips</p>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>Use at least 8 characters</li>
                <li>Mix uppercase and lowercase letters</li>
                <li>Include numbers and symbols</li>
                <li>Don't reuse passwords from other accounts</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>
          <CardDescription>Your recent login history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
              <div>
                <p className="font-medium text-slate-900">Current Session</p>
                <p className="text-sm text-slate-500">
                  Last login: {currentUser?.lastLoginAt 
                    ? new Date(currentUser.lastLoginAt).toLocaleString()
                    : "N/A"
                  }
                </p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordForm open={showChangePassword} onOpenChange={setShowChangePassword} />
    </div>
  );
};

export default ProfilePage;
