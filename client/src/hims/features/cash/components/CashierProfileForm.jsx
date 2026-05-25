import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cashierProfileSchema } from "../schemas/cashSchemas";
import { useCreateCashierProfile, useUpdateCashierProfile, useCashCounters } from "../hooks/useCash";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";

export const CashierProfileForm = ({ profile, onSuccess }) => {
  const createMutation = useCreateCashierProfile();
  const updateMutation = useUpdateCashierProfile();
  const { data: countersData } = useCashCounters({ status: true });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(cashierProfileSchema),
    defaultValues: profile || {
      userId: "",
      staffNumber: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      defaultCounterId: null,
      supervisorId: null
    }
  });

  const onSubmit = async (data) => {
    try {
      if (profile) {
        await updateMutation.mutateAsync({ id: profile.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="userId">User ID *</Label>
          <Input
            id="userId"
            {...register("userId")}
            placeholder="Select user account"
          />
          {errors.userId && (
            <p className="text-sm text-rose-600">{errors.userId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="staffNumber">Staff Number *</Label>
          <Input
            id="staffNumber"
            {...register("staffNumber")}
            placeholder="e.g., CS-001"
          />
          {errors.staffNumber && (
            <p className="text-sm text-rose-600">{errors.staffNumber.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            placeholder="First name"
          />
          {errors.firstName && (
            <p className="text-sm text-rose-600">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            {...register("lastName")}
            placeholder="Last name"
          />
          {errors.lastName && (
            <p className="text-sm text-rose-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            {...register("email")}
            type="email"
            placeholder="email@hospital.com"
          />
          {errors.email && (
            <p className="text-sm text-rose-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="Phone number"
          />
          {errors.phone && (
            <p className="text-sm text-rose-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            {...register("department")}
            placeholder="e.g., Finance"
          />
          {errors.department && (
            <p className="text-sm text-rose-600">{errors.department.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultCounterId">Default Counter</Label>
          <select
            id="defaultCounterId"
            {...register("defaultCounterId")}
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">No default counter</option>
            {countersData?.data?.map((counter) => (
              <option key={counter.id} value={counter.id}>
                {counter.name}
              </option>
            ))}
          </select>
          {errors.defaultCounterId && (
            <p className="text-sm text-rose-600">{errors.defaultCounterId.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
        </Button>
      </div>
    </form>
  );
};
