
import { AlertType, EvacuationRouteType } from '@/types/emergency';

// Generate initial alerts
export const generateInitialAlerts = (): AlertType[] => {
  return [
    {
      id: 'alert-1',
      severity: 'critical',
      title: 'Forest Fire Alert',
      message: 'Active forest fire detected near Main Street. Immediate evacuation required via Saint John Street.',
      time: '13:45',
      location: 'Northern Mistissini',
      isNew: false,
      visibility: 'all'
    },
    {
      id: 'alert-2',
      severity: 'warning',
      title: 'Drone Deployment',
      message: 'Surveillance drones deployed to monitor forest fire perimeters around Mistissini.',
      time: '13:30',
      location: 'Mistissini Region',
      isNew: true,
      visibility: 'admin'
    },
    {
      id: 'alert-3',
      severity: 'critical',
      title: 'New Forest Fire',
      message: 'New forest fire identified near Northern Boulevard. Route 167 remains open for evacuation.',
      time: '14:05',
      location: 'Eastern Shore',
      isNew: true,
      visibility: 'all'
    },
    {
      id: 'alert-4', 
      severity: 'warning',
      title: 'Smoke Conditions',
      message: 'Poor visibility on Saint John Street due to smoke. Use Lakeshore Drive as alternative.',
      time: '18:30',
      location: 'Mistissini',
      isNew: false,
      visibility: 'public'
    },
    {
      id: 'alert-5', 
      severity: 'info',
      title: 'Evacuation Center Open',
      message: 'Community Center on Lake Shore is now open as an evacuation shelter. Food and medical aid available.',
      time: '15:20',
      location: 'Eastern Mistissini',
      isNew: true,
      visibility: 'public'
    },
    {
      id: 'alert-6', 
      severity: 'warning',
      title: 'Water Supply Notice',
      message: 'Residents in Southern Mistissini may experience water pressure drops. Fill containers as precaution.',
      time: '16:45',
      location: 'Southern Mistissini',
      isNew: true,
      visibility: 'public'
    },
    {
      id: 'alert-7', 
      severity: 'critical',
      title: 'Medical Emergency',
      message: 'Medical assistance team stationed at Main Street intersection. Seek help there if needed.',
      time: '17:10',
      location: 'Central Mistissini',
      isNew: false,
      visibility: 'public'
    },
    {
      id: 'alert-8', 
      severity: 'info',
      title: 'School Closure',
      message: 'All schools in Mistissini closed until further notice. Online learning details to follow.',
      time: '14:30',
      location: 'Mistissini District',
      isNew: true,
      visibility: 'public'
    }
  ];
};

// Generate a new alert based on routes
export const generateNewAlert = (routes: EvacuationRouteType[]): AlertType | null => {
  // Only 15% chance of creating a new alert to reduce frequency
  if (Math.random() > 0.85) {
    const alertSeverities: Array<'critical' | 'warning' | 'info'> = ['critical', 'warning', 'info'];
    const newSeverity = alertSeverities[Math.floor(Math.random() * alertSeverities.length)];
    const visibilityOptions: Array<'public' | 'admin' | 'all'> = ['public', 'admin', 'all'];
    const visibility = visibilityOptions[Math.floor(Math.random() * visibilityOptions.length)];
    
    const streetRoutes = routes.filter(route => 
      !route.routeName?.includes("Route") && !route.routeName?.includes("Road to")
    );
    const randomRoute = streetRoutes[Math.floor(Math.random() * streetRoutes.length)];
    const streetName = randomRoute?.routeName || "Main Street";
    
    // Alert templates for different severity levels
    const alertTemplates = {
      critical: {
        titles: [
          'Street Closure Alert',
          'Immediate Evacuation',
          'Emergency Shelter Update',
          'Medical Emergency'
        ],
        messages: [
          `${streetName} is now closed due to fire. Use alternate routes.`,
          `Evacuation required immediately from ${streetName} area.`,
          `Fire has reached ${streetName}. All residents must evacuate now.`,
          `Emergency shelter at Community Center has reached capacity. New shelter open at School Gymnasium.`,
          `Medical emergency station relocated from ${streetName} to Town Hall due to fire spread.`
        ]
      },
      warning: {
        titles: [
          'Street Congestion Warning',
          'Water Supply Notice',
          'Power Outage Alert',
          'Animal Shelter Update'
        ],
        messages: [
          `Heavy traffic on ${streetName}. Expect delays during evacuation.`,
          `Smoke reducing visibility on ${streetName}. Proceed with caution.`,
          `${streetName} experiencing congestion. Consider alternative routes.`,
          `Water pressure reduced in northern district. Conservation recommended.`,
          `Temporary power outages expected in central Mistissini as lines are secured.`,
          `Pet emergency shelter now accepting animals at Recreation Center.`
        ]
      },
      info: {
        titles: [
          'Street Update',
          'Community Resources',
          'School Status',
          'Public Transportation'
        ],
        messages: [
          `${streetName} remains open for evacuation.`,
          `Emergency services stationed along ${streetName} to assist evacuation.`,
          `${streetName} has been designated as priority evacuation route.`,
          `Charging stations for phones and devices available at Community Center.`,
          `Free transport shuttles running every 15 minutes from Town Square.`,
          `Public wifi hotspots established at all evacuation centers for communication.`,
          `School closures extended through end of week. Updates available on district website.`
        ]
      }
    };
    
    const titleArray = alertTemplates[newSeverity].titles;
    const messageArray = alertTemplates[newSeverity].messages;
    
    return {
      id: `alert-${Math.floor(Math.random() * 1000)}`,
      severity: newSeverity,
      title: titleArray[Math.floor(Math.random() * titleArray.length)],
      message: messageArray[Math.floor(Math.random() * messageArray.length)],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: 'Mistissini',
      isNew: true,
      visibility: visibility
    };
  }
  
  return null;
};

// Update existing alerts
export const updateAlerts = (alerts: AlertType[]): AlertType[] => {
  return alerts.map((alert, index) => {
    if (index > 0) {
      return { ...alert, isNew: false };
    }
    return alert;
  });
};
