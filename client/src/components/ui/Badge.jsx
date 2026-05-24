import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500",
  {
    variants: {
      variant: {
        default:
          "bg-cyan-700 text-white shadow-sm hover:bg-cyan-800",
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
        success:
          "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
        warning:
          "bg-amber-100 text-amber-700 hover:bg-amber-200",
        outline: "border border-slate-200 text-slate-600 hover:bg-slate-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
