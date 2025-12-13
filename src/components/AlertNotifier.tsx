import { useEffect } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface Alert {
  id: string;
  type: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
}

interface AlertNotifierProps {
  alerts: Alert[];
  lastAlertTime: number;
}

const AlertNotifier = ({ alerts, lastAlertTime }: AlertNotifierProps) => {
  useEffect(() => {
    if (alerts.length === 0) return;

    const latestAlert = alerts[0];

    const severityConfig = {
      critical: {
        Icon: XCircle,
        className:
          "bg-alert-critical/10 border-alert-critical text-alert-critical",
      },
      high: {
        Icon: AlertTriangle,
        className: "bg-alert-high/10 border-alert-high text-alert-high",
      },
      medium: {
        Icon: Info,
        className:
          "bg-alert-medium/10 border-alert-medium text-alert-medium",
      },
      low: {
        Icon: CheckCircle,
        className: "bg-alert-low/10 border-alert-low text-alert-low",
      },
    };

    const { Icon, className } = severityConfig[latestAlert.severity];

    toast.custom(
      (t) => (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border shadow-md ${className}`}
        >
          {/* Clickable icon */}
          <button
            onClick={() => toast.dismiss(t)}
            className="mt-0.5 cursor-pointer focus:outline-none"
            aria-label="Dismiss alert"
          >
            <Icon className="w-5 h-5" />
          </button>

          {/* Alert content */}
          <div className="flex-1">
            <p className="font-semibold">
              {latestAlert.severity.toUpperCase()}: {latestAlert.type}
            </p>
            <p className="text-sm opacity-90">
              {latestAlert.message}
            </p>
            <p className="text-xs opacity-70 mt-1">
              {latestAlert.location}
            </p>
          </div>

          {/* Optional acknowledge button */}
          <button
            onClick={() => {
              console.log("Acknowledged alert:", latestAlert.id);
              toast.dismiss(t);
            }}
            className="text-xs font-medium underline opacity-80 hover:opacity-100"
          >
            Acknowledge
          </button>
        </div>
      ),
      {
        id: latestAlert.id,
        duration: latestAlert.severity === "critical" ? 10000 : 5000,
        position: "top-right",
      }
    );
  }, [lastAlertTime, alerts]);

  return null;
};

export default AlertNotifier;
