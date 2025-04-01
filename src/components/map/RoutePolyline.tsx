
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
  
  // Enhance open routes with stronger visual styling
  const weight = route.status === 'open' ? 8 : 6;
  const opacity = route.status === 'closed' ? 0.7 : 
                 route.status === 'open' ? 1.0 : 0.9;
  // Use glow effect for open routes
  const shadowSize = route.status === 'open' ? '0 0 8px 2px rgba(34, 197, 94, 0.7)' : 'none';
  
  return (
    <Polyline
      key={route.id}
      positions={route.path}
      pathOptions={{
        color: statusConfig[route.status].color,
        weight: weight,
        opacity: opacity,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: route.status === 'closed' ? '10, 6' : 
                  route.status === 'congested' ? '20, 5' : undefined,
        shadowBlur: route.status === 'open' ? 20 : 0,
        shadowColor: route.status === 'open' ? '#22c55e' : 'transparent'
      }}
      className={route.status === 'open' ? 'open-route-glow' : ''}
    >
      <RoutePopup route={route} />
    </Polyline>
  );
};

export default RoutePolyline;
