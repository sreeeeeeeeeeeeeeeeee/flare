
import { useEffect, useState, useRef } from "react";
import { Polyline, Popup } from "react-leaflet";
import { EvacuationRouteType } from "@/types/emergency";
import { mistissiniStreets, mistissiniHighways, evacuationDestinations, namedLocations } from "@/services/mistissiniData";

type Coordinate = [number, number];

type RouteCoordinates = {
  id: string;
  path: Coordinate[];
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

const ensureCoordinate = (point: number[]): Coordinate => {
  if (Array.isArray(point) && point.length >= 2) {
    return [point[0], point[1]];
  }
  console.warn(`Invalid coordinate format: ${JSON.stringify(point)}`);
  return [50.4221, -73.8683];
};

const extractCoordinates = (locationString: string): { lat: number; lng: number } => {
  const cleanString = locationString.replace(/[^\w\s()\-,.]/g, '').trim();
  
  // First check if it's one of our named locations
  const namedLocation = Object.entries(namedLocations).find(
    ([name]) => cleanString.toLowerCase().includes(name.toLowerCase())
  );
  
  if (namedLocation) {
    return namedLocation[1];
  }

  // Then check if it matches a street
  const matchedStreet = [...mistissiniStreets, ...mistissiniHighways].find(street => 
    cleanString.toLowerCase().includes(street.name.toLowerCase())
  );
  if (matchedStreet) {
    const midIndex = Math.floor(matchedStreet.path.length / 2);
    const point = ensureCoordinate(matchedStreet.path[midIndex]);
    return { lat: point[0], lng: point[1] };
  }

  // Then check evacuation destinations
  const matchedDestination = evacuationDestinations.find(dest => 
    cleanString.toLowerCase().includes(dest.name.toLowerCase())
  );
  if (matchedDestination) {
    return { lat: matchedDestination.lat, lng: matchedDestination.lng };
  }

  // Try to extract coordinates from string
  const coordMatch = cleanString.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
  if (coordMatch) {
    return { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
  }

  console.warn(`Could not determine coordinates for location: ${locationString}`);
  return { lat: 50.4221, lng: -73.8683 }; // Default to Mistissini center
};

// Improved route cache
const MAX_CACHE_SIZE = 30;
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;
const routeCache: Record<string, { path: Coordinate[]; timestamp: number }> = {};

const getCacheKey = (start: { lat: number; lng: number }, end: { lat: number; lng: number }): string => {
  return `${start.lat.toFixed(6)},${start.lng.toFixed(6)}_${end.lat.toFixed(6)},${end.lng.toFixed(6)}`;
};

const cleanCache = () => {
  const now = Date.now();
  const keys = Object.keys(routeCache);
  
  keys.forEach(key => {
    if (now - routeCache[key].timestamp > CACHE_EXPIRATION_MS) {
      delete routeCache[key];
    }
  });
  
  if (Object.keys(routeCache).length > MAX_CACHE_SIZE) {
    const sortedKeys = Object.keys(routeCache).sort(
      (a, b) => routeCache[a].timestamp - routeCache[b].timestamp
    );
    
    const keysToRemove = sortedKeys.slice(0, sortedKeys.length - MAX_CACHE_SIZE);
    keysToRemove.forEach(key => delete routeCache[key]);
  }
};

// Improved street point finding with better distance calculation
const findClosestStreetPoint = (point: Coordinate, thresholdKm = 0.5): Coordinate | null => {
  let closestPoint: Coordinate | null = null;
  let minDistance = Infinity;

  const checkPoints = (points: number[][]) => {
    points.forEach(streetPoint => {
      if (streetPoint.length < 2) return;
      
      const R = 6371; // Earth radius in km
      const dLat = (streetPoint[0] - point[0]) * Math.PI / 180;
      const dLng = (streetPoint[1] - point[1]) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point[0] * Math.PI / 180) * Math.cos(streetPoint[0] * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      
      if (distance < minDistance && distance < thresholdKm) {
        minDistance = distance;
        closestPoint = [streetPoint[0], streetPoint[1]];
      }
    });
  };

  [...mistissiniStreets, ...mistissiniHighways].forEach(street => {
    checkPoints(street.path);
  });

  return closestPoint;
};

// Enhanced street route finding with better connectivity
const findStreetRoute = (start: Coordinate, end: Coordinate): Coordinate[] => {
  // First, find the streets closest to start and end points
  const allStreets = [...mistissiniStreets, ...mistissiniHighways];
  
  let startStreet = null;
  let endStreet = null;
  let minStartDist = Infinity;
  let minEndDist = Infinity;
  let startPointOnStreet: Coordinate | null = null;
  let endPointOnStreet: Coordinate | null = null;
  
  for (const street of allStreets) {
    for (let i = 0; i < street.path.length; i++) {
      const point = ensureCoordinate(street.path[i]);
      
      // Calculate distance to start
      const startDist = Math.sqrt(
        Math.pow(point[0] - start[0], 2) + 
        Math.pow(point[1] - start[1], 2)
      );
      
      if (startDist < minStartDist) {
        minStartDist = startDist;
        startStreet = street;
        startPointOnStreet = point;
      }
      
      // Calculate distance to end
      const endDist = Math.sqrt(
        Math.pow(point[0] - end[0], 2) + 
        Math.pow(point[1] - end[1], 2)
      );
      
      if (endDist < minEndDist) {
        minEndDist = endDist;
        endStreet = street;
        endPointOnStreet = point;
      }
    }
  }
  
  if (!startStreet || !endStreet || !startPointOnStreet || !endPointOnStreet) {
    // If we can't find streets, just return direct line
    return [start, end];
  }
  
  // Same street case - simplest path
  if (startStreet.name === endStreet.name) {
    const streetPoints = startStreet.path.map(p => ensureCoordinate(p));
    
    // Find indices of closest points
    let startIdx = -1;
    let endIdx = -1;
    minStartDist = Infinity;
    minEndDist = Infinity;
    
    for (let i = 0; i < streetPoints.length; i++) {
      const startDist = Math.sqrt(
        Math.pow(streetPoints[i][0] - startPointOnStreet[0], 2) + 
        Math.pow(streetPoints[i][1] - startPointOnStreet[1], 2)
      );
      
      if (startDist < minStartDist) {
        minStartDist = startDist;
        startIdx = i;
      }
      
      const endDist = Math.sqrt(
        Math.pow(streetPoints[i][0] - endPointOnStreet[0], 2) + 
        Math.pow(streetPoints[i][1] - endPointOnStreet[1], 2)
      );
      
      if (endDist < minEndDist) {
        minEndDist = endDist;
        endIdx = i;
      }
    }
    
    // Get slice of street path in right order
    const route = [start];
    if (startIdx <= endIdx) {
      route.push(...streetPoints.slice(startIdx, endIdx + 1));
    } else {
      route.push(...streetPoints.slice(endIdx, startIdx + 1).reverse());
    }
    route.push(end);
    
    return route;
  }
  
  // Different streets case - need to find a connection
  // For simplicity, we'll use a 2-segment approach
  // 1. From start to nearest intersection
  // 2. From intersection to end
  
  // Function to find intersections between streets
  const findIntersections = (street1: typeof startStreet, street2: typeof endStreet) => {
    const intersections: Coordinate[] = [];
    const path1 = street1.path.map(p => ensureCoordinate(p));
    const path2 = street2.path.map(p => ensureCoordinate(p));
    
    // Simple intersection detection - look for very close points
    for (const p1 of path1) {
      for (const p2 of path2) {
        const distance = Math.sqrt(
          Math.pow(p1[0] - p2[0], 2) + 
          Math.pow(p1[1] - p2[1], 2)
        );
        
        if (distance < 0.0005) { // Approximately 50 meters
          intersections.push([p1[0], p1[1]]);
          break; // Found one intersection for this point
        }
      }
    }
    
    return intersections;
  };
  
  const intersections = findIntersections(startStreet, endStreet);
  
  if (intersections.length > 0) {
    // Use the first intersection as the connection point
    const intersection = intersections[0];
    
    // Create route: start -> along startStreet -> intersection -> along endStreet -> end
    const route = [start];
    
    // Add path along start street to intersection
    const startPath = startStreet.path.map(p => ensureCoordinate(p));
    let closestIdxToIntersection = 0;
    let minDistToIntersection = Infinity;
    
    for (let i = 0; i < startPath.length; i++) {
      const dist = Math.sqrt(
        Math.pow(startPath[i][0] - intersection[0], 2) + 
        Math.pow(startPath[i][1] - intersection[1], 2)
      );
      
      if (dist < minDistToIntersection) {
        minDistToIntersection = dist;
        closestIdxToIntersection = i;
      }
    }
    
    // Find closest point on start street to our start point
    let closestIdxToStart = 0;
    let minDistToStart = Infinity;
    
    for (let i = 0; i < startPath.length; i++) {
      const dist = Math.sqrt(
        Math.pow(startPath[i][0] - start[0], 2) + 
        Math.pow(startPath[i][1] - start[1], 2)
      );
      
      if (dist < minDistToStart) {
        minDistToStart = dist;
        closestIdxToStart = i;
      }
    }
    
    // Add the path in the right order
    if (closestIdxToStart <= closestIdxToIntersection) {
      route.push(...startPath.slice(closestIdxToStart, closestIdxToIntersection + 1));
    } else {
      route.push(...startPath.slice(closestIdxToIntersection, closestIdxToStart + 1).reverse());
    }
    
    // Add intersection
    route.push(intersection);
    
    // Add path along end street from intersection to end
    const endPath = endStreet.path.map(p => ensureCoordinate(p));
    closestIdxToIntersection = 0;
    minDistToIntersection = Infinity;
    
    for (let i = 0; i < endPath.length; i++) {
      const dist = Math.sqrt(
        Math.pow(endPath[i][0] - intersection[0], 2) + 
        Math.pow(endPath[i][1] - intersection[1], 2)
      );
      
      if (dist < minDistToIntersection) {
        minDistToIntersection = dist;
        closestIdxToIntersection = i;
      }
    }
    
    // Find closest point on end street to our end point
    let closestIdxToEnd = 0;
    let minDistToEnd = Infinity;
    
    for (let i = 0; i < endPath.length; i++) {
      const dist = Math.sqrt(
        Math.pow(endPath[i][0] - end[0], 2) + 
        Math.pow(endPath[i][1] - end[1], 2)
      );
      
      if (dist < minDistToEnd) {
        minDistToEnd = dist;
        closestIdxToEnd = i;
      }
    }
    
    // Add the path in the right order
    if (closestIdxToIntersection <= closestIdxToEnd) {
      route.push(...endPath.slice(closestIdxToIntersection, closestIdxToEnd + 1));
    } else {
      route.push(...endPath.slice(closestIdxToEnd, closestIdxToIntersection + 1).reverse());
    }
    
    // Add end point
    route.push(end);
    
    return route;
  }
  
  // If we can't find a direct intersection, use the existing full street paths
  // This is a fallback to ensure routes still follow streets
  const startPath = startStreet.path.map(p => ensureCoordinate(p));
  const endPath = endStreet.path.map(p => ensureCoordinate(p));
  
  return [start, ...startPath, ...endPath, end];
};

const fetchRoute = async (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<Coordinate[]> => {
  const startPoint: Coordinate = [start.lat, start.lng];
  const endPoint: Coordinate = [end.lat, end.lng];
  
  // Try to snap to nearest street points for better routing
  const snappedStart = findClosestStreetPoint(startPoint) || startPoint;
  const snappedEnd = findClosestStreetPoint(endPoint) || endPoint;
  
  const cacheKey = getCacheKey(
    { lat: snappedStart[0], lng: snappedStart[1] },
    { lat: snappedEnd[0], lng: snappedEnd[1] }
  );

  // Check cache first
  if (routeCache[cacheKey]) {
    return routeCache[cacheKey].path;
  }

  // Try to find a route using our street data first
  const streetRoute = findStreetRoute(snappedStart, snappedEnd);
  if (streetRoute.length > 2) {
    routeCache[cacheKey] = { 
      path: streetRoute,
      timestamp: Date.now()
    };
    cleanCache();
    return streetRoute;
  }

  try {
    // Fall back to GraphHopper API if our street routing didn't produce a good route
    const url = `https://graphhopper.com/api/1/route?` +
      `point=${snappedStart[0]},${snappedStart[1]}&` +
      `point=${snappedEnd[0]},${snappedEnd[1]}&` +
      `vehicle=car&locale=en&key=${API_KEY}&` +
      `points_encoded=false`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.paths?.[0]?.points?.coordinates) {
      const apiRoute = data.paths[0].points.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as Coordinate
      );
      
      routeCache[cacheKey] = { 
        path: apiRoute,
        timestamp: Date.now()
      };
      cleanCache();
      return apiRoute;
    }
    
    throw new Error("API response missing coordinates");
  } catch (error) {
    console.error("Error fetching route:", error);
    
    // If API fails, use our best street route
    const route = findStreetRoute(snappedStart, snappedEnd);
    
    routeCache[cacheKey] = { 
      path: route,
      timestamp: Date.now()
    };
    cleanCache();
    return route;
  }
};

const EvacuationRoutes = ({ routes, standalone = false }: EvacuationRoutesProps) => {
  const [computedRoutes, setComputedRoutes] = useState<RouteCoordinates[]>([]);
  const processingRef = useRef(false);
  const routesRef = useRef(routes);
  
  useEffect(() => {
    routesRef.current = routes;
  }, [routes]);
  
  useEffect(() => {
    if (!standalone && routes.length > 0 && !processingRef.current) {
      processingRef.current = true;
      
      // Initially set base routes from provided geometry
      const baseRoutes = routes.map(route => ({
        id: route.id,
        path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as Coordinate),
        status: route.status,
        routeName: route.routeName || `Route ${route.id}`,
        startPoint: route.startPoint,
        endPoint: route.endPoint,
        estimatedTime: route.estimatedTime,
        transportMethods: route.transportMethods
      }));
      
      setComputedRoutes(baseRoutes);
      
      // Enhanced route calculation
      const enhanceRoutes = async () => {
        try {
          const enhancedRoutes = [];
          
          for (const route of routesRef.current) {
            try {
              const startCoords = extractCoordinates(route.startPoint);
              const endCoords = extractCoordinates(route.endPoint);
              
              // Get path following streets
              const path = await fetchRoute(startCoords, endCoords);
              
              enhancedRoutes.push({
                id: route.id,
                path: path,
                status: route.status,
                routeName: route.routeName || `Route ${route.id}`,
                startPoint: route.startPoint,
                endPoint: route.endPoint,
                estimatedTime: route.estimatedTime,
                transportMethods: route.transportMethods
              });
              
              // Add a slight delay between route calculations to prevent rate limits
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (err) {
              console.error(`Error enhancing route ${route.id}:`, err);
              // Fall back to the base route if enhancement fails
              const baseRoute = baseRoutes.find(r => r.id === route.id);
              if (baseRoute) {
                enhancedRoutes.push(baseRoute);
              }
            }
          }
          
          setComputedRoutes(enhancedRoutes);
        } finally {
          processingRef.current = false;
        }
      };
      
      // Start enhancing routes
      enhanceRoutes();
    }
  }, [routes, standalone]);

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
