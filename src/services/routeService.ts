
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
    [50.4220, -73.8700] as [number, number], // Default start
    [50.4230, -73.8670] as [number, number]  // Default end
  ];
};

// Get a predefined highway route
const getHighwayRoute = (): [number, number][] => {
  return mistissiniHighways[0]?.path || [
    [50.4230, -73.8640] as [number, number], // Default start
    [50.4300, -73.8620] as [number, number]  // Default end
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
  
  // Use actual street paths instead of approximations
  const calculatedRoutes: Route[] = [
    {
      id: 'route-1',
      // Use the entire Main Street path for the first route
      path: mistissiniStreets.find(street => street.name === "Main Street")?.path as [number, number][],
      status: 'open',
      start: 'Mistissini Center',
      end: 'Eastern Mistissini',
      updatedAt: new Date()
    },
    {
      id: 'route-2',
      // Use the entire Saint John Street for the second route
      path: mistissiniStreets.find(street => street.name === "Saint John Street")?.path as [number, number][],
      status: 'congested',
      start: 'Northern Mistissini',
      end: 'Southern Mistissini',
      updatedAt: new Date()
    },
    {
      id: 'route-3',
      // Use a section of the highway to Chibougamau
      path: mistissiniHighways.find(highway => highway.name === "Route 167 to Chibougamau")?.path.slice(0, 15) as [number, number][],
      status: 'closed',
      start: 'Mistissini',
      end: 'Chibougamau Highway',
      updatedAt: new Date()
    }
  ];

  console.log("Generated routes:", calculatedRoutes);
  return calculatedRoutes;
};
