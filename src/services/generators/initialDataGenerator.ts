
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
  
  // IMPROVED: Combine street and highway evacuation routes with stable paths
  const allEvacuationRoutes = [
    ...generateStreetEvacuationRoutes(),
    ...generateHighwayEvacuationRoutes()
  ];
  
  return {
    responders: initialResponders,
    dangerZones: initialDangerZones,
    evacuationRoutes: allEvacuationRoutes,
    alerts: initialAlerts,
    videoFeeds: initialVideoFeeds
  };
};
