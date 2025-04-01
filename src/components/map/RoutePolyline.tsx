
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
  
  // Different styling for each route type
  const getRouteStyle = () => {
    switch (route.status) {
      case 'open':
        return {
          color: statusConfig.open.color, // Use green from config
          weight: 8,
          opacity: 1.0,
          dashArray: undefined,
          lineCap: 'round' as const,
          lineJoin: 'round' as const,
          zIndex: 1000 // Higher z-index to draw on top
        };
      case 'congested':
        return {
          color: statusConfig.congested.color, // Yellow
          weight: 7,
          opacity: 0.9,
          dashArray: '15, 10',
          lineCap: 'round' as const,
          lineJoin: 'round' as const,
          zIndex: 900
        };
      case 'closed':
        return {
          color: statusConfig.closed.color, // Red
          weight: 6,
          opacity: 0.7,
          dashArray: '10, 6',
          lineCap: 'round' as const,
          lineJoin: 'round' as const,
          zIndex: 800
        };
      default:
        return {
          color: '#6b7280', // Gray fallback
          weight: 6,
          opacity: 0.9,
          zIndex: 700
        };
    }
  };
  
  const routeStyle = getRouteStyle();
  
  return (
    <Polyline
      key={route.id}
      positions={route.path}
      pathOptions={routeStyle}
      className={`route-status-${route.status}`}
    >
      <RoutePopup route={route} />
    </Polyline>
  );
};

export default RoutePolyline;
