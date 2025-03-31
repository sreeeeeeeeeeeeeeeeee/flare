import { MapDataType } from '@/types/emergency';
import { generateInitialData } from './generators/initialDataGenerator';
import { generateUpdatedData } from './generators/updatedDataGenerator';

// Create and cache initial data instance
const initialData = generateInitialData();

// Store a copy of the original evacuation routes
const originalEvacuationRoutes = JSON.parse(JSON.stringify(initialData.evacuationRoutes));

export const mockDataService = {
  getInitialData: () => initialData,
  getUpdatedData: () => {
    // Get updated data for everything except evacuation routes
    const updatedData = generateUpdatedData(initialData);
    
    // Ensure the evacuation routes remain unchanged from the initial state
    updatedData.evacuationRoutes = originalEvacuationRoutes;
    
    return updatedData;
  }
};
