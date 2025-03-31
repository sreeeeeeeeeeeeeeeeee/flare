/**
 * Utilities for route calculations and transformations
 */
import { WATER_BOUNDARIES, LOCATION_ALIASES, LOCATIONS, GRAPHHOPPER_API_KEY } from './routeConstants';

// Haversine distance calculation
export const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// Check if point is near water
export const isNearWater = (point: [number, number]) => {
  return WATER_BOUNDARIES.some(waterPoint => {
    const dx = waterPoint[0] - point[0];
    const dy = waterPoint[1] - point[1];
    return Math.sqrt(dx * dx + dy * dy) < 0.0015; // ~150m threshold
  });
};

// Calculate route distance in km
export const calculateDistance = (path: [number, number][]) => {
  if (path.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += haversineDistance(path[i-1][0], path[i-1][1], path[i][0], path[i][1]);
  }
  return total;
};

// Global route cache to avoid redundant API calls
export const globalRouteCache: Record<string, [number, number][]> = {};

// Fetch a road-following route using GraphHopper API
export const fetchRoadRoute = async (
  start: [number, number], 
  end: [number, number]
): Promise<[number, number][]> => {
  // Create cache key
  const cacheKey = `${start[0]},${start[1]}_${end[0]},${end[1]}`;
  
  // Return cached route if available
  if (globalRouteCache[cacheKey]) {
    return globalRouteCache[cacheKey];
  }
  
  try {
    console.log(`Fetching road route from ${start} to ${end}`);
    const response = await fetch(
      `https://graphhopper.com/api/1/route?` +
      `point=${start[0]},${start[1]}&` +
      `point=${end[0]},${end[1]}&` +
      `vehicle=car&key=${GRAPHHOPPER_API_KEY}&` +
      `points_encoded=false&` +
      `locale=en`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // GraphHopper returns coordinates as [lng, lat], we need to convert to [lat, lng]
    const path = data.paths?.[0]?.points?.coordinates?.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    );
    
    if (path && path.length > 0) {
      // Save to cache
      globalRouteCache[cacheKey] = path;
      return path;
    } else {
      throw new Error("No path found in API response");
    }
  } catch (error) {
    console.error('GraphHopper API error:', error);
    
    // Return direct line route as fallback
    console.log('Using fallback straight line route');
    return [start, end] as [number, number][];
  }
};

// Basic route fetching - keeping for compatibility
export const fetchRoute = async (start: [number, number], end: [number, number]) => {
  // Now just calls the new fetchRoadRoute function
  return fetchRoadRoute(start, end);
};

// Fetch route that avoids water
export const fetchSafeRoute = async (start: [number, number], end: [number, number]) => {
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
};

// Get location coordinates from name
export const getLocationCoordinates = (locationName: string): [number, number] => {
  // Try to get coordinates from known locations (case insensitive)
  const locationKey = LOCATION_ALIASES[locationName.toLowerCase()] || locationName.toLowerCase();
  
  if (LOCATIONS[locationKey]) {
    return LOCATIONS[locationKey];
  }
  
  // Default to Mistissini center if not found
  return LOCATIONS.mistissini;
};
