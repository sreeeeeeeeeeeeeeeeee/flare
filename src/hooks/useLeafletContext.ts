
import { useMap } from 'react-leaflet';

// Check if we're inside a Leaflet map context
export const useIsInMapContainer = () => {
  try {
    // This will throw if we're not in a MapContainer
    useMap();
    return true;
  } catch (e) {
    return false;
  }
};
