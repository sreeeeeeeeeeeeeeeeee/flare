
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createLocationMarker } from '@/utils/MapMarkerIcons';
import { useIsInMapContainer } from '@/hooks/useLeafletContext';

interface LocationMarkerProps {
  position: [number, number];
  name: string;
  description?: string;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, name, description }) => {
  const isInMapContainer = useIsInMapContainer();

  if (!isInMapContainer) {
    return null;
  }

  return (
    <Marker 
      position={position}
      icon={createLocationMarker()}
      key={`location-${name}`}
    >
      <Popup>
        <div className="text-sm font-medium">{name}</div>
        {description && <div className="text-xs mt-1">{description}</div>}
      </Popup>
    </Marker>
  );
};

export default LocationMarker;
