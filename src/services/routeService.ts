
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
 * Initializes routes with road-following paths that go in different directions
 */
export const initializeRoutes = async (
  routeDefinitions: Array<{ id: string; start: string; end: string, status: 'open' | 'congested' | 'closed' }>,
  locationMap: Record<string, [number, number]>
): Promise<Route[]> => {
  console.log("Initializing routes with separate paths in different directions");
  
  const calculatedRoutes: Route[] = [];
  
  // Use predefined routes in different directions to ensure they don't overlap
  const eastRoute = mistissiniStreets.find(street => street.name === "Main Street");
  const northSouthRoute = mistissiniStreets.find(street => street.name === "Saint John Street");
  const westernRoute = mistissiniStreets.find(street => street.name === "Western Route");
  const northernRoute = mistissiniStreets.find(street => street.name === "Northern Boulevard");
  const highwayRoute = mistissiniHighways.find(highway => highway.name === "Route 167 to Chibougamau");
  
  // Create the three different routes going in different directions
  if (eastRoute) {
    // East route (open) - using Main Street
    calculatedRoutes.push({
      id: 'route-1',
      path: eastRoute.path as [number, number][],
      status: 'open',
      start: 'Lake Shore',
      end: 'Eastern Mistissini',
      updatedAt: new Date()
    });
  }
  
  if (northSouthRoute) {
    // North-South route (congested) - using Saint John Street
    calculatedRoutes.push({
      id: 'route-2',
      path: northSouthRoute.path as [number, number][],
      status: 'congested',
      start: 'Northern Mistissini',
      end: 'Southern Mistissini',
      updatedAt: new Date()
    });
  }
  
  if (highwayRoute) {
    // Highway route to Chibougamau (closed)
    calculatedRoutes.push({
      id: 'route-3',
      path: highwayRoute.path.slice(0, 15) as [number, number][],
      status: 'closed',
      start: 'Mistissini',
      end: 'Chibougamau',
      updatedAt: new Date()
    });
  } else if (westernRoute) {
    // Western route (closed) as fallback if highway not found
    calculatedRoutes.push({
      id: 'route-3',
      path: westernRoute.path as [number, number][],
      status: 'closed',
      start: 'Mistissini',
      end: 'Western Shore',
      updatedAt: new Date()
    });
  }
  
  // If routes are missing, add fallbacks
  if (!calculatedRoutes.some(route => route.id === 'route-1')) {
    console.log("Adding fallback east route");
    calculatedRoutes.push({
      id: 'route-1',
      path: [
        [50.4215, -73.8760],
        [50.4220, -73.8730],
        [50.4225, -73.8700],
        [50.4230, -73.8670],
        [50.4235, -73.8640],
        [50.4240, -73.8610]
      ],
      status: 'open',
      start: 'Lake Shore',
      end: 'Eastern Mistissini',
      updatedAt: new Date()
    });
  }
  
  if (!calculatedRoutes.some(route => route.id === 'route-2')) {
    console.log("Adding fallback north-south route");
    calculatedRoutes.push({
      id: 'route-2',
      path: [
        [50.4260, -73.8685],
        [50.4245, -73.8685],
        [50.4230, -73.8685],
        [50.4215, -73.8685],
        [50.4200, -73.8685],
        [50.4185, -73.8685]
      ],
      status: 'congested',
      start: 'Northern Mistissini',
      end: 'Southern Mistissini',
      updatedAt: new Date()
    });
  }
  
  if (!calculatedRoutes.some(route => route.id === 'route-3')) {
    console.log("Adding fallback highway route");
    calculatedRoutes.push({
      id: 'route-3',
      path: [
        [50.4230, -73.8640],
        [50.4300, -73.8620],
        [50.4380, -73.8560],
        [50.4470, -73.8510],
        [50.4560, -73.8460],
        [50.4650, -73.8410],
        [50.4740, -73.8360],
        [50.4830, -73.8310],
        [50.4920, -73.8260],
        [50.5010, -73.8210]
      ],
      status: 'closed',
      start: 'Mistissini',
      end: 'Chibougamau',
      updatedAt: new Date()
    });
  }

  console.log("Generated routes:", calculatedRoutes);
  return calculatedRoutes;
};
