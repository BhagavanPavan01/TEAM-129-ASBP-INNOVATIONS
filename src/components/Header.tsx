import { Bell, Radio, Shield, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  activeAlerts: number;
}

const Header = ({ activeAlerts }: HeaderProps) => {
  return (
    <header className="glass-card border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-alert-low rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">DisasterShield</h1>
                <p className="text-xs text-muted-foreground font-mono">AI Early Warning System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
              <Radio className="w-4 h-4 text-alert-low animate-pulse" />
              <span className="text-sm font-medium">LIVE MONITORING</span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {activeAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-alert-critical text-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {activeAlerts}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
