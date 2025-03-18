
import { MapDataType } from '@/types/emergency';

// Sample images for development - in production these would be actual video feeds
const sampleImages = [
  'https://images.unsplash.com/photo-1601791074012-d4e0ee30d77a?q=80&w=2070',
  'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?q=80&w=2070',
  'https://images.unsplash.com/photo-1493674860190-0ca468d6d60a?q=80&w=2070',
  'https://images.unsplash.com/photo-1598021503475-7c8b556dde56?q=80&w=2070',
  'https://images.unsplash.com/photo-1625718645313-d2401a97cedd?q=80&w=2070',
];

// Initial data state
const initialData: MapDataType = {
  responders: [
    {
      id: 'resp-1',
      name: 'Drone 1',
      type: 'drone',
      status: 'active',
      position: {
        latitude: 36.778259,
        longitude: -119.417931,
        locationName: 'North Valley'
      }
    },
    {
      id: 'resp-2',
      name: 'Fire Squad A',
      type: 'fire',
      status: 'en-route',
      position: {
        latitude: 36.738259,
        longitude: -119.497931,
        locationName: 'Eastern Hills'
      }
    },
    {
      id: 'resp-3',
      name: 'Ambulance 35',
      type: 'medical',
      status: 'active',
      position: {
        latitude: 36.808259,
        longitude: -119.447931,
        locationName: 'Highway 99'
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
          [-119.6, 36.88],
          [-119.7, 36.88],
          [-119.7, 36.98],
          [-119.6, 36.98],
          [-119.6, 36.88],
        ]]
      }
    }
  ],
  evacuationRoutes: [
    {
      id: 'route-1',
      startPoint: 'Northridge',
      endPoint: 'Southdale',
      status: 'open',
      estimatedTime: 25,
      transportMethods: ['car', 'emergency'],
      geometry: {
        type: 'LineString',
        coordinates: [
          [-119.5, 36.83],
          [-119.45, 36.73],
          [-119.4, 36.7],
        ]
      }
    },
    {
      id: 'route-2',
      startPoint: 'Westfield',
      endPoint: 'Downtown',
      status: 'congested',
      estimatedTime: 40,
      transportMethods: ['car', 'foot'],
      geometry: {
        type: 'LineString',
        coordinates: [
          [-119.6, 36.75],
          [-119.55, 36.75],
          [-119.5, 36.7],
        ]
      }
    }
  ],
  alerts: [
    {
      id: 'alert-1',
      severity: 'critical',
      title: 'Wildfire Alert',
      message: 'Active wildfire detected in North Valley. Immediate evacuation required.',
      time: '13:45',
      location: 'North Valley',
      isNew: false
    },
    {
      id: 'alert-2',
      severity: 'warning',
      title: 'Traffic Congestion',
      message: 'Heavy traffic on Highway 41 due to evacuation. Seek alternative routes.',
      time: '13:30',
      location: 'Highway 41',
      isNew: false
    }
  ],
  videoFeeds: [
    {
      id: 'video-1',
      type: 'drone',
      source: sampleImages[0],
      location: 'North Valley Wildfire Zone',
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
          location: 'Highway 41 Evacuation'
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
    
    data.responders.push({
      id: `resp-${Math.floor(Math.random() * 1000)}`,
      name: `${newResponderType.charAt(0).toUpperCase() + newResponderType.slice(1)} Unit ${Math.floor(Math.random() * 100)}`,
      type: newResponderType,
      status: Math.random() > 0.5 ? 'active' : 'en-route',
      position: {
        latitude: 36.778259 + (Math.random() - 0.5) * 0.1,
        longitude: -119.417931 + (Math.random() - 0.5) * 0.1,
        locationName: 'New Deployment Area'
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
    
    const alertTemplates = {
      critical: {
        title: 'Critical Alert',
        messages: [
          'New fire spot detected. Immediate evacuation required.',
          'Road collapse reported. Avoid area immediately.',
          'Flash flood warning issued. Move to higher ground.'
        ]
      },
      warning: {
        title: 'Warning Alert',
        messages: [
          'Wind direction changing. Fire spread possible.',
          'Traffic congestion intensifying on evacuation route.',
          'Medical resources limited in northeastern sector.'
        ]
      },
      info: {
        title: 'Information Update',
        messages: [
          'New evacuation center opened at Community College.',
          'Drone surveillance expanded to southwest region.',
          'Weather forecast predicts rain in 6 hours.'
        ]
      }
    };
    
    data.alerts.unshift({
      id: `alert-${Math.floor(Math.random() * 1000)}`,
      severity: newSeverity,
      title: alertTemplates[newSeverity].title,
      message: alertTemplates[newSeverity].messages[Math.floor(Math.random() * alertTemplates[newSeverity].messages.length)],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: ['North Valley', 'South County', 'Eastern Hills', 'Western Forest'][Math.floor(Math.random() * 4)],
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
