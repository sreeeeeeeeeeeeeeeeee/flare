
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

// Updated streets in Mistissini aligned with the actual map
export const mistissiniStreets = [
  {
    name: "Main Street",
    description: "Primary east-west road through central Mistissini",
    path: [
      [50.4215, -73.8760],
      [50.4220, -73.8730],
      [50.4225, -73.8700],
      [50.4230, -73.8670],
      [50.4235, -73.8640],
      [50.4240, -73.8610]
    ]
  },
  {
    name: "Saint John Street",
    description: "North-south road in central Mistissini",
    path: [
      [50.4260, -73.8685],
      [50.4245, -73.8685],
      [50.4230, -73.8685],
      [50.4215, -73.8685],
      [50.4200, -73.8685],
      [50.4185, -73.8685]
    ]
  },
  {
    name: "Lakeshore Drive",
    description: "Road along Lake Mistassini shoreline",
    path: [
      [50.4235, -73.8610],
      [50.4230, -73.8595],
      [50.4225, -73.8580],
      [50.4220, -73.8565],
      [50.4215, -73.8550],
      [50.4210, -73.8535],
      [50.4205, -73.8520],
      [50.4200, -73.8505]
    ]
  },
  {
    name: "Northern Boulevard",
    description: "Main northern road in Mistissini",
    path: [
      [50.4240, -73.8700],
      [50.4255, -73.8705],
      [50.4270, -73.8710],
      [50.4285, -73.8715],
      [50.4300, -73.8720]
    ]
  },
  {
    name: "Community Center Road",
    description: "Road connecting to the community center",
    path: [
      [50.4225, -73.8685],
      [50.4230, -73.8670],
      [50.4232, -73.8660],
      [50.4235, -73.8650]
    ]
  },
  {
    name: "Euelsti Street",
    description: "East-west street through residential area",
    path: [
      [50.4175, -73.8610],
      [50.4180, -73.8630],
      [50.4180, -73.8650],
      [50.4180, -73.8670],
      [50.4180, -73.8690],
      [50.4180, -73.8710],
      [50.4180, -73.8730]
    ]
  },
  {
    name: "Amisk Street",
    description: "Residential street in southern Mistissini",
    path: [
      [50.4160, -73.8630],
      [50.4165, -73.8650],
      [50.4165, -73.8670],
      [50.4165, -73.8690],
      [50.4165, -73.8710],
      [50.4165, -73.8730]
    ]
  },
  {
    name: "Spruce Street",
    description: "Northern diagonal street",
    path: [
      [50.4190, -73.8550],
      [50.4200, -73.8570],
      [50.4210, -73.8590],
      [50.4220, -73.8610],
      [50.4230, -73.8630],
      [50.4240, -73.8650]
    ]
  },
  {
    name: "Southern Avenue",
    description: "Main southern road in residential area",
    path: [
      [50.4185, -73.8730],
      [50.4190, -73.8715],
      [50.4195, -73.8700],
      [50.4200, -73.8685],
      [50.4205, -73.8670],
      [50.4210, -73.8655],
      [50.4215, -73.8640]
    ]
  },
  {
    name: "Western Route",
    description: "Road on western side of Mistissini",
    path: [
      [50.4215, -73.8740],
      [50.4210, -73.8755],
      [50.4205, -73.8770],
      [50.4200, -73.8785],
      [50.4195, -73.8800],
      [50.4190, -73.8815]
    ]
  }
];

