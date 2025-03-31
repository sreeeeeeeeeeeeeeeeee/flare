
/**
 * Route calculation service
 */

import { GRAPHHOPPER_API_KEY, ROAD_SEGMENTS, haversineDistance } from '@/utils/mapUtils';
import { Route } from '@/types/mapTypes';

/**
 * Snaps a point to the nearest road segment
 */
export const snapToRoad = (point: [number, number]): [number, number] => {
  let closestPoint: [number, number] = point;
  let minDistance = Infinity;

  ROAD_SEGMENTS.forEach(segment => {
    segment.forEach(roadPoint => {
      const dist = haversineDistance(
        point[0], point[1],
        roadPoint[0], roadPoint[1]
      );
      if (dist < minDistance && dist < 0.1) { // 100m threshold
        minDistance = dist;
        closestPoint = roadPoint;
      }
    });
  });

  return closestPoint;
};

/**
 * Fetches a road route between two points
 */
export const fetchRoadRoute = async (start: [number, number], end: [number, number]): Promise<[number, number][]> => {
  try {
    // 1. First try to snap points to nearest known roads
    const snappedStart = snapToRoad(start);
    const snappedEnd = snapToRoad(end);

    // 2. Fetch route from GraphHopper with elevation data for precision
    const response = await fetch(
      `https://graphhopper.com/api/1/route?` +
      `point=${snappedStart[0]},${snappedStart[1]}&` +
      `point=${snappedEnd[0]},${snappedEnd[1]}&` +
      `vehicle=car&key=${GRAPHHOPPER_API_KEY}&` +
      `points_encoded=false&` +
      `elevation=true&` + // Better terrain following
      `locale=en&` +
      `ch.disable=true&` + // More precise routing
      `turn_costs=true`    // Better road following
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    
    if (data.paths?.[0]?.points?.coordinates) {
      return data.paths[0].points.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
      );
    }
    
    return [start, end]; // Fallback
  } catch (error) {
    console.error('Routing error:', error);
    return [start, end]; // Fallback
  }
};

/**
 * Initializes routes based on route definitions
 */
export const initializeRoutes = async (
  routeDefinitions: Array<{ id: string; start: string; end: string }>,
  locationMap: Record<string, [number, number]>
): Promise<Route[]> => {
  const calculatedRoutes: Route[] = [];

  for (const def of routeDefinitions) {
    const startPos = locationMap[def.start];
    const endPos = locationMap[def.end];

    if (!startPos || !endPos) continue;

    const path = await fetchRoadRoute(startPos, endPos);
    
    calculatedRoutes.push({
      ...def,
      path,
      status: 'open',
      updatedAt: new Date()
    });
  }

  return calculatedRoutes;
};
