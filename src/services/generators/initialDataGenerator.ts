
import { MapDataType } from '@/types/emergency';
import { generateInitialForestFireZones } from './dangerZoneGenerator';
import { generateInitialResponders } from './responderGenerator';
import { generateInitialAlerts } from './alertGenerator';
import { generateInitialVideoFeeds } from './videoFeedGenerator';

// Generate initial data state focused on Mistissini
export const generateInitialData = (): MapDataType => {
  // Generate initial danger zones
  const initialDangerZones = generateInitialForestFireZones(3);
  
  // Generate initial responders based on danger zones
  const initialResponders = generateInitialResponders(initialDangerZones);
  
  // Generate initial alerts
  const initialAlerts = generateInitialAlerts();
  
  // Generate initial video feeds
  const initialVideoFeeds = generateInitialVideoFeeds();
  
  // Define fixed evacuation routes with consistent statuses
  const fixedEvacuationRoutes = [
    {
      id: 'route-1',
      type: 'street',
      status: 'open',
      startPoint: 'Mistissini Center',
      endPoint: 'Eastern Mistissini',
      estimatedTime: 5, // Added required field in minutes
      transportMethods: ['car', 'emergency'] as Array<'car' | 'foot' | 'emergency'>, // Added required field
      geometry: {
        type: 'LineString',
        coordinates: [
          [-73.8760, 50.4215],
          [-73.8730, 50.4220],
          [-73.8700, 50.4225],
          [-73.8670, 50.4230],
          [-73.8640, 50.4235],
          [-73.8610, 50.4240]
        ]
      }
    },
    {
      id: 'route-2',
      type: 'street',
      status: 'congested',
      startPoint: 'Northern Mistissini',
      endPoint: 'Southern Mistissini',
      estimatedTime: 8, // Added required field in minutes
      transportMethods: ['car', 'foot', 'emergency'] as Array<'car' | 'foot' | 'emergency'>, // Added required field
      geometry: {
        type: 'LineString',
        coordinates: [
          [-73.8685, 50.4260],
          [-73.8685, 50.4245],
          [-73.8685, 50.4230],
          [-73.8685, 50.4215],
          [-73.8685, 50.4200],
          [-73.8685, 50.4185]
        ]
      }
    },
    {
      id: 'route-3',
      type: 'highway',
      status: 'closed',
      startPoint: 'Mistissini',
      endPoint: 'Chibougamau Highway',
      estimatedTime: 15, // Added required field in minutes
      transportMethods: ['car', 'emergency'] as Array<'car' | 'foot' | 'emergency'>, // Added required field
      geometry: {
        type: 'LineString',
        coordinates: [
          [-73.8640, 50.4230],
          [-73.8620, 50.4300],
          [-73.8560, 50.4380],
          [-73.8510, 50.4470],
          [-73.8460, 50.4560],
          [-73.8410, 50.4650],
          [-73.8360, 50.4740],
          [-73.8310, 50.4830],
          [-73.8260, 50.4920],
          [-73.8210, 50.5010]
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
