import { useEffect, useState, useRef } from "react";
import { Polyline, Popup } from "react-leaflet";
import { EvacuationRouteType } from "@/types/emergency";
import { mistissiniStreets, mistissiniHighways, evacuationDestinations } from "@/services/mistissiniData";

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

const extractCoordinates = (locationString: string): { lat: number; lng: number } => {
  const cleanString = locationString.replace(/[^\w\s()\-,.]/g, '').trim();

  const matchedStreet = [...mistissiniStreets, ...mistissiniHighways].find(street => 
    cleanString.toLowerCase().includes(street.name.toLowerCase())
  );
  if (matchedStreet) {
    const midIndex = Math.floor(matchedStreet.path.length / 2);
    return {
      lat: matchedStreet.path[midIndex][0],
      lng: matchedStreet.path[midIndex][1]
    };
  }

  const matchedDestination = evacuationDestinations.find(dest => 
    cleanString.toLowerCase().includes(dest.name.toLowerCase())
  );
  if (matchedDestination) {
    return {
      lat: matchedDestination.lat,
      lng: matchedDestination.lng
    };
  }

  const coordMatch = cleanString.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
  if (coordMatch) {
    return {
      lat: parseFloat(coordMatch[1]),
      lng: parseFloat(coordMatch[2])
    };
  }

  console.warn(`Could not determine coordinates for location: ${locationString}`);
  return { lat: 50.4221, lng: -73.8683 };
};

const routeCache: Record<string, Coordinate[]> = {};

const getCacheKey = (start: { lat: number; lng: number }, end: { lat: number; lng: number }): string => {
  return `${start.lat.toFixed(6)},${start.lng.toFixed(6)}_${end.lat.toFixed(6)},${end.lng.toFixed(6)}`;
};

const findClosestStreetPoint = (point: Coordinate, thresholdKm = 0.2): Coordinate | null => {
  let closestPoint: Coordinate | null = null;
  let minDistance = Infinity;

  const checkPoints = (points: number[][]) => {
    points.forEach(streetPoint => {
      if (streetPoint.length < 2) return;
      
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
        closestPoint = [streetPoint[0], streetPoint[1]];
      }
    });
  };

  [...mistissiniStreets, ...mistissiniHighways].forEach(street => {
    checkPoints(street.path);
  });

  return closestPoint;
};

const findStreetRoute = (start: Coordinate, end: Coordinate): Coordinate[] => {
  const nearStartStreet = [...mistissiniStreets, ...mistissiniHighways].find(street => {
    return street.path.some(point => {
      if (point.length < 2) return false;
      const distance = Math.sqrt(
        Math.pow(point[0] - start[0], 2) + 
        Math.pow(point[1] - start[1], 2)
      );
      return distance < 0.005;
    });
  });
  
  const nearEndStreet = [...mistissiniStreets, ...mistissiniHighways].find(street => {
    return street.path.some(point => {
      if (point.length < 2) return false;
      const distance = Math.sqrt(
        Math.pow(point[0] - end[0], 2) + 
        Math.pow(point[1] - end[1], 2)
      );
      return distance < 0.005;
    });
  });
  
  if (nearStartStreet && nearEndStreet && nearStartStreet.name === nearEndStreet.name) {
    return nearStartStreet.path.map(p => [p[0], p[1]] as Coordinate);
  }
  
  const route: Coordinate[] = [start];
  
  if (nearStartStreet) {
    const startPathIndex = nearStartStreet.path.findIndex(point => {
      if (point.length < 2) return false;
      const distance = Math.sqrt(
        Math.pow(point[0] - start[0], 2) + 
        Math.pow(point[1] - start[1], 2)
      );
      return distance < 0.005;
    });
    
    if (startPathIndex !== -1) {
      route.push(...nearStartStreet.path.slice(startPathIndex).map(p => [p[0], p[1]] as Coordinate));
    }
  }
  
  if (nearStartStreet && nearEndStreet && nearStartStreet.name !== nearEndStreet.name) {
    const connectingStreets = [...mistissiniStreets, ...mistissiniHighways].filter(street => {
      return street.name !== nearStartStreet.name && 
             street.name !== nearEndStreet.name &&
             street.path.some(point => {
               if (point.length < 2) return false;
               return nearStartStreet.path.some(startPoint => {
                 if (startPoint.length < 2) return false;
                 const distance = Math.sqrt(
                   Math.pow(point[0] - startPoint[0], 2) + 
                   Math.pow(point[1] - startPoint[1], 2)
                 );
                 return distance < 0.005;
               });
             }) &&
             street.path.some(point => {
               if (point.length < 2) return false;
               return nearEndStreet.path.some(endPoint => {
                 if (endPoint.length < 2) return false;
                 const distance = Math.sqrt(
                   Math.pow(point[0] - endPoint[0], 2) + 
                   Math.pow(point[1] - endPoint[1], 2)
                 );
                 return distance < 0.005;
               });
             });
    });
    
    if (connectingStreets.length > 0) {
      route.push(...connectingStreets[0].path.map(p => [p[0], p[1]] as Coordinate));
    }
  }
  
  if (nearEndStreet) {
    const endPathIndex = nearEndStreet.path.findIndex(point => {
      if (point.length < 2) return false;
      const distance = Math.sqrt(
        Math.pow(point[0] - end[0], 2) + 
        Math.pow(point[1] - end[1], 2)
      );
      return distance < 0.005;
    });
    
    if (endPathIndex !== -1) {
      route.push(...nearEndStreet.path.slice(0, endPathIndex + 1).map(p => [p[0], p[1]] as Coordinate));
    }
  }
  
  route.push(end);
  
  const uniqueRoute: Coordinate[] = [];
  route.forEach(point => {
    if (!uniqueRoute.some(p => p[0] === point[0] && p[1] === point[1])) {
      uniqueRoute.push(point);
    }
  });
  
  return uniqueRoute;
};

