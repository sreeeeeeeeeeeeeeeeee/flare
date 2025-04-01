
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
  
  // Calculate routes using separate paths in different directions
  const calculateRoutes = useCallback(async () => {
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setIsLoading(true);
    
    try {
      const enhancedRoutes: Route[] = [];
      
      // Get predefined routes in different directions
      const eastRoute = mistissiniStreets.find(street => street.name === "Main Street");
      const northSouthRoute = mistissiniStreets.find(street => street.name === "Saint John Street");
      const westernRoute = mistissiniStreets.find(street => street.name === "Western Route");
      const highwayRoute = mistissiniHighways.find(highway => highway.name === "Route 167 to Chibougamau");
      
      // Create route 1 (open) - East direction
      if (eastRoute) {
        enhancedRoutes.push({
          id: 'route-1',
          path: eastRoute.path as [number, number][],
          status: 'open',
          start: 'Lake Shore',
          end: 'Eastern Mistissini',
          updatedAt: new Date()
        });
      }
      
      // Create route 2 (congested) - North-South direction
      if (northSouthRoute) {
        enhancedRoutes.push({
          id: 'route-2',
          path: northSouthRoute.path as [number, number][],
          status: 'congested',
          start: 'Northern Mistissini',
          end: 'Southern Mistissini',
          updatedAt: new Date()
        });
      }
      
      // Create route 3 (closed) - Highway direction
      if (highwayRoute) {
        enhancedRoutes.push({
          id: 'route-3',
          path: highwayRoute.path.slice(0, 15) as [number, number][],
          status: 'closed',
          start: 'Mistissini',
          end: 'Chibougamau',
          updatedAt: new Date()
        });
      } else if (westernRoute) {
        // Fallback to western route if highway not found
        enhancedRoutes.push({
          id: 'route-3',
          path: westernRoute.path as [number, number][],
          status: 'closed',
          start: 'Mistissini',
          end: 'Western Shore',
          updatedAt: new Date()
        });
      }
      
      // Add fallback routes if any are missing
      if (!enhancedRoutes.some(r => r.id === 'route-1')) {
        enhancedRoutes.push({
          id: 'route-1',
          path: [
            [50.4215, -73.8760],
            [50.4220, -73.8730],
            [50.4225, -73.8700],
            [50.4230, -73.8670],
            [50.4235, -73.8640],
            [50.4240, -73.8610]
          ],
          status: 'open',
          start: 'Lake Shore',
          end: 'Eastern Mistissini',
          updatedAt: new Date()
        });
      }
      
      if (!enhancedRoutes.some(r => r.id === 'route-2')) {
        enhancedRoutes.push({
          id: 'route-2',
          path: [
            [50.4260, -73.8685],
            [50.4245, -73.8685],
            [50.4230, -73.8685],
            [50.4215, -73.8685],
            [50.4200, -73.8685],
            [50.4185, -73.8685]
          ],
          status: 'congested',
          start: 'Northern Mistissini',
          end: 'Southern Mistissini',
          updatedAt: new Date()
        });
      }
      
      if (!enhancedRoutes.some(r => r.id === 'route-3')) {
        enhancedRoutes.push({
          id: 'route-3',
          path: [
            [50.4230, -73.8640],
            [50.4300, -73.8620],
            [50.4380, -73.8560],
            [50.4470, -73.8510],
            [50.4560, -73.8460],
            [50.4650, -73.8410],
            [50.4740, -73.8360],
            [50.4830, -73.8310],
            [50.4920, -73.8260],
            [50.5010, -73.8210]
          ],
          status: 'closed',
          start: 'Mistissini',
          end: 'Chibougamau',
          updatedAt: new Date()
        });
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
