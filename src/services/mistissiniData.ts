
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
