
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Skeleton } from '@/components/ui/skeleton';
import { MapDataType } from '@/types/emergency';
import { Flame, TreePine, MapPin, Navigation } from 'lucide-react';
import { mistissiniLocation, mistissiniStreets } from '@/services/mistissiniData';

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
      // Focus on Mistissini by default with a closer zoom level to see streets
      map.setView([mistissiniLocation.center.lat, mistissiniLocation.center.lng], 15);
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

  // Create a location marker for Mistissini
  const locationMarker = L.divIcon({
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

  // Display all streets as reference
  const nonEvacuationStreets = mistissiniStreets.filter(
    street => !data.evacuationRoutes.some(route => route.routeName === street.name)
  );

  return (
    <MapContainer 
      center={[mistissiniLocation.center.lat, mistissiniLocation.center.lng]} 
      zoom={15} 
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
      
      {/* Mistissini Location Marker */}
      <Marker 
        position={[mistissiniLocation.center.lat, mistissiniLocation.center.lng]} 
        icon={locationMarker}
      >
        <Popup>
          <div className="text-sm font-medium">Mistissini</div>
          <div className="text-xs mt-1">{mistissiniLocation.description}</div>
        </Popup>
      </Marker>
      
      {/* Show all streets as reference (thin gray lines) */}
      {nonEvacuationStreets.map((street) => (
        <Polyline
          key={`street-${street.name}`}
          positions={street.path as [number, number][]}
          pathOptions={{
            color: '#94a3b8',
            weight: 2,
            opacity: 0.5,
            dashArray: '4, 4'
          }}
        >
          <Popup>
            <div className="text-sm font-medium">{street.name}</div>
            <div className="text-xs">{street.description}</div>
          </Popup>
        </Polyline>
      ))}
      
      {/* Evacuation routes */}
      {data.evacuationRoutes.map((route) => {
        // Convert coordinates to [lat, lng] format required by react-leaflet
        const positions = route.geometry.coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
        
        return (
          <Polyline
            key={route.id}
            positions={positions}
            pathOptions={{
              color: route.status === 'open' ? '#22c55e' : route.status === 'congested' ? '#f59e0b' : '#ef4444',
              weight: route.routeName?.includes("Route") || route.routeName?.includes("Road to") ? 5 : 4,
              opacity: 0.9
            }}
          >
            <Popup>
              <div className="text-sm font-medium">{route.routeName || route.id}</div>
              <div className="text-xs">From: {route.startPoint} to {route.endPoint}</div>
              <div className="text-xs">Status: {route.status}</div>
              <div className="text-xs">Estimated Time: {route.estimatedTime} min</div>
              <div className="text-xs">Transport: {route.transportMethods.join(', ')}</div>
            </Popup>
          </Polyline>
        );
      })}
      
      {/* Danger zones - Forest Fires */}
      {data.dangerZones.map((zone) => {
        // Convert polygon coordinates to [lat, lng] format for react-leaflet
        const positions = zone.geometry.coordinates[0].map(coord => [coord[1], coord[0]] as [number, number]);
        
        return (
          <Polygon
            key={zone.id}
            positions={positions}
            pathOptions={{
              fillColor: '#ea384c',
              fillOpacity: 0.4,
              weight: 2,
              opacity: 0.8,
              color: '#ea384c',
              dashArray: '3, 3'
            }}
          >
            <Popup>
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Flame className="h-4 w-4 text-danger" />
                {zone.type === 'wildfire' ? 'Forest Fire' : zone.type.toUpperCase()}
              </div>
              <div className="text-xs">Risk Level: {zone.riskLevel}</div>
              <div className="text-xs">Forest Region: {zone.forestRegion || 'Mistissini Area'}</div>
              <div className="text-xs flex items-center gap-1 mt-1">
                <TreePine className="h-3 w-3 text-emerald-600" />
                <span>Affected Forest Area</span>
              </div>
            </Popup>
          </Polygon>
        );
      })}
      
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
