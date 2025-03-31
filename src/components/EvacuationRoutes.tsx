import { useEffect, useState } from "react";
import { Polyline, Popup, useMap } from "react-leaflet";
import { EvacuationRouteType } from "@/types/emergency";

// GraphHopper API integration for evacuation routes
const GRAPH_HOPPER_API_KEY = "5adb1e1c-29a2-4293-81c1-1c81779679bb";

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
  
  // Only used when rendering inside a map context
  const fetchRoute = async (startLat: number, startLng: number, endLat: number, endLng: number) => {
    try {
      console.log(`Fetching route from [${startLat},${startLng}] to [${endLat},${endLng}]`);
      const url = `https://graphhopper.com/api/1/route?point=${startLat},${startLng}&point=${endLat},${endLng}&vehicle=car&locale=en&key=${GRAPH_HOPPER_API_KEY}&points_encoded=false`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.paths && data.paths[0] && data.paths[0].points && data.paths[0].points.coordinates) {
        const convertedPath = data.paths[0].points.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
        console.log("Successfully fetched path:", convertedPath.length, "points");
        return convertedPath;
      } else {
        console.error("Invalid response structure from GraphHopper API:", data);
        // Return a direct line between start and end as fallback
        return [[startLat, startLng], [endLat, endLng]];
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      // Return a direct line between start and end as fallback
      return [[startLat, startLng], [endLat, endLng]];
    }
  };

  useEffect(() => {
    // Process each route in the data
    const getRoutes = async () => {
      if (!routes || routes.length === 0) {
        console.log("No evacuation routes provided");
        return;
      }
      
      console.log("Processing evacuation routes:", routes.length);
      
      // Process each route in the data
      const newRoutes = await Promise.all(
        routes.map(async (route) => {
          try {
            console.log("Processing route:", route.id, route.routeName);
            
            // Extract start/end coordinates from route geometry or use fallbacks
            let startLat, startLng, endLat, endLng;
            
            if (route.geometry && route.geometry.coordinates && route.geometry.coordinates.length >= 2) {
              // Get first and last points from the route geometry
              startLng = route.geometry.coordinates[0][0];
              startLat = route.geometry.coordinates[0][1];
              endLng = route.geometry.coordinates[route.geometry.coordinates.length - 1][0];
              endLat = route.geometry.coordinates[route.geometry.coordinates.length - 1][1];
            } else {
              // Fallback: generate points near Mistissini
              startLat = 50.4221 - 0.01 + Math.random() * 0.005;
              startLng = -73.8683 - 0.01 + Math.random() * 0.005;
              endLat = 50.4221 - 0.005 + Math.random() * 0.01;
              endLng = -73.8683 - 0.005 + Math.random() * 0.01;
            }
            
            // Fetch the route using GraphHopper API
            console.log("Using GraphHopper API to fetch route");
            const path = await fetchRoute(startLat, startLng, endLat, endLng);
            
            console.log(`Route ${route.id} processed with ${path.length} points`);
            
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
        })
      );
      
      // Filter out any failed routes and set in state
      const validRoutes = newRoutes.filter((r): r is RouteCoordinates => r !== null);
      console.log("Valid routes processed:", validRoutes.length);
      setComputedRoutes(validRoutes);
    };

    getRoutes();
  }, [routes]);

  console.log("Rendering evacuation routes:", computedRoutes.length);

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
