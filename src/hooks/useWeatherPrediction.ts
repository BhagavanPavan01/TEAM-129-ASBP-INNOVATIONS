import { useState } from "react";
import { fetchWeather, predictDisaster, WeatherData, PredictionResult } from "@/services/api";
import { toast } from "sonner";

interface UseWeatherPredictionReturn {
  isLoading: boolean;
  weatherData: WeatherData | null;
  prediction: PredictionResult | null;
  error: string | null;
  analyze: (city: string, apiKey?: string) => Promise<void>;
}

export const useWeatherPrediction = (): UseWeatherPredictionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (city: string, apiKey?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Fetch weather data
      const weather = await fetchWeather(city, apiKey);
      setWeatherData(weather);

      // Step 2: Get AI prediction based on weather
      const result = await predictDisaster(
        city,
        weather,
        weather.latitude,
        weather.longitude
      );
      setPrediction(result);

      // Show toast based on risk level
      if (result.riskLevel === "critical") {
        toast.error(`CRITICAL: ${result.disasterType} risk detected in ${city}`, {
          description: result.message,
          duration: 10000,
        });
      } else if (result.riskLevel === "high") {
        toast.warning(`HIGH RISK: ${result.disasterType} warning for ${city}`, {
          description: result.message,
          duration: 7000,
        });
      } else if (result.riskLevel === "medium") {
        toast.info(`Medium risk detected for ${city}`, {
          description: result.message,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      toast.error("Analysis failed", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, weatherData, prediction, error, analyze };
};
