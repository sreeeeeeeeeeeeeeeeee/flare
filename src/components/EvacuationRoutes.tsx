
import { useEffect, useState, useRef, useCallback } from 'react';
import { Polyline, Popup, useMap } from 'react-leaflet';
import { EvacuationRouteType } from '@/types/emergency';

// Define types for our data
type Location = {
  name: string;
  position: [number, number];
};

type Route = {
  id: string;
  path: [number, number][];
  status: 'open' | 'congested' | 'closed';
  start: string;
  end: string;
  estimatedTime?: number;
  transportMethods?: ('car' | 'foot' | 'emergency')[];
  routeName?: string;
  distance?: number;
  lastUpdated?: Date;
};

interface EvacuationRoutesProps {
  routes: EvacuationRouteType[];
  standalone?: boolean;
}

// Enhanced location database with proper coordinates
const LOCATIONS: Record<string, [number, number]> = {
  // Main locations
  police: [50.4230, -73.8720],       // Police station in Mistissini
  fire: [50.4215, -73.8695],         // Fire department
  mistissini: [50.4221, -73.8683],   // Central Mistissini
  medie: [50.4208, -73.8660],        // Medical center
  hospital: [50.4230, -73.8780],     // Hospital
  community: [50.4232, -73.8660],    // Community center
  school: [50.4225, -73.8700],       // School
  arena: [50.4210, -73.8750],        // Arena
  store: [50.4228, -73.8690],        // Store
  highway: [50.4270, -73.8620],      // Highway exit
  
  // Additional areas
  madassin: [50.4180, -73.8720],     // Residential area
  drobose: [50.4150, -73.8750],      // Industrial zone
  northMistissini: [50.4280, -73.8650], // Northern expansion
  southMistissini: [50.4120, -73.8700], // Southern area
  
  // Neighboring towns
  chibougamau: [49.9166, -74.3694],
  oujeBougoumou: [49.9257, -74.8107],
  waswanipi: [49.6892, -75.9564]
};

// Lowercase aliases for location lookups 
const LOCATION_ALIASES: Record<string, string> = {
  "gur": "madassin",
  "mistissini": "mistissini", 
  "madassin": "madassin",
  "drobose": "drobose"
};

// Water boundaries to avoid (rivers/lakes)
const WATER_BOUNDARIES = [
  [50.4200, -73.8690], [50.4210, -73.8680], [50.4220, -73.8670],
  [50.4230, -73.8660], [50.4240, -73.8650], [50.4150, -73.8740]
];

const GRAPHHOPPER_API_KEY = '5adb1e1c-29a2-4293-81c1-1c81779679bb';

// Global cache to persist routes across re-renders and component instances
const globalRouteCache: Record<string, [number, number][]> = {};

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

