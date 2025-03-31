
import { MapDataType } from '@/types/emergency';
import { generateInitialForestFireZones } from './dangerZoneGenerator';
import { generateInitialResponders } from './responderGenerator';
import { generateInitialAlerts } from './alertGenerator';
import { generateInitialVideoFeeds } from './videoFeedGenerator';
import { generateStreetEvacuationRoutes, generateHighwayEvacuationRoutes } from './evacuationRouteGenerator';

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
  
  // Generate our fixed evacuation routes (2 street routes, 1 highway route)
  const streetRoutes = generateStreetEvacuationRoutes();
  const highwayRoutes = generateHighwayEvacuationRoutes();
  
  // Combine and ensure correct statuses
  const allEvacuationRoutes = [...streetRoutes, ...highwayRoutes];
  
  // Double-check statuses are set correctly
  if (allEvacuationRoutes.length >= 3) {
    allEvacuationRoutes[0].status = 'open';
    allEvacuationRoutes[1].status = 'congested';
    allEvacuationRoutes[2].status = 'closed';
  }
  
  return {
    responders: initialResponders,
    dangerZones: initialDangerZones,
    evacuationRoutes: allEvacuationRoutes,
    alerts: initialAlerts,
    videoFeeds: initialVideoFeeds
  };
};
