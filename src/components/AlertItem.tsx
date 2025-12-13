import { AlertTriangle, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AlertItemProps {
  id: string;
  type: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  isNew?: boolean;
}

const AlertItem = ({
  type,
  location,
  severity,
  message,
  timestamp,
  isNew = false,
}: AlertItemProps) => {
  const severityStyles = {
    low: "border-l-alert-low",
    medium: "border-l-alert-medium",
    high: "border-l-alert-high",
    critical: "border-l-alert-critical",
  };

  return (
    <div
      className={cn(
        "glass-card rounded-lg p-4 border-l-4 border border-border/50 transition-all",
        severityStyles[severity],
        isNew && "animate-slide-in-right",
        severity === "critical" && "animate-pulse-glow"
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={cn(
            "w-5 h-5 mt-0.5",
            severity === "critical" && "text-alert-critical",
            severity === "high" && "text-alert-high",
            severity === "medium" && "text-alert-medium",
            severity === "low" && "text-alert-low"
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{type}</span>
            <Badge variant={severity} className="text-[10px] px-1.5 py-0">
              {severity.toUpperCase()}
            </Badge>
            {isNew && (
              <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">NEW</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{message}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              {timestamp}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertItem;
