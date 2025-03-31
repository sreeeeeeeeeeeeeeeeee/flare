
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { MapDataType } from '@/types/emergency';
import { mistissiniLocation } from '@/services/mistissini'; // Updated import path

interface MapUpdaterProps {
  data: MapDataType;
}

const MapUpdater = ({ data }: MapUpdaterProps) => {
  const map = useMap();
  const initialSetupDoneRef = useRef(false);
  
  useEffect(() => {
    // Only set the initial view once when the component mounts
    if (!initialSetupDoneRef.current) {
      // Focus on Mistissini by default with a closer zoom level to see streets
      map.setView([mistissiniLocation.center.lat, mistissiniLocation.center.lng], 16);
      initialSetupDoneRef.current = true;
    }
  }, [map, data]);
  
  return null;
};

export default MapUpdater;
