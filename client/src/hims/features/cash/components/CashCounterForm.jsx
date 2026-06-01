import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cashCounterSchema } from "../schemas/cashSchemas";
import { useCreateCashCounter, useUpdateCashCounter } from "../hooks/useCash";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { Textarea } from "../../../components/ui/Textarea";

export const CashCounterForm = ({ counter, onSuccess }) => {
  const createMutation = useCreateCashCounter();
  const updateMutation = useUpdateCashCounter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(cashCounterSchema),
    defaultValues: counter || {
      name: "",
      code: "",
      department: "",
      description: "",
      defaultCurrency: "KES",
      supervisorId: null
    }
  });

  const onSubmit = async (data) => {
    try {
      if (counter) {
        await updateMutation.mutateAsync({ id: counter.id, data });
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
          <Label htmlFor="name">Counter Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="e.g., Main Billing Counter"
          />
          {errors.name && (
            <p className="text-sm text-rose-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Counter Code *</Label>
          <Input
            id="code"
            {...register("code")}
            placeholder="e.g., MAIN-BILL-01"
          />
          {errors.code && (
            <p className="text-sm text-rose-600">{errors.code.message}</p>
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
          <Label htmlFor="defaultCurrency">Currency</Label>
          <select
            id="defaultCurrency"
            {...register("defaultCurrency")}
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="KES">KES - Kenyan Shilling</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
          {errors.defaultCurrency && (
            <p className="text-sm text-rose-600">{errors.defaultCurrency.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Optional description for this counter"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-rose-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : counter ? "Update Counter" : "Create Counter"}
        </Button>
      </div>
    </form>
  );
};
