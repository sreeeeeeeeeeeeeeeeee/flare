/**
 * Route calculation service
 */

import { Route } from '@/types/mapTypes';
import { mistissiniStreets } from './mistissini/streets';
import { mistissiniHighways } from './mistissini/highways';
import { GRAPHHOPPER_API_KEY } from './config/apiConfig';

// Global route cache to avoid redundant API calls
const routeCache: Record<string, [number, number][]> = {};

// Get a road-following route using GraphHopper API
const fetchRoadRoute = async (
  start: [number, number], 
  end: [number, number]
): Promise<[number, number][]> => {
  // Create cache key
  const cacheKey = `${start[0]},${start[1]}_${end[0]},${end[1]}`;
  
  // Return cached route if available
  if (routeCache[cacheKey]) {
    return routeCache[cacheKey];
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
      routeCache[cacheKey] = path;
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

/**
 * Initializes routes with road-following paths
 */
export const initializeRoutes = async (
  routeDefinitions: Array<{ id: string; start: string; end: string, status: 'open' | 'congested' | 'closed' }>,
  locationMap: Record<string, [number, number]>
): Promise<Route[]> => {
  console.log("Initializing routes with API route calculation");
  
  const calculatedRoutes: Route[] = [];
  
  for (const routeDef of routeDefinitions) {
    try {
      // Get start and end coordinates
      const startCoords = locationMap[routeDef.start.toLowerCase()] || [50.4221, -73.8683] as [number, number];
      const endCoords = locationMap[routeDef.end.toLowerCase()] || [50.4250, -73.8600] as [number, number];
      
      // Fetch road-following route
      const roadPath = await fetchRoadRoute(startCoords, endCoords);
      
      calculatedRoutes.push({
        id: routeDef.id,
        path: roadPath,
        status: routeDef.status,
        start: routeDef.start,
        end: routeDef.end,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error calculating route ${routeDef.id}:`, error);
      
      // Fallback to predefined routes if API fails - each with a unique path
      if (routeDef.id === 'route-1') {
        // Use Lakeshore Drive for the eastern route (open)
        const lakeshore = mistissiniStreets.find(street => street.name === "Lakeshore Drive");
        if (lakeshore) {
          console.log("Using Lakeshore Drive for open route");
          const typedPath = lakeshore.path as [number, number][];
          calculatedRoutes.push({
            id: routeDef.id,
            path: typedPath,
            status: 'open', // Always ensure this route is open
            start: routeDef.start,
            end: routeDef.end,
            updatedAt: new Date()
          });
        }
      } else if (routeDef.id === 'route-2') {
        // Use Saint John Street for the north-south route (congested)
        const saintJohnPath = mistissiniStreets.find(street => street.name === "Saint John Street")?.path;
        if (saintJohnPath) {
          calculatedRoutes.push({
            id: routeDef.id,
            path: saintJohnPath as [number, number][],
            status: routeDef.status,
            start: routeDef.start,
            end: routeDef.end,
            updatedAt: new Date()
          });
        }
      } else if (routeDef.id === 'route-3') {
        // Use Western Access Road for the northwestern route (closed)
        const westernRoad = mistissiniStreets.find(street => street.name === "Western Route")?.path;
        if (westernRoad) {
          calculatedRoutes.push({
            id: routeDef.id,
            path: westernRoad as [number, number][],
            status: routeDef.status,
            start: routeDef.start,
            end: routeDef.end,
            updatedAt: new Date()
          });
        } else {
          // Fallback to part of the highway if Western Route isn't found
          const highwayPath = mistissiniHighways.find(highway => 
            highway.name === "Route 167 to Chibougamau")?.path.slice(0, 10);
          if (highwayPath) {
            calculatedRoutes.push({
              id: routeDef.id,
              path: highwayPath as [number, number][],
              status: routeDef.status,
              start: routeDef.start,
              end: routeDef.end,
              updatedAt: new Date()
            });
          }
        }
      }
    }
  }

  // Ensure we have all three routes, each with a different direction
  const routeIds = calculatedRoutes.map(r => r.id);
  
  if (!routeIds.includes('route-1')) {
    // If open route is missing, add fallback eastern route using Lakeshore Drive
    const lakeshore = mistissiniStreets.find(street => street.name === "Lakeshore Drive");
    if (lakeshore) {
      const typedPath = lakeshore.path as [number, number][];
      calculatedRoutes.push({
        id: 'route-1',
        path: typedPath,
        status: 'open',
        start: 'Lake Shore',
        end: 'Eastern Mistissini',
        updatedAt: new Date()
      });
    }
  }
  
  if (!routeIds.includes('route-2')) {
    // If congested route is missing, add fallback north-south route
    const saintJohn = mistissiniStreets.find(street => street.name === "Saint John Street");
    if (saintJohn) {
      const typedPath = saintJohn.path as [number, number][];
      calculatedRoutes.push({
        id: 'route-2',
        path: typedPath,
        status: 'congested',
        start: 'Northern Mistissini',
        end: 'Southern Mistissini',
        updatedAt: new Date()
      });
    }
  }
  
  if (!routeIds.includes('route-3')) {
    // If closed route is missing, add fallback western route
    const western = mistissiniStreets.find(street => street.name === "Western Route");
    if (western) {
      const typedPath = western.path as [number, number][];
      calculatedRoutes.push({
        id: 'route-3',
        path: typedPath,
        status: 'closed',
        start: 'Mistissini',
        end: 'Chibougamau Highway',
        updatedAt: new Date()
      });
    }
  }

  console.log("Generated routes:", calculatedRoutes);
  return calculatedRoutes;
};
