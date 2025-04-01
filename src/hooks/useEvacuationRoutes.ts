
import { useState, useRef, useEffect, useCallback } from 'react';
import { Route } from '@/types/mapTypes';
import { EvacuationRouteType } from '@/types/emergency';
import { fetchRoadRoute } from '@/utils/routeCalculationUtils';
import { mistissiniStreets, mistissiniHighways } from '@/services/mistissini';

export const useEvacuationRoutes = (routes: EvacuationRouteType[]) => {
  const [computedRoutes, setComputedRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);
  const routesRef = useRef(routes);
  
  // Calculate routes using the GraphHopper API
  const calculateRoutes = useCallback(async () => {
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setIsLoading(true);
    
    try {
      const enhancedRoutes: Route[] = [];
      
      for (const route of routesRef.current) {
        try {
          // Convert GeoJSON coordinates [lng, lat] to [lat, lng]
          const coordinates = route.geometry.coordinates.map(
            ([lng, lat]) => [lat, lng] as [number, number]
          );
          
          // Get the first and last points for route calculation
          const start = coordinates[0];
          const end = coordinates[coordinates.length - 1];
          
          // Use the API to get a road-following path
          const roadPath = await fetchRoadRoute(start, end);
          
          const enhancedRoute: Route = {
            id: route.id,
            path: roadPath,
            status: route.status,
            start: route.startPoint,
            end: route.endPoint,
            updatedAt: new Date()
          };
          
          enhancedRoutes.push(enhancedRoute);
        } catch (error) {
          console.error(`Error calculating route ${route.id}:`, error);
          
          // Fallback to predefined routes if API fails
          if (route.id === 'route-1') {
            // Ensure the open route is always visible with a proper path
            const mainStreet = mistissiniStreets.find(street => street.name === "Main Street");
            if (mainStreet && mainStreet.path) {
              console.log("Using fallback path for open route:", mainStreet.path);
              // Explicitly cast the path to [number, number][] to fix type error
              const typedPath = mainStreet.path as [number, number][];
              enhancedRoutes.push({
                id: route.id,
                path: typedPath,
                status: 'open', // Ensure it's always open
                start: route.startPoint,
                end: route.endPoint,
                updatedAt: new Date()
              });
            }
          } else if (route.id === 'route-2') {
            const saintJohnStreet = mistissiniStreets.find(street => street.name === "Saint John Street");
            if (saintJohnStreet && saintJohnStreet.path) {
              // Explicitly cast the path to [number, number][] to fix type error
              const typedPath = saintJohnStreet.path as [number, number][];
              enhancedRoutes.push({
                id: route.id,
                path: typedPath,
                status: route.status,
                start: route.startPoint,
                end: route.endPoint,
                updatedAt: new Date()
              });
            }
          } else if (route.id === 'route-3') {
            const highway = mistissiniHighways.find(highway => highway.name === "Route 167 to Chibougamau");
            if (highway && highway.path) {
              // Explicitly cast the path to [number, number][] to fix type error
              const typedPath = highway.path.slice(0, 15) as [number, number][];
              enhancedRoutes.push({
                id: route.id,
                path: typedPath,
                status: route.status,
                start: route.startPoint,
                end: route.endPoint,
                updatedAt: new Date()
              });
            }
          }
        }
      }
      
      // Ensure the open route (route-1) is always in the enhanced routes
      if (!enhancedRoutes.some(r => r.id === 'route-1')) {
        const mainStreet = mistissiniStreets.find(street => street.name === "Main Street");
        if (mainStreet && mainStreet.path) {
          console.log("Forcing addition of open route");
          // Explicitly cast the path to [number, number][] to fix type error
          const typedPath = mainStreet.path as [number, number][];
          enhancedRoutes.push({
            id: 'route-1',
            path: typedPath,
            status: 'open',
            start: 'Lake Shore',
            end: 'Eastern Mistissini',
            updatedAt: new Date()
          });
        }
      }
      
      if (isMountedRef.current) {
        setComputedRoutes(enhancedRoutes);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error calculating routes:', error);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  useEffect(() => {
    routesRef.current = routes;
    
    // Initial calculation of routes
    calculateRoutes();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [routes, calculateRoutes]);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    computedRoutes,
    isLoading,
    calculateRoutes
  };
};
