
/**
 * Route calculation service
 */

import { Route } from '@/types/mapTypes';
import { mistissiniStreets } from './mistissini/streets';
import { mistissiniHighways } from './mistissini/highways';

// Get a predefined street route based on names
const getStreetRoute = (start: string, end: string): [number, number][] => {
  // Find a matching street or create a path
  const streetRoutes = mistissiniStreets.map(street => street.path);
  
  // Return a street path or fallback
  return streetRoutes[0] || [
    [50.4220, -73.8700], // Default start
    [50.4230, -73.8670]  // Default end
  ];
};

// Get a predefined highway route
const getHighwayRoute = (): [number, number][] => {
  return mistissiniHighways[0]?.path || [
    [50.4230, -73.8640], // Default start
    [50.4300, -73.8620]  // Default end
  ];
};

/**
 * Initializes routes with fixed paths
 */
export const initializeRoutes = async (
  routeDefinitions: Array<{ id: string; start: string; end: string, status: 'open' | 'congested' | 'closed' }>,
  locationMap: Record<string, [number, number]>
): Promise<Route[]> => {
  console.log("Initializing routes with definitions:", routeDefinitions);
  
  // Create three predefined routes with different paths and statuses
  const calculatedRoutes: Route[] = [
    {
      id: 'route-1',
      path: mistissiniStreets.find(street => street.name === "Main Street")?.path || [
        [50.4215, -73.8760],
        [50.4220, -73.8730],
        [50.4225, -73.8700],
        [50.4230, -73.8670],
        [50.4235, -73.8640],
        [50.4240, -73.8610]
      ],
      status: 'open',
      start: 'Mistissini Center',
      end: 'Eastern Mistissini',
      updatedAt: new Date()
    },
    {
      id: 'route-2',
      path: mistissiniStreets.find(street => street.name === "Saint John Street")?.path || [
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
    },
    {
      id: 'route-3',
      path: mistissiniHighways[0].path.slice(0, 10),
      status: 'closed',
      start: 'Mistissini',
      end: 'Chibougamau Highway',
      updatedAt: new Date()
    }
  ];

  console.log("Generated routes:", calculatedRoutes);
  return calculatedRoutes;
};
