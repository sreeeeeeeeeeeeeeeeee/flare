
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Route } from '@/types/mapTypes';
import { LOCATIONS } from '@/utils/mapUtils';
import { getRandomStatus } from '@/utils/mapUtils';
import { initializeRoutes } from '@/services/routeService';
import RouteStatusLegend from './map/RouteStatusLegend';
import RoutePolyline from './map/RoutePolyline';

// Loading indicator component that works within MapContainer
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
    <div className="relative h-full w-full">
      {/* Always show the legend regardless of loading state */}
      <RouteStatusLegend />
      
      {/* Show loading overlay if still calculating routes */}
      {isLoading && <LoadingOverlay />}
      
      {/* Render routes when they're available */}
      {!isLoading && routes.map(route => (
        <RoutePolyline key={route.id} route={route} />
      ))}
    </div>
  );
};

export default EvacuationMap;
