
import React from 'react';
import { Popup, useMap } from 'react-leaflet';
import { Badge } from '@/components/ui/badge';
import { Route, RouteStatusBadgeVariant } from '@/types/mapTypes';
import { calculateDistance } from '@/utils/mapUtils';

// Check if we're inside a Leaflet map context
const useIsInMapContainer = () => {
  try {
    // This will throw if we're not in a MapContainer
    useMap();
    return true;
  } catch (e) {
    return false;
  }
};

interface RoutePopupProps {
  route: Route;
}

const RoutePopup: React.FC<RoutePopupProps> = ({ route }) => {
  const isInMapContainer = useIsInMapContainer();
  
  // If not in a map container, don't render Leaflet components
  if (!isInMapContainer) {
    return null;
  }
  
  // Get status badge style
  const getStatusBadgeVariant = (status: 'open' | 'congested' | 'closed'): RouteStatusBadgeVariant => {
    switch (status) {
      case 'open':
        return 'default';
      case 'congested':
        return 'secondary';
      case 'closed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Popup>
      <div className="route-popup">
        <h4>{route.start} → {route.end}</h4>
        <div className="route-meta">
          <Badge variant={getStatusBadgeVariant(route.status)} className="text-xs">
            {route.status.toUpperCase()}
          </Badge>
          <span>{calculateDistance(route.path).toFixed(1)} km</span>
        </div>
        <div className="route-updated">
          Updated: {route.updatedAt.toLocaleTimeString()}
        </div>
      </div>
    </Popup>
  );
};

export default RoutePopup;
