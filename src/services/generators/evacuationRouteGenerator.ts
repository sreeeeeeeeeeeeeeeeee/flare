
import { EvacuationRouteType } from '@/types/emergency';
import { mistissiniStreets, mistissiniHighways } from '../mistissini';

// Generate exactly three evacuation routes with fixed statuses
export const generateStreetEvacuationRoutes = (): EvacuationRouteType[] => {
  const routes: EvacuationRouteType[] = [];
  
  // Get some streets to use for our routes
  const availableStreets = mistissiniStreets.slice(0, 2);
  
  if (availableStreets.length > 0) {
    // First route - OPEN status (Lake Shore to Eastern Mistissini)
    const openStreet = availableStreets[0];
    const openCoordinates = openStreet.path.map(point => [point[1], point[0]]);
    
    routes.push({
      id: 'route-street-1',
      startPoint: 'Lake Shore',
      endPoint: 'Eastern Mistissini',
      status: 'open',
      estimatedTime: 8,
      transportMethods: ['car', 'emergency', 'foot'],
      routeName: openStreet.name,
      geometry: {
        type: 'LineString',
        coordinates: openCoordinates
      }
    });
    
    // Second route - CONGESTED status (Danger Zone 1 to Community Center)
    const congestedStreet = availableStreets[1] || availableStreets[0];
    const congestedCoordinates = congestedStreet.path.map(point => [point[1], point[0]]);
    
    routes.push({
      id: 'route-congested-1',
      startPoint: 'Danger Zone 1',
      endPoint: 'Community Center',
      status: 'congested',
      estimatedTime: 15,
      transportMethods: ['car', 'emergency', 'foot'],
      routeName: `${congestedStreet.name} Evacuation Route`,
      geometry: {
        type: 'LineString',
        coordinates: congestedCoordinates
      }
    });
  }
  
  return routes;
};

// Generate a single highway evacuation route that's CLOSED
export const generateHighwayEvacuationRoutes = (): EvacuationRouteType[] => {
  const routes: EvacuationRouteType[] = [];
  
  // Use the main highway to Chibougamau
  const mainHighway = mistissiniHighways.find(hw => hw.name.includes("Chibougamau"));
  
  if (mainHighway) {
    // Convert path coordinates to GeoJSON format (lng, lat)
    const coordinates = mainHighway.path.map(point => [point[1], point[0]]);
    
    routes.push({
      id: 'route-highway-closed',
      startPoint: 'Mistissini',
      endPoint: 'Chibougamau',
      status: 'closed',
      estimatedTime: 35,
      transportMethods: ['car', 'emergency'],
      routeName: mainHighway.name,
      geometry: {
        type: 'LineString',
        coordinates
      }
    });
  }
  
  return routes;
};

// Not used since we don't update the routes anymore
export const updateEvacuationRouteStatus = (routes: EvacuationRouteType[]): EvacuationRouteType[] => {
  // Simply return the routes as-is without modifications
  return routes;
};