// Main highways connecting Mistissini to nearby towns only
export const mistissiniHighways = [
  {
    name: "Route 167 to Chibougamau",
    description: "Main highway connecting Mistissini to Chibougamau",
    path: [
      // Mistissini to Chibougamau (more realistic route following actual terrain)
      [50.4230, -73.8640], // Mistissini start (connecting to Main Street)
      [50.4300, -73.8620],
      [50.4380, -73.8560],
      [50.4470, -73.8510],
      [50.4560, -73.8460],
      [50.4650, -73.8410],
      [50.4740, -73.8360],
      [50.4830, -73.8310],
      [50.4920, -73.8260],
      [50.5010, -73.8210],
      [50.5100, -73.8160],
      [50.5190, -73.8110],
      [50.5280, -73.8060],
      [50.5370, -73.8020],
      [50.5460, -73.7980],
      [50.5560, -73.7940],
      [50.5660, -73.7900],
      [50.5760, -73.7870],
      [50.5860, -73.7840],
      [50.5960, -73.7820],
      [50.6060, -73.7800],
      [50.6160, -73.7790],
      [50.6260, -73.7780],
      [50.6360, -73.7770],
      [50.6460, -73.7760],
      [50.6560, -73.7750],
      [50.6660, -73.7740],
      [50.6760, -73.7730],
      [50.6860, -73.7720],
      [50.6960, -73.7710],
      [50.7060, -73.7705],
      [50.7160, -73.7700],
      [50.7260, -73.7695],
      [50.7360, -73.7690],
      [50.7460, -73.7685],
      [50.7560, -73.7680],
      [50.7660, -73.7675],
      [50.7760, -73.7670],
      [50.7860, -73.7660],
      [50.7960, -73.7650],
      [50.8060, -73.7640],
      [50.8160, -73.7630],
      [50.8260, -73.7620],
      [50.8360, -73.7610],
      [50.8460, -73.7600],
      [50.8560, -73.7590],
      [50.8660, -73.7580],
      [50.8760, -73.7570],
      [50.8860, -73.7560],
      [50.8960, -73.7550],
      [50.9060, -73.7540],
      [50.9160, -73.7530],
      [50.9260, -73.7520],
      [50.9360, -73.7510],
      [50.9460, -73.7500],
      [50.9560, -73.7490],
      [50.9660, -73.7480],
      [50.9760, -73.7470],
      [50.9860, -73.7460],
      [50.9960, -73.7450],
      [51.0060, -73.7440],
      [51.0160, -73.7430],
      [51.0260, -73.7420],
      [51.0379, -73.7892]  // Chibougamau end
    ]
  },
  {
    name: "Road to Oujé-Bougoumou",
    description: "Highway connecting Mistissini to Oujé-Bougoumou",
    path: [
      // Route from Mistissini to Oujé-Bougoumou
      [50.4220, -73.8700], // Mistissini start (connecting to Main Street)
      [50.4235, -73.8750],
      [50.4250, -73.8800],
      [50.4265, -73.8850],
      [50.4280, -73.8900],
      [50.4295, -73.8950],
      [50.4310, -73.9000],
      [50.4325, -73.9050],
      [50.4340, -73.9100],
      [50.4355, -73.9150],
      [50.4370, -73.9200],
      [50.4385, -73.9250],
      [50.4400, -73.9300],
      [50.4415, -73.9350],
      [50.4430, -73.9400],
      [50.4445, -73.9450],
      [50.4460, -73.9500],
      [50.4475, -73.9550],
      [50.4490, -73.9600],
      [50.4505, -73.9650],
      [50.4520, -73.9700],
      [50.4535, -73.9750],
      [50.4550, -73.9800],
      [50.4565, -73.9850],
      [50.4580, -73.9900],
      [50.4595, -73.9950],
      [50.4610, -74.0000],
      [50.4625, -74.0050],
      [50.4640, -74.0100],
      [50.4655, -74.0150],
      [50.4670, -74.0200],
      [50.4685, -74.0250],
      [50.4700, -74.0300],
      [50.4715, -74.0350],
      [50.4730, -74.0400],
      [50.4745, -74.0425],
      [50.4800, -74.0435],
      [50.4900, -74.0440],
      [50.5000, -74.0445],
      [50.5100, -74.0450],
      [50.5200, -74.0450],
      [50.5276, -74.0452]  // Oujé-Bougoumou end
    ]
  },
  {
    name: "South Lake Road",
    description: "Road connecting to southern communities",
    path: [
      // Mistissini to southern areas
      [50.4185, -73.8685], // Mistissini start (connecting to Saint John Street)
      [50.4170, -73.8700],
      [50.4155, -73.8715],
      [50.4140, -73.8730],
      [50.4125, -73.8745],
      [50.4110, -73.8760],
      [50.4095, -73.8775],
      [50.4080, -73.8790],
      [50.4065, -73.8805],
      [50.4050, -73.8820],
      [50.4035, -73.8835],
      [50.4020, -73.8850],
      [50.4005, -73.8865],
      [50.3990, -73.8880],
      [50.3975, -73.8895],
      [50.3960, -73.8910],
      [50.3945, -73.8925],
      [50.3930, -73.8940],
      [50.3915, -73.8955],
      [50.3900, -73.8970]  // Southern extension
    ]
  },
  {
    name: "Western Access Road",
    description: "Road connecting to western shore",
    path: [
      // Mistissini to western shore
      [50.4195, -73.8800], // Mistissini start (connecting to Western Route)
      [50.4190, -73.8850],
      [50.4185, -73.8900],
      [50.4180, -73.8950],
      [50.4175, -73.9000],
      [50.4170, -73.9050],
      [50.4165, -73.9100],
      [50.4160, -73.9150],
      [50.4155, -73.9200],
      [50.4150, -73.9250],
      [50.4145, -73.9300],
      [50.4140, -73.9350]  // Western shore extension
    ]
  }
];
