
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
  
  // Define fixed evacuation routes with consistent statuses in three distinct directions
  const fixedEvacuationRoutes = [
    {
      id: 'route-1',
      type: 'street' as const,
      status: 'open' as const,
      startPoint: 'Lake Shore',
      endPoint: 'Eastern Mistissini',
      estimatedTime: 5,
      transportMethods: ['car', 'emergency'] as Array<'car' | 'foot' | 'emergency'>,
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          // Eastern route - Open route going east
          [-73.8700, 50.4220],
          [-73.8670, 50.4225],
          [-73.8640, 50.4230],
          [-73.8610, 50.4235],
          [-73.8580, 50.4240],
          [-73.8550, 50.4245],
          [-73.8520, 50.4250],
          [-73.8490, 50.4255]
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
          // North-South route - Congested route going north to south
          [-73.8685, 50.4260],
          [-73.8685, 50.4245],
          [-73.8685, 50.4230],
          [-73.8685, 50.4215],
          [-73.8685, 50.4200],
          [-73.8685, 50.4185],
          [-73.8685, 50.4170],
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
          // Northwestern route - Closed route going northwest to Chibougamau
          [-73.8680, 50.4220],
          [-73.8700, 50.4240],
          [-73.8720, 50.4260],
          [-73.8740, 50.4280],
          [-73.8760, 50.4300],
          [-73.8780, 50.4320],
          [-73.8800, 50.4340],
          [-73.8820, 50.4360],
          [-73.8840, 50.4380],
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
