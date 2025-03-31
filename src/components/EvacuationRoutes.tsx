import { useEffect, useState, useRef } from "react";
import { Polyline, Popup } from "react-leaflet";
import { EvacuationRouteType } from "@/types/emergency";
import { mistissiniStreets, mistissiniHighways, evacuationDestinations } from "@/services/mistissiniData";

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

// Enhanced coordinate extraction with precise street matching
const extractCoordinates = (locationString: string): { lat: number; lng: number } => {
  // Remove any extra whitespace or special characters
  const cleanString = locationString.replace(/[^\w\s()\-,.]/g, '').trim();

  // 1. Check against exact street names first
  const matchedStreet = [...mistissiniStreets, ...mistissiniHighways].find(street => 
    cleanString.toLowerCase().includes(street.name.toLowerCase())
  );
  if (matchedStreet) {
    // Return the midpoint of the street for better accuracy
    const midIndex = Math.floor(matchedStreet.path.length / 2);
    return {
      lat: matchedStreet.path[midIndex][0],
      lng: matchedStreet.path[midIndex][1]
    };
  }

  // 2. Check against evacuation destinations
  const matchedDestination = evacuationDestinations.find(dest => 
    cleanString.toLowerCase().includes(dest.name.toLowerCase())
  );
  if (matchedDestination) {
    return {
      lat: matchedDestination.lat,
      lng: matchedDestination.lng
    };
  }

  // 3. Try to extract coordinates from string
  const coordMatch = cleanString.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
  if (coordMatch) {
    return {
      lat: parseFloat(coordMatch[1]),
      lng: parseFloat(coordMatch[2])
    };
  }

  // Default to center of Mistissini with warning
  console.warn(`Could not determine coordinates for location: ${locationString}`);
  return { lat: 50.4221, lng: -73.8683 };
};

// Permanent route cache to prevent flickering
const routeCache: Record<string, [number, number][]> = {};

const getCacheKey = (start: { lat: number; lng: number }, end: { lat: number; lng: number }): string => {
  return `${start.lat.toFixed(6)},${start.lng.toFixed(6)}_${end.lat.toFixed(6)},${end.lng.toFixed(6)}`;
};

// Find the closest street point to snap routes to roads
const findClosestStreetPoint = (point: [number, number], thresholdKm = 0.2): [number, number] | null => {
  let closestPoint: [number, number] | null = null;
  let minDistance = Infinity;

  const checkPoints = (points: [number, number][]) => {
    points.forEach(streetPoint => {
      // Haversine distance calculation in km
      const R = 6371;
      const dLat = (streetPoint[0] - point[0]) * Math.PI / 180;
      const dLng = (streetPoint[1] - point[1]) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point[0] * Math.PI / 180) * Math.cos(streetPoint[0] * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      
      if (distance < minDistance && distance < thresholdKm) {
        minDistance = distance;
        closestPoint = streetPoint;
      }
    });
  };

  // Check all street segments
  [...mistissiniStreets, ...mistissiniHighways].forEach(street => {
    checkPoints(street.path);
  });

  return closestPoint;
};

