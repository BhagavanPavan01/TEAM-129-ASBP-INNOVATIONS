import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DisasterCardProps {
  type: "flood" | "cyclone" | "earthquake" | "heatwave" | "wildfire";
  title: string;
  icon: LucideIcon;
  riskLevel: "low" | "medium" | "high" | "critical";
  affectedAreas: number;
  lastUpdated: string;
}

const DisasterCard = ({
  type,
  title,
  icon: Icon,
  riskLevel,
  affectedAreas,
  lastUpdated,
}: DisasterCardProps) => {
  const typeColors = {
    flood: "text-disaster-flood border-disaster-flood/30 bg-disaster-flood/5",
    cyclone: "text-disaster-cyclone border-disaster-cyclone/30 bg-disaster-cyclone/5",
    earthquake: "text-disaster-earthquake border-disaster-earthquake/30 bg-disaster-earthquake/5",
    heatwave: "text-disaster-heatwave border-disaster-heatwave/30 bg-disaster-heatwave/5",
    wildfire: "text-disaster-wildfire border-disaster-wildfire/30 bg-disaster-wildfire/5",
  };

  const iconBg = {
    flood: "bg-disaster-flood/20",
    cyclone: "bg-disaster-cyclone/20",
    earthquake: "bg-disaster-earthquake/20",
    heatwave: "bg-disaster-heatwave/20",
    wildfire: "bg-disaster-wildfire/20",
  };

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-4 border transition-all duration-300 hover:scale-[1.02] cursor-pointer",
        typeColors[type],
        riskLevel === "critical" && "animate-pulse-glow"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-lg", iconBg[type])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>
            <Badge variant={riskLevel}>{riskLevel.toUpperCase()}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{affectedAreas} areas at risk</span>
            <span>•</span>
            <span className="font-mono text-xs">{lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterCard;
