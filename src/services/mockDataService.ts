import { MapDataType, EvacuationRouteType } from '@/types/emergency';

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

// Function to generate a random route between two cities
const generateRoute = (startCityIndex: number, endCityIndex: number, id: string): EvacuationRouteType => {
  const startCity = ontarioCities[startCityIndex];
  const endCity = ontarioCities[endCityIndex];
  
  // Generate a route with a midpoint to make it look more realistic
  const midpointLat = (startCity.lat + endCity.lat) / 2 + (Math.random() - 0.5) * 0.5;
  const midpointLng = (startCity.lng + endCity.lng) / 2 + (Math.random() - 0.5) * 0.5;
  
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
      coordinates: [
        [startCity.lng, startCity.lat],
        [midpointLng, midpointLat],
        [endCity.lng, endCity.lat]
      ]
    }
  };
};

// Generate initial evacuation routes
const generateInitialRoutes = (count: number = 5): EvacuationRouteType[] => {
  const routes: EvacuationRouteType[] = [];
  const addedPairs = new Set<string>(); // Track city pairs to avoid duplicates
  
  while (routes.length < count) {
    const startIndex = Math.floor(Math.random() * ontarioCities.length);
    let endIndex = Math.floor(Math.random() * ontarioCities.length);
    
    // Make sure start and end cities are different
    while (endIndex === startIndex) {
      endIndex = Math.floor(Math.random() * ontarioCities.length);
    }
    
    // Check if this pair already exists (in either direction)
    const pairKey = `${startIndex}-${endIndex}`;
    const reversePairKey = `${endIndex}-${startIndex}`;
    
    if (!addedPairs.has(pairKey) && !addedPairs.has(reversePairKey)) {
      routes.push(generateRoute(startIndex, endIndex, `route-${routes.length + 1}`));
      addedPairs.add(pairKey);
    }
  }
  
  return routes;
};

// Initial data state - updated for Ontario, Canada
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
  dangerZones: [
    {
      id: 'zone-1',
      type: 'wildfire',
      riskLevel: 'high',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-80.2, 45.5],
          [-80.3, 45.5],
          [-80.3, 45.6],
          [-80.2, 45.6],
          [-80.2, 45.5],
        ]]
      }
    },
    {
      id: 'zone-2',
      type: 'wildfire',
      riskLevel: 'high',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-79.58, 43.83],
          [-79.59, 43.83],
          [-79.59, 43.84],
          [-79.58, 43.84],
          [-79.58, 43.83],
        ]]
      }
    }
  ],
  evacuationRoutes: generateInitialRoutes(5),
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

// Function to update existing route or generate a new one
const updateEvacuationRoute = (routes: EvacuationRouteType[], index: number): EvacuationRouteType => {
  // 20% chance to generate a completely new route
  if (Math.random() < 0.2) {
    const startIndex = Math.floor(Math.random() * ontarioCities.length);
    let endIndex = Math.floor(Math.random() * ontarioCities.length);
    
    while (endIndex === startIndex) {
      endIndex = Math.floor(Math.random() * ontarioCities.length);
    }
    
    return generateRoute(startIndex, endIndex, routes[index].id);
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
  
  // Sometimes add a new responder
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
  
  // Sometimes update danger zone
  if (Math.random() > 0.8) {
    data.dangerZones[0].geometry.coordinates[0].forEach((coord, index) => {
      if (index > 0 && index < data.dangerZones[0].geometry.coordinates[0].length - 1) {
        coord[0] += (Math.random() - 0.5) * 0.02;
        coord[1] += (Math.random() - 0.5) * 0.02;
      }
    });
  }
  
  // Update evacuation routes
  // 30% chance to update a random route
  if (Math.random() < 0.3 && data.evacuationRoutes.length > 0) {
    const routeIndex = Math.floor(Math.random() * data.evacuationRoutes.length);
    data.evacuationRoutes[routeIndex] = updateEvacuationRoute(data.evacuationRoutes, routeIndex);
  }
  
  // 10% chance to add a completely new route (if we have less than 8 routes)
  if (Math.random() < 0.1 && data.evacuationRoutes.length < 8) {
    const startIndex = Math.floor(Math.random() * ontarioCities.length);
    let endIndex = Math.floor(Math.random() * ontarioCities.length);
    
    while (endIndex === startIndex) {
      endIndex = Math.floor(Math.random() * ontarioCities.length);
    }
    
    const newRoute = generateRoute(
      startIndex,
      endIndex,
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
