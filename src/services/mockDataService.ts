import { MapDataType, EvacuationRouteType, DangerZoneType } from '@/types/emergency';

// Sample YouTube video - keeping only one video feed
const droneVideo = 'https://youtu.be/uRFrHhBKAto';

// Ontario cities with their coordinates
const ontarioCities = [
  { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
  { name: 'Ottawa', lat: 45.4215, lng: -75.6972 },
  { name: 'Hamilton', lat: 43.2557, lng: -79.8711 },
  { name: 'London', lat: 42.9849, lng: -81.2453 },
  { name: 'Kingston', lat: 44.2312, lng: -76.4860 },
  { name: 'Windsor', lat: 42.3149, lng: -83.0364 },
  { name: 'Sudbury', lat: 46.4917, lng: -80.9930 },
  { name: 'Thunder Bay', lat: 48.3809, lng: -89.2477 },
  { name: 'Barrie', lat: 44.3894, lng: -79.6903 },
  { name: 'Guelph', lat: 43.5448, lng: -80.2482 },
  { name: 'North Bay', lat: 46.3091, lng: -79.4608 },
  { name: 'Peterborough', lat: 44.3091, lng: -78.3197 },
  { name: 'Sault Ste. Marie', lat: 46.5136, lng: -84.3358 },
  { name: 'Brampton', lat: 43.7315, lng: -79.7624 },
  { name: 'Mississauga', lat: 43.5890, lng: -79.6441 },
  { name: 'Dryden', lat: 49.7797, lng: -92.8370 },
  { name: 'Timmins', lat: 48.4758, lng: -81.3305 },
  { name: 'Vaughan', lat: 43.8361, lng: -79.5001 }
];

// Generate a realistic danger zone around a city
const generateDangerZone = (nearCity: number, id: string): DangerZoneType => {
  const city = ontarioCities[nearCity];
  const zoneTypes: Array<'wildfire' | 'flood' | 'chemical' | 'other'> = ['wildfire', 'flood', 'chemical', 'other'];
  const riskLevels: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
  
  // Create an irregular polygon around the city
  const radius = 0.05 + Math.random() * 0.1; // Random radius between 0.05 and 0.15 degrees
  const sides = 5 + Math.floor(Math.random() * 3); // 5-7 sides for the polygon
  const coordinates = [];
  
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const lng = city.lng + Math.cos(angle) * radius * (0.8 + Math.random() * 0.4); // Add irregularity
    const lat = city.lat + Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
    coordinates.push([lng, lat]);
  }
  
  // Close the polygon
  coordinates.push([...coordinates[0]]);
  
  return {
    id,
    type: zoneTypes[Math.floor(Math.random() * zoneTypes.length)],
    riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates]
    }
  };
};

// Function to generate initial danger zones
const generateInitialDangerZones = (count: number = 5): DangerZoneType[] => {
  const zones: DangerZoneType[] = [];
  const usedCities = new Set<number>();
  
  while (zones.length < count) {
    const cityIndex = Math.floor(Math.random() * ontarioCities.length);
    if (!usedCities.has(cityIndex)) {
      zones.push(generateDangerZone(cityIndex, `zone-${zones.length + 1}`));
      usedCities.add(cityIndex);
    }
  }
  
  return zones;
};

