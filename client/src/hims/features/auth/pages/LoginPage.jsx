import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { loginSchema } from "../schemas/auth.schema";
import { useLogin } from "../hooks/useAuth";

const resolveLandingPath = (user) => {
  const role = user?.role?.name || user?.role || user?.roleName;

  if (["SUPER_ADMIN", "ADMIN", "HOSPITAL_ADMIN", "BRANCH_ADMIN"].includes(role)) return "/admin/users";
  if (["CASHIER_SUPERVISOR", "CASHIER", "ACCOUNTANT"].includes(role)) return "/cash-management";
  if (["FINANCE_MANAGER", "CREDIT_CONTROLLER", "AUDITOR", "CLAIMS_OFFICER", "BILLING_OFFICER"].includes(role)) return "/finance/dashboard";
  if (["PHARMACY_MANAGER", "PHARMACIST", "PHARMACY_CASHIER"].includes(role)) return "/pharmacy/dashboard";
  if (["NURSE", "DOCTOR", "CLINICIAN", "RECEPTIONIST", "CLINIC_MANAGER"].includes(role)) return "/appointments";

  return "/dashboard";
};

const LoginForm = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        navigate(resolveLandingPath(response?.data?.user));
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
            <Lock className="h-8 w-8 text-cyan-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Hospital Cash Management
          </CardTitle>
          <CardDescription>
            Sign in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@hospital.com"
                  className="pl-10"
                  {...register("email")}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  {...register("password")}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || loginMutation.isPending}
            >
              {isSubmitting || loginMutation.isPending ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>Demo credentials:</p>
            <p className="font-mono text-xs">admin@medcore.local / Admin@123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
