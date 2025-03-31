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

const ensureCoordinate = (point: number[]): Coordinate => {
  if (Array.isArray(point) && point.length >= 2) {
    return [point[0], point[1]];
  }
  console.warn(`Invalid coordinate format: ${JSON.stringify(point)}`);
  return [50.4221, -73.8683];
};

const extractCoordinates = (locationString: string): { lat: number; lng: number } => {
  const cleanString = locationString.replace(/[^\w\s()\-,.]/g, '').trim();

  const matchedStreet = [...mistissiniStreets, ...mistissiniHighways].find(street => 
    cleanString.toLowerCase().includes(street.name.toLowerCase())
  );
  if (matchedStreet) {
    const midIndex = Math.floor(matchedStreet.path.length / 2);
    const point = ensureCoordinate(matchedStreet.path[midIndex]);
    return { lat: point[0], lng: point[1] };
  }

  const matchedDestination = evacuationDestinations.find(dest => 
    cleanString.toLowerCase().includes(dest.name.toLowerCase())
  );
  if (matchedDestination) {
    return { lat: matchedDestination.lat, lng: matchedDestination.lng };
  }

  const coordMatch = cleanString.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
  if (coordMatch) {
    return { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
  }

  console.warn(`Could not determine coordinates for location: ${locationString}`);
  return { lat: 50.4221, lng: -73.8683 };
};

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
    return nearStartStreet.path.map(p => ensureCoordinate(p));
  }
  
  const route: Coordinate[] = [start];
  
  if (nearStartStreet) {
    let startPathIndex = -1;
    let minStartDistance = Infinity;
    
    nearStartStreet.path.forEach((point, idx) => {
      if (point.length < 2) return;
      const distance = Math.sqrt(
        Math.pow(point[0] - start[0], 2) + 
        Math.pow(point[1] - start[1], 2)
      );
      if (distance < minStartDistance) {
        minStartDistance = distance;
        startPathIndex = idx;
      }
    });
    
    if (startPathIndex !== -1) {
      route.push(...nearStartStreet.path.slice(startPathIndex).map(p => ensureCoordinate(p)));
    }
  }
  
  if (nearStartStreet && nearEndStreet && nearStartStreet.name !== nearEndStreet.name) {
    const connectingStreets = [...mistissiniStreets, ...mistissiniHighways].filter(street => {
      if (street.name === nearStartStreet.name || street.name === nearEndStreet.name) {
        return false;
      }
      
      const connectsToStart = street.path.some(point => {
        if (point.length < 2) return false;
        return nearStartStreet.path.some(startPoint => {
          if (startPoint.length < 2) return false;
          const distance = Math.sqrt(
            Math.pow(point[0] - startPoint[0], 2) + 
            Math.pow(point[1] - startPoint[1], 2)
          );
          return distance < 0.005;
        });
      });
      
      const connectsToEnd = street.path.some(point => {
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
      
      return connectsToStart && connectsToEnd;
    });
    
    if (connectingStreets.length > 0) {
      route.push(...connectingStreets[0].path.map(p => ensureCoordinate(p)));
    }
  }
  
  if (nearEndStreet) {
    let endPathIndex = -1;
    let minEndDistance = Infinity;
    
    nearEndStreet.path.forEach((point, idx) => {
      if (point.length < 2) return;
      const distance = Math.sqrt(
        Math.pow(point[0] - end[0], 2) + 
        Math.pow(point[1] - end[1], 2)
      );
      if (distance < minEndDistance) {
        minEndDistance = distance;
        endPathIndex = idx;
      }
    });
    
    if (endPathIndex !== -1) {
      route.push(...nearEndStreet.path.slice(0, endPathIndex + 1).map(p => ensureCoordinate(p)));
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

const fetchRoute = async (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<Coordinate[]> => {
  const startPoint: Coordinate = [start.lat, start.lng];
  const endPoint: Coordinate = [end.lat, end.lng];
  
  const snappedStart = findClosestStreetPoint(startPoint) || startPoint;
  const snappedEnd = findClosestStreetPoint(endPoint) || endPoint;
  
  const cacheKey = getCacheKey(
    { lat: snappedStart[0], lng: snappedStart[1] },
    { lat: snappedEnd[0], lng: snappedEnd[1] }
  );

  if (routeCache[cacheKey]) {
    return routeCache[cacheKey].path;
  }

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
    
    const directRoute: Coordinate[] = [startPoint];
    
    const relevantStreets = [...mistissiniStreets, ...mistissiniHighways].filter(street => {
      return street.path.some(p => {
        if (p.length < 2) return false;
        
        const x = p[0];
        const y = p[1];
        const x1 = startPoint[0];
        const y1 = startPoint[1];
        const x2 = endPoint[0];
        const y2 = endPoint[1];
        
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq != 0) param = dot / len_sq;
        
        let xx, yy;
        if (param < 0) {
          xx = x1;
          yy = y1;
        } else if (param > 1) {
          xx = x2;
          yy = y2;
        } else {
          xx = x1 + param * C;
          yy = y1 + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < 0.003;
      });
    });
    
    relevantStreets.forEach(street => {
      const relevantPoints = street.path
        .filter(p => p.length >= 2)
        .map(p => ensureCoordinate(p))
        .filter(point => {
          const x = point[0];
          const y = point[1];
          const x1 = startPoint[0];
          const y1 = startPoint[1];
          const x2 = endPoint[0];
          const y2 = endPoint[1];
          
          const A = x - x1;
          const B = y - y1;
          const C = x2 - x1;
          const D = y2 - y1;
          
          const dot = A * C + B * D;
          const len_sq = C * C + D * D;
          let param = -1;
          if (len_sq != 0) param = dot / len_sq;
          
          let xx, yy;
          if (param < 0) {
            xx = x1;
            yy = y1;
          } else if (param > 1) {
            xx = x2;
            yy = y2;
          } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
          }
          
          const dx = x - xx;
          const dy = y - yy;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          return distance < 0.003;
        });
      
      if (relevantPoints.length > 0) {
        relevantPoints.sort((a, b) => {
          const distA = Math.sqrt(Math.pow(a[0] - startPoint[0], 2) + Math.pow(a[1] - startPoint[1], 2));
          const distB = Math.sqrt(Math.pow(b[0] - startPoint[0], 2) + Math.pow(b[1] - startPoint[1], 2));
          return distA - distB;
        });
        
        directRoute.push(...relevantPoints);
      }
    });
    
    directRoute.push(endPoint);
    
    const uniqueRoute: Coordinate[] = [];
    directRoute.forEach(point => {
      if (!uniqueRoute.some(p => p[0] === point[0] && p[1] === point[1])) {
        uniqueRoute.push(point);
      }
    });
    
    routeCache[cacheKey] = { 
      path: uniqueRoute,
      timestamp: Date.now()
    };
    cleanCache();
    return uniqueRoute;
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
          
          for (const route of routesRef.current) {
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
          processingRef.current = false;
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
