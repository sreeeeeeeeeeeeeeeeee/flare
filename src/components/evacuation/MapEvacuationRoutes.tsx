
import React from 'react';
import { Polyline, Popup } from 'react-leaflet';
import { Route } from '@/types/mapTypes';
import { calculateDistance } from '@/utils/mapUtils';

interface MapEvacuationRoutesProps {
  routes: Route[];
  isLoading: boolean;
}

const MapEvacuationRoutes: React.FC<MapEvacuationRoutesProps> = ({ routes, isLoading }) => {
  if (isLoading) {
    return (
      <div className="loading">Calculating safest evacuation routes...</div>
    );
  }

  return (
    <>
      {routes.map((route) => (
        <Polyline
          key={`evac-route-${route.id}`}
          positions={route.path}
          pathOptions={{
            color: route.status === "open" ? "#22c55e" : 
                  route.status === "congested" ? "#f97316" : "#ef4444",
            weight: 5,
            opacity: route.status === "closed" ? 0.5 : 0.9,
            lineCap: "round",
            lineJoin: "round",
            dashArray: route.status === "closed" ? "10, 10" : 
                      route.status === "congested" ? "15, 5" : undefined
          }}
        >
          <Popup className="route-popup">
            <h4>{route.id}</h4>
            <div className="route-meta">
              <span className={`status-badge ${route.status}`}>
                {route.status.toUpperCase()}
              </span>
              <span>{calculateDistance(route.path).toFixed(1)} km</span>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">From:</span> {route.start}<br/>
              <span className="text-muted-foreground text-xs">To:</span> {route.end}
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
