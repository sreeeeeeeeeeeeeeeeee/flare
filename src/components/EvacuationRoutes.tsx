import { useEffect, useState } from "react";
import { Polyline, Popup } from "react-leaflet";
import { EvacuationRouteType } from "@/types/emergency";

type RouteCoordinates = {
  id: string;
  path: [number, number][];
  status: "open" | "congested" | "closed";
  routeName: string;
  startPoint: string;
  endPoint: string;
  estimatedTime: number;
  transportMethods: ("car" | "foot" | "emergency")[];
};

interface EvacuationRoutesProps {
  routes: EvacuationRouteType[];
  standalone?: boolean;
}

const EvacuationRoutes = ({ routes, standalone = false }: EvacuationRoutesProps) => {
  const [computedRoutes, setComputedRoutes] = useState<RouteCoordinates[]>([]);
  
  useEffect(() => {
    // Only process routes if we're not in standalone mode
    if (!standalone) {
      console.log("Processing evacuation routes:", routes.length);
      
      // Instead of making API calls, use the geometry data that already exists in the routes
      const newRoutes = routes.map((route) => {
        try {
          // Convert the GeoJSON coordinates format [lng, lat] to Leaflet format [lat, lng]
          const path = route.geometry.coordinates.map(
            ([lng, lat]) => [lat, lng] as [number, number]
          );
          
          return { 
            id: route.id, 
            path, 
            status: route.status,
            routeName: route.routeName || '',
            startPoint: route.startPoint,
            endPoint: route.endPoint,
            estimatedTime: route.estimatedTime,
            transportMethods: route.transportMethods
          } as RouteCoordinates;
        } catch (err) {
          console.error("Error processing route:", err);
          return null;
        }
      }).filter((r): r is RouteCoordinates => r !== null);
      
      console.log("Valid routes processed:", newRoutes.length);
      setComputedRoutes(newRoutes);
    }
  }, [routes, standalone]);

  console.log("Rendering evacuation routes:", computedRoutes.length, "standalone:", standalone);

  // If standalone is true, this is being rendered outside a map context, so just render info
  if (standalone) {
    return (
      <div className="p-4 rounded-lg border border-border">
        <h3 className="text-lg font-medium mb-2">Evacuation Routes</h3>
        <div className="space-y-2">
          {routes.map((route) => (
            <div key={route.id} className="p-2 bg-card rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{route.routeName || `Route ${route.id}`}</div>
                <div className="text-xs text-muted-foreground">
                  {route.startPoint} → {route.endPoint}
                </div>
                <div className="text-xs">
                  Estimated time: {route.estimatedTime} min
                </div>
              </div>
              <div className={`px-2 py-1 text-xs rounded-full ${
                route.status === 'open' 
                  ? 'bg-green-100 text-green-800' 
                  : route.status === 'congested' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {route.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Otherwise, render the actual map polylines (will only work inside a MapContainer)
  return (
    <>
      {computedRoutes.map((route) => (
        <Polyline
          key={`evac-route-${route.id}`}
          positions={route.path}
          pathOptions={{
            color: route.status === "open" ? "#22c55e" : route.status === "congested" ? "#f97316" : "#ef4444",
            weight: 5,
            opacity: 0.9,
            lineCap: "round",
          }}
        >
          <Popup>
            <div className="text-sm font-medium">{route.routeName}</div>
            <div className="text-xs">From: {route.startPoint} to {route.endPoint}</div>
            <div className="text-xs">Status: {route.status}</div>
            <div className="text-xs">Estimated Time: {route.estimatedTime} min</div>
            <div className="text-xs">Transport: {route.transportMethods.join(', ')}</div>
          </Popup>
        </Polyline>
      ))}
    </>
  );
};

export default EvacuationRoutes;
