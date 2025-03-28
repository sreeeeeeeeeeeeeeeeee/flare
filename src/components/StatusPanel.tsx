
import { Flame, UserRound, Route } from 'lucide-react';
import { useEffect, useState } from 'react';

type StatusPanelProps = {
  dangerZones: number;
  responders: number;
  safeRoutes: number;
};

const StatusPanel = ({ dangerZones, responders, safeRoutes }: StatusPanelProps) => {
  const [counts, setCounts] = useState({
    dangerZones,
    responders,
    safeRoutes
  });

  // Update counts with slight animation effect when props change
  useEffect(() => {
    setCounts({
      dangerZones,
      responders,
      safeRoutes
    });
  }, [dangerZones, responders, safeRoutes]);

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="border border-border rounded-lg bg-card p-3 flex flex-col items-center justify-center">
        <Flame className="h-5 w-5 text-danger mb-2" />
        <div className="text-xl font-bold">{counts.dangerZones}</div>
        <div className="text-xs text-muted-foreground">Forest Fire Zones</div>
      </div>
      
      <div className="border border-border rounded-lg bg-card p-3 flex flex-col items-center justify-center">
        <UserRound className="h-5 w-5 text-responder mb-2" />
        <div className="text-xl font-bold">{counts.responders}</div>
        <div className="text-xs text-muted-foreground">Responders</div>
      </div>
      
      <div className="border border-border rounded-lg bg-card p-3 flex flex-col items-center justify-center">
        <Route className="h-5 w-5 text-safe mb-2" />
        <div className="text-xl font-bold">{counts.safeRoutes}</div>
        <div className="text-xs text-muted-foreground">Safe Routes</div>
      </div>
    </div>
  );
};

export default StatusPanel;
