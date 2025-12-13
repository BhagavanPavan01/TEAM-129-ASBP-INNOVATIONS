import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  disasterType: string;
}

interface RiskMapProps {
  zones: RiskZone[];
}

const RiskMap = ({ zones }: RiskMapProps) => {
  const riskColors = {
    low: "bg-alert-low",
    medium: "bg-alert-medium",
    high: "bg-alert-high",
    critical: "bg-alert-critical animate-pulse",
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-border/50 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Global Risk Map</h3>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-alert-low" />
            <span className="text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-alert-medium" />
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-alert-high" />
            <span className="text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-alert-critical" />
            <span className="text-muted-foreground">Critical</span>
          </div>
        </div>
      </div>

      <div className="relative bg-secondary/30 rounded-lg overflow-hidden h-[300px] border border-border/30">
        {/* Stylized world map background */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 1000 500" className="w-full h-full">
            <path
              d="M150,150 Q200,100 300,120 T450,100 T600,130 T750,110 L800,180 Q750,220 700,200 T550,230 T400,210 T250,240 L150,200 Z"
              fill="currentColor"
              className="text-primary"
            />
            <path
              d="M100,280 Q150,250 250,270 T400,250 T550,280 T700,260 L750,320 Q700,360 600,340 T400,370 T200,350 L100,310 Z"
              fill="currentColor"
              className="text-primary"
            />
            <path
              d="M800,150 Q850,130 900,160 L920,220 Q880,250 850,230 L800,180 Z"
              fill="currentColor"
              className="text-primary"
            />
          </svg>
        </div>

        {/* Risk zone markers */}
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{
              left: `${((zone.lng + 180) / 360) * 100}%`,
              top: `${((90 - zone.lat) / 180) * 100}%`,
            }}
          >
            <div className="relative">
              <div
                className={cn(
                  "w-4 h-4 rounded-full",
                  riskColors[zone.riskLevel],
                  zone.riskLevel === "critical" && "ring-4 ring-alert-critical/30"
                )}
              />
              {zone.riskLevel === "critical" && (
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-alert-critical animate-ping opacity-50" />
              )}
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                <div className="bg-popover border border-border rounded-lg p-3 shadow-lg whitespace-nowrap">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="font-semibold text-sm">{zone.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={zone.riskLevel} className="text-[10px]">
                      {zone.riskLevel.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {zone.disasterType}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskMap;
