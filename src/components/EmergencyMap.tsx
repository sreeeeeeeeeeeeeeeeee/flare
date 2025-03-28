
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Skeleton } from '@/components/ui/skeleton';
import { MapDataType } from '@/types/emergency';
import { Flame, TreePine } from 'lucide-react';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix marker icons in Leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map data updates
function MapUpdater({ data }: { data: MapDataType }) {
  const map = useMap();
  const initialSetupDoneRef = useRef(false);
  
  useEffect(() => {
    // Only set the initial view once when the component mounts
    if (!initialSetupDoneRef.current) {
      // Center the map on Ontario, Canada if no danger zones
      if (data.dangerZones.length === 0) {
        map.setView([51.2538, -85.3232], 5); // Ontario, Canada coordinates
      } else {
        // If there are danger zones, center on the first one
        const coords = data.dangerZones[0].geometry.coordinates[0][0];
        map.setView([coords[1], coords[0]], 8);
      }
      
      initialSetupDoneRef.current = true;
    }
  }, [map, data]);
  
  return null;
}

type EmergencyMapProps = {
  data: MapDataType;
  isLoading: boolean;
};

const EmergencyMap = ({ data, isLoading }: EmergencyMapProps) => {
  if (isLoading) {
    return <Skeleton className="w-full h-full rounded-lg" />;
  }

  // Create custom marker icons for different responder types
  const createResponderIcon = (type: string) => {
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

  return (
    <MapContainer 
      center={[51.2538, -85.3232]} // Ontario, Canada coordinates
      zoom={5} 
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      className="z-0"
      zoomControl={true}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      dragging={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Danger zones - Forest Fires */}
      {data.dangerZones.map((zone) => (
        <Polygon
          key={zone.id}
          positions={zone.geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
          pathOptions={{
            fillColor: '#ea384c',
            fillOpacity: 0.3,
            weight: 2,
            opacity: 0.7,
            color: '#ea384c',
            dashArray: '5, 5'
          }}
        >
          <Popup>
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <Flame className="h-4 w-4 text-danger" />
              {zone.type === 'wildfire' ? 'Forest Fire' : 'WILDFIRE'}
            </div>
            <div className="text-xs">Risk Level: {zone.riskLevel}</div>
            <div className="text-xs">Forest Region: {zone.forestRegion || 'Ontario'}</div>
            <div className="text-xs flex items-center gap-1 mt-1">
              <TreePine className="h-3 w-3 text-emerald-600" />
              <span>Affected Forest Area</span>
            </div>
          </Popup>
        </Polygon>
      ))}
      
      {/* Evacuation routes */}
      {data.evacuationRoutes.map((route) => (
        <Polyline
          key={route.id}
          positions={route.geometry.coordinates.map(coord => [coord[1], coord[0]])}
          pathOptions={{
            color: route.status === 'open' ? '#22c55e' : route.status === 'congested' ? '#f59e0b' : '#ef4444',
            weight: 4,
            opacity: 0.8
          }}
        >
          <Popup>
            <div className="text-sm font-medium">Route: {route.startPoint} to {route.endPoint}</div>
            <div className="text-xs">Status: {route.status}</div>
            <div className="text-xs">Estimated Time: {route.estimatedTime} min</div>
            <div className="text-xs">Transport: {route.transportMethods.join(', ')}</div>
          </Popup>
        </Polyline>
      ))}
      
      {/* Responders */}
      {data.responders.map((responder) => (
        <Marker
          key={responder.id}
          position={[responder.position.latitude, responder.position.longitude]}
          icon={createResponderIcon(responder.type)}
        >
          <Popup>
            <div className="text-sm font-medium">{responder.name}</div>
            <div className="text-xs">Status: {responder.status}</div>
            <div className="text-xs">Location: {responder.position.locationName}</div>
          </Popup>
        </Marker>
      ))}
      
      <MapUpdater data={data} />
    </MapContainer>
  );
};

export default EmergencyMap;
