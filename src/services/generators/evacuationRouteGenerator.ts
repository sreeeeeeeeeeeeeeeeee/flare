
import { EvacuationRouteType } from '@/types/emergency';
import { mistissiniStreets, mistissiniHighways } from '../mistissini';

// IMPROVED: Generate evacuation routes that follow actual Mistissini streets
export const generateStreetEvacuationRoutes = (): EvacuationRouteType[] => {
  const routes: EvacuationRouteType[] = [];
  
  // Use specific streets for evacuation
  const streetsToUse = [
    "Main Street",
    "Lakeshore Drive"
  ];
  
  // Create evacuation routes for each selected street with precise start/end points
  streetsToUse.forEach((streetName, index) => {
    const street = mistissiniStreets.find(s => s.name === streetName);
    
    if (street) {
      // Use named locations for start/end points
      let startPoint, endPoint;
      
      if (street.name === "Main Street") {
        startPoint = "Eastern Mistissini";
        endPoint = "Western Mistissini";
      } else if (street.name === "Lakeshore Drive") {
        startPoint = "Lake Shore";
        endPoint = "Eastern Mistissini";
      } else {
        startPoint = `${street.name} Start`;
        endPoint = `${street.name} End`;
      }
      
      // Use the street's path with proper GeoJSON formatting
      // Convert path coordinates to the format expected by GeoJSON (lng, lat)
      const coordinates = street.path.map(point => [point[1], point[0]]);
      
      // Explicitly assign different statuses to ensure we have examples of each
      let status: 'open' | 'congested' | 'closed';
      if (index === 0) {
        status = 'congested';
      } else if (index === 1) {
        status = 'closed';
      } else {
        status = 'open';
      }
      
      routes.push({
        id: `route-street-${index + 1}`,
        startPoint,
        endPoint,
        status,
        estimatedTime: 5 + Math.floor(Math.random() * 10), // 5-15 minutes
        transportMethods: ['car', 'emergency', 'foot'],
        routeName: street.name,
        geometry: {
          type: 'LineString',
          coordinates
        }
      });
    }
  });
  
  return routes;
};

// IMPROVED: Generate highway evacuation route with stable path
export const generateHighwayEvacuationRoutes = (): EvacuationRouteType[] => {
  const routes: EvacuationRouteType[] = [];
  
  // Use the main highway to Chibougamau
  const mainHighway = mistissiniHighways.find(hw => hw.name.includes("Chibougamau"));
  
  if (mainHighway) {
    // Convert path coordinates to GeoJSON format (lng, lat)
    const coordinates = mainHighway.path.map(point => [point[1], point[0]]);
    
    routes.push({
      id: `route-highway-1`,
      startPoint: "Mistissini",
      endPoint: "Chibougamau",
      status: "open", // Make the main evacuation highway always open
      estimatedTime: 35, // Fixed time for stability
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

// Function to update evacuation route status
export const updateEvacuationRouteStatus = (routes: EvacuationRouteType[], index: number): EvacuationRouteType => {
  // Only a 5% chance of changing status to maintain stability
  if (Math.random() > 0.95) {
    const updatedRoute = { ...routes[index] };
    
    // For highway routes, keep them mostly open for evacuation
    if (updatedRoute.routeName?.includes("Chibougamau")) {
      updatedRoute.status = Math.random() > 0.9 ? "congested" : "open";
    } else {
      const statusOptions: Array<'open' | 'congested' | 'closed'> = ['open', 'congested', 'closed'];
      updatedRoute.status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    }
    
    // Very rarely update the estimated time as well but with smaller changes
    if (Math.random() > 0.9) {
      const currentTime = updatedRoute.estimatedTime || 10;
      const adjustment = Math.round((Math.random() - 0.5) * 3); // +/- 3 minutes max
      updatedRoute.estimatedTime = Math.max(5, currentTime + adjustment); // Ensure at least 5 minutes
    }
    
    return updatedRoute;
  }
  
  // Most of the time, return the unchanged route
  return routes[index];
};
