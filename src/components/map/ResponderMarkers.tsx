
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { ResponderType } from '@/types/emergency';
import { createResponderIcon } from '@/utils/MapMarkerIcons';
import { useIsInMapContainer } from '@/hooks/useLeafletContext';

interface ResponderMarkersProps {
  responders: ResponderType[];
}

const ResponderMarkers: React.FC<ResponderMarkersProps> = ({ responders }) => {
  const isInMapContainer = useIsInMapContainer();

  if (!isInMapContainer) {
    return null;
  }

  return (
    <>
      {responders.map((responder) => (
        <Marker
          key={`responder-${responder.id}`}
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
    </>
  );
};

export default ResponderMarkers;
