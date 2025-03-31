
import React from 'react';
import { Route } from '@/types/mapTypes';
import { Badge } from '@/components/ui/badge';
import { calculateDistance } from '@/utils/mapUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

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

  // Format update time
  const formatUpdateTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            <div key={`standalone-${route.id}`} className="p-3 bg-card rounded-md border border-border">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{route.start} → {route.end}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Distance: {calculateDistance(route.path).toFixed(1)} km</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatUpdateTime(route.updatedAt)}
                    </span>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(route.status)}>
                  {route.status.toUpperCase()}
                </Badge>
              </div>
              
              {route.status === 'closed' && (
                <div className="text-xs bg-red-50 p-2 mt-2 rounded text-red-800">
                  <span className="font-medium">⚠️ Warning:</span> This route is currently closed. Please use alternative routes.
                </div>
              )}
              {route.status === 'congested' && (
                <div className="text-xs bg-amber-50 p-2 mt-2 rounded text-amber-800">
                  <span className="font-medium">⚠️ Note:</span> Heavy traffic - expect delays. Consider alternatives if available.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Status legend */}
      <div className="mt-4 flex flex-wrap gap-3 bg-card/50 p-2 rounded border border-border text-xs">
        <div className="font-medium text-muted-foreground mr-1">Route Status:</div>
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-1.5"></div>
          <span>Open</span>
        </div>
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></div>
          <span>Congested</span>
        </div>
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></div>
          <span>Closed</span>
        </div>
      </div>
    </div>
  );
};

export default StandaloneEvacuationRoutes;
