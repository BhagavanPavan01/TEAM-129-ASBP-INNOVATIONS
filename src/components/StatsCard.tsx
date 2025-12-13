import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "critical" | "warning" | "success";
}

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
}: StatsCardProps) => {
  const variantStyles = {
    default: "border-border/50",
    critical: "border-alert-critical/30 glow-critical",
    warning: "border-alert-medium/30 glow-warning",
    success: "border-alert-low/30",
  };

  const iconStyles = {
    default: "text-primary bg-primary/10",
    critical: "text-alert-critical bg-alert-critical/10",
    warning: "text-alert-medium bg-alert-medium/10",
    success: "text-alert-low bg-alert-low/10",
  };

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-5 border animate-fade-in-up",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold data-value">{value}</span>
            {trend && trendValue && (
              <span
                className={cn(
                  "text-sm font-medium",
                  trend === "up" && "text-alert-critical",
                  trend === "down" && "text-alert-low",
                  trend === "neutral" && "text-muted-foreground"
                )}
              >
                {trend === "up" && "↑"}
                {trend === "down" && "↓"}
                {trendValue}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
