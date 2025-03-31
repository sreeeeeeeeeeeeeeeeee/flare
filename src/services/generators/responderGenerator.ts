
import { ResponderType, DangerZoneType } from '@/types/emergency';
import { mistissiniLocation, evacuationDestinations } from '../mistissiniData';

// Create drone responders positioned near danger zones
export const generateDroneResponders = (dangerZones: DangerZoneType[]) => {
  const drones = [];
  
  // Determine how many drones to create (3-4)
  const droneCount = 3 + Math.floor(Math.random() * 2); // 3 or 4 drones
  
  // For each drone, position it near a danger zone
  for (let i = 0; i < Math.min(droneCount, dangerZones.length); i++) {
    // Get coordinates from the danger zone
    const zoneCoords = dangerZones[i].geometry.coordinates[0][0];
    
    // Add slight offset to position the drone near but not exactly on the danger zone
    const latOffset = (Math.random() - 0.5) * 0.005; // Random offset within ~500m
    const lngOffset = (Math.random() - 0.5) * 0.005;
    
    drones.push({
      id: `drone-${i + 1}`,
      name: `Forest Fire Drone ${i + 1}`,
      type: 'drone' as const,
      status: Math.random() > 0.3 ? 'active' as const : 'en-route' as const,
      position: {
        latitude: zoneCoords[1] + latOffset,
        longitude: zoneCoords[0] + lngOffset,
        locationName: `${dangerZones[i].forestRegion || 'Mistissini Forest'}`
      }
    });
  }
  
  return drones;
};

// Generate initial responders including both drones and ground teams
export const generateInitialResponders = (dangerZones: DangerZoneType[]): ResponderType[] => {
  const drones = generateDroneResponders(dangerZones);
  
  // Add ground responders
  const groundResponders: ResponderType[] = [
    {
      id: 'resp-1',
      name: 'Mistissini Fire Squad',
      type: 'fire',
      status: 'active',
      position: {
        latitude: mistissiniLocation.center.lat + 0.002,
        longitude: mistissiniLocation.center.lng - 0.002,
        locationName: 'Mistissini'
      }
    },
    {
      id: 'resp-3',
      name: 'Medical Team',
      type: 'medical',
      status: 'en-route',
      position: {
        latitude: mistissiniLocation.center.lat - 0.003,
        longitude: mistissiniLocation.center.lng + 0.003,
        locationName: 'Mistissini Community Center'
      }
    },
    {
      id: 'resp-4',
      name: 'Regional Fire Support',
      type: 'fire',
      status: 'en-route',
      position: {
        latitude: evacuationDestinations[0].lat - 0.2,
        longitude: evacuationDestinations[0].lng + 0.1,
        locationName: 'En route from Chibougamau'
      }
    },
    {
      id: 'resp-5',
      name: 'Quebec Police',
      type: 'police',
      status: 'active',
      position: {
        latitude: mistissiniLocation.center.lat + 0.004,
        longitude: mistissiniLocation.center.lng + 0.002,
        locationName: 'Northern Mistissini'
      }
    },
  ];
  
  return [...drones, ...groundResponders];
};

// Update responder positions
export const updateResponderPositions = (responders: ResponderType[], dangerZones: DangerZoneType[]): ResponderType[] => {
  return responders.map(responder => {
    const updatedResponder = { ...responder };
    
    if (responder.type === 'drone') {
      let closestZone = dangerZones[0];
      let minDistance = Number.MAX_VALUE;
      
      dangerZones.forEach(zone => {
        const zoneCoord = zone.geometry.coordinates[0][0];
        const distance = Math.sqrt(
          Math.pow(responder.position.latitude - zoneCoord[1], 2) + 
          Math.pow(responder.position.longitude - zoneCoord[0], 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestZone = zone;
        }
      });
      
      const zoneCoord = closestZone.geometry.coordinates[0][0];
      const targetLat = zoneCoord[1] + (Math.random() - 0.5) * 0.005;
      const targetLng = zoneCoord[0] + (Math.random() - 0.5) * 0.005;
      
      const moveSpeed = 0.001 + Math.random() * 0.002;
      const latDiff = targetLat - responder.position.latitude;
      const lngDiff = targetLng - responder.position.longitude;
      
      updatedResponder.position.latitude += latDiff * moveSpeed;
      updatedResponder.position.longitude += lngDiff * moveSpeed;
    } else {
      updatedResponder.position.latitude += (Math.random() - 0.5) * 0.002;
      updatedResponder.position.longitude += (Math.random() - 0.5) * 0.002;
    }
    
    return updatedResponder;
  });
};
