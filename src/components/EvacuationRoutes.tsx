
import { useEffect, useState } from "react";
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

// Lake Mistassini boundary - simplified polygon to define water area
const lakeMistassiniCoordinates = [
  [50.4107, -73.8462], // Main reference point
  [50.4080, -73.8500],
  [50.4060, -73.8600],
  [50.4050, -73.8700],
  [50.4055, -73.8800],
  [50.4070, -73.8900],
  [50.4090, -73.9000],
  [50.4120, -73.9050],
  [50.4150, -73.9000],
  [50.4180, -73.8950],
  [50.4200, -73.8850],
  [50.4180, -73.8750],
  [50.4160, -73.8650],
  [50.4140, -73.8550],
  [50.4120, -73.8500],
  [50.4107, -73.8462]
];

// Check if a point is inside the lake polygon - using ray casting algorithm
const isPointInWater = (point: [number, number]): boolean => {
  const [lat, lng] = point;
  let inside = false;
  
  for (let i = 0, j = lakeMistassiniCoordinates.length - 1; i < lakeMistassiniCoordinates.length; j = i++) {
    const [xi, yi] = [lakeMistassiniCoordinates[i][0], lakeMistassiniCoordinates[i][1]];
    const [xj, yj] = [lakeMistassiniCoordinates[j][0], lakeMistassiniCoordinates[j][1]];
    
    // Check if point crosses polygon edge
    const intersect = ((yi > lat) !== (yj > lat)) && 
                      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
};

// Filter water points from route
const filterWaterPoints = (route: [number, number][]): [number, number][] => {
  if (route.length <= 2) return route; // Don't filter if it's just start and end
  
  // Check if any points are in water
  const hasWaterPoints = route.some(point => isPointInWater(point));
  if (!hasWaterPoints) return route;
  
  const filteredRoute: [number, number][] = [];
  let inWaterSegment = false;
  let lastLandPoint: [number, number] | null = null;
  
  // Process each point in the route
  for (let i = 0; i < route.length; i++) {
    const point = route[i];
    const isWater = isPointInWater(point);
    
    if (!isWater) {
      // If coming out of water segment, connect to last known land point
      if (inWaterSegment && lastLandPoint) {
        // Create straight route from last land point to current land point
        const segments = 5; // Number of points to create for crossing
        for (let j = 1; j <= segments; j++) {
          const ratio = j / (segments + 1);
          const interpolatedPoint: [number, number] = [
            lastLandPoint[0] + (point[0] - lastLandPoint[0]) * ratio,
            lastLandPoint[1] + (point[1] - lastLandPoint[1]) * ratio
          ];
          filteredRoute.push(interpolatedPoint);
        }
        inWaterSegment = false;
      }
      
      filteredRoute.push(point);
      lastLandPoint = point;
    } else {
      // Mark that we're in water segment
      inWaterSegment = true;
      
      // If this is the first point and it's in water, use nearest land point
      if (i === 0) {
        const nearestLand: [number, number] = [50.4221, -73.8683]; // Mistissini center as fallback
        filteredRoute.push(nearestLand);
        lastLandPoint = nearestLand;
      }
    }
  }
  
  // If the route ends in water, add the end point on land
  if (inWaterSegment && filteredRoute.length > 0) {
    const nearestLand: [number, number] = [50.4221, -73.8683]; // Mistissini center as fallback
    filteredRoute.push(nearestLand);
  }
  
  return filteredRoute;
};

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

  // Check against street names and highways
  const matchedStreet = [...mistissiniStreets, ...mistissiniHighways].find(street => 
    locationString.toLowerCase().includes(street.name.toLowerCase())
  );
  if (matchedStreet) {
    // Return the midpoint of the street for better accuracy
    const midIndex = Math.floor(matchedStreet.path.length / 2);
    return {
      lat: matchedStreet.path[midIndex][0],
      lng: matchedStreet.path[midIndex][1]
    };
  }

  // Check against evacuation destinations
  const matchedDestination = evacuationDestinations.find(dest => 
    locationString.toLowerCase().includes(dest.name.toLowerCase())
  );
  if (matchedDestination) {
    return {
      lat: matchedDestination.lat,
      lng: matchedDestination.lng
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
    'Eastern Mistissini': { lat: 50.4240, lng: -73.8610 },
    'Western Mistissini': { lat: 50.4215, lng: -73.8760 },
    'Northern Mistissini': { lat: 50.4260, lng: -73.8685 },
    'Southern Mistissini': { lat: 50.4185, lng: -73.8685 },
    'Central Mistissini': { lat: 50.4225, lng: -73.8685 },
    'Northern Forest Area': { lat: 50.4300, lng: -73.8720 },
    'Southern Residential Area': { lat: 50.4165, lng: -73.8730 },
    'Western Exit': { lat: 50.4190, lng: -73.8815 },
    'Cultural Center': { lat: 50.4190, lng: -73.8650 },
    'Western Area': { lat: 50.4140, lng: -73.9350 },
    'Eastern Shore': { lat: 50.4200, lng: -73.8505 },
    'Euelsti Street': { lat: 50.4180, lng: -73.8650 },
    'Amisk Street': { lat: 50.4165, lng: -73.8670 },
    'Spruce Street': { lat: 50.4200, lng: -73.8570 },
    'Main Street': { lat: 50.4225, lng: -73.8700 }
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

// Improved route fetching with better error handling, retry logic, and land constraint
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
      const point: [number, number] = [
        start.lat + (end.lat - start.lat) * ratio,
        start.lng + (end.lng - start.lng) * ratio
      ];
      // Only add if not in water
      if (!isPointInWater(point)) {
        directRoute.push(point);
      }
    }
    
    // Ensure we have at least the start and end points
    if (directRoute.length < 2) {
      directRoute.push([start.lat, start.lng]);
      directRoute.push([end.lat, end.lng]);
    }
    
    routeCache[cacheKey] = { path: directRoute, timestamp: Date.now() };
    return directRoute;
  }

  try {
    // Use "hike" as vehicle type to prefer land routes
    const url = `https://graphhopper.com/api/1/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&vehicle=car&locale=en&key=${API_KEY}&points_encoded=false&ch.disable=true&alternative_route.max_paths=3`;
    
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
      // Convert and filter water points
      let route = data.paths[0].points.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
      
      // Apply water filtering
      route = filterWaterPoints(route);
      
      routeCache[cacheKey] = { path: route, timestamp: Date.now() };
      return route;
    }
    
    // Fallback: create a direct land route if API fails
    const directLandRoute: [number, number][] = [];
    const steps = Math.max(10, Math.ceil(distance * 15));
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const point: [number, number] = [
        start.lat + (end.lat - start.lat) * ratio,
        start.lng + (end.lng - start.lng) * ratio
      ];
      if (!isPointInWater(point)) {
        directLandRoute.push(point);
      }
    }
    
    // Ensure we have at least start and end points
    if (directLandRoute.length < 2) {
      directLandRoute.push([start.lat, start.lng]);
      directLandRoute.push([end.lat, end.lng]);
    }
    
    routeCache[cacheKey] = { path: directLandRoute, timestamp: Date.now() };
    return directLandRoute;
  } catch (error) {
    console.error("Error fetching route:", error);
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchRoute(start, end, retries - 1);
    }
    
    // Final fallback: create a straight line that avoids water
    const landRoute: [number, number][] = [];
    landRoute.push([start.lat, start.lng]);
    
    // Add some intermediate waypoints to route around the lake
    if (isPointInWater([start.lat, start.lng]) || isPointInWater([end.lat, end.lng])) {
      // Add Mistissini center as a safe waypoint
      landRoute.push([50.4221, -73.8683]);
    }
    
    landRoute.push([end.lat, end.lng]);
    return landRoute;
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
            
            // Get land-constrained route
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