// Find a street route between two points by using the street network directly
const findStreetRoute = (start: [number, number], end: [number, number]): [number, number][] => {
  // Try to find streets containing or near the start and end points
  const nearStartStreet = [...mistissiniStreets, ...mistissiniHighways].find(street => {
    return street.path.some(point => {
      const distance = Math.sqrt(
        Math.pow(point[0] - start[0], 2) + 
        Math.pow(point[1] - start[1], 2)
      );
      return distance < 0.005; // ~500m threshold
    });
  });
  
  const nearEndStreet = [...mistissiniStreets, ...mistissiniHighways].find(street => {
    return street.path.some(point => {
      const distance = Math.sqrt(
        Math.pow(point[0] - end[0], 2) + 
        Math.pow(point[1] - end[1], 2)
      );
      return distance < 0.005; // ~500m threshold
    });
  });
  
  // If we found both streets and they're the same, use that street's path
  if (nearStartStreet && nearEndStreet && nearStartStreet.name === nearEndStreet.name) {
    return nearStartStreet.path;
  }
  
  // Otherwise use actual streets as much as possible for the route
  const route: [number, number][] = [start];
  
  if (nearStartStreet) {
    // Add points from the start street (after the closest point to start)
    const startPathIndex = nearStartStreet.path.findIndex(point => {
      const distance = Math.sqrt(
        Math.pow(point[0] - start[0], 2) + 
        Math.pow(point[1] - start[1], 2)
      );
      return distance < 0.005;
    });
    
    if (startPathIndex !== -1) {
      // Add the rest of the path after this point
      route.push(...nearStartStreet.path.slice(startPathIndex));
    }
  }
  
  // If we have both streets but they're different, try to find a connecting street
  if (nearStartStreet && nearEndStreet && nearStartStreet.name !== nearEndStreet.name) {
    const connectingStreets = [...mistissiniStreets, ...mistissiniHighways].filter(street => {
      // Check if this street connects to both the start and end streets
      return street.name !== nearStartStreet.name && 
             street.name !== nearEndStreet.name &&
             street.path.some(point => {
               return nearStartStreet.path.some(startPoint => {
                 const distance = Math.sqrt(
                   Math.pow(point[0] - startPoint[0], 2) + 
                   Math.pow(point[1] - startPoint[1], 2)
                 );
                 return distance < 0.005;
               });
             }) &&
             street.path.some(point => {
               return nearEndStreet.path.some(endPoint => {
                 const distance = Math.sqrt(
                   Math.pow(point[0] - endPoint[0], 2) + 
                   Math.pow(point[1] - endPoint[1], 2)
                 );
                 return distance < 0.005;
               });
             });
    });
    
    if (connectingStreets.length > 0) {
      route.push(...connectingStreets[0].path);
    }
  }
  
  if (nearEndStreet) {
    // Add points from the end street (up to the closest point to end)
    const endPathIndex = nearEndStreet.path.findIndex(point => {
      const distance = Math.sqrt(
        Math.pow(point[0] - end[0], 2) + 
        Math.pow(point[1] - end[1], 2)
      );
      return distance < 0.005;
    });
    
    if (endPathIndex !== -1) {
      // Add the path up to this point
      route.push(...nearEndStreet.path.slice(0, endPathIndex + 1));
    }
  }
  
  route.push(end);
  
  // Deduplicate points
  const uniqueRoute: [number, number][] = [];
  route.forEach(point => {
    if (!uniqueRoute.some(p => p[0] === point[0] && p[1] === point[1])) {
      uniqueRoute.push(point);
    }
  });
  
  return uniqueRoute;
};

// Enhanced route fetching prioritizing street data over API
const fetchRoute = async (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<[number, number][]> => {
  const startPoint: [number, number] = [start.lat, start.lng];
  const endPoint: [number, number] = [end.lat, end.lng];
  
  // Try to snap points to streets
  const snappedStart = findClosestStreetPoint(startPoint);
  const snappedEnd = findClosestStreetPoint(endPoint);

  const effectiveStart = snappedStart || startPoint;
  const effectiveEnd = snappedEnd || endPoint;

  const cacheKey = getCacheKey(
    { lat: effectiveStart[0], lng: effectiveStart[1] },
    { lat: effectiveEnd[0], lng: effectiveEnd[1] }
  );

  // Return cached route if available (prevents flickering)
  if (routeCache[cacheKey]) {
    return routeCache[cacheKey];
  }

  // First try to find a route using our street data directly
  const streetRoute = findStreetRoute(effectiveStart, effectiveEnd);
  if (streetRoute.length > 2) {
    // Cache and return street-based route
    routeCache[cacheKey] = streetRoute;
    return streetRoute;
  }

  // Fallback: Use GraphHopper API as last resort
  try {
    const url = `https://graphhopper.com/api/1/route?` +
      `point=${effectiveStart[0]},${effectiveStart[1]}&` +
      `point=${effectiveEnd[0]},${effectiveEnd[1]}&` +
      `vehicle=car&locale=en&key=${API_KEY}&` +
      `points_encoded=false`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.paths?.[0]?.points?.coordinates) {
      const apiRoute = data.paths[0].points.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
      );
      
      // Cache the route
      routeCache[cacheKey] = apiRoute;
      return apiRoute;
    }
    
    // If API fails, create a direct route following streets where possible
    const directRoute = [startPoint];
    
    const midPoints = [...mistissiniStreets, ...mistissiniHighways].reduce((points, street) => {
      // Add some points from streets that might be on the way
      const isRelevant = street.path.some(p => {
        const distanceToLine = distancePointToLine(p, startPoint, endPoint);
        return distanceToLine < 0.003; // Only use streets close to direct line
      });
      
      if (isRelevant) {
        points.push(...street.path.filter(p => 
          distancePointToLine(p, startPoint, endPoint) < 0.003
        ));
      }
      
      return points;
    }, [] as [number, number][]);
    
    // Sort mid points by distance from start to get a coherent path
    midPoints.sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a[0] - startPoint[0], 2) + Math.pow(a[1] - startPoint[1], 2));
      const distB = Math.sqrt(Math.pow(b[0] - startPoint[0], 2) + Math.pow(b[1] - startPoint[1], 2));
      return distA - distB;
    });
    
    directRoute.push(...midPoints);
    directRoute.push(endPoint);
    
    // Cache the direct route
    routeCache[cacheKey] = directRoute;
    return directRoute;
  } catch (error) {
    console.error("Error fetching route:", error);
    
    // Last fallback: simple direct route
    const fallbackRoute = [startPoint, endPoint];
    routeCache[cacheKey] = fallbackRoute;
    return fallbackRoute;
  }
};

