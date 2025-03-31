
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
  
  // IMPROVED: Generate evacuation routes based on danger zones to ensure proximity
  const allEvacuationRoutes = [
    ...generateStreetEvacuationRoutes(initialDangerZones),
    ...generateHighwayEvacuationRoutes()
  ];
  
  // Make the first danger zone evacuation route congested
  if (allEvacuationRoutes.length > 2) {
    const routeToMakeCongested = allEvacuationRoutes.find(route => 
      route.id.includes('evacuation') && route.id.includes('1'));
    
    if (routeToMakeCongested) {
      routeToMakeCongested.status = 'congested';
    }
  }
  
  return {
    responders: initialResponders,
    dangerZones: initialDangerZones,
    evacuationRoutes: allEvacuationRoutes,
    alerts: initialAlerts,
    videoFeeds: initialVideoFeeds
  };
};
