import { MapDataType } from '@/types/emergency';
import { generateInitialData } from './generators/initialDataGenerator';
import { generateUpdatedData } from './generators/updatedDataGenerator';

// Create and cache initial data instance
const initialData = generateInitialData();

// Store a copy of the original evacuation routes to ensure they never change
const originalEvacuationRoutes = JSON.parse(JSON.stringify(initialData.evacuationRoutes));

// Make sure the routes have the correct statuses
originalEvacuationRoutes[0].status = 'open';
originalEvacuationRoutes[1].status = 'congested';
originalEvacuationRoutes[2].status = 'closed';

export const mockDataService = {
  getInitialData: () => {
    // Ensure initial data always has the correct route statuses
    const data = {...initialData};
    data.evacuationRoutes = JSON.parse(JSON.stringify(originalEvacuationRoutes));
    return data;
  },
  getUpdatedData: () => {
    // Get updated data for everything except evacuation routes
    const updatedData = generateUpdatedData(initialData);
    
    // Ensure the evacuation routes remain unchanged with correct statuses
    updatedData.evacuationRoutes = JSON.parse(JSON.stringify(originalEvacuationRoutes));
    
    return updatedData;
  }
};
