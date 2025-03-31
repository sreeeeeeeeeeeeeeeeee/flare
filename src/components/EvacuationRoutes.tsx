
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

const API_KEY = "5adb1e1c-29a2-4293-81c1-1c81779679bb";

// Enhanced coordinate extraction with better error handling
const extractCoordinates = (locationString: string): { lat: number; lng: number } => {
  // First try to extract coordinates directly from string
  const coordMatch = locationString.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
  if (coordMatch) {
    return {
      lat: parseFloat(coordMatch[1]),
      lng: parseFloat(coordMatch[2])
    };
  }

  // Enhanced location mapping with more precise coordinates
  const locationMap: Record<string, { lat: number; lng: number }> = {
    'Mistissini': { lat: 50.4221, lng: -73.8683 },
    'Chibougamau': { lat: 49.9166, lng: -74.3694 },
    'Ouje-Bougoumou': { lat: 49.9257, lng: -74.8107 },
    'Waswanipi': { lat: 49.6892, lng: -75.9564 },
    'Nemaska': { lat: 51.6900, lng: -76.2342 },
    'Hospital': { lat: 50.4230, lng: -73.8780 },
    'School': { lat: 50.4210, lng: -73.8730 },
    'Community Center': { lat: 50.4232, lng: -73.8660 },
    'Lake Shore': { lat: 50.4150, lng: -73.8900 },
    'Forest Edge': { lat: 50.4250, lng: -73.8500 },
    'Euelsti Street': { lat: 50.4180, lng: -73.8650 },
    'Amisk Street': { lat: 50.4165, lng: -73.8670 },
    'Spruce Street': { lat: 50.4200, lng: -73.8570 }
  };

  // Case-insensitive matching
  const normalizedInput = locationString.toLowerCase();
  for (const [key, coords] of Object.entries(locationMap)) {
    if (normalizedInput.includes(key.toLowerCase())) {
      return coords;
    }
  }

  // Default to Mistissini center if no match
  return { lat: 50.4221, lng: -73.8683 };
};

// Enhanced route cache with expiration
const routeCache: Record<string, { path: [number, number][]; timestamp: number }> = {};
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const getCacheKey = (start: { lat: number; lng: number }, end: { lat: number; lng: number }): string => {
  return `${start.lat.toFixed(6)},${start.lng.toFixed(6)}_${end.lat.toFixed(6)},${end.lng.toFixed(6)}`;
};

// Improved route fetching with better error handling and retry logic
const fetchRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }, retries = 3): Promise<[number, number][] | null> => {
  const cacheKey = getCacheKey(start, end);
  
  // Check cache (with expiration)
  if (routeCache[cacheKey] && Date.now() - routeCache[cacheKey].timestamp < CACHE_EXPIRATION_MS) {
    return routeCache[cacheKey].path;
  }

  // Calculate distance in kilometers
  const R = 6371; // Earth's radius in km
  const dLat = (end.lat - start.lat) * Math.PI / 180;
  const dLng = (end.lng - start.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  // For very short distances (<300m), create a smoothed direct line
  if (distance < 0.3) {
    const steps = Math.max(5, Math.ceil(distance * 30));
    const directRoute: [number, number][] = [];
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      directRoute.push([
        start.lat + (end.lat - start.lat) * ratio,
        start.lng + (end.lng - start.lng) * ratio
      ]);
    }
    
    routeCache[cacheKey] = { path: directRoute, timestamp: Date.now() };
    return directRoute;
  }

  try {
    const url = `https://graphhopper.com/api/1/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&vehicle=car&locale=en&key=${API_KEY}&points_encoded=false`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        // Rate limited - wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
        return fetchRoute(start, end, retries - 1);
      }
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.paths?.[0]?.points?.coordinates) {
      const route = data.paths[0].points.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
      routeCache[cacheKey] = { path: route, timestamp: Date.now() };
      return route;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching route:", error);
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchRoute(start, end, retries - 1);
    }
    return null;
  }
};

const EvacuationRoutes = ({ routes, standalone = false }: EvacuationRoutesProps) => {
  const [computedRoutes, setComputedRoutes] = useState<RouteCoordinates[]>([]);
  
  useEffect(() => {
    if (!standalone) {
      // Create initial routes from provided geometry
      const baseRoutes = routes.map(route => ({
        id: route.id,
        path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
        status: route.status,
        routeName: route.routeName || '',
        startPoint: route.startPoint,
        endPoint: route.endPoint,
        estimatedTime: route.estimatedTime,
        transportMethods: route.transportMethods
      }));
      
      setComputedRoutes(baseRoutes);

      // Process routes sequentially with enhanced data
      const processRoutes = async () => {
        for (const route of routes) {
          try {
            const startCoords = extractCoordinates(route.startPoint);
            const endCoords = extractCoordinates(route.endPoint);
            
            const path = await fetchRoute(startCoords, endCoords);
            
            if (path) {
              setComputedRoutes(prev => 
                prev.map(r => r.id === route.id ? { ...r, path } : r)
              );
            }
            
            // Rate limiting protection
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (err) {
            console.error(`Error processing route ${route.id}:`, err);
          }
        }
      };
      
      processRoutes();
    }
  }, [routes, standalone]);

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

  return (
    <>
      {computedRoutes.map((route) => (
        <Polyline
          key={`evac-route-${route.id}`}
          positions={route.path}
          pathOptions={{
            color: route.status === "open" ? "#22c55e" : 
                   route.status === "congested" ? "#f97316" : "#ef4444",
            weight: 5,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round",
            dashArray: route.status === "closed" ? "10, 10" : undefined
          }}
        >
          <Popup className="min-w-[200px]">
            <div className="space-y-1">
              <h4 className="font-bold">{route.routeName || `Route ${route.id}`}</h4>
              <div className="flex justify-between">
                <span className="text-muted-foreground">From:</span>
                <span>{route.startPoint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span>{route.endPoint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${
                  route.status === "open" ? "text-green-600" :
                  route.status === "congested" ? "text-yellow-600" : "text-red-600"
                }`}>
                  {route.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span>{route.estimatedTime} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transport:</span>
                <span>{route.transportMethods.join(', ')}</span>
              </div>
            </div>
          </Popup>
        </Polyline>
      ))}
    </>
  );
};

export default EvacuationRoutes;