// Calculate distance from point to line segment (for route generation)
const distancePointToLine = (
  point: [number, number], 
  lineStart: [number, number], 
  lineEnd: [number, number]
): number => {
  const A = point[0] - lineStart[0];
  const B = point[1] - lineStart[1];
  const C = lineEnd[0] - lineStart[0];
  const D = lineEnd[1] - lineStart[1];

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = lineStart[0];
    yy = lineStart[1];
  } else if (param > 1) {
    xx = lineEnd[0];
    yy = lineEnd[1];
  } else {
    xx = lineStart[0] + param * C;
    yy = lineStart[1] + param * D;
  }

  const dx = point[0] - xx;
  const dy = point[1] - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
};

const EvacuationRoutes = ({ routes, standalone = false }: EvacuationRoutesProps) => {
  const [computedRoutes, setComputedRoutes] = useState<RouteCoordinates[]>([]);
  const isProcessingRef = useRef(false);
  
  useEffect(() => {
    if (!standalone && routes.length > 0 && !isProcessingRef.current) {
      // Set processing flag to prevent multiple simultaneous updates
      isProcessingRef.current = true;
      
      // First create routes from provided geometry
      const baseRoutes = routes.map(route => ({
        id: route.id,
        path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]) as [number, number][],
        status: route.status,
        routeName: route.routeName || `Route ${route.id}`,
        startPoint: route.startPoint,
        endPoint: route.endPoint,
        estimatedTime: route.estimatedTime,
        transportMethods: route.transportMethods
      }));
      
      setComputedRoutes(baseRoutes);

      // Then enhance with accurate street routing
      const enhanceRoutes = async () => {
        try {
          const enhancedRoutes = [];
          
          for (const route of routes) {
            try {
              const startCoords = extractCoordinates(route.startPoint);
              const endCoords = extractCoordinates(route.endPoint);
              
              const path = await fetchRoute(startCoords, endCoords);
              
              enhancedRoutes.push({
                id: route.id,
                path: path as [number, number][],
                status: route.status,
                routeName: route.routeName || `Route ${route.id}`,
                startPoint: route.startPoint,
                endPoint: route.endPoint,
                estimatedTime: route.estimatedTime,
                transportMethods: route.transportMethods
              });
              
              // Throttle processing
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (err) {
              console.error(`Error enhancing route ${route.id}:`, err);
              // Keep the base route if enhancement fails
              const baseRoute = baseRoutes.find(r => r.id === route.id);
              if (baseRoute) {
                enhancedRoutes.push(baseRoute);
              }
            }
          }
          
          // Only update state once at the end to reduce flickering
          setComputedRoutes(enhancedRoutes);
        } finally {
          // Clear processing flag when done
          isProcessingRef.current = false;
        }
      };
      
      enhanceRoutes();
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
