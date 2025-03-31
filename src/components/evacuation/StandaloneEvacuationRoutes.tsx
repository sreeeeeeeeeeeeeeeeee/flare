
import React from 'react';
import { EvacuationRouteType } from '@/types/emergency';

interface StandaloneEvacuationRoutesProps {
  routes: EvacuationRouteType[];
  isLoading: boolean;
}

const StandaloneEvacuationRoutes: React.FC<StandaloneEvacuationRoutesProps> = ({ 
  routes, 
  isLoading 
}) => {
  return (
    <div className="p-4 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-2">Evacuation Routes</h3>
      {isLoading ? (
        <div className="loading">Calculating evacuation routes...</div>
      ) : (
        <div className="space-y-2">
          {routes.map((route) => (
            <div key={`standalone-${route.id}`} className="p-2 bg-card rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{route.routeName || `Route ${route.id}`}</div>
                <div className="text-xs text-muted-foreground">
                  {route.startPoint} → {route.endPoint}
                </div>
                <div className="text-xs">
                  Estimated time: {route.estimatedTime} min
                </div>
              </div>
              <div className={`status-badge ${route.status}`}>
                {route.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StandaloneEvacuationRoutes;
