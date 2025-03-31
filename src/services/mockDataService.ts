
import { MapDataType } from '@/types/emergency';
import { generateInitialData } from './generators/initialDataGenerator';
import { generateUpdatedData } from './generators/updatedDataGenerator';

// Create initial data instance
const initialData = generateInitialData();

export const mockDataService = {
  getInitialData: () => initialData,
  getUpdatedData: () => generateUpdatedData(initialData)
};
