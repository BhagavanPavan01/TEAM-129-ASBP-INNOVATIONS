import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Droplets,
  Wind,
  Flame,
  Thermometer,
  Activity,
  TrendingUp,
  Globe,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import DisasterCard from "@/components/DisasterCard";
import WeatherCard from "@/components/WeatherCard";
import AlertItem from "@/components/AlertItem";
import RiskChart from "@/components/RiskChart";
import RiskMap from "@/components/RiskMap";
import AlertNotifier from "@/components/AlertNotifier";
import AnalysisPanel from "@/components/AnalysisPanel";
import { useAlerts } from "@/hooks/useAlerts";

// Demo data for initial display
const demoAlerts = [
  {
    id: "1",
    type: "Flood Warning",
    location: "Mumbai, India",
    severity: "critical" as const,
    message: "Heavy rainfall expected. Flash flood risk in low-lying areas.",
    timestamp: "2 min ago",
    isNew: true,
  },
  {
    id: "2",
    type: "Cyclone Alert",
    location: "Bay of Bengal",
    severity: "high" as const,
    message: "Cyclone forming, expected landfall in 48 hours.",
    timestamp: "15 min ago",
    isNew: false,
  },
  {
    id: "3",
    type: "Heatwave Warning",
    location: "Delhi NCR, India",
    severity: "medium" as const,
    message: "Temperatures expected to exceed 45°C for next 3 days.",
    timestamp: "1 hour ago",
    isNew: false,
  },
  {
    id: "4",
    type: "Earthquake Detected",
    location: "Nepal-India Border",
    severity: "low" as const,
    message: "Minor tremor recorded. Magnitude 3.2. No damage reported.",
    timestamp: "3 hours ago",
    isNew: false,
  },
];

const mockRiskZones = [
  { id: "1", name: "Mumbai", lat: 19.076, lng: 72.8777, riskLevel: "critical" as const, disasterType: "Flood" },
  { id: "2", name: "Chennai", lat: 13.0827, lng: 80.2707, riskLevel: "high" as const, disasterType: "Cyclone" },
  { id: "3", name: "Los Angeles", lat: 34.0522, lng: -118.2437, riskLevel: "high" as const, disasterType: "Wildfire" },
  { id: "4", name: "Tokyo", lat: 35.6762, lng: 139.6503, riskLevel: "medium" as const, disasterType: "Earthquake" },
  { id: "5", name: "Miami", lat: 25.7617, lng: -80.1918, riskLevel: "medium" as const, disasterType: "Hurricane" },
  { id: "6", name: "Sydney", lat: -33.8688, lng: 151.2093, riskLevel: "low" as const, disasterType: "Bushfire" },
];

const mockWeatherData = [
  { city: "Mumbai", country: "India", temperature: 32, humidity: 89, windSpeed: 45, visibility: 5, condition: "Heavy Rain", riskLevel: "critical" as const },
  { city: "Chennai", country: "India", temperature: 34, humidity: 75, windSpeed: 65, visibility: 8, condition: "Stormy", riskLevel: "high" as const },
  { city: "Delhi", country: "India", temperature: 44, humidity: 25, windSpeed: 12, visibility: 4, condition: "Extreme Heat", riskLevel: "medium" as const },
];

const mockChartData = [
  { time: "00:00", value: 45, risk: 20 },
  { time: "04:00", value: 52, risk: 25 },
  { time: "08:00", value: 48, risk: 35 },
  { time: "12:00", value: 70, risk: 55 },
  { time: "16:00", value: 85, risk: 70 },
  { time: "20:00", value: 92, risk: 85 },
  { time: "Now", value: 88, risk: 82 },
];

