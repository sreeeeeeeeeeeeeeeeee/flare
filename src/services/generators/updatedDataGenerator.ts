import { MapDataType, ResponderType } from '@/types/emergency';
import { mistissiniRegions } from '../mistissini';
import { updateResponderPositions } from './responderGenerator';
import { generateNewAlert, updateAlerts } from './alertGenerator';

// Function to create slightly different data to simulate real-time updates for Mistissini
export const generateUpdatedData = (initialData: MapDataType): MapDataType => {
  // Deep copy the initialData to avoid modifying it
  const data: MapDataType = JSON.parse(JSON.stringify(initialData));
  
  // Update responder positions
  data.responders = updateResponderPositions(data.responders, data.dangerZones);

  // Rare responder addition (only 10% chance)
  if (Math.random() > 0.9) {
    addNewResponder(data);
  }
  
  // Rare responder removal (only 2% chance and only if we have enough)
  if (Math.random() > 0.98 && data.responders.length > 6) {
    const indexToRemove = Math.floor(Math.random() * data.responders.length);
    data.responders.splice(indexToRemove, 1);
  }
  
  // DO NOT MODIFY EVACUATION ROUTES - keep them static with fixed statuses
  
  // Generate new alert
  const newAlert = generateNewAlert(data.evacuationRoutes);
  if (newAlert) {
    data.alerts.unshift(newAlert);
  }
  
  // Update existing alerts
  data.alerts = updateAlerts(data.alerts);
  
  return data;
};

// Helper function to add a new responder
const addNewResponder = (data: MapDataType): void => {
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
};
