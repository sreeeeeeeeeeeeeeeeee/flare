
import { useState, useRef, useEffect, useCallback } from 'react';
import { Route } from '@/types/mapTypes';
import { EvacuationRouteType } from '@/types/emergency';
import { 
  getLocationCoordinates, 
  fetchSafeRoute, 
  calculateDistance 
} from '@/utils/routeCalculationUtils';

export const useEvacuationRoutes = (routes: EvacuationRouteType[]) => {
  const [computedRoutes, setComputedRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);
  const routesRef = useRef(routes);
  
  // Move this useCallback before the useEffect that depends on it
  const calculateRoutes = useCallback(async () => {
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setIsLoading(true);
    
    try {
      const currentRoutes = computedRoutes.length > 0 ? computedRoutes : routesRef.current.map(route => ({
        id: route.id,
        path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
        status: route.status,
        start: route.startPoint,
        end: route.endPoint,
        updatedAt: new Date()
      }));
      
      const enhancedRoutes: Route[] = [];
      
      for (const route of routesRef.current) {
        try {
          const startCoords = getLocationCoordinates(route.startPoint);
          const endCoords = getLocationCoordinates(route.endPoint);

          const path = await fetchSafeRoute(startCoords, endCoords);
          
          const enhancedRoute: Route = {
            id: route.id,
            path: path,
            status: route.status, // Preserve the original status
            start: route.startPoint,
            end: route.endPoint,
            updatedAt: new Date()
          };
          
          enhancedRoutes.push(enhancedRoute);
          
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error calculating route ${route.id}:`, error);
          
          const originalRoute = currentRoutes.find(r => r.id === route.id);
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
  }, [computedRoutes]);

  useEffect(() => {
    routesRef.current = routes;
    
    const baseRoutes: Route[] = routes.map(route => ({
      id: route.id,
      path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
      status: route.status,
      start: route.startPoint,
      end: route.endPoint,
      updatedAt: new Date()
    }));
    
    if (isMountedRef.current) {
      setComputedRoutes(baseRoutes);
      // Set loading to false since we have base routes ready
      setIsLoading(false);
    }
  }, [routes]);

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