const Index = () => {
  const [lastAlertTime, setLastAlertTime] = useState(Date.now());
  const { alerts: dbAlerts, isLoading: alertsLoading } = useAlerts();
  
  // Merge database alerts with demo alerts for display
  const displayAlerts = dbAlerts.length > 0 
    ? dbAlerts.map(a => ({
        id: a.id,
        type: a.disaster_type,
        location: a.location,
        severity: a.risk_level,
        message: a.message,
        timestamp: new Date(a.created_at).toLocaleTimeString(),
        isNew: Date.now() - new Date(a.created_at).getTime() < 60000,
      }))
    : demoAlerts;

  const activeAlerts = displayAlerts.filter(
    (a) => a.severity === "critical" || a.severity === "high"
  ).length;

  // Update risk zones based on database alerts
  const riskZones = dbAlerts.length > 0
    ? dbAlerts
        .filter(a => a.latitude && a.longitude)
        .map(a => ({
          id: a.id,
          name: a.location,
          lat: a.latitude!,
          lng: a.longitude!,
          riskLevel: a.risk_level,
          disasterType: a.disaster_type,
        }))
    : mockRiskZones;

  // Simulate periodic updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastAlertTime(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AlertNotifier alerts={demoAlerts} lastAlertTime={lastAlertTime} />
      <Header activeAlerts={activeAlerts} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Alerts"
            value={activeAlerts}
            subtitle="Requiring immediate attention"
            icon={AlertTriangle}
            variant="critical"
            trend="up"
            trendValue="+2 today"
          />
          <StatsCard
            title="Regions Monitored"
            value="1,247"
            subtitle="Across 85 countries"
            icon={Globe}
            variant="default"
          />
          <StatsCard
            title="AI Predictions"
            value="98.7%"
            subtitle="Accuracy rate this month"
            icon={Zap}
            variant="success"
            trend="up"
            trendValue="+0.3%"
          />
          <StatsCard
            title="Risk Index"
            value="74"
            subtitle="Global average score"
            icon={TrendingUp}
            variant="warning"
            trend="up"
            trendValue="+12"
          />
        </section>

        {/* AI Analysis Panel */}
        <section>
          <AnalysisPanel />
        </section>

        {/* Disaster Types */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Disaster Monitoring
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <DisasterCard
              type="flood"
              title="Floods"
              icon={Droplets}
              riskLevel="critical"
              affectedAreas={23}
              lastUpdated="2 min ago"
            />
            <DisasterCard
              type="cyclone"
              title="Cyclones"
              icon={Wind}
              riskLevel="high"
              affectedAreas={8}
              lastUpdated="15 min ago"
            />
            <DisasterCard
              type="heatwave"
              title="Heatwaves"
              icon={Thermometer}
              riskLevel="medium"
              affectedAreas={15}
              lastUpdated="1 hour ago"
            />
            <DisasterCard
              type="earthquake"
              title="Earthquakes"
              icon={Activity}
              riskLevel="low"
              affectedAreas={3}
              lastUpdated="3 hours ago"
            />
            <DisasterCard
              type="wildfire"
              title="Wildfires"
              icon={Flame}
              riskLevel="high"
              affectedAreas={12}
              lastUpdated="30 min ago"
            />
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Alerts */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-alert-critical" />
              Recent Alerts
              {alertsLoading && (
                <span className="text-xs text-muted-foreground">(loading...)</span>
              )}
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {displayAlerts.map((alert) => (
                <AlertItem key={alert.id} {...alert} />
              ))}
            </div>
          </div>

          {/* Right Column - Map & Charts */}
          <div className="lg:col-span-2 space-y-6">
            <RiskMap zones={riskZones.length > 0 ? riskZones : mockRiskZones} />
            <RiskChart title="Risk Trend Analysis (24h)" data={mockChartData} />
          </div>
        </div>

        {/* Weather Cards */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            High-Risk Weather Zones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockWeatherData.map((weather) => (
              <WeatherCard key={weather.city} {...weather} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-border/50 mt-12 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 DisasterShield. AI-Powered Early Warning System.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-alert-low animate-pulse" />
              <span className="font-mono">System Online | Last sync: 30s ago</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
