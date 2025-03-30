import { MapDataType, EvacuationRouteType, DangerZoneType } from '@/types/emergency';
import { mistissiniLocation, mistissiniRegions, mistissiniForestRegions, evacuationDestinations, mistissiniHighways } from './mistissiniData';

// Sample YouTube video - keeping only one video feed
const droneVideo = 'https://youtu.be/uRFrHhBKAto';

// Generate a realistic forest fire zone around Mistissini
const generateForestFireZone = (nearRegion: number, id: string): DangerZoneType => {
  const region = mistissiniRegions[nearRegion];
  const riskLevels: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
  
  // Create an irregular polygon around the region
  const radius = 0.02 + Math.random() * 0.04; // Random radius between 0.02 and 0.06 degrees
  const sides = 5 + Math.floor(Math.random() * 3); // 5-7 sides for the polygon
  const coordinates = [];
  
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const lng = region.center.lng + Math.cos(angle) * radius * (0.8 + Math.random() * 0.4); // Add irregularity
    const lat = region.center.lat + Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
    coordinates.push([lng, lat]);
  }
  
  // Close the polygon
  coordinates.push([...coordinates[0]]);
  
  return {
    id,
    type: 'wildfire', // Always wildfire for forest fires
    riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
    forestRegion: mistissiniForestRegions[Math.floor(Math.random() * mistissiniForestRegions.length)],
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates]
    }
  };
};

// Function to generate initial forest fire zones around Mistissini
const generateInitialForestFireZones = (count: number = 4): DangerZoneType[] => {
  const zones: DangerZoneType[] = [];
  const usedRegions = new Set<number>();
  
  // Generate fires in different regions around Mistissini
  while (zones.length < count && usedRegions.size < mistissiniRegions.length) {
    const regionIndex = Math.floor(Math.random() * mistissiniRegions.length);
    if (!usedRegions.has(regionIndex)) {
      zones.push(generateForestFireZone(regionIndex, `zone-${zones.length + 1}`));
      usedRegions.add(regionIndex);
    }
  }
  
  return zones;
};

// Generate a realistic evacuation route following highways
const generateHighwayEvacuationRoute = (
  highwayIndex: number, 
  destinationName: string, 
  id: string
): EvacuationRouteType => {
  const highway = mistissiniHighways[highwayIndex];
  
  // Convert the highway path to the expected format for the route geometry
  const coordinates = highway.path.map(point => [point[1], point[0]]);
  
  // Determine transport methods based on the highway
  const transportMethods: Array<'car' | 'foot' | 'emergency'> = ['car', 'emergency'];
  
  // Add 'foot' for shorter routes or if it's the Lake Shore route
  if (highway.name === "Lake Mistassini Shore Road" || coordinates.length < 6) {
    transportMethods.push('foot');
  }
  
  // Determine status based on weighted randomness
  const statusOptions: Array<'open' | 'congested' | 'closed'> = ['open', 'congested', 'closed'];
  const statusWeights = [0.6, 0.3, 0.1]; // 60% open, 30% congested, 10% closed
  
  const randomValue = Math.random();
  let cumulativeWeight = 0;
  let selectedStatusIndex = 0;
  
  for (let i = 0; i < statusWeights.length; i++) {
    cumulativeWeight += statusWeights[i];
    if (randomValue <= cumulativeWeight) {
      selectedStatusIndex = i;
      break;
    }
  }
  
  // Calculate a rough estimate of travel time based on the number of points
  // Assuming each segment takes about 3-7 minutes to travel
  const estimatedTime = Math.max(10, Math.round(coordinates.length * (3 + Math.random() * 4)));
  
  return {
    id,
    startPoint: "Mistissini",
    endPoint: destinationName,
    status: statusOptions[selectedStatusIndex],
    estimatedTime,
    transportMethods,
    geometry: {
      type: 'LineString',
      coordinates
    }
  };
};

