
import { DangerZoneType } from '@/types/emergency';
import { mistissiniRegions, mistissiniForestRegions } from '../mistissini';

// Generate a single forest fire zone in the center of Mistissini
export const generateForestFireZone = (id: string): DangerZoneType => {
  // Use the center region (Mistissini Center)
  const centerRegion = mistissiniRegions.find(region => 
    region.name.toLowerCase().includes('center')) || mistissiniRegions[0];
  
  // Create a smaller irregular polygon around the central region
  const radius = 0.003; // Small radius for a focused danger zone
  const sides = 6; // Hexagonal shape
  const coordinates = [];
  
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const lng = centerRegion.center.lng + Math.cos(angle) * radius * (0.9 + Math.random() * 0.2);
    const lat = centerRegion.center.lat + Math.sin(angle) * radius * (0.9 + Math.random() * 0.2);
    coordinates.push([lng, lat]);
  }
  
  // Close the polygon
  coordinates.push([...coordinates[0]]);
  
  return {
    id,
    type: 'wildfire',
    riskLevel: 'high', // Always high risk for the central danger zone
    forestRegion: 'Mistissini Central Forest',
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates]
    }
  };
};

// Generate initial forest fire zones - now just one in the center
export const generateInitialForestFireZones = (): DangerZoneType[] => {
  return [generateForestFireZone('zone-1')];
};
