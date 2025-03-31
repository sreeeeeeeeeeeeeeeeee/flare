
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Route } from '@/types/mapTypes';
import { LOCATIONS } from '@/utils/mapUtils';
import { getRandomStatus } from '@/utils/mapUtils';
import { initializeRoutes } from '@/services/routeService';
import RouteStatusLegend from './map/RouteStatusLegend';
import RoutePolyline from './map/RoutePolyline';
import { Skeleton } from './ui/skeleton';

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

  // Initialize routes
  useEffect(() => {
    const routeDefinitions = [
      { id: 'mistissini-dropose', start: 'mistissini', end: 'dropose' },
      { id: 'dropose-hospital', start: 'dropose', end: 'hospital' },
      { id: 'school-chibougamau', start: 'school', end: 'chibougamau' }
    ];

    const loadRoutes = async () => {
      const calculatedRoutes = await initializeRoutes(routeDefinitions, LOCATIONS);
      setRoutes(calculatedRoutes);
      setIsLoading(false);
    };

    loadRoutes();
  }, []);

  // Status updates every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setRoutes(prev => prev.map(route => ({
        ...route,
        status: getRandomStatus(),
        updatedAt: new Date()
      })));
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full bg-gray-900 rounded-md overflow-hidden flex flex-col">
      {/* Always show the legend */}
      <div className="p-4 bg-gray-800 text-white font-semibold">Evacuation Routes</div>
      
      <div className="relative flex-grow min-h-[200px]">
        {/* Loading state with placeholder */}
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/70 p-4">
            <div className="mb-6 text-white/80">Calculating evacuation routes...</div>
            <Skeleton className="w-[80%] h-6 mb-2" />
            <Skeleton className="w-[60%] h-6 mb-2" />
            <Skeleton className="w-[70%] h-6" />
            
            {/* Show the legend even during loading */}
            <div className="absolute bottom-4 right-4 z-10">
              <RouteStatusLegend />
            </div>
          </div>
        ) : (
          /* Render routes when available */
          routes.map(route => (
            <RoutePolyline key={route.id} route={route} />
          ))
        )}
        
        {/* If not loading, show the legend in normal position */}
        {!isLoading && (
          <div className="absolute top-2 right-2 z-10">
            <RouteStatusLegend />
          </div>
        )}
      </div>
    </div>
  );
};

export default EvacuationMap;
