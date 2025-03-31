
import { DangerZoneType } from '@/types/emergency';
import { mistissiniRegions, mistissiniForestRegions } from '../mistissiniData';

// Generate a much smaller forest fire zone around Mistissini
export const generateForestFireZone = (nearRegion: number, id: string): DangerZoneType => {
  const region = mistissiniRegions[nearRegion];
  const riskLevels: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
  
  // Create a smaller irregular polygon around the region
  // Further reduced radius to make the danger zones highly focused
  const radius = 0.002 + Math.random() * 0.004; // Even smaller radius between 0.002 and 0.006 degrees
  const sides = 5 + Math.floor(Math.random() * 3); // 5-7 sides for the polygon
  const coordinates = [];
  
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const lng = region.center.lng + Math.cos(angle) * radius * (0.8 + Math.random() * 0.4); // Add irregularity
    const lat = region.center.lat + Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
    coordinates.push([lng, lat]);
  }
  
  // Close the polygon
  coordinates.push([...coordinates[0]]);
  
  return {
    id,
    type: 'wildfire', // Always wildfire for forest fires
    riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
    forestRegion: mistissiniForestRegions[Math.floor(Math.random() * mistissiniForestRegions.length)],
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates]
    }
  };
};

// Function to generate initial forest fire zones around Mistissini - now with even smaller zones
export const generateInitialForestFireZones = (count: number = 3): DangerZoneType[] => {
  const zones: DangerZoneType[] = [];
  const usedRegions = new Set<number>();
  
  // Generate fires in different regions around Mistissini
  while (zones.length < count && usedRegions.size < mistissiniRegions.length) {
    const regionIndex = Math.floor(Math.random() * mistissiniRegions.length);
    if (!usedRegions.has(regionIndex)) {
      zones.push(generateForestFireZone(regionIndex, `zone-${zones.length + 1}`));
      usedRegions.add(regionIndex);
    }
  }
  
  return zones;
};
