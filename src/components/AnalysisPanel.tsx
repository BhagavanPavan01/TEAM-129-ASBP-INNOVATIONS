import { useState } from "react";
import { Search, Loader2, Zap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWeatherPrediction } from "@/hooks/useWeatherPrediction";

const AnalysisPanel = () => {
  const [city, setCity] = useState("");
  const { isLoading, weatherData, prediction, analyze } = useWeatherPrediction();

  const handleAnalyze = () => {
    if (city.trim()) {
      analyze(city.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Risk Analysis</h3>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Enter city name (e.g., Mumbai)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 bg-secondary/50"
          />
        </div>
        <Button onClick={handleAnalyze} disabled={isLoading || !city.trim()}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span className="ml-2 hidden sm:inline">Analyze</span>
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">AI is analyzing weather patterns...</p>
          </div>
        </div>
      )}

      {prediction && !isLoading && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={prediction.riskLevel}>
                {prediction.riskLevel.toUpperCase()} RISK
              </Badge>
              {prediction.disasterType !== "none" && (
                <Badge variant="outline" className="capitalize">
                  {prediction.disasterType}
                </Badge>
              )}
            </div>
            <span className="text-sm font-mono text-muted-foreground">
              {prediction.confidence}% confidence
            </span>
          </div>

          <p className="text-sm">{prediction.message}</p>

          {prediction.factors && prediction.factors.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Contributing factors:</p>
              <div className="flex flex-wrap gap-1">
                {prediction.factors.map((factor, index) => (
                  <span
                    key={index}
                    className="text-xs bg-secondary px-2 py-1 rounded"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {weatherData && (
            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Weather data used:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span className="font-mono">{weatherData.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Humidity:</span>
                  <span className="font-mono">{weatherData.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wind:</span>
                  <span className="font-mono">{weatherData.windSpeed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition:</span>
                  <span className="font-mono">{weatherData.condition}</span>
                </div>
              </div>
              {weatherData.isMock && (
                <p className="text-xs text-alert-medium mt-2">
                  ⚠️ Using simulated data. Add OpenWeather API key for real data.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {!prediction && !isLoading && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">Enter a city name to analyze disaster risks using AI</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
