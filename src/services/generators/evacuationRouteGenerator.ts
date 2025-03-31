
import { EvacuationRouteType } from '@/types/emergency';
import { mistissiniStreets, mistissiniHighways } from '../mistissini';
import { DangerZoneType } from '@/types/emergency';

// IMPROVED: Generate evacuation routes that follow actual Mistissini streets
export const generateStreetEvacuationRoutes = (dangerZones: DangerZoneType[] = []): EvacuationRouteType[] => {
  const routes: EvacuationRouteType[] = [];
  
  // Base evacuation routes - always present
  const baseStreets = [
    "Main Street",
    "Lakeshore Drive"
  ];
  
  // Create evacuation routes for each base street
  baseStreets.forEach((streetName, index) => {
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
      
      // Convert path coordinates to GeoJSON format (lng, lat)
      const coordinates = street.path.map(point => [point[1], point[0]]);
      
      routes.push({
        id: `route-street-${index + 1}`,
        startPoint,
        endPoint,
        status: 'open',
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
  
  // For each danger zone, ensure there's a nearby evacuation route
  dangerZones.forEach((zone, zoneIndex) => {
    // Find a street close to this danger zone (that's not already used)
    const usedStreetNames = routes.map(r => r.routeName);
    const availableStreets = mistissiniStreets.filter(s => !usedStreetNames.includes(s.name));
    
    if (availableStreets.length > 0) {
      // Choose a street (could implement actual proximity calculation for production)
      const street = availableStreets[zoneIndex % availableStreets.length];
      
      // Use danger zone as start point and a safe area as end point
      const startPoint = `Danger Zone ${zoneIndex + 1}`;
      const endPoint = "Community Center"; // Safe evacuation point
      
      // Convert path coordinates to GeoJSON format (lng, lat)
      const coordinates = street.path.map(point => [point[1], point[0]]);
      
      routes.push({
        id: `route-evacuation-${zoneIndex + 1}`,
        startPoint,
        endPoint,
        status: 'open', // Start as open, will be updated dynamically
        estimatedTime: 8 + Math.floor(Math.random() * 7), // 8-15 minutes
        transportMethods: ['car', 'emergency', 'foot'],
        routeName: `${street.name} Evacuation Route`,
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
  // Create a copy of the route to modify
  const updatedRoute = { ...routes[index] };
  
  // For the Lake Shore to Eastern Mistissini route, ensure it's consistent
  if (updatedRoute.startPoint === "Lake Shore" && updatedRoute.endPoint === "Eastern Mistissini") {
    // This ensures the Lake Shore route has a consistent status
    updatedRoute.status = "open";
    return updatedRoute;
  }
  
  // Only a 5% chance of changing status to maintain stability
  if (Math.random() > 0.95) {
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
  }
  
  return updatedRoute;
};
