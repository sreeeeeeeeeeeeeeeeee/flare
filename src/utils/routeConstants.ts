
/**
 * Constants for route calculations
 */

// Lowercase aliases for location lookups 
export const LOCATION_ALIASES: Record<string, string> = {
  "gur": "madassin",
  "mistissini": "mistissini", 
  "madassin": "madassin",
  "drobose": "drobose"
};

// Enhanced location database with proper coordinates
export const LOCATIONS: Record<string, [number, number]> = {
  // Main locations
  police: [50.4230, -73.8720],       // Police station in Mistissini
  fire: [50.4215, -73.8695],         // Fire department
  mistissini: [50.4221, -73.8683],   // Central Mistissini
  medie: [50.4208, -73.8660],        // Medical center
  hospital: [50.4230, -73.8780],     // Hospital
  community: [50.4232, -73.8660],    // Community center
  school: [50.4225, -73.8700],       // School
  arena: [50.4210, -73.8750],        // Arena
  store: [50.4228, -73.8690],        // Store
  highway: [50.4270, -73.8620],      // Highway exit
  
  // Additional areas
  madassin: [50.4180, -73.8720],     // Residential area
  drobose: [50.4150, -73.8750],      // Industrial zone
  dropose: [50.4153, -73.8748],      // Industrial area coordinates
  northMistissini: [50.4280, -73.8650], // Northern expansion
  southMistissini: [50.4120, -73.8700], // Southern area
  
  // Neighboring towns
  chibougamau: [49.9166, -74.3694],
  oujeBougoumou: [49.9257, -74.8107],
  waswanipi: [49.6892, -75.9564]
};

// Water boundaries to avoid (rivers/lakes)
export const WATER_BOUNDARIES = [
  [50.4200, -73.8690], [50.4210, -73.8680], [50.4220, -73.8670],
  [50.4230, -73.8660], [50.4240, -73.8650], [50.4150, -73.8740]
];

export const GRAPHHOPPER_API_KEY = '5adb1e1c-29a2-4293-81c1-1c81779679bb';
