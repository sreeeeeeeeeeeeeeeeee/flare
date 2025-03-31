import { MapDataType, EvacuationRouteType, DangerZoneType } from '@/types/emergency';
import { mistissiniLocation, mistissiniRegions, mistissiniForestRegions, evacuationDestinations, mistissiniHighways, mistissiniStreets } from './mistissiniData';

// Updated YouTube video link
const droneVideo = 'http://youtu.be/WHBClgDSPd0';

// GraphHopper API key
const GRAPHHOPPER_API_KEY = "5adb1e1c-29a2-4293-81c1-1c81779679bb";

// Global persistent cache for evacuation routes
const globalEvacuationRouteCache = {};

// Generate a much smaller forest fire zone around Mistissini
const generateForestFireZone = (nearRegion: number, id: string): DangerZoneType => {
  const region = mistissiniRegions[nearRegion];
  const riskLevels: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
  
  // Create a smaller irregular polygon around the region
  // Further reduced radius to make the danger zones highly focused
  const radius = 0.002 + Math.random() * 0.004; // Even smaller radius between 0.002 and 0.006 degrees
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

// Function to generate initial forest fire zones around Mistissini - now with even smaller zones
const generateInitialForestFireZones = (count: number = 3): DangerZoneType[] => {
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

// IMPROVED: Generate evacuation routes that follow actual Mistissini streets
const generateStreetEvacuationRoutes = (): EvacuationRouteType[] => {
  const routes: EvacuationRouteType[] = [];
  
  // Use specific streets for evacuation
  const streetsToUse = [
    "Main Street",
    "Lakeshore Drive"
  ];
  
  // Create evacuation routes for each selected street with precise start/end points
  streetsToUse.forEach((streetName, index) => {
    const street = mistissiniStreets.find(s => s.name === streetName);
    
    if (street) {
      // Use named locations for start/end points
      let startPoint, endPoint;
      
      if (street.name === "Main Street") {
        startPoint = "Eastern Mistissini";
        endPoint = "Western Mistissini";
      } else if (street.name === "Lakeshore Drive") {
        startPoint = "Lake Shore";
        endPoint = "Eastern Mistissini";
      } else {
        startPoint = `${street.name} Start`;
        endPoint = `${street.name} End`;
      }
      
      // Use the street's path with proper GeoJSON formatting
      // Convert path coordinates to the format expected by GeoJSON (lng, lat)
      const coordinates = street.path.map(point => [point[1], point[0]]);
      
      routes.push({
        id: `route-street-${index + 1}`,
        startPoint,
        endPoint,
        status: Math.random() > 0.7 ? "congested" : "open",
        estimatedTime: 5 + Math.floor(Math.random() * 10), // 5-15 minutes
        transportMethods: ['car', 'emergency', 'foot'],
        routeName: street.name,
        geometry: {
          type: 'LineString',
          coordinates
        }
      });
    }
  });
  
  return routes;
};

// IMPROVED: Generate highway evacuation route with stable path
const generateHighwayEvacuationRoutes = (): EvacuationRouteType[] => {
  const routes: EvacuationRouteType[] = [];
  
  // Use the main highway to Chibougamau
  const mainHighway = mistissiniHighways.find(hw => hw.name.includes("Chibougamau"));
  
  if (mainHighway) {
    // Convert path coordinates to GeoJSON format (lng, lat)
    const coordinates = mainHighway.path.map(point => [point[1], point[0]]);
    
    routes.push({
      id: `route-highway-1`,
      startPoint: "Mistissini",
      endPoint: "Chibougamau",
      status: "open", // Make the main evacuation highway always open
      estimatedTime: 35, // Fixed time for stability
      transportMethods: ['car', 'emergency'],
      routeName: mainHighway.name,
      geometry: {
        type: 'LineString',
        coordinates
      }
    });
  }
  
  return routes;
};

// Create drone responders positioned near danger zones
const generateDroneResponders = (dangerZones: DangerZoneType[]) => {
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

// Generate initial danger zones focused on Mistissini
const initialDangerZones = generateInitialForestFireZones(3);
const initialDrones = generateDroneResponders(initialDangerZones);

// IMPROVED: Combine street and highway evacuation routes with stable paths
const allEvacuationRoutes = [
  ...generateStreetEvacuationRoutes(),
  ...generateHighwayEvacuationRoutes()
];

// Initial data state focused on Mistissini
const initialData: MapDataType = {
  responders: [
    ...initialDrones,
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
  ],
  dangerZones: initialDangerZones,
  evacuationRoutes: allEvacuationRoutes,
  alerts: [
    {
      id: 'alert-1',
      severity: 'critical',
      title: 'Forest Fire Alert',
      message: 'Active forest fire detected near Main Street. Immediate evacuation required via Saint John Street.',
      time: '13:45',
      location: 'Northern Mistissini',
      isNew: false,
      visibility: 'all'
    },
    {
      id: 'alert-2',
      severity: 'warning',
      title: 'Drone Deployment',
      message: 'Surveillance drones deployed to monitor forest fire perimeters around Mistissini.',
      time: '13:30',
      location: 'Mistissini Region',
      isNew: true,
      visibility: 'admin'
    },
    {
      id: 'alert-3',
      severity: 'critical',
      title: 'New Forest Fire',
      message: 'New forest fire identified near Northern Boulevard. Route 167 remains open for evacuation.',
      time: '14:05',
      location: 'Eastern Shore',
      isNew: true,
      visibility: 'all'
    },
    {
      id: 'alert-4', 
      severity: 'warning',
      title: 'Smoke Conditions',
      message: 'Poor visibility on Saint John Street due to smoke. Use Lakeshore Drive as alternative.',
      time: '18:30',
      location: 'Mistissini',
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
      relatedFeeds: []
    }
  ]
};

// IMPROVED: Make evacuation route status updates extremely rare (only 5% chance)
const updateEvacuationRouteStatus = (routes: EvacuationRouteType[], index: number): EvacuationRouteType => {
  // Only a 5% chance of changing status to maintain stability
  if (Math.random() > 0.95) {
    const updatedRoute = { ...routes[index] };
    
    // For highway routes, keep them mostly open for evacuation
    if (updatedRoute.routeName?.includes("Chibougamau")) {
      updatedRoute.status = Math.random() > 0.9 ? "congested" : "open";
    } else {
      const statusOptions: Array<'open' | 'congested' | 'closed'> = ['open', 'congested', 'closed'];
      updatedRoute.status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    }
    
    // Very rarely update the estimated time as well but with smaller changes
    if (Math.random() > 0.9) {
      const currentTime = updatedRoute.estimatedTime || 10;
      const adjustment = Math.round((Math.random() - 0.5) * 3); // +/- 3 minutes max
      updatedRoute.estimatedTime = Math.max(5, currentTime + adjustment); // Ensure at least 5 minutes
    }
    
    return updatedRoute;
  }
  
  // Most of the time, return the unchanged route
  return routes[index];
};

// Function to create slightly different data to simulate real-time updates for Mistissini
const getUpdatedData = (): MapDataType => {
  // Deep copy the initialData to avoid modifying it
  const data: MapDataType = JSON.parse(JSON.stringify(initialData));
  
  // Update responder positions
  data.responders.forEach(responder => {
    if (responder.type === 'drone') {
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
      
      const zoneCoord = closestZone.geometry.coordinates[0][0];
      const targetLat = zoneCoord[1] + (Math.random() - 0.5) * 0.005;
      const targetLng = zoneCoord[0] + (Math.random() - 0.5) * 0.005;
      
      const moveSpeed = 0.001 + Math.random() * 0.002;
      const latDiff = targetLat - responder.position.latitude;
      const lngDiff = targetLng - responder.position.longitude;
      
      responder.position.latitude += latDiff * moveSpeed;
      responder.position.longitude += lngDiff * moveSpeed;
    } else {
      responder.position.latitude += (Math.random() - 0.5) * 0.002;
      responder.position.longitude += (Math.random() - 0.5) * 0.002;
    }
  });

  // Rare responder addition (only 10% chance)
  if (Math.random() > 0.9) {
    const newResponderTypes: Array<'drone' | 'police' | 'fire' | 'medical'> = ['drone', 'police', 'fire', 'medical'];
    const newResponderType = newResponderTypes[Math.floor(Math.random() * newResponderTypes.length)];
    
    const regionIndex = Math.floor(Math.random() * mistissiniRegions.length);
    const location = mistissiniRegions[regionIndex];
    
    data.responders.push({
      id: `resp-${Math.floor(Math.random() * 1000)}`,
      name: `${newResponderType.charAt(0).toUpperCase() + newResponderType.slice(1)} Unit ${Math.floor(Math.random() * 100)}`,
      type: newResponderType,
      status: Math.random() > 0.5 ? 'active' : 'en-route',
      position: {
        latitude: location.center.lat + (Math.random() - 0.5) * 0.005,
        longitude: location.center.lng + (Math.random() - 0.5) * 0.005,
        locationName: location.name
      }
    });
  }
  
  // Rare responder removal (only 2% chance and only if we have enough)
  if (Math.random() > 0.98 && data.responders.length > 6) {
    const indexToRemove = Math.floor(Math.random() * data.responders.length);
    data.responders.splice(indexToRemove, 1);
  }
  
  // Make route updates extremely rare (only 2% chance)
  if (Math.random() < 0.02 && data.evacuationRoutes.length > 0) {
    const routeIndex = Math.floor(Math.random() * data.evacuationRoutes.length);
    data.evacuationRoutes[routeIndex] = updateEvacuationRouteStatus(data.evacuationRoutes, routeIndex);
  }
  
  // Keep existing alerts code but slightly lower frequency (only 15% chance)
  if (Math.random() > 0.85) {
    const alertSeverities: Array<'critical' | 'warning' | 'info'> = ['critical', 'warning', 'info'];
    const newSeverity = alertSeverities[Math.floor(Math.random() * alertSeverities.length)];
    const visibilityOptions: Array<'public' | 'admin' | 'all'> = ['public', 'admin', 'all'];
    const visibility = visibilityOptions[Math.floor(Math.random() * visibilityOptions.length)];
    
    const streetRoutes = data.evacuationRoutes.filter(route => 
      !route.routeName?.includes("Route") && !route.routeName?.includes("Road to")
    );
    const randomRoute = streetRoutes[Math.floor(Math.random() * streetRoutes.length)];
    const streetName = randomRoute?.routeName || "Main Street";
    
    const alertTemplates = {
      critical: {
        title: 'Street Closure Alert',
        messages: [
          `${streetName} is now closed due to fire. Use alternate routes.`,
          `Evacuation required immediately from ${streetName} area.`,
          `Fire has reached ${streetName}. All residents must evacuate now.`
        ]
      },
      warning: {
        title: 'Street Congestion Warning',
        messages: [
          `Heavy traffic on ${streetName}. Expect delays during evacuation.`,
          `Smoke reducing visibility on ${streetName}. Proceed with caution.`,
          `${streetName} experiencing congestion. Consider alternative routes.`
        ]
      },
      info: {
        title: 'Street Update',
        messages: [
          `${streetName} remains open for evacuation.`,
          `Emergency services stationed along ${streetName} to assist evacuation.`,
          `${streetName} has been designated as priority evacuation route.`
        ]
      }
    };
    
    data.alerts.unshift({
      id: `alert-${Math.floor(Math.random() * 1000)}`,
      severity: newSeverity,
      title: alertTemplates[newSeverity].title,
      message: alertTemplates[newSeverity].messages[Math.floor(Math.random() * alertTemplates[newSeverity].messages.length)],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: 'Mistissini',
      isNew: true,
      visibility: visibility
    });
  }
  
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
