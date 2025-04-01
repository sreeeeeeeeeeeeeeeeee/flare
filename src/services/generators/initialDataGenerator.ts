
import { MapDataType } from '@/types/emergency';
import { generateInitialForestFireZones } from './dangerZoneGenerator';
import { generateInitialResponders } from './responderGenerator';
import { generateInitialAlerts } from './alertGenerator';
import { generateInitialVideoFeeds } from './videoFeedGenerator';

// Generate initial data state focused on Mistissini
export const generateInitialData = (): MapDataType => {
  // Generate initial danger zones - just one in the center
  const initialDangerZones = generateInitialForestFireZones();
  
  // Generate initial responders based on danger zones
  const initialResponders = generateInitialResponders(initialDangerZones);
  
  // Generate initial alerts
  const initialAlerts = generateInitialAlerts();
  
  // Generate initial video feeds
  const initialVideoFeeds = generateInitialVideoFeeds();
  
  // Define fixed evacuation routes with coordinates that work well with the GraphHopper API
  // These will be processed by the API in the map component
  const fixedEvacuationRoutes = [
    {
      id: 'route-1',
      type: 'street' as const,
      status: 'open' as const,
      startPoint: 'Spruce Street',
      endPoint: 'Eastern Mistissini',
      estimatedTime: 5,
      transportMethods: ['car', 'emergency'] as Array<'car' | 'foot' | 'emergency'>,
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          // Spruce Street coordinates - Open route going northeast
          // These coordinates work well with GraphHopper's API
          [-73.8650, 50.4195],
          [-73.8600, 50.4220]
        ]
      }
    },
    {
      id: 'route-2',
      type: 'street' as const,
      status: 'congested' as const,
      startPoint: 'Northern Mistissini',
      endPoint: 'Southern Mistissini',
      estimatedTime: 8,
      transportMethods: ['car', 'foot', 'emergency'] as Array<'car' | 'foot' | 'emergency'>,
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          // North-South route - Congested route with different coordinates
          // These are distinct from route-1 to avoid path overlap
          [-73.8685, 50.4260],
          [-73.8685, 50.4155]
        ]
      }
    },
    {
      id: 'route-3',
      type: 'highway' as const,
      status: 'closed' as const,
      startPoint: 'Mistissini',
      endPoint: 'Chibougamau Highway',
      estimatedTime: 15,
      transportMethods: ['car', 'emergency'] as Array<'car' | 'foot' | 'emergency'>,
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          // Northwestern route - Closed route, different direction
          // These coordinates create a distinct third path
          [-73.8680, 50.4220],
          [-73.8860, 50.4400]
        ]
      }
    }
  ];
  
  return {
    responders: initialResponders,
    dangerZones: initialDangerZones,
    evacuationRoutes: fixedEvacuationRoutes,
    alerts: initialAlerts,
    videoFeeds: initialVideoFeeds
  };
};
