
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Route } from '@/types/mapTypes';
import { LOCATIONS } from '@/utils/mapUtils';
import { getRandomStatus } from '@/utils/mapUtils';
import { initializeRoutes } from '@/services/routeService';
import RouteStatusLegend from './map/RouteStatusLegend';
import RoutePolyline from './map/RoutePolyline';

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="loading text-lg mb-2">Calculating precise road routes...</div>
        <RouteStatusLegend />
      </div>
    );
  }

  return (
    <>
      <RouteStatusLegend />
      {routes.map(route => (
        <RoutePolyline key={route.id} route={route} />
      ))}
    </>
  );
};

export default EvacuationMap;
