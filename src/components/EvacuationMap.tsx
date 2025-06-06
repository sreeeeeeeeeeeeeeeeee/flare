
import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { Route } from '@/types/mapTypes';
import { LOCATIONS } from '@/utils/mapUtils';
import { initializeRoutes } from '@/services/routeService';
import RouteStatusLegend from './map/RouteStatusLegend';
import RoutePolyline from './map/RoutePolyline';

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
      <div className="loading text-lg">Loading evacuation routes...</div>
    </div>
  );
};

const EvacuationMap = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInMapContainer = useIsInMapContainer();
  const map = useMap();

  // Initialize routes on component mount
  useEffect(() => {
    const routeDefinitions = [
      { 
        id: 'route-1', 
        start: 'Spruce Street', 
        end: 'Eastern Mistissini', 
        status: 'open' as const,
        // Use these specific coordinates for the Spruce Street route 
        startCoords: [50.4195, -73.8650] as [number, number],
        endCoords: [50.4220, -73.8600] as [number, number]
      },
      { 
        id: 'route-2', 
        start: 'Northern Mistissini', 
        end: 'Southern Mistissini', 
        status: 'congested' as const,
        // Different coordinates for north-south route
        startCoords: [50.4260, -73.8685] as [number, number],
        endCoords: [50.4155, -73.8685] as [number, number]
      },
      { 
        id: 'route-3', 
        start: 'Mistissini', 
        end: 'Chibougamau', 
        status: 'closed' as const,
        // Different coordinates for the highway route
        startCoords: [50.4220, -73.8680] as [number, number],
        endCoords: [50.4400, -73.8860] as [number, number]
      }
    ];

    const loadRoutes = async () => {
      try {
        // Initialize routes with fixed statuses and specific coordinates
        const calculatedRoutes = await initializeRoutes(routeDefinitions, LOCATIONS);
        
        if (calculatedRoutes.length > 0) {
          console.log("Setting routes:", calculatedRoutes);
          setRoutes(calculatedRoutes);
          
          // Ensure the map view encompasses all routes
          if (calculatedRoutes.length > 0 && map) {
            const allPoints = calculatedRoutes.flatMap(route => route.path);
            if (allPoints.length > 0) {
              const bounds = allPoints.reduce(
                (bounds, point) => bounds.extend(point),
                map.getBounds()
              );
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          }
        } else {
          console.error("Failed to initialize routes - no routes returned");
        }
      } catch (error) {
        console.error("Error loading routes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutes();
  }, [map]);

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
      
      {/* Render routes when available - prioritizing open route first for better visibility */}
      {routes
        .sort((a, b) => {
          // Sort open routes first, closed routes last
          if (a.status === 'open' && b.status !== 'open') return -1;
          if (a.status !== 'open' && b.status === 'open') return 1;
          if (a.status === 'closed' && b.status !== 'closed') return 1;
          if (a.status !== 'closed' && b.status === 'closed') return -1;
          return 0;
        })
        .map(route => (
          <RoutePolyline key={route.id} route={route} />
        ))
      }
    </>
  );
};

export default EvacuationMap;