// Function to find the nearest city to a given danger zone
const findNearestCityToDangerZone = (zone: DangerZoneType): number => {
  // Use the first coordinate of the polygon as a reference point
  const zoneLng = zone.geometry.coordinates[0][0][0];
  const zoneLat = zone.geometry.coordinates[0][0][1];
  
  let minDistance = Number.MAX_VALUE;
  let closestCityIndex = 0;
  
  ontarioCities.forEach((city, index) => {
    const distance = Math.sqrt(
      Math.pow(city.lat - zoneLat, 2) + 
      Math.pow(city.lng - zoneLng, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestCityIndex = index;
    }
  });
  
  return closestCityIndex;
};

// Function to find a city near a danger zone
const findCityNearDangerZone = (zone: DangerZoneType, excludeCity: number): number => {
  // Use the first coordinate of the polygon as a reference point
  const zoneLng = zone.geometry.coordinates[0][0][0];
  const zoneLat = zone.geometry.coordinates[0][0][1];
  
  // Calculate distances to all cities
  const cityDistances = ontarioCities.map((city, index) => ({
    index,
    distance: Math.sqrt(Math.pow(city.lat - zoneLat, 2) + Math.pow(city.lng - zoneLng, 2))
  }));
  
  // Sort by distance
  cityDistances.sort((a, b) => a.distance - b.distance);
  
  // Find the nearest city that isn't excluded
  for (const cityDist of cityDistances) {
    if (cityDist.index !== excludeCity) {
      return cityDist.index;
    }
  }
  
  // Fallback to a random city
  let randomCity = Math.floor(Math.random() * ontarioCities.length);
  while (randomCity === excludeCity) {
    randomCity = Math.floor(Math.random() * ontarioCities.length);
  }
  return randomCity;
};

// Function to generate a realistic evacuation route from a danger zone to a safe city
const generateEvacuationRouteFromDangerZone = (zone: DangerZoneType, id: string): EvacuationRouteType => {
  // Find the nearest city to the danger zone
  const nearestCityIndex = findNearestCityToDangerZone(zone);
  
  // Find another city as destination (preferably further from the danger zone)
  const destinationCityIndex = findCityNearDangerZone(zone, nearestCityIndex);
  
  const startCity = ontarioCities[nearestCityIndex];
  const endCity = ontarioCities[destinationCityIndex];
  
  // Generate a route with multiple points to make it look more realistic
  const numPoints = 2 + Math.floor(Math.random() * 3); // 2-4 intermediate points
  const points = [];
  
  // Start with the city near the danger zone
  points.push([startCity.lng, startCity.lat]);
  
  // Add intermediate points with some randomness, but generally moving toward the destination
  for (let i = 1; i <= numPoints; i++) {
    const progress = i / (numPoints + 1);
    const baseLng = startCity.lng + (endCity.lng - startCity.lng) * progress;
    const baseLat = startCity.lat + (endCity.lat - startCity.lat) * progress;
    
    // Add some deviation to make the route look more natural
    const deviation = 0.05 - (progress * 0.02); // Less deviation as we get closer to destination
    points.push([
      baseLng + (Math.random() - 0.5) * deviation,
      baseLat + (Math.random() - 0.5) * deviation
    ]);
  }
  
  // End with the destination city
  points.push([endCity.lng, endCity.lat]);
  
  // Calculate a rough distance-based estimated time (in minutes)
  const distance = Math.sqrt(
    Math.pow(startCity.lat - endCity.lat, 2) + 
    Math.pow(startCity.lng - endCity.lng, 2)
  ) * 111; // roughly km per degree at Ontario's latitude
  const estimatedTime = Math.round(distance * 1.2); // ~1.2 minutes per km is about 50km/h
  
  // Random transport methods
  const transportMethodOptions: Array<'car' | 'foot' | 'emergency'> = ['car', 'foot', 'emergency'];
  const transportMethods: Array<'car' | 'foot' | 'emergency'> = [];
  
  // Always include at least one transport method
  transportMethods.push('car');
  
  // Randomly add other transport methods
  if (Math.random() > 0.5) transportMethods.push('emergency');
  if (Math.random() > 0.7) transportMethods.push('foot');
  
  // Route statuses with weighted randomness (open more likely)
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
  
  return {
    id,
    startPoint: startCity.name,
    endPoint: endCity.name,
    status: statusOptions[selectedStatusIndex],
    estimatedTime,
    transportMethods,
    geometry: {
      type: 'LineString',
      coordinates: points
    }
  };
};

// Generate evacuation routes from danger zones
const generateEvacuationRoutesFromDangerZones = (dangerZones: DangerZoneType[]): EvacuationRouteType[] => {
  const routes: EvacuationRouteType[] = [];
  
  // Create at least one route per danger zone
  dangerZones.forEach((zone, index) => {
    routes.push(generateEvacuationRouteFromDangerZone(zone, `route-${index + 1}`));
    
    // 50% chance to add a second route for this danger zone
    if (Math.random() > 0.5) {
      routes.push(generateEvacuationRouteFromDangerZone(zone, `route-${index + 1}-alt`));
    }
  });
  
  return routes;
};

// Initial data state - updated with more danger zones and realistic evacuation routes
const initialDangerZones = generateInitialDangerZones(5); // 5 initial danger zones
const initialData: MapDataType = {
  responders: [
    {
      id: 'resp-1',
      name: 'Drone 1',
      type: 'drone',
      status: 'active',
      position: {
        latitude: 43.6532,
        longitude: -79.3832,
        locationName: 'Toronto'
      }
    },
    {
      id: 'resp-2',
      name: 'Fire Squad A',
      type: 'fire',
      status: 'en-route',
      position: {
        latitude: 43.8561,
        longitude: -79.5370,
        locationName: 'Vaughan'
      }
    },
    {
      id: 'resp-3',
      name: 'Ambulance 35',
      type: 'medical',
      status: 'active',
      position: {
        latitude: 43.7315,
        longitude: -79.7624,
        locationName: 'Brampton'
      }
    },
  ],
  dangerZones: initialDangerZones,
  evacuationRoutes: generateEvacuationRoutesFromDangerZones(initialDangerZones),
  alerts: [
    {
      id: 'alert-1',
      severity: 'critical',
      title: 'Wildfire Alert',
      message: 'Active wildfire detected in Northern Ontario. Immediate evacuation required.',
      time: '13:45',
      location: 'Northern Ontario',
      isNew: false
    },
    {
      id: 'alert-2',
      severity: 'warning',
      title: 'Traffic Congestion',
      message: 'Heavy traffic on Highway 401 due to evacuation. Seek alternative routes.',
      time: '13:30',
      location: 'Highway 401',
      isNew: true
    },
    {
      id: 'alert-3',
      severity: 'critical',
      title: 'Hazardous Area',
      message: 'New danger zone identified in Vaughan. Please avoid the area.',
      time: '14:05',
      location: 'Vaughan',
      isNew: true
    },
    {
    id: 'alert-4', 
    severity: 'warning',
    title: 'Traffic Congestion',
    message: 'Heavy traffic on Highway 141 due to evacuation. Seek an alternative route.',
    time: '18:30',
    location: 'Highway 141',
      isNew: false
    }
  ],
  videoFeeds: [
    {
      id: 'video-1',
      type: 'drone',
      source: droneVideo,
      location: 'Northern Ontario Wildfire Zone',
      hasAlert: true,
      relatedFeeds: [] // Empty related feeds
    }
  ]
};

// Function to update existing route or generate a new one related to a danger zone
const updateEvacuationRoute = (routes: EvacuationRouteType[], index: number, dangerZones: DangerZoneType[]): EvacuationRouteType => {
  // If there are no danger zones, use the old method
  if (dangerZones.length === 0) {
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
  }
  
  // 20% chance to generate a completely new route from a random danger zone
  if (Math.random() < 0.2) {
    const randomZoneIndex = Math.floor(Math.random() * dangerZones.length);
    return generateEvacuationRouteFromDangerZone(dangerZones[randomZoneIndex], routes[index].id);
  }
  
  // Otherwise just update the status
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

// Function to create slightly different data to simulate real-time updates
const getUpdatedData = (): MapDataType => {
  // Deep copy the initialData to avoid modifying it
  const data: MapDataType = JSON.parse(JSON.stringify(initialData));
  
  // Update responder positions
  data.responders.forEach(responder => {
    responder.position.latitude += (Math.random() - 0.5) * 0.01;
    responder.position.longitude += (Math.random() - 0.5) * 0.01;
  });
  
  // Sometimes add a new responder (30% chance)
  if (Math.random() > 0.7) {
    const newResponderTypes: Array<'drone' | 'police' | 'fire' | 'medical'> = ['drone', 'police', 'fire', 'medical'];
    const newResponderType = newResponderTypes[Math.floor(Math.random() * newResponderTypes.length)];
    
    const location = ontarioCities[Math.floor(Math.random() * ontarioCities.length)];
    
    data.responders.push({
      id: `resp-${Math.floor(Math.random() * 1000)}`,
      name: `${newResponderType.charAt(0).toUpperCase() + newResponderType.slice(1)} Unit ${Math.floor(Math.random() * 100)}`,
      type: newResponderType,
      status: Math.random() > 0.5 ? 'active' : 'en-route',
      position: {
        latitude: location.lat + (Math.random() - 0.5) * 0.05,
        longitude: location.lng + (Math.random() - 0.5) * 0.05,
        locationName: location.name
      }
    });
  }
  
  // Sometimes remove a responder (10% chance, if we have more than 3 responders)
  if (Math.random() > 0.9 && data.responders.length > 3) {
    const indexToRemove = Math.floor(Math.random() * data.responders.length);
    data.responders.splice(indexToRemove, 1);
  }
  
  // Sometimes update danger zone shape (20% chance)
  if (Math.random() > 0.8) {
    data.dangerZones.forEach(zone => {
      zone.geometry.coordinates[0].forEach((coord, index) => {
        if (index > 0 && index < zone.geometry.coordinates[0].length - 1) {
          coord[0] += (Math.random() - 0.5) * 0.02;
          coord[1] += (Math.random() - 0.5) * 0.02;
        }
      });
    });
  }
  
  // Sometimes add a new danger zone (15% chance, max 8 zones)
  if (Math.random() > 0.85 && data.dangerZones.length < 8) {
    const randomCityIndex = Math.floor(Math.random() * ontarioCities.length);
    const newZone = generateDangerZone(randomCityIndex, `zone-${Math.floor(Math.random() * 1000)}`);
    data.dangerZones.push(newZone);
    
    // Add an evacuation route for this new danger zone
    data.evacuationRoutes.push(generateEvacuationRouteFromDangerZone(newZone, `route-${Math.floor(Math.random() * 1000)}`));
    
    // Add an alert about the new danger zone
    data.alerts.unshift({
      id: `alert-${Math.floor(Math.random() * 1000)}`,
      severity: 'critical',
      title: 'New Danger Zone',
      message: `New danger zone identified near ${ontarioCities[randomCityIndex].name}. Please avoid the area.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: ontarioCities[randomCityIndex].name,
      isNew: true
    });
  }
  
  // Sometimes remove a danger zone (10% chance, if we have more than 4)
  if (Math.random() > 0.9 && data.dangerZones.length > 4) {
    const indexToRemove = Math.floor(Math.random() * data.dangerZones.length);
    const removedZone = data.dangerZones[indexToRemove];
    data.dangerZones.splice(indexToRemove, 1);
    
    // Also remove routes associated with this zone
    // In real life, we would have a direct relationship between routes and zones
    // But here we'll use a heuristic - remove routes that start near the removed zone
    const routesToKeep = data.evacuationRoutes.filter(route => {
      const startPointCity = ontarioCities.find(city => city.name === route.startPoint);
      if (!startPointCity) return true; // Keep if we can't find the city
      
      // Calculate distance from route start to danger zone
      const zoneCoord = removedZone.geometry.coordinates[0][0];
      const distance = Math.sqrt(
        Math.pow(startPointCity.lat - zoneCoord[1], 2) + 
        Math.pow(startPointCity.lng - zoneCoord[0], 2)
      );
      
      // If the route starts far from the removed zone, keep it
      return distance > 0.2; // 0.2 degrees is roughly 22km
    });
    
    // Replace routes with the filtered list
    data.evacuationRoutes = routesToKeep;
  }
  
  // Update evacuation routes
  // 30% chance to update a random route
  if (Math.random() < 0.3 && data.evacuationRoutes.length > 0) {
    const routeIndex = Math.floor(Math.random() * data.evacuationRoutes.length);
    data.evacuationRoutes[routeIndex] = updateEvacuationRoute(data.evacuationRoutes, routeIndex, data.dangerZones);
  }
  
  // 10% chance to add a completely new route from a danger zone (if we have less than 12 routes)
  if (Math.random() < 0.1 && data.evacuationRoutes.length < 12 && data.dangerZones.length > 0) {
    const randomZoneIndex = Math.floor(Math.random() * data.dangerZones.length);
    const newRoute = generateEvacuationRouteFromDangerZone(
      data.dangerZones[randomZoneIndex],
      `route-${Math.floor(Math.random() * 1000)}`
    );
    
    data.evacuationRoutes.push(newRoute);
    
    // Add an alert about the new evacuation route
    data.alerts.unshift({
      id: `alert-${Math.floor(Math.random() * 1000)}`,
      severity: 'info',
      title: 'New Evacuation Route',
      message: `New evacuation route established from ${newRoute.startPoint} to ${newRoute.endPoint}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: `${newRoute.startPoint}-${newRoute.endPoint}`,
      isNew: true
    });
  }
  
  // Sometimes remove a route (10% chance, if we have more than 4)
  if (Math.random() > 0.9 && data.evacuationRoutes.length > 4) {
    const indexToRemove = Math.floor(Math.random() * data.evacuationRoutes.length);
    data.evacuationRoutes.splice(indexToRemove, 1);
  }
  
  // Sometimes add a new alert
  if (Math.random() > 0.7) {
    const alertSeverities: Array<'critical' | 'warning' | 'info'> = ['critical', 'warning', 'info'];
    const newSeverity = alertSeverities[Math.floor(Math.random() * alertSeverities.length)];
    
    // Ontario-specific alert templates
    const alertTemplates = {
      critical: {
        title: 'Critical Alert',
        messages: [
          'New fire spot detected in Northern Ontario. Immediate evacuation required.',
          'Highway 401 section closed due to incident. Seek alternate routes.',
          'Flash flood warning issued for Eastern Ontario. Move to higher ground.'
        ]
      },
      warning: {
        title: 'Warning Alert',
        messages: [
          'Wind direction changing in Muskoka region. Fire spread possible.',
          'Traffic congestion intensifying on Highway 400.',
          'Medical resources limited in Northwestern Ontario.'
        ]
      },
      info: {
        title: 'Information Update',
        messages: [
          'New evacuation center opened at Toronto Convention Centre.',
          'Drone surveillance expanded to Ottawa Valley region.',
          'Weather forecast predicts rain in Northern Ontario in 6 hours.'
        ]
      }
    };
    
    const location = ontarioCities[Math.floor(Math.random() * ontarioCities.length)].name;
    
    data.alerts.unshift({
      id: `alert-${Math.floor(Math.random() * 1000)}`,
      severity: newSeverity,
      title: alertTemplates[newSeverity].title,
      message: alertTemplates[newSeverity].messages[Math.floor(Math.random() * alertTemplates[newSeverity].messages.length)],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: location,
      isNew: true
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
