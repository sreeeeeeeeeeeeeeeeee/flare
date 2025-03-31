
import { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Skeleton } from '@/components/ui/skeleton';
import { MapDataType } from '@/types/emergency';
import { mistissiniLocation } from '@/services/mistissini';
import EvacuationMap from './EvacuationMap';
import MapUpdater from './map/MapUpdater';
import DangerZones from './map/DangerZones';
import ResponderMarkers from './map/ResponderMarkers';
import LocationMarker from './map/LocationMarker';

// Import marker icons for initialization
import '@/utils/MapMarkerIcons';

type EmergencyMapProps = {
  data: MapDataType;
  isLoading: boolean;
};

const EmergencyMap = ({ data, isLoading }: EmergencyMapProps) => {
  if (isLoading) {
    return <Skeleton className="w-full h-full rounded-lg" />;
  }

  return (
    <MapContainer 
      center={[mistissiniLocation.center.lat, mistissiniLocation.center.lng]} 
      zoom={16} 
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      className="z-0"
      zoomControl={true}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      dragging={true}
      key="main-map-container" // Fixed key helps with re-renders
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Mistissini Location Marker */}
      <LocationMarker 
        position={[mistissiniLocation.center.lat, mistissiniLocation.center.lng]}
        name="Mistissini"
        description={mistissiniLocation.description}
      />
      
      {/* Use the new EvacuationMap component for road-based routes */}
      <EvacuationMap />
      
      {/* Danger zones - Forest Fires */}
      <DangerZones zones={data.dangerZones} />
      
      {/* Responders */}
      <ResponderMarkers responders={data.responders} />
      
      <MapUpdater data={data} />
    </MapContainer>
  );
};

export default EmergencyMap;
