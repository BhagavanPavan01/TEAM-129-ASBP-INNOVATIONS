import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        critical: "border-transparent bg-alert-critical/20 text-alert-critical border-alert-critical/30",
        high: "border-transparent bg-alert-high/20 text-alert-high border-alert-high/30",
        medium: "border-transparent bg-alert-medium/20 text-alert-medium border-alert-medium/30",
        low: "border-transparent bg-alert-low/20 text-alert-low border-alert-low/30",
        flood: "border-transparent bg-disaster-flood/20 text-disaster-flood border-disaster-flood/30",
        cyclone: "border-transparent bg-disaster-cyclone/20 text-disaster-cyclone border-disaster-cyclone/30",
        earthquake: "border-transparent bg-disaster-earthquake/20 text-disaster-earthquake border-disaster-earthquake/30",
        heatwave: "border-transparent bg-disaster-heatwave/20 text-disaster-heatwave border-disaster-heatwave/30",
        wildfire: "border-transparent bg-disaster-wildfire/20 text-disaster-wildfire border-disaster-wildfire/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
