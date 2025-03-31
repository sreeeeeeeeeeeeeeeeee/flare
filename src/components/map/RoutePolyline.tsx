
/**
 * Route polyline component
 */

import React from 'react';
import { Polyline } from 'react-leaflet';
import { Route } from '@/types/mapTypes';
import { getRouteColor } from '@/utils/mapUtils';
import RoutePopup from './RoutePopup';

interface RoutePolylineProps {
  route: Route;
}

const RoutePolyline: React.FC<RoutePolylineProps> = ({ route }) => {
  return (
    <Polyline
      key={route.id}
      positions={route.path}
      pathOptions={{
        color: getRouteColor(route.status),
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
