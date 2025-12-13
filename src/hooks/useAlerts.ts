import { useState, useEffect, useCallback } from "react";
import { getAlerts, subscribeToAlerts, Alert } from "@/services/api";
import { toast } from "sonner";

interface UseAlertsReturn {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useAlerts = (): UseAlertsReturn => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAlerts(false, 20);
      setAlerts(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch alerts";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToAlerts((newAlert) => {
      setAlerts((prev) => [newAlert, ...prev.slice(0, 19)]);

      // Show notification for new alerts
      if (newAlert.risk_level === "critical") {
        toast.error(`NEW CRITICAL ALERT: ${newAlert.disaster_type}`, {
          description: `${newAlert.message} - ${newAlert.location}`,
          duration: 15000,
        });
      } else if (newAlert.risk_level === "high") {
        toast.warning(`New High Risk Alert: ${newAlert.disaster_type}`, {
          description: `${newAlert.location}: ${newAlert.message}`,
          duration: 10000,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [refresh]);

  return { alerts, isLoading, error, refresh };
};
