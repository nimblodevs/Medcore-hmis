import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { openCashSessionSchema } from "../schemas/cashSchemas";
import { useOpenCashSession, useCashCounters, useCashierProfiles } from "../hooks/useCash";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { Textarea } from "../../../components/ui/Textarea";

const OpenCashSessionForm = ({ onSuccess }) => {
  const openMutation = useOpenCashSession();
  const { data: countersData } = useCashCounters({ status: true });
  const { data: cashiersData } = useCashierProfiles({ status: "ACTIVE" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(openCashSessionSchema),
    defaultValues: {
      counterId: "",
      cashierId: "",
      openingFloat: 0,
      currency: "KES",
      openingNotes: ""
    }
  });

  const onSubmit = async (data) => {
    try {
      await openMutation.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="counterId">Cash Counter *</Label>
          <select
            id="counterId"
            {...register("counterId")}
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Select counter</option>
            {countersData?.data?.map((counter) => (
              <option key={counter.id} value={counter.id}>
                {counter.name} ({counter.code})
              </option>
            ))}
          </select>
          {errors.counterId && (
            <p className="text-sm text-rose-600">{errors.counterId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cashierId">Cashier *</Label>
          <select
            id="cashierId"
            {...register("cashierId")}
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Select cashier</option>
            {cashiersData?.data?.map((cashier) => (
              <option key={cashier.id} value={cashier.id}>
                {cashier.user?.firstName} {cashier.user?.lastName} ({cashier.staffNumber})
              </option>
            ))}
          </select>
          {errors.cashierId && (
            <p className="text-sm text-rose-600">{errors.cashierId.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="openingFloat">Opening Float *</Label>
          <Input
            id="openingFloat"
            type="number"
            step="0.01"
            {...register("openingFloat", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.openingFloat && (
            <p className="text-sm text-rose-600">{errors.openingFloat.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <select
            id="currency"
            {...register("currency")}
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="KES">KES - Kenyan Shilling</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
          {errors.currency && (
            <p className="text-sm text-rose-600">{errors.currency.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="openingNotes">Opening Notes</Label>
        <Textarea
          id="openingNotes"
          {...register("openingNotes")}
          placeholder="Any notes about the opening float or session"
          rows={3}
        />
        {errors.openingNotes && (
          <p className="text-sm text-rose-600">{errors.openingNotes.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Opening..." : "Open Session"}
        </Button>
      </div>
    </form>
  );
};

export default OpenCashSessionForm;
