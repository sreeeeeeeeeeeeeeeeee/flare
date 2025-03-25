
import { MapDataType } from '@/types/emergency';

// Sample images for development - in production these would be actual video feeds
const sampleImages = [
  'https://images.unsplash.com/photo-1601791074012-d4e0ee30d77a?q=80&w=2070',
  'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?q=80&w=2070',
  'https://images.unsplash.com/photo-1493674860190-0ca468d6d60a?q=80&w=2070',
  'https://images.unsplash.com/photo-1598021503475-7c8b556dde56?q=80&w=2070',
  'https://images.unsplash.com/photo-1625718645313-d2401a97cedd?q=80&w=2070',
];

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
  evacuationRoutes: [
    {
      id: 'route-1',
      startPoint: 'Sudbury',
      endPoint: 'North Bay',
      status: 'open',
      estimatedTime: 85,
      transportMethods: ['car', 'emergency'],
      geometry: {
        type: 'LineString',
        coordinates: [
          [-80.99, 46.49],
          [-81.10, 46.30],
          [-79.46, 46.30],
        ]
      }
    },
    {
      id: 'route-2',
      startPoint: 'Thunder Bay',
      endPoint: 'Dryden',
      status: 'congested',
      estimatedTime: 180,
      transportMethods: ['car', 'foot'],
      geometry: {
        type: 'LineString',
        coordinates: [
          [-89.25, 48.38],
          [-90.21, 48.77],
          [-92.84, 49.78],
        ]
      }
    }
  ],
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
      isNew: false
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
    id: 'alert 4', 
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
      source: sampleImages[0],
      location: 'Northern Ontario Wildfire Zone',
      hasAlert: true,
      relatedFeeds: [
        {
          id: 'video-1-1',
          source: sampleImages[1],
          location: 'Eastern Edge of Fire'
        },
        {
          id: 'video-1-2',
          source: sampleImages[2],
          location: 'Highway 11 Evacuation'
        }
      ]
    }
  ]
};

// Function to create slightly different data to simulate real-time updates
const getUpdatedData = (): MapDataType => {
  // Deep copy the initialData to avoid modifying it
  const data: MapDataType = JSON.parse(JSON.stringify(initialData));
  
  // Randomly modify some values to simulate real-time changes
  
  // Update responder positions
  data.responders.forEach(responder => {
    responder.position.latitude += (Math.random() - 0.5) * 0.01;
    responder.position.longitude += (Math.random() - 0.5) * 0.01;
  });
  
  // Sometimes add a new responder
  if (Math.random() > 0.7) {
    const newResponderTypes: Array<'drone' | 'police' | 'fire' | 'medical'> = ['drone', 'police', 'fire', 'medical'];
    const newResponderType = newResponderTypes[Math.floor(Math.random() * newResponderTypes.length)];
    
    // Ontario locations
    const ontarioLocations = [
      { name: 'Ottawa', lat: 45.4215, lng: -75.6972 },
      { name: 'Hamilton', lat: 43.2557, lng: -79.8711 },
      { name: 'London', lat: 42.9849, lng: -81.2453 },
      { name: 'Kingston', lat: 44.2312, lng: -76.4860 },
      { name: 'Windsor', lat: 42.3149, lng: -83.0364 }
    ];
    
    const location = ontarioLocations[Math.floor(Math.random() * ontarioLocations.length)];
    
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
  
  // Sometimes update evacuation route status
  if (Math.random() > 0.7) {
    const routeStatuses: Array<'open' | 'congested' | 'closed'> = ['open', 'congested', 'closed'];
    data.evacuationRoutes[Math.floor(Math.random() * data.evacuationRoutes.length)].status = 
      routeStatuses[Math.floor(Math.random() * routeStatuses.length)];
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
    
    // Ontario locations
    const ontarioLocations = ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Windsor', 'Kingston', 'Sudbury', 'Thunder Bay'];
    
    data.alerts.unshift({
      id: `alert-${Math.floor(Math.random() * 1000)}`,
      severity: newSeverity,
      title: alertTemplates[newSeverity].title,
      message: alertTemplates[newSeverity].messages[Math.floor(Math.random() * alertTemplates[newSeverity].messages.length)],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: ontarioLocations[Math.floor(Math.random() * ontarioLocations.length)],
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
