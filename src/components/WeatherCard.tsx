import { Cloud, Droplets, Wind, Thermometer, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WeatherCardProps {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  condition: string;
  riskLevel: "low" | "medium" | "high" | "critical";
}

const WeatherCard = ({
  city,
  country,
  temperature,
  humidity,
  windSpeed,
  visibility,
  condition,
  riskLevel,
}: WeatherCardProps) => {
  return (
    <div className="glass-card rounded-xl p-5 border border-border/50 animate-fade-in-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{city}</h3>
          <p className="text-sm text-muted-foreground">{country}</p>
        </div>
        <Badge variant={riskLevel}>{riskLevel.toUpperCase()} RISK</Badge>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Cloud className="w-12 h-12 text-primary" />
        <div>
          <span className="text-4xl font-bold data-value">{temperature}°</span>
          <p className="text-sm text-muted-foreground">{condition}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-disaster-flood" />
          <div>
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="font-mono font-semibold">{humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-disaster-cyclone" />
          <div>
            <p className="text-xs text-muted-foreground">Wind</p>
            <p className="font-mono font-semibold">{windSpeed} km/h</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Visibility</p>
            <p className="font-mono font-semibold">{visibility} km</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
