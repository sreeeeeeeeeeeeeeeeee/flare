
import React from 'react';
import { Polyline, useMap } from 'react-leaflet';
import { Route } from '@/types/mapTypes';
import { statusConfig } from '@/utils/routeStatusConfig';
import RoutePopup from './RoutePopup';

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

interface RoutePolylineProps {
  route: Route;
}

const RoutePolyline: React.FC<RoutePolylineProps> = ({ route }) => {
  const isInMapContainer = useIsInMapContainer();
  
  // If not in a map container, don't render Leaflet components
  if (!isInMapContainer) {
    return null;
  }
  
  return (
    <Polyline
      key={route.id}
      positions={route.path}
      pathOptions={{
        color: statusConfig[route.status].color,
        weight: 6,
        opacity: route.status === 'closed' ? 0.7 : 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: route.status === 'closed' ? '10, 6' : 
                  route.status === 'congested' ? '20, 5' : undefined
      }}
    >
      <RoutePopup route={route} />
    </Polyline>
  );
};

export default RoutePolyline;
