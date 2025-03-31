
import { MapDataType } from '@/types/emergency';
import { generateInitialData } from './generators/initialDataGenerator';
import { generateUpdatedData } from './generators/updatedDataGenerator';

// Create and cache initial data instance with fixed evacuation routes
const initialData = generateInitialData();

// Define the fixed evacuation routes with consistent statuses
const fixedEvacuationRoutes = [
  {
    id: 'route-1',
    type: 'street' as const,
    status: 'open' as const,
    startPoint: 'Mistissini Center',
    endPoint: 'Eastern Mistissini',
    estimatedTime: 5,
    transportMethods: ['car', 'emergency'] as Array<'car' | 'foot' | 'emergency'>,
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [-73.8760, 50.4215],
        [-73.8730, 50.4220],
        [-73.8700, 50.4225],
        [-73.8670, 50.4230],
        [-73.8640, 50.4235],
        [-73.8610, 50.4240]
      ]
    }
  },
  {
    id: 'route-2',
    type: 'street' as const,
    status: 'congested' as const,
    startPoint: 'Northern Mistissini',
    endPoint: 'Southern Mistissini',
    estimatedTime: 8,
    transportMethods: ['car', 'foot', 'emergency'] as Array<'car' | 'foot' | 'emergency'>,
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [-73.8685, 50.4260],
        [-73.8685, 50.4245],
        [-73.8685, 50.4230],
        [-73.8685, 50.4215],
        [-73.8685, 50.4200],
        [-73.8685, 50.4185]
      ]
    }
  },
  {
    id: 'route-3',
    type: 'highway' as const,
    status: 'closed' as const,
    startPoint: 'Mistissini',
    endPoint: 'Chibougamau Highway',
    estimatedTime: 15,
    transportMethods: ['car', 'emergency'] as Array<'car' | 'foot' | 'emergency'>,
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [-73.8640, 50.4230],
        [-73.8620, 50.4300],
        [-73.8560, 50.4380],
        [-73.8510, 50.4470],
        [-73.8460, 50.4560],
        [-73.8410, 50.4650],
        [-73.8360, 50.4740],
        [-73.8310, 50.4830],
        [-73.8260, 50.4920],
        [-73.8210, 50.5010]
      ]
    }
  }
];

// Override the initial data evacuation routes
initialData.evacuationRoutes = fixedEvacuationRoutes;

export const mockDataService = {
  getInitialData: () => {
    // Return a copy of the initial data with fixed evacuation routes
    const data = {...initialData};
    data.evacuationRoutes = JSON.parse(JSON.stringify(fixedEvacuationRoutes));
    return data;
  },
  getUpdatedData: () => {
    // Get updated data for everything except evacuation routes
    const updatedData = generateUpdatedData(initialData);
    
    // Ensure the evacuation routes remain fixed with consistent statuses
    updatedData.evacuationRoutes = JSON.parse(JSON.stringify(fixedEvacuationRoutes));
    
    return updatedData;
  }
};
