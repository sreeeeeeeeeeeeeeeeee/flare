import { useState, useRef, useCallback, useEffect } from 'react';
import { Route } from '@/types/mapTypes';
import { EvacuationRouteType } from '@/types/emergency';
import { 
  getLocationCoordinates, 
  fetchSafeRoute, 
  calculateDistance 
} from '@/utils/routeCalculationUtils';

export const useEvacuationRoutes = (routes: EvacuationRouteType[]) => {
  const [computedRoutes, setComputedRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);
  const routesRef = useRef(routes);
  
  useEffect(() => {
    routesRef.current = routes;
  }, [routes]);

  const calculateRoutes = useCallback(async () => {
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    try {
      // First set basic routes based on provided data
      const baseRoutes = routesRef.current.map(route => ({
        id: route.id,
        path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
        status: route.status,
        start: route.startPoint,
        end: route.endPoint,
        estimatedTime: route.estimatedTime,
        transportMethods: route.transportMethods,
        routeName: route.routeName
      }));
      
      if (isMountedRef.current) {
        setComputedRoutes(baseRoutes);
      }
      
      // Then enhance with more accurate road-based routes
      const enhancedRoutes: Route[] = [];
      
      for (const route of routesRef.current) {
        try {
          // Get start and end coordinates
          const startCoords = getLocationCoordinates(route.startPoint);
          const endCoords = getLocationCoordinates(route.endPoint);

          // Get safe route avoiding water
          const path = await fetchSafeRoute(startCoords, endCoords);
          const distance = calculateDistance(path);

          const enhancedRoute = {
            id: route.id,
            path: path,
            status: route.status,
            start: route.startPoint,
            end: route.endPoint,
            estimatedTime: route.estimatedTime,
            transportMethods: route.transportMethods,
            routeName: route.routeName || `Route ${route.id}`,
            distance,
            lastUpdated: new Date()
          };
          
          enhancedRoutes.push(enhancedRoute);
          
          // Add a slight delay to prevent hitting API rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error calculating route ${route.id}:`, error);
          
          // Keep the original route if enhancement fails
          const originalRoute = baseRoutes.find(r => r.id === route.id);
          if (originalRoute) {
            enhancedRoutes.push(originalRoute);
          }
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
