
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix marker icons in Leaflet
export const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Apply the default icon to all markers
L.Marker.prototype.options.icon = DefaultIcon;

// Create custom marker icons for different responder types
export const createResponderIcon = (type: string) => {
  let color;
  switch (type) {
    case 'drone':
      color = '#3b82f6'; // blue
      break;
    case 'police':
      color = '#6366f1'; // indigo
      break;
    case 'fire':
      color = '#ef4444'; // red
      break;
    case 'medical':
      color = '#10b981'; // emerald
      break;
    default:
      color = '#f59e0b'; // amber
  }
  
  return L.divIcon({
    html: `
      <div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; animation: pulse 1.5s infinite;" class="pulse-marker"></div>
      <div style="background-color: rgba(30, 30, 30, 0.8); color: white; font-size: 10px; padding: 2px 4px; border-radius: 2px; margin-top: -2px; white-space: nowrap;">${type}</div>
    `,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// Create a location marker for Mistissini
export const createLocationMarker = () => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center">
        <div class="text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      </div>
      <div style="background-color: rgba(30, 30, 30, 0.8); color: white; font-size: 11px; padding: 2px 4px; border-radius: 2px; margin-top: -4px; white-space: nowrap; text-align: center;">Mistissini</div>
    `,
    className: 'location-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
};
