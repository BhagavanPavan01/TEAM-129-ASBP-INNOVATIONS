import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  condition: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  isMock?: boolean;
}

export interface PredictionResult {
  disasterType: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  confidence: number;
  message: string;
  factors: string[];
}

export interface Alert {
  id: string;
  location: string;
  disaster_type: string;
  risk_level: "low" | "medium" | "high" | "critical";
  message: string;
  latitude?: number;
  longitude?: number;
  weather_data?: object;
  ai_prediction?: object;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const fetchWeather = async (city: string, apiKey?: string): Promise<WeatherData> => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-weather`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ city, apiKey }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  return response.json();
};

export const predictDisaster = async (
  location: string,
  weatherData: Partial<WeatherData>,
  latitude?: number,
  longitude?: number
): Promise<PredictionResult> => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      location,
      weatherData: {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
        visibility: weatherData.visibility,
        condition: weatherData.condition,
      },
      latitude,
      longitude,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get AI prediction");
  }

  return response.json();
};

export const getAlerts = async (activeOnly = true, limit = 50): Promise<Alert[]> => {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/get-alerts?active=${activeOnly}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch alerts");
  }

  const data = await response.json();
  return data.alerts;
};

export const sendAlert = async (
  location: string,
  disasterType: string,
  riskLevel: "low" | "medium" | "high" | "critical",
  message: string,
  latitude?: number,
  longitude?: number
): Promise<Alert> => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-alert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      location,
      disasterType,
      riskLevel,
      message,
      latitude,
      longitude,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send alert");
  }

  const data = await response.json();
  return data.alert;
};

// Subscribe to real-time alert updates
export const subscribeToAlerts = (callback: (alert: Alert) => void) => {
  const channel = supabase
    .channel("alerts-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "alerts",
      },
      (payload) => {
        callback(payload.new as Alert);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
