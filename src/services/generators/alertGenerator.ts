
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
    
    const alertTemplates = {
      critical: {
        title: 'Street Closure Alert',
        messages: [
          `${streetName} is now closed due to fire. Use alternate routes.`,
          `Evacuation required immediately from ${streetName} area.`,
          `Fire has reached ${streetName}. All residents must evacuate now.`
        ]
      },
      warning: {
        title: 'Street Congestion Warning',
        messages: [
          `Heavy traffic on ${streetName}. Expect delays during evacuation.`,
          `Smoke reducing visibility on ${streetName}. Proceed with caution.`,
          `${streetName} experiencing congestion. Consider alternative routes.`
        ]
      },
      info: {
        title: 'Street Update',
        messages: [
          `${streetName} remains open for evacuation.`,
          `Emergency services stationed along ${streetName} to assist evacuation.`,
          `${streetName} has been designated as priority evacuation route.`
        ]
      }
    };
    
    return {
      id: `alert-${Math.floor(Math.random() * 1000)}`,
      severity: newSeverity,
      title: alertTemplates[newSeverity].title,
      message: alertTemplates[newSeverity].messages[Math.floor(Math.random() * alertTemplates[newSeverity].messages.length)],
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
