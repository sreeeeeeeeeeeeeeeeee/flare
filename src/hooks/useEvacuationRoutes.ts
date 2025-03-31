
import { useState, useRef, useEffect, useCallback } from 'react';
import { Route } from '@/types/mapTypes';
import { EvacuationRouteType } from '@/types/emergency';
import { 
  getLocationCoordinates, 
  calculateDistance 
} from '@/utils/routeCalculationUtils';
import { mistissiniStreets, mistissiniHighways } from '@/services/mistissini';

export const useEvacuationRoutes = (routes: EvacuationRouteType[]) => {
  const [computedRoutes, setComputedRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);
  const routesRef = useRef(routes);
  
  // Map route IDs to specific road paths
  const getPathForRoute = (routeId: string): [number, number][] => {
    switch (routeId) {
      case 'route-1':
        return mistissiniStreets.find(street => street.name === "Main Street")?.path as [number, number][];
      case 'route-2':
        return mistissiniStreets.find(street => street.name === "Saint John Street")?.path as [number, number][];
      case 'route-3':
        return mistissiniHighways.find(highway => highway.name === "Route 167 to Chibougamau")?.path.slice(0, 15) as [number, number][];
      default:
        // Use provided coordinates if no matching predefined path
        const currentRoute = routesRef.current.find(r => r.id === routeId);
        if (currentRoute) {
          return currentRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
        }
        return [] as [number, number][];
    }
  };
  
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
          // Use predefined roads instead of calculating new paths
          const path = getPathForRoute(route.id);
          
          const enhancedRoute: Route = {
            id: route.id,
            path: path,
            status: route.status, // Preserve the original status
            start: route.startPoint,
            end: route.endPoint,
            updatedAt: new Date()
          };
          
          enhancedRoutes.push(enhancedRoute);
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
    
    const baseRoutes: Route[] = routes.map(route => {
      // Map each route to a predefined road path
      const path = getPathForRoute(route.id);
      
      return {
        id: route.id,
        path: path,
        status: route.status,
        start: route.startPoint,
        end: route.endPoint,
        updatedAt: new Date()
      };
    });
    
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
