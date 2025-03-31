
import React from 'react';
import { Polyline, Popup } from 'react-leaflet';
import { Route } from '@/types/mapTypes';
import { calculateDistance, getRouteColor } from '@/utils/mapUtils';

interface MapEvacuationRoutesProps {
  routes: Route[];
  isLoading: boolean;
}

const MapEvacuationRoutes: React.FC<MapEvacuationRoutesProps> = ({ routes, isLoading }) => {
  if (isLoading) {
    return null; // Don't show loading indicator on map to avoid overlaps
  }

  return (
    <>
      {routes.map((route) => (
        <Polyline
          key={`evac-route-${route.id}`}
          positions={route.path}
          pathOptions={{
            color: getRouteColor(route.status),
            weight: 5,
            opacity: route.status === "closed" ? 0.5 : 0.9,
            lineCap: "round",
            lineJoin: "round",
            dashArray: route.status === "closed" ? "10, 10" : 
                      route.status === "congested" ? "15, 5" : undefined
          }}
        >
          <Popup className="route-popup">
            <h4>{route.start} → {route.end}</h4>
            <div className="route-meta">
              <span className={`status-badge ${route.status}`}>
                {route.status.toUpperCase()}
              </span>
              <span>{calculateDistance(route.path).toFixed(1)} km</span>
            </div>
            <div className="route-updated">
              Updated: {route.updatedAt.toLocaleTimeString()}
            </div>
          </Popup>
        </Polyline>
      ))}
    </>
  );
};

export default MapEvacuationRoutes;
