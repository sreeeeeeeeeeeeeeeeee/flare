
import { useEffect, useState } from 'react';
import { TileLayer, useMap } from 'react-leaflet';
import { Route } from '@/types/mapTypes';
import { LOCATIONS } from '@/utils/mapUtils';
import { initializeRoutes } from '@/services/routeService';
import RouteStatusLegend from './map/RouteStatusLegend';
import RoutePolyline from './map/RoutePolyline';
import { Skeleton } from './ui/skeleton';

// Check if we're inside a Leaflet map context
const useIsInMapContainer = () => {
  try {
    // This will throw if we're not in a MapContainer
    useMap();
    return true;
  } catch (e) {
    return false;
  }
};

// Loading indicator component that works within the map container
const LoadingOverlay = () => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-background/80 backdrop-blur-sm p-4 rounded-md shadow-md border border-border">
      <div className="loading text-lg">Calculating precise road routes...</div>
    </div>
  );
};

const EvacuationMap = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInMapContainer = useIsInMapContainer();

  // Initialize routes
  useEffect(() => {
    const routeDefinitions = [
      { id: 'route-1', start: 'Lake Shore', end: 'Eastern Mistissini', status: 'open' },
      { id: 'route-2', start: 'Danger Zone 1', end: 'Community Center', status: 'congested' },
      { id: 'route-3', start: 'Mistissini', end: 'Chibougamau', status: 'closed' }
    ];

    const loadRoutes = async () => {
      try {
        // Initialize routes with their fixed statuses
        const calculatedRoutes = await initializeRoutes(routeDefinitions, LOCATIONS);
        
        if (calculatedRoutes && calculatedRoutes.length > 0) {
          // Override the statuses to ensure they match exactly what we defined
          calculatedRoutes[0].status = 'open';
          calculatedRoutes[1].status = 'congested';
          calculatedRoutes[2].status = 'closed';
          
          setRoutes(calculatedRoutes);
        } else {
          console.error("Failed to initialize routes - no routes returned");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading routes:", error);
        setIsLoading(false);
      }
    };

    loadRoutes();
  }, []);

  // No auto-update interval is needed anymore

  // If we're not inside a MapContainer, show a standalone placeholder instead
  if (!isInMapContainer) {
    console.log("EvacuationMap: Not rendering map elements because we're not in a MapContainer");
    return (
      <div className="relative h-full w-full bg-gray-900 rounded-md overflow-hidden flex flex-col">
        <div className="p-4 bg-gray-800 text-white font-semibold">Evacuation Routes</div>
        <div className="flex-grow p-4 text-white/80 flex justify-center items-center">
          Evacuation routes data is available but can only be displayed on a map.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Always show the legend */}
      <div className="absolute top-2 right-2 z-10">
        <RouteStatusLegend />
      </div>
      
      {/* Loading state */}
      {isLoading && <LoadingOverlay />}
      
      {/* Render routes when available */}
      {!isLoading && routes.map(route => (
        <RoutePolyline key={route.id} route={route} />
      ))}
    </>
  );
};

export default EvacuationMap;
