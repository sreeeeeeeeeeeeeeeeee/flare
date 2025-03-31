
import React from 'react';
import { Route } from '@/types/mapTypes';
import { Badge } from '@/components/ui/badge';
import { calculateDistance } from '@/utils/mapUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface StandaloneEvacuationRoutesProps {
  routes: Route[];
  isLoading: boolean;
}

const StandaloneEvacuationRoutes: React.FC<StandaloneEvacuationRoutesProps> = ({ 
  routes, 
  isLoading 
}) => {
  // Get status badge variant
  const getStatusBadgeVariant = (status: 'open' | 'congested' | 'closed') => {
    switch (status) {
      case 'open':
        return 'default'; // green
      case 'congested':
        return 'secondary'; // orange
      case 'closed':
        return 'destructive'; // red
      default:
        return 'default';
    }
  };

  return (
    <div className="p-4 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-2">Evacuation Routes</h3>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : routes.length === 0 ? (
        <div className="text-muted-foreground text-center py-4">
          No active evacuation routes
        </div>
      ) : (
        <div className="space-y-2">
          {routes.map((route) => (
            <div key={`standalone-${route.id}`} className="p-2 bg-card rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{route.start} → {route.end}</div>
                <div className="text-xs text-muted-foreground">
                  Distance: {calculateDistance(route.path).toFixed(1)} km
                </div>
                <div className="text-xs">
                  Updated: {route.updatedAt.toLocaleTimeString()}
                </div>
              </div>
              <Badge variant={getStatusBadgeVariant(route.status)}>
                {route.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StandaloneEvacuationRoutes;
