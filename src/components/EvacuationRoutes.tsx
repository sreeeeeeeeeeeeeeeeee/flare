
import { useEffect, useState, useRef } from 'react';
import { Polyline, Popup } from 'react-leaflet';
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
};

interface EvacuationRoutesProps {
  routes: EvacuationRouteType[];
  standalone?: boolean;
}

// Enhanced location database with proper coordinates
const LOCATIONS: Record<string, [number, number]> = {
  police: [50.4230, -73.8720],       // Police station in Mistissini
  fire: [50.4215, -73.8695],         // Fire department
  Mistissini: [50.4221, -73.8683],   // Central Mistissini
  medie: [50.4208, -73.8660],        // Medical center
  hospital: [50.4230, -73.8780],     // Hospital
  community: [50.4232, -73.8660],    // Community center
  school: [50.4225, -73.8700],       // School
  arena: [50.4210, -73.8750],        // Arena
  store: [50.4228, -73.8690],        // Store
  highway: [50.4270, -73.8620],      // Highway exit
  Gur: [50.4200, -73.8700]           // Additional location
};

const GRAPHHOPPER_API_KEY = '5adb1e1c-29a2-4293-81c1-1c81779679bb';

// Global cache to persist routes across re-renders and component instances
const globalRouteCache: Record<string, [number, number][]> = {};

const EvacuationRoutes = ({ routes, standalone = false }: EvacuationRoutesProps) => {
  const [computedRoutes, setComputedRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);
  
  // Use a ref to hold the routes to avoid dependency issues
  const routesRef = useRef(routes);
  routesRef.current = routes;
  
  useEffect(() => {
    isMountedRef.current = true;
    
    if (!standalone && !isProcessingRef.current) {
      calculateRoutes();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [standalone]);

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
          
          // Try to get coordinates from known locations
          if (LOCATIONS[route.startPoint.toLowerCase()]) {
            startCoords = LOCATIONS[route.startPoint.toLowerCase()];
          } else {
            // Default
            startCoords = [50.4221, -73.8683]; // Mistissini center
          }
          
          if (LOCATIONS[route.endPoint.toLowerCase()]) {
            endCoords = LOCATIONS[route.endPoint.toLowerCase()];
          } else {
            // Default
            endCoords = [50.4270, -73.8620]; // Highway
          }

          // Create cache key
          const cacheKey = `${startCoords[0]},${startCoords[1]}_${endCoords[0]},${endCoords[1]}_${route.id}`;
          
          let path: [number, number][];
          
          // Check global cache first
          if (globalRouteCache[cacheKey]) {
            path = globalRouteCache[cacheKey];
          } else {
            // Fetch route from GraphHopper
            const response = await fetch(
              `https://graphhopper.com/api/1/route?` +
              `point=${startCoords[0]},${startCoords[1]}&` +
              `point=${endCoords[0]},${endCoords[1]}&` +
              `vehicle=car&key=${GRAPHHOPPER_API_KEY}&` +
              `points_encoded=false&` +
              `locale=en`
            );

            if (!response.ok) {
              throw new Error(`GraphHopper API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.paths && data.paths.length > 0) {
              path = data.paths[0].points.coordinates.map(
                ([lng, lat]: [number, number]) => [lat, lng]
              ) as [number, number][];
              
              // Save to global cache
              globalRouteCache[cacheKey] = path;
            } else {
              throw new Error("No route found");
            }
          }

          const enhancedRoute = {
            id: route.id,
            path: path,
            status: route.status,
            start: route.startPoint,
            end: route.endPoint,
            estimatedTime: route.estimatedTime,
            transportMethods: route.transportMethods,
            routeName: route.routeName || `Route ${route.id}`
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

  // Map view for routes
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
                <span>{route.start}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span>{route.end}</span>
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
              {route.estimatedTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span>{route.estimatedTime} min</span>
                </div>
              )}
              {route.transportMethods && route.transportMethods.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transport:</span>
                  <span>{route.transportMethods.join(', ')}</span>
                </div>
              )}
            </div>
          </Popup>
        </Polyline>
      ))}
    </>
  );
};

export default EvacuationRoutes;