// Generate evacuation routes based on actual highways
const generateEvacuationRoutes = (): EvacuationRouteType[] => {
  const routes: EvacuationRouteType[] = [];
  
  // Route 167 to Chibougamau
  routes.push(generateHighwayEvacuationRoute(0, "Chibougamau", "route-1"));
  
  // Route du Nord
  routes.push(generateHighwayEvacuationRoute(1, "Route du Nord", "route-2"));
  
  // Oujé-Bougoumou Road
  routes.push(generateHighwayEvacuationRoute(2, "Oujé-Bougoumou", "route-3"));
  
  // Waswanipi Route
  routes.push(generateHighwayEvacuationRoute(3, "Waswanipi", "route-4"));
  
  // Lake Shore Road
  routes.push(generateHighwayEvacuationRoute(4, "Lake Shore", "route-5"));
  
  return routes;
};

// Create drone responders positioned near danger zones
const generateDroneResponders = (dangerZones: DangerZoneType[]) => {
  const drones = [];
  
  // Determine how many drones to create (4-5)
  const droneCount = 4 + Math.floor(Math.random() * 2); // 4 or 5 drones
  
  // For each drone, position it near a danger zone
  for (let i = 0; i < Math.min(droneCount, dangerZones.length); i++) {
    // Get coordinates from the danger zone
    const zoneCoords = dangerZones[i].geometry.coordinates[0][0];
    
    // Add slight offset to position the drone near but not exactly on the danger zone
    const latOffset = (Math.random() - 0.5) * 0.02; // Random offset within ~2km
    const lngOffset = (Math.random() - 0.5) * 0.02;
    
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

// Generate initial danger zones focused on Mistissini
const initialDangerZones = generateInitialForestFireZones(4);
const initialDrones = generateDroneResponders(initialDangerZones);

// Initial data state focused on Mistissini
const initialData: MapDataType = {
  responders: [
    // Include generated drones
    ...initialDrones,
    // Add other responders in the Mistissini area
    {
      id: 'resp-1',
      name: 'Mistissini Fire Squad',
      type: 'fire',
      status: 'active',
      position: {
        latitude: mistissiniLocation.center.lat + 0.01,
        longitude: mistissiniLocation.center.lng - 0.01,
        locationName: 'Mistissini'
      }
    },
    {
      id: 'resp-3',
      name: 'Medical Team',
      type: 'medical',
      status: 'en-route',
      position: {
        latitude: mistissiniLocation.center.lat - 0.015,
        longitude: mistissiniLocation.center.lng + 0.02,
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
        latitude: mistissiniLocation.center.lat + 0.025,
        longitude: mistissiniLocation.center.lng + 0.01,
        locationName: 'Northern Mistissini'
      }
    },
  ],
  dangerZones: initialDangerZones,
  evacuationRoutes: generateEvacuationRoutes(),
  alerts: [
    {
      id: 'alert-1',
      severity: 'critical',
      title: 'Forest Fire Alert',
      message: 'Active forest fire detected in Mistissini Boreal Forest. Immediate evacuation required for northern sectors.',
      time: '13:45',
      location: 'Northern Mistissini',
      isNew: false,
      visibility: 'all'
    },
    {
      id: 'alert-2',
      severity: 'warning',
      title: 'Drone Deployment',
      message: 'Surveillance drones deployed to monitor forest fire perimeters around Lake Mistassini.',
      time: '13:30',
      location: 'Mistissini Region',
      isNew: true,
      visibility: 'admin'
    },
    {
      id: 'alert-3',
      severity: 'critical',
      title: 'New Forest Fire',
      message: 'New forest fire identified in Lake Mistassini Shoreline Forest. Please avoid the eastern shore area.',
      time: '14:05',
      location: 'Eastern Shore',
      isNew: true,
      visibility: 'all'
    },
    {
      id: 'alert-4', 
      severity: 'warning',
      title: 'Smoke Conditions',
      message: 'Poor visibility due to smoke from forest fires. Use caution when driving in the Mistissini area.',
      time: '18:30',
      location: 'Mistissini Region',
      isNew: false,
      visibility: 'public'
    }
  ],
  videoFeeds: [
    {
      id: 'video-1',
      type: 'drone',
      source: droneVideo,
      location: 'Mistissini Forest Fire Zone',
      hasAlert: true,
      relatedFeeds: [] // Empty related feeds
    }
  ]
};

// Function to update an evacuation route's status
const updateEvacuationRouteStatus = (routes: EvacuationRouteType[], index: number): EvacuationRouteType => {
  // Just update the status
  const updatedRoute = { ...routes[index] };
  const statusOptions: Array<'open' | 'congested' | 'closed'> = ['open', 'congested', 'closed'];
  updatedRoute.status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
  
  // Sometimes update the estimated time as well
  if (Math.random() > 0.7) {
    const currentTime = updatedRoute.estimatedTime;
    const adjustment = Math.round((Math.random() - 0.5) * 20); // +/- 20 minutes max
    updatedRoute.estimatedTime = Math.max(5, currentTime + adjustment); // Ensure at least 5 minutes
  }
  
  return updatedRoute;
};

// Function to create slightly different data to simulate real-time updates for Mistissini
const getUpdatedData = (): MapDataType => {
  // Deep copy the initialData to avoid modifying it
  const data: MapDataType = JSON.parse(JSON.stringify(initialData));
  
  // Update responder positions
  data.responders.forEach(responder => {
    // For drone responders, keep them moving more actively around danger zones
    if (responder.type === 'drone') {
      // Find the nearest danger zone
      let closestZone = data.dangerZones[0];
      let minDistance = Number.MAX_VALUE;
      
      data.dangerZones.forEach(zone => {
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
      
      // Keep the drone moving around the closest fire zone with more movement
      const zoneCoord = closestZone.geometry.coordinates[0][0];
      const targetLat = zoneCoord[1] + (Math.random() - 0.5) * 0.02;
      const targetLng = zoneCoord[0] + (Math.random() - 0.5) * 0.02;
      
      // Move drone toward target with some randomness
      const moveSpeed = 0.002 + Math.random() * 0.003;
      const latDiff = targetLat - responder.position.latitude;
      const lngDiff = targetLng - responder.position.longitude;
      
      responder.position.latitude += latDiff * moveSpeed;
      responder.position.longitude += lngDiff * moveSpeed;
    } else {
      // Regular responders move as before, but smaller movements to stay in Mistissini area
      responder.position.latitude += (Math.random() - 0.5) * 0.005;
      responder.position.longitude += (Math.random() - 0.5) * 0.005;
    }
  });

  // Sometimes add a new responder (30% chance)
  if (Math.random() > 0.7) {
    const newResponderTypes: Array<'drone' | 'police' | 'fire' | 'medical'> = ['drone', 'police', 'fire', 'medical'];
    const newResponderType = newResponderTypes[Math.floor(Math.random() * newResponderTypes.length)];
    
    // For forest fires, position new responders around Mistissini
    const regionIndex = Math.floor(Math.random() * mistissiniRegions.length);
    const location = mistissiniRegions[regionIndex];
    
    data.responders.push({
      id: `resp-${Math.floor(Math.random() * 1000)}`,
      name: `${newResponderType.charAt(0).toUpperCase() + newResponderType.slice(1)} Unit ${Math.floor(Math.random() * 100)}`,
      type: newResponderType,
      status: Math.random() > 0.5 ? 'active' : 'en-route',
      position: {
        latitude: location.center.lat + (Math.random() - 0.5) * 0.02,
        longitude: location.center.lng + (Math.random() - 0.5) * 0.02,
        locationName: location.name
      }
    });
  }
  
  // Sometimes remove a responder (10% chance, if we have more than 6 responders)
  if (Math.random() > 0.9 && data.responders.length > 6) {
    const indexToRemove = Math.floor(Math.random() * data.responders.length);
    data.responders.splice(indexToRemove, 1);
  }
  
  // Sometimes update danger zone shape (20% chance)
  if (Math.random() > 0.8) {
    data.dangerZones.forEach(zone => {
      zone.geometry.coordinates[0].forEach((coord, index) => {
        if (index > 0 && index < zone.geometry.coordinates[0].length - 1) {
          coord[0] += (Math.random() - 0.5) * 0.01;
          coord[1] += (Math.random() - 0.5) * 0.01;
        }
      });
    });
  }
  
  // Sometimes add a new forest fire zone (15% chance, max 6 zones)
  if (Math.random() > 0.85 && data.dangerZones.length < 6) {
    const regionIndex = Math.floor(Math.random() * mistissiniRegions.length);
    const newZone = generateForestFireZone(regionIndex, `zone-${Math.floor(Math.random() * 1000)}`);
    data.dangerZones.push(newZone);
    
    // Add an alert about the new forest fire
    const forestRegion = newZone.forestRegion || 'Mistissini Forest';
    
    data.alerts.unshift({
      id: `alert-${Math.floor(Math.random() * 1000)}`,
      severity: 'critical',
      title: 'New Forest Fire',
      message: `New forest fire detected in ${forestRegion} near ${mistissiniRegions[regionIndex].name}. Please avoid the area.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: forestRegion,
      isNew: true,
      visibility: 'all'
    });
  }
  
  // Update evacuation routes (status changes only, path stays the same)
  // 30% chance to update a random route's status
  if (Math.random() < 0.3 && data.evacuationRoutes.length > 0) {
    const routeIndex = Math.floor(Math.random() * data.evacuationRoutes.length);
    data.evacuationRoutes[routeIndex] = updateEvacuationRouteStatus(data.evacuationRoutes, routeIndex);
  }
  
  // Sometimes add a new forest fire related alert
  if (Math.random() > 0.7) {
    const alertSeverities: Array<'critical' | 'warning' | 'info'> = ['critical', 'warning', 'info'];
    const newSeverity = alertSeverities[Math.floor(Math.random() * alertSeverities.length)];
    const visibilityOptions: Array<'public' | 'admin' | 'all'> = ['public', 'admin', 'all'];
    const visibility = visibilityOptions[Math.floor(Math.random() * visibilityOptions.length)];
    
    // Forest fire specific alert templates for Mistissini
    const alertTemplates = {
      critical: {
        title: 'Critical Fire Alert',
        messages: [
          'New forest fire spot detected in Northern Mistissini. Immediate evacuation required.',
          'Fire spread accelerating due to changing wind patterns. Additional evacuations ordered.',
          'Fire has jumped containment lines near Lake Mistassini. Evacuation zone expanded.'
        ]
      },
      warning: {
        title: 'Fire Warning',
        messages: [
          'Wind direction changing in Mistissini Forest region. Fire spread anticipated.',
          'Smoke conditions worsening near community center. Air quality alert issued.',
          'Low visibility on access roads due to forest fire smoke.'
        ]
      },
      info: {
        title: 'Fire Update',
        messages: [
          'New fire suppression team deployed to Mistissini Forest region.',
          'Water bomber aircraft now operating in Lake Mistassini area.',
          'Weather forecast predicts rain in Mistissini, possibly aiding firefighting efforts.'
        ]
      }
    };
    
    // Select a random forest region
    const forestRegion = mistissiniForestRegions[Math.floor(Math.random() * mistissiniForestRegions.length)];
    
    data.alerts.unshift({
      id: `alert-${Math.floor(Math.random() * 1000)}`,
      severity: newSeverity,
      title: alertTemplates[newSeverity].title,
      message: alertTemplates[newSeverity].messages[Math.floor(Math.random() * alertTemplates[newSeverity].messages.length)],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: forestRegion,
      isNew: true,
      visibility: visibility
    });
  }
  
  // Ensure alerts are not all marked as new
  data.alerts.forEach((alert, index) => {
    if (index > 0) {
      alert.isNew = false;
    }
  });
  
  return data;
};

export const mockDataService = {
  getInitialData: () => initialData,
  getUpdatedData
};