const distancePointToLine = (
  point: Coordinate, 
  lineStart: Coordinate, 
  lineEnd: Coordinate
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

const fetchRoute = async (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<Coordinate[]> => {
  const startPoint: Coordinate = [start.lat, start.lng];
  const endPoint: Coordinate = [end.lat, end.lng];
  
  const snappedStart = findClosestStreetPoint(startPoint);
  const snappedEnd = findClosestStreetPoint(endPoint);

  const effectiveStart = snappedStart || startPoint;
  const effectiveEnd = snappedEnd || endPoint;

  const cacheKey = getCacheKey(
    { lat: effectiveStart[0], lng: effectiveStart[1] },
    { lat: effectiveEnd[0], lng: effectiveEnd[1] }
  );

  if (routeCache[cacheKey]) {
    return routeCache[cacheKey];
  }

  const streetRoute = findStreetRoute(effectiveStart, effectiveEnd);
  if (streetRoute.length > 2) {
    routeCache[cacheKey] = streetRoute;
    return streetRoute;
  }

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
        ([lng, lat]: [number, number]) => [lat, lng] as Coordinate
      );
      
      routeCache[cacheKey] = apiRoute;
      return apiRoute;
    }
    
    const directRoute: Coordinate[] = [startPoint];
    
    const midPoints = [...mistissiniStreets, ...mistissiniHighways].reduce((points, street) => {
      const isRelevant = street.path.some(p => {
        if (p.length < 2) return false;
        const pointCoord: Coordinate = [p[0], p[1]];
        const distanceToLine = distancePointToLine(pointCoord, startPoint, endPoint);
        return distanceToLine < 0.003;
      });
      
      if (isRelevant) {
        const validPoints = street.path
          .filter(p => {
            if (p.length < 2) return false;
            const pointCoord: Coordinate = [p[0], p[1]];
            return distancePointToLine(pointCoord, startPoint, endPoint) < 0.003;
          })
          .map(p => [p[0], p[1]] as Coordinate);
          
        points.push(...validPoints);
      }
      
      return points;
    }, [] as Coordinate[]);
    
    midPoints.sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a[0] - startPoint[0], 2) + Math.pow(a[1] - startPoint[1], 2));
      const distB = Math.sqrt(Math.pow(b[0] - startPoint[0], 2) + Math.pow(b[1] - startPoint[1], 2));
      return distA - distB;
    });
    
    directRoute.push(...midPoints);
    directRoute.push(endPoint);
    
    routeCache[cacheKey] = directRoute;
    return directRoute;
  } catch (error) {
    console.error("Error fetching route:", error);
    
    const fallbackRoute: Coordinate[] = [startPoint, endPoint];
    routeCache[cacheKey] = fallbackRoute;
    return fallbackRoute;
  }
};

const EvacuationRoutes = ({ routes, standalone = false }: EvacuationRoutesProps) => {
  const [computedRoutes, setComputedRoutes] = useState<RouteCoordinates[]>([]);
  const isProcessingRef = useRef(false);
  
  useEffect(() => {
    if (!standalone && routes.length > 0 && !isProcessingRef.current) {
      isProcessingRef.current = true;
      
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
                path: path,
                status: route.status,
                routeName: route.routeName || `Route ${route.id}`,
                startPoint: route.startPoint,
                endPoint: route.endPoint,
                estimatedTime: route.estimatedTime,
                transportMethods: route.transportMethods
              });
              
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (err) {
              console.error(`Error enhancing route ${route.id}:`, err);
              const baseRoute = baseRoutes.find(r => r.id === route.id);
              if (baseRoute) {
                enhancedRoutes.push(baseRoute);
              }
            }
          }
          
          setComputedRoutes(enhancedRoutes);
        } finally {
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
