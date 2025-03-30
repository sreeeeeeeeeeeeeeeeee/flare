
import { MistissiniRegion } from '@/types/emergency';

// Mistissini, Quebec coordinates and nearby locations
export const mistissiniLocation: MistissiniRegion = {
  center: { lat: 50.4221, lng: -73.8683 },
  name: 'Mistissini',
  description: 'Cree community in northern Quebec, located at the southeastern end of Mistassini Lake'
};

// Nearby areas and points of interest around Mistissini
export const mistissiniRegions: MistissiniRegion[] = [
  {
    center: { lat: 50.4221, lng: -73.8683 },
    name: 'Mistissini',
    description: 'Main community center'
  },
  {
    center: { lat: 50.4107, lng: -73.8462 },
    name: 'Lake Mistassini',
    description: 'Largest natural lake in Quebec'
  },
  {
    center: { lat: 50.4539, lng: -73.8752 },
    name: 'Northern Forest Area',
    description: 'Dense boreal forest north of Mistissini'
  },
  {
    center: { lat: 50.3932, lng: -73.8935 },
    name: 'Southern Mistissini',
    description: 'Southern residential area'
  },
  {
    center: { lat: 50.4015, lng: -73.9284 },
    name: 'Western Shore',
    description: 'Western shoreline of Mistassini Lake'
  },
  {
    center: { lat: 51.0379, lng: -73.7892 },
    name: 'Chibougamau',
    description: 'Nearby town approximately 65km north'
  },
  {
    center: { lat: 50.2854, lng: -74.2193 },
    name: 'Route du Nord',
    description: 'Important regional road'
  }
];

// Forest regions around Mistissini
export const mistissiniForestRegions = [
  'Mistissini Boreal Forest',
  'Lake Mistassini Shoreline Forest',
  'Northern Quebec Taiga',
  'James Bay Lowland Forest',
  'Cree Traditional Territory Forest',
  'Mistissini Protected Forest Area',
  'Quebec Central Boreal Forest'
];

// Define evacuation centers/destinations
export const evacuationDestinations = [
  {
    name: 'Chibougamau',
    lat: 51.0379,
    lng: -73.7892,
    description: 'Nearest major town with hospital facilities'
  },
  {
    name: 'Oujé-Bougoumou',
    lat: 50.5276,
    lng: -74.0452,
    description: 'Nearby Cree community'
  },
  {
    name: 'Community Center',
    lat: 50.4232,
    lng: -73.8675,
    description: 'Main emergency shelter in Mistissini'
  },
  {
    name: 'Waswanipi',
    lat: 49.7569,
    lng: -75.9664,
    description: 'Cree community to the southwest'
  }
];

// Main highways and roads in the Mistissini area
export const mistissiniHighways = [
  {
    name: "Route 167",
    description: "Main highway connecting Mistissini to Chibougamau",
    path: [
      // Mistissini to Chibougamau
      [50.4221, -73.8683], // Mistissini start
      [50.4780, -73.8521], 
      [50.5402, -73.8390],
      [50.6104, -73.8324],
      [50.6797, -73.8201],
      [50.7521, -73.8102],
      [50.8234, -73.8044],
      [50.9067, -73.7978],
      [50.9812, -73.7902],
      [51.0379, -73.7892]  // Chibougamau end
    ]
  },
  {
    name: "Route du Nord",
    description: "Road connecting Mistissini to western communities",
    path: [
      // Mistissini to Route du Nord junction
      [50.4221, -73.8683], // Mistissini start
      [50.4015, -73.9284],
      [50.3824, -73.9876],
      [50.3612, -74.0487],
      [50.3425, -74.1102],
      [50.2854, -74.2193]  // Route du Nord point
    ]
  },
  {
    name: "Oujé-Bougoumou Road",
    description: "Road connecting to Oujé-Bougoumou",
    path: [
      // From Route 167 to Oujé-Bougoumou
      [50.6104, -73.8324], // Junction point on Route 167
      [50.5981, -73.8762],
      [50.5823, -73.9214],
      [50.5692, -73.9657],
      [50.5534, -74.0102],
      [50.5276, -74.0452]  // Oujé-Bougoumou
    ]
  },
  {
    name: "Waswanipi Route",
    description: "Long route to Waswanipi",
    path: [
      // From Route du Nord junction toward Waswanipi
      [50.2854, -74.2193], // Route du Nord point
      [50.2432, -74.3215],
      [50.2011, -74.4542],
      [50.1587, -74.5876],
      [50.1102, -74.7231],
      [50.0619, -74.8543],
      [50.0121, -74.9876],
      [49.9534, -75.1231],
      [49.8967, -75.2654],
      [49.8342, -75.4121],
      [49.7923, -75.5654],
      [49.7735, -75.7234],
      [49.7653, -75.8543],
      [49.7569, -75.9664]  // Waswanipi
    ]
  },
  {
    name: "Lake Mistassini Shore Road",
    description: "Road along the lake shore",
    path: [
      // Mistissini along the lake shore
      [50.4221, -73.8683], // Mistissini start
      [50.4189, -73.8572],
      [50.4154, -73.8492],
      [50.4107, -73.8462], // Lake Mistassini point
      [50.4062, -73.8423],
      [50.4015, -73.8375]
    ]
  }
];
