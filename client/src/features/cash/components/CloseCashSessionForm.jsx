import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { closeCashSessionSchema } from "../schemas/cashSchemas";
import { useCloseCashSession, useCashSession } from "../hooks/useCash";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";

const CloseCashSessionForm = ({ sessionId, onSuccess }) => {
  const closeMutation = useCloseCashSession();
  const { data: sessionData } = useCashSession(sessionId);

  const session = sessionData?.data;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(closeCashSessionSchema),
    defaultValues: {
      actualCash: 0,
      closingNotes: "",
      varianceReason: ""
    }
  });

  const actualCash = watch("actualCash");

  const expectedCash = session?.expectedCashAmount || 0;
  const difference = actualCash - expectedCash;

  const onSubmit = async (data) => {
    try {
      await closeMutation.mutateAsync({ id: sessionId, data });
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Summary Info */}
      <div className="rounded-md bg-slate-50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Expected Cash:</span>
          <span className="font-medium">KES {expectedCash.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Actual Cash Counted:</span>
          <span className="font-medium">KES {actualCash?.toLocaleString() || "0"}</span>
        </div>
        {difference !== 0 && (
          <div className={`flex justify-between text-sm ${difference > 0 ? "text-amber-600" : "text-rose-600"}`}>
            <span className="font-medium">
              {difference > 0 ? "Surplus:" : "Shortage:"}
            </span>
            <span className="font-bold">KES {Math.abs(difference).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="actualCash">Actual Cash Counted *</Label>
        <Input
          id="actualCash"
          type="number"
          step="0.01"
          {...register("actualCash", { valueAsNumber: true })}
          placeholder="0.00"
        />
        {errors.actualCash && (
          <p className="text-sm text-rose-600">{errors.actualCash.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="closingNotes">Closing Notes</Label>
        <Textarea
          id="closingNotes"
          {...register("closingNotes")}
          placeholder="Any notes about the closing process"
          rows={3}
        />
        {errors.closingNotes && (
          <p className="text-sm text-rose-600">{errors.closingNotes.message}</p>
        )}
      </div>

      {difference !== 0 && (
        <div className="space-y-2">
          <Label htmlFor="varianceReason">Variance Explanation * (Required for non-zero variance)</Label>
          <Textarea
            id="varianceReason"
            {...register("varianceReason")}
            placeholder="Explain the reason for the cash difference"
            rows={3}
          />
          {errors.varianceReason && (
            <p className="text-sm text-rose-600">{errors.varianceReason.message}</p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Closing..." : "Close Session"}
        </Button>
      </div>
    </form>
  );
};

export default CloseCashSessionForm;