const EvacuationRoutes = ({ routes, standalone = false }: EvacuationRoutesProps) => {
  const [computedRoutes, setComputedRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);
  const isInMapContainer = standalone ? false : useIsInMapContainer();
  
  // Use a ref to hold the routes to avoid dependency issues
  const routesRef = useRef(routes);
  routesRef.current = routes;
  
  // Check if point is near water
  const isNearWater = useCallback((point: [number, number]) => {
    return WATER_BOUNDARIES.some(waterPoint => {
      const dx = waterPoint[0] - point[0];
      const dy = waterPoint[1] - point[1];
      return Math.sqrt(dx * dx + dy * dy) < 0.0015; // ~150m threshold
    });
  }, []);

  // Fetch route that avoids water
  const fetchSafeRoute = useCallback(async (start: [number, number], end: [number, number]) => {
    try {
      // First try direct route
      const directPath = await fetchRoute(start, end);
      if (directPath && !directPath.some(point => isNearWater(point))) {
        return directPath;
      }

      // If direct path crosses water, try with avoidance waypoints
      const waypoints = [
        [50.4250, -73.8700], // Northern bypass
        [50.4170, -73.8600], // Southern bypass
        [50.4200, -73.8750]  // Western bypass
      ];

      for (const waypoint of waypoints) {
        const path1 = await fetchRoute(start, waypoint as [number, number]);
        const path2 = await fetchRoute(waypoint as [number, number], end);
        
        if (path1 && path2 && 
            !path1.some(p => isNearWater(p)) && 
            !path2.some(p => isNearWater(p))) {
          return [...path1.slice(0, -1), ...path2];
        }
      }

      // Fallback to straight line if no safe route found
      return [start, end];
    } catch (error) {
      console.error('Route calculation error:', error);
      return [start, end];
    }
  }, [isNearWater]);

  // Basic route fetching
  const fetchRoute = useCallback(async (start: [number, number], end: [number, number]) => {
    // Create cache key
    const cacheKey = `${start[0]},${start[1]}_${end[0]},${end[1]}`;
    
    // Check cache first
    if (globalRouteCache[cacheKey]) {
      return globalRouteCache[cacheKey];
    }
    
    try {
      const response = await fetch(
        `https://graphhopper.com/api/1/route?` +
        `point=${start[0]},${start[1]}&` +
        `point=${end[0]},${end[1]}&` +
        `vehicle=car&key=${GRAPHHOPPER_API_KEY}&` +
        `points_encoded=false&` +
        `locale=en&` +
        `ch.disable=true`
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      
      const data = await response.json();
      const path = data.paths?.[0]?.points?.coordinates?.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
      ) || null;
      
      if (path) {
        // Save to cache
        globalRouteCache[cacheKey] = path;
      }
      
      return path;
    } catch (error) {
      console.error('Routing error:', error);
      return null;
    }
  }, []);

  // Calculate route distance in km
  const calculateDistance = useCallback((path: [number, number][]) => {
    if (path.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      total += haversineDistance(path[i-1][0], path[i-1][1], path[i][0], path[i][1]);
    }
    return total;
  }, []);

  // Haversine distance calculation
  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };
  
  useEffect(() => {
    isMountedRef.current = true;
    
    if (!standalone && !isProcessingRef.current && isInMapContainer) {
      calculateRoutes();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [standalone, isInMapContainer]);

  const calculateRoutes = async () => {
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    try {
      // First set basic routes based on provided data
      const baseRoutes = routesRef.current.map(route => ({
        id: route.id,
        path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
        status: route.status,
        start: route.startPoint,
        end: route.endPoint,
        estimatedTime: route.estimatedTime,
        transportMethods: route.transportMethods,
        routeName: route.routeName
      }));
      
      if (isMountedRef.current) {
        setComputedRoutes(baseRoutes);
      }
      
      // Then enhance with more accurate road-based routes
      const enhancedRoutes: Route[] = [];
      
      for (const route of routesRef.current) {
        try {
          // Get start and end coordinates
          let startCoords: [number, number];
          let endCoords: [number, number];
          
          // Try to get coordinates from known locations (case insensitive)
          const startKey = LOCATION_ALIASES[route.startPoint.toLowerCase()] || route.startPoint.toLowerCase();
          const endKey = LOCATION_ALIASES[route.endPoint.toLowerCase()] || route.endPoint.toLowerCase();
          
          if (LOCATIONS[startKey]) {
            startCoords = LOCATIONS[startKey];
          } else {
            // Default
            startCoords = LOCATIONS.mistissini; // Mistissini center
          }
          
          if (LOCATIONS[endKey]) {
            endCoords = LOCATIONS[endKey];
          } else {
            // Default
            endCoords = LOCATIONS.highway; // Highway
          }

          // Get safe route avoiding water
          const path = await fetchSafeRoute(startCoords, endCoords);
          const distance = calculateDistance(path);

          const enhancedRoute = {
            id: route.id,
            path: path,
            status: route.status,
            start: route.startPoint,
            end: route.endPoint,
            estimatedTime: route.estimatedTime,
            transportMethods: route.transportMethods,
            routeName: route.routeName || `Route ${route.id}`,
            distance,
            lastUpdated: new Date()
          };
          
          enhancedRoutes.push(enhancedRoute);
          
          // Add a slight delay to prevent hitting API rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error calculating route ${route.id}:`, error);
          
          // Keep the original route if enhancement fails
          const originalRoute = baseRoutes.find(r => r.id === route.id);
          if (originalRoute) {
            enhancedRoutes.push(originalRoute);
          }
        }
      }
      
      if (isMountedRef.current) {
        setComputedRoutes(enhancedRoutes);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error calculating routes:', error);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    } finally {
      isProcessingRef.current = false;
    }
  };

  // Standalone view for routes (outside map)
  if (standalone) {
    return (
      <div className="p-4 rounded-lg border border-border">
        <h3 className="text-lg font-medium mb-2">Evacuation Routes</h3>
        {isLoading ? (
          <div className="loading">Calculating evacuation routes...</div>
        ) : (
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
                <div className={`status-badge ${route.status}`}>
                  {route.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Only render map elements if we're actually inside a MapContainer
  if (!isInMapContainer) {
    console.log("EvacuationRoutes: Not rendering map elements because we're not in a MapContainer");
    return null;
  }

  // Map view for routes
  return (
    <>
      {isLoading ? (
        <div className="loading">Calculating safest evacuation routes...</div>
      ) : (
        computedRoutes.map((route) => (
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
              <h4>{route.routeName || `Route ${route.id}`}</h4>
              <div className="route-meta">
                <span className={`status-badge ${route.status}`}>
                  {route.status.toUpperCase()}
                </span>
                {route.distance && (
                  <span>{route.distance.toFixed(1)} km</span>
                )}
              </div>
              <div>
                <span className="text-muted-foreground text-xs">From:</span> {route.start}<br/>
                <span className="text-muted-foreground text-xs">To:</span> {route.end}
              </div>
              {route.estimatedTime && (
                <div className="mt-1">
                  <span className="text-muted-foreground text-xs">Time:</span> {route.estimatedTime} min
                </div>
              )}
              {route.transportMethods && route.transportMethods.length > 0 && (
                <div className="text-xs mt-1">
                  <span className="text-muted-foreground">Transport:</span> {route.transportMethods.join(', ')}
                </div>
              )}
              {route.lastUpdated && (
                <div className="route-updated">
                  Updated: {route.lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </Popup>
          </Polyline>
        ))
      )}
    </>
  );
};

export default EvacuationRoutes;
