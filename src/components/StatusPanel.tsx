
import { AlertTriangle, UserRound, Route } from 'lucide-react';

type StatusPanelProps = {
  dangerZones: number;
  responders: number;
  safeRoutes: number;
};

const StatusPanel = ({ dangerZones, responders, safeRoutes }: StatusPanelProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="border border-border rounded-lg bg-card p-3 flex flex-col items-center justify-center">
        <AlertTriangle className="h-5 w-5 text-danger mb-2" />
        <div className="text-xl font-bold">{dangerZones}</div>
        <div className="text-xs text-muted-foreground">Danger Zones</div>
      </div>
      
      <div className="border border-border rounded-lg bg-card p-3 flex flex-col items-center justify-center">
        <UserRound className="h-5 w-5 text-responder mb-2" />
        <div className="text-xl font-bold">{responders}</div>
        <div className="text-xs text-muted-foreground">Responders</div>
      </div>
      
      <div className="border border-border rounded-lg bg-card p-3 flex flex-col items-center justify-center">
        <Route className="h-5 w-5 text-safe mb-2" />
        <div className="text-xl font-bold">{safeRoutes}</div>
        <div className="text-xs text-muted-foreground">Safe Routes</div>
      </div>
    </div>
  );
};

export default StatusPanel;
