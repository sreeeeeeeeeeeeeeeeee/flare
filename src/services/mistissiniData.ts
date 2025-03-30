
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

// Updated streets in Mistissini based on provided map image
export const mistissiniStreets = [
  {
    name: "Amisk Street",
    description: "Main east-west road in central Mistissini",
    path: [
      [50.4212, -73.8745],
      [50.4215, -73.8720],
      [50.4217, -73.8695],
      [50.4220, -73.8670],
      [50.4222, -73.8645]
    ]
  },
  {
    name: "Wabushush Street",
    description: "North-south road in eastern Mistissini",
    path: [
      [50.4245, -73.8650],
      [50.4235, -73.8650],
      [50.4225, -73.8651],
      [50.4215, -73.8653],
      [50.4205, -73.8653],
      [50.4195, -73.8654]
    ]
  },
  {
    name: "Etudeh Street",
    description: "Northern road in Mistissini",
    path: [
      [50.4245, -73.8710],
      [50.4244, -73.8700],
      [50.4243, -73.8690],
      [50.4241, -73.8680],
      [50.4239, -73.8670],
      [50.4238, -73.8660],
      [50.4237, -73.8650]
    ]
  },
  {
    name: "Queen Street",
    description: "Southern road in Mistissini",
    path: [
      [50.4190, -73.8730],
      [50.4191, -73.8720],
      [50.4192, -73.8710],
      [50.4193, -73.8700],
      [50.4194, -73.8690],
      [50.4195, -73.8680],
      [50.4196, -73.8670],
      [50.4197, -73.8660],
      [50.4198, -73.8650]
    ]
  },
  {
    name: "Albanel Street",
    description: "Eastern road in Mistissini",
    path: [
      [50.4205, -73.8620],
      [50.4210, -73.8625],
      [50.4215, -73.8630],
      [50.4220, -73.8635],
      [50.4225, -73.8640],
      [50.4230, -73.8645]
    ]
  },
  {
    name: "Chief Isaiah Shecapio Road",
    description: "Main entry road to Mistissini",
    path: [
      [50.4180, -73.8790],
      [50.4190, -73.8760],
      [50.4200, -73.8730],
      [50.4210, -73.8700]
    ]
  },
  {
    name: "Community Center Road",
    description: "Road circling the community center",
    path: [
      [50.4232, -73.8675],
      [50.4236, -73.8680],
      [50.4237, -73.8685],
      [50.4236, -73.8690],
      [50.4232, -73.8695],
      [50.4228, -73.8690],
      [50.4227, -73.8685],
      [50.4228, -73.8680],
      [50.4232, -73.8675]
    ]
  },
  {
    name: "Lake Shore Road",
    description: "Road along Lake Mistassini",
    path: [
      [50.4222, -73.8645],
      [50.4218, -73.8635],
      [50.4214, -73.8625],
      [50.4210, -73.8615],
      [50.4206, -73.8605],
      [50.4202, -73.8595]
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
      [50.4221, -73.8683], // Mistissini start
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
      [50.4221, -73.8683], // Mistissini start
      [50.4260, -73.8750],
      [50.4300, -73.8820],
      [50.4340, -73.8890],
      [50.4380, -73.8960],
      [50.4420, -73.9030],
      [50.4460, -73.9100],
      [50.4500, -73.9170],
      [50.4540, -73.9240],
      [50.4580, -73.9310],
      [50.4620, -73.9380],
      [50.4660, -73.9450],
      [50.4700, -73.9520],
      [50.4740, -73.9590],
      [50.4780, -73.9660],
      [50.4820, -73.9730],
      [50.4860, -73.9800],
      [50.4900, -73.9870],
      [50.4940, -73.9940],
      [50.4980, -74.0010],
      [50.5020, -74.0080],
      [50.5060, -74.0150],
      [50.5100, -74.0220],
      [50.5140, -74.0290],
      [50.5180, -74.0360],
      [50.5220, -74.0430],
      [50.5276, -74.0452]  // Oujé-Bougoumou end
    ]
  },
  {
    name: "Route du Nord",
    description: "Road connecting to western communities",
    path: [
      // Mistissini to Route du Nord junction
      [50.4221, -73.8683], // Mistissini start
      [50.4200, -73.8780],
      [50.4180, -73.8880],
      [50.4160, -73.8980],
      [50.4140, -73.9080],
      [50.4120, -73.9180],
      [50.4100, -73.9280],
      [50.4080, -73.9380],
      [50.4060, -73.9480],
      [50.4040, -73.9580],
      [50.4020, -73.9680],
      [50.4000, -73.9780],
      [50.3980, -73.9880],
      [50.3960, -73.9980],
      [50.3940, -74.0080],
      [50.3920, -74.0180],
      [50.3900, -74.0280],
      [50.3880, -74.0380],
      [50.3860, -74.0480],
      [50.3840, -74.0580],
      [50.3820, -74.0680],
      [50.3800, -74.0780],
      [50.3780, -74.0880],
      [50.3760, -74.0980],
      [50.3740, -74.1080],
      [50.3720, -74.1180],
      [50.3700, -74.1280],
      [50.3680, -74.1380],
      [50.3660, -74.1480],
      [50.3640, -74.1580],
      [50.3620, -74.1680],
      [50.3600, -74.1780],
      [50.3580, -74.1880],
      [50.3560, -74.1980],
      [50.3540, -74.2080],
      [50.3520, -74.2180],
      [50.3500, -74.2280],
      [50.3480, -74.2380],
      [50.3460, -74.2480],
      [50.3440, -74.2580],
      [50.3420, -74.2680],
      [50.3400, -74.2780],
      [50.3380, -74.2880],
      [50.3360, -74.2980],
      [50.3340, -74.3080]  // Route du Nord junction
    ]
  }
];
