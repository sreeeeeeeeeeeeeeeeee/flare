
/**
 * Utility functions for map calculations and data transformations
 */

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

export const calculateDistance = (path: [number, number][]) => {
  if (path.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += haversineDistance(path[i-1][0], path[i-1][1], path[i][0], path[i][1]);
  }
  return total;
};

// Precise coordinates for Mistissini verified with OpenStreetMap
export const LOCATIONS: Record<string, [number, number]> = {
  mistissini: [50.4221, -73.8683], // Verified town center
  dropose: [50.4153, -73.8748],    // Industrial area coordinates
  hospital: [50.4230, -73.8780],   // Medical facility
  school: [50.4180, -73.8650],     // Local school
  chibougamau: [49.9166, -74.3694] // Neighboring town
};

// Known road segments in Mistissini (simplified from OSM data)
export const ROAD_SEGMENTS: Array<[number, number][]> = [
  // Main roads
  [[50.4221, -73.8683], [50.4230, -73.8670], [50.4235, -73.8650]],
  [[50.4221, -73.8683], [50.4210, -73.8690], [50.4200, -73.8700]],
  // Connection to dropose area
  [[50.4200, -73.8700], [50.4175, -73.8720], [50.4153, -73.8748]]
];

export const GRAPHHOPPER_API_KEY = '5adb1e1c-29a2-4293-81c1-1c81779679bb';

// Generate a random route status
export const getRandomStatus = (): 'open' | 'congested' | 'closed' => {
  const rand = Math.random();
  return rand < 0.7 ? 'open' : rand < 0.9 ? 'congested' : 'closed';
};

// Get route color based on status
export const getRouteColor = (status: 'open' | 'congested' | 'closed'): string => {
  switch (status) {
    case 'open':
      return '#22c55e'; // Green
    case 'congested':
      return '#f97316'; // Orange
    case 'closed':
      return '#ef4444'; // Red
    default:
      return '#22c55e'; // Default to green
  }
};
