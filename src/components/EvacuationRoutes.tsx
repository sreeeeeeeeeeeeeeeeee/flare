import { useEffect, useState, useRef } from "react";
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

// GraphHopper API key
const API_KEY = "5adb1e1c-29a2-4293-81c1-1c81779679bb";

// Helper function to extract lat/lng from string coordinates
const extractCoordinates = (locationString: string): { lat: number; lng: number } | null => {
  // If the location already has coordinates in it like "Mistissini (51.0285, -73.8712)"
  const coordMatch = locationString.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
  if (coordMatch) {
    return {
      lat: parseFloat(coordMatch[1]),
      lng: parseFloat(coordMatch[2])
    };
  }
  
  // For testing, use predefined coordinates for certain locations
  const locationMap: Record<string, { lat: number; lng: number }> = {
    'Mistissini': { lat: 50.4175, lng: -73.8682 },
    'Chibougamau': { lat: 49.9166, lng: -74.3694 },
    'Ouje-Bougoumou': { lat: 49.9257, lng: -74.8107 },
    'Waswanipi': { lat: 49.6892, lng: -75.9564 },
    'Nemaska': { lat: 51.6900, lng: -76.2342 },
    'Hospital': { lat: 50.4230, lng: -73.8780 },
    'School': { lat: 50.4210, lng: -73.8730 },
    'Community Center': { lat: 50.4190, lng: -73.8650 },
    'Lake Shore': { lat: 50.4150, lng: -73.8900 },
    'Forest Edge': { lat: 50.4250, lng: -73.8500 }
  };

  // Check if the location name is in our map
  for (const [key, coords] of Object.entries(locationMap)) {
    if (locationString.includes(key)) {
      return coords;
    }
  }

  // Default to Mistissini center if no match
  return { lat: 50.4175, lng: -73.8682 };
};

// Cache for route data to avoid excessive API calls
const routeCache: Record<string, [number, number][]> = {};

// Function to generate a cache key for routes
const getCacheKey = (start: { lat: number; lng: number }, end: { lat: number; lng: number }): string => {
  return `${start.lat.toFixed(4)},${start.lng.toFixed(4)}_${end.lat.toFixed(4)},${end.lng.toFixed(4)}`;
};

// Function to fetch route from GraphHopper API with caching
const fetchRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
  // Generate cache key for this route
  const cacheKey = getCacheKey(start, end);
  
  // Return cached result if available
  if (routeCache[cacheKey]) {
    return routeCache[cacheKey];
  }
  
  // For very small distances, just return a direct line
  const distance = Math.sqrt(
    Math.pow((start.lat - end.lat) * 111, 2) + 
    Math.pow((start.lng - end.lng) * 111 * Math.cos(start.lat * Math.PI / 180), 2)
  );
  
  if (distance < 0.5) { // Less than 500m
    const directRoute: [number, number][] = [
      [start.lat, start.lng],
      [end.lat, end.lng]
    ];
    routeCache[cacheKey] = directRoute;
    return directRoute;
  }
  
  const url = `https://graphhopper.com/api/1/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&vehicle=car&locale=en&key=${API_KEY}&points_encoded=false`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.warn(`GraphHopper API error (${response.status}): ${data.message}`);
      return null;
    }
    
    if (data.paths && data.paths.length > 0) {
      // Convert from [lng, lat] to [lat, lng] format
      const route = data.paths[0].points.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
      // Cache the result
      routeCache[cacheKey] = route;
      return route;
    }
    
    console.error("No path found in GraphHopper response:", data);
    return null;
  } catch (error) {
    console.error("Error fetching route from GraphHopper:", error);
    return null;
  }
};

const EvacuationRoutes = ({ routes, standalone = false }: EvacuationRoutesProps) => {
  const [computedRoutes, setComputedRoutes] = useState<RouteCoordinates[]>([]);
  const processedRoutesRef = useRef<Record<string, boolean>>({});
  
  useEffect(() => {
    // Only process routes if we're not in standalone mode
    if (!standalone) {
      console.log("Processing evacuation routes:", routes.length);
      
      // Keep track of processed routes for this batch
      const processedThisBatch: Record<string, boolean> = {};
      
      // Define an async function to process routes with GraphHopper API
      const processRoutes = async () => {
        // First, create a base set of routes using existing geometry
        const baseRoutes = routes.map(route => {
          // Convert from [lng, lat] to [lat, lng] format for react-leaflet
          const path = route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
          
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
        });
        
        // Update state immediately with the base routes to ensure something is displayed
        setComputedRoutes(baseRoutes);
        
        // Then, try to enhance routes with GraphHopper data in batches
        for (let i = 0; i < routes.length; i++) {
          const route = routes[i];
          
          // Skip if we've processed this route in a previous update and it hasn't changed status
          if (processedRoutesRef.current[route.id] && !processedThisBatch[route.id]) {
            processedThisBatch[route.id] = true;
            continue;
          }
          
          try {
            // Extract start and end coordinates from the route
            const startCoords = extractCoordinates(route.startPoint);
            const endCoords = extractCoordinates(route.endPoint);
            
            if (!startCoords || !endCoords) {
              console.error("Invalid coordinates for route:", route.id);
              continue;
            }
            
            // Try to fetch enhanced route data
            const path = await fetchRoute(startCoords, endCoords);
            
            if (path) {
              // Update this specific route with new path data
              setComputedRoutes(prevRoutes => {
                return prevRoutes.map(r => {
                  if (r.id === route.id) {
                    return { ...r, path };
                  }
                  return r;
                });
              });
              
              // Mark as processed
              processedRoutesRef.current[route.id] = true;
              processedThisBatch[route.id] = true;
            }
            
            // Add a small delay between requests to avoid rate limiting
            if (i < routes.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 250));
            }
          } catch (err) {
            console.error("Error processing route:", err);
            continue;
          }
        }
      };
      
      // Process routes immediately
      processRoutes();
    }
  }, [routes, standalone]);

  // If standalone is true, this is being rendered outside a map context, so just render info
  if (standalone) {
    return (
      <div className="p-4 rounded-lg border border-border">
        <h3 className="text-lg font-medium mb-2">Evacuation Routes</h3>
        <div className="space-y-2">
          {routes.map((route) => (
            <div key={`standalone-${route.id}`} className="p-2 bg-card rounded flex justify-between items-center">
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
